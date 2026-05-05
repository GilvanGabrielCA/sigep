export interface Restaurante {
  id: string
  nome: string
  endereco: string | null
  telefone: string | null
  logo_url: string | null
  criado_em: string
}

export interface RestauranteFormData {
  nome: string
  endereco: string
  telefone: string
  logoUrl: string
}
