import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { login, forgotPassword, validateResetToken, resetPassword } from '../services/auth-service.js'
import { audit, getIp } from '../services/audit-service.js'
import type { JwtPayload } from '../types/jwt-payload.js'

export async function loginController(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { email, senha } = req.body as { email: string; senha: string }
    if (!email || !senha) {
      res.status(400).json({ error: 'Email e senha são obrigatórios' })
      return
    }
    const ip = getIp(req)
    try {
      const token = await login(email, senha)
      const decoded = jwt.decode(token) as JwtPayload
      audit({
        restauranteId: decoded.restauranteId,
        usuarioId: decoded.userId,
        entidade: 'auth',
        operacao: 'LOGIN',
        descricao: `Login bem-sucedido — ${email}`,
        ipAddress: ip,
      })
      res.json({ token })
    } catch {
      audit({
        entidade: 'auth',
        operacao: 'LOGIN_FAIL',
        descricao: `Tentativa de login falhou — ${email}`,
        ipAddress: ip,
      })
      const err = Object.assign(new Error('Credenciais inválidas'), { statusCode: 401 })
      throw err
    }
  } catch (err) {
    next(err)
  }
}

export async function forgotPasswordController(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { email } = req.body as { email?: string }
    if (!email || typeof email !== 'string') {
      res.status(400).json({ error: 'E-mail é obrigatório.' })
      return
    }
    await forgotPassword(email.trim().toLowerCase())
    res.json({ message: 'Se este e-mail estiver cadastrado, você receberá as instruções em breve.' })
  } catch (err) {
    next(err)
  }
}

export async function validateResetTokenController(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { token } = req.params as { token: string }
    const valid = await validateResetToken(token)
    if (!valid) {
      res.status(400).json({ error: 'Token inválido ou expirado.' })
      return
    }
    res.json({ valid: true })
  } catch (err) {
    next(err)
  }
}

export async function resetPasswordController(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { token, novaSenha } = req.body as { token?: string; novaSenha?: string }
    if (!token || !novaSenha) {
      res.status(400).json({ error: 'Token e nova senha são obrigatórios.' })
      return
    }
    if (novaSenha.length < 6) {
      res.status(400).json({ error: 'A nova senha deve ter pelo menos 6 caracteres.' })
      return
    }
    await resetPassword(token, novaSenha)
    audit({
      entidade: 'auth',
      operacao: 'PASSWORD_RESET',
      descricao: 'Senha redefinida via link de e-mail',
      ipAddress: getIp(req),
    })
    res.json({ message: 'Senha redefinida com sucesso.' })
  } catch (err) {
    next(err)
  }
}
