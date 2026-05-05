import {
  listCategorias,
  createCategoria,
  updateCategoria,
  deleteCategoria,
  type CategoriaRow,
} from '../db/categoria-queries.js'
import {
  listProdutos,
  createProduto,
  updateProduto,
  toggleDisponibilidade,
  deleteProduto,
  type ProdutoRow,
  type ProdutoInput,
} from '../db/produto-queries.js'

// ─── Categorias ───────────────────────────────────────────────────────────────

export async function getCategorias(restauranteId: string): Promise<CategoriaRow[]> {
  return listCategorias(restauranteId)
}

export async function addCategoria(
  restauranteId: string,
  nome: string,
  ordem: number,
): Promise<CategoriaRow> {
  if (!nome.trim()) throw Object.assign(new Error('Nome é obrigatório'), { statusCode: 400 })
  return createCategoria(restauranteId, nome.trim(), ordem)
}

export async function editCategoria(
  id: string,
  restauranteId: string,
  nome: string,
  ordem: number,
  ativo: boolean,
): Promise<CategoriaRow> {
  if (!nome.trim()) throw Object.assign(new Error('Nome é obrigatório'), { statusCode: 400 })
  const cat = await updateCategoria(id, restauranteId, nome.trim(), ordem, ativo)
  if (!cat) throw Object.assign(new Error('Categoria não encontrada'), { statusCode: 404 })
  return cat
}

export async function removeCategoria(id: string, restauranteId: string): Promise<void> {
  const deleted = await deleteCategoria(id, restauranteId)
  if (!deleted) throw Object.assign(new Error('Categoria não encontrada'), { statusCode: 404 })
}

// ─── Produtos ─────────────────────────────────────────────────────────────────

export async function getProdutos(restauranteId: string): Promise<ProdutoRow[]> {
  return listProdutos(restauranteId)
}

export async function addProduto(
  restauranteId: string,
  body: Partial<ProdutoInput>,
): Promise<ProdutoRow> {
  if (!body.nome?.trim()) throw Object.assign(new Error('Nome é obrigatório'), { statusCode: 400 })
  if (!body.preco || body.preco <= 0) throw Object.assign(new Error('Preço inválido'), { statusCode: 400 })
  return createProduto({
    restauranteId,
    categoriaId: body.categoriaId ?? null,
    nome: body.nome.trim(),
    descricao: body.descricao ?? null,
    preco: body.preco,
    imagemUrl: body.imagemUrl ?? null,
    disponivel: body.disponivel ?? true,
  })
}

export async function editProduto(
  id: string,
  restauranteId: string,
  body: Partial<ProdutoInput>,
): Promise<ProdutoRow> {
  if (!body.nome?.trim()) throw Object.assign(new Error('Nome é obrigatório'), { statusCode: 400 })
  if (!body.preco || body.preco <= 0) throw Object.assign(new Error('Preço inválido'), { statusCode: 400 })
  const prod = await updateProduto(id, restauranteId, {
    categoriaId: body.categoriaId ?? null,
    nome: body.nome.trim(),
    descricao: body.descricao ?? null,
    preco: body.preco,
    imagemUrl: body.imagemUrl ?? null,
    disponivel: body.disponivel ?? true,
  })
  if (!prod) throw Object.assign(new Error('Produto não encontrado'), { statusCode: 404 })
  return prod
}

export async function toggleProdutoDisponivel(
  id: string,
  restauranteId: string,
  disponivel: boolean,
): Promise<ProdutoRow> {
  const prod = await toggleDisponibilidade(id, restauranteId, disponivel)
  if (!prod) throw Object.assign(new Error('Produto não encontrado'), { statusCode: 404 })
  return prod
}

export async function removeProduto(id: string, restauranteId: string): Promise<void> {
  try {
    const deleted = await deleteProduto(id, restauranteId)
    if (!deleted) throw Object.assign(new Error('Produto não encontrado'), { statusCode: 404 })
  } catch (err: unknown) {
    const pgErr = err as { code?: string }
    if (pgErr.code === '23503') {
      throw Object.assign(
        new Error('Produto possui pedidos associados e não pode ser excluído'),
        { statusCode: 409 },
      )
    }
    throw err
  }
}
