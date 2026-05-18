import { useState, useCallback } from 'react'
import { fetchHistorico } from '../services/historico-api'
import type { PedidoHistorico, HistoricoFiltros, HistoricoResponse } from '../services/historico-api'

export function useHistorico() {
  const [data, setData] = useState<HistoricoResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async (filtros: HistoricoFiltros = {}) => {
    setLoading(true)
    setError(null)
    try {
      const result = await fetchHistorico(filtros)
      setData(result)
    } catch {
      setError('Erro ao carregar histórico de pedidos')
    } finally {
      setLoading(false)
    }
  }, [])

  return { data, loading, error, load }
}

export type { PedidoHistorico, HistoricoFiltros }
