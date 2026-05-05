import { useState, useEffect, useCallback } from 'react'
import { fetchRelatorios } from '../services/relatorio-api'
import type { RelatorioData } from '../types/relatorio'

export function useRelatorios(inicio: string, fim: string) {
  const [data, setData] = useState<RelatorioData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const result = await fetchRelatorios(inicio, fim)
      setData(result)
      setError(null)
    } catch {
      setError('Não foi possível carregar os relatórios.')
    } finally {
      setLoading(false)
    }
  }, [inicio, fim])

  useEffect(() => { load() }, [load])

  return { data, loading, error, reload: load }
}
