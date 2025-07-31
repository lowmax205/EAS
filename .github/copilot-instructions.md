# EAS Multi-Campus Event Attendance System - AI Agent Instructions

## Project Overview

EAS is a React + Vite Event Attendance System undergoing **multi-campus enhancement** for university deployment. The system manages QR-based event attendance with real-time validation, but is being expanded from single-campus (SNSU) to support multiple universities with strict data isolation.

## Critical Architecture Patterns

### Campus Data Isolation (HIGHEST PRIORITY)
- **All data models** must include `campusId` foreign key relationships
- **Every API endpoint** must filter by user's campus context automatically
- **Database queries** must enforce campus isolation at the schema level
- **Frontend components** must be campus-aware through context providers
- **Testing** prioritizes campus isolation validation over all other concerns

### Provider Hierarchy (App.jsx)
```javascript
ThemeProvider > AuthProvider > DataPreloadProvider > EventProvider > ModalProvider > Router
```
- Campus context will be injected between `AuthProvider` and `DataPreloadProvider`
- All new providers must follow this nested pattern

### Feature-Based Architecture
```
src/features/{domain}/
├── components/     # Domain-specific React components
├── hooks/          # Custom hooks (use for campus context)
├── services/       # API clients with campus filtering
├── types/          # TypeScript interfaces (if applicable)
└── index.ts        # Export barrel pattern
```

## Technology Stack & Conventions

### Frontend (React + Vite + ShadCN/UI)
- **Components**: Extend ShadCN/UI base components, never create from scratch
- **Styling**: TailwindCSS with CSS variables from `components.json` config
- **State**: Context providers for domain logic, hooks for component state
- **Routing**: React Router with `APP_ROUTES` constants from `components/common/constants`
- **Icons**: Lucide React for all iconography

### Backend (Django - Planned)
- **Models**: Campus foreign keys must be `nullable=True` for backward compatibility
- **API**: Django REST framework with campus filtering middleware
- **Testing**: Campus isolation tests are mandatory for all endpoints

## Development Workflows

### Build & Deploy
```bash
# Development
cd frontend ; npm run dev

# Production build
npm run build

# Deploy to easuniversity.site (GitHub Pages)
# Triggered via GitHub Actions workflow_dispatch
```

### Testing Strategy
- **Unit Tests (60%)**: Campus context validation, service layer campus logic
- **Integration Tests (30%)**: Campus data isolation, API campus filtering  
- **E2E Tests (10%)**: Multi-campus workflows, user journey validation
- **Critical**: Every test must verify campus data isolation

## Key Integration Points

### Mock Data & Development
- Mock data includes multiple campuses with proper isolation
- Existing SNSU data automatically assigned to `campusId: 1` (default campus)
- Test data generator creates campus-specific datasets

### QR Code Generation
- Campus context embedded in QR codes for attendance isolation
- Uses `qrcode` library with campus-specific encoding
- Validation includes campus boundary checks

### Mapbox Integration
- Location verification per campus with geofencing
- Campus-specific map boundaries and markers
- Token loaded via `VITE_MAPBOX_TOKEN` environment variable

## Documentation Structure

### Core Documentation (`docs/`)
- **Architecture**: Complete technical blueprint with multi-campus components
- **PRD**: Product Requirements Document with campus-specific features
- **Epics**: Feature roadmap tracking multi-campus enhancement progress  
- **Stories**: Implementation-ready development tasks with integration verification
- **DEVELOPMENT.md**: Coding standards and AI agent guidelines
- **TESTING.md**: Campus isolation testing strategy

### Web Bundles (`web-bundles/`)
- BMad-Method framework agents for specialized development roles
- Team configurations for different development contexts
- Use agents for role-specific development guidance

## Critical Files for Context

### Configuration
- `frontend/components.json`: ShadCN/UI configuration and aliases
- `frontend/vite.config.js`: Build configuration with environment handling
- `frontend/package.json`: Dependencies and build scripts

### Architecture
- `docs/architecture/index.md`: Multi-campus enhancement architecture
- `docs/prd/epic-1-eas-multi-campus-support-enhancement.md`: Core enhancement requirements
- `docs/stories/1.1.campus-data-model-foundation.story.md`: Database foundation implementation

### Code Structure
- `frontend/src/App.jsx`: Provider hierarchy and routing structure
- `docs/DEVELOPMENT.md`: Component patterns and coding standards
- `docs/TESTING.md`: Campus isolation testing requirements

## AI Agent Guidelines

1. **Always check campus context**: Before implementing any feature, verify campus data isolation
2. **Preserve SNSU functionality**: All existing single-campus functionality must remain unchanged
3. **Follow ShadCN/UI patterns**: Extend existing components, never create custom base components
4. **Test campus isolation**: Every change requires campus boundary validation
5. **Use feature-based organization**: Group related functionality in feature directories
6. **Reference documentation**: Check `docs/` for architectural decisions and implementation patterns

## Deployment Notes

- **Live Demo**: https://easuniversity.site (GitHub Pages custom domain)
- **Environment**: Frontend-only deployment with mock data currently
- **Backend**: Django backend planned but not yet implemented
- **CI/CD**: GitHub Actions workflow for automated deployment
