import { Router } from 'express'
import { authMiddleware, requireGerente } from '../middlewares/auth-middleware.js'
import { getConfig, putConfig, postLogo, logoUpload } from '../controllers/restaurante-controller.js'

const router = Router()

router.use(authMiddleware)

router.get('/', getConfig)
router.put('/', requireGerente, putConfig)
router.post('/logo', requireGerente, logoUpload.single('logo'), postLogo)

export default router
