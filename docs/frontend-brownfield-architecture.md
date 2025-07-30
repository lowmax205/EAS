# EAS Frontend Brownfield Architecture Document

## Introduction

This document captures the CURRENT STATE of the EAS React Frontend codebase, including technical patterns, dependencies, and real-world implementation details. It serves as a reference for AI agents working on frontend enhancements to the Event Attendance System.

### Document Scope

Comprehensive documentation of the React frontend application, focusing on actual implementation patterns, component architecture, and development workflow.

### Change Log

| Date | Version | Description | Author |
|------|---------|-------------|--------|
| July 30, 2025 | 1.0 | Initial brownfield analysis | Business Analyst |

## Quick Reference - Key Files and Entry Points

### Critical Files for Understanding the System

- **Main Entry**: `src/main.jsx` - React 18 app initialization with providers
- **App Component**: `src/App.jsx` - Main routing and provider setup
- **Configuration**: `vite.config.js`, `tailwind.config.js`, `components.json`
- **Core Styling**: `src/index.css` - Global styles with Tailwind + custom EAS theme
- **Route Definitions**: `src/routes/` - Authentication guards and route configuration
- **Service Layer**: `src/services/` - API clients and data preloading context
- **Feature Modules**: `src/features/` - Domain-specific feature implementations

### Development Entry Points

- **Development Server**: `npm run dev` (Vite dev server)
- **Production Build**: `npm run build` (Vite build)
- **Linting**: `npm run lint` (ESLint)
- **Preview**: `npm run preview` (Vite preview server)

## High Level Architecture

### Technical Summary

The EAS Frontend is a modern React SPA built with Vite, using a feature-based architecture with shadcn/ui components and custom EAS theming. The application implements role-based authentication, real-time QR code scanning, and comprehensive event management capabilities.

### Actual Tech Stack (from package.json)

| Category | Technology | Version | Notes |
|----------|------------|---------|--------|
| **Runtime** | React | 18.2.0 | Modern React with hooks |
| **Build Tool** | Vite | 6.3.5 | Fast dev server and build |
| **Styling** | TailwindCSS | 3.3.3 | Custom EAS theme configuration |
| **UI Components** | shadcn/ui | Latest | Component library with EAS customization |
| **Icons** | Lucide React | 0.263.1 | Consistent iconography |
| **Routing** | React Router | 6.14.2 | Client-side routing with guards |
| **HTTP Client** | Axios | 1.4.0 | API communication |
| **QR Features** | html5-qrcode | 2.3.8 | QR code scanning |
| **QR Generation** | qrcode | 1.5.3 | QR code generation |
| **Maps** | Mapbox GL | 3.13.0 | Location services |
| **Charts** | Recharts | 2.7.2 | Analytics visualization |
| **Signatures** | react-signature-canvas | 1.1.0-alpha.2 | Digital signature capture |
| **Camera** | react-camera-pro | 1.4.0 | Camera integration |

### Repository Structure Reality Check

- **Type**: Frontend-only SPA (part of fullstack monorepo)
- **Package Manager**: npm
- **Module System**: ES Modules (type: "module")
- **Development**: Vite with SWC React plugin for fast compilation

## Source Tree and Module Organization

### Project Structure (Actual)

```text
frontend/
├── public/                    # Static assets and SPA configuration
│   ├── _redirects            # Netlify/deployment redirects
│   ├── 404.html              # SPA fallback page
│   ├── robots.txt            # SEO configuration
│   └── sitemap.xml           # SEO sitemap
├── src/
│   ├── assets/               # Images, logos, styles
│   │   ├── icons/           # University logos (USC, SNSU)
│   │   ├── images/          # Default covers, university assets
│   │   └── styles/          # Legacy CSS files
│   ├── components/           # Reusable UI components
│   │   ├── ui/              # shadcn/ui base components (NOT YET IMPLEMENTED)
│   │   ├── common/          # EAS-specific reusable components
│   │   ├── forms/           # Form components and modal context
│   │   ├── layout/          # Layout components with theme context
│   │   └── charts/          # Chart components for analytics
│   ├── features/             # Feature-based modules
│   │   ├── auth/            # Authentication flow and context
│   │   ├── dashboard/       # Main dashboard and analytics
│   │   ├── attendance/      # Attendance tracking and management
│   │   ├── events/          # Event CRUD and management
│   │   ├── users/           # User management
│   │   ├── reports/         # Report generation and analytics
│   │   ├── profile/         # User profile management
│   │   ├── notifications/   # Notification system
│   │   └── settings/        # Application settings
│   ├── layouts/             # Page layout components
│   ├── pages/               # Top-level page components
│   ├── routes/              # Routing configuration and guards
│   ├── services/            # API clients and data services
│   ├── hooks/               # Custom React hooks
│   ├── lib/                 # Utility functions and helpers
│   ├── data/                # Mock data for development
│   ├── App.jsx              # Main app component with providers
│   ├── main.jsx             # React app initialization
│   └── index.css            # Global styles and Tailwind imports
├── components.json           # shadcn/ui configuration
├── tailwind.config.js        # Custom EAS theme configuration
├── vite.config.js           # Vite build configuration
├── eslint.config.js          # Linting configuration
└── package.json             # Dependencies and scripts
```

