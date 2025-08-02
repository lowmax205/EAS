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
- **CRITICAL**: Always use `tailwind.config.js` color palette - never hardcoded colors
- Primary colors: `primary-500` (light), `primary-600` (dark) 
- Theme utilities: `.bg-theme`, `.text-theme`, `.card-theme`, `.shadow-theme`
- Semantic colors: `background-light/dark`, `foreground-light/dark`, `card-light/dark`
- Theme switching via `ThemeContext` and `class` strategy in TailwindCSS

**API Integration:** 
- Axios service layer in `services/` with centralized error handling
- JWT token management with auto-refresh patterns
- RESTful endpoints following Django DRF conventions

**Component Patterns:**
- Feature-based organization over atomic design
- **CRITICAL**: Follow `eslint.config.js` rules - custom config with React refresh
- Consistent prop interfaces with TypeScript-style documentation
- Layout components (`AppLayout`, `AuthRoute`) handle common patterns

## Critical Development Workflows

**IMPORTANT SHELL CONVENTIONS:**
- **ALWAYS use `;` instead of `&&` in terminal commands** (Windows PowerShell requirement)
- **ALWAYS terminate existing servers before starting new ones**

### Backend Development
```bash
# From backend/ directory - ALWAYS terminate existing Django server first
taskkill /f /im python.exe 2>nul ; python -m venv .env
.env\Scripts\activate ; pip install -r requirements.txt
python manage.py migrate ; python manage.py runserver  # Port 8000
```

### Frontend Development  
```bash
# From frontend/ directory - ALWAYS terminate existing Node servers first
taskkill /f /im node.exe 2>nul ; npm install
npm run dev  # Port 5173 - follows eslint.config.js rules
npm run build ; npm run preview  # Use ; not &&
```

### Development Server Management
```bash
# Kill all development servers (run before starting)
taskkill /f /im python.exe 2>nul ; taskkill /f /im node.exe 2>nul

# Start both servers (separate terminals)
# Terminal 1: cd backend ; python manage.py runserver
# Terminal 2: cd frontend ; npm run dev
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

**Kill Existing Servers (ALWAYS run first):**
```bash
taskkill /f /im python.exe 2>nul ; taskkill /f /im node.exe 2>nul
```

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
