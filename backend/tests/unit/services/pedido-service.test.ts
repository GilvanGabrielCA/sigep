import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('../../../src/db/pedido-queries.js')

import {
  getPedidoDetalhe,
  atualizarStatusPedido,
} from '../../../src/services/pedido-service.js'
import * as pedidoQueries from '../../../src/db/pedido-queries.js'

const PEDIDO_FAKE = {
  id: 'pedido-uuid-1',
  restaurante_id: 'rest-uuid-1',
  status: 'Recebido',
  canal: 'interno',
  total: '45.90',
  observacoes: null,
  criado_em: new Date().toISOString(),
  cliente_nome: 'Cliente Teste',
  cliente_telefone: null,
  itens: [],
  historico: [],
} as unknown as Awaited<ReturnType<typeof pedidoQueries.findPedidoById>>

beforeEach(() => vi.clearAllMocks())

describe('getPedidoDetalhe()', () => {
  it('retorna o pedido quando encontrado', async () => {
    vi.mocked(pedidoQueries.findPedidoById).mockResolvedValue(PEDIDO_FAKE)
    const resultado = await getPedidoDetalhe('pedido-uuid-1', 'rest-uuid-1')
    expect(resultado.id).toBe('pedido-uuid-1')
  })

  it('lança erro 404 quando pedido não existe', async () => {
    vi.mocked(pedidoQueries.findPedidoById).mockResolvedValue(null)
    await expect(getPedidoDetalhe('id-inexistente', 'rest-uuid-1')).rejects.toMatchObject({
      statusCode: 404,
      message: expect.stringContaining('não encontrado'),
    })
  })
})

describe('atualizarStatusPedido()', () => {
  it('lança erro 400 para status inválido', async () => {
    await expect(
      atualizarStatusPedido('pedido-1', 'rest-1', 'StatusInexistente', 'user-1'),
    ).rejects.toMatchObject({ statusCode: 400 })
  })

  it('chama a query do banco para cada status válido', async () => {
    const STATUS_VALIDOS = ['Recebido', 'Em Preparacao', 'Pronto para Entrega', 'Entregue', 'Cancelado']
    vi.mocked(pedidoQueries.updatePedidoStatusDb).mockResolvedValue(PEDIDO_FAKE as never)

    for (const status of STATUS_VALIDOS) {
      await atualizarStatusPedido('pedido-1', 'rest-1', status, 'user-1')
    }

    expect(pedidoQueries.updatePedidoStatusDb).toHaveBeenCalledTimes(STATUS_VALIDOS.length)
  })

  it('passa os parâmetros corretamente para a query', async () => {
    vi.mocked(pedidoQueries.updatePedidoStatusDb).mockResolvedValue(PEDIDO_FAKE as never)
    await atualizarStatusPedido('pedido-abc', 'rest-xyz', 'Entregue', 'user-def')
    expect(pedidoQueries.updatePedidoStatusDb).toHaveBeenCalledWith(
      'pedido-abc',
      'rest-xyz',
      'Entregue',
      'user-def',
    )
  })
})
