# User Story: Auto-Login Authentication Prompts

**Story ID**: PANEL-003  
**Epic**: Panel Defense Critical Requirements  
**Priority**: CRITICAL  
**Story Points**: 6  
**Sprint**: Panel Compliance Sprint 2  

## User Story

**As a** student trying to record attendance  
**I want** to be automatically prompted to log in if I'm not authenticated  
**So that** I don't waste time filling out forms that won't save and my attendance data is properly recorded

## Background Context

The academic panel identified that students should not be able to access attendance forms without being logged in, as this leads to data loss and confusion. The system should automatically check authentication status and prompt for login before allowing access to any attendance functionality.

## Acceptance Criteria

### Scenario 1: Unauthenticated User Accesses Attendance Form
**Given** I am not logged into the system  
**When** I try to access an attendance form (via QR code or direct link)  
**Then** I should see a login prompt before the form appears  
**And** the prompt should explain why login is required  
**And** I should not see any attendance form fields until authenticated

### Scenario 2: Login Prompt Content and Design
**Given** I see the authentication prompt  
**When** I read the prompt content  
**Then** I should see a clear message like "Please log in to record your attendance"  
**And** I should see login options (username/password, single sign-on if available)  
**And** I should see the event name I'm trying to check into  
**And** the prompt should look professional and integrated with the app design

### Scenario 3: Successful Login Flow
**Given** I am prompted to log in for attendance  
**When** I enter valid credentials and submit  
**Then** I should be logged in successfully  
**And** I should automatically return to the attendance form  
**And** any context (QR code data, event info) should be preserved  
**And** the form should be ready for me to complete attendance

### Scenario 4: Failed Login Attempts
**Given** I am trying to log in for attendance  
**When** I enter incorrect credentials  
**Then** I should see a clear error message  
**And** I should be able to try again without losing my place  
**And** the event context should remain preserved  
**And** after 3 failed attempts, I should see account recovery options

### Scenario 5: Context Preservation During Login
**Given** I have scanned a QR code for a specific event  
**And** I am prompted to log in  
**When** I complete the login process  
**Then** I should return to the attendance form for the same event  
**And** any location data should be preserved  
**And** any other form context should remain intact

### Scenario 6: Already Authenticated Users
**Given** I am already logged into the system  
**When** I scan a QR code or access an attendance form  
**Then** I should bypass the login prompt entirely  
**And** go directly to the attendance form  
**And** my user information should be automatically populated

### Scenario 7: Session Expiration During Form Use
**Given** I am logged in and using an attendance form  
**When** my session expires while I'm filling out the form  
**Then** I should be prompted to re-authenticate  
**And** my form data should be preserved  
**And** after re-login, I should return to the form with my data intact

## Definition of Done

### Functional Requirements
- [ ] Authentication check occurs before any attendance form access
- [ ] Login prompt appears with clear messaging and context
- [ ] Successful login redirects back to original attendance form
- [ ] Event and location context preserved during login process
- [ ] Session expiration handled gracefully with data preservation

### Technical Requirements
- [ ] Integration with existing AuthContext system
- [ ] Route protection for attendance-related pages
- [ ] Secure token management and refresh logic
- [ ] Error handling for authentication failures
- [ ] Unit tests for all authentication scenarios

### UX Requirements
- [ ] Seamless transition from login back to attendance flow
- [ ] Clear messaging about why login is required
- [ ] Professional login form design matching app theme
- [ ] Mobile-responsive authentication flow
- [ ] Loading states during authentication process

## Technical Specifications

### Authentication Guard Component
```jsx
interface AttendanceAuthGuardProps {
  children: React.ReactNode;
  eventData?: EventData;
  locationData?: LocationData;
  onLoginRequired: (context: AttendanceContext) => void;
}

const AttendanceAuthGuard = ({ 
  children, 
  eventData, 
  locationData, 
  onLoginRequired 
}) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [attendanceContext, setAttendanceContext] = useState(null);
  
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      const context = {
        eventData,
        locationData,
        timestamp: Date.now(),
        returnUrl: window.location.pathname
      };
      setAttendanceContext(context);
      onLoginRequired(context);
    }
  }, [isAuthenticated, isLoading, eventData, locationData]);
  
  if (isLoading) {
    return <LoadingSpinner />;
  }
  
  if (!isAuthenticated) {
    return null; // Login prompt will be shown by parent
  }
  
  return children;
};
```

