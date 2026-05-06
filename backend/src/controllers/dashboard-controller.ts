import { Request, Response, NextFunction } from 'express'
import { getDashboard } from '../services/dashboard-service.js'

export async function getDashboardController(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { restauranteId } = req.user!
    const data = await getDashboard(restauranteId)
    console.log('[Dashboard]', { restauranteId, pedidosHoje: data.pedidosHoje, faturamento: data.faturamentoHoje })
    res.json(data)
  } catch (err) {
    next(err)
  }
}
