# Style System

## Overview

The style system provides responsive, conditional styling with pseudo-state support. Styles are defined per component and can vary based on screen size, conditions, and component states (hover, focus, etc.).

## Style Resolution Breakpoints

The system supports multiple responsive breakpoints:

```typescript
enum StyleResolution {
  ALL = "ALL", // Default for all resolutions
  WIDE_SCREEN = "WIDE_SCREEN", // > 1280px
  DESKTOP_SCREEN = "DESKTOP_SCREEN", // > 1024px
  DESKTOP_SCREEN_ONLY = "DESKTOP_SCREEN_ONLY", // 1025px - 1280px
  DESKTOP_SCREEN_SMALL = "DESKTOP_SCREEN_SMALL", // ≤ 1280px
  TABLET_LANDSCAPE_SCREEN = "TABLET_LANDSCAPE_SCREEN", // > 960px
  TABLET_LANDSCAPE_SCREEN_ONLY = "TABLET_LANDSCAPE_SCREEN_ONLY", // 961px - 1024px
  TABLET_LANDSCAPE_SCREEN_SMALL = "TABLET_LANDSCAPE_SCREEN_SMALL", // ≤ 1024px
  TABLET_POTRAIT_SCREEN = "TABLET_POTRAIT_SCREEN", // > 640px
  TABLET_POTRAIT_SCREEN_ONLY = "TABLET_POTRAIT_SCREEN_ONLY", // 641px - 960px
  TABLET_POTRAIT_SCREEN_SMALL = "TABLET_POTRAIT_SCREEN_SMALL", // ≤ 960px
  MOBILE_LANDSCAPE_SCREEN = "MOBILE_LANDSCAPE_SCREEN", // > 480px
  MOBILE_LANDSCAPE_SCREEN_ONLY = "MOBILE_LANDSCAPE_SCREEN_ONLY", // 481px - 640px
  MOBILE_LANDSCAPE_SCREEN_SMALL = "MOBILE_LANDSCAPE_SCREEN_SMALL", // ≤ 640px
  MOBILE_POTRAIT_SCREEN = "MOBILE_POTRAIT_SCREEN", // > 320px
  MOBILE_POTRAIT_SCREEN_ONLY = "MOBILE_POTRAIT_SCREEN_ONLY", // ≤ 480px
}
```

### Breakpoint Hierarchy

Breakpoints cascade - a style for `DESKTOP_SCREEN` applies to all screen sizes larger than 1024px, including `WIDE_SCREEN`.

## ComponentStyle Structure

```typescript
interface ComponentStyle {
  [styleKey: string]: EachComponentStyle;
}

interface EachComponentStyle {
  condition?: ComponentProperty<boolean>; // Conditional style
  conditionName?: string; // Named condition
  pseudoState?: string; // Pseudo-state (hover, focus, etc.)
  resolutions?: ComponentResoltuions; // Responsive styles
}

interface ComponentResoltuions {
  [StyleResolution.ALL]?: EachComponentResolutionStyle;
  [StyleResolution.WIDE_SCREEN]?: EachComponentResolutionStyle;
  // ... other resolutions
}

interface EachComponentResolutionStyle {
  [propertyName: string]: ComponentProperty<string>;
}
```

## Style Definition Example

```json
{
  "styleProperties": {
    "3INq4d0XPB2v7BL7Nb1sXO": {
      "resolutions": {
        "ALL": {
          "width": { "type": "VALUE", "value": "100vw" },
          "height": { "type": "VALUE", "value": "100vh" },
          "alignItems": { "type": "VALUE", "value": "center" },
          "justifyContent": { "type": "VALUE", "value": "center" }
        },
        "MOBILE_POTRAIT_SCREEN_ONLY": {
          "width": { "type": "VALUE", "value": "100%" },
          "height": { "type": "VALUE", "value": "auto" }
        }
      }
    }
  }
}
```

## Pseudo-States

Components can have different styles for different states:

### Supported Pseudo-States

- `hover`: Mouse hover
- `focus`: Focused state
- `active`: Active/pressed state
- `disabled`: Disabled state
- `selected`: Selected state
- Custom states defined by component

### Pseudo-State Example

```json
{
  "styleProperties": {
    "style-1": {
      "resolutions": {
        "ALL": {
          "backgroundColor": { "type": "VALUE", "value": "#ffffff" },
          "color": { "type": "VALUE", "value": "#000000" }
        }
      }
    },
    "style-2": {
      "pseudoState": "hover",
      "resolutions": {
        "ALL": {
          "backgroundColor": { "type": "VALUE", "value": "#f0f0f0" }
        }
      }
    },
    "style-3": {
      "pseudoState": "focus",
      "resolutions": {
        "ALL": {
          "borderColor": { "type": "VALUE", "value": "#007bff" },
          "outlineWidth": { "type": "VALUE", "value": "2px" },
          "outlineStyle": { "type": "VALUE", "value": "solid" },
          "outlineColor": { "type": "VALUE", "value": "#007bff" }
        }
      }
    }
  }
}
```

### Using Pseudo-States in Components

Components track pseudo-states and pass them to style processor:

```typescript
const [hover, setHover] = useState(false);
const [focus, setFocus] = useState(false);

const styleProperties = processComponentStylePseudoClasses(
  pageDefinition,
  { hover, focus, disabled: false },
  stylePropertiesWithPseudoStates
);
```

## Conditional Styles

Styles can be conditionally applied based on store values:

