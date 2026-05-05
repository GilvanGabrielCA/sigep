import { type Request, type Response, type NextFunction } from 'express'
import { getPedidosKanban, getPedidoDetalhe, atualizarStatusPedido } from '../services/pedido-service.js'
import { io } from '../server.js'

export async function listPedidos(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const pedidos = await getPedidosKanban(req.user!.restauranteId)
    res.json(pedidos)
  } catch (err) {
    next(err)
  }
}

export async function getPedido(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const pedido = await getPedidoDetalhe(req.params['id']!, req.user!.restauranteId)
    res.json(pedido)
  } catch (err) {
    next(err)
  }
}

export async function patchStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { status } = req.body as { status?: string }
    if (!status) {
      res.status(400).json({ error: 'Campo status é obrigatório' })
      return
    }
    const pedidoAtualizado = await atualizarStatusPedido(
      req.params['id']!,
      req.user!.restauranteId,
      status,
      req.user!.userId,
    )
    io.to(req.user!.restauranteId).emit('pedido:atualizado', pedidoAtualizado)
    res.json(pedidoAtualizado)
  } catch (err) {
    next(err)
  }
}
