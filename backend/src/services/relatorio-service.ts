import {
  getVendasPorPeriodo,
  getProdutosMaisPedidos,
  getPedidosPorCanal,
  getTempoMedioPreparo,
  type VendasDia,
  type ProdutoMaisPedido,
  type PedidosPorCanal,
  type TempoPreparoRow,
} from '../db/relatorio-queries.js'

export interface RelatorioData {
  vendas: VendasDia[]
  produtosMaisPedidos: ProdutoMaisPedido[]
  pedidosPorCanal: PedidosPorCanal[]
  tempoPreparo: TempoPreparoRow
}

function defaultDates(): { inicio: string; fim: string } {
  const fim = new Date()
  const inicio = new Date()
  inicio.setDate(inicio.getDate() - 29)
  return {
    inicio: inicio.toISOString().split('T')[0]!,
    fim: fim.toISOString().split('T')[0]!,
  }
}

export async function getRelatorios(
  restauranteId: string,
  inicio?: string,
  fim?: string,
): Promise<RelatorioData> {
  const dates = defaultDates()
  const dataInicio = inicio ?? dates.inicio
  const dataFim = fim ?? dates.fim

  const [vendas, produtosMaisPedidos, pedidosPorCanal, tempoPreparo] = await Promise.all([
    getVendasPorPeriodo(restauranteId, dataInicio, dataFim),
    getProdutosMaisPedidos(restauranteId),
    getPedidosPorCanal(restauranteId),
    getTempoMedioPreparo(restauranteId),
  ])

  return { vendas, produtosMaisPedidos, pedidosPorCanal, tempoPreparo }
}
