import { Router } from 'express'
import { authMiddleware, requireGerente } from '../middlewares/auth-middleware.js'
import {
  listCategorias, postCategoria, putCategoria, delCategoria,
  listProdutos, postProduto, putProduto, patchDisponibilidade, delProduto,
} from '../controllers/cardapio-controller.js'

const router = Router()

router.use(authMiddleware)

// Categorias — write operations restricted to gerente
router.get('/categorias', listCategorias)
router.post('/categorias', requireGerente, postCategoria)
router.put('/categorias/:id', requireGerente, putCategoria)
router.delete('/categorias/:id', requireGerente, delCategoria)

// Produtos — write operations restricted to gerente
router.get('/produtos', listProdutos)
router.post('/produtos', requireGerente, postProduto)
router.put('/produtos/:id', requireGerente, putProduto)
router.patch('/produtos/:id/disponibilidade', requireGerente, patchDisponibilidade)
router.delete('/produtos/:id', requireGerente, delProduto)

export default router
