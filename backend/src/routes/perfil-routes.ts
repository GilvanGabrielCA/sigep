import { Router } from 'express'
import { authMiddleware } from '../middlewares/auth-middleware.js'
import { getMe, putMe, putMeSenha, postMeFoto, fotoUpload } from '../controllers/perfil-controller.js'

const router = Router()

router.use(authMiddleware)

router.get('/', getMe)
router.put('/', putMe)
router.put('/senha', putMeSenha)
router.post('/foto', fotoUpload.single('foto'), postMeFoto)

export default router
