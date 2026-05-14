import { Router } from 'express'
import { authMiddleware, requireGerente } from '../middlewares/auth-middleware.js'
import {
  getPrivacidade,
  postSolicitacao,
  getSolicitacoesHandler,
  patchSolicitacao,
  getAuditoriaHandler,
  postAnonimizar,
  getMeusDados,
  getConsentimentosHandler,
} from '../controllers/lgpd-controller.js'

const router = Router()

// Pública — qualquer pessoa pode ver a política de privacidade
router.get('/privacidade', getPrivacidade)

// Autenticadas — qualquer usuário logado
router.use(authMiddleware)
router.post('/solicitacao', postSolicitacao)
router.get('/meus-dados', getMeusDados)

// Gerente apenas
router.use(requireGerente)
router.get('/solicitacoes', getSolicitacoesHandler)
router.patch('/solicitacoes/:id', patchSolicitacao)
router.get('/auditoria', getAuditoriaHandler)
router.post('/anonimizar', postAnonimizar)
router.get('/consentimentos', getConsentimentosHandler)

export default router
