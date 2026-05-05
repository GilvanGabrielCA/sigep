import { api } from './api'

export interface DashboardKpis {
  pedidosHoje: number
  faturamentoHoje: number
  ticketMedio: number
  pedidosAtivos: number
  pedidosPorStatus: { status: string; total: number }[]
  pedidosUltimos7Dias: { dia: string; total: number; faturamento: number }[]
}

export async function fetchDashboard(): Promise<DashboardKpis> {
  const { data } = await api.get<DashboardKpis>('/api/dashboard')
  return data
}
