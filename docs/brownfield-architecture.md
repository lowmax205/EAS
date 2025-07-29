# EAS-Frontend Brownfield Architecture Document

## Introduction

This document captures the **CURRENT STATE** of the EAS-Frontend (Event Attendance System) codebase for Surigao del Norte State University. This is a real-world analysis of the existing React-based frontend application, including its current implementation patterns, technical debt, and architectural decisions.

### Document Scope

This document provides comprehensive architectural analysis focused on understanding the actual implementation for planning the external API integrations and advanced features outlined in the brownfield enhancement PRD.

### Change Log

| Date | Version | Description | Author |
|------|---------|-------------|--------|
| July 29, 2025 | 1.0 | Initial brownfield architecture analysis | Winston (Architect) |

---

## Quick Reference - Key Files and Entry Points

### Critical Files for Understanding the System

- **Main Entry**: `src/main.jsx` - React application entry point
- **App Router**: `src/App.jsx` - Main routing and provider hierarchy
- **Configuration**: `vite.config.js`, `tailwind.config.js`, `package.json`
- **Core Business Logic**: `src/protected/` directory structure
- **API Integration**: `src/protected/api/apiConnect.js`
- **Mock Data**: `src/data/` directory with JSON files

### Enhancement Impact Areas (Based on PRD)

Files and modules that will be affected by the planned external API integrations:

**External API Service Layer**:
- `src/services/external/` (new directory structure)
- `src/protected/api/apiConnect.js` (extend existing patterns)

**Profile Management Enhancement**:
- `src/protected/profile/ProfilePage.jsx`
- `src/protected/profile/DocumentUpload.jsx` 
- `src/protected/profile/SignatureCanvas.jsx`

**Event Management with Maps**:
- `src/protected/Management/EventManagement.jsx`
- `src/protected/services/mapboxapiService.js` (referenced but needs implementation)

**Analytics Integration**:
- `src/protected/report/ReportsPage.jsx`
- `src/protected/Dashboard/DashboardPage.jsx`

---

## High Level Architecture

### Technical Summary

**Project Type**: Single Page Application (SPA) with React 18.2.0  
**Build System**: Vite 6.3.5 with ES modules  
**UI Framework**: TailwindCSS 3.3.3 with shadcn/ui patterns  
**State Management**: React Context API (4 main contexts)  
**Authentication**: JWT-based with mock implementation  
**Data Management**: Mock JSON files with service layer abstraction  

### Actual Tech Stack (from package.json analysis)

| Category | Technology | Version | Notes |
|----------|------------|---------|--------|
| Runtime | React | 18.2.0 | Functional components with hooks |
| Build Tool | Vite | 6.3.5 | Fast dev server, ES modules |
| UI Framework | TailwindCSS | 3.3.3 | Custom EAS theme configuration |
| Routing | React Router DOM | 6.14.2 | Client-side routing with protected routes |
| State Management | React Context | Built-in | 4 context providers |
| Icons | Lucide React | 0.263.1 | Consistent icon system |
| HTTP Client | Axios | 1.4.0 | Currently unused, mock implementation |
| Maps | Mapbox GL | 3.13.0 | Ready but not fully implemented |
| QR Codes | QRCode + html5-qrcode | Latest | QR generation and scanning |
| Charts | Recharts | 2.7.2 | Analytics visualization |
| Camera | React Camera Pro | 1.4.0 | Attendance verification |
| Signatures | React Signature Canvas | 1.1.0-alpha.2 | Digital signatures |

### Repository Structure Reality Check

- **Type**: Single repository (monorepo frontend only)
- **Package Manager**: npm (detected from package.json)
- **Build Output**: `dist/` directory
- **Notable**: Frontend-first architecture with planned backend integration

---

## Source Tree and Module Organization

### Project Structure (Actual)

