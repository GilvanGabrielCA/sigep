import { Router } from 'express'
import { authMiddleware, requireGerente } from '../middlewares/auth-middleware.js'
import {
  listUsuarios,
  postUsuario,
  putUsuario,
  patchUsuarioAtivo,
  patchUsuarioSenha,
} from '../controllers/usuario-controller.js'

const router = Router()

router.use(authMiddleware)

router.get('/', listUsuarios)
router.post('/', requireGerente, postUsuario)
router.put('/:id', requireGerente, putUsuario)
router.patch('/:id/ativo', requireGerente, patchUsuarioAtivo)
router.patch('/:id/senha', requireGerente, patchUsuarioSenha)

export default router
