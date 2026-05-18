import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import type { JwtPayload } from '../types/jwt-payload.js'

export function authMiddleware(req: Request, res: Response, next: NextFunction): void {
  const header = req.headers.authorization
  if (!header?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Token ausente' })
    return
  }
  try {
    const token = header.slice(7)
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload
    req.user = payload
    next()
  } catch {
    res.status(401).json({ error: 'Token inválido' })
  }
}

export function requireGerente(req: Request, res: Response, next: NextFunction): void {
  const perfil = req.user?.perfil
  if (perfil !== 'gerente' && perfil !== 'superadmin') {
    res.status(403).json({ error: 'Acesso restrito a gerentes' })
    return
  }
  next()
}

export function requireSuperAdmin(req: Request, res: Response, next: NextFunction): void {
  if (req.user?.perfil !== 'superadmin') {
    res.status(403).json({ error: 'Acesso restrito ao super admin' })
    return
  }
  next()
}