```text
EAS-Frontend/
├── public/                     # Static assets
│   ├── _redirects             # Netlify routing rules
│   ├── 404.html               # SPA fallback
│   ├── robots.txt             # SEO configuration
│   └── sitemap.xml            # Site structure
├── src/
│   ├── App.jsx                # Main app with provider hierarchy
│   ├── main.jsx               # React entry point
│   ├── index.css              # Global styles with TailwindCSS
│   ├── assets/                # Images, logos, styles
│   │   ├── icons/             # App icons and favicons
│   │   ├── images/            # University logos, default images
│   │   └── styles/            # Additional CSS files
│   ├── components/            # Reusable UI components
│   │   ├── ui/                # shadcn/ui base components
│   │   │   ├── Button.jsx     # Custom button with EAS theme
│   │   │   ├── Card.jsx       # Theme-aware cards
│   │   │   ├── Pagination.jsx # Data table pagination
│   │   │   └── ThemeToggle.jsx # Dark/light mode toggle
│   │   ├── layout/            # App layout components
│   │   │   ├── AppLayout.jsx  # Main layout wrapper
│   │   │   ├── Header.jsx     # Navigation with responsive design
│   │   │   ├── Footer.jsx     # Footer component
│   │   │   ├── AuthRoute.jsx  # Protected route wrapper
│   │   │   └── ThemeContext.jsx # Theme management system
│   │   ├── modal/             # Modal components
│   │   │   ├── AuthModals.jsx # Login/register modals
│   │   │   ├── LoginModal.jsx # Login form implementation
│   │   │   └── RegisterModal.jsx # Registration form
│   │   └── shared/            # Shared utilities and constants
│   │       ├── constants/     # Configuration constants
│   │       ├── devLogger.js   # Development logging system
│   │       ├── validators.js  # Form validation utilities
│   │       ├── formatting.js  # Date/time formatting
│   │       ├── security.js    # Security configurations
│   │       └── useFilters.js  # Data filtering hooks
│   ├── data/                  # Mock JSON data files
│   │   ├── mockEvents.json    # Event data with full structure
│   │   ├── mockUsers.json     # User data with roles
│   │   ├── mockAttendance.json # Attendance records
│   │   ├── mockReports.json   # Report and analytics data
│   │   ├── mockAnalytics.json # System performance data
│   │   └── mockUniversity.json # University configuration
│   ├── protected/             # Authenticated user features
│   │   ├── index.js           # Protected exports
│   │   ├── api/               # API connection utilities
│   │   │   └── apiConnect.js  # HTTP client configuration
│   │   ├── context/           # React Context providers
│   │   │   ├── AuthContext.jsx # Authentication state
│   │   │   ├── EventContext.jsx # Event management state
│   │   │   ├── ModalContext.jsx # Modal state management
│   │   │   └── DataPreloadContext.jsx # Data caching system
│   │   ├── hooks/             # Custom React hooks
│   │   │   ├── useAuth.js     # Authentication hook
│   │   │   └── useApi.js      # API call hook
│   │   ├── services/          # Business logic services
│   │   │   ├── authService.js # Authentication operations
│   │   │   ├── eventsService.js # Event CRUD operations
│   │   │   ├── attendanceService.js # Attendance management
│   │   │   └── mapboxapiService.js # Maps integration (partial)
│   │   ├── Dashboard/         # Admin dashboard
│   │   │   ├── DashboardPage.jsx # Main dashboard
│   │   │   ├── components/    # Dashboard-specific components
│   │   │   └── widgets/       # Reusable dashboard widgets
│   │   ├── Attendance/        # Attendance management
│   │   │   ├── AttendancePage.jsx # Attendance listing/management
│   │   │   └── AttendanceFormModal.jsx # Check-in/out form
│   │   ├── Management/        # Admin/organizer management
│   │   │   ├── ManagementPage.jsx # Tabbed management interface
│   │   │   ├── UserManagement.jsx # User CRUD operations
│   │   │   └── EventManagement.jsx # Event CRUD operations
│   │   ├── profile/           # User profile management
│   │   │   ├── ProfilePage.jsx # Profile editing
│   │   │   ├── DocumentUpload.jsx # File upload component
│   │   │   ├── SignatureCanvas.jsx # Digital signature
│   │   │   └── avatarUtils.js # Avatar generation utilities
│   │   ├── report/            # Analytics and reporting
│   │   │   └── ReportsPage.jsx # Three-tab analytics dashboard
│   │   ├── modal/             # Protected modal components
│   │   │   ├── ProtectedModals.jsx # Modal registry
│   │   │   ├── EventDetailsModal.jsx # Event details
│   │   │   ├── AttendanceDetailsModal.jsx # Attendance details
│   │   │   └── ViewAllEventsModal.jsx # Event browser
│   │   └── widgets/           # Shared protected widgets
│   │       ├── QuickActions.jsx # Quick action buttons
│   │       ├── StatsCard.jsx  # Statistics display
│   │       ├── EmptyState.jsx # Empty state handling
│   │       └── DataTable.jsx  # Data display tables
│   └── public/                # Public (unauthenticated) pages
│       ├── Home/              # Landing page
│       ├── Events/            # Public event listing
│       └── Roadmap/           # Project roadmap
├── docs/                      # Documentation
│   └── prd.md                 # Product requirements document
├── web-bundles/               # Development tooling
│   ├── agents/                # AI agent configurations
│   └── expansion-packs/       # Additional tool configurations
├── vite.config.js             # Vite build configuration
├── tailwind.config.js         # TailwindCSS theme configuration
├── package.json               # Dependencies and scripts
└── README.md                  # Project documentation
```

