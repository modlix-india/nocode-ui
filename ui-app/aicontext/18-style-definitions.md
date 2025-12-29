# Style Definitions

## Overview

Style definitions are global CSS stylesheets that apply application-wide styling. They are separate from component-level styles and provide base CSS rules, animations, transitions, and global overrides. These styles are injected into the page as `<style>` tags.

## Storage Location

Style definitions are stored in:
- **MongoDB Collection**: `style`
- **File Export**: `appbuilder-data/Style/`
- **Naming Convention**: `{styleName}.json`

## Style Definition Structure

### Top-Level Structure

```typescript
interface StyleDocument {
  id: string;              // MongoDB ID
  createdAt: number;       // Unix timestamp
  createdBy: string;       // User ID
  updatedAt: number;       // Unix timestamp
  updatedBy: string;       // User ID
  name: string;            // Style name (e.g., "appbuilderstyle")
  message?: string;        // Optional message
  clientCode: string;      // Client code (e.g., "SYSTEM")
  appCode: string;         // Application code
  version: number;         // Version number
  styleString: string;     // The CSS stylesheet content
}
```

## Real Example

From `appbuilder-data/Style/appbuilderstyle.json`:

```json
{
  "id": "63cd15a1f39ebe5626a5f2ee",
  "createdAt": 1674384801,
  "createdBy": "1",
  "updatedAt": 1759226440,
  "updatedBy": "142",
  "name": "appbuilderstyle",
  "clientCode": "SYSTEM",
  "appCode": "appbuilder",
  "version": 17,
  "styleString": " * { transition: width 1s, height 1s, padding-left 1s, padding-right 1s, padding-top 1s, padding-bottom 1s, background-size 1s;}"
}
```

## Comprehensive Style Examples

### Basic Global Styles

```json
{
  "name": "globalStyles",
  "clientCode": "SYSTEM",
  "appCode": "myapp",
  "version": 1,
  "styleString": "* { box-sizing: border-box; margin: 0; padding: 0; } body { font-family: 'Inter', sans-serif; line-height: 1.5; } a { text-decoration: none; color: inherit; }"
}
```

### Transitions and Animations

```json
{
  "name": "animationStyles",
  "clientCode": "SYSTEM",
  "appCode": "myapp",
  "version": 1,
  "styleString": "* { transition: all 0.3s ease-in-out; } @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } } @keyframes slideInUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } } @keyframes pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.05); } } .fade-in { animation: fadeIn 0.5s ease-out; } .slide-in { animation: slideInUp 0.4s ease-out; } .pulse { animation: pulse 2s infinite; }"
}
```

### Utility Classes

```json
{
  "name": "utilityStyles",
  "clientCode": "SYSTEM",
  "appCode": "myapp",
  "version": 1,
  "styleString": ".flex { display: flex; } .flex-col { flex-direction: column; } .items-center { align-items: center; } .justify-center { justify-content: center; } .justify-between { justify-content: space-between; } .gap-1 { gap: 4px; } .gap-2 { gap: 8px; } .gap-4 { gap: 16px; } .p-1 { padding: 4px; } .p-2 { padding: 8px; } .p-4 { padding: 16px; } .m-1 { margin: 4px; } .m-2 { margin: 8px; } .m-4 { margin: 16px; } .text-center { text-align: center; } .text-left { text-align: left; } .text-right { text-align: right; } .font-bold { font-weight: 700; } .font-medium { font-weight: 500; } .rounded { border-radius: 4px; } .rounded-lg { border-radius: 8px; } .shadow { box-shadow: 0 1px 3px rgba(0,0,0,0.1); } .shadow-lg { box-shadow: 0 10px 15px rgba(0,0,0,0.1); }"
}
```

### Scrollbar Customization

```json
{
  "name": "scrollbarStyles",
  "clientCode": "SYSTEM",
  "appCode": "myapp",
  "version": 1,
  "styleString": "::-webkit-scrollbar { width: 8px; height: 8px; } ::-webkit-scrollbar-track { background: #f1f1f1; border-radius: 4px; } ::-webkit-scrollbar-thumb { background: #c1c1c1; border-radius: 4px; } ::-webkit-scrollbar-thumb:hover { background: #a8a8a8; } * { scrollbar-width: thin; scrollbar-color: #c1c1c1 #f1f1f1; }"
}
```

