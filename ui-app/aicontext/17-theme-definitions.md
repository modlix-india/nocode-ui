# Theme Definitions

## Overview

Theme definitions provide a centralized way to manage design tokens and variables across the application. Themes support responsive breakpoints, allowing different values for different screen sizes. Theme variables are accessible throughout the application using the `Theme.` prefix.

## Storage Location

Theme definitions are stored in:
- **MongoDB Collection**: `theme`
- **File Export**: `appbuilder-data/Theme/`
- **Naming Convention**: `{themeName}.json`

## Theme Definition Structure

### Top-Level Structure

```typescript
interface ThemeDocument {
  id: string;              // MongoDB ID
  createdAt: number;       // Unix timestamp
  createdBy: string;       // User ID
  updatedAt: number;       // Unix timestamp
  updatedBy: string;       // User ID
  name: string;            // Theme name (e.g., "appbuildertheme")
  message?: string;        // Optional message
  clientCode: string;      // Client code (e.g., "SYSTEM")
  appCode: string;         // Application code
  version: number;         // Version number
  variables: ThemeVariables;  // Theme variables by resolution
}
```

### Theme Variables Structure

```typescript
interface ThemeVariables {
  ALL?: { [variableName: string]: string };
  WIDE_SCREEN?: { [variableName: string]: string };
  DESKTOP_SCREEN?: { [variableName: string]: string };
  TABLET_LANDSCAPE_SCREEN?: { [variableName: string]: string };
  TABLET_LANDSCAPE_SCREEN_ONLY?: { [variableName: string]: string };
  TABLET_POTRAIT_SCREEN?: { [variableName: string]: string };
  TABLET_POTRAIT_SCREEN_ONLY?: { [variableName: string]: string };
  MOBILE_LANDSCAPE_SCREEN?: { [variableName: string]: string };
  MOBILE_LANDSCAPE_SCREEN_ONLY?: { [variableName: string]: string };
  MOBILE_POTRAIT_SCREEN?: { [variableName: string]: string };
  MOBILE_POTRAIT_SCREEN_ONLY?: { [variableName: string]: string };
}
```

### Style Resolutions (Breakpoints)

The system supports these responsive breakpoints:

| Resolution | Description | Typical Width |
|------------|-------------|---------------|
| `ALL` | All screen sizes (base values) | Any |
| `WIDE_SCREEN` | Wide screens and above | > 1920px |
| `DESKTOP_SCREEN` | Desktop screens and above | > 1280px |
| `TABLET_LANDSCAPE_SCREEN` | Tablet landscape and above | > 1024px |
| `TABLET_LANDSCAPE_SCREEN_ONLY` | Only tablet landscape | 1024px - 1280px |
| `TABLET_POTRAIT_SCREEN` | Tablet portrait and above | > 768px |
| `TABLET_POTRAIT_SCREEN_ONLY` | Only tablet portrait | 768px - 1024px |
| `MOBILE_LANDSCAPE_SCREEN` | Mobile landscape and above | > 480px |
| `MOBILE_LANDSCAPE_SCREEN_ONLY` | Only mobile landscape | 480px - 768px |
| `MOBILE_POTRAIT_SCREEN` | Mobile portrait and above | > 320px |
| `MOBILE_POTRAIT_SCREEN_ONLY` | Only mobile portrait | < 480px |

## Real Example

From `appbuilder-data/Theme/appbuildertheme.json`:

```json
{
  "id": "63cbdfd8c07bf46af0e56cf5",
  "createdAt": 1674307239,
  "createdBy": "1",
  "updatedAt": 1759226440,
  "updatedBy": "142",
  "name": "appbuildertheme",
  "clientCode": "SYSTEM",
  "appCode": "appbuilder",
  "version": 36,
  "variables": {
    "ALL": {
      "colorOne": "#50BC9B",
      "colorFive": "#43B2FF"
    },
    "MOBILE_POTRAIT_SCREEN_ONLY": {
      "messageContainerWidth": "100vw"
    },
    "MOBILE_LANDSCAPE_SCREEN_ONLY": {
      "messageContainerWidth": "100vw"
    },
    "TABLET_POTRAIT_SCREEN_ONLY": {
      "messageContainerWidth": "100vw"
    }
  }
}
```

## Comprehensive Theme Example

```json
{
  "name": "modernTheme",
  "clientCode": "SYSTEM",
  "appCode": "myapp",
  "version": 1,
  "variables": {
    "ALL": {
      "primaryColor": "#3B82F6",
      "primaryColorLight": "#60A5FA",
      "primaryColorDark": "#2563EB",
      "secondaryColor": "#10B981",
      "accentColor": "#F59E0B",
      "errorColor": "#EF4444",
      "warningColor": "#F97316",
      "successColor": "#22C55E",
      "infoColor": "#3B82F6",
      
      "textColorPrimary": "#1F2937",
      "textColorSecondary": "#6B7280",
      "textColorMuted": "#9CA3AF",
      "textColorInverse": "#FFFFFF",
      
      "backgroundColor": "#FFFFFF",
      "backgroundColorSecondary": "#F3F4F6",
      "backgroundColorTertiary": "#E5E7EB",
      
      "borderColor": "#D1D5DB",
      "borderRadius": "8px",
      "borderRadiusSmall": "4px",
      "borderRadiusLarge": "12px",
      
      "fontFamily": "'Inter', sans-serif",
      "fontSizeBase": "16px",
      "fontSizeSmall": "14px",
      "fontSizeLarge": "18px",
      "fontSizeHeading": "24px",
      
      "spacing": "16px",
      "spacingSmall": "8px",
      "spacingLarge": "24px",
      
      "shadowSmall": "0 1px 2px rgba(0, 0, 0, 0.05)",
      "shadowMedium": "0 4px 6px rgba(0, 0, 0, 0.1)",
      "shadowLarge": "0 10px 15px rgba(0, 0, 0, 0.1)",
      
      "containerMaxWidth": "1200px",
      "sidebarWidth": "280px",
      "headerHeight": "64px"
    },
    "MOBILE_POTRAIT_SCREEN_ONLY": {
      "fontSizeBase": "14px",
      "spacing": "12px",
      "sidebarWidth": "100vw",
      "containerMaxWidth": "100%"
    },
    "TABLET_POTRAIT_SCREEN_ONLY": {
      "sidebarWidth": "240px",
      "containerMaxWidth": "100%"
    }
  }
}
```

