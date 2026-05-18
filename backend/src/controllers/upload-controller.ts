import { type Request, type Response, type NextFunction } from 'express'
import multer from 'multer'

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml']
const MAX_SIZE_BYTES = 2 * 1024 * 1024

export const imageUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_SIZE_BYTES },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_TYPES.includes(file.mimetype)) cb(null, true)
    else cb(Object.assign(new Error('Tipo inválido. Use JPEG, PNG, WebP, GIF ou SVG.'), { statusCode: 400 }))
  },
})

export async function postUpload(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.file) {
      throw Object.assign(new Error('Nenhum arquivo enviado.'), { statusCode: 400 })
    }
    const dataUrl = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`
    res.json({ url: dataUrl })
  } catch (err) { next(err) }
}
