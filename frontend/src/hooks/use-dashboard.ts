import { useState, useEffect } from 'react'
import { fetchDashboard } from '../services/dashboard-api'
import type { DashboardKpis } from '../services/dashboard-api'

export function useDashboard() {
  const [data, setData] = useState<DashboardKpis | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const result = await fetchDashboard()
        if (!cancelled) {
          setData(result)
          setError(null)
        }
      } catch {
        if (!cancelled) {
          setError('Não foi possível carregar os dados do dashboard.')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    const interval = setInterval(load, 30_000)

    return () => {
      cancelled = true
      clearInterval(interval)
    }
  }, [])

  return { data, loading, error }
}
