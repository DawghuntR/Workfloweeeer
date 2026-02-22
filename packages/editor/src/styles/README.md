# Workfloweeeer Editor Styles

Professional, accessible, and comprehensive styling system for the Workfloweeeer editor components.

## Features

- ✨ **Modern Design System** - Built with CSS custom properties for easy theming
- 🎨 **Multiple Themes** - Light, dark, high contrast, and color-blind friendly options
- ♿ **Accessibility First** - WCAG 2.1 AA compliant with proper focus indicators
- 📱 **Responsive** - Mobile-first design with breakpoints for all screen sizes
- 🎯 **Component-Based** - Modular styles for each editor component
- 🔧 **Customizable** - Easy to override with CSS variables
- ⚡ **Performance** - Optimized with minimal specificity and efficient selectors

## Installation

```bash
npm install @workfloweeeer/editor
```

## Usage

### Basic Import

Import all styles in your application entry point:

```typescript
// In your main App.tsx or index.tsx
import '@workfloweeeer/editor/styles';
```

### Individual Imports

Import only what you need:

```typescript
// Just the core editor styles
import '@workfloweeeer/editor/styles/editor.css';

// Add theme support
import '@workfloweeeer/editor/styles/themes.css';
```

### Using Components

```tsx
import { StepList, StepEditor, AnnotationEditor, ScreenshotReplacer } from '@workfloweeeer/editor';
import '@workfloweeeer/editor/styles';

function App() {
  return (
    <div className="editor-container">
      <StepList />
      <StepEditor />
      <AnnotationEditor stepId="123" screenshotBase64="..." screenshotMimeType="image/png" annotations={[]} />
      <ScreenshotReplacer stepId="123" />
    </div>
  );
}
```

## Theming

### Setting a Theme

Add a `data-theme` attribute to your root element:

```html
<!-- Light theme (default) -->
<body data-theme="light">

<!-- Dark theme -->
<body data-theme="dark">

<!-- High contrast -->
<body data-theme="high-contrast">

<!-- Color-blind friendly (Red-Green) -->
<body data-theme="colorblind-rg">

<!-- Brand color themes -->
<body data-theme="purple">
<body data-theme="green">
<body data-theme="orange">
<body data-theme="teal">
```

### Density Settings

Control component spacing and sizing:

```html
<!-- Compact (dense layout) -->
<body data-density="compact">

<!-- Default -->
<body data-density="default">

<!-- Comfortable (spacious layout) -->
<body data-density="comfortable">
```

### Dynamic Theme Switching

```typescript
function setTheme(theme: string) {
  document.body.setAttribute('data-theme', theme);
  
  // Optional: smooth transition
  document.body.classList.add('transitioning');
  setTimeout(() => {
    document.body.classList.remove('transitioning');
  }, 300);
}

function setDensity(density: string) {
  document.body.setAttribute('data-density', density);
}
```

## Customization

### CSS Custom Properties

Override any design token by redefining CSS variables:

```css
:root {
  /* Change primary color */
  --color-primary: #7c3aed;
  --color-primary-hover: #6d28d9;
  
  /* Adjust spacing */
  --space-lg: 1.25rem;
  
  /* Modify border radius */
  --radius-md: 0.75rem;
  
  /* Change fonts */
  --font-family-base: 'Inter', sans-serif;
}
```

### Component-Specific Overrides

```css
/* Customize step list items */
.step-item {
  border-radius: 1rem;
  padding: 1.5rem;
}

/* Customize buttons */
.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

/* Customize annotation toolbar */
.annotation-toolbar {
  background-color: #f0f4f8;
}
```

## Available Components

### StepList
Displays workflow steps with drag-and-drop functionality.

**Classes:**
- `.step-list` - Container
- `.step-item` - Individual step
- `.step-item.selected` - Selected state
- `.step-item.dragging` - During drag
- `.step-item.drop-target` - Drop target indicator

### StepEditor
Form for editing step details.

**Classes:**
- `.step-editor` - Container
- `.step-meta` - Step metadata header
- `.step-details` - Step information display
- `.form-group` - Form field wrapper

### AnnotationEditor
Canvas-based annotation tools for screenshots.

**Classes:**
- `.annotation-editor` - Container
- `.annotation-toolbar` - Tool buttons bar
- `.tool-btn` - Individual tool button
- `.tool-btn.active` - Active tool
- `.canvas-container` - Canvas wrapper

