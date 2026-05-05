import { type Request, type Response, type NextFunction } from 'express'
import { getRestaurante, editRestaurante } from '../services/restaurante-service.js'

export async function getConfig(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    res.json(await getRestaurante(req.user!.restauranteId))
  } catch (err) { next(err) }
}

export async function putConfig(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    res.json(await editRestaurante(req.user!.restauranteId, req.body as Record<string, unknown>))
  } catch (err) { next(err) }
}
