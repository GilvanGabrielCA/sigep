import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('../src/db/pedido-queries.js', () => ({
  listPedidosKanban: vi.fn(),
  findPedidoById: vi.fn(),
  updatePedidoStatusDb: vi.fn(),
}))

import {
  findPedidoById,
  updatePedidoStatusDb,
} from '../src/db/pedido-queries.js'
import {
  getPedidoDetalhe,
  atualizarStatusPedido,
} from '../src/services/pedido-service.js'

const mockPedido = {
  id: 'ped-1',
  restaurante_id: 'r-1',
  status: 'Recebido',
  canal: 'whatsapp',
  total: '42.00',
  observacoes: null,
  criado_em: '2025-01-01T12:00:00.000Z',
  cliente_nome: 'João',
  cliente_telefone: '+5567999999999',
  itens: [],
  historico: [],
}

describe('getPedidoDetalhe', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('lança 404 quando pedido não existe', async () => {
    vi.mocked(findPedidoById).mockResolvedValue(null)
    await expect(getPedidoDetalhe('id-inexistente', 'r-1')).rejects.toMatchObject({
      statusCode: 404,
    })
  })

  it('retorna o pedido quando encontrado', async () => {
    vi.mocked(findPedidoById).mockResolvedValue(mockPedido as any)
    const result = await getPedidoDetalhe('ped-1', 'r-1')
    expect(result).toEqual(mockPedido)
    expect(findPedidoById).toHaveBeenCalledWith('ped-1', 'r-1')
  })
})

describe('atualizarStatusPedido', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('lança 400 para status não reconhecido', async () => {
    await expect(
      atualizarStatusPedido('ped-1', 'r-1', 'StatusInvalido', 'u-1'),
    ).rejects.toMatchObject({ statusCode: 400 })
  })

  it.each([
    ['Recebido'],
    ['Em Preparacao'],
    ['Pronto para Entrega'],
    ['Entregue'],
    ['Cancelado'],
  ])('aceita o status válido "%s"', async (status) => {
    vi.mocked(updatePedidoStatusDb).mockResolvedValue({
      ...mockPedido,
      status,
    } as any)

    const result = await atualizarStatusPedido('ped-1', 'r-1', status, 'u-1')

    expect(result.status).toBe(status)
    expect(updatePedidoStatusDb).toHaveBeenCalledWith('ped-1', 'r-1', status, 'u-1')
  })

  it('não chama o banco quando status é inválido', async () => {
    await atualizarStatusPedido('ped-1', 'r-1', 'Fake', 'u-1').catch(() => null)
    expect(updatePedidoStatusDb).not.toHaveBeenCalled()
  })
})
