import { Router } from 'express'
import { authMiddleware, requireSuperAdmin } from '../middlewares/auth-middleware.js'
import { getStats, getLogs, getUsuarios } from '../controllers/superadmin-controller.js'

const router = Router()

router.use(authMiddleware)
router.use(requireSuperAdmin)

router.get('/stats', getStats)
router.get('/logs', getLogs)
router.get('/usuarios', getUsuarios)

export default router
