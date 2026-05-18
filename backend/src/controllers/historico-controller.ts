import { type Request, type Response, type NextFunction } from 'express'
import { listHistorico } from '../db/historico-queries.js'

export async function getHistorico(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { status, canal, dataInicio, dataFim, clienteNome, page, limit } = req.query as Record<string, string | undefined>
    const pageNum = Math.max(1, parseInt(page ?? '1', 10))
    const limitNum = Math.min(200, Math.max(1, parseInt(limit ?? '50', 10)))
    const offset = (pageNum - 1) * limitNum

    const result = await listHistorico(req.user!.restauranteId, {
      status: status || undefined,
      canal: canal || undefined,
      dataInicio: dataInicio || undefined,
      dataFim: dataFim || undefined,
      clienteNome: clienteNome || undefined,
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
