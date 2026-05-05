import { Request, Response, NextFunction } from 'express'
import { login } from '../services/auth-service.js'

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