### Key Modules and Their Purpose

**Authentication System** (`src/protected/context/AuthContext.jsx`):
- JWT-based authentication with localStorage persistence
- Role-based access control (student, organizer, admin)
- Mock implementation ready for real API integration
- Comprehensive state management with reducer pattern

**Event Management** (`src/protected/Management/EventManagement.jsx`):
- Full CRUD operations for events
- Mapbox integration partially implemented
- File upload for event banners (ready for ImageKit)
- Location-based attendance settings

**Attendance System** (`src/protected/Attendance/`):
- QR code generation and scanning
- GPS location verification (framework ready)
- Camera integration for selfie verification
- Comprehensive attendance records management

**Data Preloading System** (`src/protected/context/DataPreloadContext.jsx`):
- Intelligent caching system using localStorage
- Background data loading for improved UX
- Prevents redundant API calls
- Cache invalidation strategies

**Theme System** (`src/components/layout/ThemeContext.jsx`):
- Light/dark/system theme support
- Comprehensive theme-aware component system
- Smooth transitions between themes
- TailwindCSS integration with custom EAS colors

---

## Data Models and APIs

### Current Data Structure

The application uses well-structured mock JSON files that represent the intended API responses:

**Event Model** (`src/data/mockEvents.json`):
```javascript
{
  "id": 1,
  "title": "Event Title",
  "description": "Event description",
  "category": "Academic",
  "date": "2024-01-15",
  "time": "09:00",
  "endTime": "11:00",
  "venue": {
    "name": "Venue Name",
    "address": "Full Address",
    "coordinates": { "lat": 0.0, "lng": 0.0 }
  },
  "maxAttendees": 100,
  "currentAttendees": 25,
  "organizer": "Organizer Name",
  "status": "upcoming",
  "qrCode": "QR_CODE_STRING",
  "coverImage": "image_url",
  "isPublic": true,
  "requiresRegistration": true
}
```

**User Model** (`src/data/mockUsers.json`):
```javascript
{
  "id": 1,
  "name": "User Name",
  "email": "user@example.com",
  "role": "student|organizer|admin",
  "studentId": "2024-001",
  "department": "Computer Science",
  "course": "BSCS",
  "yearLevel": "3rd Year",
  "avatar": "avatar_url",
  "isActive": true
}
```

**Attendance Model** (`src/data/mockAttendance.json`):
```javascript
{
  "id": 1,
  "userId": 1,
  "eventId": 1,
  "checkInTime": "2024-01-15T09:15:00Z",
  "checkOutTime": "2024-01-15T11:00:00Z",
  "method": "qr_code",
  "status": "present",
  "isVerified": true,
  "location": {
    "lat": 0.0,
    "lng": 0.0,
    "accuracy": 10
  }
}
```

