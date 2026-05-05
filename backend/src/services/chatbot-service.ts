import { pool } from '../db/connection.js'
import { listProdutos } from '../db/produto-queries.js'
import { findRestaurante } from '../db/restaurante-queries.js'
import { io } from '../server.js'
import type { ProdutoRow } from '../db/produto-queries.js'

// ─── Outbox (notificações de retorno ao cliente) ──────────────────────────────

const outbox = new Map<string, string[]>()

function outboxKey(restauranteId: string, telefone: string) {
  return `${restauranteId}:${telefone}`
}

export function enviarNotificacaoCliente(restauranteId: string, telefone: string, mensagem: string): void {
  const key = outboxKey(restauranteId, telefone)
  if (!outbox.has(key)) outbox.set(key, [])
  outbox.get(key)!.push(mensagem)
}

export function consumirOutbox(restauranteId: string, telefone: string): string[] {
  const key = outboxKey(restauranteId, telefone)
  const msgs = outbox.get(key) ?? []
  outbox.delete(key)
  return msgs
}

// ─── State Machine ────────────────────────────────────────────────────────────

interface ItemBot {
  produtoId: string
  nome: string
  quantidade: number
  preco: number
}

interface ConversaState {
  estado: 'COLETANDO_ITENS' | 'ESCOLHENDO_TIPO' | 'AGUARDANDO_ENDERECO'
  restauranteId: string
  restauranteNome: string
  telefone: string
  itens: ItemBot[]
  produtos: ProdutoRow[]
  tipoEntrega: 'entrega' | 'retirada' | null
}

const conversas = new Map<string, ConversaState>()

function conversaKey(restauranteId: string, telefone: string): string {
  return `${restauranteId}:${telefone}`
}

function saudacao(): string {
  const hora = new Date(Date.now() - 3 * 60 * 60 * 1000).getUTCHours()
  if (hora >= 5 && hora < 12) return 'Bom dia'
  if (hora >= 12 && hora < 18) return 'Boa tarde'
  return 'Boa noite'
}

function buildMenu(produtos: ProdutoRow[], nomeRestaurante: string): string {
  const disponiveis = produtos.filter((p) => p.disponivel)
  if (disponiveis.length === 0) return '📭 Nenhum produto disponível no momento.'

  const grupos = new Map<string, ProdutoRow[]>()
  for (const p of disponiveis) {
    const cat = p.categoria_nome ?? 'Outros'
    if (!grupos.has(cat)) grupos.set(cat, [])
    grupos.get(cat)!.push(p)
  }

  const linhas: string[] = [`🍽️ *Cardápio — ${nomeRestaurante}*\n`]
  let contador = 1
  for (const [categoria, itens] of grupos) {
    linhas.push(`📌 *${categoria}*`)
    for (const p of itens) {
      const preco = parseFloat(p.preco).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
      const desc = p.descricao ? `\n   _${p.descricao}_` : ''
      linhas.push(`${contador}. ${p.nome} — ${preco}${desc}`)
      contador++
    }
    linhas.push('')
  }

  linhas.push('Digite o *número* do item para adicionar ao pedido.')
  linhas.push('*confirmar* para finalizar  |  *cancelar* para desistir.')
  return linhas.join('\n').trim()
}

function buildCarrinho(itens: ItemBot[]): string {
  if (itens.length === 0) return '🛒 Carrinho vazio.'
  const linhas = itens.map((it) => {
    const sub = (it.quantidade * it.preco).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
    return `• ${it.quantidade}× ${it.nome} = ${sub}`
  })
  const total = itens.reduce((s, it) => s + it.quantidade * it.preco, 0)
  return `🛒 *Seu pedido:*\n${linhas.join('\n')}\n\n💰 Total: *${total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}*`
}

// ─── Create order in DB ───────────────────────────────────────────────────────

