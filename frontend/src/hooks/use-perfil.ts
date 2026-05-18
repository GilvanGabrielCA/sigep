import { useState, useEffect, useCallback } from 'react'
import type { PerfilData } from '../services/perfil-api'
import { fetchPerfil, updatePerfil, updateSenha, uploadFoto as uploadFotoApi } from '../services/perfil-api'

interface UsePerfil {
  data: PerfilData | null
  loading: boolean
  saving: boolean
  error: string | null
  successDados: boolean
  successSenha: boolean
  salvarDados: (payload: { nome?: string; email?: string }) => Promise<void>
  salvarSenha: (senhaAtual: string, novaSenha: string) => Promise<void>
  uploadFoto: (file: File) => Promise<void>
}

export function usePerfil(): UsePerfil {
  const [data, setData] = useState<PerfilData | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successDados, setSuccessDados] = useState(false)
  const [successSenha, setSuccessSenha] = useState(false)

  useEffect(() => {
    fetchPerfil()
      .then(setData)
      .catch(() => setError('Erro ao carregar perfil'))
      .finally(() => setLoading(false))
  }, [])

  const salvarDados = useCallback(async (payload: { nome?: string; email?: string }) => {
    setSaving(true)
    setError(null)
    try {
      const updated = await updatePerfil(payload)
      setData(updated)
      setSuccessDados(true)
      setTimeout(() => setSuccessDados(false), 3000)
    } catch {
      setError('Erro ao salvar dados')
    } finally {
      setSaving(false)
    }
  }, [])

  const salvarSenha = useCallback(async (senhaAtual: string, novaSenha: string) => {
    setSaving(true)
    setError(null)
    try {
      await updateSenha(senhaAtual, novaSenha)
      setSuccessSenha(true)
      setTimeout(() => setSuccessSenha(false), 3000)
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error
      setError(msg ?? 'Erro ao alterar senha')
    } finally {
      setSaving(false)
    }
  }, [])

  const uploadFoto = useCallback(async (file: File) => {
    try {
      const updated = await uploadFotoApi(file)
      setData(updated)
    } catch {
      setError('Erro ao enviar foto')
    }
  }, [])

  return { data, loading, saving, error, successDados, successSenha, salvarDados, salvarSenha, uploadFoto }
}
