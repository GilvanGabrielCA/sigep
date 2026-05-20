import { describe, it, expect, vi } from 'vitest'

vi.mock('../src/db/connection.js', () => ({
  pool: { query: vi.fn(), connect: vi.fn() },
}))

vi.mock('../src/db/produto-queries.js', () => ({
  listProdutos: vi.fn(),
}))

vi.mock('../src/db/restaurante-queries.js', () => ({
  findRestaurante: vi.fn(),
}))

vi.mock('../src/socket/socket-instance.js', () => ({
  getIo: vi.fn().mockReturnValue({
    to: vi.fn().mockReturnValue({ emit: vi.fn() }),
  }),
}))

vi.mock('../src/services/lgpd-service.js', () => ({
  verificarConsentimento: vi.fn(),
  registrarConsentimento: vi.fn(),
}))

import {
  enviarNotificacaoCliente,
  consumirOutbox,
} from '../src/services/chatbot-service.js'

const R = 'r-test'

describe('chatbot outbox (fila in-memory)', () => {
  it('consumir fila inexistente retorna array vazio', () => {
    expect(consumirOutbox(R, '+5567000000001')).toEqual([])
  })

  it('mensagem enviada é consumida corretamente', () => {
    enviarNotificacaoCliente(R, '+5567000000002', 'Pedido confirmado!')
    const msgs = consumirOutbox(R, '+5567000000002')
    expect(msgs).toEqual(['Pedido confirmado!'])
  })

  it('múltiplas mensagens são consumidas na ordem de envio', () => {
    enviarNotificacaoCliente(R, '+5567000000003', 'Mensagem 1')
    enviarNotificacaoCliente(R, '+5567000000003', 'Mensagem 2')
    enviarNotificacaoCliente(R, '+5567000000003', 'Mensagem 3')
    expect(consumirOutbox(R, '+5567000000003')).toEqual([
      'Mensagem 1',
      'Mensagem 2',
      'Mensagem 3',
    ])
  })

  it('após consumir, fila é esvaziada', () => {
    enviarNotificacaoCliente(R, '+5567000000004', 'Única')
    consumirOutbox(R, '+5567000000004')
    expect(consumirOutbox(R, '+5567000000004')).toEqual([])
  })

  it('filas de números diferentes são isoladas entre si', () => {
    enviarNotificacaoCliente(R, '+5567000000005', 'Para A')
    enviarNotificacaoCliente(R, '+5567000000006', 'Para B')
    expect(consumirOutbox(R, '+5567000000005')).toEqual(['Para A'])
    expect(consumirOutbox(R, '+5567000000006')).toEqual(['Para B'])
  })

  it('filas de restaurantes diferentes são isoladas entre si', () => {
    enviarNotificacaoCliente('r-1', '+5567000000007', 'Rest 1')
    enviarNotificacaoCliente('r-2', '+5567000000007', 'Rest 2')
    expect(consumirOutbox('r-1', '+5567000000007')).toEqual(['Rest 1'])
    expect(consumirOutbox('r-2', '+5567000000007')).toEqual(['Rest 2'])
  })
})
