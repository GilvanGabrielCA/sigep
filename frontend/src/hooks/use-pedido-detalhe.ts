import { useState, useEffect } from 'react'
import { fetchPedidoDetalhe } from '../services/pedido-api'
import type { PedidoDetalhe } from '../types/pedido'

export function usePedidoDetalhe(id: string | null) {
  const [data, setData] = useState<PedidoDetalhe | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) {
      setData(null)
      return
    }

    let cancelled = false
    setLoading(true)
    setError(null)

    fetchPedidoDetalhe(id)
      .then((d) => { if (!cancelled) setData(d) })
      .catch(() => { if (!cancelled) setError('Não foi possível carregar os detalhes.') })
      .finally(() => { if (!cancelled) setLoading(false) })

    return () => { cancelled = true }
  }, [id])

  return { data, loading, error }
}
