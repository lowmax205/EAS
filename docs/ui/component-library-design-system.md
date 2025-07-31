# Component Library / Design System

### Responsive Component Prioritization

Based on advanced card sorting analysis, components are organized into responsive priority tiers:

#### Tier 1: Critical Mobile Components (Always Visible)
- **QR Scanner Interface** - Floating Action Button for immediate access
- **Quick Actions Panel** - Primary user tasks (max 4 actions)
- **User Welcome/Status** - Personal context and notifications
- **Campus Context Indicator** - Current campus with quick switching
- **Primary Navigation** - Essential sections only (Dashboard, Events, Profile, Menu)

#### Tier 2: Adaptive Components (Screen-Size Dependent)
- **Upcoming Events List** - Condensed on mobile, expanded on desktop
- **Recent Activity Feed** - Collapsible with "View All" expansion
- **Stats Overview Cards** - 1-2 on mobile, 4+ on desktop
- **Mini Calendar** - Hidden on mobile, sidebar on desktop
- **Analytics Charts** - Simple on tablet, detailed on desktop

#### Tier 3: Desktop-First Components (Progressive Enhancement)
- **Detailed Analytics** - Desktop-optimized data visualization
- **User Management Tables** - Complex data requiring larger screens
- **Advanced Search/Filters** - Power user features
- **System Configuration** - Administrative interfaces
- **Audit Logs** - Data-heavy reporting tools

### Responsive Layout Patterns

**Mobile (≤768px) - "Task-First" Strategy:**
- Single-column layout with vertical stacking
- FAB for primary QR scanning action
- Collapsed navigation in hamburger menu
- Progressive disclosure for secondary information
- Bottom sheets for detail views

**Tablet (769px-1024px) - "Balanced Information" Strategy:**
- 2-column grid layout for dashboard widgets
- Condensed header navigation
- Modal overlays for complex interactions
- Moderate information density

**Desktop (≥1025px) - "Information Dense" Strategy:**
- 3-column dashboard layout
- Full navigation with campus context
- Sidebar panels for additional tools
- Comprehensive data tables and analytics

### Component State Adaptations

**Responsive State Patterns:**
- **Collapsed** (Mobile): Essential information only, tap to expand
- **Condensed** (Tablet): Key information with expand options
- **Expanded** (Desktop): Full information display with hover details
- **Modal** (Cross-device): Detail views that overlay main content
