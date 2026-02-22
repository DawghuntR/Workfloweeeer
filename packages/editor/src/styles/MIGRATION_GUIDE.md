# Migration Guide: Integrating Workfloweeeer UI Styles

This guide walks you through integrating the new styling system into your Workfloweeeer application.

## Quick Start (5 minutes)

### Step 1: Import Styles

Add to your main application entry point (e.g., `App.tsx` or `index.tsx`):

```typescript
// Import all editor styles
import '@workfloweeeer/editor/styles';

// Or import from relative path during development
import './packages/editor/src/styles/index.css';
```

### Step 2: Apply Theme Attributes (Optional)

Add theme attributes to your root HTML element:

```html
<!-- In your index.html -->
<body data-theme="light" data-density="default">
  <div id="root"></div>
</body>
```

### Step 3: Use Components

Your existing components will automatically receive the new styles:

```tsx
import { StepList, StepEditor, AnnotationEditor, ScreenshotReplacer } from '@workfloweeeer/editor';

function EditorPage() {
  return (
    <div className="container">
      <div className="grid grid-cols-2 gap-xl">
        <StepList />
        <StepEditor />
      </div>
    </div>
  );
}
```

That's it! Your application now has professional, accessible styling.

## Detailed Integration

### For React Applications

#### Option 1: Global Import (Recommended)

```typescript
// src/index.tsx or src/App.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import '@workfloweeeer/editor/styles'; // Import styles globally
import App from './App';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

#### Option 2: Component-Level Import

```typescript
// src/pages/EditorPage.tsx
import React from 'react';
import '@workfloweeeer/editor/styles';
import { StepList, StepEditor } from '@workfloweeeer/editor';

export function EditorPage() {
  return (
    <div className="container">
      {/* Your components */}
    </div>
  );
}
```

#### Option 3: Selective Import

```typescript
// Import only what you need
import '@workfloweeeer/editor/styles/editor.css';
import '@workfloweeeer/editor/styles/themes.css';

// Skip utilities if you're using Tailwind or similar
// import '@workfloweeeer/editor/styles/utilities.css';
```

### For Vite Projects

Add to `vite.config.ts` if you need global access:

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  css: {
    // CSS modules configuration if needed
    modules: {
      localsConvention: 'camelCase',
    },
  },
});
```

### For Webpack Projects

No special configuration needed. Standard CSS imports work:

```typescript
import '@workfloweeeer/editor/styles';
```

### For Next.js Projects

Import in `_app.tsx`:

```typescript
// pages/_app.tsx
import '@workfloweeeer/editor/styles';
import type { AppProps } from 'next/app';

export default function App({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}
```

## Customization

### Method 1: CSS Variable Override

Create a custom CSS file:

```css
/* src/custom-theme.css */
:root {
  /* Override primary color */
  --color-primary: #7c3aed;
  --color-primary-hover: #6d28d9;
  --color-primary-active: #5b21b6;
  
  /* Adjust spacing */
  --space-lg: 1.25rem;
  
  /* Change border radius */
  --radius-md: 0.75rem;
}
```

Import after the main styles:

```typescript
import '@workfloweeeer/editor/styles';
import './custom-theme.css'; // Your overrides
```

### Method 2: Component-Specific Overrides

```css
/* src/editor-overrides.css */

/* Customize step items */
.step-item {
  border-radius: 1rem;
  border-width: 2px;
}

.step-item:hover {
  transform: translateX(8px);
}

/* Customize buttons */
.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}
```

### Method 3: Create Custom Theme

```css
/* src/themes/company-theme.css */
[data-theme="company"] {
  --color-primary: #ff6b35;
  --color-primary-hover: #e55a2b;
  --color-primary-light: #ffe5dd;
  
  --color-secondary: #004e89;
  --color-secondary-hover: #003d6b;
}

/* Custom gradient for company theme */
[data-theme="company"] .step-number {
  background: linear-gradient(135deg, #ff6b35, #004e89);
}
```

Apply the theme:

```typescript
document.body.setAttribute('data-theme', 'company');
```

## Dynamic Theme Switching

### React Hook Implementation

