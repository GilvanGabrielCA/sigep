import { pool } from './connection.js'

export interface CategoriaRow {
  id: string
  nome: string
  ordem: number
  ativo: boolean
}

export async function listCategorias(restauranteId: string): Promise<CategoriaRow[]> {
  const { rows } = await pool.query<CategoriaRow>(
    `SELECT id, nome, ordem, ativo
     FROM tb_categoria
     WHERE restaurante_id = $1
     ORDER BY ordem ASC, nome ASC`,
    [restauranteId],
  )
  return rows
}

export async function createCategoria(
  restauranteId: string,
  nome: string,
  ordem: number,
): Promise<CategoriaRow> {
  const { rows } = await pool.query<CategoriaRow>(
    `INSERT INTO tb_categoria (restaurante_id, nome, ordem)
     VALUES ($1, $2, $3)
     RETURNING id, nome, ordem, ativo`,
    [restauranteId, nome, ordem],
  )
  return rows[0]!
}

export async function updateCategoria(
  id: string,
  restauranteId: string,
  nome: string,
  ordem: number,
  ativo: boolean,
): Promise<CategoriaRow | null> {
  const { rows } = await pool.query<CategoriaRow>(
    `UPDATE tb_categoria
     SET nome = $1, ordem = $2, ativo = $3
     WHERE id = $4 AND restaurante_id = $5
     RETURNING id, nome, ordem, ativo`,
    [nome, ordem, ativo, id, restauranteId],
  )
  return rows[0] ?? null
}

export async function deleteCategoria(id: string, restauranteId: string): Promise<boolean> {
  const { rowCount } = await pool.query(
    `DELETE FROM tb_categoria WHERE id = $1 AND restaurante_id = $2`,
    [id, restauranteId],
  )
  return (rowCount ?? 0) > 0
}
