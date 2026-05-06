import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { authMiddleware, requireGerente } from '../../../src/middlewares/auth-middleware.js'
import type { JwtPayload } from '../../../src/types/jwt-payload.js'

const JWT_SECRET = process.env['JWT_SECRET']!

function makeReq(authorization?: string): Request {
  return { headers: { authorization } } as unknown as Request
}

function makeRes() {
  const res = { status: vi.fn(), json: vi.fn() } as unknown as Response
  ;(res.status as ReturnType<typeof vi.fn>).mockReturnValue(res)
  return res
}

const next = vi.fn() as unknown as NextFunction

const PAYLOAD: JwtPayload = {
  userId: 'user-1',
  restauranteId: 'rest-1',
  nome: 'Admin Teste',
  perfil: 'gerente',
}

function tokenValido(): string {
  return jwt.sign(PAYLOAD, JWT_SECRET, { expiresIn: '1h' })
}

describe('authMiddleware', () => {
  beforeEach(() => vi.clearAllMocks())

  it('retorna 401 quando Authorization está ausente', () => {
    authMiddleware(makeReq(undefined), makeRes(), next)
    const res = makeRes()
    authMiddleware(makeReq(undefined), res, next)
    expect((res.status as ReturnType<typeof vi.fn>).mock.calls[0]?.[0]).toBe(401)
  })

  it('retorna 401 quando Authorization não começa com Bearer', () => {
    const res = makeRes()
    authMiddleware(makeReq('Basic abc123'), res, next)
    expect((res.status as ReturnType<typeof vi.fn>).mock.calls[0]?.[0]).toBe(401)
  })

  it('retorna 401 com token malformado', () => {
    const res = makeRes()
    authMiddleware(makeReq('Bearer token_invalido'), res, next)
    expect((res.status as ReturnType<typeof vi.fn>).mock.calls[0]?.[0]).toBe(401)
  })

  it('retorna 401 com token expirado', () => {
    const tokenExpirado = jwt.sign(PAYLOAD, JWT_SECRET, { expiresIn: '-1s' })
    const res = makeRes()
    authMiddleware(makeReq(`Bearer ${tokenExpirado}`), res, next)
    expect((res.status as ReturnType<typeof vi.fn>).mock.calls[0]?.[0]).toBe(401)
  })

  it('chama next() e popula req.user com token válido', () => {
    const req = makeReq(`Bearer ${tokenValido()}`) as Request & { user?: JwtPayload }
    authMiddleware(req, makeRes(), next)
    expect(next).toHaveBeenCalledOnce()
    expect(req.user?.userId).toBe(PAYLOAD.userId)
    expect(req.user?.perfil).toBe('gerente')
  })
})

describe('requireGerente', () => {
  beforeEach(() => vi.clearAllMocks())

  it('chama next() quando perfil é gerente', () => {
    const req = { user: { ...PAYLOAD, perfil: 'gerente' } } as unknown as Request
    requireGerente(req, makeRes(), next)
    expect(next).toHaveBeenCalledOnce()
  })

  it('retorna 403 quando perfil é atendente', () => {
    const res = makeRes()
    const req = { user: { ...PAYLOAD, perfil: 'atendente' } } as unknown as Request
    requireGerente(req, res, next)
    expect((res.status as ReturnType<typeof vi.fn>).mock.calls[0]?.[0]).toBe(403)
    expect(next).not.toHaveBeenCalled()
  })

  it('retorna 403 quando req.user não está definido', () => {
    const res = makeRes()
    const req = {} as Request
    requireGerente(req, res, next)
    expect((res.status as ReturnType<typeof vi.fn>).mock.calls[0]?.[0]).toBe(403)
  })
})
