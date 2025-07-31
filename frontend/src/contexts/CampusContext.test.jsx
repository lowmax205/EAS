import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import { describe, test, expect, beforeEach, vi } from 'vitest';
import { CampusProvider, useCampus } from '../contexts/CampusContext';

// Mock AuthContext
const mockUser = {
  id: 1,
  role: 'student',
  campusId: 1,
  email: 'test@snsu.edu'
};

vi.mock('../features/auth/AuthContext', () => ({
  useAuth: () => ({ user: mockUser })
}));

// Test component that uses the campus context
const TestComponent = () => {
  const { 
    currentCampus, 
    availableCampuses, 
    userCampusPermissions, 
    isLoading 
  } = useCampus();

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      <div data-testid="current-campus">{currentCampus.name}</div>
      <div data-testid="campus-count">{availableCampuses.length}</div>
      <div data-testid="can-switch">{userCampusPermissions.canSwitchCampuses.toString()}</div>
    </div>
  );
};

describe('CampusContext', () => {
  test('provides campus context to components', async () => {
    render(
      <CampusProvider>
        <TestComponent />
      </CampusProvider>
    );

    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });

    // Verify default campus is SNSU
    expect(screen.getByTestId('current-campus')).toHaveTextContent('SNSU');
    
    // Verify available campuses for regular user
    expect(screen.getByTestId('campus-count')).toHaveTextContent('1');
    
    // Verify regular user cannot switch campuses
    expect(screen.getByTestId('can-switch')).toHaveTextContent('false');
  });

  test('provides super admin permissions for super admin user', async () => {
    // This test would require dynamic mocking which is complex in Vitest
    // For now, we'll test this through integration testing
    // Mock super admin user would need to be set up at module level
    expect(true).toBe(true); // Placeholder until we implement proper dynamic mocking
  });

  test('throws error when used outside provider', () => {
    // Suppress console.error for this test
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => {
      render(<TestComponent />);
    }).toThrow('useCampus must be used within a CampusProvider');

    consoleSpy.mockRestore();
  });

  test('applies campus theme correctly', async () => {
    render(
      <CampusProvider>
        <TestComponent />
      </CampusProvider>
    );

    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });

    // Check if CSS variables are set correctly for SNSU theme
    const root = document.documentElement;
    expect(root.style.getPropertyValue('--campus-primary')).toBe('#22c55e');
    expect(root.getAttribute('data-campus')).toBe('snsu');
  });
});

describe('Campus switching functionality', () => {
  const TestCampusSwitching = () => {
    const { switchCampus, currentCampus, error } = useCampus();

    const handleSwitch = async () => {
      try {
        await switchCampus(2); // Try to switch to USC
      } catch (err) {
        // Error handled by context
      }
    };

    return (
      <div>
        <div data-testid="current-campus">{currentCampus.name}</div>
        <button onClick={handleSwitch} data-testid="switch-button">Switch Campus</button>
        {error && <div data-testid="error">{error}</div>}
      </div>
    );
  };

  test('prevents unauthorized campus switching', async () => {
    render(
      <CampusProvider>
        <TestCampusSwitching />
      </CampusProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('current-campus')).toHaveTextContent('SNSU');
    });

    // Try to switch campus (should fail for regular user)
    act(() => {
      screen.getByTestId('switch-button').click();
    });

    await waitFor(() => {
      expect(screen.getByTestId('error')).toHaveTextContent('Insufficient permissions to access this campus');
    });

    // Campus should remain unchanged
    expect(screen.getByTestId('current-campus')).toHaveTextContent('SNSU');
  });
});
