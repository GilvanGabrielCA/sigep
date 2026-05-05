import { Router } from 'express'
import { authMiddleware, requireGerente } from '../middlewares/auth-middleware.js'
import { listRelatorios } from '../controllers/relatorio-controller.js'

const router = Router()

router.use(authMiddleware, requireGerente)

router.get('/', listRelatorios)

export default router
