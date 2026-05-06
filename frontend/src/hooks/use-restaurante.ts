import { useState, useCallback } from 'react'
import { updateRestaurante, uploadLogo } from '../services/restaurante-api'
import { useRestauranteContext } from '../contexts/restaurante-context'
import type { RestauranteFormData } from '../types/restaurante'

export function useRestaurante() {
  const { restaurante: data, loading, setRestaurante } = useRestauranteContext()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const salvar = useCallback(async (form: RestauranteFormData, logoFile?: File) => {
    setSaving(true)
    setError(null)
    setSuccess(false)
    try {
      let updated = data
      if (logoFile) {
        // Sobe a logo e recebe o restaurante com logo_url atualizado
        updated = await uploadLogo(logoFile)
        // Persiste também os campos de texto
        updated = await updateRestaurante({ ...form, logoUrl: updated?.logo_url ?? '' })
      } else {
        updated = await updateRestaurante(form)
      }
      // Atualiza o context global — sidebar reflete imediatamente
      setRestaurante(updated)
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch {
      setError('Erro ao salvar configurações.')
    } finally {
      setSaving(false)
    }
  }, [data, setRestaurante])

  return { data, loading, saving, error, success, salvar }
}
