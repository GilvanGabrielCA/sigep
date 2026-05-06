import { Router } from 'express'
import {
  loginController,
  forgotPasswordController,
  validateResetTokenController,
  resetPasswordController,
} from '../controllers/auth-controller.js'

const router = Router()

router.post('/login', loginController)
router.post('/forgot-password', forgotPasswordController)
router.get('/reset-password/:token', validateResetTokenController)
router.post('/reset-password', resetPasswordController)

export default router