### Key Modules and Their Purpose

#### Core Application Structure

- **App.jsx**: Main application component with comprehensive provider setup
  - AuthProvider, EventProvider, ModalProvider, DataPreloadProvider
  - ThemeProvider for light/dark mode support
  - Router configuration with protected routes
  - Stagewise development toolbar integration

- **main.jsx**: React 18 initialization with strict mode

#### Feature Modules (Domain-Driven)

- **Authentication** (`features/auth/`): Complete auth flow with context management
- **Dashboard** (`features/dashboard/`): Analytics dashboard with charts and metrics
- **Events** (`features/events/`): Event CRUD, QR generation, management interface
- **Attendance** (`features/attendance/`): QR scanning, attendance tracking, validation
- **Users** (`features/users/`): User management with role-based access
- **Reports** (`features/reports/`): Analytics, export functionality, system metrics
- **Profile** (`features/profile/`): User profile editing, image uploads, digital signatures

#### Component Architecture

- **Layout Components** (`components/layout/`): Theme-aware layout with header, sidebar
- **Common Components** (`components/common/`): Reusable EAS-specific components
  - DataTable, StatsCard, FilterComponent, StatusIndicator
  - Security utilities, formatting helpers, validation logic
- **Form Components** (`components/forms/`): Modal context and form implementations
- **UI Components** (`components/ui/`): **CRITICAL NOTE**: shadcn/ui components referenced in README but not yet implemented

#### Services and Data Management

- **API Services** (`services/`): Axios-based API clients
- **Data Preloading** (`services/DataPreloadContext.jsx`): Context for preloading application data
- **Mock Data** (`data/`): Development mock data for offline testing

## Data Models and APIs

### API Integration

- **Base Configuration**: Managed via environment variables in Vite config
- **Service Pattern**: Axios-based services in `src/services/`
- **Authentication**: JWT token management through AuthContext
- **Real-time Features**: QR code scanning with html5-qrcode library

### Mock Data for Development

- `mockAnalytics.json` - Dashboard analytics data
- `mockAttendance.json` - Attendance records
- `mockEvents.json` - Event data with QR codes
- `mockReports.json` - Report generation data
- `mockUniversity.json` - University/campus data
- `mockUsers.json` - User profiles and roles

## Technical Implementation Details

### Theme System (Custom EAS Implementation)

**Current State**: Custom Tailwind configuration with comprehensive EAS theming

```javascript
// tailwind.config.js - Actual implementation
colors: {
  primary: {
    400: "#4ade80",  // Icons and accents
    500: "#22c55e",  // Primary light theme
    600: "#16a34a",  // Primary dark theme
    700: "#166534",  // Secondary light theme
  },
  eas: {
    // Custom EAS brand colors
    // Light and dark theme variants
  }
}
```

**Theme Features**:
- Class-based dark mode (`darkMode: "class"`)
- Custom color palette for university branding
- Theme transition utilities
- ThemeProvider context for state management

### QR Code Implementation

**Scanning**: html5-qrcode library for camera-based scanning
**Generation**: qrcode library for dynamic QR generation
**Integration**: Camera permissions and validation logic

### Location Services

**Provider**: Mapbox GL JS (3.13.0)
**Usage**: Event location verification and campus mapping
**Configuration**: Environment variable for Mapbox token

### Development Tools Integration

**Stagewise Toolbar**: Development debugging and monitoring
- React plugin integration
- Build-time logging in Vite config
- Development-only features

## Technical Debt and Known Issues

### Critical Implementation Gaps

1. **shadcn/ui Components**: Referenced extensively in README but not implemented
   - `components.json` configured but no actual shadcn/ui components in `/ui/` folder
   - Current implementation uses custom components without shadcn/ui base

2. **ImageKit Integration**: Mentioned in README but not found in current codebase
   - File upload functionality needs implementation
   - Profile image handling incomplete

3. **Mega Cloud Integration**: Document upload functionality not implemented
   - File upload utilities referenced but missing implementation

### Development Workflow Issues

1. **Environment Configuration**: Complex Vite config loading from parent directory
   - Environment variables loaded from `../` instead of current directory
   - Potential confusion for new developers

