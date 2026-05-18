import { useState, useEffect, useCallback } from 'react'
import { fetchPedidosKanban, updatePedidoStatus } from '../services/pedido-api'
import type { PedidoKanban } from '../types/pedido'
import { useSocket } from './use-socket'

export function usePedidos() {
  const [pedidos, setPedidos] = useState<PedidoKanban[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { socket } = useSocket()

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const data = await fetchPedidosKanban()
        if (!cancelled) {
          setPedidos(data)
          setError(null)
        }
      } catch {
        if (!cancelled) setError('Não foi possível carregar os pedidos.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    if (!socket) return

    function onAtualizado(pedido: PedidoKanban) {
      setPedidos((prev) => {
        const rest = prev.filter((p) => p.id !== pedido.id)
        if (pedido.status === 'Entregue' || pedido.status === 'Cancelado') return rest
        return [...rest, pedido]
      })
    }

    function onNovo(pedido: PedidoKanban) {
      setPedidos((prev) => {
        if (prev.some((p) => p.id === pedido.id)) return prev
        return [...prev, pedido]
      })
    }

    socket.on('pedido:atualizado', onAtualizado)
    socket.on('pedido:novo', onNovo)

    return () => {
      socket.off('pedido:atualizado', onAtualizado)
      socket.off('pedido:novo', onNovo)
    }
  }, [socket])

  const moverPedido = useCallback(async (pedidoId: string, novoStatus: string) => {
    try {
      const atualizado = await updatePedidoStatus(pedidoId, novoStatus)
      // update otimista: aplica imediatamente sem esperar pelo socket
      setPedidos((prev) => {
        const rest = prev.filter((p) => p.id !== pedidoId)
        if (novoStatus === 'Entregue' || novoStatus === 'Cancelado') return rest
        return [...rest, atualizado]
      })
    } catch {
      setError('Falha ao atualizar status do pedido.')
    }
  }, [])

  return { pedidos, loading, error, moverPedido }
}
