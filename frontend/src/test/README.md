// Comprehensive testing documentation and examples
// src/test/README.md

# 🧪 EAS Frontend Testing Setup

## Overview

This project uses **Vitest** with **React Testing Library** for comprehensive frontend testing. The testing framework is configured for modern React development with full TypeScript support.

## Testing Stack

- **Test Runner**: Vitest (Vite-native, fast)
- **Testing Library**: @testing-library/react
- **Assertions**: Vitest (Jest-compatible)
- **User Interactions**: @testing-library/user-event
- **Environment**: jsdom

## Test Scripts

```bash
npm run test          # Watch mode for development
npm run test:run      # Single run (CI/CD)
npm run test:ui       # Visual test UI
npm run test:coverage # Coverage reports
npm run test:watch    # Watch specific tests
```

## File Structure

```
src/
├── test/
│   ├── setup.js           # Global test configuration
│   ├── utils.js           # Test utilities and helpers
│   └── README.md          # This file
├── components/
│   └── ui/
│       └── __tests__/     # Component tests
├── features/
│   ├── auth/
│   │   └── __tests__/     # Feature-specific tests
│   └── campus/
│       └── __tests__/     # Feature-specific tests
└── contexts/
    └── __tests__/         # Context/hook tests
```

## Test Types

### 1. Component Tests
Test individual UI components in isolation:

```javascript
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Button from '../Button'

test('button handles clicks', async () => {
  const user = userEvent.setup()
  const handleClick = vi.fn()
  
  render(<Button onClick={handleClick}>Click me</Button>)
  
  await user.click(screen.getByRole('button'))
  expect(handleClick).toHaveBeenCalled()
})
```

### 2. Feature Tests
Test feature modules with their contexts:

```javascript
import { renderHook, act } from '@testing-library/react'
import { useAuth } from '../AuthContext'

test('auth context provides login functionality', async () => {
  const { result } = renderHook(() => useAuth())
  
  await act(async () => {
    await result.current.login('user@test.com', 'password')
  })
  
  expect(result.current.isAuthenticated).toBe(true)
})
```

### 3. Integration Tests
Test interactions between multiple components:

```javascript
import { renderWithProviders } from '../../test/utils'
import Dashboard from '../Dashboard'

test('dashboard loads user data on mount', async () => {
  renderWithProviders(<Dashboard />)
  
  expect(await screen.findByText('Welcome back')).toBeInTheDocument()
})
```

## Testing Utilities

### `renderWithProviders()`
Wraps components with necessary providers (Router, Auth, Campus):

```javascript
import { renderWithProviders } from '../test/utils'

// Automatically includes BrowserRouter and other providers
renderWithProviders(<YourComponent />)
```

### Mock Utilities
Common mocks for API, localStorage, and browser APIs:

```javascript
import { createMockFetch, mockApiResponses } from '../test/utils'

// Mock fetch responses
global.fetch = createMockFetch(mockApiResponses.user.profile)
```

## Best Practices

### ✅ DO:
- Use `screen.getByRole()` for better accessibility testing
- Test user interactions, not implementation details
- Use `userEvent` for realistic user interactions
- Mock external dependencies (APIs, localStorage)
- Test error states and loading states
- Keep tests simple and focused

### ❌ AVOID:
- Testing internal component state directly
- Snapshot testing for dynamic content
- Testing third-party library internals
- Complex test setup that's hard to understand
- Testing multiple concerns in one test

## Configuration

### Vitest Config (vite.config.js)
```javascript
export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.js'],
    css: true,
    coverage: {
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', 'src/test/']
    }
  }
})
```

### Setup File (src/test/setup.js)
- Global test configuration
- Jest-DOM matchers
- Mock browser APIs
- Environment variable mocks

## Coverage Goals

- **Components**: 80%+ test coverage
- **Features**: 90%+ test coverage  
- **Critical paths**: 100% test coverage
- **Error handling**: All error states tested

## Campus-Specific Testing

When testing campus-related features:

```javascript
const mockCampusContext = {
  currentCampus: { id: 1, name: 'Test Campus', code: 'TEST' },
  setCampus: vi.fn(),
  availableCampuses: [...]
}

// Use in context providers for testing
```

## Debugging Tests

### Visual Test UI
```bash
npm run test:ui
```
Opens a web interface to run and debug tests visually.

### Console Debugging
```javascript
import { screen, logRoles } from '@testing-library/react'

// Debug rendered DOM
screen.debug()

// Log available roles
logRoles(container)
```

### VSCode Integration
Install the "Vitest" extension for inline test running and debugging.

## Continuous Integration

Tests run automatically on:
- Git commit (pre-commit hook)
- Pull request creation
- Deployment pipeline

Example CI configuration:
```yaml
- name: Run Tests
  run: |
    npm install
    npm run test:run
    npm run test:coverage
```

## Example Test Files

See the `__tests__` directories for complete examples:
- `src/components/ui/__tests__/Button.test.jsx`
- `src/features/auth/__tests__/AuthContext.test.jsx`
- `src/features/campus/__tests__/CampusContext.test.jsx`

---

Happy Testing! 🚀
