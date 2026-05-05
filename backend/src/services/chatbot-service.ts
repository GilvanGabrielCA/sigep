import { pool } from '../db/connection.js'
import { listProdutos } from '../db/produto-queries.js'
import { io } from '../server.js'
import type { ProdutoRow } from '../db/produto-queries.js'

// ─── State Machine ────────────────────────────────────────────────────────────

interface ItemBot {
  produtoId: string
  nome: string
  quantidade: number
  preco: number
}

interface ConversaState {
  estado: 'COLETANDO_ITENS' | 'AGUARDANDO_ENDERECO'
  restauranteId: string
  telefone: string
  itens: ItemBot[]
  produtos: ProdutoRow[]
}

const conversas = new Map<string, ConversaState>()

function conversaKey(restauranteId: string, telefone: string): string {
  return `${restauranteId}:${telefone}`
}

function buildMenu(produtos: ProdutoRow[]): string {
  const disponiveis = produtos.filter((p) => p.disponivel)
  if (disponiveis.length === 0) return '📭 Nenhum produto disponível no momento.'
  const linhas = disponiveis.map((p, i) => {
    const preco = parseFloat(p.preco).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
    return `${i + 1}. ${p.nome} — ${preco}`
  })
  return `🍽️ *Cardápio:*\n${linhas.join('\n')}\n\nDigite o número do item para adicionar. Digite *confirmar* para finalizar ou *cancelar* para desistir.`
}

function buildCarrinho(itens: ItemBot[]): string {
  if (itens.length === 0) return '🛒 Carrinho vazio.'
  const linhas = itens.map((it) => {
    const sub = (it.quantidade * it.preco).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
    return `• ${it.quantidade}× ${it.nome} = ${sub}`
  })
  const total = itens.reduce((s, it) => s + it.quantidade * it.preco, 0)
  return `🛒 *Seu pedido:*\n${linhas.join('\n')}\nTotal: ${total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`
}

// ─── Create order in DB ───────────────────────────────────────────────────────

async function criarPedidoDB(
  restauranteId: string,
  telefone: string,
  endereco: string,
  itens: ItemBot[],
): Promise<{ id: string }> {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')

    // upsert cliente
    const { rows: clienteRows } = await client.query<{ id: string }>(
      `INSERT INTO tb_cliente (restaurante_id, nome, telefone, endereco, canal)
       VALUES ($1, $2, $3, $4, 'whatsapp')
       ON CONFLICT DO NOTHING
       RETURNING id`,
      [restauranteId, `WhatsApp ${telefone}`, telefone, endereco],
    )

    let clienteId: string
    if (clienteRows[0]) {
      clienteId = clienteRows[0].id
    } else {
      const { rows } = await client.query<{ id: string }>(
        `SELECT id FROM tb_cliente WHERE restaurante_id = $1 AND telefone = $2 LIMIT 1`,
        [restauranteId, telefone],
      )
      clienteId = rows[0]?.id ?? ''
      if (!clienteId) {
        const { rows: ins } = await client.query<{ id: string }>(
          `INSERT INTO tb_cliente (restaurante_id, nome, telefone, endereco, canal)
           VALUES ($1, $2, $3, $4, 'whatsapp') RETURNING id`,
          [restauranteId, `WhatsApp ${telefone}`, telefone, endereco],
        )
        clienteId = ins[0]!.id
      }
    }

    const total = itens.reduce((s, it) => s + it.quantidade * it.preco, 0)

    const { rows: pedidoRows } = await client.query<{ id: string }>(
      `INSERT INTO tb_pedido (restaurante_id, cliente_id, status, canal, total)
       VALUES ($1, $2, 'Recebido', 'whatsapp', $3) RETURNING id`,
      [restauranteId, clienteId, total],
    )
    const pedidoId = pedidoRows[0]!.id

    for (const item of itens) {
      await client.query(
        `INSERT INTO tb_item_pedido (pedido_id, produto_id, quantidade, preco_unitario)
         VALUES ($1, $2, $3, $4)`,
        [pedidoId, item.produtoId, item.quantidade, item.preco],
      )
    }

    await client.query(
      `INSERT INTO tb_status_historico (pedido_id, status_novo) VALUES ($1, 'Recebido')`,
      [pedidoId],
    )

    await client.query('COMMIT')
    return { id: pedidoId }
  } catch (err) {
    await client.query('ROLLBACK')
    throw err
  } finally {
    client.release()
  }
}

