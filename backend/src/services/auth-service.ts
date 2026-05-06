import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { findUsuarioByEmail, findUsuarioById, updateUsuarioSenha } from '../db/usuario-queries.js'
import { createResetToken, findValidResetToken, markTokenAsUsed } from '../db/reset-token-queries.js'
import { sendPasswordResetEmail } from './email-service.js'
import type { JwtPayload } from '../types/jwt-payload.js'

export async function login(email: string, senha: string): Promise<string> {
  const usuario = await findUsuarioByEmail(email)
  if (!usuario) {
    throw Object.assign(new Error('Credenciais inválidas'), { statusCode: 401 })
  }

  const senhaValida = await bcrypt.compare(senha, usuario.senha_hash)
  if (!senhaValida) {
    throw Object.assign(new Error('Credenciais inválidas'), { statusCode: 401 })
  }

  const payload: JwtPayload = {
    userId: usuario.id,
    restauranteId: usuario.restaurante_id,
    nome: usuario.nome,
    perfil: usuario.perfil,
  }

  return jwt.sign(payload, process.env.JWT_SECRET!, { expiresIn: '8h' })
}

/**
 * Inicia o fluxo de redefinição de senha.
 * Sempre retorna sem erro — nunca revela se o e-mail existe (evita enumeração).
 */
export async function forgotPassword(email: string): Promise<void> {
  const usuario = await findUsuarioByEmail(email)
  if (!usuario || !usuario.ativo) return // responde 200 de qualquer forma

  const rawToken = await createResetToken(usuario.id)
  await sendPasswordResetEmail(usuario.email, usuario.nome, rawToken)
}

/**
 * Valida se um token de reset ainda é válido (não usado, não expirado).
 * Usado pelo frontend para exibir o formulário ou uma mensagem de erro.
 */
export async function validateResetToken(rawToken: string): Promise<boolean> {
  const row = await findValidResetToken(rawToken)
  return row !== null
}

/**
 * Redefine a senha usando um token válido.
 * Lança 400 se o token for inválido ou expirado.
 */
export async function resetPassword(rawToken: string, novaSenha: string): Promise<void> {
  const row = await findValidResetToken(rawToken)
  if (!row) {
    throw Object.assign(
      new Error('Token inválido ou expirado. Solicite um novo link de redefinição.'),
      { statusCode: 400 },
    )
  }

  const usuario = await findUsuarioById(row.usuario_id)
  if (!usuario || !usuario.ativo) {
    throw Object.assign(new Error('Usuário não encontrado ou inativo.'), { statusCode: 400 })
  }

  const senhaHash = await bcrypt.hash(novaSenha, 12)
  await updateUsuarioSenha(usuario.id, senhaHash)
  await markTokenAsUsed(rawToken)
}
