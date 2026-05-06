import '@testing-library/jest-dom'

// Silencia warnings do React nos testes
import { vi } from 'vitest'

// Mock global do localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => { store[key] = value },
    removeItem: (key: string) => { delete store[key] },
    clear: () => { store = {} },
  }
})()
Object.defineProperty(globalThis, 'localStorage', { value: localStorageMock })

// Mock do window.location.href (axios interceptor usa isso)
Object.defineProperty(globalThis, 'location', {
  value: { href: '' },
  writable: true,
})

// Suprime erros esperados de console.error nos testes
vi.spyOn(console, 'error').mockImplementation(() => {})
