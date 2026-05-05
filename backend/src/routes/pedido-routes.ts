import { Router } from 'express'
import { authMiddleware } from '../middlewares/auth-middleware.js'
import { listPedidos, getPedido, patchStatus } from '../controllers/pedido-controller.js'

const router = Router()

router.use(authMiddleware)

router.get('/', listPedidos)
router.get('/:id', getPedido)
router.patch('/:id/status', patchStatus)

export default router
