import { type Request, type Response, type NextFunction } from 'express'
import multer from 'multer'
import { getRestaurante, editRestaurante, editLogoRestaurante } from '../services/restaurante-service.js'
import { audit, getIp } from '../services/audit-service.js'

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml']
const MAX_SIZE_BYTES = 2 * 1024 * 1024

export const logoUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_SIZE_BYTES },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_TYPES.includes(file.mimetype)) cb(null, true)
    else cb(Object.assign(new Error('Tipo de arquivo inválido. Use JPEG, PNG, WebP, GIF ou SVG.'), { statusCode: 400 }))
  },
})

export async function getConfig(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    res.json(await getRestaurante(req.user!.restauranteId))
  } catch (err) { next(err) }
}

export async function putConfig(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const updated = await editRestaurante(req.user!.restauranteId, req.body as Record<string, unknown>)
    audit({
      restauranteId: req.user!.restauranteId,
      usuarioId: req.user!.userId,
      entidade: 'restaurante',
      entidadeId: req.user!.restauranteId,
      operacao: 'CONFIG_CHANGE',
      descricao: `Configurações do restaurante atualizadas`,
      ipAddress: getIp(req),
    })
    res.json(updated)
  } catch (err) { next(err) }
}

export async function postLogo(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.file) {
      throw Object.assign(new Error('Nenhum arquivo enviado.'), { statusCode: 400 })
    }
    const dataUrl = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`
    const updated = await editLogoRestaurante(req.user!.restauranteId, dataUrl)
    audit({
      restauranteId: req.user!.restauranteId,
      usuarioId: req.user!.userId,
      entidade: 'restaurante',
      entidadeId: req.user!.restauranteId,
      operacao: 'CONFIG_CHANGE',
      descricao: `Logo do restaurante atualizada`,
      ipAddress: getIp(req),
    })
    res.json(updated)
  } catch (err) { next(err) }
}