### API Service Layer

**Current Implementation** (`src/protected/api/apiConnect.js`):
- Environment-based URL configuration
- HTTPS enforcement for production
- Request/response interceptors ready
- Authentication token management
- Error handling and retry logic

**Service Pattern** (Example: `src/protected/services/eventsService.js`):
- Consistent async/await patterns
- Mock data integration with realistic delays
- Error handling with user-friendly messages
- Logging for development debugging
- Ready for real API replacement

---

## Technical Debt and Known Issues

### Critical Technical Debt

1. **Mock Data Implementation**: Entire backend is mocked using JSON files
   - **Impact**: All CRUD operations are simulated
   - **Files**: All `src/protected/services/*.js` files
   - **Mitigation**: Service layer abstraction ready for real API integration

2. **Incomplete Mapbox Integration**: Maps functionality partially implemented
   - **Impact**: Location features not fully functional
   - **Files**: `src/protected/services/mapboxapiService.js`
   - **Mitigation**: Service structure exists, needs API key and implementation

3. **External API Placeholders**: ImageKit, Mega, Cloudflare integrations referenced but not implemented
   - **Impact**: File uploads and analytics not functional
   - **Files**: Multiple references in profile and reports components
   - **Mitigation**: Component structure ready for integration

4. **Development Logging**: Extensive console logging in production builds
   - **Impact**: Potential performance impact and information leakage
   - **Files**: `src/components/shared/devLogger.js` used throughout
   - **Mitigation**: Environment-based logging controls implemented

### Workarounds and Gotchas

**Environment Variables**: 
- Mapbox token configured but may be missing: `VITE_MAPBOX_TOKEN`
- API base URLs configured for multiple environments
- Backend disabled by default: `VITE_REACT_APP_BACKEND_DISABLED=true`

**Theme System**:
- Custom CSS variables must match TailwindCSS configuration
- Theme transitions require specific class patterns
- Dark mode classes applied to document root

**Data Preloading**:
- React StrictMode causes double effect execution (handled with ref flags)
- Cache invalidation based on timestamps
- LocalStorage quota limits not handled

**Authentication Flow**:
- JWT tokens use mock pattern: `MOCK_TOKEN_${userId}_${timestamp}`
- Session restoration on app initialization
- Role-based component rendering throughout app

---

## Integration Points and External Dependencies

### Current External Services

| Service | Purpose | Integration Status | Key Files |
|---------|---------|-------------------|-----------|
| Mapbox GL | Maps and navigation | Configured, partial implementation | `src/protected/services/mapboxapiService.js` |
| ImageKit | Profile/event images | Referenced, not implemented | Profile/event components |
| Mega Cloud | Document storage | Referenced, not implemented | Profile components |
| Cloudflare | Analytics | Referenced, not implemented | Reports components |

### Internal Integration Points

**Context Provider Hierarchy** (`src/App.jsx`):
```
ThemeProvider
└── AuthProvider
    └── DataPreloadProvider
        └── EventProvider
            └── ModalProvider
                └── Router + Components
```

**Component Communication**:
- Context-based state sharing
- Modal system for cross-component interactions
- Event-driven navigation between management interfaces
- Data preloading reduces prop drilling

**Route Protection**:
- `AuthRoute` wrapper for protected pages
- Role-based component rendering
- Redirect handling for unauthenticated access

---

## Development and Deployment

### Local Development Setup

**Actual Working Setup**:
1. `npm install` (dependencies install cleanly)
2. `npm run dev` (starts Vite dev server on port 5000)
3. Environment configuration via `.env` files (not in repo)
4. Mapbox token required for maps functionality

**Development Logging**:
- Comprehensive logging system with multiple levels
- User interaction tracking
- State change monitoring
- API call simulation with delays

### Build and Deployment Process

**Build Configuration** (`vite.config.js`):
- Vite optimized for React with SWC
- Dynamic base path for different deployment scenarios
- Proxy configuration for API development
- Environment variable exposure to client
- SPA routing configuration with 404 fallback

