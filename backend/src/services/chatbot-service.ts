import { pool } from '../db/connection.js'
import { listProdutos } from '../db/produto-queries.js'
import { findRestaurante } from '../db/restaurante-queries.js'
import { getIo } from '../socket/socket-instance.js'
import { verificarConsentimento, registrarConsentimento } from './lgpd-service.js'
import type { ProdutoRow } from '../db/produto-queries.js'

// ─── Outbox de notificações ───────────────────────────────────────────────────

const outbox = new Map<string, string[]>()

function outboxKey(restauranteId: string, telefone: string) {
  return `${restauranteId}:${telefone}`
}

export function enviarNotificacaoCliente(
  restauranteId: string,
  telefone: string,
  mensagem: string,
): void {
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

// ─── Types ────────────────────────────────────────────────────────────────────

interface ItemBot {
  produtoId: string
  nome: string
  quantidade: number
  preco: number
}

type Estado =
  | 'AGUARDANDO_CONSENTIMENTO'
  | 'ESCOLHENDO_CATEGORIA'
  | 'COLETANDO_ITENS'
  | 'ESCOLHENDO_TIPO'
  | 'AGUARDANDO_ENDERECO'
  | 'ESCOLHENDO_PAGAMENTO'

interface ConversaState {
  estado: Estado
  restauranteId: string
  restauranteNome: string
  restauranteTelefone: string | null
  telefone: string
  itens: ItemBot[]
  produtos: ProdutoRow[]
  categorias: string[]
  itensCategoriaAtual: ProdutoRow[]
  tipoEntrega: 'entrega' | 'retirada' | null
  enderecoEntrega: string | null
}

const conversas = new Map<string, ConversaState>()

function conversaKey(r: string, t: string) {
  return `${r}:${t}`
}

// ─── Helpers de mensagem ──────────────────────────────────────────────────────

function saudacao(): string {
  const hora = new Date(Date.now() - 3 * 60 * 60 * 1000).getUTCHours()
  if (hora >= 5 && hora < 12) return 'Bom dia'
  if (hora >= 12 && hora < 18) return 'Boa tarde'
  return 'Boa noite'
}

function msgConsentimento(nomeRestaurante: string): string {
  return (
    `${saudacao()}! 👋 Bem-vindo ao *${nomeRestaurante}*! 🍔\n\n` +
    `Antes de começar seu pedido, precisamos da sua autorização para tratar seus dados pessoais (nome, telefone e endereço) conforme a *Lei Geral de Proteção de Dados (LGPD — Lei 13.709/2018)*.\n\n` +
    `📋 *Seus dados serão usados exclusivamente para:*\n` +
    `• Processar e entregar seu pedido\n` +
    `• Histórico de pedidos\n\n` +
    `🔒 Seus dados são protegidos e não serão compartilhados com terceiros.\n\n` +
    `Para ver nossa política completa, acesse o painel do restaurante > LGPD.\n\n` +
    `Digite *CONCORDO* para prosseguir ou *NÃO* para cancelar.`
  )
}

function msgCategorias(
  categorias: string[],
  restauranteNome: string,
  comCarrinho: boolean,
): string {
  const emojis = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣']
  const lista = categorias.map((c, i) => `${emojis[i] ?? `${i + 1}.`} ${c}`).join('\n')
  const dicas = comCarrinho
    ? '\n\nDigite o *número* da categoria, *carrinho* ver pedido ou *confirmar* finalizar.'
    : '\n\nDigite o *número* da categoria para ver os itens.\n*atendente* — falar com atendente | *status* — consultar pedido'
  return `🍔 *${restauranteNome}*\n\nEscolha uma categoria:\n\n${lista}${dicas}`
}

function msgItensCategoria(itens: ProdutoRow[], nomeCategoria: string): string {
  const linhas = itens.map((p, i) => {
    const preco = parseFloat(p.preco).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    })
    return `${i + 1}. *${p.nome}* — ${preco}`
  })
  return (
    `📌 *${nomeCategoria}*\n\n${linhas.join('\n')}\n\n` +
    `Digite o *número* para adicionar ao carrinho.\n` +
    `*categorias* — ver outras categorias | *cancelar* — desistir`
  )
}

function msgCarrinho(itens: ItemBot[]): string {
  if (itens.length === 0) return '🛒 Seu carrinho está vazio.'
  const linhas = itens.map((it) => {
    const sub = (it.quantidade * it.preco).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    })
    return `• ${it.quantidade}× ${it.nome} — ${sub}`
  })
  const total = itens.reduce((s, it) => s + it.quantidade * it.preco, 0)
  return (
    `🛒 *Seu carrinho:*\n\n${linhas.join('\n')}\n\n` +
    `💰 Total: *${total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}*`
  )
}

