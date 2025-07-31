import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CampusFilter, CampusMultiSelectFilter, CampusFilterIndicator } from '../ui/CampusFilter';
import { CampusProvider } from '../../contexts/CampusContext';

// Mock campus data
const mockCampuses = [
  {
    id: 1,
    name: 'main-campus',
    displayName: 'Main Campus',
    theme: { primary: '#3B82F6' }
  },
  {
    id: 2,
    name: 'north-campus',
    displayName: 'North Campus',
    theme: { primary: '#10B981' }
  },
  {
    id: 3,
    name: 'south-campus',
    displayName: 'South Campus',
    theme: { primary: '#F59E0B' }
  }
];

// Mock context value
const mockContextValue = {
  currentCampus: mockCampuses[0],
  availableCampuses: mockCampuses,
  userCampusPermissions: {
    canSwitchCampuses: true,
    canAccessMultipleCampuses: true,
    isSuperAdmin: false,
    accessibleCampusIds: [1, 2, 3]
  },
  isLoading: false,
  switchCampus: vi.fn()
};

// Mock context for super admin
const mockSuperAdminContextValue = {
  ...mockContextValue,
  userCampusPermissions: {
    ...mockContextValue.userCampusPermissions,
    isSuperAdmin: true
  }
};

// Mock context for regular user
const mockRegularUserContextValue = {
  ...mockContextValue,
  userCampusPermissions: {
    canSwitchCampuses: false,
    canAccessMultipleCampuses: false,
    isSuperAdmin: false,
    accessibleCampusIds: [1]
  }
};

// Test wrapper with context
const TestWrapper = ({ children, contextValue = mockContextValue }) => (
  <CampusProvider value={contextValue}>
    {children}
  </CampusProvider>
);

describe('CampusFilter', () => {
  const mockOnChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Basic Functionality', () => {
    it('renders with default props', () => {
      render(
        <TestWrapper>
          <CampusFilter onCampusFilterChange={mockOnChange} />
        </TestWrapper>
      );

      expect(screen.getByText('Campus Filter')).toBeInTheDocument();
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('shows loading state', () => {
      const loadingContext = { ...mockContextValue, isLoading: true };
      render(
        <TestWrapper contextValue={loadingContext}>
          <CampusFilter onCampusFilterChange={mockOnChange} />
        </TestWrapper>
      );

      expect(screen.getByText('Loading campuses...')).toBeInTheDocument();
    });

    it('does not render for single campus users', () => {
      const { container } = render(
        <TestWrapper contextValue={mockRegularUserContextValue}>
          <CampusFilter onCampusFilterChange={mockOnChange} />
        </TestWrapper>
      );

      expect(container.firstChild).toBeNull();
    });
  });

  describe('Campus Selection', () => {
    it('opens dropdown when clicked', async () => {
      render(
        <TestWrapper>
          <CampusFilter onCampusFilterChange={mockOnChange} />
        </TestWrapper>
      );

      const button = screen.getByRole('button');
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByText('Main Campus')).toBeInTheDocument();
        expect(screen.getByText('North Campus')).toBeInTheDocument();
        expect(screen.getByText('South Campus')).toBeInTheDocument();
      });
    });

    it('selects campus in single-select mode', async () => {
      render(
        <TestWrapper>
          <CampusFilter onCampusFilterChange={mockOnChange} />
        </TestWrapper>
      );

      const button = screen.getByRole('button');
      fireEvent.click(button);

      await waitFor(() => {
        const northCampus = screen.getByText('North Campus');
        fireEvent.click(northCampus);
      });

      expect(mockOnChange).toHaveBeenCalledWith([2]);
    });

    it('handles multi-select mode', async () => {
      render(
        <TestWrapper>
          <CampusFilter allowMultiSelect={true} onCampusFilterChange={mockOnChange} />
        </TestWrapper>
      );

      const button = screen.getByRole('button');
      fireEvent.click(button);

      await waitFor(() => {
        const mainCampus = screen.getByText('Main Campus');
        const northCampus = screen.getByText('North Campus');
        
        fireEvent.click(mainCampus);
        fireEvent.click(northCampus);
      });

      expect(mockOnChange).toHaveBeenCalledWith([1]);
      expect(mockOnChange).toHaveBeenCalledWith([1, 2]);
    });

    it('shows "All Campuses" option for super admin', async () => {
      render(
        <TestWrapper contextValue={mockSuperAdminContextValue}>
          <CampusFilter showAllOption={true} onCampusFilterChange={mockOnChange} />
        </TestWrapper>
      );

      const button = screen.getByRole('button');
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByText('All Campuses')).toBeInTheDocument();
      });
    });
  });

  describe('Compact Variant', () => {
    it('renders compact variant correctly', () => {
      render(
        <TestWrapper>
          <CampusFilter compact={true} onCampusFilterChange={mockOnChange} />
        </TestWrapper>
      );

      // Should not show label in compact mode
      expect(screen.queryByText('Campus Filter')).not.toBeInTheDocument();
      expect(screen.getByRole('button')).toBeInTheDocument();
    });
  });

  describe('Display Text', () => {
    it('shows placeholder when no selection', () => {
      render(
        <TestWrapper>
          <CampusFilter 
            placeholder="Choose campus..." 
            onCampusFilterChange={mockOnChange} 
          />
        </TestWrapper>
      );

      expect(screen.getByText('Choose campus...')).toBeInTheDocument();
    });

    it('shows single campus name when one selected', () => {
      render(
        <TestWrapper>
          <CampusFilter 
            selectedCampusIds={[2]} 
            onCampusFilterChange={mockOnChange} 
          />
        </TestWrapper>
      );

      expect(screen.getByText('North Campus')).toBeInTheDocument();
    });

    it('shows count when multiple campuses selected', () => {
      render(
        <TestWrapper>
          <CampusFilter 
            selectedCampusIds={[1, 2]} 
            onCampusFilterChange={mockOnChange} 
          />
        </TestWrapper>
      );

      expect(screen.getByText('2 Campuses Selected')).toBeInTheDocument();
    });

    it('shows "All Campuses" when all selected', () => {
      render(
        <TestWrapper>
          <CampusFilter 
            selectedCampusIds={['all']} 
            onCampusFilterChange={mockOnChange} 
          />
        </TestWrapper>
      );

      expect(screen.getByText('All Campuses')).toBeInTheDocument();
    });
  });
});