async function criarPedidoDB(
  restauranteId: string,
  telefone: string,
  endereco: string,
  itens: ItemBot[],
  observacoes: string,
): Promise<{ id: string }> {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')

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
      `INSERT INTO tb_pedido (restaurante_id, cliente_id, status, canal, total, observacoes)
       VALUES ($1, $2, 'Recebido', 'whatsapp', $3, $4) RETURNING id`,
      [restauranteId, clienteId, total, observacoes],
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

  // ── Nova conversa ─────────────────────────────────────────────────────────
  if (!state) {
    const [produtos, restaurante] = await Promise.all([
      listProdutos(restauranteId),
      findRestaurante(restauranteId),
    ])
    const nomeRestaurante = restaurante?.nome ?? 'nosso restaurante'
    state = {
      estado: 'COLETANDO_ITENS',
      restauranteId,
      restauranteNome: nomeRestaurante,
      telefone,
      itens: [],
      produtos,
      tipoEntrega: null,
    }
    conversas.set(key, state)
    const menu = buildMenu(produtos, nomeRestaurante)
    return `${saudacao()}! 👋 Seja bem-vindo ao *${nomeRestaurante}*! 🍽️\n\nEstamos felizes em atendê-lo. Confira nosso cardápio abaixo:\n\n${menu}`
  }

  // ── COLETANDO_ITENS ───────────────────────────────────────────────────────
  if (state.estado === 'COLETANDO_ITENS') {
    if (msg === 'cancelar') {
      conversas.delete(key)
      return `Tudo bem! Pedido cancelado. 😊\nAté a próxima no *${state.restauranteNome}*! 👋`
    }

    if (msg === 'confirmar') {
      if (state.itens.length === 0) {
        return 'Seu carrinho está vazio. 🛒\nAdicione pelo menos um item antes de confirmar, ou digite *cancelar*.'
      }
      state.estado = 'ESCOLHENDO_TIPO'
      return `${buildCarrinho(state.itens)}\n\n🚀 Ótima escolha! Como você prefere receber seu pedido?\n\n1️⃣  *Entrega* — receber no seu endereço\n2️⃣  *Retirada* — buscar no restaurante\n\nDigite *1* ou *entrega* / *2* ou *retirada*:`
    }

    if (msg === 'cardápio' || msg === 'cardapio' || msg === 'menu') {
      return buildMenu(state.produtos, state.restauranteNome)
    }

    if (msg === 'carrinho' || msg === 'pedido') {
      return buildCarrinho(state.itens)
    }

    const num = parseInt(msg, 10)
    const disponiveis = state.produtos.filter((p) => p.disponivel)
    if (!isNaN(num) && num >= 1 && num <= disponiveis.length) {
      const prod = disponiveis[num - 1]!
      const existing = state.itens.find((i) => i.produtoId === prod.id)
      if (existing) {
        existing.quantidade += 1
      } else {
        state.itens.push({ produtoId: prod.id, nome: prod.nome, quantidade: 1, preco: parseFloat(prod.preco) })
      }
      return `✅ *${prod.nome}* adicionado!\n\n${buildCarrinho(state.itens)}\n\nDigite outro número para adicionar, *confirmar* para finalizar ou *cancelar*.`
    }

    return `Não reconheci esse comando. 😅\n\nDigite o *número* de um item, ou:\n• *carrinho* — ver seu pedido\n• *confirmar* — finalizar\n• *cancelar* — desistir\n\n${buildMenu(state.produtos, state.restauranteNome)}`
  }

  // ── ESCOLHENDO_TIPO ───────────────────────────────────────────────────────
  if (state.estado === 'ESCOLHENDO_TIPO') {
    if (msg === 'cancelar') {
      conversas.delete(key)
      return `Pedido cancelado. 😔 Até a próxima! 👋`
    }

    const isEntrega = msg === '1' || msg === 'entrega' || msg === 'delivery'
    const isRetirada = msg === '2' || msg === 'retirada' || msg === 'retirar' || msg === 'buscar'

    if (isEntrega) {
      state.tipoEntrega = 'entrega'
      state.estado = 'AGUARDANDO_ENDERECO'
      return `🛵 *Entrega selecionada!*\n\n📍 Informe seu endereço completo para entrega (rua, número e bairro):`
    }

    if (isRetirada) {
      state.tipoEntrega = 'retirada'
      const pedido = await criarPedidoDB(
        restauranteId, telefone,
        'Retirada no restaurante',
        state.itens,
        'retirada',
      )
      conversas.delete(key)
      const shortId = pedido.id.slice(-8).toUpperCase()

      const { rows } = await pool.query(
        `SELECT p.id, p.status, p.canal, p.total, p.observacoes, p.criado_em::text,
                c.nome AS cliente_nome, c.telefone AS cliente_telefone
         FROM tb_pedido p LEFT JOIN tb_cliente c ON c.id = p.cliente_id
         WHERE p.id = $1`,
        [pedido.id],
      )
      if (rows[0]) {
        io.to(restauranteId).emit('pedido:novo', rows[0])
        io.to(restauranteId).emit('dashboard:atualizado')
      }

      return `✅ *Pedido #${shortId} confirmado para retirada!*\n\n🏪 Seu pedido está sendo preparado. Você será avisado quando estiver pronto para buscar.\n\nObrigado por escolher o *${state.restauranteNome}*! 🙏`
    }

    return `Por favor, escolha uma opção:\n\n1️⃣  *entrega* — receber no seu endereço\n2️⃣  *retirada* — buscar no restaurante`
  }

  // ── AGUARDANDO_ENDERECO ───────────────────────────────────────────────────
  if (state.estado === 'AGUARDANDO_ENDERECO') {
    if (msg === 'cancelar') {
      conversas.delete(key)
      return `Pedido cancelado. 😔 Até a próxima! 👋`
    }

    const endereco = mensagem.trim()
    if (endereco.length < 5) {
      return '📍 Por favor, informe um endereço mais completo (rua, número e bairro).'
    }

    const pedido = await criarPedidoDB(restauranteId, telefone, endereco, state.itens, 'entrega')
    conversas.delete(key)
    const shortId = pedido.id.slice(-8).toUpperCase()

    const { rows } = await pool.query(
      `SELECT p.id, p.status, p.canal, p.total, p.observacoes, p.criado_em::text,
              c.nome AS cliente_nome, c.telefone AS cliente_telefone
       FROM tb_pedido p LEFT JOIN tb_cliente c ON c.id = p.cliente_id
       WHERE p.id = $1`,
      [pedido.id],
    )
    if (rows[0]) {
      io.to(restauranteId).emit('pedido:novo', rows[0])
      io.to(restauranteId).emit('dashboard:atualizado')
    }

    return `✅ *Pedido #${shortId} confirmado!*\n\n📦 Seu pedido foi recebido e em breve estará em preparo.\n🏠 Entrega para: _${endereco}_\n\nObrigado por escolher o *${state.restauranteNome}*! 🙏`
  }

  return `${saudacao()}! 👋 Digite *cardápio* para ver nossas opções.`
}
