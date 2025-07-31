# Design System & ShadCN/UI Integration

### Current System Audit Results

**✅ Strengths Identified:**
- Solid ShadCN/UI foundation with CSS variables
- Consistent component architecture with variants and sizes
- Good accessibility practices with proper ARIA labels
- Theme-aware styling with light/dark mode support
- Centralized UI constants and interaction logging

**⚠️ Critical Responsive Gaps:**
- Button sizes not optimized for mobile touch targets (44px minimum)
- Missing mobile-specific component variants (FAB, bottom sheets)
- Card components lack responsive breakpoint adaptations
- No campus-specific theming tokens defined
- Missing progressive enhancement patterns

### Enhanced Responsive Component Specifications

#### Button System (Mobile-Optimized)

**Touch-Optimized Size Scale:**
```javascript
sizes: {
  xs: "px-2 py-1 text-xs",                    // Desktop micro-actions only
  sm: "px-3 py-2 text-sm md:px-2 md:py-1",   // Responsive small buttons  
  md: "px-4 py-3 text-sm md:px-4 md:py-2",   // Standard responsive button
  lg: "px-6 py-4 text-base md:px-6 md:py-3", // Large responsive button
  xl: "px-8 py-5 text-lg md:px-8 md:py-4",   // CTA buttons
  touch: "min-h-[44px] px-4 py-3 text-base", // Mobile touch target
}
```

**Mobile-First Variants:**
```javascript
variants: {
  // Existing variants +
  "mobile-primary": "min-h-[44px] w-full bg-primary-600 text-white rounded-lg",
  "mobile-fab": "fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-2xl z-50",
  "mobile-sheet": "w-full rounded-t-xl bg-white dark:bg-gray-800 border-t",
  "campus-primary": "bg-campus-primary hover:bg-campus-primary-dark",
}
```

#### Card System (Breakpoint-Aware)

**Responsive Card Variants:**
```javascript
card: {
  base: "card-theme transition-all duration-200",
  mobile: "rounded-none border-x-0 shadow-sm border-y full-width",
  tablet: "rounded-lg shadow-md border mx-2",
  desktop: "rounded-xl shadow-lg border hover:shadow-xl transform hover:-translate-y-1",
  compact: "p-3 sm:p-4 lg:p-6",
  dashboard: "p-4 sm:p-6 lg:p-8 min-h-[200px] sm:min-h-[240px]",
}
```

#### Campus Theming Tokens

**Multi-Campus Color System:**
```javascript
campus: {
  snsu: {
    primary: "#22c55e",     // Current SNSU green
    secondary: "#166534",   
    accent: "#dcfce7",
  },
  usc: {
    primary: "#3b82f6",     // USC blue  
    secondary: "#1e40af",
    accent: "#dbeafe",
  },
  // Extensible for additional campuses
}
```

#### Responsive Typography Scale

**Screen-Adaptive Text Sizing:**
| Element | Mobile | Tablet | Desktop | Usage Context |
|---------|--------|--------|---------|---------------|
| H1 | 1.875rem | 2.25rem | 3rem | Page titles, hero sections |
| H2 | 1.5rem | 1.875rem | 2.25rem | Section headers |
| H3 | 1.25rem | 1.5rem | 1.875rem | Card titles, widget headers |
| Body | 1rem | 1rem | 1.125rem | Main content, descriptions |
| Small | 0.875rem | 0.875rem | 1rem | Meta info, captions |
| Button | 1rem | 1rem | 1.125rem | Action text |
| Touch | 1.125rem | 1rem | 1rem | Mobile-first interactive text |

#### Touch Target Specifications

**Mobile Interaction Guidelines:**
- Minimum touch target: 44px × 44px (iOS/Android standard)
- Recommended spacing between targets: 8px minimum
- Interactive elements padding: 12px vertical, 16px horizontal minimum
- Card tap areas: Full card should be tappable with visual feedback
- List items: 56px minimum height for comfortable scrolling