## Accessing Theme Variables

### In Style Properties

Theme variables can be used in component style properties:

```json
{
  "styleProperties": {
    "styleKey": {
      "resolutions": {
        "ALL": {
          "backgroundColor": {
            "location": {
              "type": "EXPRESSION",
              "expression": "Theme.primaryColor"
            }
          },
          "color": {
            "location": {
              "type": "EXPRESSION",
              "expression": "Theme.textColorPrimary"
            }
          }
        }
      }
    }
  }
}
```

### In Component Properties

```json
{
  "properties": {
    "color": {
      "location": {
        "type": "EXPRESSION",
        "expression": "Theme.primaryColor"
      }
    }
  }
}
```

### In Event Functions

```json
{
  "steps": {
    "setColor": {
      "name": "SetStore",
      "namespace": "UIEngine",
      "parameterMap": {
        "path": {
          "p1": { "type": "VALUE", "value": "Page.currentColor", "order": 1 }
        },
        "value": {
          "p2": { 
            "type": "EXPRESSION", 
            "expression": "Theme.primaryColor", 
            "order": 1 
          }
        }
      }
    }
  }
}
```

## Theme Resolution Order

When resolving theme variables, the system follows this priority (highest to lowest):

1. Device-specific resolution (e.g., `MOBILE_POTRAIT_SCREEN_ONLY`)
2. `ALL` resolution (base values)
3. Component style defaults

The `ThemeExtractor` checks the current device type and returns the most specific value available.

## Linking Theme to Application

Themes are linked in the application definition:

```json
{
  "properties": {
    "themes": {
      "618a75b9e594": {
        "name": "appbuildertheme"
      }
    }
  }
}
```

## Common Theme Variable Categories

### Colors

```json
{
  "primaryColor": "#3B82F6",
  "primaryColorHover": "#2563EB",
  "primaryColorActive": "#1D4ED8",
  "secondaryColor": "#6B7280",
  "backgroundColor": "#FFFFFF",
  "backgroundColorDark": "#1F2937",
  "textColor": "#374151",
  "textColorLight": "#9CA3AF",
  "borderColor": "#E5E7EB",
  "errorColor": "#EF4444",
  "successColor": "#22C55E",
  "warningColor": "#F59E0B"
}
```

### Typography

```json
{
  "fontFamily": "'Inter', sans-serif",
  "fontFamilyMono": "'Fira Code', monospace",
  "fontSize": "16px",
  "fontSizeSmall": "14px",
  "fontSizeLarge": "18px",
  "fontWeightNormal": "400",
  "fontWeightMedium": "500",
  "fontWeightBold": "700",
  "lineHeight": "1.5"
}
```

### Spacing and Layout

```json
{
  "spacingXs": "4px",
  "spacingSm": "8px",
  "spacingMd": "16px",
  "spacingLg": "24px",
  "spacingXl": "32px",
  "containerWidth": "1200px",
  "sidebarWidth": "280px",
  "headerHeight": "64px"
}
```

### Borders and Shadows

```json
{
  "borderRadius": "8px",
  "borderRadiusSm": "4px",
  "borderRadiusLg": "12px",
  "borderRadiusFull": "9999px",
  "borderWidth": "1px",
  "shadowSm": "0 1px 2px rgba(0,0,0,0.05)",
  "shadowMd": "0 4px 6px rgba(0,0,0,0.1)",
  "shadowLg": "0 10px 15px rgba(0,0,0,0.1)"
}
```

## Best Practices

1. **Use ALL for Base Values**: Define all variables in `ALL` first, then override for specific breakpoints
2. **Consistent Naming**: Use camelCase and descriptive names (e.g., `primaryColorHover`)
3. **Color Scales**: Define color variations (light, dark, hover, active)
4. **Responsive Values**: Override sizes and spacing for mobile breakpoints
5. **Semantic Names**: Use semantic names like `primaryColor` instead of `blue500`
6. **Document Variables**: Add comments in your design system documentation

## Theme vs CSS Variables

Theme variables are resolved at runtime and can be used in expressions. They are different from CSS custom properties but serve a similar purpose:

| Feature | Theme Variables | CSS Variables |
|---------|-----------------|---------------|
| Syntax | `Theme.primaryColor` | `var(--primary-color)` |
| Scope | Expression-based | CSS cascade |
| Responsive | Resolution-based | Media queries |
| Dynamic | Runtime evaluation | Static (unless changed via JS) |

## Related Documents

- [05-style-system.md](05-style-system.md) - Style properties and breakpoints
- [02-application-and-page-definitions.md](02-application-and-page-definitions.md) - Application themes configuration
- [06-state-management.md](06-state-management.md) - Store prefixes including Theme

