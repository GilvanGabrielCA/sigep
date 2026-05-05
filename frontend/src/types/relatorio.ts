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

export interface TempoPreparoInfo {
  minutos_medio: number | null
  total_entregues: number
}

export interface RelatorioData {
  vendas: VendasDia[]
  produtosMaisPedidos: ProdutoMaisPedido[]
  pedidosPorCanal: PedidosPorCanal[]
  tempoPreparo: TempoPreparoInfo
}