2. **Build Configuration**: Custom SPA fallback handling in Vite config
   - 404.html copying for deployment
   - Complex redirect handling for different hosting platforms

### Component Architecture Inconsistencies

1. **Mixed Component Patterns**: 
   - Some components use modern React patterns
   - Legacy CSS files still present in assets/styles/
   - Inconsistent use of Tailwind vs custom CSS

2. **Context Provider Setup**: 
   - Multiple providers in App.jsx may cause unnecessary re-renders
   - Provider nesting could be optimized

## Integration Points and External Dependencies

### External Services

| Service | Purpose | Integration Type | Implementation Status |
|---------|---------|------------------|----------------------|
| **Mapbox** | Location services | JavaScript SDK | ✅ Implemented |
| **ImageKit** | Image uploads | API (planned) | ❌ Not implemented |
| **Mega Cloud** | File storage | API (planned) | ❌ Not implemented |
| **Backend API** | Data services | REST API | ✅ Axios integration |

### Internal Integration Points

- **Authentication Flow**: JWT token management with axios interceptors
- **Theme System**: React Context for light/dark mode persistence
- **Modal System**: Global modal context for form dialogs
- **Data Preloading**: Context provider for application state initialization

## Development and Deployment

### Local Development Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev

# Development server runs on localhost:5173 (Vite default)
```

### Environment Variables Required

- `VITE_MAPBOX_TOKEN` - Mapbox API access token
- `VITE_API_BASE_URL_LOCAL` - Local backend API URL
- `VITE_API_BASE_URL_ONLINE` - Production backend API URL
- `VITE_GITHUB_PAGES_CUSTOM_DOMAIN` - Custom domain configuration
- `VITE_API_TIMEOUT` - API request timeout settings

### Build and Deployment Process

- **Build Command**: `npm run build` (Vite build with optimizations)
- **Preview**: `npm run preview` (Vite preview server)
- **Deployment**: Static site deployment with SPA routing support
- **Hosting**: Configured for Netlify/GitHub Pages with redirect handling

### Key Build Features

1. **SPA Routing**: Custom Vite plugin for 404.html handling
2. **Environment Loading**: Loads env vars from parent directory
3. **Development Logging**: Build-time logging for configuration validation
4. **Asset Optimization**: Vite's built-in optimizations for production

## Testing Reality

### Current Test Coverage

- **Unit Tests**: Not implemented
- **Integration Tests**: Not implemented  
- **E2E Tests**: Not implemented
- **Manual Testing**: Primary QA method
- **Development Tools**: Stagewise toolbar for debugging

### Quality Assurance

- **ESLint**: Configured with React hooks and refresh plugins
- **Development Logging**: Comprehensive logging in development mode
- **Error Boundaries**: Would need implementation for production readiness

## Architecture Strengths and Opportunities

### Strengths

1. **Modern React Architecture**: Feature-based organization with hooks and context
2. **Comprehensive Theme System**: Well-designed EAS branding integration
3. **Performance Optimized**: Vite build system with fast development experience
4. **Comprehensive Feature Set**: Complete event management and attendance tracking
5. **Mobile-First Design**: QR scanning and responsive layout consideration

### Improvement Opportunities

1. **Component Library**: Complete shadcn/ui implementation as planned
2. **File Upload Services**: Implement ImageKit and Mega integrations
3. **Testing Framework**: Add Jest/Vitest for unit and integration testing
4. **Error Handling**: Implement error boundaries and better error UX
5. **Performance Monitoring**: Add real-time performance tracking
6. **Documentation**: Component library documentation and style guide

## Appendix - Useful Commands and Scripts

### Frequently Used Commands

```bash
npm run dev              # Start development server (Vite)
npm run build            # Production build
npm run lint             # Run ESLint
npm run preview          # Preview production build
npm run deploy:preview   # Build and preview in one command
```

### Development Configuration Files

- **Vite Config**: `vite.config.js` - Build and dev server configuration
- **Tailwind Config**: `tailwind.config.js` - Custom EAS theme
- **ESLint Config**: `eslint.config.js` - Code quality rules
- **shadcn/ui Config**: `components.json` - Component library setup

### Debugging and Troubleshooting

- **Vite Logs**: Check console for build-time configuration validation
- **Environment Variables**: Use Vite config logging to verify env loading
- **Network Debugging**: Axios interceptors for API request/response logging
- **Theme Issues**: Check ThemeProvider context and Tailwind class application

---

*This document represents the actual current state of the EAS Frontend as of July 30, 2025. It should be updated as implementations progress, particularly regarding shadcn/ui integration and file upload services.*
