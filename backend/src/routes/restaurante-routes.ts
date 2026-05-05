import { Router } from 'express'
import { authMiddleware, requireGerente } from '../middlewares/auth-middleware.js'
import { getConfig, putConfig } from '../controllers/restaurante-controller.js'

const router = Router()

router.use(authMiddleware)

router.get('/', getConfig)
router.put('/', requireGerente, putConfig)

export default router