function msgAposAdicionar(itens: ItemBot[], nomeProduto: string): string {
  return (
    `✅ *${nomeProduto}* adicionado!\n\n${msgCarrinho(itens)}\n\n` +
    `*categorias* — ver outras categorias\n` +
    `*carrinho* — ver pedido completo\n` +
    `*confirmar* — finalizar pedido\n` +
    `*cancelar* — desistir`
  )
}

function msgPagamento(): string {
  return (
    `💳 *Forma de pagamento:*\n\n` +
    `1️⃣ PIX\n` +
    `2️⃣ Dinheiro\n` +
    `3️⃣ Cartão de Crédito\n` +
    `4️⃣ Cartão de Débito`
  )
}

// ─── Criação do pedido no banco ───────────────────────────────────────────────

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
       ON CONFLICT DO NOTHING RETURNING id`,
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

async function emitirPedido(restauranteId: string, pedidoId: string): Promise<void> {
  const { rows } = await pool.query(
    `SELECT p.id, p.status, p.canal, p.total, p.observacoes, p.criado_em::text,
            c.nome AS cliente_nome, c.telefone AS cliente_telefone
     FROM tb_pedido p LEFT JOIN tb_cliente c ON c.id = p.cliente_id
     WHERE p.id = $1`,
    [pedidoId],
  )
  if (rows[0]) {
    getIo().to(restauranteId).emit('pedido:novo', rows[0])
    getIo().to(restauranteId).emit('dashboard:atualizado')
  }
}

// ─── Handler principal ────────────────────────────────────────────────────────

export async function processarMensagem(
  restauranteId: string,
  telefone: string,
  mensagem: string,
): Promise<string> {
  const key = conversaKey(restauranteId, telefone)
  const msg = mensagem.trim().toLowerCase()
  let state = conversas.get(key)

  // ── Primeira mensagem ─────────────────────────────────────────────────────
  if (!state) {
    const [produtos, restaurante] = await Promise.all([
      listProdutos(restauranteId),
      findRestaurante(restauranteId),
    ])
    const nomeRestaurante = restaurante?.nome ?? 'nosso restaurante'
    const disponiveis = produtos.filter((p) => p.disponivel)
    const categorias = [
      ...new Set(disponiveis.map((p) => p.categoria_nome ?? 'Outros')),
    ]

    // Verificar consentimento LGPD existente
    const temConsentimento = await verificarConsentimento(restauranteId, telefone)

    state = {
      estado: temConsentimento ? 'ESCOLHENDO_CATEGORIA' : 'AGUARDANDO_CONSENTIMENTO',
      restauranteId,
      restauranteNome: nomeRestaurante,
      restauranteTelefone: restaurante?.telefone ?? null,
      telefone,
      itens: [],
      produtos: disponiveis,
      categorias,
      itensCategoriaAtual: [],
      tipoEntrega: null,
      enderecoEntrega: null,
    }
    conversas.set(key, state)

    if (temConsentimento) {
      return (
        `${saudacao()}! 👋 Bem-vindo de volta ao *${nomeRestaurante}*! 🍔\n\n` +
        msgCategorias(categorias, nomeRestaurante, false)
      )
    }
    return msgConsentimento(nomeRestaurante)
  }

  // ── Comandos globais ──────────────────────────────────────────────────────
  if (msg === 'cancelar') {
    conversas.delete(key)
    return `Tudo bem! 😊 Espero te ver em breve no *${state.restauranteNome}*! 👋`
  }

  if (msg === 'atendente') {
    const contato = state.restauranteTelefone
      ? `📞 Entre em contato pelo número *${state.restauranteTelefone}*.`
      : `📞 Entre em contato diretamente com o restaurante.`
    return (
      `👨‍💼 *Atendente humano*\n\n${contato}\n\n` +
      `Quando quiser continuar seu pedido, é só me chamar aqui!`
    )
  }

  if (msg === 'status') {
    const { rows } = await pool.query<{ id: string; status: string }>(
      `SELECT p.id, p.status
       FROM tb_pedido p
       JOIN tb_cliente c ON c.id = p.cliente_id
       WHERE p.restaurante_id = $1 AND c.telefone = $2
       ORDER BY p.criado_em DESC LIMIT 1`,
      [restauranteId, telefone],
    )
    if (!rows[0]) {
      return `🔍 Nenhum pedido encontrado para este número. Faça seu primeiro pedido agora! 😊`
    }
    const shortId = rows[0].id.slice(-8).toUpperCase()
    const statusEmoji: Record<string, string> = {
      'Recebido': '📥',
      'Em Preparacao': '🍳',
      'Pronto para Entrega': '✅',
      'Entregue': '🎉',
      'Cancelado': '❌',
    }
    return `${statusEmoji[rows[0].status] ?? '📋'} *Pedido #${shortId}*\nStatus: *${rows[0].status}*`
  }

  // ── AGUARDANDO_CONSENTIMENTO ──────────────────────────────────────────────
  if (state.estado === 'AGUARDANDO_CONSENTIMENTO') {
    const aceitou =
      msg === 'concordo' ||
      msg === 'sim' ||
      msg === 'aceito' ||
      msg === 'ok' ||
      msg === 'aceitar' ||
      msg === 'concordar'

    const recusou =
      msg === 'nao' ||
      msg === 'não' ||
      msg === 'recuso' ||
      msg === 'recusar' ||
      msg === 'não concordo' ||
      msg === 'nao concordo'

    if (aceitou) {
      await registrarConsentimento(restauranteId, telefone, true)
      state.estado = 'ESCOLHENDO_CATEGORIA'
      return (
        `✅ *Consentimento registrado!* Seus dados estão protegidos conforme a LGPD.\n\n` +
        msgCategorias(state.categorias, state.restauranteNome, false)
      )
    }

    if (recusou) {
      conversas.delete(key)
      return (
        `Entendemos. 😊 Sem o consentimento não é possível processar seu pedido.\n\n` +
        `Se mudar de ideia ou quiser mais informações, é só entrar em contato!`
      )
    }

    return (
      `Para prosseguir com o pedido precisamos da sua autorização.\n\n` +
      `Digite *CONCORDO* para aceitar ou *NÃO* para cancelar.\n\n` +
      msgConsentimento(state.restauranteNome)
    )
  }

  // ── ESCOLHENDO_CATEGORIA ──────────────────────────────────────────────────
  if (state.estado === 'ESCOLHENDO_CATEGORIA') {
    if ((msg === 'carrinho' || msg === 'pedido') && state.itens.length > 0) {
      return `${msgCarrinho(state.itens)}\n\n${msgCategorias(state.categorias, state.restauranteNome, true)}`
    }

    if (msg === 'confirmar' && state.itens.length > 0) {
      state.estado = 'ESCOLHENDO_TIPO'
      return (
        `${msgCarrinho(state.itens)}\n\n` +
        `🚀 Ótima escolha! Como prefere receber seu pedido?\n\n` +
        `1️⃣ *Entrega* — receber no seu endereço\n` +
        `2️⃣ *Retirada* — buscar no restaurante`
      )
    }

    const num = parseInt(msg, 10)
    if (!isNaN(num) && num >= 1 && num <= state.categorias.length) {
      const nomeCat = state.categorias[num - 1]!
      const itensCat = state.produtos.filter(
        (p) => (p.categoria_nome ?? 'Outros') === nomeCat,
      )
      state.itensCategoriaAtual = itensCat
      state.estado = 'COLETANDO_ITENS'
      return msgItensCategoria(itensCat, nomeCat)
    }

    return (
      `Não entendi. 😅 Escolha uma categoria pelo número:\n\n` +
      msgCategorias(state.categorias, state.restauranteNome, state.itens.length > 0)
    )
  }

  // ── COLETANDO_ITENS ───────────────────────────────────────────────────────
  if (state.estado === 'COLETANDO_ITENS') {
    if (
      msg === 'categorias' ||
      msg === 'categoria' ||
      msg === 'voltar' ||
      msg === 'menu'
    ) {
      state.estado = 'ESCOLHENDO_CATEGORIA'
      return msgCategorias(state.categorias, state.restauranteNome, state.itens.length > 0)
    }

    if (msg === 'carrinho' || msg === 'pedido') {
      if (state.itens.length === 0)
        return '🛒 Seu carrinho está vazio. Adicione itens primeiro.'
      return (
        `${msgCarrinho(state.itens)}\n\n` +
        `*categorias* — continuar | *confirmar* — finalizar | *cancelar* — desistir`
      )
    }

    if (msg === 'confirmar') {
      if (state.itens.length === 0) {
        return 'Seu carrinho está vazio. 🛒 Adicione pelo menos um item antes de confirmar.'
      }
      state.estado = 'ESCOLHENDO_TIPO'
      return (
        `${msgCarrinho(state.itens)}\n\n` +
        `🚀 Ótima escolha! Como prefere receber seu pedido?\n\n` +
        `1️⃣ *Entrega* — receber no seu endereço\n` +
        `2️⃣ *Retirada* — buscar no restaurante`
      )
    }

    const num = parseInt(msg, 10)
    const itensAtuais = state.itensCategoriaAtual
    if (!isNaN(num) && num >= 1 && num <= itensAtuais.length) {
      const prod = itensAtuais[num - 1]!
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
      return msgAposAdicionar(state.itens, prod.nome)
    }

    const nomeCat = state.itensCategoriaAtual[0]?.categoria_nome ?? 'Itens'
    return (
      `Não entendi. 😅\n\nDigite o *número* de um item:\n\n` +
      msgItensCategoria(state.itensCategoriaAtual, nomeCat)
    )
  }

  // ── ESCOLHENDO_TIPO ───────────────────────────────────────────────────────
  if (state.estado === 'ESCOLHENDO_TIPO') {
    const isEntrega = msg === '1' || msg === 'entrega' || msg === 'delivery'
    const isRetirada =
      msg === '2' || msg === 'retirada' || msg === 'retirar' || msg === 'buscar'

    if (isEntrega) {
      state.tipoEntrega = 'entrega'
      state.estado = 'AGUARDANDO_ENDERECO'
      return `🛵 *Entrega selecionada!*\n\n📍 Por favor, informe seu endereço completo:\n_(rua, número e bairro)_`
    }

    if (isRetirada) {
      state.tipoEntrega = 'retirada'
      state.enderecoEntrega = 'Retirada no restaurante'
      state.estado = 'ESCOLHENDO_PAGAMENTO'
      return `🏪 *Retirada selecionada!*\n\n${msgPagamento()}`
    }

    return `Por favor, escolha:\n\n1️⃣ *Entrega* — receber no seu endereço\n2️⃣ *Retirada* — buscar no restaurante`
  }

  // ── AGUARDANDO_ENDERECO ───────────────────────────────────────────────────
  if (state.estado === 'AGUARDANDO_ENDERECO') {
    const endereco = mensagem.trim()
    if (endereco.length < 5) {
      return '📍 Por favor, informe um endereço mais completo (rua, número e bairro).'
    }
    state.enderecoEntrega = endereco
    state.estado = 'ESCOLHENDO_PAGAMENTO'
    return `📍 Endereço registrado: _${endereco}_\n\n${msgPagamento()}`
  }

  // ── ESCOLHENDO_PAGAMENTO ──────────────────────────────────────────────────
  if (state.estado === 'ESCOLHENDO_PAGAMENTO') {
    const formas: Record<string, string> = {
      '1': 'PIX', 'pix': 'PIX',
      '2': 'Dinheiro', 'dinheiro': 'Dinheiro', 'especie': 'Dinheiro', 'espécie': 'Dinheiro',
      '3': 'Cartão de Crédito', 'credito': 'Cartão de Crédito', 'crédito': 'Cartão de Crédito',
      '4': 'Cartão de Débito', 'debito': 'Cartão de Débito', 'débito': 'Cartão de Débito',
    }
    const formaPagamento = formas[msg]

    if (!formaPagamento) return `Não entendi. 😅\n\n${msgPagamento()}`

    const tipoStr = state.tipoEntrega === 'retirada' ? 'Retirada' : 'Entrega'
    const obs = `${tipoStr} | Pagamento: ${formaPagamento}`
    const endereco = state.enderecoEntrega ?? 'Retirada no restaurante'

    const pedido = await criarPedidoDB(restauranteId, telefone, endereco, state.itens, obs)
    const shortId = pedido.id.slice(-8).toUpperCase()
    conversas.delete(key)
    await emitirPedido(restauranteId, pedido.id)

    const msgEntrega =
      state.tipoEntrega === 'retirada'
        ? `🏪 Venha buscar assim que seu pedido estiver pronto.`
        : `🏠 Entrega para: _${endereco}_`

    return (
      `✅ *Pedido #${shortId} confirmado!*\n\n` +
      `💳 Pagamento: *${formaPagamento}*\n` +
      `${msgEntrega}\n\n` +
      `Obrigado por escolher o *${state.restauranteNome}*! 🙏`
    )
  }

  return `${saudacao()}! 👋 Envie qualquer mensagem para começar.`
}
