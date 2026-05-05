import { type Request, type Response, type NextFunction } from 'express'
import { processarMensagem } from '../services/chatbot-service.js'
import { listIntegracoes, toggleIntegracao } from '../db/integracao-queries.js'

export async function getIntegracoes(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    res.json(await listIntegracoes(req.user!.restauranteId))
  } catch (err) { next(err) }
}

export async function patchIntegracao(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { ativo } = req.body as { ativo?: boolean }
    if (typeof ativo !== 'boolean') {
      res.status(400).json({ error: 'Campo ativo (boolean) é obrigatório' })
      return
    }
    const updated = await toggleIntegracao(req.params['id']!, req.user!.restauranteId, ativo)
    if (!updated) {
      res.status(404).json({ error: 'Integração não encontrada' })
      return
    }
    res.json(updated)
  } catch (err) { next(err) }
}

export async function postMensagem(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { telefone, mensagem } = req.body as { telefone?: string; mensagem?: string }
    if (!telefone?.trim() || !mensagem?.trim()) {
      res.status(400).json({ error: 'Campos telefone e mensagem são obrigatórios' })
      return
    }
    const resposta = await processarMensagem(req.user!.restauranteId, telefone.trim(), mensagem)
    res.json({ resposta })
  } catch (err) { next(err) }
}
