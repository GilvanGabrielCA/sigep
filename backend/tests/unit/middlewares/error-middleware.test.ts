import { describe, it, expect, vi } from 'vitest'
import type { Request, Response, NextFunction } from 'express'
import { errorMiddleware } from '../../../src/middlewares/error-middleware.js'

function makeRes() {
  const res = { status: vi.fn(), json: vi.fn() } as unknown as Response
  ;(res.status as ReturnType<typeof vi.fn>).mockReturnValue(res)
  return res
}

const req = {} as Request
const next = vi.fn() as unknown as NextFunction

describe('errorMiddleware', () => {
  it('usa statusCode do erro quando fornecido', () => {
    const res = makeRes()
    const err = Object.assign(new Error('Não encontrado'), { statusCode: 404 })
    errorMiddleware(err, req, res, next)
    expect((res.status as ReturnType<typeof vi.fn>).mock.calls[0]?.[0]).toBe(404)
  })

  it('usa 500 quando o erro não tem statusCode', () => {
    const res = makeRes()
    errorMiddleware(new Error('Erro genérico'), req, res, next)
    expect((res.status as ReturnType<typeof vi.fn>).mock.calls[0]?.[0]).toBe(500)
  })

  it('inclui a mensagem do erro no corpo da resposta', () => {
    const res = makeRes()
    const err = Object.assign(new Error('Credenciais inválidas'), { statusCode: 401 })
    errorMiddleware(err, req, res, next)
    expect((res.json as ReturnType<typeof vi.fn>).mock.calls[0]?.[0]).toEqual({
      error: 'Credenciais inválidas',
    })
  })

  it('retorna mensagem padrão quando err.message está ausente', () => {
    const res = makeRes()
    const err = Object.assign(new Error(''), { statusCode: 500 })
    err.message = ''
    errorMiddleware(err, req, res, next)
    const body = (res.json as ReturnType<typeof vi.fn>).mock.calls[0]?.[0] as { error: string }
    expect(typeof body.error).toBe('string')
  })
})
