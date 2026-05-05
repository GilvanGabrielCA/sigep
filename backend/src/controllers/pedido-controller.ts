import { type Request, type Response, type NextFunction } from 'express'
import { getPedidosKanban, getPedidoDetalhe, atualizarStatusPedido } from '../services/pedido-service.js'
import { enviarNotificacaoCliente } from '../services/chatbot-service.js'
import { io } from '../server.js'

const MSGS_STATUS: Record<string, (shortId: string, isRetirada: boolean) => string> = {
  'Em Preparacao': (id) => `👨‍🍳 Seu pedido *#${id}* está sendo preparado com carinho! Em breve ficará pronto.`,
  'Pronto para Entrega': (id, isRetirada) =>
    isRetirada
      ? `✅ Seu pedido *#${id}* está *pronto para retirada*! Pode vir buscar no restaurante. 🏪`
      : `🛵 Seu pedido *#${id}* está pronto e *saiu para entrega*! Aguarde em breve.`,
  'Entregue': (id) => `✅ Pedido *#${id}* entregue! Obrigado pela preferência. Bom apetite! 🍽️`,
  'Cancelado': (id) => `❌ Infelizmente seu pedido *#${id}* foi cancelado. Entre em contato para mais informações.`,
}

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
    io.to(req.user!.restauranteId).emit('dashboard:atualizado')

    // Notificação WhatsApp simulada
    if (pedidoAtualizado.canal === 'whatsapp' && pedidoAtualizado.cliente_telefone) {
      const shortId = pedidoAtualizado.id.slice(-8).toUpperCase()
      const isRetirada = pedidoAtualizado.observacoes === 'retirada'
      const buildMsg = MSGS_STATUS[status]
      if (buildMsg) {
        enviarNotificacaoCliente(
          req.user!.restauranteId,
          pedidoAtualizado.cliente_telefone,
          buildMsg(shortId, isRetirada),
        )
      }
    }

    res.json(pedidoAtualizado)
  } catch (err) {
    next(err)
  }
}
