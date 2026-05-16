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

export async function getCategorias(restauranteId: string): Promise<CategoriaRow[]> {
  return listCategorias(restauranteId)
}

export async function addCategoria(
  restauranteId: string,
  nome: string,
  ordem: number,
): Promise<CategoriaRow> {
  if (!nome.trim()) {
    const err: any = new Error('Nome é obrigatório')
    err.statusCode = 400
    throw err
  }
  return createCategoria(restauranteId, nome.trim(), ordem)
}

export async function editCategoria(
  id: string,
  restauranteId: string,
  nome: string,
  ordem: number,
  ativo: boolean,
): Promise<CategoriaRow> {
  if (!nome.trim()) {
    const err: any = new Error('Nome é obrigatório')
    err.statusCode = 400
    throw err
  }
  const cat = await updateCategoria(id, restauranteId, nome.trim(), ordem, ativo)
  if (!cat) {
    const err: any = new Error('Categoria não encontrada')
    err.statusCode = 404
    throw err
  }
  return cat
}

export async function removeCategoria(id: string, restauranteId: string): Promise<void> {
  const deleted = await deleteCategoria(id, restauranteId)
  if (!deleted) {
    const err: any = new Error('Categoria não encontrada')
    err.statusCode = 404
    throw err
  }
}

export async function getProdutos(restauranteId: string): Promise<ProdutoRow[]> {
  return listProdutos(restauranteId)
}

export async function addProduto(
  restauranteId: string,
  body: Partial<ProdutoInput>,
): Promise<ProdutoRow> {
  if (!body.nome?.trim()) {
    const err: any = new Error('Nome é obrigatório')
    err.statusCode = 400
    throw err
  }
  if (!body.preco || body.preco <= 0) {
    const err: any = new Error('Preço inválido')
    err.statusCode = 400
    throw err
  }
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
  if (!body.nome?.trim()) {
    const err: any = new Error('Nome é obrigatório')
    err.statusCode = 400
    throw err
  }
  if (!body.preco || body.preco <= 0) {
    const err: any = new Error('Preço inválido')
    err.statusCode = 400
    throw err
  }
  const prod = await updateProduto(id, restauranteId, {
    categoriaId: body.categoriaId ?? null,
    nome: body.nome.trim(),
    descricao: body.descricao ?? null,
    preco: body.preco,
    imagemUrl: body.imagemUrl ?? null,
    disponivel: body.disponivel ?? true,
  })
  if (!prod) {
    const err: any = new Error('Produto não encontrado')
    err.statusCode = 404
    throw err
  }
  return prod
}

export async function toggleProdutoDisponivel(
  id: string,
  restauranteId: string,
  disponivel: boolean,
): Promise<ProdutoRow> {
  const prod = await toggleDisponibilidade(id, restauranteId, disponivel)
  if (!prod) {
    const err: any = new Error('Produto não encontrado')
    err.statusCode = 404
    throw err
  }
  return prod
}

export async function removeProduto(id: string, restauranteId: string): Promise<void> {
  try {
    const deleted = await deleteProduto(id, restauranteId)
    if (!deleted) {
      const err: any = new Error('Produto não encontrado')
      err.statusCode = 404
      throw err
    }
  } catch (err: unknown) {
    const pgErr = err as { code?: string }
    if (pgErr.code === '23503') {
      const e: any = new Error('Produto possui pedidos associados e não pode ser excluído')
      e.statusCode = 409
      throw e
    }
    throw err
  }
}
