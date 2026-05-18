import { useState, useCallback } from 'react'
import { fetchSystemStats, fetchLogs, fetchUsuariosGlobal } from '../services/superadmin-api'
import type { SystemStats, LogsResponse, UsuarioGlobal } from '../services/superadmin-api'

export function useSuperAdmin() {
  const [stats, setStats] = useState<SystemStats | null>(null)
  const [logsData, setLogsData] = useState<LogsResponse | null>(null)
  const [usuariosData, setUsuariosData] = useState<{ rows: UsuarioGlobal[]; total: number } | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadStats = useCallback(async () => {
    try {
      setStats(await fetchSystemStats())
    } catch {
      setError('Erro ao carregar estatísticas')
    }
  }, [])

  const loadLogs = useCallback(async (opts: { operacao?: string; page?: number } = {}) => {
    setLoading(true)
    setError(null)
    try {
      setLogsData(await fetchLogs({ ...opts, limit: 50 }))
    } catch {
      setError('Erro ao carregar logs')
    } finally {
      setLoading(false)
    }
  }, [])

  const loadUsuarios = useCallback(async (opts: { page?: number } = {}) => {
    setLoading(true)
    setError(null)
    try {
      setUsuariosData(await fetchUsuariosGlobal({ ...opts, limit: 50 }))
    } catch {
      setError('Erro ao carregar usuários')
    } finally {
      setLoading(false)
    }
  }, [])

  return { stats, logsData, usuariosData, loading, error, loadStats, loadLogs, loadUsuarios }
}
