import { type Request, type Response, type NextFunction } from 'express'
import { listAuditoriaGlobal, getSystemStats, listTodosUsuarios } from '../db/superadmin-queries.js'

export async function getStats(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    res.json(await getSystemStats())
  } catch (err) { next(err) }
}

export async function getLogs(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { operacao, entidade, restauranteId, page, limit, dataInicio, dataFim } = req.query as Record<string, string | undefined>
    const pageNum = Math.max(1, parseInt(page ?? '1', 10))
    const limitNum = Math.min(200, Math.max(1, parseInt(limit ?? '50', 10)))
    const offset = (pageNum - 1) * limitNum

    const result = await listAuditoriaGlobal({
      operacao: operacao || undefined,
      entidade: entidade || undefined,
      restauranteId: restauranteId || undefined,
      dataInicio: dataInicio || undefined,
      dataFim: dataFim || undefined,
      limit: limitNum,
      offset,
    })

    res.json({
      rows: result.rows,
      total: result.total,
      page: pageNum,
      limit: limitNum,
      pages: Math.ceil(result.total / limitNum),
    })
  } catch (err) { next(err) }
}

export async function getUsuarios(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { page, limit } = req.query as Record<string, string | undefined>
    const pageNum = Math.max(1, parseInt(page ?? '1', 10))
    const limitNum = Math.min(200, Math.max(1, parseInt(limit ?? '50', 10)))
    const offset = (pageNum - 1) * limitNum
    const result = await listTodosUsuarios({ limit: limitNum, offset })
    res.json({ rows: result.rows, total: result.total, page: pageNum, limit: limitNum })
  } catch (err) { next(err) }
}
