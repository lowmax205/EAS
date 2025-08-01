# 🎨 Design System & Theme

### Color Palette (SNSU Themed)
```css
/* EAS Primary Colors */
--primary-400: #4ade80;       /* Icons and accents */
--primary-500: #22c55e;       /* Primary color for light theme */
--primary-600: #16a34a;       /* Primary color for dark theme */
--primary-700: #166534;       /* Secondary color for light theme */

/* EAS Secondary/Neutral Colors */
--secondary-100: #f1f5f9;     /* Hover states and backgrounds */
--secondary-200: #e2e8f0;     /* Components and progress bars */
--secondary-300: #cbd5e1;     /* Button variants */
--secondary-500: #64748b;     /* Text and accents */
--secondary-600: #475569;     /* Button variants */
--secondary-700: #334155;     /* Backgrounds and text */
--secondary-800: #1e293b;     /* Dark theme cards and hover states */
--secondary-900: #0f172a;     /* Text and dark theme */

/* EAS Specific Theme Colors (from legacy frontend) */
--eas-light-primary: #22c55e;
--eas-light-secondary: #166534;
--eas-light-accent: #dcfce7;
--eas-light-neutral: #9ca3af;
--eas-light-text: #000000;
--eas-light-bg: #ffffff;
--eas-light-card: #ffffff;

--eas-dark-primary: #16a34a;
--eas-dark-secondary: #14532d;
--eas-dark-accent: #1e293b;
--eas-dark-neutral: #64748b;
--eas-dark-highlight: #064e3b;
--eas-dark-text: #f8fafc;
--eas-dark-bg: #0f172a;
--eas-dark-card: #1e293b;

/* Semantic Colors (from legacy) */
--background-light: #ffffff;
--background-dark: #0f172a;
--foreground-light: #000000;
--foreground-dark: #f8fafc;
--card-light: #ffffff;
--card-dark: #1e293b;
--border-light: #e5e7eb;
--border-dark: #374151;
--input-light: #ffffff;
--input-dark: #1e293b;
--ring-light: #22c55e;
--ring-dark: #16a34a;
```
--light-primary: #22c55e;
--light-secondary: #166534;
--light-accent: #dcfce7;
--light-neutral: #9ca3af;
--light-text: #000000;
--light-background: #ffffff;
--light-card: #ffffff;
--light-border: #e5e7eb;
--light-input: #ffffff;
--light-ring: #22c55e;

/* Dark Theme Variables */
--dark-primary: #16a34a;
--dark-secondary: #14532d;
--dark-accent: #1e293b;
--dark-neutral: #64748b;
--dark-highlight: #064e3b;
--dark-text: #f8fafc;
--dark-background: #0f172a;
--dark-card: #1e293b;
--dark-border: #374151;
--dark-input: #1e293b;
--dark-ring: #16a34a;

/* Semantic Colors (Theme Aware) */
--success: var(--primary-500);   /* Success states */
--success-dark: var(--primary-600);
--warning: #f59e0b;              /* Warning states */
--error: #ef4444;                /* Error states */
--info: var(--primary-400);      /* Info states */
```

### Typography System
```css
/* Font Stack */
font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;

/* Scale */
--text-xs: 0.75rem;           /* 12px - Labels, captions */
--text-sm: 0.875rem;          /* 14px - Body text, forms */
--text-base: 1rem;            /* 16px - Base body text */
--text-lg: 1.125rem;          /* 18px - Subheadings */
--text-xl: 1.25rem;           /* 20px - Page titles */
--text-2xl: 1.5rem;           /* 24px - Section headings */
--text-3xl: 1.875rem;         /* 30px - Hero text */
```

### Spacing & Layout
```css
/* Spacing Scale (TailwindCSS standard) */
--space-1: 0.25rem;  --space-2: 0.5rem;   --space-3: 0.75rem;
--space-4: 1rem;     --space-6: 1.5rem;   --space-8: 2rem;
--space-12: 3rem;    --space-16: 4rem;    --space-20: 5rem;

/* Layout Breakpoints */
--mobile: 320px;     /* Minimum mobile width */
--tablet: 768px;     /* Tablet portrait */
--desktop: 1024px;   /* Desktop/laptop */
--wide: 1280px;      /* Wide desktop */
```
