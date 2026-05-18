import { pool } from './connection.js'

export interface PedidoHistoricoRow {
  id: string
  status: string
  canal: string
  total: string | null
  observacoes: string | null
  criado_em: string
  atualizado_em: string
  cliente_nome: string | null
  cliente_telefone: string | null
  itens_count: number
}

export async function listHistorico(
  restauranteId: string,
  opts: {
    status?: string
    canal?: string
    dataInicio?: string
    dataFim?: string
    clienteNome?: string
    limit?: number
    offset?: number
  } = {},
): Promise<{ rows: PedidoHistoricoRow[]; total: number }> {
  const conditions: string[] = ['p.restaurante_id = $1']
  const params: unknown[] = [restauranteId]
  let idx = 2

  if (opts.status) {
    conditions.push(`p.status = $${idx++}`)
    params.push(opts.status)
  }
  if (opts.canal) {
    conditions.push(`p.canal = $${idx++}`)
    params.push(opts.canal)
  }
  if (opts.dataInicio) {
    conditions.push(`p.criado_em >= $${idx++}`)
    params.push(opts.dataInicio)
  }
  if (opts.dataFim) {
    conditions.push(`p.criado_em <= $${idx++}::date + interval '1 day'`)
    params.push(opts.dataFim)
  }
  if (opts.clienteNome) {
    conditions.push(`c.nome ILIKE $${idx++}`)
    params.push(`%${opts.clienteNome}%`)
  }

  const where = conditions.join(' AND ')

  const countResult = await pool.query<{ count: string }>(
    `SELECT COUNT(*) FROM tb_pedido p
     LEFT JOIN tb_cliente c ON c.id = p.cliente_id
     WHERE ${where}`,
    params,
  )
  const total = parseInt(countResult.rows[0]?.count ?? '0', 10)

  const limit = opts.limit ?? 100
  const offset = opts.offset ?? 0

  const { rows } = await pool.query<PedidoHistoricoRow>(
    `SELECT
       p.id, p.status, p.canal, p.total::text, p.observacoes,
       p.criado_em::text, p.atualizado_em::text,
       c.nome AS cliente_nome, c.telefone AS cliente_telefone,
       (SELECT COUNT(*)::int FROM tb_item_pedido ip WHERE ip.pedido_id = p.id) AS itens_count
     FROM tb_pedido p
     LEFT JOIN tb_cliente c ON c.id = p.cliente_id
     WHERE ${where}
     ORDER BY p.criado_em DESC
     LIMIT $${idx} OFFSET $${idx + 1}`,
    [...params, limit, offset],
  )

  return { rows, total }
}