### Form Reset and Base Styles

```json
{
  "name": "formStyles",
  "clientCode": "SYSTEM",
  "appCode": "myapp",
  "version": 1,
  "styleString": "input, textarea, select, button { font-family: inherit; font-size: inherit; line-height: inherit; } button { cursor: pointer; border: none; background: none; } input:focus, textarea:focus, select:focus { outline: none; } ::placeholder { color: #9ca3af; } input[type='number']::-webkit-inner-spin-button, input[type='number']::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }"
}
```

## Multi-line Style String

For readability in source files, style strings can be formatted with newlines and spaces:

```json
{
  "name": "readableStyles",
  "styleString": "
    * {
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Inter', sans-serif;
      background-color: #f9fafb;
      color: #1f2937;
    }
    
    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 16px;
    }
    
    @media (max-width: 768px) {
      .container {
        padding: 0 12px;
      }
    }
  "
}
```

## Linking Styles to Application

Styles are linked in the application definition:

```json
{
  "properties": {
    "styles": {
      "a522d5f666cf9": {
        "name": "appbuilderstyle"
      }
    }
  }
}
```

## Page-Level CSS Classes

In addition to global styles, pages can define their own CSS classes:

```json
{
  "properties": {
    "classes": {
      "7e72Poi9dkzP80MRqiA63Q": {
        "key": "7e72Poi9dkzP80MRqiA63Q",
        "selector": "@keyframes gradient",
        "style": "0% { background-position: 0% 0%; }\n50% { background-position: 0% 100%; }\n100% { background-position: 0% 0%; }"
      },
      "2Cu6ihyQmlMY8oVnWw6NNj": {
        "key": "2Cu6ihyQmlMY8oVnWw6NNj",
        "selector": "customClass",
        "style": "animation: _customAnim 10s infinite;\nanimation-delay: 0s;"
      }
    }
  }
}
```

### Page Class Structure

```typescript
interface StyleClassDefinition {
  key: string;           // Unique key (UUID)
  selector: string;      // CSS selector or @-rule
  style: string;         // CSS rules
  mediaQuery?: string;   // Optional media query wrapper
  comments?: string;     // Developer comments
  priority?: number;     // CSS specificity priority
}
```

## Style Application Order

Styles are applied in this order (later overrides earlier):

1. **Browser defaults**
2. **Global styles** (from style definitions)
3. **Page CSS classes** (from page.properties.classes)
4. **Component inline styles** (from styleProperties)
5. **Pseudo-state styles** (hover, focus, etc.)
6. **Conditional styles**

## Common CSS Patterns

### CSS Reset

```css
*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html {
  font-size: 16px;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
```

### Smooth Transitions

```css
* {
  transition: 
    color 0.2s ease,
    background-color 0.2s ease,
    border-color 0.2s ease,
    transform 0.2s ease,
    opacity 0.2s ease;
}
```

### Focus Styles

```css
:focus-visible {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}

:focus:not(:focus-visible) {
  outline: none;
}
```

### Loading States

```css
@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

.loading {
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}
```

## Best Practices

1. **Keep It Minimal**: Only include styles that need to be global
2. **Use Component Styles**: Prefer component-level styleProperties for component-specific styling
3. **Document Animations**: Include comments for complex animations
4. **Performance**: Avoid expensive CSS properties in transitions
5. **Browser Compatibility**: Test cross-browser compatibility
6. **Naming Conventions**: Use consistent class naming (BEM, utility classes, etc.)

## Global vs Component Styles

| Aspect | Global Styles (Style Definition) | Component Styles (styleProperties) |
|--------|----------------------------------|-----------------------------------|
| Scope | Application-wide | Component-specific |
| Location | `appbuilder-data/Style/` | In page definition |
| Use Case | Reset, animations, utilities | Component appearance |
| Responsive | Media queries | Resolution breakpoints |
| Dynamic | Static CSS | Expression-based |
| Theme | CSS variables | Theme.* prefix |

## Related Documents

- [05-style-system.md](05-style-system.md) - Component style properties
- [17-theme-definitions.md](17-theme-definitions.md) - Theme variables
- [02-application-and-page-definitions.md](02-application-and-page-definitions.md) - Application styles configuration

