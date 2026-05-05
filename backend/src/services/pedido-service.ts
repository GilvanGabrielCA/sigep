import {
  listPedidosKanban,
  findPedidoById,
  updatePedidoStatusDb,
  type PedidoKanbanRow,
  type PedidoDetalheRow,
} from '../db/pedido-queries.js'

const STATUS_VALIDOS = ['Recebido', 'Em Preparacao', 'Pronto para Entrega', 'Entregue', 'Cancelado']

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
  return updatePedidoStatusDb(pedidoId, restauranteId, novoStatus, usuarioId)
}
