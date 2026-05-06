import { pool } from './connection.js'

export interface DashboardKpis {
  pedidosHoje: number
  faturamentoHoje: number
  ticketMedio: number
  pedidosAtivos: number
  pedidosPorStatus: { status: string; total: number }[]
  pedidosUltimos7Dias: { dia: string; total: number; faturamento: number }[]
}

export async function getDashboardKpis(restauranteId: string): Promise<DashboardKpis> {
  const [
    pedidosHojeResult,
    faturamentoResult,
    ticketResult,
    pedidosAtivosResult,
    porStatusResult,
    ultimos7Result,
  ] = await Promise.all([
    pool.query<{ total: string }>(
      `SELECT COUNT(*) AS total
       FROM tb_pedido
       WHERE restaurante_id = $1
         AND (criado_em AT TIME ZONE 'America/Sao_Paulo')::date = (NOW() AT TIME ZONE 'America/Sao_Paulo')::date
         AND status != 'Cancelado'`,
      [restauranteId],
    ),
    pool.query<{ total: string }>(
      `SELECT COALESCE(SUM(total), 0) AS total
       FROM tb_pedido
       WHERE restaurante_id = $1
         AND (criado_em AT TIME ZONE 'America/Sao_Paulo')::date = (NOW() AT TIME ZONE 'America/Sao_Paulo')::date
         AND status != 'Cancelado'`,
      [restauranteId],
    ),
    pool.query<{ media: string }>(
      `SELECT COALESCE(AVG(total), 0) AS media
       FROM tb_pedido
       WHERE restaurante_id = $1
         AND (criado_em AT TIME ZONE 'America/Sao_Paulo')::date = (NOW() AT TIME ZONE 'America/Sao_Paulo')::date
         AND status != 'Cancelado'`,
      [restauranteId],
    ),
    pool.query<{ total: string }>(
      `SELECT COUNT(*) AS total
       FROM tb_pedido
       WHERE restaurante_id = $1
         AND status NOT IN ('Entregue', 'Cancelado')`,
      [restauranteId],
    ),
    pool.query<{ status: string; total: string }>(
      `SELECT status, COUNT(*) AS total
       FROM tb_pedido
       WHERE restaurante_id = $1
         AND status NOT IN ('Entregue', 'Cancelado')
       GROUP BY status`,
      [restauranteId],
    ),
    pool.query<{ dia: string; total: string; faturamento: string }>(
      `SELECT
         TO_CHAR(DATE(criado_em AT TIME ZONE 'America/Sao_Paulo'), 'YYYY-MM-DD') AS dia,
         COUNT(*) AS total,
         COALESCE(SUM(CASE WHEN status = 'Entregue' THEN total ELSE 0 END), 0) AS faturamento
       FROM tb_pedido
       WHERE restaurante_id = $1
         AND criado_em >= NOW() - INTERVAL '7 days'
         AND status != 'Cancelado'
       GROUP BY dia
       ORDER BY dia`,
      [restauranteId],
    ),
  ])

  return {
    pedidosHoje: parseInt(pedidosHojeResult.rows[0]?.total ?? '0', 10),
    faturamentoHoje: parseFloat(faturamentoResult.rows[0]?.total ?? '0'),
    ticketMedio: parseFloat(ticketResult.rows[0]?.media ?? '0'),
    pedidosAtivos: parseInt(pedidosAtivosResult.rows[0]?.total ?? '0', 10),
    pedidosPorStatus: porStatusResult.rows.map((r) => ({
      status: r.status,
      total: parseInt(r.total, 10),
    })),
    pedidosUltimos7Dias: ultimos7Result.rows.map((r) => ({
      dia: r.dia,
      total: parseInt(r.total, 10),
      faturamento: parseFloat(r.faturamento),
    })),
  }
}
