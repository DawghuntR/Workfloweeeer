# Workfloweeeer Styling - Quick Reference

## Table of Contents
1. [Getting Started](#getting-started)
2. [Color Tokens](#color-tokens)
3. [Spacing & Sizing](#spacing--sizing)
4. [Typography](#typography)
5. [Common Patterns](#common-patterns)
6. [Component Classes](#component-classes)

## Getting Started

### Installation
```typescript
// Import all styles
import '@workfloweeeer/editor/styles';

// Or import specific files
import '@workfloweeeer/editor/styles/editor.css';
import '@workfloweeeer/editor/styles/themes.css';
import '@workfloweeeer/editor/styles/utilities.css';
```

### Basic Setup
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <link rel="stylesheet" href="path/to/editor/styles/index.css">
</head>
<body data-theme="light" data-density="default">
  <!-- Your content -->
</body>
</html>
```

## Color Tokens

### Primary Colors
```css
var(--color-primary)          /* #3b82f6 - Main brand color */
var(--color-primary-hover)    /* #2563eb - Hover state */
var(--color-primary-active)   /* #1d4ed8 - Active state */
var(--color-primary-light)    /* #dbeafe - Light variant */
```

### Semantic Colors
```css
var(--color-success)          /* #10b981 - Success states */
var(--color-warning)          /* #f59e0b - Warning states */
var(--color-danger)           /* #ef4444 - Error/delete states */
```

### Neutral Colors
```css
var(--color-gray-50)          /* Lightest gray */
var(--color-gray-100)
var(--color-gray-200)
/* ... */
var(--color-gray-900)         /* Darkest gray */
```

### Text Colors
```css
var(--color-text-primary)     /* Main text */
var(--color-text-secondary)   /* Secondary text */
var(--color-text-tertiary)    /* Subtle text */
var(--color-text-disabled)    /* Disabled state */
var(--color-text-inverse)     /* White text */
```

### Usage Example
```css
.custom-element {
  color: var(--color-text-primary);
  background-color: var(--color-primary);
  border-color: var(--color-border-medium);
}
```

## Spacing & Sizing

### Spacing Scale
```css
var(--space-xs)    /* 4px */
var(--space-sm)    /* 8px */
var(--space-md)    /* 12px */
var(--space-lg)    /* 16px */
var(--space-xl)    /* 24px */
var(--space-2xl)   /* 32px */
var(--space-3xl)   /* 48px */
```

### Border Radius
```css
var(--radius-sm)   /* 4px */
var(--radius-md)   /* 8px */
var(--radius-lg)   /* 12px */
var(--radius-xl)   /* 16px */
var(--radius-full) /* 9999px - Fully rounded */
```

### Shadows
```css
var(--shadow-xs)   /* Minimal shadow */
var(--shadow-sm)   /* Small shadow */
var(--shadow-md)   /* Medium shadow */
var(--shadow-lg)   /* Large shadow */
var(--shadow-xl)   /* Extra large shadow */
var(--shadow-focus) /* Focus indicator */
```

### Usage Example
```css
.card {
  padding: var(--space-xl);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
}
```

## Typography

### Font Sizes
```css
var(--font-size-xs)    /* 12px */
var(--font-size-sm)    /* 14px */
var(--font-size-base)  /* 16px - Default */
var(--font-size-lg)    /* 18px */
var(--font-size-xl)    /* 20px */
var(--font-size-2xl)   /* 24px */
var(--font-size-3xl)   /* 30px */
```

### Font Weights
```css
var(--font-weight-normal)    /* 400 */
var(--font-weight-medium)    /* 500 */
var(--font-weight-semibold)  /* 600 */
var(--font-weight-bold)      /* 700 */
```

### Line Heights
```css
var(--line-height-tight)     /* 1.25 */
var(--line-height-normal)    /* 1.5 */
var(--line-height-relaxed)   /* 1.75 */
```

### Typography Classes
```html
<p class="text-lg font-semibold">Large semibold text</p>
<p class="text-sm text-secondary">Small secondary text</p>
<p class="font-mono">Monospace text</p>
```

## Common Patterns

### Buttons
```html
<!-- Primary action -->
<button class="btn btn-primary">Save</button>

<!-- Secondary action -->
<button class="btn btn-secondary">Cancel</button>

<!-- Danger action -->
<button class="btn btn-danger">Delete</button>

<!-- Sizes -->
<button class="btn btn-primary btn-sm">Small</button>
<button class="btn btn-primary">Default</button>
<button class="btn btn-primary btn-lg">Large</button>

<!-- Disabled -->
<button class="btn btn-primary" disabled>Disabled</button>
```

### Form Elements
```html
<div class="form-group">
  <label for="title">Title</label>
  <input id="title" type="text" placeholder="Enter title...">
</div>

<div class="form-group">
  <label for="description">Description</label>
  <textarea id="description" rows="4"></textarea>
</div>

<div class="form-group">
  <label for="select">Options</label>
  <select id="select">
    <option>Option 1</option>
  </select>
</div>
```

### Cards
```html
<div class="card">
  <div class="card-header">
    <h3>Card Title</h3>
  </div>
  <p>Card content goes here</p>
  <div class="card-footer">
    <button class="btn btn-primary">Action</button>
  </div>
</div>
```

### Badges
```html
<span class="badge badge-primary">Primary</span>
<span class="badge badge-success">Success</span>
<span class="badge badge-warning">Warning</span>
<span class="badge badge-danger">Danger</span>
```

### Alerts
```html
<div class="alert alert-info">Info message</div>
<div class="alert alert-success">Success message</div>
<div class="alert alert-warning">Warning message</div>
<div class="alert alert-danger">Error message</div>
```

### Layout Utilities
```html
<!-- Flexbox -->
<div class="flex items-center justify-between gap-md">
  <span>Left</span>
  <span>Right</span>
</div>

<!-- Grid -->
<div class="grid grid-cols-3 gap-lg">
  <div>Item 1</div>
  <div>Item 2</div>
  <div>Item 3</div>
</div>

<!-- Spacing -->
<div class="p-lg mb-xl">
  Content with padding and margin
</div>
```

## Component Classes

### StepList
```html
<div class="step-list">
  <div class="step-item selected">
    <div class="step-number">1</div>
    <div class="step-content">
      <div class="step-header">
        <span class="step-title">Step title</span>
        <span class="step-action-type">click</span>
      </div>
      <p class="step-description">Description...</p>
    </div>
    <div class="step-thumbnail">
      <img src="..." alt="Screenshot">
    </div>
  </div>
</div>
```

### StepEditor
```html
<div class="step-editor">
  <div class="step-meta">
    <span class="step-index">Step 1 of 5</span>
    <span class="step-source">manual</span>
  </div>
  
  <div class="form-group">
    <label>Title</label>
    <input type="text">
  </div>
  
  <div class="step-details">
    <div class="detail-row">
      <span class="detail-label">Action Type</span>
      <span class="detail-value">click</span>
    </div>
  </div>
  
  <div class="step-actions">
    <button class="btn btn-primary">Save</button>
    <button class="btn btn-danger">Delete</button>
  </div>
</div>
```

### AnnotationEditor
```html
<div class="annotation-editor">
  <div class="annotation-toolbar">
    <div class="tool-group">
      <button class="tool-btn active">↖</button>
      <button class="tool-btn">→</button>
      <button class="tool-btn">□</button>
    </div>
    <div class="tool-group">
      <input type="color" value="#FF0000">
      <select>
        <option>Thin</option>
        <option>Medium</option>
        <option>Thick</option>
      </select>
    </div>
  </div>
  
  <div class="canvas-container">
    <img class="screenshot-image" src="..." alt="Screenshot">
    <canvas class="annotation-canvas"></canvas>
  </div>
</div>
```

### ScreenshotReplacer
```html
<div class="screenshot-replacer">
  <div class="drop-zone">
    <img class="current-screenshot" src="..." alt="Current">
    <div class="overlay">
      <p>Drop an image here or click to replace</p>
    </div>
  </div>
  
  <div class="screenshot-actions">
    <button class="btn btn-secondary">Choose File</button>
    <button class="btn btn-danger">Remove</button>
  </div>
</div>
```

## Theming

### Available Themes
- `light` - Default light theme
- `dark` - Dark mode
- `high-contrast` - High contrast mode
- `purple`, `green`, `orange`, `teal` - Brand color variants
- `colorblind-rg` - Red-Green colorblind friendly
- `colorblind-by` - Blue-Yellow colorblind friendly

### Apply Theme
```javascript
// Set theme
document.body.setAttribute('data-theme', 'dark');

// Set density
document.body.setAttribute('data-density', 'compact');

// Remove theme (use default)
document.body.removeAttribute('data-theme');
```

### Custom Theme
```css
/* Create custom theme by overriding CSS variables */
[data-theme="custom"] {
  --color-primary: #7c3aed;
  --color-primary-hover: #6d28d9;
  --color-primary-active: #5b21b6;
}
```

## Best Practices

### 1. Use Design Tokens
```css
/* ✅ Good */
.element {
  padding: var(--space-lg);
  color: var(--color-text-primary);
}

/* ❌ Avoid */
.element {
  padding: 16px;
  color: #1f2937;
}
```

### 2. Maintain Accessibility
```html
<!-- ✅ Good -->
<button class="btn btn-primary" aria-label="Save changes">
  Save
</button>

<!-- ❌ Avoid -->
<div class="btn" onclick="save()">Save</div>
```

### 3. Use Utility Classes for Spacing
```html
<!-- ✅ Good -->
<div class="mb-xl p-lg">Content</div>

<!-- ❌ Avoid -->
<div style="margin-bottom: 24px; padding: 16px;">Content</div>
```

### 4. Semantic HTML
```html
<!-- ✅ Good -->
<button class="btn btn-primary">Submit</button>
<nav class="flex gap-md">...</nav>

<!-- ❌ Avoid -->
<div class="btn btn-primary" onclick="submit()">Submit</div>
<div class="flex gap-md">...</div>
```

## Customization Examples

### Custom Button Variant
```css
.btn-custom {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
}

.btn-custom:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}
```

### Custom Card Style
```css
.feature-card {
  background: var(--color-bg-primary);
  border-radius: var(--radius-xl);
  padding: var(--space-2xl);
  box-shadow: var(--shadow-lg);
  transition: all var(--transition-base);
}

.feature-card:hover {
  transform: scale(1.02);
  box-shadow: var(--shadow-xl);
}
```

### Responsive Utilities
```css
/* Mobile-first approach */
.responsive-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--space-lg);
}

@media (min-width: 768px) {
  .responsive-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1024px) {
  .responsive-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
```

## Troubleshooting

### Issue: Styles not applying
- Ensure CSS is imported correctly
- Check specificity (CSS custom properties have low specificity)
- Verify class names match exactly

### Issue: Theme not changing
- Check `data-theme` attribute is on correct element (usually `<body>`)
- Ensure theme CSS file is imported
- Use browser DevTools to inspect applied CSS variables

### Issue: Focus states not visible
- Don't remove `:focus-visible` styles
- Use `--shadow-focus` variable for consistency
- Test with keyboard navigation

## Resources

- [Full Documentation](./README.md)
- [Component Demo](./demo.html)
- [Design Tokens Reference](./editor.css)
- [Theme Variations](./themes.css)
- [Utility Classes](./utilities.css)

---

**Need help?** Check the main README or open an issue on GitHub.
