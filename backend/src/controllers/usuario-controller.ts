import { type Request, type Response, type NextFunction } from 'express'
import {
  getUsuarios, addUsuario, editUsuario, setUsuarioAtivo, resetSenha,
} from '../services/usuario-service.js'
import { audit, getIp } from '../services/audit-service.js'

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
    audit({
      restauranteId: req.user!.restauranteId,
      usuarioId: req.user!.userId,
      entidade: 'usuario',
      entidadeId: usuario.id,
      operacao: 'CREATE',
      descricao: `Usuário criado: ${nome} <${email}> [${perfil}]`,
      ipAddress: getIp(req),
    })
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
    const changes: string[] = []
    if (nome) changes.push(`nome → "${nome}"`)
    if (email) changes.push(`email → "${email}"`)
    if (perfil) changes.push(`perfil → "${perfil}"`)
    audit({
      restauranteId: req.user!.restauranteId,
      usuarioId: req.user!.userId,
      entidade: 'usuario',
      entidadeId: req.params['id'],
      operacao: 'UPDATE',
      descricao: `${usuario.nome} editado — ${changes.join(', ')}`,
      ipAddress: getIp(req),
    })
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
    await setUsuarioAtivo(req.params['id']!, req.user!.restauranteId, ativo, req.user!.perfil)
    audit({
      restauranteId: req.user!.restauranteId,
      usuarioId: req.user!.userId,
      entidade: 'usuario',
      entidadeId: req.params['id'],
      operacao: 'TOGGLE',
      descricao: `Usuário ${ativo ? 'ativado' : 'desativado'} por ${req.user!.nome ?? 'gerente'}`,
      ipAddress: getIp(req),
    })
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
    audit({
      restauranteId: req.user!.restauranteId,
      usuarioId: req.user!.userId,
      entidade: 'usuario',
      entidadeId: req.params['id'],
      operacao: 'PASSWORD_RESET',
      descricao: `Senha redefinida pelo gerente ${req.user!.nome ?? req.user!.userId}`,
      ipAddress: getIp(req),
    })
    res.json({ ok: true })
  } catch (err) { next(err) }
}
