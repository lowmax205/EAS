# EAS (Event Attendance System) - AI Copilot Instructions

This is a **mobile web-based attendance monitoring system** for university events using Django REST Framework backend and React frontend with multi-factor authentication (QR codes + GPS + Selfie verification).

## Architecture Overview

**Two-Repository Structure:**
- `backend/` - Django 5.1.3 + DRF with modular app organization 
- `frontend/` - React 18 + Vite + TailwindCSS with feature-based structure

**Core Technology Stack:**
- Backend: Django + DRF + JWT auth + PostgreSQL/SQLite + QR codes
- Frontend: React + Vite + TailwindCSS + Axios + React Router
- Key APIs: Mapbox (GPS), Imagekit (photos), Mega Cloud (documents)

## Project Context & Current State

**Academic Timeline:** This is a **thesis project** targeting completion by **August 10, 2025**. The frontend is complete with mock data, currently transitioning to Django backend implementation.

**Key Business Logic:**
- Multi-factor attendance: QR codes + GPS geofencing + selfie verification
- Role-based system: Students, organizers, admins
- Real-time dashboard with analytics and reporting
- Event management with campus isolation

## Development Patterns

### Django Backend Structure
```
backend/
├── config/             # Main Django project settings
│   ├── settings/       # Environment-specific configs
├── apps/               # Modular Django apps
│   ├── account/        # JWT auth, user management  
│   ├── attendance/     # Core attendance logic
│   ├── event/          # Event management
│   ├── qr_system/      # QR generation/validation
│   ├── analytics/      # Reporting dashboards
│   └── notifications/  # Email system
```

### React Frontend Patterns
```
frontend/src/
├── features/           # Feature-based organization
│   ├── attendance/     # Attendance flow components
│   ├── events/         # Event management
│   ├── dashboard/      # Analytics dashboard
├── components/         # Shared UI components
├── services/          # API clients (Axios)
├── hooks/             # Custom React hooks
├── layouts/           # App layout components
```

### Key Conventions

**Theme System:** EAS uses a sophisticated light/dark theme with CSS custom properties:
- Primary colors: `primary-500` (light), `primary-600` (dark)
- Theme switching via `ThemeContext` and `class` strategy in TailwindCSS
- All components support both themes consistently

**API Integration:** 
- Axios service layer in `services/` with centralized error handling
- JWT token management with auto-refresh patterns
- RESTful endpoints following Django DRF conventions

**Component Patterns:**
- Feature-based organization over atomic design
- Consistent prop interfaces with TypeScript-style documentation
- Layout components (`AppLayout`, `AuthRoute`) handle common patterns

## Critical Development Workflows

### Backend Development
```bash
# From backend/ directory
python -m venv .env
source .env/Scripts/activate  # Windows
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver  # Port 8000
```

### Frontend Development  
```bash
# From frontend/ directory
npm install
npm run dev  # Port 5173
npm run build
npm run preview
```

### Testing Patterns
- Frontend: Vitest + Testing Library (`npm test`)
- Backend: pytest-django with factory-boy for fixtures
- E2E: Manual testing protocols for attendance flows

## Integration Points & Dependencies

**Critical External Services:**
- **Mapbox API**: GPS verification requires API key in environment
- **Imagekit.io**: Photo upload/optimization service
- **Mega Cloud**: Document storage for reports
- **Gmail SMTP**: Email notifications

**Development vs Production:**
- Development uses SQLite, production uses PostgreSQL
- Mock data system for frontend development without backend
- CORS configuration for cross-origin requests during development

## Known Constraints & Gotchas

**Academic Requirements:**
- Must support 50+ concurrent users for thesis validation
- Requires official PDF export formats for university compliance
- GPS accuracy critical for fraud prevention (geofencing)

**Technical Limitations:**
- Network dependency for real-time features
- GPS accuracy affected by indoor/weather conditions  
- Camera quality impacts selfie verification reliability

**BMad Method Integration:**
- This project uses BMad Method for development workflow
- Documentation follows brownfield patterns for existing codebase
- Structured agent-based development with predefined workflows

## Quick Reference Commands

**Start Development:**
```bash
# Terminal 1 (Backend)
cd backend ; python manage.py runserver

# Terminal 2 (Frontend)  
cd frontend ; npm run dev
```

**Access Points:**
- Frontend: http://localhost:5173
- Backend API: http://localhost:8000/api
- Admin Panel: http://localhost:8000/admin

**Key Files for Understanding:**
- `README.md` - Complete project overview
- `docs/project/` - Academic requirements and timeline
- `frontend/package.json` - Dependencies and scripts
- `backend/requirements.txt` - Python dependencies
- `frontend/tailwind.config.js` - Theme system configuration
