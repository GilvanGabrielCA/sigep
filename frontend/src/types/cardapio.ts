export interface Categoria {
  id: string
  nome: string
  ordem: number
  ativo: boolean
}

export interface Produto {
  id: string
  categoria_id: string | null
  categoria_nome: string | null
  nome: string
  descricao: string | null
  preco: string
  imagem_url: string | null
  disponivel: boolean
  criado_em: string
}

export interface ProdutoFormData {
  categoriaId: string | null
  nome: string
  descricao: string
  preco: number
  imagemUrl: string
  disponivel: boolean
}
