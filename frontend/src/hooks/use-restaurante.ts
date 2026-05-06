import { useState, useEffect, useCallback } from 'react'
import { fetchRestaurante, updateRestaurante, uploadLogo } from '../services/restaurante-api'
import type { Restaurante, RestauranteFormData } from '../types/restaurante'

export function useRestaurante() {
  const [data, setData] = useState<Restaurante | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    fetchRestaurante()
      .then((r) => { setData(r); setError(null) })
      .catch(() => setError('Não foi possível carregar as configurações.'))
      .finally(() => setLoading(false))
  }, [])

  const salvar = useCallback(async (form: RestauranteFormData, logoFile?: File) => {
    setSaving(true)
    setError(null)
    setSuccess(false)
    try {
      let updated: Restaurante
      if (logoFile) {
        updated = await uploadLogo(logoFile)
        updated = await updateRestaurante({ ...form, logoUrl: updated.logo_url ?? '' })
      } else {
        updated = await updateRestaurante(form)
      }
      setData(updated)
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch {
      setError('Erro ao salvar configurações.')
    } finally {
      setSaving(false)
    }
  }, [])

  return { data, loading, saving, error, success, salvar }
}
