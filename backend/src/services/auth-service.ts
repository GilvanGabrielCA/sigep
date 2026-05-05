import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { findUsuarioByEmail } from '../db/usuario-queries.js'
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
    perfil: usuario.perfil,
  }

  return jwt.sign(payload, process.env.JWT_SECRET!, { expiresIn: '8h' })
}
