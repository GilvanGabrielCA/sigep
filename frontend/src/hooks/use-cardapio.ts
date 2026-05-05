import { useState, useEffect, useCallback } from 'react'
import {
  fetchCategorias, fetchProdutos,
  createProduto, updateProduto, deleteProduto, toggleDisponibilidade,
  createCategoria, updateCategoria, deleteCategoria,
} from '../services/cardapio-api'
import type { Categoria, Produto, ProdutoFormData } from '../types/cardapio'

export function useCardapio() {
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [produtos, setProdutos] = useState<Produto[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    try {
      const [cats, prods] = await Promise.all([fetchCategorias(), fetchProdutos()])
      setCategorias(cats)
      setProdutos(prods)
      setError(null)
    } catch {
      setError('Não foi possível carregar o cardápio.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  // ── Produto actions ────────────────────────────────────────────────────────

  const adicionarProduto = useCallback(async (form: ProdutoFormData) => {
    const novo = await createProduto(form)
    setProdutos((prev) => [...prev, novo])
  }, [])

  const editarProduto = useCallback(async (id: string, form: ProdutoFormData) => {
    const atualizado = await updateProduto(id, form)
    setProdutos((prev) => prev.map((p) => (p.id === id ? atualizado : p)))
  }, [])

  const removerProduto = useCallback(async (id: string) => {
    await deleteProduto(id)
    setProdutos((prev) => prev.filter((p) => p.id !== id))
  }, [])

  const alternarDisponivel = useCallback(async (id: string, disponivel: boolean) => {
    const atualizado = await toggleDisponibilidade(id, disponivel)
    setProdutos((prev) => prev.map((p) => (p.id === id ? atualizado : p)))
  }, [])

  // ── Categoria actions ──────────────────────────────────────────────────────

  const adicionarCategoria = useCallback(async (nome: string, ordem: number) => {
    const nova = await createCategoria(nome, ordem)
    setCategorias((prev) => [...prev, nova])
  }, [])

  const editarCategoria = useCallback(async (
    id: string, nome: string, ordem: number, ativo: boolean,
  ) => {
    const atualizada = await updateCategoria(id, nome, ordem, ativo)
    setCategorias((prev) => prev.map((c) => (c.id === id ? atualizada : c)))
  }, [])

  const removerCategoria = useCallback(async (id: string) => {
    await deleteCategoria(id)
    setCategorias((prev) => prev.filter((c) => c.id !== id))
  }, [])

  return {
    categorias,
    produtos,
    loading,
    error,
    adicionarProduto,
    editarProduto,
    removerProduto,
    alternarDisponivel,
    adicionarCategoria,
    editarCategoria,
    removerCategoria,
  }
}
