import {
  findRestaurante,
  updateRestaurante,
  updateLogoRestaurante,
  type RestauranteRow,
  type RestauranteUpdateInput,
} from '../db/restaurante-queries.js'

export async function getRestaurante(id: string): Promise<RestauranteRow> {
  const r = await findRestaurante(id)
  if (!r) {
    const err: any = new Error('Restaurante não encontrado')
    err.statusCode = 404
    throw err
  }
  return r
}

export async function editRestaurante(
  id: string,
  input: Partial<RestauranteUpdateInput>,
): Promise<RestauranteRow> {
  if (!input.nome?.trim()) {
    const err: any = new Error('Nome é obrigatório')
    err.statusCode = 400
    throw err
  }
  const r = await updateRestaurante(id, {
    nome: input.nome.trim(),
    endereco: input.endereco ?? null,
    telefone: input.telefone ?? null,
    logoUrl: input.logoUrl ?? null,
    dpoNome: input.dpoNome ?? null,
    dpoEmail: input.dpoEmail ?? null,
  })
  if (!r) {
    const err: any = new Error('Restaurante não encontrado')
    err.statusCode = 404
    throw err
  }
  return r
}

export async function editLogoRestaurante(id: string, logoUrl: string): Promise<RestauranteRow> {
  const r = await updateLogoRestaurante(id, logoUrl)
  if (!r) {
    const err: any = new Error('Restaurante não encontrado')
    err.statusCode = 404
    throw err
  }
  return r
}
