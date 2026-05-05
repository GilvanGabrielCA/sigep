import { type Request, type Response, type NextFunction } from 'express'
import { getRelatorios } from '../services/relatorio-service.js'

export async function listRelatorios(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { inicio, fim } = req.query as { inicio?: string; fim?: string }
    const data = await getRelatorios(req.user!.restauranteId, inicio, fim)
    res.json(data)
  } catch (err) {
    next(err)
  }
}
