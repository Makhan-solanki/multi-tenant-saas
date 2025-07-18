// src/test/setup.js
import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Mock API calls
window.fetch = vi.fn()

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn()
}
window.localStorage = localStorageMock

// Mock window.location
delete window.location
window.location = {
  href: 'http://localhost:3003',
  origin: 'http://localhost:3003'
}

// Mock ResizeObserver
window.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn()
}))

// Mock IntersectionObserver
window.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn()
}))

// Setup test environment
import { beforeEach } from 'vitest'

beforeEach(() => {
  vi.clearAllMocks()
  localStorageMock.getItem.mockReturnValue(null)
})