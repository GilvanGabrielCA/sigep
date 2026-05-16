import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { findUsuarioByEmail, findUsuarioById, updateUsuarioSenha } from '../db/usuario-queries.js'
import { createResetToken, findValidResetToken, markTokenAsUsed } from '../db/reset-token-queries.js'
import { sendPasswordResetEmail } from './email-service.js'
import type { JwtPayload } from '../types/jwt-payload.js'

export async function login(email: string, senha: string): Promise<string> {
  const usuario = await findUsuarioByEmail(email)
  if (!usuario) {
    const err: any = new Error('Credenciais inválidas')
    err.statusCode = 401
    throw err
  }

  const senhaValida = await bcrypt.compare(senha, usuario.senha_hash)
  if (!senhaValida) {
    const err: any = new Error('Credenciais inválidas')
    err.statusCode = 401
    throw err
  }

  const payload: JwtPayload = {
    userId: usuario.id,
    restauranteId: usuario.restaurante_id,
    nome: usuario.nome,
    perfil: usuario.perfil,
  }

  return jwt.sign(payload, process.env.JWT_SECRET!, { expiresIn: '8h' })
}

export async function forgotPassword(email: string): Promise<void> {
  const usuario = await findUsuarioByEmail(email)
  if (!usuario || !usuario.ativo) return

  const rawToken = await createResetToken(usuario.id)
  await sendPasswordResetEmail(usuario.email, usuario.nome, rawToken)
}

export async function validateResetToken(rawToken: string): Promise<boolean> {
  const row = await findValidResetToken(rawToken)
  return row !== null
}

export async function resetPassword(rawToken: string, novaSenha: string): Promise<void> {
  const row = await findValidResetToken(rawToken)
  if (!row) {
    const err: any = new Error('Token inválido ou expirado. Solicite um novo link de redefinição.')
    err.statusCode = 400
    throw err
  }

  const usuario = await findUsuarioById(row.usuario_id)
  if (!usuario || !usuario.ativo) {
    const err: any = new Error('Usuário não encontrado ou inativo.')
    err.statusCode = 400
    throw err
  }

  const senhaHash = await bcrypt.hash(novaSenha, 12)
  await updateUsuarioSenha(usuario.id, senhaHash)
  await markTokenAsUsed(rawToken)
}
