import { api } from './api'
import type { Restaurante, RestauranteFormData } from '../types/restaurante'

export async function fetchRestaurante(): Promise<Restaurante> {
  const { data } = await api.get<Restaurante>('/api/restaurante')
  return data
}

export async function updateRestaurante(form: RestauranteFormData): Promise<Restaurante> {
  const { data } = await api.put<Restaurante>('/api/restaurante', {
    nome:     form.nome,
    endereco: form.endereco || null,
    telefone: form.telefone || null,
    logoUrl:  form.logoUrl  || null,
  })
  return data
}
