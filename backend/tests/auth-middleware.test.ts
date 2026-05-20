import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('jsonwebtoken', () => ({
  default: { verify: vi.fn() },
}))

import jwt from 'jsonwebtoken'
import {
  authMiddleware,
  requireGerente,
  requireSuperAdmin,
} from '../src/middlewares/auth-middleware.js'

function makeReq(authorization?: string, user?: object) {
  return { headers: authorization ? { authorization } : {}, user } as any
}

function makeRes() {
  const res: any = { json: vi.fn() }
  res.status = vi.fn().mockReturnValue(res)
  return res
}

describe('authMiddleware', () => {
  const next = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('retorna 401 quando header Authorization está ausente', () => {
    authMiddleware(makeReq(), makeRes(), next)
    expect(next).not.toHaveBeenCalled()
  })

  it('retorna 401 quando header não começa com Bearer', () => {
    const res = makeRes()
    authMiddleware(makeReq('Basic abc123'), res, next)
    expect(res.status).toHaveBeenCalledWith(401)
    expect(next).not.toHaveBeenCalled()
  })

  it('retorna 401 quando token é inválido', () => {
    vi.mocked(jwt.verify).mockImplementation(() => {
      throw new Error('invalid signature')
    })
    const res = makeRes()
    authMiddleware(makeReq('Bearer token-invalido'), res, next)
    expect(res.status).toHaveBeenCalledWith(401)
    expect(next).not.toHaveBeenCalled()
  })

  it('define req.user e chama next() quando token é válido', () => {
    const payload = {
      userId: 'u-1',
      restauranteId: 'r-1',
      nome: 'Teste',
      perfil: 'gerente',
    }
    vi.mocked(jwt.verify).mockReturnValue(payload as any)
    const req = makeReq('Bearer token-valido')
    authMiddleware(req, makeRes(), next)
    expect(req.user).toEqual(payload)
    expect(next).toHaveBeenCalledOnce()
  })
})

describe('requireGerente', () => {
  const next = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('permite acesso para perfil gerente', () => {
    requireGerente(makeReq(undefined, { perfil: 'gerente' }), makeRes(), next)
    expect(next).toHaveBeenCalledOnce()
  })

  it('permite acesso para perfil superadmin', () => {
    requireGerente(makeReq(undefined, { perfil: 'superadmin' }), makeRes(), next)
    expect(next).toHaveBeenCalledOnce()
  })

  it('retorna 403 para perfil atendente', () => {
    const res = makeRes()
    requireGerente(makeReq(undefined, { perfil: 'atendente' }), res, next)
    expect(res.status).toHaveBeenCalledWith(403)
    expect(next).not.toHaveBeenCalled()
  })

  it('retorna 403 quando user é undefined', () => {
    const res = makeRes()
    requireGerente(makeReq(), res, next)
    expect(res.status).toHaveBeenCalledWith(403)
    expect(next).not.toHaveBeenCalled()
  })
})

describe('requireSuperAdmin', () => {
  const next = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('permite acesso para perfil superadmin', () => {
    requireSuperAdmin(makeReq(undefined, { perfil: 'superadmin' }), makeRes(), next)
    expect(next).toHaveBeenCalledOnce()
  })

  it('retorna 403 para perfil gerente', () => {
    const res = makeRes()
    requireSuperAdmin(makeReq(undefined, { perfil: 'gerente' }), res, next)
    expect(res.status).toHaveBeenCalledWith(403)
    expect(next).not.toHaveBeenCalled()
  })

  it('retorna 403 para perfil atendente', () => {
    const res = makeRes()
    requireSuperAdmin(makeReq(undefined, { perfil: 'atendente' }), res, next)
    expect(res.status).toHaveBeenCalledWith(403)
    expect(next).not.toHaveBeenCalled()
  })
})
