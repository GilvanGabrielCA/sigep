export type StatusPedido =
  | 'Recebido'
  | 'Em Preparacao'
  | 'Pronto para Entrega'
  | 'Entregue'
  | 'Cancelado'

export interface PedidoKanban {
  id: string
  status: StatusPedido
  canal: string
  total: string | null
  observacoes: string | null
  criado_em: string
  cliente_nome: string | null
  cliente_telefone: string | null
}

export interface ItemPedido {
  id: string
  produto_nome: string
  quantidade: number
  preco_unitario: string
  observacao: string | null
}

export interface HistoricoStatus {
  status_anterior: string | null
  status_novo: string
  criado_em: string
  usuario_nome: string | null
}

export interface PedidoDetalhe extends PedidoKanban {
  cliente_endereco: string | null
  itens: ItemPedido[]
  historico: HistoricoStatus[]
}
