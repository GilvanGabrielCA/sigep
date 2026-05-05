import { Router } from 'express'
import { authMiddleware, requireGerente } from '../middlewares/auth-middleware.js'
import { getIntegracoes, patchIntegracao, postMensagem, getOutbox } from '../controllers/chatbot-controller.js'

const router = Router()

router.use(authMiddleware)

router.get('/integracoes', getIntegracoes)
router.patch('/integracoes/:id', requireGerente, patchIntegracao)
router.post('/chatbot/mensagem', postMensagem)
router.get('/chatbot/outbox', getOutbox)

export default router
