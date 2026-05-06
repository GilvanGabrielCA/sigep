import { Request, Response, NextFunction } from 'express'
import { login, forgotPassword, validateResetToken, resetPassword } from '../services/auth-service.js'

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
    const token = await login(email, senha)
    res.json({ token })
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
    // Resposta sempre genérica — nunca revela se o e-mail existe
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
    res.json({ message: 'Senha redefinida com sucesso.' })
  } catch (err) {
    next(err)
  }
}
