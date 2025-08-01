// Test utilities and helpers
// src/test/utils.js

import React from 'react'
import { render } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { vi } from 'vitest'

// Mock campus context for tests
const mockCampusContext = {
  currentCampus: {
    id: 1,
    name: 'Test Campus',
    code: 'TEST',
    branding_config: {
      primary_color: '#22c55e',
      secondary_color: '#166534'
    }
  },
  setCampus: vi.fn(),
  isCampusLoading: false,
  campusError: null,
  availableCampuses: [
    {
      id: 1,
      name: 'Test Campus',
      code: 'TEST'
    }
  ]
}

// Mock auth context for tests
const mockAuthContext = {
  user: {
    id: 1,
    email: 'test@test.com',
    first_name: 'Test',
    last_name: 'User',
    role: 'student',
    campus_id: 1
  },
  isAuthenticated: true,
  isLoading: false,
  login: vi.fn(),
  logout: vi.fn(),
  register: vi.fn()
}

// Custom render function with providers
export function renderWithProviders(ui, options = {}) {
  const {
    initialEntries = ['/'],
    ...renderOptions
  } = options

  function Wrapper({ children }) {
    return (
      <BrowserRouter>
        {children}
      </BrowserRouter>
    )
  }

  return render(ui, { wrapper: Wrapper, ...renderOptions })
}

// Mock API responses
export const mockApiResponses = {
  campus: {
    list: [
      { id: 1, name: 'Test Campus', code: 'TEST' },
      { id: 2, name: 'Other Campus', code: 'OTHER' }
    ],
    detail: { id: 1, name: 'Test Campus', code: 'TEST' }
  },
  user: {
    profile: mockAuthContext.user,
    list: [mockAuthContext.user]
  },
  events: {
    list: [
      {
        id: 1,
        title: 'Test Event',
        description: 'Test event description',
        date: '2025-08-01',
        start_time: '10:00:00',
        end_time: '12:00:00',
        campus_id: 1
      }
    ]
  }
}

// Helper to create mock fetch responses
export function createMockFetch(response, status = 200) {
  return vi.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    json: vi.fn().mockResolvedValue(response),
    text: vi.fn().mockResolvedValue(JSON.stringify(response))
  })
}

// Helper to wait for async operations
export const waitFor = (callback, options = {}) => {
  return new Promise((resolve, reject) => {
    const { timeout = 1000, interval = 50 } = options
    const startTime = Date.now()
    
    const check = async () => {
      try {
        const result = await callback()
        if (result) {
          resolve(result)
          return
        }
      } catch (error) {
        // Continue checking
      }
      
      if (Date.now() - startTime > timeout) {
        reject(new Error('Timeout waiting for condition'))
        return
      }
      
      setTimeout(check, interval)
    }
    
    check()
  })
}

// Re-export testing library utilities
export * from '@testing-library/react'
export { default as userEvent } from '@testing-library/user-event'
