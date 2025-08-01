# ♿ Accessibility & Usability

### 1. WCAG 2.1 Compliance
```typescript
// Screen reader support
const AnnouncementRegion: React.FC<{message: string}> = ({message}) => {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className="sr-only"
    >
      {message}
    </div>
  );
};

// Keyboard navigation
const KeyboardNavigable: React.FC = () => {
  const handleKeyDown = (event: KeyboardEvent) => {
    switch (event.key) {
      case 'Escape':
        // Close modals, cancel actions
        break;
      case 'Enter':
        // Confirm actions
        break;
      case 'Tab':
        // Focus management
        break;
    }
  };

  return (
    <div onKeyDown={handleKeyDown} tabIndex={0}>
      {/* Navigable content */}
    </div>
  );
};
```

### 2. Error Handling & User Feedback
```typescript
// Comprehensive error boundary
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary p-6 text-center">
          <h2 className="text-xl font-bold text-red-600 mb-4">
            ⚠️ Something went wrong
          </h2>
          <p className="text-gray-600 mb-4">
            We're sorry, but something unexpected happened. 
            Please try refreshing the page.
          </p>
          <Button onClick={() => window.location.reload()}>
            🔄 Refresh Page
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}

// User-friendly error messages
const ErrorMessage: React.FC<{error: string}> = ({error}) => {
  const friendlyMessages = {
    'NETWORK_ERROR': 'Please check your internet connection and try again.',
    'CAMERA_PERMISSION': 'Camera access is required for attendance verification.',
    'LOCATION_PERMISSION': 'Location access helps verify your attendance.',
    'INVALID_QR': 'This QR code is invalid or expired. Please scan a new one.',
    'DUPLICATE_ATTENDANCE': 'You have already recorded attendance for this event.'
  };

  return (
    <Alert variant="destructive">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Error</AlertTitle>
      <AlertDescription>
        {friendlyMessages[error] || 'An unexpected error occurred. Please try again.'}
      </AlertDescription>
    </Alert>
  );
};
```

---
