import { pool } from './connection.js'

export interface RestauranteRow {
  id: string
  nome: string
  endereco: string | null
  telefone: string | null
  logo_url: string | null
  criado_em: string
}

export interface RestauranteUpdateInput {
  nome: string
  endereco: string | null
  telefone: string | null
  logoUrl: string | null
}

export async function findRestaurante(id: string): Promise<RestauranteRow | null> {
  const { rows } = await pool.query<RestauranteRow>(
    `SELECT id, nome, endereco, telefone, logo_url, criado_em::text
     FROM tb_restaurante WHERE id = $1`,
    [id],
  )
  return rows[0] ?? null
}

export async function updateRestaurante(
  id: string,
  input: RestauranteUpdateInput,
): Promise<RestauranteRow | null> {
  const { rows } = await pool.query<RestauranteRow>(
    `UPDATE tb_restaurante
     SET nome = $1, endereco = $2, telefone = $3, logo_url = $4
     WHERE id = $5
     RETURNING id, nome, endereco, telefone, logo_url, criado_em::text`,
    [input.nome, input.endereco, input.telefone, input.logoUrl, id],
  )
  return rows[0] ?? null
}

export async function updateLogoRestaurante(id: string, logoUrl: string): Promise<RestauranteRow | null> {
  const { rows } = await pool.query<RestauranteRow>(
    `UPDATE tb_restaurante SET logo_url = $1 WHERE id = $2
     RETURNING id, nome, endereco, telefone, logo_url, criado_em::text`,
    [logoUrl, id],
  )
  return rows[0] ?? null
}
