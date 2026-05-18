import { Router } from 'express'
import { authMiddleware } from '../middlewares/auth-middleware.js'
import { imageUpload, postUpload } from '../controllers/upload-controller.js'

const router = Router()

router.use(authMiddleware)
router.post('/', imageUpload.single('image'), postUpload)

export default router
