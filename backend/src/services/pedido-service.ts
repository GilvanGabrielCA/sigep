import {
  listPedidosKanban,
  findPedidoById,
  updatePedidoStatusDb,
  type PedidoKanbanRow,
  type PedidoDetalheRow,
} from '../db/pedido-queries.js'
import { enviarNotificacaoCliente } from './chatbot-service.js'

const STATUS_VALIDOS = ['Recebido', 'Em Preparacao', 'Pronto para Entrega', 'Entregue', 'Cancelado']

const STATUS_MSGS: Record<string, string> = {
  'Em Preparacao':       '🍳 Seu pedido está em preparação!',
  'Pronto para Entrega': '✅ Seu pedido está pronto para entrega!',
  'Entregue':            '🎉 Pedido entregue. Bom apetite! Obrigado pela preferência! 😊',
  'Cancelado':           '❌ Seu pedido foi cancelado. Em caso de dúvidas, entre em contato conosco.',
}

export async function getPedidosKanban(restauranteId: string): Promise<PedidoKanbanRow[]> {
  return listPedidosKanban(restauranteId)
}

export async function getPedidoDetalhe(
  id: string,
  restauranteId: string,
): Promise<PedidoDetalheRow> {
  const pedido = await findPedidoById(id, restauranteId)
  if (!pedido) {
    throw Object.assign(new Error('Pedido não encontrado'), { statusCode: 404 })
  }
  return pedido
}

export async function atualizarStatusPedido(
  pedidoId: string,
  restauranteId: string,
  novoStatus: string,
  usuarioId: string,
): Promise<PedidoKanbanRow> {
  if (!STATUS_VALIDOS.includes(novoStatus)) {
    throw Object.assign(new Error('Status inválido'), { statusCode: 400 })
  }
  const pedido = await updatePedidoStatusDb(pedidoId, restauranteId, novoStatus, usuarioId)
  if (pedido.canal === 'whatsapp' && pedido.cliente_telefone && STATUS_MSGS[novoStatus]) {
    enviarNotificacaoCliente(restauranteId, pedido.cliente_telefone, STATUS_MSGS[novoStatus]!)
  }
  return pedido
}