```typescript
// src/hooks/useTheme.ts
import { useEffect, useState } from 'react';

type Theme = 'light' | 'dark' | 'high-contrast' | 'purple' | 'green';
type Density = 'compact' | 'default' | 'comfortable';

export function useTheme() {
  const [theme, setTheme] = useState<Theme>('light');
  const [density, setDensity] = useState<Density>('default');

  useEffect(() => {
    // Load from localStorage
    const savedTheme = localStorage.getItem('theme') as Theme;
    const savedDensity = localStorage.getItem('density') as Density;
    
    if (savedTheme) setTheme(savedTheme);
    if (savedDensity) setDensity(savedDensity);
  }, []);

  useEffect(() => {
    // Apply theme
    if (theme) {
      document.body.setAttribute('data-theme', theme);
      localStorage.setItem('theme', theme);
    } else {
      document.body.removeAttribute('data-theme');
      localStorage.removeItem('theme');
    }
  }, [theme]);

  useEffect(() => {
    // Apply density
    if (density && density !== 'default') {
      document.body.setAttribute('data-density', density);
      localStorage.setItem('density', density);
    } else {
      document.body.removeAttribute('data-density');
      localStorage.removeItem('density');
    }
  }, [density]);

  return { theme, setTheme, density, setDensity };
}
```

### Theme Switcher Component

```tsx
// src/components/ThemeSwitcher.tsx
import React from 'react';
import { useTheme } from '../hooks/useTheme';

export function ThemeSwitcher() {
  const { theme, setTheme, density, setDensity } = useTheme();

  return (
    <div className="flex gap-md">
      <select 
        className="btn btn-secondary"
        value={theme}
        onChange={(e) => setTheme(e.target.value as any)}
      >
        <option value="light">Light</option>
        <option value="dark">Dark</option>
        <option value="high-contrast">High Contrast</option>
        <option value="purple">Purple</option>
        <option value="green">Green</option>
      </select>

      <select 
        className="btn btn-secondary"
        value={density}
        onChange={(e) => setDensity(e.target.value as any)}
      >
        <option value="compact">Compact</option>
        <option value="default">Default</option>
        <option value="comfortable">Comfortable</option>
      </select>
    </div>
  );
}
```

## Migrating Existing Inline Styles

### Before (Inline Styles)

```tsx
function StepItem({ step }) {
  return (
    <div style={{
      padding: '16px',
      marginBottom: '12px',
      borderRadius: '8px',
      backgroundColor: '#ffffff',
      border: '1px solid #e5e7eb',
    }}>
      {step.title}
    </div>
  );
}
```

### After (CSS Classes)

```tsx
function StepItem({ step }) {
  return (
    <div className="step-item">
      <div className="step-content">
        <span className="step-title">{step.title}</span>
      </div>
    </div>
  );
}
```

## TypeScript Support

### Type Definitions for Themes

```typescript
// src/types/theme.ts
export type Theme = 
  | 'light' 
  | 'dark' 
  | 'high-contrast' 
  | 'purple' 
  | 'green' 
  | 'orange' 
  | 'teal'
  | 'colorblind-rg'
  | 'colorblind-by';

export type Density = 'compact' | 'default' | 'comfortable';

export interface ThemeConfig {
  theme: Theme;
  density: Density;
}
```

### Theme Context

```tsx
// src/contexts/ThemeContext.tsx
import React, { createContext, useContext, useState } from 'react';
import type { Theme, Density, ThemeConfig } from '../types/theme';

interface ThemeContextValue extends ThemeConfig {
  setTheme: (theme: Theme) => void;
  setDensity: (density: Density) => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('light');
  const [density, setDensity] = useState<Density>('default');

  return (
    <ThemeContext.Provider value={{ theme, setTheme, density, setDensity }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useThemeContext() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useThemeContext must be used within ThemeProvider');
  }
  return context;
}
```

## Testing Integration

### Visual Regression Tests

