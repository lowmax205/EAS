// Test setup configuration
// src/test/setup.js

import '@testing-library/jest-dom'
import { expect, afterEach, vi } from 'vitest'
import { cleanup } from '@testing-library/react'

// Clean up after each test
afterEach(() => {
  cleanup()
})

// Mock environment variables for tests
Object.defineProperty(import.meta, 'env', {
  value: {
    DEV: true,
    VITE_API_BASE_URL: 'http://localhost:8000/api/v1',
    VITE_BACKEND_DISABLED: 'false'
  },
  writable: true
})

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  // Uncomment to silence specific logs during tests
  // log: vi.fn(),
  // debug: vi.fn(),
  // info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
}

// Mock window.matchMedia for responsive hooks
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))
