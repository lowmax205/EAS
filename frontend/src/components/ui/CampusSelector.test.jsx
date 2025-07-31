import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, test, expect, beforeEach, vi } from 'vitest';
import { CampusSelector, CampusSelectorCompact, CampusIndicator } from '../ui/CampusSelector';

// Mock the entire context module first
vi.mock('../../contexts/CampusContext', () => {
  const mockUseCampus = vi.fn();
  return {
    useCampus: mockUseCampus,
    CampusProvider: ({ children }) => children // Simple passthrough for testing
  };
});

// Import the mocked function after the mock is set up
import { useCampus } from '../../contexts/CampusContext';

// Cast to vi.Mock to get proper typing
const mockUseCampus = useCampus;

const defaultMockCampusContextValue = {
  currentCampus: {
    id: 1,
    name: 'main',
    displayName: 'Main Campus',  
    theme: { primary: '#3B82F6' }
  },
  availableCampuses: [
    {
      id: 1,
      name: 'main',
      displayName: 'Main Campus',
      theme: { primary: '#3B82F6' }
    },
    {
      id: 2,
      name: 'north',
      displayName: 'North Campus',
      theme: { primary: '#10B981' }
    }
  ],
  userCampusPermissions: {
    canSwitchCampuses: true,
    isSuperAdmin: false
  },
  switchCampus: vi.fn(),
  isLoading: false,
  error: null
};

describe('CampusSelector Components', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset mock to default value
    mockUseCampus.mockReturnValue(defaultMockCampusContextValue);
  });

  describe('CampusSelector', () => {
    test('renders campus selector with current campus', () => {
      render(<CampusSelector />);
      
      expect(screen.getByText('Main Campus')).toBeInTheDocument();
    });

    test('shows loading state', () => {
      const loadingContext = {
        ...defaultMockCampusContextValue,
        isLoading: true
      };
      mockUseCampus.mockReturnValue(loadingContext);
      
      render(<CampusSelector />);
      
      expect(screen.getByText('Loading campuses...')).toBeInTheDocument();
    });

    test('shows error state', () => {
      const errorContext = {
        ...defaultMockCampusContextValue,
        error: 'Failed to load campuses'
      };
      mockUseCampus.mockReturnValue(errorContext);
      
      render(<CampusSelector />);
      
      expect(screen.getByText('Failed to load campuses')).toBeInTheDocument();
    });

    test('shows read-only display when user has only one campus', () => {
      const singleCampusContext = {
        ...defaultMockCampusContextValue,
        availableCampuses: [defaultMockCampusContextValue.currentCampus]
      };
      mockUseCampus.mockReturnValue(singleCampusContext);
      
      render(<CampusSelector />);
      
      expect(screen.getByText('Main Campus')).toBeInTheDocument();
      // Should not have dropdown trigger when only one campus
      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });

    test('shows read-only display when user cannot switch campuses', () => {
      const noSwitchContext = {
        ...defaultMockCampusContextValue,
        userCampusPermissions: {
          canSwitchCampuses: false,
          isSuperAdmin: false
        }
      };
      mockUseCampus.mockReturnValue(noSwitchContext);
      
      render(<CampusSelector />);
      
      expect(screen.getByText('Main Campus')).toBeInTheDocument();
      // Should not have dropdown trigger when cannot switch
      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });
  });

  describe('CampusSelectorCompact', () => {
    test('renders in compact mode', () => {
      render(<CampusSelectorCompact />);
      
      expect(screen.getByText('Main Campus')).toBeInTheDocument();
    });
  });

  describe('CampusIndicator', () => {
    test('renders campus indicator without selector', () => {
      render(<CampusIndicator />);
      
      expect(screen.getByText('Main Campus')).toBeInTheDocument();
      // Should not have dropdown trigger
      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });

    test('shows theme color indicator', () => {
      render(<CampusIndicator showThemeColor={true} />);
      
      const colorIndicator = screen.getByText('Main Campus').previousSibling;
      expect(colorIndicator).toHaveStyle('background-color: rgb(59, 130, 246)');
    });

    test('shows loading state in indicator', () => {
      const loadingContext = {
        ...defaultMockCampusContextValue,
        isLoading: true
      };
      mockUseCampus.mockReturnValue(loadingContext);
      
      const { container } = render(<CampusIndicator />);
      
      // Should show loading animation elements with animate-pulse class
      const pulsingElements = container.querySelectorAll('.animate-pulse');
      expect(pulsingElements.length).toBeGreaterThan(0);
    });
  });
});
