import { type Request, type Response, type NextFunction } from 'express'
import bcrypt from 'bcrypt'
import multer from 'multer'
import { findUsuarioById, updateUsuario, updateUsuarioSenha, updateFotoUsuario } from '../db/usuario-queries.js'
import { audit, getIp } from '../services/audit-service.js'

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
export const fotoUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_TYPES.includes(file.mimetype)) cb(null, true)
    else cb(Object.assign(new Error('Use JPEG, PNG ou WebP.'), { statusCode: 400 }))
  },
})

export async function getMe(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const row = await findUsuarioById(req.user!.userId)
    if (!row) {
      res.status(404).json({ error: 'Usuário não encontrado' })
      return
    }
    const { senha_hash: _, ...pub } = row
    res.json(pub)
  } catch (err) { next(err) }
}

export async function putMe(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { nome, email } = req.body as { nome?: string; email?: string }
    if (!nome?.trim() && !email?.trim()) {
      res.status(400).json({ error: 'Informe ao menos nome ou email' })
      return
    }
    const updated = await updateUsuario(req.user!.userId, {
      nome: nome?.trim() || undefined,
      email: email?.trim() || undefined,
    })
    if (!updated) {
      res.status(404).json({ error: 'Usuário não encontrado' })
      return
    }
    const { senha_hash: _, ...pub } = updated
    audit({
      restauranteId: req.user!.restauranteId,
      usuarioId: req.user!.userId,
      entidade: 'usuario',
      entidadeId: req.user!.userId,
      operacao: 'UPDATE',
      descricao: `Perfil próprio atualizado — ${[nome && `nome → "${nome}"`, email && `email → "${email}"`].filter(Boolean).join(', ')}`,
      ipAddress: getIp(req),
    })
    res.json(pub)
  } catch (err) { next(err) }
}

export async function postMeFoto(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.file) {
      throw Object.assign(new Error('Nenhum arquivo enviado.'), { statusCode: 400 })
    }
    const dataUrl = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`
    const updated = await updateFotoUsuario(req.user!.userId, dataUrl)
    if (!updated) {
      res.status(404).json({ error: 'Usuário não encontrado' })
      return
    }
    const { senha_hash: _, ...pub } = updated
    audit({
      restauranteId: req.user!.restauranteId,
      usuarioId: req.user!.userId,
      entidade: 'usuario',
      entidadeId: req.user!.userId,
      operacao: 'UPDATE',
      descricao: `Foto de perfil atualizada`,
      ipAddress: getIp(req),
    })
    res.json(pub)
  } catch (err) { next(err) }
}

export async function putMeSenha(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { senhaAtual, novaSenha } = req.body as { senhaAtual?: string; novaSenha?: string }
    if (!senhaAtual || !novaSenha) {
      res.status(400).json({ error: 'Campos senhaAtual e novaSenha são obrigatórios' })
      return
    }
    if (novaSenha.length < 6) {
      res.status(400).json({ error: 'Nova senha deve ter ao menos 6 caracteres' })
      return
    }
    const row = await findUsuarioById(req.user!.userId)
    if (!row) {
      res.status(404).json({ error: 'Usuário não encontrado' })
      return
    }
    const match = await bcrypt.compare(senhaAtual, row.senha_hash)
    if (!match) {
      res.status(400).json({ error: 'Senha atual incorreta' })
      return
    }
    const senhaHash = await bcrypt.hash(novaSenha, 10)
    await updateUsuarioSenha(req.user!.userId, senhaHash)
    audit({
      restauranteId: req.user!.restauranteId,
      usuarioId: req.user!.userId,
      entidade: 'usuario',
      entidadeId: req.user!.userId,
      operacao: 'PASSWORD_RESET',
      descricao: `Senha alterada pelo próprio usuário`,
      ipAddress: getIp(req),
    })
    res.json({ ok: true })
  } catch (err) { next(err) }
}
