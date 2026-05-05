import { api } from './api'
import type { PedidoKanban, PedidoDetalhe } from '../types/pedido'

export async function fetchPedidosKanban(): Promise<PedidoKanban[]> {
  const { data } = await api.get<PedidoKanban[]>('/api/pedidos')
  return data
}

export async function fetchPedidoDetalhe(id: string): Promise<PedidoDetalhe> {
  const { data } = await api.get<PedidoDetalhe>(`/api/pedidos/${id}`)
  return data
}

export async function updatePedidoStatus(id: string, status: string): Promise<PedidoKanban> {
  const { data } = await api.patch<PedidoKanban>(`/api/pedidos/${id}/status`, { status })
  return data
}
