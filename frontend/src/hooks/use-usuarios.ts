import { useState, useEffect, useCallback } from 'react'
import type { Usuario, NovoUsuario, EditarUsuario } from '../services/usuarios-api'
import {
  fetchUsuarios,
  createUsuario,
  updateUsuario,
  toggleUsuarioAtivo,
  resetSenhaUsuario,
} from '../services/usuarios-api'

interface UseUsuarios {
  usuarios: Usuario[]
  loading: boolean
  error: string | null
  saving: boolean
  criar: (data: NovoUsuario) => Promise<Usuario>
  editar: (id: string, data: EditarUsuario) => Promise<Usuario>
  toggleAtivo: (id: string, ativo: boolean) => Promise<void>
  resetSenha: (id: string, novaSenha: string) => Promise<void>
}

export function useUsuarios(): UseUsuarios {
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchUsuarios()
      .then(setUsuarios)
      .catch(() => setError('Erro ao carregar usuários'))
      .finally(() => setLoading(false))
  }, [])

  const criar = useCallback(async (data: NovoUsuario): Promise<Usuario> => {
    setSaving(true)
    try {
      const novo = await createUsuario(data)
      setUsuarios((prev) => [...prev, novo])
      return novo
    } finally {
      setSaving(false)
    }
  }, [])

  const editar = useCallback(async (id: string, data: EditarUsuario): Promise<Usuario> => {
    setSaving(true)
    try {
      const atualizado = await updateUsuario(id, data)
      setUsuarios((prev) => prev.map((u) => (u.id === id ? atualizado : u)))
      return atualizado
    } finally {
      setSaving(false)
    }
  }, [])

  const toggleAtivo = useCallback(async (id: string, ativo: boolean): Promise<void> => {
    await toggleUsuarioAtivo(id, ativo)
    setUsuarios((prev) => prev.map((u) => (u.id === id ? { ...u, ativo } : u)))
  }, [])

  const resetSenha = useCallback(async (id: string, novaSenha: string): Promise<void> => {
    setSaving(true)
    try {
      await resetSenhaUsuario(id, novaSenha)
    } finally {
      setSaving(false)
    }
  }, [])

  return { usuarios, loading, error, saving, criar, editar, toggleAtivo, resetSenha }
}
