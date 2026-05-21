import { pool } from './connection.js'

export interface IntegraçãoRow {
  id: string
  tipo: string
  ativo: boolean
  configuracao: Record<string, unknown>
}

export async function findIntegracao(
  restauranteId: string,
  tipo: string,
): Promise<IntegraçãoRow | null> {
  const { rows } = await pool.query<IntegraçãoRow>(
    `SELECT id, tipo, ativo, configuracao
     FROM tb_integracao
     WHERE restaurante_id = $1 AND tipo = $2`,
    [restauranteId, tipo],
  )
  return rows[0] ?? null
}

export async function listIntegracoes(restauranteId: string): Promise<IntegraçãoRow[]> {
  await pool.query(
    `INSERT INTO tb_integracao (restaurante_id, tipo, ativo)
     SELECT $1, 'whatsapp', false
     WHERE NOT EXISTS (SELECT 1 FROM tb_integracao WHERE restaurante_id = $1)`,
    [restauranteId],
  )
  const { rows } = await pool.query<IntegraçãoRow>(
    `SELECT id, tipo, ativo, configuracao
     FROM tb_integracao
     WHERE restaurante_id = $1
     ORDER BY tipo`,
    [restauranteId],
  )
  return rows
}

export async function toggleIntegracao(
  id: string,
  restauranteId: string,
  ativo: boolean,
): Promise<IntegraçãoRow | null> {
  const { rows } = await pool.query<IntegraçãoRow>(
    `UPDATE tb_integracao
     SET ativo = $1
     WHERE id = $2 AND restaurante_id = $3
     RETURNING id, tipo, ativo, configuracao`,
    [ativo, id, restauranteId],
  )
  return rows[0] ?? null
}
