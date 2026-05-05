import { type Request, type Response, type NextFunction } from 'express'
import bcrypt from 'bcrypt'
import { findUsuarioById, updateUsuario, updateUsuarioSenha } from '../db/usuario-queries.js'

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
    res.json({ ok: true })
  } catch (err) { next(err) }
}
