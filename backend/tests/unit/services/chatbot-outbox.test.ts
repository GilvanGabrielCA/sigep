import { describe, it, expect, beforeEach } from 'vitest'

// Reimporta o módulo para garantir estado limpo entre describe blocks
// As funções de outbox são pure state machines em memória
vi.mock('../../../src/db/connection.js', () => ({ pool: { query: vi.fn(), connect: vi.fn() } }))
vi.mock('../../../src/db/produto-queries.js', () => ({ listProdutos: vi.fn() }))
vi.mock('../../../src/db/restaurante-queries.js', () => ({ findRestaurante: vi.fn() }))
vi.mock('../../../src/socket/socket-instance.js', () => ({
  getIo: () => ({ to: vi.fn().mockReturnValue({ emit: vi.fn() }) }),
}))

import {
  enviarNotificacaoCliente,
  consumirOutbox,
} from '../../../src/services/chatbot-service.js'

describe('Outbox do Chatbot', () => {
  beforeEach(() => {
    // Limpa o outbox consumindo qualquer mensagem pendente
    consumirOutbox('rest-test', '+5511999990000')
    consumirOutbox('rest-test', '+5511999990001')
  })

  it('adiciona mensagem ao outbox', () => {
    enviarNotificacaoCliente('rest-test', '+5511999990000', 'Pedido confirmado!')
    const msgs = consumirOutbox('rest-test', '+5511999990000')
    expect(msgs).toContain('Pedido confirmado!')
  })

  it('consumir limpa o outbox', () => {
    enviarNotificacaoCliente('rest-test', '+5511999990000', 'Mensagem A')
    consumirOutbox('rest-test', '+5511999990000')
    const segunda = consumirOutbox('rest-test', '+5511999990000')
    expect(segunda).toHaveLength(0)
  })

  it('acumula múltiplas mensagens para o mesmo cliente', () => {
    enviarNotificacaoCliente('rest-test', '+5511999990000', 'Msg 1')
    enviarNotificacaoCliente('rest-test', '+5511999990000', 'Msg 2')
    enviarNotificacaoCliente('rest-test', '+5511999990000', 'Msg 3')
    const msgs = consumirOutbox('rest-test', '+5511999990000')
    expect(msgs).toHaveLength(3)
    expect(msgs).toEqual(['Msg 1', 'Msg 2', 'Msg 3'])
  })

  it('diferentes clientes têm outboxes independentes', () => {
    enviarNotificacaoCliente('rest-test', '+5511999990000', 'Para cliente A')
    enviarNotificacaoCliente('rest-test', '+5511999990001', 'Para cliente B')
    expect(consumirOutbox('rest-test', '+5511999990000')).toEqual(['Para cliente A'])
    expect(consumirOutbox('rest-test', '+5511999990001')).toEqual(['Para cliente B'])
  })

  it('retorna array vazio quando não há mensagens', () => {
    const msgs = consumirOutbox('rest-test', '+5511900000000')
    expect(msgs).toEqual([])
  })
})
