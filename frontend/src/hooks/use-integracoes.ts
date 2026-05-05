import { useState, useEffect, useCallback } from 'react'
import type { Integracao } from '../services/integracoes-api'
import { fetchIntegracoes, toggleIntegracao, enviarMensagem } from '../services/integracoes-api'

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
  enviar: (telefone: string, texto: string) => Promise<void>
  limpar: () => void
}

export function useChatSimulator(): UseChatSimulator {
  const [mensagens, setMensagens] = useState<MensagemChat[]>([])
  const [enviando, setEnviando] = useState(false)

  const enviar = useCallback(async (telefone: string, texto: string) => {
    setMensagens((prev) => [...prev, { de: 'cliente', texto, timestamp: new Date() }])
    setEnviando(true)
    try {
      const { resposta } = await enviarMensagem(telefone, texto)
      setMensagens((prev) => [...prev, { de: 'bot', texto: resposta, timestamp: new Date() }])
    } catch {
      setMensagens((prev) => [
        ...prev,
        { de: 'bot', texto: 'Erro ao processar mensagem.', timestamp: new Date() },
      ])
    } finally {
      setEnviando(false)
    }
  }, [])

  const limpar = useCallback(() => setMensagens([]), [])

  return { mensagens, enviando, enviar, limpar }
}
