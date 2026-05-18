import { Router } from 'express'
import { authMiddleware } from '../middlewares/auth-middleware.js'
import { getHistorico } from '../controllers/historico-controller.js'

const router = Router()

router.use(authMiddleware)
router.get('/', getHistorico)

export default router
