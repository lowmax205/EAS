# Responsiveness Strategy

### Breakpoint System

| Breakpoint | Min Width | Max Width | Target Devices | Primary Use Cases |
|------------|-----------|-----------|----------------|-------------------|
| Mobile | 320px | 767px | Smartphones | Event check-in, QR scanning, notifications |
| Tablet | 768px | 1023px | Tablets, small laptops | Event browsing, basic management |
| Desktop | 1024px | 1439px | Laptops, desktop monitors | Full management, analytics |
| Wide | 1440px+ | - | Large monitors, ultra-wide | Multi-campus dashboards, advanced analytics |

### Adaptation Patterns

#### Layout Transformations

**Mobile (≤767px) - "Task-Completion First"**
- **Navigation:** Hamburger menu with prioritized actions
- **Content:** Single-column, vertically stacked layout
- **Interactive Elements:** FAB for primary QR scan action
- **Campus Context:** Integrated into profile dropdown
- **Priority:** Speed and efficiency for core tasks

**Tablet (768px-1023px) - "Balanced Experience"**
- **Navigation:** Condensed horizontal nav with essential items
- **Content:** 2-column grid for dashboard widgets
- **Interactive Elements:** Touch-optimized buttons and cards
- **Campus Context:** Header indicator with dropdown
- **Priority:** Balance of information access and task completion

**Desktop (1024px-1439px) - "Information Rich"**
- **Navigation:** Full horizontal navigation with all sections
- **Content:** 3-column dashboard layout with sidebar options
- **Interactive Elements:** Hover states and keyboard shortcuts
- **Campus Context:** Persistent header indicator with quick switching
- **Priority:** Comprehensive information access and multitasking

**Wide (≥1440px) - "Multi-Campus Power User"**
- **Navigation:** Extended navigation with campus-specific sections
- **Content:** 4+ column layouts with expandable panels
- **Interactive Elements:** Advanced hover interactions and tooltips
- **Campus Context:** Split-screen or tabbed campus views
- **Priority:** Cross-campus management and advanced analytics

#### Content Adaptation Strategy

**Progressive Enhancement Approach:**
```
Mobile Foundation → Tablet Enhancement → Desktop Enrichment → Wide Optimization
```

**Content Prioritization by Screen Size:**

**Mobile Content Strategy:**
- Show 1 primary action per screen section
- Collapse secondary information into expandable accordions
- Use bottom sheets for detailed interactions
- Limit lists to 3-5 items with "View All" buttons
- Essential information only in cards

**Tablet Content Strategy:**
- Show 2-3 actions per screen section
- Balance information density with touch-friendly targets
- Use modals for complex forms and detailed views
- Display moderate list lengths (5-10 items)
- Enhanced card content with preview information

**Desktop Content Strategy:**
- Show comprehensive feature sets and data tables
- Enable multitasking with side panels and multiple views
- Use hover states for additional information
- Display full lists with advanced pagination
- Rich card content with full details

**Wide Screen Strategy:**
- Multi-campus comparison views
- Side-by-side analytics dashboards
- Advanced data visualization with multiple charts
- Comprehensive tables with all available columns
- Split-screen workflows for power users

#### Interaction Pattern Adaptations

**Touch vs. Mouse Optimization:**
- **Mobile/Tablet:** Large touch targets, swipe gestures, pull-to-refresh
- **Desktop/Wide:** Hover states, right-click menus, keyboard shortcuts, drag-and-drop

**Campus Context Switching:**
- **Mobile:** Profile menu → Campus settings → Switch
- **Tablet:** Header dropdown with campus list
- **Desktop:** Always-visible campus indicator with quick switcher
- **Wide:** Campus tabs or split-screen multi-campus view

**QR Scanning Adaptations:**
- **Mobile:** Full-screen camera with large scan area
- **Tablet:** Picture-in-picture scanner with form alongside
- **Desktop:** File upload alternative with drag-and-drop
- **Wide:** Multiple scanning workflows for bulk operations