### Login Prompt Component
```jsx
interface LoginPromptProps {
  isVisible: boolean;
  eventName?: string;
  onLoginSuccess: (user: User) => void;
  onCancel?: () => void;
}

const AttendanceLoginPrompt = ({ 
  isVisible, 
  eventName, 
  onLoginSuccess,
  onCancel 
}) => {
  const [loginData, setLoginData] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  
  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      const user = await login(loginData.username, loginData.password);
      onLoginSuccess(user);
    } catch (error) {
      setError('Invalid username or password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Dialog open={isVisible} className="max-w-md">
      <DialogContent className="p-6">
        <div className="text-center mb-6">
          <Lock className="h-12 w-12 text-blue-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Login Required
          </h2>
          {eventName && (
            <p className="text-gray-600">
              Please log in to record your attendance for <strong>{eventName}</strong>
            </p>
          )}
        </div>
        
        <form onSubmit={handleLogin} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Username or Student ID
            </label>
            <input
              type="text"
              value={loginData.username}
              onChange={(e) => setLoginData({...loginData, username: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              value={loginData.password}
              onChange={(e) => setLoginData({...loginData, password: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          
          <div className="flex space-x-3 pt-4">
            <Button 
              type="submit" 
              disabled={isLoading}
              className="flex-1"
            >
              {isLoading ? 'Logging in...' : 'Log In'}
            </Button>
            {onCancel && (
              <Button 
                type="button" 
                variant="outline" 
                onClick={onCancel}
                className="flex-1"
              >
                Cancel
              </Button>
            )}
          </div>
        </form>
        
        <div className="mt-4 text-center">
          <a href="/forgot-password" className="text-sm text-blue-600 hover:text-blue-800">
            Forgot your password?
          </a>
        </div>
      </DialogContent>
    </Dialog>
  );
};
```

### Context Preservation Logic
```javascript
const useAttendanceContext = () => {
  const [context, setContext] = useState(() => {
    // Try to restore context from sessionStorage
    const saved = sessionStorage.getItem('attendanceContext');
    return saved ? JSON.parse(saved) : null;
  });
  
  const saveContext = useCallback((newContext) => {
    setContext(newContext);
    if (newContext) {
      sessionStorage.setItem('attendanceContext', JSON.stringify(newContext));
    } else {
      sessionStorage.removeItem('attendanceContext');
    }
  }, []);
  
  const clearContext = useCallback(() => {
    setContext(null);
    sessionStorage.removeItem('attendanceContext');
  }, []);
  
  return {
    context,
    saveContext,
    clearContext
  };
};
```

## Integration with Existing Systems

### AuthContext Enhancement
```javascript
// Add to existing AuthContext
const AuthProvider = ({ children }) => {
  // ... existing auth state ...
  
  const [pendingAttendanceContext, setPendingAttendanceContext] = useState(null);
  
  const loginForAttendance = async (username, password, context) => {
    try {
      const user = await login(username, password);
      
      // After successful login, redirect to attendance with context
      if (context) {
        restoreAttendanceContext(context);
      }
      
      return user;
    } catch (error) {
      throw error;
    }
  };
  
  const restoreAttendanceContext = (context) => {
    // Restore event data, location, etc.
    if (context.eventData) {
      setCurrentEvent(context.eventData);
    }
    if (context.locationData) {
      setCurrentLocation(context.locationData);
    }
    
    // Navigate back to attendance form
    navigate('/attendance', { 
      state: { restored: true, context } 
    });
  };
  
  // ... rest of AuthContext
};
```

### Route Protection
```jsx
// Protected route wrapper for attendance pages
const ProtectedAttendanceRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const { context, saveContext } = useAttendanceContext();
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      // Save current page context before showing login
      const currentContext = {
        path: window.location.pathname,
        timestamp: Date.now(),
        // ... other context data
      };
      saveContext(currentContext);
      setShowLoginPrompt(true);
    }
  }, [isAuthenticated, isLoading]);
  
  if (isLoading) return <LoadingSpinner />;
  
  if (!isAuthenticated) {
    return (
      <AttendanceLoginPrompt
        isVisible={showLoginPrompt}
        onLoginSuccess={() => setShowLoginPrompt(false)}
      />
    );
  }
  
  return children;
};
```

## Design Specifications

### Login Prompt Visual Design

**Layout Structure**:
- Modal dialog centered on screen
- Maximum width: 400px
- Padding: 24px all around
- Rounded corners: 8px
- Box shadow for elevation

