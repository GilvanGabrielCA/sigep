import { type Request, type Response, type NextFunction } from 'express'
import { getPedidosKanban, getPedidoDetalhe, atualizarStatusPedido } from '../services/pedido-service.js'
import { enviarNotificacaoCliente } from '../services/chatbot-service.js'
import { getIo } from '../socket/socket-instance.js'
import { audit, getIp } from '../services/audit-service.js'

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
    res.json(await getPedidosKanban(req.user!.restauranteId))
  } catch (err) {
    next(err)
  }
}

export async function getPedido(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    res.json(await getPedidoDetalhe(req.params['id']!, req.user!.restauranteId))
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
    getIo().to(req.user!.restauranteId).emit('pedido:atualizado', pedidoAtualizado)
    getIo().to(req.user!.restauranteId).emit('dashboard:atualizado')

    audit({
      restauranteId: req.user!.restauranteId,
      usuarioId: req.user!.userId,
      entidade: 'pedido',
      entidadeId: pedidoAtualizado.id,
      operacao: 'STATUS_CHANGE',
      descricao: `Pedido #${pedidoAtualizado.id.slice(-8).toUpperCase()} → "${status}"`,
      ipAddress: getIp(req),
    })

    if (pedidoAtualizado.canal === 'whatsapp' && pedidoAtualizado.cliente_telefone) {
      const shortId = pedidoAtualizado.id.slice(-8).toUpperCase()
      const isRetirada = pedidoAtualizado.observacoes?.toLowerCase().includes('retirada') ?? false
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
