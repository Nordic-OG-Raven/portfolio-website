# UI/UX Implementation Plan - Nordic Raven Solutions

## Overview

This document outlines the phased implementation of the design system defined in `UIX.md`. The goal is to transform the portfolio from its current state (inconsistent styling across projects) to a cohesive, professional brand experience.

**Timeline**: Phased approach over multiple iterations
**Priority**: High consistency, professional polish, maintainable code

---

## Phase 1: Foundation (Design System Setup)

### 1.1 Update Tailwind Configuration

**File**: `tailwind.config.ts` (create if doesn't exist) or update `globals.css` for Tailwind v4

**Tasks**:
- [ ] Define brand color palette (purple-700, slate-950, slate-800, etc.)
- [ ] Set up spacing scale (8px base unit)
- [ ] Configure border radius tokens
- [ ] Set up typography scale
- [ ] Define shadow tokens
- [ ] Configure transition defaults

**Implementation**:

```typescript
// tailwind.config.ts
export default {
  theme: {
    extend: {
      colors: {
        brand: {
          bg: '#0f172a',      // slate-950
          surface: '#1e293b', // slate-800
          primary: '#7c3aed', // purple-700
          'primary-hover': '#6d28d9', // purple-800
          border: '#1e293b',  // slate-800
          text: '#f1f5f9',    // slate-100
          'text-secondary': '#94a3b8', // slate-400
          'text-muted': '#64748b', // slate-500
        },
      },
      borderRadius: {
        'sm': '4px',
        'md': '8px',
        'lg': '12px',
      },
      spacing: {
        // 8px base unit
        '18': '4.5rem', // 72px
        '22': '5.5rem', // 88px
      },
      boxShadow: {
        'card': '0 4px 6px rgba(0, 0, 0, 0.2)',
        'card-hover': '0 10px 15px rgba(0, 0, 0, 0.3)',
      },
      transitionDuration: {
        'fast': '150ms',
        'base': '200ms',
        'slow': '300ms',
      },
    },
  },
}
```

**Or for Tailwind v4** (update `globals.css`):

```css
@theme {
  --color-brand-bg: #0f172a;
  --color-brand-surface: #1e293b;
  --color-brand-primary: #7c3aed;
  --color-brand-border: #1e293b;
  --color-brand-text: #f1f5f9;
  --color-brand-text-secondary: #94a3b8;
  
  --radius-md: 8px;
  --radius-lg: 12px;
  
  --spacing-scale: 8px;
}
```

### 1.2 Update Global Styles

**File**: `app/globals.css`

**Tasks**:
- [ ] Remove light mode variables (always dark)
- [ ] Set default background to slate-950
- [ ] Configure base typography (Geist Sans)
- [ ] Set up smooth scrolling
- [ ] Add reduced motion support

**Implementation**:

```css
@import "tailwindcss";

:root {
  --background: #0f172a;      /* slate-950 - always dark */
  --foreground: #f1f5f9;       /* slate-100 */
  --primary: #7c3aed;          /* purple-700 */
  --secondary: #94a3b8;        /* slate-400 */
  --accent: #6d28d9;           /* purple-800 */
  --surface: #1e293b;          /* slate-800 */
  --border: #1e293b;            /* slate-800 */
}

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-primary: var(--primary);
  --color-secondary: var(--secondary);
  --color-accent: var(--accent);
  --color-surface: var(--surface);
  --color-border: var(--border);
  --font-sans: var(--font-geist-sans);
  --font-mono: var(--font-geist-mono);
}

/* Remove dark mode media query - always dark */

body {
  background: var(--background);
  color: var(--foreground);
  font-family: var(--font-geist-sans), system-ui, sans-serif;
}

html {
  scroll-behavior: smooth;
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

### 1.3 Create Base Component Library

**Directory**: `app/components/ui/`

**Components to Create**:
- [ ] `Button.tsx` - Primary, secondary, ghost variants
- [ ] `Card.tsx` - Base card component with consistent styling
- [ ] `Badge.tsx` - Status badges (Live Demo, Case Study, etc.)
- [ ] `Section.tsx` - Section wrapper with consistent spacing
- [ ] `Input.tsx` - Form inputs with brand styling
- [ ] `LoadingSkeleton.tsx` - Skeleton loaders for content

**Example: Button.tsx**

```tsx
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  children: React.ReactNode;
}

