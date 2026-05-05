import { type Request, type Response, type NextFunction } from 'express'
import {
  getCategorias, addCategoria, editCategoria, removeCategoria,
  getProdutos, addProduto, editProduto, toggleProdutoDisponivel, removeProduto,
} from '../services/cardapio-service.js'

// ─── Categorias ───────────────────────────────────────────────────────────────

export async function listCategorias(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    res.json(await getCategorias(req.user!.restauranteId))
  } catch (err) { next(err) }
}

export async function postCategoria(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { nome, ordem = 0 } = req.body as { nome?: string; ordem?: number }
    res.status(201).json(await addCategoria(req.user!.restauranteId, nome ?? '', ordem))
  } catch (err) { next(err) }
}

export async function putCategoria(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { nome, ordem = 0, ativo = true } = req.body as { nome?: string; ordem?: number; ativo?: boolean }
    res.json(await editCategoria(req.params['id']!, req.user!.restauranteId, nome ?? '', ordem, ativo))
  } catch (err) { next(err) }
}

export async function delCategoria(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await removeCategoria(req.params['id']!, req.user!.restauranteId)
    res.status(204).end()
  } catch (err) { next(err) }
}

// ─── Produtos ─────────────────────────────────────────────────────────────────

export async function listProdutos(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    res.json(await getProdutos(req.user!.restauranteId))
  } catch (err) { next(err) }
}

export async function postProduto(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    res.status(201).json(await addProduto(req.user!.restauranteId, req.body as Record<string, unknown>))
  } catch (err) { next(err) }
}

export async function putProduto(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    res.json(await editProduto(req.params['id']!, req.user!.restauranteId, req.body as Record<string, unknown>))
  } catch (err) { next(err) }
}

export async function patchDisponibilidade(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { disponivel } = req.body as { disponivel?: boolean }
    if (typeof disponivel !== 'boolean') {
      res.status(400).json({ error: 'Campo disponivel (boolean) é obrigatório' })
      return
    }
    res.json(await toggleProdutoDisponivel(req.params['id']!, req.user!.restauranteId, disponivel))
  } catch (err) { next(err) }
}

export async function delProduto(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await removeProduto(req.params['id']!, req.user!.restauranteId)
    res.status(204).end()
  } catch (err) { next(err) }
}
