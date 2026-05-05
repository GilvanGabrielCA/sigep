import { pool } from './connection.js'

export interface ProdutoRow {
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

export interface ProdutoInput {
  restauranteId: string
  categoriaId: string | null
  nome: string
  descricao: string | null
  preco: number
  imagemUrl: string | null
  disponivel: boolean
}

export async function listProdutos(restauranteId: string): Promise<ProdutoRow[]> {
  const { rows } = await pool.query<ProdutoRow>(
    `SELECT
       p.id, p.categoria_id, c.nome AS categoria_nome,
       p.nome, p.descricao, p.preco::text, p.imagem_url, p.disponivel,
       p.criado_em::text
     FROM tb_produto p
     LEFT JOIN tb_categoria c ON c.id = p.categoria_id
     WHERE p.restaurante_id = $1
     ORDER BY c.ordem ASC NULLS LAST, c.nome ASC NULLS LAST, p.nome ASC`,
    [restauranteId],
  )
  return rows
}

export async function createProduto(input: ProdutoInput): Promise<ProdutoRow> {
  const { rows } = await pool.query<ProdutoRow>(
    `WITH ins AS (
       INSERT INTO tb_produto (restaurante_id, categoria_id, nome, descricao, preco, imagem_url, disponivel)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *
     )
     SELECT
       ins.id, ins.categoria_id, c.nome AS categoria_nome,
       ins.nome, ins.descricao, ins.preco::text, ins.imagem_url, ins.disponivel,
       ins.criado_em::text
     FROM ins
     LEFT JOIN tb_categoria c ON c.id = ins.categoria_id`,
    [
      input.restauranteId,
      input.categoriaId,
      input.nome,
      input.descricao,
      input.preco,
      input.imagemUrl,
      input.disponivel,
    ],
  )
  return rows[0]!
}

export async function updateProduto(
  id: string,
  restauranteId: string,
  input: Omit<ProdutoInput, 'restauranteId'>,
): Promise<ProdutoRow | null> {
  const { rows } = await pool.query<ProdutoRow>(
    `WITH upd AS (
       UPDATE tb_produto
       SET categoria_id = $1, nome = $2, descricao = $3, preco = $4, imagem_url = $5, disponivel = $6
       WHERE id = $7 AND restaurante_id = $8
       RETURNING *
     )
     SELECT
       upd.id, upd.categoria_id, c.nome AS categoria_nome,
       upd.nome, upd.descricao, upd.preco::text, upd.imagem_url, upd.disponivel,
       upd.criado_em::text
     FROM upd
     LEFT JOIN tb_categoria c ON c.id = upd.categoria_id`,
    [
      input.categoriaId,
      input.nome,
      input.descricao,
      input.preco,
      input.imagemUrl,
      input.disponivel,
      id,
      restauranteId,
    ],
  )
  return rows[0] ?? null
}

export async function toggleDisponibilidade(
  id: string,
  restauranteId: string,
  disponivel: boolean,
): Promise<ProdutoRow | null> {
  const { rows } = await pool.query<ProdutoRow>(
    `WITH upd AS (
       UPDATE tb_produto SET disponivel = $1
       WHERE id = $2 AND restaurante_id = $3
       RETURNING *
     )
     SELECT
       upd.id, upd.categoria_id, c.nome AS categoria_nome,
       upd.nome, upd.descricao, upd.preco::text, upd.imagem_url, upd.disponivel,
       upd.criado_em::text
     FROM upd
     LEFT JOIN tb_categoria c ON c.id = upd.categoria_id`,
    [disponivel, id, restauranteId],
  )
  return rows[0] ?? null
}

export async function deleteProduto(id: string, restauranteId: string): Promise<boolean> {
  const { rowCount } = await pool.query(
    `DELETE FROM tb_produto WHERE id = $1 AND restaurante_id = $2`,
    [id, restauranteId],
  )
  return (rowCount ?? 0) > 0
}