// ─── Main handler ─────────────────────────────────────────────────────────────

export async function processarMensagem(
  restauranteId: string,
  telefone: string,
  mensagem: string,
): Promise<string> {
  const key = conversaKey(restauranteId, telefone)
  const msg = mensagem.trim().toLowerCase()
  let state = conversas.get(key)

  // ── New conversation ──────────────────────────────────────────────────────
  if (!state) {
    const produtos = await listProdutos(restauranteId)
    state = { estado: 'COLETANDO_ITENS', restauranteId, telefone, itens: [], produtos }
    conversas.set(key, state)
    return `Olá! 👋 Seja bem-vindo!\n\n${buildMenu(produtos)}`
  }

  // ── COLETANDO_ITENS ───────────────────────────────────────────────────────
  if (state.estado === 'COLETANDO_ITENS') {
    if (msg === 'cancelar') {
      conversas.delete(key)
      return 'Pedido cancelado. Até a próxima! 👋'
    }

    if (msg === 'confirmar') {
      if (state.itens.length === 0) {
        return 'Nenhum item no pedido ainda. Adicione itens ou digite *cancelar*.'
      }
      state.estado = 'AGUARDANDO_ENDERECO'
      return `${buildCarrinho(state.itens)}\n\n📍 Qual é o seu endereço de entrega?`
    }

    if (msg === 'cardápio' || msg === 'cardapio' || msg === 'menu') {
      return buildMenu(state.produtos)
    }

    const num = parseInt(msg, 10)
    const disponiveis = state.produtos.filter((p) => p.disponivel)
    if (!isNaN(num) && num >= 1 && num <= disponiveis.length) {
      const prod = disponiveis[num - 1]!
      const existing = state.itens.find((i) => i.produtoId === prod.id)
      if (existing) {
        existing.quantidade += 1
      } else {
        state.itens.push({
          produtoId: prod.id,
          nome: prod.nome,
          quantidade: 1,
          preco: parseFloat(prod.preco),
        })
      }
      return `✅ *${prod.nome}* adicionado!\n\n${buildCarrinho(state.itens)}`
    }

    return `Não entendi. Digite um número do cardápio para adicionar um item, *confirmar* para finalizar ou *cancelar*.\n\n${buildMenu(state.produtos)}`
  }

  // ── AGUARDANDO_ENDERECO ───────────────────────────────────────────────────
  if (state.estado === 'AGUARDANDO_ENDERECO') {
    const endereco = mensagem.trim()
    const pedido = await criarPedidoDB(restauranteId, telefone, endereco, state.itens)
    conversas.delete(key)

    const shortId = pedido.id.slice(-8).toUpperCase()

    // Emit to kanban in real time
    const { rows } = await pool.query(
      `SELECT
         p.id, p.status, p.canal, p.total, p.observacoes,
         p.criado_em::text,
         c.nome AS cliente_nome, c.telefone AS cliente_telefone
       FROM tb_pedido p
       LEFT JOIN tb_cliente c ON c.id = p.cliente_id
       WHERE p.id = $1`,
      [pedido.id],
    )
    if (rows[0]) {
      io.to(restauranteId).emit('pedido:novo', rows[0])
    }

    return `✅ Pedido *#${shortId}* confirmado!\n📦 Seu pedido foi recebido e logo estará em preparo.\nObrigado! 🙏`
  }

  return 'Olá! Digite *cardápio* para ver nossas opções.'
}
