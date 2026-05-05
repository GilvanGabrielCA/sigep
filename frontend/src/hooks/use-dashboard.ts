import { useState, useEffect, useCallback } from 'react'
import { fetchDashboard } from '../services/dashboard-api'
import { useSocket } from './use-socket'
import type { DashboardKpis } from '../services/dashboard-api'

export function useDashboard() {
  const [data, setData] = useState<DashboardKpis | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const socket = useSocket()

  const load = useCallback(async (silent = false) => {
    try {
      const result = await fetchDashboard()
      setData(result)
      setError(null)
    } catch {
      setError('Não foi possível carregar os dados do dashboard.')
    } finally {
      if (!silent) setLoading(false)
    }
  }, [])

  // Carga inicial + polling a cada 30s
  useEffect(() => {
    load()
    const interval = setInterval(() => load(true), 30_000)
    return () => clearInterval(interval)
  }, [load])

  // Atualização em tempo real via socket
  useEffect(() => {
    if (!socket) return
    const handler = () => load(true)
    socket.on('dashboard:atualizado', handler)
    return () => { socket.off('dashboard:atualizado', handler) }
  }, [socket, load])

  return { data, loading, error }
}
