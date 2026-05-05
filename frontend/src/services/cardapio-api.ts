import { api } from './api'
import type { Categoria, Produto, ProdutoFormData } from '../types/cardapio'

// ─── Categorias ───────────────────────────────────────────────────────────────

export async function fetchCategorias(): Promise<Categoria[]> {
  const { data } = await api.get<Categoria[]>('/api/cardapio/categorias')
  return data
}

export async function createCategoria(nome: string, ordem: number): Promise<Categoria> {
  const { data } = await api.post<Categoria>('/api/cardapio/categorias', { nome, ordem })
  return data
}

export async function updateCategoria(
  id: string,
  nome: string,
  ordem: number,
  ativo: boolean,
): Promise<Categoria> {
  const { data } = await api.put<Categoria>(`/api/cardapio/categorias/${id}`, { nome, ordem, ativo })
  return data
}

export async function deleteCategoria(id: string): Promise<void> {
  await api.delete(`/api/cardapio/categorias/${id}`)
}

// ─── Produtos ─────────────────────────────────────────────────────────────────

export async function fetchProdutos(): Promise<Produto[]> {
  const { data } = await api.get<Produto[]>('/api/cardapio/produtos')
  return data
}

export async function createProduto(form: ProdutoFormData): Promise<Produto> {
  const { data } = await api.post<Produto>('/api/cardapio/produtos', {
    categoriaId: form.categoriaId,
    nome: form.nome,
    descricao: form.descricao || null,
    preco: form.preco,
    imagemUrl: form.imagemUrl || null,
    disponivel: form.disponivel,
  })
  return data
}

export async function updateProduto(id: string, form: ProdutoFormData): Promise<Produto> {
  const { data } = await api.put<Produto>(`/api/cardapio/produtos/${id}`, {
    categoriaId: form.categoriaId,
    nome: form.nome,
    descricao: form.descricao || null,
    preco: form.preco,
    imagemUrl: form.imagemUrl || null,
    disponivel: form.disponivel,
  })
  return data
}

export async function toggleDisponibilidade(id: string, disponivel: boolean): Promise<Produto> {
  const { data } = await api.patch<Produto>(`/api/cardapio/produtos/${id}/disponibilidade`, { disponivel })
  return data
}

export async function deleteProduto(id: string): Promise<void> {
  await api.delete(`/api/cardapio/produtos/${id}`)
}
