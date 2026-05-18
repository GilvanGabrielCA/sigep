import { type Request, type Response, type NextFunction } from 'express'
import {
  getCategorias, addCategoria, editCategoria, removeCategoria,
  getProdutos, addProduto, editProduto, toggleProdutoDisponivel, removeProduto,
} from '../services/cardapio-service.js'
import { audit, getIp } from '../services/audit-service.js'

export async function listCategorias(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    res.json(await getCategorias(req.user!.restauranteId))
  } catch (err) { next(err) }
}

export async function postCategoria(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { nome, ordem = 0 } = req.body as { nome?: string; ordem?: number }
    const cat = await addCategoria(req.user!.restauranteId, nome ?? '', ordem)
    audit({ restauranteId: req.user!.restauranteId, usuarioId: req.user!.userId, entidade: 'categoria', entidadeId: cat.id, operacao: 'CREATE', descricao: `Categoria criada: "${nome}"`, ipAddress: getIp(req) })
    res.status(201).json(cat)
  } catch (err) { next(err) }
}

export async function putCategoria(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { nome, ordem = 0, ativo = true } = req.body as { nome?: string; ordem?: number; ativo?: boolean }
    const cat = await editCategoria(req.params['id']!, req.user!.restauranteId, nome ?? '', ordem, ativo)
    audit({ restauranteId: req.user!.restauranteId, usuarioId: req.user!.userId, entidade: 'categoria', entidadeId: req.params['id'], operacao: 'UPDATE', descricao: `Categoria "${nome}" atualizada`, ipAddress: getIp(req) })
    res.json(cat)
  } catch (err) { next(err) }
}

export async function delCategoria(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await removeCategoria(req.params['id']!, req.user!.restauranteId)
    audit({ restauranteId: req.user!.restauranteId, usuarioId: req.user!.userId, entidade: 'categoria', entidadeId: req.params['id'], operacao: 'DELETE', descricao: 'Categoria excluída', ipAddress: getIp(req) })
    res.status(204).end()
  } catch (err) { next(err) }
}

export async function listProdutos(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    res.json(await getProdutos(req.user!.restauranteId))
  } catch (err) { next(err) }
}

export async function postProduto(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const body = req.body as Record<string, unknown>
    const prod = await addProduto(req.user!.restauranteId, body)
    const preco = typeof body['preco'] === 'number'
      ? `R$ ${(body['preco'] as number).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
      : ''
    audit({ restauranteId: req.user!.restauranteId, usuarioId: req.user!.userId, entidade: 'produto', entidadeId: prod.id, operacao: 'CREATE', descricao: `Produto criado: "${body['nome']}" ${preco}`.trim(), ipAddress: getIp(req) })
    res.status(201).json(prod)
  } catch (err) { next(err) }
}

export async function putProduto(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const body = req.body as Record<string, unknown>
    const prod = await editProduto(req.params['id']!, req.user!.restauranteId, body)
    audit({ restauranteId: req.user!.restauranteId, usuarioId: req.user!.userId, entidade: 'produto', entidadeId: req.params['id'], operacao: 'UPDATE', descricao: `Produto "${body['nome'] ?? prod.nome}" atualizado`, ipAddress: getIp(req) })
    res.json(prod)
  } catch (err) { next(err) }
}

export async function patchDisponibilidade(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { disponivel } = req.body as { disponivel?: boolean }
    if (typeof disponivel !== 'boolean') {
      res.status(400).json({ error: 'Campo disponivel (boolean) é obrigatório' })
      return
    }
    const prod = await toggleProdutoDisponivel(req.params['id']!, req.user!.restauranteId, disponivel)
    audit({ restauranteId: req.user!.restauranteId, usuarioId: req.user!.userId, entidade: 'produto', entidadeId: req.params['id'], operacao: 'TOGGLE', descricao: `Produto "${prod.nome}" ${disponivel ? 'habilitado' : 'desabilitado'} no cardápio`, ipAddress: getIp(req) })
    res.json(prod)
  } catch (err) { next(err) }
}

export async function delProduto(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await removeProduto(req.params['id']!, req.user!.restauranteId)
    audit({ restauranteId: req.user!.restauranteId, usuarioId: req.user!.userId, entidade: 'produto', entidadeId: req.params['id'], operacao: 'DELETE', descricao: 'Produto excluído do cardápio', ipAddress: getIp(req) })
    res.status(204).end()
  } catch (err) { next(err) }
}
