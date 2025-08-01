# Epic 1: Authentication & Role Management System

### Story 1.1: User Registration & Login
**As a** student/organizer/admin  
**I want to** register and login securely  
**So that** I can access role-appropriate system features

**Acceptance Criteria:**
- [ ] User can register with email, password, and role selection
- [ ] Email verification required before account activation
- [ ] Secure login with JWT token generation
- [ ] Role-based redirect after successful login
- [ ] Password reset functionality via email
- [ ] Session management with automatic logout after inactivity

**Technical Specs:**
- Django User model with custom roles (Admin, Organizer, Student)
- JWT authentication with refresh tokens
- Email verification via Django's email backend
- Role-based middleware for route protection

### Story 1.2: Role-Based Access Control
**As a** system administrator  
**I want to** enforce role-based permissions  
**So that** users only access appropriate features

**Acceptance Criteria:**
- [ ] Admin: Full CRUD access to all resources
- [ ] Organizer: All permissions except user/campus create/delete
- [ ] Student: Read-only access to own data, attendance submission
- [ ] Clear error messages for unauthorized access attempts
- [ ] Role-based navigation menu rendering

**Technical Specs:**
- Django permissions framework with custom permission classes
- DRF permission classes for API endpoint protection
- Frontend route guards based on user role
- Role-based component rendering in React

---
