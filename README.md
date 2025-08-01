# 🎓 EAS-React (Event Attendance System)

**A Comprehensive Mobile Web-Based Attendance Monitoring System with Integrated Analytics for School Events of the University**

[![Live Demo](https://img.shields.io/badge/Live_Demo-easuniversity.site-blue)](https://easuniversity.site)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![React](https://img.shields.io/badge/React-18.2.0-blue.svg)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-6.3.5-646CFF.svg)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4.1-38B2AC.svg)](https://tailwindcss.com/)
[![shadcn/ui](https://img.shields.io/badge/shadcn%2Fui-Latest-000000.svg)](https://ui.shadcn.com/)
[![Django](https://img.shields.io/badge/Django-4.2.0-092E20.svg)](https://djangoproject.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15.0-316192.svg)](https://postgresql.org/)

---

## 📋 Project Overview

**Surigao del Norte State University (SNSU)** Event Attendance System (EAS) addresses critical challenges in traditional attendance monitoring through innovative technology solutions.

### 🚀 Key Features
- **🔐 Multi-Factor Authentication**: QR + GPS + Selfie verification prevents attendance fraud
- **📊 Real-time Analytics**: Live monitoring with comprehensive dashboard insights  
- **📱 Mobile-First PWA**: Accessible on any device without app installation
- **🛡️ Enterprise Security**: Advanced authentication and data protection
- **📈 Automated Reporting**: Official format exports and comprehensive analytics
- **☁️ Cloud Infrastructure**: Scalable system with 99.9% uptime guarantee

### 🎯 Core Objectives
1. **Event Attendance Management** - Django-based system with secure authentication
2. **QR Code Tracking** - Encrypted QR codes with real-time validation
3. **Location & Visual Verification** - GPS + selfie fraud prevention
4. **Automated Reporting** - Real-time dashboards and official format exports

> **📚 For complete documentation, visit: [docs/](docs/)**

## 🚀 Quick Start

### Prerequisites
- **Node.js** 18+ and npm
- **Python** 3.11+ with pip
- **PostgreSQL** 15+ (production) / SQLite (development)
- **Git** for version control

### Development Setup

```bash
# Clone the repository
git clone https://github.com/lowmax205/EAS.git
cd EAS

# Backend setup
cd backend
python -m venv .env
source .env/Scripts/activate  # On Windows: .env\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver

# Frontend setup (new terminal)
cd frontend
npm install
npm run dev
```

### 🌐 Access Points
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000/api
- **Admin Panel**: http://localhost:8000/admin

## � Documentation

### � Complete Documentation
Visit **[docs/](docs/)** for comprehensive documentation including:

- **[Project Overview](docs/project/)** - Requirements, timeline, and specifications
- **[Product Requirements](docs/prd/)** - Detailed PRD with user stories and epics  
- **[Technical Architecture](docs/architecture/)** - System design and implementation
- **[Frontend Specifications](docs/frontend/)** - UI/UX design and component library

### 🎯 Quick Links
- **[Getting Started Guide](docs/project/implementation-strategy.md)** - Development workflow
- **[API Documentation](docs/architecture/api-integration-patterns.md)** - REST endpoints and patterns
- **[Component Library](docs/frontend/advanced-ui-components.md)** - UI components and themes
- **[Deployment Guide](docs/architecture/deployment-strategy.md)** - Production deployment

### 🎓 Academic Materials
- **[Thesis Documentation](docs/project/academic-integration.md)** - Research contribution and methodology
- **[Defense Materials](docs/project/panel-mandated-technical-requirements.md)** - Panel requirements and validation

## 🛠️ Technology Stack

### Core Technologies
- **Backend**: Django 4.2 + Django REST Framework + JWT Authentication
- **Frontend**: React 18 + Vite + TailwindCSS + shadcn/ui
- **Database**: PostgreSQL (production) / SQLite (development)
- **Mobile**: Progressive Web App (PWA) with device APIs

### Key Integrations
- **Location**: Mapbox API for GPS verification
- **Storage**: ImageKit.io (images) + Mega Cloud (documents)
- **Analytics**: Cloudflare API for performance monitoring
- **Email**: Gmail SMTP for notifications

## 📁 Project Structure

```
EAS/
├── docs/                    # � Comprehensive documentation
│   ├── project/            # Project overview and requirements
│   ├── prd/               # Product requirements and user stories
│   ├── architecture/      # Technical architecture and design
│   └── frontend/          # UI/UX specifications and components
├── frontend/              # ⚛️ React + Vite + TailwindCSS
│   ├── src/components/    # UI components and layouts
│   ├── src/features/      # Feature-based organization
│   └── src/services/      # API clients and utilities
├── backend/               # 🐍 Django + DRF API
│   ├── apps/             # Modular Django applications
│   ├── config/           # Settings and configuration
│   └── utils/            # Shared utilities and permissions
└── deployment/           # 🚀 Production configurations
```

## 🎯 Features & Requirements

### Core Features (Must Have)
- **🔐 Role-based Authentication**: Student, organizer, admin access levels
- **📅 Event Management**: CRUD operations with scheduling and location
- **📱 QR Code System**: Dynamic generation and real-time validation  
- **🌍 Multi-factor Verification**: QR + GPS + Selfie authentication
- **📊 Real-time Dashboard**: Live analytics and attendance monitoring
- **📄 Automated Reports**: Official format exports (PDF/CSV) with photos

### Advanced Features (Should Have)
- **🗺️ GPS Verification**: Mapbox API integration with geofencing
- **📸 Selfie Authentication**: Event-specific background verification
- **✍️ Digital Signatures**: Signature pad for additional security
- **📧 Email Notifications**: SMTP integration for event updates
- **🏢 Multi-campus Support**: Campus isolation and branding
- **📈 Advanced Analytics**: Department-based reporting with visual charts

### Future Enhancements (Could Have)
- **🤖 AI-Powered Analytics**: Machine learning for pattern analysis
- **👆 Biometric Integration**: Fingerprint and facial recognition
- **📜 Certificate Generation**: Automated attendance certificates
- **📱 Native Mobile Apps**: iOS/Android applications

### 🚫 Known Limitations
- **📶 Network Dependency**: Requires stable internet for real-time features
- **🌧️ Environmental Factors**: GPS accuracy affected by weather/buildings
- **💡 Lighting Conditions**: Poor lighting may impact selfie verification

## 📈 Success Metrics

### Technical Performance
- **⚡ Response Time**: <3 seconds for all user interactions
- **📱 Mobile Performance**: Lighthouse score >85
- **👥 Concurrent Users**: Support for 50+ simultaneous users
- **⏱️ Uptime**: 99%+ availability during critical events

### Functional Success
- **✅ Attendance Flow**: 100% success rate for valid submissions
- **📊 Report Generation**: All exports complete within 30 seconds  
- **🔄 Real-time Updates**: Dashboard refreshes within 3 seconds
- **🔒 Security**: 100% role-based access enforcement

## 🔄 Development Status

**Current Phase**: Architecture revision and feature completion
**Thesis Defense**: August 15, 2025 (14 days remaining)
**Target**: Production-ready system with full feature implementation

### Recent Updates
- ✅ Sharded documentation structure for better organization
- ✅ Enhanced README with comprehensive project overview
- ✅ Organized technical specifications by domain
- 🚧 Ongoing backend API development and frontend integration

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 📞 Contact & Support

**Project Maintainer**: [lowmax205](https://github.com/lowmax205)  
**Institution**: Surigao del Norte State University (SNSU)  
**Live Demo**: [easuniversity.site](https://easuniversity.site)  
**Issues**: [GitHub Issues](https://github.com/lowmax205/EAS/issues)

---

## 🙏 Acknowledgments

Special thanks to:
- **Surigao del Norte State University** for institutional support and requirements
- **React**, **Vite**, **TailwindCSS**, and **shadcn/ui** teams for excellent development tools
- **Django** and **DRF** for robust backend framework capabilities
- **Mapbox**, **ImageKit.io**, **Mega Cloud**, and other service providers
- **BMad Method** for documentation and development workflow organization
- **All contributors** who helped shape this project with valuable feedback

---

**⭐ If you find this project helpful, please give it a star!**

---

_Last Updated: August 1, 2025_