describe('CampusMultiSelectFilter', () => {
  const mockOnSelectionChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders multi-select checkboxes', () => {
    render(
      <TestWrapper>
        <CampusMultiSelectFilter onSelectionChange={mockOnSelectionChange} />
      </TestWrapper>
    );

    expect(screen.getByText('Campus Selection')).toBeInTheDocument();
    expect(screen.getByText('All')).toBeInTheDocument();
    expect(screen.getByText('None')).toBeInTheDocument();
  });

  it('toggles campus selection', () => {
    render(
      <TestWrapper>
        <CampusMultiSelectFilter onSelectionChange={mockOnSelectionChange} />
      </TestWrapper>
    );

    const mainCampusCheckbox = screen.getByRole('checkbox', { name: /Main Campus/ });
    fireEvent.click(mainCampusCheckbox);

    expect(mockOnSelectionChange).toHaveBeenCalledWith(['1']);
  });

  it('selects all campuses', () => {
    render(
      <TestWrapper>
        <CampusMultiSelectFilter onSelectionChange={mockOnSelectionChange} />
      </TestWrapper>
    );

    const selectAllButton = screen.getByText('All');
    fireEvent.click(selectAllButton);

    expect(mockOnSelectionChange).toHaveBeenCalledWith(['1', '2', '3']);
  });

  it('clears all selections', () => {
    render(
      <TestWrapper>
        <CampusMultiSelectFilter 
          selectedCampuses={['1', '2']} 
          onSelectionChange={mockOnSelectionChange} 
        />
      </TestWrapper>
    );

    const clearAllButton = screen.getByText('None');
    fireEvent.click(clearAllButton);

    expect(mockOnSelectionChange).toHaveBeenCalledWith([]);
  });

  it('shows selection count', () => {
    render(
      <TestWrapper>
        <CampusMultiSelectFilter 
          selectedCampuses={['1', '2']} 
          onSelectionChange={mockOnSelectionChange} 
        />
      </TestWrapper>
    );

    expect(screen.getByText('2 of 3 campuses selected')).toBeInTheDocument();
  });

  it('falls back to indicator for single campus users', () => {
    render(
      <TestWrapper contextValue={mockRegularUserContextValue}>
        <CampusMultiSelectFilter onSelectionChange={mockOnSelectionChange} />
      </TestWrapper>
    );

    // Should show the indicator component instead
    expect(screen.queryByText('Campus Selection')).not.toBeInTheDocument();
  });
});

describe('CampusFilterIndicator', () => {
  const mockOnClear = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows current campus filter', () => {
    render(
      <TestWrapper>
        <CampusFilterIndicator activeFilter="current" />
      </TestWrapper>
    );

    expect(screen.getByText('Main Campus')).toBeInTheDocument();
  });

  it('shows all campuses filter', () => {
    render(
      <TestWrapper>
        <CampusFilterIndicator activeFilter="all" />
      </TestWrapper>
    );

    expect(screen.getByText('All Campuses')).toBeInTheDocument();
  });

  it('shows specific campus filter', () => {
    render(
      <TestWrapper>
        <CampusFilterIndicator activeFilter="2" />
      </TestWrapper>
    );

    expect(screen.getByText('North Campus')).toBeInTheDocument();
  });

  it('shows clear button and handles clear', () => {
    render(
      <TestWrapper>
        <CampusFilterIndicator 
          activeFilter="2" 
          showClearButton={true} 
          onClear={mockOnClear} 
        />
      </TestWrapper>
    );

    const clearButton = screen.getByText('×');
    fireEvent.click(clearButton);

    expect(mockOnClear).toHaveBeenCalled();
  });

  it('does not render for current campus with regular users', () => {
    const { container } = render(
      <TestWrapper contextValue={mockRegularUserContextValue}>
        <CampusFilterIndicator activeFilter="current" />
      </TestWrapper>
    );

    expect(container.firstChild).toBeNull();
  });
});

describe('Integration Tests', () => {
  it('handles disabled state properly', () => {
    render(
      <TestWrapper>
        <CampusFilter disabled={true} onCampusFilterChange={vi.fn()} />
      </TestWrapper>
    );

    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
  });

  it('closes dropdown when clicking outside', async () => {
    render(
      <div>
        <TestWrapper>
          <CampusFilter onCampusFilterChange={vi.fn()} />
        </TestWrapper>
        <div data-testid="outside">Outside element</div>
      </div>
    );

    const button = screen.getByRole('button');
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText('Main Campus')).toBeInTheDocument();
    });

    const outsideElement = screen.getByTestId('outside');
    fireEvent.click(outsideElement);

    await waitFor(() => {
      expect(screen.queryByText('Main Campus')).not.toBeInTheDocument();
    });
  });
});
