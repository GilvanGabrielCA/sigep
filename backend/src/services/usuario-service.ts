import bcrypt from 'bcrypt'
import {
  listUsuariosByRestaurante,
  createUsuario,
  updateUsuario,
  toggleUsuarioAtivo,
  findUsuarioByEmail,
  findUsuarioById,
  updateUsuarioSenha,
} from '../db/usuario-queries.js'
import type { UsuarioRow } from '../db/usuario-queries.js'

export type UsuarioPublico = Omit<UsuarioRow, 'senha_hash'>

function toPublico(u: UsuarioRow): UsuarioPublico {
  const { senha_hash: _, ...pub } = u
  return pub
}

export async function getUsuarios(restauranteId: string): Promise<UsuarioPublico[]> {
  const rows = await listUsuariosByRestaurante(restauranteId)
  return rows.map(toPublico)
}

export async function addUsuario(
  restauranteId: string,
  data: { nome: string; email: string; senha: string; perfil: 'gerente' | 'atendente' },
): Promise<UsuarioPublico> {
  const existing = await findUsuarioByEmail(data.email)
  if (existing) {
    const err: any = new Error('E-mail já cadastrado')
    err.statusCode = 409
    throw err
  }
  const senhaHash = await bcrypt.hash(data.senha, 10)
  const row = await createUsuario({ restauranteId, ...data, senhaHash })
  return toPublico(row)
}

export async function editUsuario(
  id: string,
  restauranteId: string,
  data: Partial<{ nome: string; email: string; perfil: 'gerente' | 'atendente' }>,
): Promise<UsuarioPublico> {
  const row = await findUsuarioById(id)
  if (!row || row.restaurante_id !== restauranteId) {
    const err: any = new Error('Usuário não encontrado')
    err.statusCode = 404
    throw err
  }
  if (data.email && data.email !== row.email) {
    const existing = await findUsuarioByEmail(data.email)
    if (existing && existing.id !== id) {
      const err: any = new Error('E-mail já cadastrado')
      err.statusCode = 409
      throw err
    }
  }
  const updated = await updateUsuario(id, data)
  return toPublico(updated!)
}

export async function setUsuarioAtivo(
  id: string,
  restauranteId: string,
  ativo: boolean,
): Promise<void> {
  const row = await findUsuarioById(id)
  if (!row || row.restaurante_id !== restauranteId) {
    const err: any = new Error('Usuário não encontrado')
    err.statusCode = 404
    throw err
  }
  await toggleUsuarioAtivo(id, ativo)
}

export async function resetSenha(
  id: string,
  restauranteId: string,
  novaSenha: string,
): Promise<void> {
  const row = await findUsuarioById(id)
  if (!row || row.restaurante_id !== restauranteId) {
    const err: any = new Error('Usuário não encontrado')
    err.statusCode = 404
    throw err
  }
  const senhaHash = await bcrypt.hash(novaSenha, 10)
  await updateUsuarioSenha(id, senhaHash)
}
