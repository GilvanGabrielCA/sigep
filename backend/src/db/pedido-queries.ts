import { pool } from './connection.js'

export interface PedidoKanbanRow {
  id: string
  status: string
  canal: string
  total: string | null
  observacoes: string | null
  criado_em: string
  cliente_nome: string | null
  cliente_telefone: string | null
}

export interface PedidoDetalheRow {
  id: string
  status: string
  canal: string
  total: string | null
  observacoes: string | null
  criado_em: string
  cliente_nome: string | null
  cliente_telefone: string | null
  cliente_endereco: string | null
  itens: Array<{
    id: string
    produto_nome: string
    quantidade: number
    preco_unitario: string
    observacao: string | null
  }> | null
  historico: Array<{
    status_anterior: string | null
    status_novo: string
    criado_em: string
    usuario_nome: string | null
  }> | null
}

export async function listPedidosKanban(restauranteId: string): Promise<PedidoKanbanRow[]> {
  const { rows } = await pool.query<PedidoKanbanRow>(
    `SELECT
       p.id, p.status, p.canal, p.total, p.observacoes,
       p.criado_em::text,
       c.nome  AS cliente_nome,
       c.telefone AS cliente_telefone
     FROM tb_pedido p
     LEFT JOIN tb_cliente c ON c.id = p.cliente_id
     WHERE p.restaurante_id = $1
       AND p.status NOT IN ('Entregue', 'Cancelado')
     ORDER BY p.criado_em ASC`,
    [restauranteId],
  )
  return rows
}

export async function findPedidoById(
  id: string,
  restauranteId: string,
): Promise<PedidoDetalheRow | null> {
  const { rows } = await pool.query<PedidoDetalheRow>(
    `SELECT
       p.id, p.status, p.canal, p.total, p.observacoes,
       p.criado_em::text,
       c.nome     AS cliente_nome,
       c.telefone AS cliente_telefone,
       c.endereco AS cliente_endereco,
       (
         SELECT COALESCE(
           json_agg(
             json_build_object(
               'id',             i.id,
               'produto_nome',   pr.nome,
               'quantidade',     i.quantidade,
               'preco_unitario', i.preco_unitario,
               'observacao',     i.observacao
             ) ORDER BY i.id
           ), '[]'::json
         )
         FROM tb_item_pedido i
         JOIN tb_produto pr ON pr.id = i.produto_id
         WHERE i.pedido_id = p.id
       ) AS itens,
       (
         SELECT COALESCE(
           json_agg(
             json_build_object(
               'status_anterior', h.status_anterior,
               'status_novo',     h.status_novo,
               'criado_em',       h.criado_em::text,
               'usuario_nome',    u.nome
             ) ORDER BY h.criado_em ASC
           ), '[]'::json
         )
         FROM tb_status_historico h
         LEFT JOIN tb_usuario u ON u.id = h.usuario_id
         WHERE h.pedido_id = p.id
       ) AS historico
     FROM tb_pedido p
     LEFT JOIN tb_cliente c ON c.id = p.cliente_id
     WHERE p.id = $1 AND p.restaurante_id = $2`,
    [id, restauranteId],
  )
  return rows[0] ?? null
}

export async function updatePedidoStatusDb(
  pedidoId: string,
  restauranteId: string,
  novoStatus: string,
  usuarioId: string,
): Promise<PedidoKanbanRow> {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')

    const { rows: current } = await client.query<{ status: string }>(
      `SELECT status FROM tb_pedido WHERE id = $1 AND restaurante_id = $2 FOR UPDATE`,
      [pedidoId, restauranteId],
    )
    if (!current[0]) {
      const err = Object.assign(new Error('Pedido não encontrado'), { statusCode: 404 })
      throw err
    }

    const statusAnterior = current[0].status

    await client.query(
      `UPDATE tb_pedido SET status = $1, atualizado_em = NOW() WHERE id = $2`,
      [novoStatus, pedidoId],
    )

    await client.query(
      `INSERT INTO tb_status_historico (pedido_id, usuario_id, status_anterior, status_novo)
       VALUES ($1, $2, $3, $4)`,
      [pedidoId, usuarioId, statusAnterior, novoStatus],
    )

    await client.query('COMMIT')

    const { rows: updated } = await client.query<PedidoKanbanRow>(
      `SELECT
         p.id, p.status, p.canal, p.total, p.observacoes,
         p.criado_em::text,
         c.nome     AS cliente_nome,
         c.telefone AS cliente_telefone
       FROM tb_pedido p
       LEFT JOIN tb_cliente c ON c.id = p.cliente_id
       WHERE p.id = $1`,
      [pedidoId],
    )
    return updated[0]!
  } catch (err) {
    await client.query('ROLLBACK')
    throw err
  } finally {
    client.release()
  }
}
