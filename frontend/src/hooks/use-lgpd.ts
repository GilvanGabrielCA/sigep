import { useState, useEffect, useCallback } from 'react'
import {
  getSolicitacoes,
  patchSolicitacao,
  getAuditoria,
  getConsentimentos,
  postAnonimizar,
  postSolicitacao,
  type SolicitacaoLgpd,
  type AuditoriaItem,
  type ConsentimentoItem,
} from '../services/lgpd-api'

export function useLgpd() {
  const [solicitacoes, setSolicitacoes] = useState<SolicitacaoLgpd[]>([])
  const [auditoria, setAuditoria] = useState<AuditoriaItem[]>([])
  const [consentimentos, setConsentimentos] = useState<ConsentimentoItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [anonimizando, setAnonimizando] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  async function loadAll() {
    setLoading(true)
    setError(null)
    try {
      const [s, a, c] = await Promise.all([
        getSolicitacoes(),
        getAuditoria(),
        getConsentimentos(),
      ])
      setSolicitacoes(s)
      setAuditoria(a)
      setConsentimentos(c)
    } catch {
      setError('Não foi possível carregar os dados LGPD.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadAll() }, [])

  const responderSolicitacao = useCallback(
    async (id: string, status: string, resposta: string) => {
      setSubmitting(true)
      try {
        const updated = await patchSolicitacao(id, status, resposta)
        setSolicitacoes((prev) =>
          prev.map((s) => (s.id === updated.id ? updated : s)),
        )
      } finally {
        setSubmitting(false)
      }
    },
    [],
  )

  const criarSolicitacao = useCallback(
    async (payload: { telefone?: string; email?: string; tipo: string; descricao?: string }) => {
      setSubmitting(true)
      try {
        const nova = await postSolicitacao(payload)
        setSolicitacoes((prev) => [nova, ...prev])
      } finally {
        setSubmitting(false)
      }
    },
    [],
  )

  const anonimizar = useCallback(async (meses: number) => {
    setAnonimizando(true)
    try {
      const result = await postAnonimizar(meses)
      await loadAll()
      return result
    } finally {
      setAnonimizando(false)
    }
  }, [])

  return {
    solicitacoes,
    auditoria,
    consentimentos,
    loading,
    error,
    submitting,
    anonimizando,
    responderSolicitacao,
    criarSolicitacao,
    anonimizar,
    reload: loadAll,
  }
}
