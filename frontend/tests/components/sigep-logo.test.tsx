import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { SigepMark, SigepWatermark } from '../../src/components/sigep-logo'

describe('SigepMark', () => {
  it('renderiza sem erros', () => {
    const { container } = render(<SigepMark />)
    expect(container.querySelector('svg')).toBeTruthy()
  })

  it('possui aria-hidden para acessibilidade', () => {
    const { container } = render(<SigepMark />)
    expect(container.querySelector('svg')?.getAttribute('aria-hidden')).toBe('true')
  })

  it('aplica o tamanho passado via prop', () => {
    const { container } = render(<SigepMark size={32} />)
    const svg = container.querySelector('svg')
    expect(svg?.getAttribute('width')).toBe('32')
    expect(svg?.getAttribute('height')).toBe('32')
  })

  it('renderiza as três barras do Kanban (3 rects)', () => {
    const { container } = render(<SigepMark />)
    const rects = container.querySelectorAll('rect')
    expect(rects).toHaveLength(3)
  })
})

describe('SigepWatermark', () => {
  it('renderiza sem erros', () => {
    const { container } = render(<SigepWatermark />)
    expect(container.querySelector('svg')).toBeTruthy()
  })

  it('aplica tamanho personalizado', () => {
    const { container } = render(<SigepWatermark size={200} />)
    const svg = container.querySelector('svg')
    expect(svg?.getAttribute('width')).toBe('200')
  })
})
