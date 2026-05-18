import { pool } from './connection.js'

export interface AuditoriaGlobalRow {
  id: string
  restaurante_id: string | null
  restaurante_nome: string | null
  usuario_id: string | null
  usuario_nome: string | null
  entidade: string
  entidade_id: string | null
  operacao: string
  descricao: string | null
  ip_address: string | null
  criado_em: string
}

export interface SystemStatsRow {
  total_restaurantes: number
  total_usuarios: number
  total_pedidos: number
  total_pedidos_hoje: number
  faturamento_total: string
}

export async function listAuditoriaGlobal(
  opts: {
    limit?: number
    offset?: number
    operacao?: string
    entidade?: string
    restauranteId?: string
    dataInicio?: string
    dataFim?: string
  } = {},
): Promise<{ rows: AuditoriaGlobalRow[]; total: number }> {
  const conditions: string[] = []
  const params: unknown[] = []
  let idx = 1

  if (opts.operacao) {
    conditions.push(`a.operacao = $${idx++}`)
    params.push(opts.operacao)
  }
  if (opts.entidade) {
    conditions.push(`a.entidade = $${idx++}`)
    params.push(opts.entidade)
  }
  if (opts.restauranteId) {
    conditions.push(`a.restaurante_id = $${idx++}`)
    params.push(opts.restauranteId)
  }
  if (opts.dataInicio) {
    conditions.push(`a.criado_em >= $${idx++}`)
    params.push(opts.dataInicio)
  }
  if (opts.dataFim) {
    conditions.push(`a.criado_em < ($${idx++}::date + INTERVAL '1 day')`)
    params.push(opts.dataFim)
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''

  const countResult = await pool.query<{ count: string }>(
    `SELECT COUNT(*) FROM tb_auditoria a ${where}`,
    params,
  )
  const total = parseInt(countResult.rows[0]?.count ?? '0', 10)

  const limit = opts.limit ?? 100
  const offset = opts.offset ?? 0

  const { rows } = await pool.query<AuditoriaGlobalRow>(
    `SELECT
       a.id, a.restaurante_id, r.nome AS restaurante_nome,
       a.usuario_id, u.nome AS usuario_nome,
       a.entidade, a.entidade_id, a.operacao, a.descricao,
       a.ip_address, a.criado_em::text
     FROM tb_auditoria a
     LEFT JOIN tb_restaurante r ON r.id = a.restaurante_id
     LEFT JOIN tb_usuario u ON u.id = a.usuario_id
     ${where}
     ORDER BY a.criado_em DESC
     LIMIT $${idx} OFFSET $${idx + 1}`,
    [...params, limit, offset],
  )

  return { rows, total }
}

export async function getSystemStats(): Promise<SystemStatsRow> {
  const { rows: [stats] } = await pool.query<SystemStatsRow>(`
    SELECT
      (SELECT COUNT(*)::int FROM tb_restaurante)            AS total_restaurantes,
      (SELECT COUNT(*)::int FROM tb_usuario WHERE ativo = true) AS total_usuarios,
      (SELECT COUNT(*)::int FROM tb_pedido)                 AS total_pedidos,
      (SELECT COUNT(*)::int FROM tb_pedido
       WHERE criado_em::date = CURRENT_DATE)                AS total_pedidos_hoje,
      COALESCE(
        (SELECT SUM(total)::text FROM tb_pedido
         WHERE status = 'Entregue'), '0'
      )                                                     AS faturamento_total
  `)
  return stats!
}

export async function listTodosUsuarios(opts: { limit?: number; offset?: number } = {}): Promise<{ rows: object[]; total: number }> {
  const limit = opts.limit ?? 100
  const offset = opts.offset ?? 0

  const countResult = await pool.query<{ count: string }>('SELECT COUNT(*) FROM tb_usuario')
  const total = parseInt(countResult.rows[0]?.count ?? '0', 10)

  const { rows } = await pool.query(
    `SELECT u.id, u.nome, u.email, u.perfil, u.ativo, u.criado_em::text,
            r.nome AS restaurante_nome
     FROM tb_usuario u
     JOIN tb_restaurante r ON r.id = u.restaurante_id
     ORDER BY u.criado_em DESC
     LIMIT $1 OFFSET $2`,
    [limit, offset],
  )

  return { rows, total }
}