### ScreenshotReplacer
Drag-and-drop zone for replacing screenshots.

**Classes:**
- `.screenshot-replacer` - Container
- `.drop-zone` - Drag-drop area
- `.drop-zone.dragover` - During drag over
- `.current-screenshot` - Preview image

## Design Tokens Reference

### Colors

```css
/* Primary */
--color-primary: #3b82f6;
--color-primary-hover: #2563eb;
--color-primary-active: #1d4ed8;
--color-primary-light: #dbeafe;

/* Semantic */
--color-success: #10b981;
--color-warning: #f59e0b;
--color-danger: #ef4444;

/* Neutral Grays */
--color-gray-50: #f9fafb;
--color-gray-100: #f3f4f6;
/* ... through ... */
--color-gray-900: #111827;
```

### Spacing

```css
--space-xs: 0.25rem;   /* 4px */
--space-sm: 0.5rem;    /* 8px */
--space-md: 0.75rem;   /* 12px */
--space-lg: 1rem;      /* 16px */
--space-xl: 1.5rem;    /* 24px */
--space-2xl: 2rem;     /* 32px */
--space-3xl: 3rem;     /* 48px */
```

### Typography

```css
--font-size-xs: 0.75rem;    /* 12px */
--font-size-sm: 0.875rem;   /* 14px */
--font-size-base: 1rem;     /* 16px */
--font-size-lg: 1.125rem;   /* 18px */
--font-size-xl: 1.25rem;    /* 20px */
--font-size-2xl: 1.5rem;    /* 24px */

--font-weight-normal: 400;
--font-weight-medium: 500;
--font-weight-semibold: 600;
--font-weight-bold: 700;
```

### Border Radius

```css
--radius-sm: 0.25rem;   /* 4px */
--radius-md: 0.5rem;    /* 8px */
--radius-lg: 0.75rem;   /* 12px */
--radius-xl: 1rem;      /* 16px */
```

### Shadows

```css
--shadow-sm: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
--shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
--shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
```

## Accessibility Features

### Keyboard Navigation
- All interactive elements are keyboard accessible
- Focus indicators are always visible with `focus-visible`
- Proper tab order and ARIA attributes

### Screen Readers
- Semantic HTML with proper ARIA labels
- `.visually-hidden` utility for screen-reader-only content
- Descriptive button and link text

### Motion Preferences
Respects `prefers-reduced-motion`:
```css
@media (prefers-reduced-motion: reduce) {
  /* Animations disabled or minimized */
}
```

### High Contrast Mode
Automatically adjusts for high contrast preferences:
```css
@media (prefers-contrast: high) {
  /* Enhanced borders and contrast */
}
```

### Color Vision Deficiency
Built-in themes for color-blind users:
- `data-theme="colorblind-rg"` - Red-Green color blindness
- `data-theme="colorblind-by"` - Blue-Yellow color blindness

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari 14+, Chrome Android 90+)

## Responsive Breakpoints

```css
/* Mobile */
@media (max-width: 480px) { }

/* Tablet */
@media (max-width: 768px) { }

/* Desktop (default) */
@media (min-width: 769px) { }
```

## Best Practices

### 1. Use Semantic HTML
```tsx
// Good
<button className="btn btn-primary">Save</button>

// Bad
<div className="btn btn-primary" onClick={handleClick}>Save</div>
```

### 2. Leverage Design Tokens
```css
/* Good */
.custom-component {
  padding: var(--space-lg);
  color: var(--color-text-primary);
}

/* Avoid */
.custom-component {
  padding: 16px;
  color: #111827;
}
```

### 3. Maintain Accessibility
```tsx
// Always provide labels
<button className="tool-btn" aria-label="Select tool" title="Select (V)">
  ↖
</button>
```

### 4. Test with Different Themes
```tsx
// Test your components with multiple themes
['light', 'dark', 'high-contrast'].forEach(theme => {
  document.body.setAttribute('data-theme', theme);
  // Run visual tests
});
```

## Contributing

When adding new styles:

1. Use existing design tokens when possible
2. Add new tokens to `:root` if needed
3. Ensure accessibility (contrast ratios, focus states)
4. Test responsive behavior
5. Support dark mode and high contrast
6. Document new classes in this README

## License

MIT License - see LICENSE file for details
