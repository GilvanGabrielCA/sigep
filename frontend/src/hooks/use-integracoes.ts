import { useState, useEffect, useCallback } from 'react'
import type { Integracao } from '../services/integracoes-api'
import { fetchIntegracoes, toggleIntegracao, enviarMensagem, fetchOutbox } from '../services/integracoes-api'

interface UseIntegracoes {
  integracoes: Integracao[]
  loading: boolean
  error: string | null
  toggling: string | null
  toggle: (id: string, ativo: boolean) => Promise<void>
}

export function useIntegracoes(): UseIntegracoes {
  const [integracoes, setIntegracoes] = useState<Integracao[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [toggling, setToggling] = useState<string | null>(null)

  useEffect(() => {
    fetchIntegracoes()
      .then(setIntegracoes)
      .catch(() => setError('Erro ao carregar integrações'))
      .finally(() => setLoading(false))
  }, [])

  const toggle = useCallback(async (id: string, ativo: boolean) => {
    setToggling(id)
    try {
      const updated = await toggleIntegracao(id, ativo)
      setIntegracoes((prev) => prev.map((i) => (i.id === updated.id ? updated : i)))
    } catch {
      setError('Erro ao atualizar integração')
    } finally {
      setToggling(null)
    }
  }, [])

  return { integracoes, loading, error, toggling, toggle }
}

interface MensagemChat {
  de: 'cliente' | 'bot'
  texto: string
  timestamp: Date
}

interface UseChatSimulator {
  mensagens: MensagemChat[]
  enviando: boolean
  enviar: (texto: string) => Promise<void>
  limpar: () => void
}

export function useChatSimulator(telefone: string): UseChatSimulator {
  const [mensagens, setMensagens] = useState<MensagemChat[]>([])
  const [enviando, setEnviando] = useState(false)

  // Polling do outbox: mensagens enviadas pelo restaurante ao cliente
  useEffect(() => {
    if (!telefone.trim()) return
    const interval = setInterval(async () => {
      try {
        const msgs = await fetchOutbox(telefone.trim())
        if (msgs.length > 0) {
          setMensagens((prev) => [
            ...prev,
            ...msgs.map((texto) => ({ de: 'bot' as const, texto, timestamp: new Date() })),
          ])
        }
      } catch {
        // silencioso — outbox é best-effort
      }
    }, 2500)
    return () => clearInterval(interval)
  }, [telefone])

  const enviar = useCallback(async (texto: string) => {
    if (!telefone.trim()) return
    setMensagens((prev) => [...prev, { de: 'cliente', texto, timestamp: new Date() }])
    setEnviando(true)
    try {
      const { resposta } = await enviarMensagem(telefone.trim(), texto)
      setMensagens((prev) => [...prev, { de: 'bot', texto: resposta, timestamp: new Date() }])
    } catch {
      setMensagens((prev) => [
        ...prev,
        { de: 'bot', texto: 'Erro ao processar mensagem.', timestamp: new Date() },
      ])
    } finally {
      setEnviando(false)
    }
  }, [telefone])

  const limpar = useCallback(() => setMensagens([]), [])

  return { mensagens, enviando, enviar, limpar }
}
