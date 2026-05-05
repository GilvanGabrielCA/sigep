import { pool } from './connection.js'

export interface VendasDia {
  dia: string
  pedidos: number
  faturamento: number
}

export interface ProdutoMaisPedido {
  nome: string
  total_pedido: number
  em_pedidos: number
  faturamento: number
}

export interface PedidosPorCanal {
  canal: string
  total: number
}

export interface TempoPreparoRow {
  minutos_medio: number | null
  total_entregues: number
}

export async function getVendasPorPeriodo(
  restauranteId: string,
  inicio: string,
  fim: string,
): Promise<VendasDia[]> {
  const { rows } = await pool.query<{ dia: string; pedidos: string; faturamento: string }>(
    `SELECT
       TO_CHAR(DATE(criado_em AT TIME ZONE 'America/Sao_Paulo'), 'YYYY-MM-DD') AS dia,
       COUNT(*) AS pedidos,
       COALESCE(SUM(total), 0) AS faturamento
     FROM tb_pedido
     WHERE restaurante_id = $1
       AND criado_em >= $2::date
       AND criado_em < ($3::date + INTERVAL '1 day')
       AND status != 'Cancelado'
     GROUP BY dia
     ORDER BY dia`,
    [restauranteId, inicio, fim],
  )
  return rows.map((r) => ({
    dia: r.dia,
    pedidos: parseInt(r.pedidos, 10),
    faturamento: parseFloat(r.faturamento),
  }))
}

export async function getProdutosMaisPedidos(restauranteId: string): Promise<ProdutoMaisPedido[]> {
  const { rows } = await pool.query<{
    nome: string
    total_pedido: string
    em_pedidos: string
    faturamento: string
  }>(
    `SELECT
       pr.nome,
       SUM(i.quantidade) AS total_pedido,
       COUNT(DISTINCT i.pedido_id) AS em_pedidos,
       COALESCE(SUM(i.quantidade * i.preco_unitario), 0) AS faturamento
     FROM tb_item_pedido i
     JOIN tb_produto pr ON pr.id = i.produto_id
     JOIN tb_pedido p ON p.id = i.pedido_id
     WHERE p.restaurante_id = $1
       AND p.status != 'Cancelado'
     GROUP BY pr.id, pr.nome
     ORDER BY total_pedido DESC
     LIMIT 10`,
    [restauranteId],
  )
  return rows.map((r) => ({
    nome: r.nome,
    total_pedido: parseInt(r.total_pedido, 10),
    em_pedidos: parseInt(r.em_pedidos, 10),
    faturamento: parseFloat(r.faturamento),
  }))
}

export async function getPedidosPorCanal(restauranteId: string): Promise<PedidosPorCanal[]> {
  const { rows } = await pool.query<{ canal: string; total: string }>(
    `SELECT canal, COUNT(*) AS total
     FROM tb_pedido
     WHERE restaurante_id = $1
       AND status != 'Cancelado'
     GROUP BY canal
     ORDER BY total DESC`,
    [restauranteId],
  )
  return rows.map((r) => ({ canal: r.canal, total: parseInt(r.total, 10) }))
}

export async function getTempoMedioPreparo(restauranteId: string): Promise<TempoPreparoRow> {
  const { rows } = await pool.query<{ minutos_medio: string | null; total_entregues: string }>(
    `SELECT
       AVG(EXTRACT(EPOCH FROM (h.criado_em - p.criado_em)) / 60) AS minutos_medio,
       COUNT(*) AS total_entregues
     FROM tb_pedido p
     JOIN tb_status_historico h ON h.pedido_id = p.id AND h.status_novo = 'Entregue'
     WHERE p.restaurante_id = $1
       AND p.status = 'Entregue'`,
    [restauranteId],
  )
  const row = rows[0]!
  return {
    minutos_medio: row.minutos_medio ? parseFloat(row.minutos_medio) : null,
    total_entregues: parseInt(row.total_entregues, 10),
  }
}
