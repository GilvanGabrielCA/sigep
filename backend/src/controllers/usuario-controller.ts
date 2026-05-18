import { type Request, type Response, type NextFunction } from 'express'
import {
  getUsuarios,
  addUsuario,
  editUsuario,
  setUsuarioAtivo,
  resetSenha,
} from '../services/usuario-service.js'

export async function listUsuarios(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    res.json(await getUsuarios(req.user!.restauranteId))
  } catch (err) { next(err) }
}

export async function postUsuario(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { nome, email, senha, perfil } = req.body as {
      nome?: string; email?: string; senha?: string; perfil?: string
    }
    if (!nome?.trim() || !email?.trim() || !senha?.trim()) {
      res.status(400).json({ error: 'Campos nome, email e senha são obrigatórios' })
      return
    }
    const validPerfis = ['gerente', 'atendente', 'superadmin']
    if (!perfil || !validPerfis.includes(perfil)) {
      res.status(400).json({ error: 'Perfil inválido' })
      return
    }
    const usuario = await addUsuario(
      req.user!.restauranteId,
      { nome, email, senha, perfil: perfil as 'gerente' | 'atendente' | 'superadmin' },
      req.user!.perfil,
    )
    res.status(201).json(usuario)
  } catch (err) { next(err) }
}

export async function putUsuario(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { nome, email, perfil } = req.body as {
      nome?: string; email?: string; perfil?: string
    }
    const validPerfis = ['gerente', 'atendente', 'superadmin']
    if (perfil && !validPerfis.includes(perfil)) {
      res.status(400).json({ error: 'Perfil inválido' })
      return
    }
    const usuario = await editUsuario(
      req.params['id']!,
      req.user!.restauranteId,
      {
        nome: nome?.trim() || undefined,
        email: email?.trim() || undefined,
        perfil: perfil as 'gerente' | 'atendente' | 'superadmin' | undefined,
      },
      req.user!.perfil,
    )
    res.json(usuario)
  } catch (err) { next(err) }
}

export async function patchUsuarioAtivo(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { ativo } = req.body as { ativo?: boolean }
    if (typeof ativo !== 'boolean') {
      res.status(400).json({ error: 'Campo ativo (boolean) é obrigatório' })
      return
    }
    await setUsuarioAtivo(req.params['id']!, req.user!.restauranteId, ativo)
    res.json({ ok: true })
  } catch (err) { next(err) }
}

export async function patchUsuarioSenha(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { novaSenha } = req.body as { novaSenha?: string }
    if (!novaSenha || novaSenha.length < 6) {
      res.status(400).json({ error: 'Nova senha deve ter ao menos 6 caracteres' })
      return
    }
    await resetSenha(req.params['id']!, req.user!.restauranteId, novaSenha)
    res.json({ ok: true })
  } catch (err) { next(err) }
}