```typescript
// tests/visual/theme.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Theme Switching', () => {
  test('should apply dark theme correctly', async ({ page }) => {
    await page.goto('/editor');
    
    // Switch to dark theme
    await page.evaluate(() => {
      document.body.setAttribute('data-theme', 'dark');
    });
    
    // Take screenshot
    await expect(page).toHaveScreenshot('dark-theme.png');
  });

  test('should apply high contrast theme', async ({ page }) => {
    await page.goto('/editor');
    
    await page.evaluate(() => {
      document.body.setAttribute('data-theme', 'high-contrast');
    });
    
    await expect(page).toHaveScreenshot('high-contrast.png');
  });
});
```

### Accessibility Tests

```typescript
// tests/a11y/editor.spec.ts
import { test, expect } from '@playwright/test';
import { injectAxe, checkA11y } from 'axe-playwright';

test.describe('Accessibility', () => {
  test('should have no accessibility violations', async ({ page }) => {
    await page.goto('/editor');
    await injectAxe(page);
    await checkA11y(page);
  });

  test('should support keyboard navigation', async ({ page }) => {
    await page.goto('/editor');
    
    // Tab through focusable elements
    await page.keyboard.press('Tab');
    const firstFocus = await page.locator(':focus');
    await expect(firstFocus).toBeVisible();
    
    // Verify focus indicator is visible
    await expect(firstFocus).toHaveCSS('box-shadow', /rgba/);
  });
});
```

## Troubleshooting

### Issue: Styles Not Loading

**Solution:**
1. Check import path is correct
2. Verify CSS loader is configured in your bundler
3. Check browser DevTools Network tab for CSS file
4. Clear build cache and restart dev server

### Issue: Custom Variables Not Working

**Solution:**
1. Ensure custom CSS is imported AFTER the main styles
2. Verify CSS variable syntax: `var(--variable-name)`
3. Check specificity - use `:root` for global overrides
4. Use browser DevTools to inspect computed values

### Issue: Theme Not Switching

**Solution:**
1. Verify `data-theme` attribute is on `<body>` element
2. Check theme name matches exactly (case-sensitive)
3. Ensure theme CSS file is imported
4. Clear browser cache

### Issue: Components Look Broken

**Solution:**
1. Check if correct class names are applied
2. Verify no conflicting CSS from other libraries
3. Check browser console for CSS errors
4. Try with a clean browser profile

## Performance Optimization

### Code Splitting

```typescript
// Lazy load theme CSS
const loadTheme = async (theme: string) => {
  await import(`@workfloweeeer/editor/styles/themes/${theme}.css`);
};

// Usage
loadTheme('dark');
```

### Critical CSS

Extract critical styles for above-the-fold content:

```html
<!-- In index.html -->
<style>
  /* Critical CSS - inline for fast loading */
  :root {
    --color-primary: #3b82f6;
    --space-lg: 1rem;
  }
  .btn { /* minimal button styles */ }
</style>
```

### Production Build

Ensure CSS is minified:

```typescript
// vite.config.ts
export default defineConfig({
  build: {
    cssMinify: true,
    rollupOptions: {
      output: {
        assetFileNames: 'assets/[name].[hash][extname]',
      },
    },
  },
});
```

## Checklist

- [ ] Import styles in main entry point
- [ ] Apply theme attributes to HTML
- [ ] Test all components render correctly
- [ ] Verify theme switching works
- [ ] Test responsive layouts
- [ ] Check keyboard navigation
- [ ] Run accessibility tests
- [ ] Test in all target browsers
- [ ] Verify print styles
- [ ] Check performance metrics
- [ ] Update documentation
- [ ] Train team on new system

## Support

### Resources
- [Full Documentation](./README.md)
- [Quick Reference](./QUICK_REFERENCE.md)
- [Demo Page](./demo.html)
- [Implementation Summary](./IMPLEMENTATION_SUMMARY.md)

### Common Questions

**Q: Can I use this with Tailwind CSS?**  
A: Yes! The utility classes won't conflict. You can use both together or skip importing `utilities.css`.

**Q: How do I add a custom color?**  
A: Override the CSS variable:
```css
:root {
  --color-primary: #your-color;
}
```

**Q: Is this compatible with CSS Modules?**  
A: Yes, import the CSS globally and class names will work as expected.

**Q: Can I use only specific components?**  
A: Yes, import only the CSS you need or override unused styles.

---

**Next Steps:** Check out the [Quick Reference](./QUICK_REFERENCE.md) for common patterns and examples.
