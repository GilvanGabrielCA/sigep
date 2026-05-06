import {
  findRestaurante,
  updateRestaurante,
  updateLogoRestaurante,
  type RestauranteRow,
  type RestauranteUpdateInput,
} from '../db/restaurante-queries.js'

export async function getRestaurante(id: string): Promise<RestauranteRow> {
  const r = await findRestaurante(id)
  if (!r) throw Object.assign(new Error('Restaurante não encontrado'), { statusCode: 404 })
  return r
}

export async function editRestaurante(
  id: string,
  input: Partial<RestauranteUpdateInput>,
): Promise<RestauranteRow> {
  if (!input.nome?.trim()) {
    throw Object.assign(new Error('Nome é obrigatório'), { statusCode: 400 })
  }
  const r = await updateRestaurante(id, {
    nome: input.nome.trim(),
    endereco: input.endereco ?? null,
    telefone: input.telefone ?? null,
    logoUrl: input.logoUrl ?? null,
  })
  if (!r) throw Object.assign(new Error('Restaurante não encontrado'), { statusCode: 404 })
  return r
}

export async function editLogoRestaurante(id: string, logoUrl: string): Promise<RestauranteRow> {
  const r = await updateLogoRestaurante(id, logoUrl)
  if (!r) throw Object.assign(new Error('Restaurante não encontrado'), { statusCode: 404 })
  return r
}
