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
    const err: any = new Error('Pedido não encontrado')
    err.statusCode = 404
    throw err
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
    const err: any = new Error('Status inválido')
    err.statusCode = 400
    throw err
  }
  const pedido = await updatePedidoStatusDb(pedidoId, restauranteId, novoStatus, usuarioId)
  if (pedido.canal === 'whatsapp' && pedido.cliente_telefone && STATUS_MSGS[novoStatus]) {
    enviarNotificacaoCliente(restauranteId, pedido.cliente_telefone, STATUS_MSGS[novoStatus]!)
  }
  return pedido
}
