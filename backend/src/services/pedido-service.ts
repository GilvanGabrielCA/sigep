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
  return pedido
}