**Color Scheme**:
- Background: White (#FFFFFF)
- Primary text: Dark gray (#1F2937)
- Secondary text: Medium gray (#6B7280)
- Primary button: Blue (#3B82F6)
- Error messages: Red (#EF4444)

**Typography**:
- Title: 20px, semibold
- Body text: 14px, regular
- Input labels: 12px, medium
- Button text: 14px, medium

**Interactive Elements**:
- Input fields: 40px height, 2px blue focus ring
- Buttons: 44px height for good touch targets
- Hover states: Subtle color transitions
- Loading states: Spinner with disabled buttons

### Mobile Responsiveness
- **Small screens (<640px)**: Full-width modal with padding adjustments
- **Medium screens (640-1024px)**: Centered modal with optimal width
- **Large screens (>1024px)**: Same as medium with potential hover enhancements

## Testing Strategy

### Unit Tests
```javascript
describe('AttendanceAuthGuard', () => {
  test('shows children when user is authenticated', () => {
    const mockUser = { id: 1, name: 'Test User' };
    render(
      <AuthProvider value={{ user: mockUser, isAuthenticated: true }}>
        <AttendanceAuthGuard>
          <div>Attendance Form</div>
        </AttendanceAuthGuard>
      </AuthProvider>
    );
    
    expect(screen.getByText('Attendance Form')).toBeInTheDocument();
  });
  
  test('triggers login prompt when user is not authenticated', () => {
    const onLoginRequired = jest.fn();
    render(
      <AuthProvider value={{ user: null, isAuthenticated: false }}>
        <AttendanceAuthGuard onLoginRequired={onLoginRequired}>
          <div>Attendance Form</div>
        </AttendanceAuthGuard>
      </AuthProvider>
    );
    
    expect(onLoginRequired).toHaveBeenCalled();
    expect(screen.queryByText('Attendance Form')).not.toBeInTheDocument();
  });
});

describe('AttendanceLoginPrompt', () => {
  test('displays event name in login prompt', () => {
    render(
      <AttendanceLoginPrompt
        isVisible={true}
        eventName="Computer Science Workshop"
        onLoginSuccess={jest.fn()}
      />
    );
    
    expect(screen.getByText(/Computer Science Workshop/)).toBeInTheDocument();
  });
  
  test('handles login form submission', async () => {
    const onLoginSuccess = jest.fn();
    const mockLogin = jest.fn().mockResolvedValue({ id: 1, name: 'Test User' });
    
    render(
      <AuthProvider value={{ login: mockLogin }}>
        <AttendanceLoginPrompt
          isVisible={true}
          onLoginSuccess={onLoginSuccess}
        />
      </AuthProvider>
    );
    
    fireEvent.change(screen.getByLabelText(/Username/), {
      target: { value: 'testuser' }
    });
    fireEvent.change(screen.getByLabelText(/Password/), {
      target: { value: 'password123' }
    });
    fireEvent.click(screen.getByText('Log In'));
    
    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('testuser', 'password123');
      expect(onLoginSuccess).toHaveBeenCalled();
    });
  });
});
```

### Integration Tests
```javascript
describe('Complete Authentication Flow', () => {
  test('preserves context through login process', async () => {
    const eventData = { id: 1, name: 'Test Event' };
    const locationData = { lat: 8.228, lng: 124.2452 };
    
    // Mock unauthenticated state
    const { rerender } = render(
      <AttendanceApp 
        initialUser={null}
        eventData={eventData}
        locationData={locationData}
      />
    );
    
    // Should show login prompt
    expect(screen.getByText('Login Required')).toBeInTheDocument();
    
    // Complete login
    fireEvent.change(screen.getByLabelText(/Username/), {
      target: { value: 'testuser' }
    });
    fireEvent.change(screen.getByLabelText(/Password/), {
      target: { value: 'password123' }
    });
    fireEvent.click(screen.getByText('Log In'));
    
    // Should return to attendance form with context preserved
    await waitFor(() => {
      expect(screen.getByText('Test Event')).toBeInTheDocument();
      expect(screen.getByText(/Location verified/)).toBeInTheDocument();
    });
  });
});
```

### User Acceptance Tests

1. **Test Case**: New user scans QR code without being logged in
   - **Steps**: Open app (not logged in), scan QR code
   - **Expected**: Login prompt appears before attendance form

2. **Test Case**: User logs in successfully and continues attendance
   - **Steps**: See login prompt, enter valid credentials, submit
   - **Expected**: Returns to attendance form with event context preserved

3. **Test Case**: Session expires during attendance form completion
   - **Steps**: Login, start filling form, wait for session expiry
   - **Expected**: Re-authentication prompt with form data preserved

## Error Handling

### Authentication Errors
```javascript
const handleAuthError = (error) => {
  switch (error.type) {
    case 'INVALID_CREDENTIALS':
      return {
        message: 'Invalid username or password. Please try again.',
        action: 'retry'
      };
      
    case 'ACCOUNT_LOCKED':
      return {
        message: 'Your account has been locked. Please contact support.',
        action: 'contact_support'
      };
      
    case 'NETWORK_ERROR':
      return {
        message: 'Unable to connect. Please check your internet connection.',
        action: 'retry'
      };
      
    case 'SESSION_EXPIRED':
      return {
        message: 'Your session has expired. Please log in again.',
        action: 'reauth'
      };
      
    default:
      return {
        message: 'An unexpected error occurred. Please try again.',
        action: 'retry'
      };
  }
};
```

## Success Metrics

### User Experience Metrics
- 100% of unauthenticated users see login prompt before attendance forms
- >95% login success rate from attendance prompts
- <30 seconds average time from login prompt to form completion
- <5% user drop-off rate at login prompt

### Technical Performance Metrics
- Authentication check completes within 500ms
- Context preservation success rate >99%
- Session expiration handled gracefully in 100% of cases
- Login prompt appears within 1 second of authentication failure

### Academic Compliance Metrics
- Panel requirement for "auto-login prompts" fully satisfied
- Prevents data loss from unauthenticated form submissions
- Professional authentication flow matching university standards
- Proper security practices for student data protection

---

**Story Prepared By**: BMad Orchestrator  
**Security Review**: Required for authentication implementation  
**UX Review**: Required for login flow optimization  
**Panel Compliance**: CRITICAL for preventing unauthenticated data loss
