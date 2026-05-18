import { pool } from './connection.js'
import type { QueryResult } from 'pg'

export interface UsuarioRow {
  id: string
  restaurante_id: string
  nome: string
  email: string
  senha_hash: string
  perfil: 'gerente' | 'atendente' | 'superadmin'
  ativo: boolean
  foto_url: string | null
  criado_em: Date
}

export async function findUsuarioByEmail(email: string): Promise<UsuarioRow | null> {
  const result: QueryResult<UsuarioRow> = await pool.query(
    'SELECT * FROM tb_usuario WHERE email = $1 AND ativo = true',
    [email],
  )
  return result.rows[0] ?? null
}

export async function findUsuarioById(id: string): Promise<UsuarioRow | null> {
  const result: QueryResult<UsuarioRow> = await pool.query(
    'SELECT * FROM tb_usuario WHERE id = $1',
    [id],
  )
  return result.rows[0] ?? null
}

export async function listUsuariosByRestaurante(restauranteId: string): Promise<UsuarioRow[]> {
  const result: QueryResult<UsuarioRow> = await pool.query(
    'SELECT id, restaurante_id, nome, email, perfil, ativo, criado_em FROM tb_usuario WHERE restaurante_id = $1 ORDER BY nome',
    [restauranteId],
  )
  return result.rows
}

export async function updateFotoUsuario(id: string, fotoUrl: string | null): Promise<UsuarioRow | null> {
  const result: QueryResult<UsuarioRow> = await pool.query(
    'UPDATE tb_usuario SET foto_url = $2 WHERE id = $1 RETURNING *',
    [id, fotoUrl],
  )
  return result.rows[0] ?? null
}

export async function createUsuario(data: {
  restauranteId: string
  nome: string
  email: string
  senhaHash: string
  perfil: 'gerente' | 'atendente' | 'superadmin'
}): Promise<UsuarioRow> {
  const result: QueryResult<UsuarioRow> = await pool.query(
    `INSERT INTO tb_usuario (restaurante_id, nome, email, senha_hash, perfil)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [data.restauranteId, data.nome, data.email, data.senhaHash, data.perfil],
  )
  return result.rows[0]!
}

export async function updateUsuario(
  id: string,
  data: Partial<{ nome: string; email: string; perfil: 'gerente' | 'atendente' | 'superadmin' }>,
): Promise<UsuarioRow | null> {
  const result: QueryResult<UsuarioRow> = await pool.query(
    `UPDATE tb_usuario
     SET nome = COALESCE($2, nome),
         email = COALESCE($3, email),
         perfil = COALESCE($4, perfil)
     WHERE id = $1
     RETURNING *`,
    [id, data.nome ?? null, data.email ?? null, data.perfil ?? null],
  )
  return result.rows[0] ?? null
}

export async function updateUsuarioSenha(id: string, senhaHash: string): Promise<void> {
  await pool.query('UPDATE tb_usuario SET senha_hash = $2 WHERE id = $1', [id, senhaHash])
}

export async function toggleUsuarioAtivo(id: string, ativo: boolean): Promise<void> {
  await pool.query('UPDATE tb_usuario SET ativo = $2 WHERE id = $1', [id, ativo])
}
