import { getDashboardKpis } from '../db/dashboard-queries.js'
import type { DashboardKpis } from '../db/dashboard-queries.js'

export async function getDashboard(restauranteId: string): Promise<DashboardKpis> {
  return getDashboardKpis(restauranteId)
}