```json
{
  "styleProperties": {
    "style-1": {
      "condition": {
        "location": {
          "type": "EXPRESSION",
          "expression": "Store.isDarkMode"
        }
      },
      "resolutions": {
        "ALL": {
          "backgroundColor": { "type": "VALUE", "value": "#1a1a1a" },
          "color": { "type": "VALUE", "value": "#ffffff" }
        }
      }
    }
  }
}
```

### Named Conditions

Conditions can be named for reuse:

```json
{
  "styleProperties": {
    "style-1": {
      "conditionName": "darkMode",
      "resolutions": {
        "ALL": {
          "backgroundColor": { "type": "VALUE", "value": "#1a1a1a" }
        }
      }
    },
    "style-2": {
      "conditionName": "darkMode",
      "resolutions": {
        "ALL": {
          "color": { "type": "VALUE", "value": "#ffffff" }
        }
      }
    }
  }
}
```

## Style Targets and Sub-Components

Components can have multiple style targets (sub-components):

### Style Target Syntax

- `comp`: Main component
- `comp:hover`: Main component hover state
- `subComponent`: Sub-component
- `subComponent:hover`: Sub-component hover state

### Example with Sub-Components

Style property keys use the format `<subComponent>-<cssProp>:<pseudoState>` (subComponent and pseudoState are optional):

```json
{
  "styleProperties": {
    "style-1": {
      "resolutions": {
        "ALL": {
          "backgroundColor": { "type": "VALUE", "value": "#ffffff" },
          "comp-label-fontSize": { "type": "VALUE", "value": "16px" },
          "comp-label-fontWeight": { "type": "VALUE", "value": "bold" },
          "comp-icon-color": { "type": "VALUE", "value": "#007bff" }
        }
      }
    }
  }
}
```

## Style Processing

The `processComponentStylePseudoClasses` function processes styles:

1. **Base Styles**: Starts with default/ALL resolution styles
2. **Responsive Override**: Applies current resolution styles
3. **Pseudo-State Merge**: Merges active pseudo-state styles
4. **Conditional Merge**: Merges conditional styles if conditions are met
5. **Class Application**: Applies CSS classes from page definition

### Processing Flow

```typescript
function processComponentStylePseudoClasses(
  pdef: PageDefinition,
  pseudoStates: { [key: string]: boolean },
  styleProperties: any
): any {
  let style = { ...styleProperties[""] }; // Start with default

  // Apply pseudo-state styles
  for (let [state, status] of Object.entries(pseudoStates)) {
    if (status && styleProperties[state]) {
      // Merge pseudo-state styles
    }
  }

  // Apply processed classes
  if (pdef.processedClasses) {
    // Merge CSS classes
  }

  return style;
}
```

## CSS Classes in Pages

Pages can define custom CSS classes:

```typescript
interface StyleClassDefinition {
  selector?: string; // CSS selector
  comments?: string; // Comments
  mediaQuery?: string; // Media query
  style?: string; // CSS styles
  key: string; // Unique key
  priority?: number; // Priority
}
```

### Example

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
        "selector": "palcol5",
        "style": "animation: _palcol 10s infinite;\nanimationDelay: 0s;"
      }
    }
  }
}
```

These are injected as `<style>` tags in the page.

## Theme System

Styles can reference theme variables:

```json
{
  "color": {
    "type": "EXPRESSION",
    "expression": "Theme.primaryColor"
  },
  "backgroundColor": {
    "type": "EXPRESSION",
    "expression": "Theme.backgroundColor"
  }
}
```

Theme variables are defined in the theme definition and accessible via `Theme.` prefix.

## Style Property Definitions

Components define which style properties they support:

```typescript
interface ComponentStylePropertyDefinition {
  [subComponentName: string]: Array<string>; // Property names per sub-component
}
```

Example:

```typescript
{
    '': ['width', 'height', 'backgroundColor'],  // Main component
    'label': ['fontSize', 'fontWeight', 'color'], // Label sub-component
    'icon': ['width', 'height', 'color']          // Icon sub-component
}
```

## Real Examples from Samples

### Responsive Grid

```json
{
  "styleProperties": {
    "3INq4d0XPB2v7BL7Nb1sXO": {
      "resolutions": {
        "ALL": {
          "width": { "type": "VALUE", "value": "100vw" },
          "height": { "type": "VALUE", "value": "100vh" },
          "display": { "type": "VALUE", "value": "flex" },
          "flexDirection": { "type": "VALUE", "value": "column" }
        },
        "MOBILE_POTRAIT_SCREEN_ONLY": {
          "flexDirection": { "type": "VALUE", "value": "row" },
          "height": { "type": "VALUE", "value": "auto" }
        }
      }
    }
  }
}
```

### Text with Theme Color

```json
{
  "styleProperties": {
    "3zHxLip0NfbU71SALwnHVh": {
      "resolutions": {
        "ALL": {
          "textAlign": { "type": "VALUE", "value": "center" },
          "color": {
            "type": "EXPRESSION",
            "expression": "Theme.backgroundColorFour"
          }
        }
      }
    }
  }
}
```

## Style Resolution Order

1. **ALL resolution** (base styles)
2. **Current resolution** (overrides)
3. **Pseudo-states** (hover, focus, etc.)
4. **Conditional styles** (if conditions met)
5. **CSS classes** (from page definition)

## Related Documents

- [04-property-system.md](04-property-system.md) - Property system
- [06-state-management.md](06-state-management.md) - Store system for conditional styles
- [02-application-and-page-definitions.md](02-application-and-page-definitions.md) - CSS classes in pages