**Current Deployment**:
- Target: `eas-university.site` (configured in Vite)
- Static site deployment (Netlify-style routing rules)
- Production HTTPS enforcement
- Source maps enabled for debugging

### Testing Reality

**Current State**:
- No automated tests implemented
- Manual testing is primary QA method
- Component props validation missing (no PropTypes/TypeScript)
- Error boundaries not implemented

**Development Tools**:
- ESLint configuration for code quality
- Vite dev tools for hot reload
- React dev tools compatible
- Stagewise toolbar for development insights

---

## Performance and Optimization

### Current Performance Characteristics

**Bundle Analysis** (from dependencies):
- React + React DOM: ~45KB gzipped
- TailwindCSS: Purged/optimized builds
- Mapbox GL: ~500KB (largest dependency)
- Recharts: ~180KB for analytics
- Total estimated: ~800KB initial bundle

**Optimization Strategies**:
- Data preloading with localStorage caching
- Component-level code splitting opportunities
- Lazy loading not implemented
- Image optimization not implemented

**Memory Management**:
- Context providers use useMemo for stable references
- Effect cleanup in useEffect hooks
- Reference tracking to prevent memory leaks

---

## Enhancement Impact Analysis (Based on PRD)

### Files That Will Need Modification

**External API Service Layer** (Story 1.1):
- Create: `src/services/external/cloudflare.js`
- Create: `src/services/external/imagekit.js`
- Create: `src/services/external/mega.js`
- Create: `src/services/external/mapbox.js`
- Extend: `src/protected/api/apiConnect.js`

**Profile Management Enhancement** (Story 1.2):
- Modify: `src/protected/profile/ProfilePage.jsx`
- Enhance: `src/protected/profile/DocumentUpload.jsx`
- Enhance: `src/protected/profile/SignatureCanvas.jsx`

**Event Management with Maps** (Story 1.3):
- Modify: `src/protected/Management/EventManagement.jsx`
- Implement: `src/protected/services/mapboxapiService.js`
- Create: `src/components/maps/` directory

**Analytics Integration** (Story 1.5-1.6):
- Modify: `src/protected/report/ReportsPage.jsx`
- Modify: `src/protected/Dashboard/DashboardPage.jsx`
- Create: `src/components/analytics/` directory

### New Files/Modules Needed

**Service Layer**:
- `src/services/external/` directory structure
- Error handling and fallback mechanisms
- API key management utilities

**Component Enhancements**:
- Map picker components for event creation
- File upload progress indicators
- Analytics chart components
- Mobile navigation components

### Integration Considerations

**Environment Variables**: New variables needed for:
- `VITE_CLOUDFLARE_API_KEY`
- `VITE_IMAGEKIT_API_KEY`
- `VITE_MEGA_API_CREDENTIALS`
- Existing `VITE_MAPBOX_TOKEN`

**Bundle Size Impact**:
- Mapbox already included (~500KB)
- Additional external SDKs will increase bundle
- Consider lazy loading for heavy components

**State Management**:
- Extend existing Context providers
- Add caching for external API responses
- Maintain existing data preloading patterns

---

## Appendix - Useful Commands and Scripts

### Frequently Used Commands

```bash
npm run dev         # Start development server (port 5000)
npm run build       # Production build to dist/
npm run preview     # Preview production build
npm run lint        # ESLint code quality check
```

### Development Debugging

**Logging System**:
- Development logging via `devLogger.js`
- User interaction tracking enabled
- State change monitoring in React DevTools
- Network request simulation with delays

**Theme Development**:
- Theme toggle in UI for testing
- CSS custom properties for theming
- TailwindCSS configuration in `tailwind.config.js`
- Real-time theme switching without page reload

**Common Development Issues**:
- Missing Mapbox token prevents map initialization
- CORS issues resolved by Vite proxy configuration
- React StrictMode double-execution handled in effects
- Context provider order is critical for data flow

This brownfield architecture document provides the complete technical foundation needed to implement the external API integrations and advanced features outlined in the enhancement PRD while respecting the existing architectural patterns and technical constraints.