export function Button({ variant = 'primary', className = '', children, ...props }: ButtonProps) {
  const baseClasses = 'px-6 py-3 rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-700 focus:ring-offset-2 focus:ring-offset-slate-950';
  
  const variants = {
    primary: 'bg-purple-700 text-white hover:bg-purple-600 hover:shadow-lg active:scale-95',
    secondary: 'border-2 border-purple-700 text-purple-700 hover:bg-purple-700 hover:text-white',
    ghost: 'text-purple-700 hover:text-purple-600',
  };
  
  return (
    <button className={`${baseClasses} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}
```

**Example: Card.tsx**

```tsx
interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

export function Card({ children, className = '', hover = true }: CardProps) {
  const hoverClasses = hover 
    ? 'hover:border-purple-700/60 hover:-translate-y-1 hover:shadow-lg transition-all duration-200'
    : '';
  
  return (
    <div className={`bg-slate-800 rounded-xl border border-slate-800 p-6 ${hoverClasses} ${className}`}>
      {children}
    </div>
  );
}
```

---

## Phase 2: Main Portfolio Site Refactor

### 2.1 Update Homepage Components

**Files to Update**:
- [ ] `app/components/Hero.tsx`
- [ ] `app/components/About.tsx`
- [ ] `app/components/Projects.tsx`
- [ ] `app/components/Contact.tsx`
- [ ] `app/components/Header.tsx`
- [ ] `app/components/Footer.tsx`

**Hero.tsx Changes**:
- [ ] Dark background (remove light mode)
- [ ] Add subtle animated gradient background
- [ ] Update colors to purple-700 for primary text
- [ ] Use new Button component
- [ ] Add scroll animation (fade-up on load)

**About.tsx Changes**:
- [ ] Dark background
- [ ] Update stat cards to use Card component
- [ ] Purple-700 accents
- [ ] Consistent spacing

**Projects.tsx Changes**:
- [ ] All project cards use Card component
- [ ] Consistent hover effects
- [ ] Purple-700 accents
- [ ] Use Badge component for status

**Header.tsx Changes**:
- [ ] Dark background with backdrop blur
- [ ] Purple-700 for logo/text
- [ ] Consistent border styling

### 2.2 Add Animations

**Install Dependencies**:
```bash
npm install framer-motion
```

**Implementation**:
- [ ] Add fade-in animations to Hero section
- [ ] Add scroll-triggered animations to sections (using Intersection Observer or Framer Motion)
- [ ] Add hover effects to all cards
- [ ] Add loading states with skeleton loaders

**Example: Scroll Animation Hook**

```tsx
// hooks/useScrollAnimation.ts
import { useEffect, useRef, useState } from 'react';

export function useScrollAnimation() {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  return { ref, isVisible };
}
```

---

## Phase 3: Case Study Pages

### 3.1 Create Shared Layout Component

**File**: `app/components/LayoutShell.tsx`

**Purpose**: Wrapper for case study pages to ensure consistency

```tsx
import Header from './Header';
import Footer from './Footer';
import Link from 'next/link';

export function LayoutShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <Header />
      <main className="pb-16 pt-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back Button */}
          <div className="mb-6">
            <Link 
              href="/" 
              className="inline-flex items-center gap-2 text-purple-700 hover:text-purple-600 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Portfolio
            </Link>
          </div>
          {children}
        </div>
      </main>
      <Footer />
    </div>
  );
}
```

### 3.2 Refactor FinSight Page

**File**: `app/finsight/page.tsx`

**Changes**:
- [ ] Wrap with LayoutShell
- [ ] Replace all `bg-gray-50` with `bg-slate-950`
- [ ] Replace all `bg-white` with `bg-slate-800`
- [ ] Replace all `text-gray-*` with `text-slate-*`
- [ ] Replace all `bg-blue-600` buttons with purple-700
- [ ] Replace all `border-gray-*` with `border-slate-*`
- [ ] Use Card component for all cards
- [ ] Use Button component for all buttons
- [ ] Add loading skeletons
- [ ] Update hover effects to match design system

**Key Replacements**:
- `bg-gray-50` → `bg-slate-950`
- `bg-white` → `bg-slate-800`
- `bg-blue-600` → `bg-purple-700`
- `text-gray-900` → `text-slate-100`
- `text-gray-700` → `text-slate-400`
- `border-gray-300` → `border-slate-800`

### 3.3 Refactor AI News Page

**File**: `app/ainews/page.tsx`

**Changes**: Same as FinSight
- [ ] Wrap with LayoutShell
- [ ] Apply dark theme
- [ ] Use Card and Button components
- [ ] Consistent styling

### 3.4 Refactor Novo Nordisk Page

**File**: `app/novo-nordisk/page.tsx`

**Changes**: Same pattern
- [ ] Wrap with LayoutShell
- [ ] Dark theme
- [ ] Consistent components

---

## Phase 4: External Projects

### 4.1 CodePractice.AI (Tutor) - Full Theme Application

**Location**: `/Users/jonas/Tutor`

**Tasks**:
- [ ] Copy Tailwind config from main portfolio
- [ ] Update `src/index.css` with dark theme
- [ ] Replace all light theme colors with dark theme
- [ ] Add branding bar component (top of app)
- [ ] Update all buttons to match design system
- [ ] Update all cards to match design system
- [ ] Test on mobile (mobile-first design)

**Files to Update**:
- [ ] `tailwind.config.js` - Copy brand colors
- [ ] `src/index.css` - Dark theme, brand colors
- [ ] All component files - Update colors and styles
- [ ] Create `BrandingBar.jsx` component

**Branding Bar Component**:

```jsx
// src/components/BrandingBar.jsx
export function BrandingBar() {
  return (
    <div className="bg-slate-950 border-b border-slate-800 px-4 py-3">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-purple-700 font-bold">Nordic Raven Solutions</span>
          <span className="text-slate-400">•</span>
          <span className="text-slate-400 text-sm">CodePractice.AI</span>
        </div>
        <a 
          href="https://nordicravensolutions.com" 
          className="text-purple-700 hover:text-purple-600 text-sm transition-colors"
        >
          ← Back to Portfolio
        </a>
      </div>
    </div>
  );
}
```

### 4.2 CurRag - Streamlit Theme

**Location**: `/Users/jonas/CurRag`

**Tasks**:
- [ ] Create `.streamlit/config.toml` with dark theme
- [ ] Set primary color to purple-700
- [ ] Set background to slate-950
- [ ] Create branding bar component (Streamlit custom component or HTML)
- [ ] Update app.py to include branding bar

**Streamlit Theme Config**:

```toml
# .streamlit/config.toml
[theme]
primaryColor = "#7c3aed"  # purple-700
backgroundColor = "#0f172a"  # slate-950
secondaryBackgroundColor = "#1e293b"  # slate-800
textColor = "#f1f5f9"  # slate-100
font = "sans serif"
```

**Branding Bar in Streamlit**:

```python
# Add to app.py
def render_branding_bar():
    st.markdown("""
    <div style="background-color: #0f172a; border-bottom: 1px solid #1e293b; padding: 12px 16px; margin-bottom: 16px;">
        <div style="max-width: 1200px; margin: 0 auto; display: flex; justify-content: space-between; align-items: center;">
            <div style="display: flex; align-items: center; gap: 12px;">
                <span style="color: #7c3aed; font-weight: bold;">Nordic Raven Solutions</span>
                <span style="color: #94a3b8;">•</span>
                <span style="color: #94a3b8; font-size: 14px;">CurRag</span>
            </div>
            <a href="https://nordicravensolutions.com" style="color: #7c3aed; text-decoration: none; font-size: 14px;">← Back to Portfolio</a>
        </div>
    </div>
    """, unsafe_allow_html=True)

# Call at top of main()
render_branding_bar()
```

### 4.3 Superset Dashboards

**Location**: Superset dashboard embeds

**Tasks**:
- [ ] Create branded landing page wrapper
- [ ] Match main site design (dark theme, purple-700)
- [ ] Embed Superset dashboard in iframe
- [ ] Add navigation back to portfolio

**Note**: Superset dashboards are hard to theme, so a wrapper page is the best approach.

---

## Phase 5: Polish & Optimization

### 5.1 Loading States

**Tasks**:
- [ ] Replace all spinners with skeleton loaders where appropriate
- [ ] Add progress bars for long operations (FinSight ETL)
- [ ] Add smooth fade-in for loaded content
- [ ] Add loading states to all async operations

### 5.2 Error Handling

**Tasks**:
- [ ] Create ErrorBoundary component
- [ ] Add helpful error messages
- [ ] Add visual feedback (shake animation, red border)
- [ ] Add recovery paths (retry buttons, back navigation)

### 5.3 Micro-Interactions

**Tasks**:
- [ ] Add hover effects to all interactive elements
- [ ] Add active states (button press)
- [ ] Add focus states (keyboard navigation)
- [ ] Add success animations (checkmarks, etc.)
- [ ] Add link hover animations (underline)

### 5.4 Performance

**Tasks**:
- [ ] Optimize images (Next.js Image component)
- [ ] Lazy load animations (Intersection Observer)
- [ ] Code splitting for heavy components
- [ ] Optimize bundle size

### 5.5 Accessibility

**Tasks**:
- [ ] Add ARIA labels to all interactive elements
- [ ] Ensure keyboard navigation works
- [ ] Test with screen reader
- [ ] Verify color contrast (WCAG AA)
- [ ] Test reduced motion support

---

## Implementation Checklist

### Phase 1: Foundation
- [ ] Update Tailwind config with brand colors
- [ ] Update globals.css (always dark, remove light mode)
- [ ] Create Button component
- [ ] Create Card component
- [ ] Create Badge component
- [ ] Create Section component
- [ ] Create Input component
- [ ] Create LoadingSkeleton component

### Phase 2: Main Site
- [ ] Refactor Hero.tsx
- [ ] Refactor About.tsx
- [ ] Refactor Projects.tsx
- [ ] Refactor Contact.tsx
- [ ] Refactor Header.tsx
- [ ] Refactor Footer.tsx
- [ ] Add Framer Motion animations
- [ ] Add scroll animations

### Phase 3: Case Studies
- [ ] Create LayoutShell component
- [ ] Refactor finsight/page.tsx
- [ ] Refactor ainews/page.tsx
- [ ] Refactor novo-nordisk/page.tsx
- [ ] Test all case study pages

### Phase 4: External Projects
- [ ] CodePractice.AI: Update Tailwind config
- [ ] CodePractice.AI: Add branding bar
- [ ] CodePractice.AI: Apply dark theme
- [ ] CurRag: Create Streamlit theme config
- [ ] CurRag: Add branding bar
- [ ] Superset: Create branded wrapper page

### Phase 5: Polish
- [ ] Add loading skeletons
- [ ] Add error handling
- [ ] Add micro-interactions
- [ ] Optimize performance
- [ ] Test accessibility
- [ ] Final review and tweaks

---

## Testing Strategy

### Visual Testing
- [ ] Test all pages in dark mode
- [ ] Verify color consistency across projects
- [ ] Check hover states work
- [ ] Verify animations are smooth
- [ ] Test responsive design (mobile, tablet, desktop)

### Functional Testing
- [ ] Test all navigation links
- [ ] Test interactive demos (FinSight, CurRag, CodePractice)
- [ ] Test form submissions
- [ ] Test error states
- [ ] Test loading states

### Cross-Browser Testing
- [ ] Chrome/Edge
- [ ] Firefox
- [ ] Safari
- [ ] Mobile browsers

### Performance Testing
- [ ] Lighthouse score (aim for 90+)
- [ ] First Contentful Paint < 1.5s
- [ ] Time to Interactive < 3s
- [ ] Bundle size analysis

---

## Deployment Plan

### Vercel (Main Portfolio)
1. Push changes to GitHub
2. Vercel auto-deploys
3. Test on preview deployment
4. Merge to main

### Cloudflare (CodePractice.AI)
1. Update code in Tutor directory
2. Deploy via Cloudflare Pages
3. Test on preview
4. Deploy to production

### Render (CurRag)
1. Update Streamlit theme config
2. Update app.py with branding bar
3. Push to GitHub
4. Render auto-deploys
5. Test on live URL

---

## Maintenance Notes

### Future Considerations
- Keep design system documented
- Add new projects following same pattern
- Update components as needed
- Monitor for consistency drift

### Breaking Changes
- If changing brand colors, update all projects simultaneously
- If changing component styles, update all instances
- Test thoroughly before deploying

---

## Resources

- **Design System**: See `UIX.md`
- **Tailwind Docs**: https://tailwindcss.com/docs
- **Framer Motion**: https://www.framer.com/motion/
- **Next.js Docs**: https://nextjs.org/docs
- **Streamlit Theming**: https://docs.streamlit.io/library/advanced-features/theming

---

## Notes

- Always test in dark mode (no light mode support)
- Purple-700 is the primary brand color (use consistently)
- Maintain 8px spacing scale throughout
- Use Card and Button components for consistency
- Add animations sparingly but purposefully

