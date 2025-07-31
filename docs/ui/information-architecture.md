# Information Architecture

### Site Map / Screen Inventory

Based on card sorting analysis and user mental models, the EAS system organizes into these primary sections:

```mermaid
graph TD
    A[Homepage] --> AUTH{Authentication}
    AUTH -->|Login| B[Dashboard]
    AUTH -->|Public| C[Public Events]
    
    B --> B1[My Events]
    B --> B2[Quick Actions]
    B --> B3[Recent Activity]
    B --> B4[Analytics Overview]
    
    C --> C1[Browse Events]
    C --> C2[Event Details]
    C --> C3[Event Registration]
    
    B --> D[Event Management]
    D --> D1[Create Event]
    D --> D2[My Events List]
    D --> D3[Live Attendance]
    
    B --> E[Reports & Analytics]
    E --> E1[Attendance Reports]
    E --> E2[Event Analytics]
    E --> E3[Cross-Campus Data]
    
    B --> F[Profile & Settings]
    F --> F1[User Profile]
    F --> F2[Campus Selection]
    F --> F3[Preferences]
    
    %% Campus Context Layer
    G[Campus Context] -.-> B
    G -.-> D  
    G -.-> E
```

### Navigation Structure

**Primary Navigation (Header)**
- **Mobile Priority:** Dashboard, Events, Quick Scan, Profile
- **Desktop Full:** Home, Events, Dashboard, Management, Reports, Profile
- **Campus Context:** Persistent indicator with quick switching capability

**Secondary Navigation Patterns**
- **Mobile:** Hamburger menu with role-based content prioritization
- **Tablet:** Condensed header with dashboard widget adaptation
- **Desktop:** Full feature access with sidebar expansion options

**Card Sorting Insights Applied:**
- **Quick Event Actions** prioritized for mobile thumb navigation
- **Event Organization** tools accessible but not primary mobile focus  
- **System Overview** features optimized for desktop workflows
- **Campus Context** integrated without overwhelming single-campus users

**Responsive Navigation Strategy:**
- Mobile (≤768px): Task-completion focused with FAB for QR scanning
- Tablet (769px-1024px): Balanced task and information access
- Desktop (≥1025px): Full information density with multitasking support
