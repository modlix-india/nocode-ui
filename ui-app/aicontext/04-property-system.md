# Property System

## Overview

The property system allows components to have configurable properties that can be static values or dynamic data locations (expressions). Properties are resolved at runtime using the `useDefinition` hook.

## ComponentProperty Structure

```typescript
interface ComponentProperty<T> {
  value?: T; // Static value
  location?: DataLocation; // Data location (VALUE or EXPRESSION)
  overrideValue?: T; // Override value (design mode)
  backupExpression?: string; // Backup expression
}
```

### Property Resolution Priority

1. `overrideValue` (if in design mode)
2. `location` (if exists and resolves to a value)
3. `value` (static fallback)

## DataLocation Types

### VALUE Type

Direct store path reference:

```typescript
{
    type: "VALUE",
    value: "Store.user.name"
}
```

Resolves to the value at `Store.user.name` in the store.

### EXPRESSION Type

JavaScript expression that evaluates to a value:

```typescript
{
    type: "EXPRESSION",
    expression: "Store.items.length > 0 ? 'Items available' : 'No items'"
}
```

Expressions can use:

- Store paths: `Store.user.name`
- Page data: `Page.currentItem`
- URL parameters: `Url.pageName`
- Theme variables: `Theme.primaryColor`
- Functions: `Math.max(Store.value1, Store.value2)`

## ComponentPropertyDefinition

Property definitions describe what properties a component supports:

```typescript
interface ComponentPropertyDefinition {
  name: string; // Property name (key)
  displayName: string; // Human-readable name
  description?: string; // Property description
  schema: Schema; // KIRun schema (type definition)
  editor?: ComponentPropertyEditor; // Editor type
  translatable?: boolean; // Can be translated
  group?: ComponentPropertyGroup; // Property group
  multiValued?: boolean; // Supports multiple values
  enumValues?: Array<ComponentENUM>; // Enum values
  notImplemented?: boolean; // Not yet implemented
  defaultValue?: any; // Default value
  displayOrder?: number; // Display order in editor
  hide?: boolean; // Hide from editor
  validationList?: Array<{
    // Validation options
    name: string;
    displayName?: string;
    fields?: Array<ComponentPropertyDefinition>;
  }>;
}
```

## Property Editors

Different property types use different editors in the design mode:

```typescript
enum ComponentPropertyEditor {
  DATA_LOCATION, // Data location editor (VALUE/EXPRESSION)
  TRANSLATABLE_PROP, // Translatable property editor
  ICON, // Icon picker
  VALIDATION, // Validation editor
  ENUM, // Enum dropdown
  PAGE_SELECTOR, // Page selector
  COMPONENT_SELECTOR, // Component selector
  EVENT_SELECTOR, // Event function selector
  LAYOUT, // Layout editor
  BACKGROUND, // Background editor
  STYLE_SELECTOR, // Style selector
  THEME_SELECTOR, // Theme selector
  IMAGE, // Image picker
  SCHEMA, // Schema editor
  LARGE_TEXT, // Large text editor
  ANIMATION, // Animation editor
  ANIMATIONOBSERVER, // Animation observer editor
  COLOR_PICKER, // Color picker
  SECTION_PROPERTIES_EDITOR, // Section properties editor
  TEXT_EDITOR, // Text editor (code/markdown)
}
```

## Property Groups

Properties are organized into groups:

```typescript
enum ComponentPropertyGroup {
  BASIC = "BASIC", // Basic properties
  DATA = "DATA", // Data-related properties
  EVENTS = "EVENTS", // Event properties
  ADVANCED = "ADVANCED", // Advanced properties
  COMMON = "COMMON", // Common properties
  VALIDATION = "VALIDATION", // Validation properties
  SEO = "SEO", // SEO properties
}
```

## Multi-Valued Properties

Some properties support multiple values:

```typescript
interface ComponentMultiProperty<T> {
  [key: string]: {
    key: string;
    order?: number;
    property: ComponentProperty<T>;
  };
}
```

Example: A component might have multiple validation rules:

```json
{
  "validations": {
    "rule1": {
      "key": "rule1",
      "order": 1,
      "property": {
        "value": { "type": "required", "message": "Field is required" }
      }
    },
    "rule2": {
      "key": "rule2",
      "order": 2,
      "property": {
        "value": { "type": "minLength", "value": 5 }
      }
    }
  }
}
```

## useDefinition Hook

The `useDefinition` hook resolves all properties for a component:

```typescript
const { properties, stylePropertiesWithPseudoStates } = useDefinition(
  definition, // Component definition
  propertiesDefinition, // Property definitions
  stylePropertiesDefinition, // Style property definitions
  locationHistory, // Location history
  pageExtractor, // Page store extractor
  urlExtractor // URL extractor
);
```

### How It Works

1. **Extractors Setup**: Creates token value extractors for:

   - Store (`Store.`)
   - Page (`Page.`)
   - Url (`Url.`)
   - LocalStore (`LocalStore.`)
   - Theme (`Theme.`)
   - Filler (`Filler.`)
   - Parent (`Parent.`) - for nested components

2. **Path Extraction**: Extracts all store paths from properties

3. **Reactivity**: Sets up listeners for all paths

4. **State Creation**: Creates resolved state with:
   - Resolved property values
   - Processed style properties
   - Pseudo-state handling

## Property Examples

### Static Value

```json
{
  "label": {
    "value": "Click Me"
  }
}
```

### Store Path (VALUE)

```json
{
  "text": {
    "location": {
      "type": "VALUE",
      "value": "Store.user.name"
    }
  }
}
```

### Expression (EXPRESSION)

```json
{
  "text": {
    "location": {
      "type": "EXPRESSION",
      "expression": "Store.items.length > 0 ? 'Items: ' + Store.items.length : 'No items'"
    }
  }
}
```

### With Fallback Value

```json
{
  "text": {
    "value": "Default Text",
    "location": {
      "type": "EXPRESSION",
      "expression": "Store.dynamicText"
    }
  }
}
```

If `Store.dynamicText` is null/undefined, falls back to "Default Text".

### Theme Reference

```json
{
  "color": {
    "location": {
      "type": "EXPRESSION",
      "expression": "Theme.primaryColor"
    }
  }
}
```

### URL Parameter

```json
{
  "pageName": {
    "location": {
      "type": "EXPRESSION",
      "expression": "Url.pageName"
    }
  }
}
```

### Page Data

```json
{
  "currentItem": {
    "location": {
      "type": "EXPRESSION",
      "expression": "Page.currentItem"
    }
  }
}
```

## Translatable Properties

Properties marked as `translatable: true` support translations:

```typescript
{
    name: "label",
    displayName: "Label",
    translatable: true,
    schema: SCHEMA_STRING_COMP_PROP
}
```

In the definition:

```json
{
  "label": {
    "value": "Hello World"
  }
}
```

The system will:

1. Look up translation key in page translations
2. Fall back to the value if no translation found
3. Support multiple languages

## Property Validation

Properties can have validation rules:

```typescript
{
    name: "email",
    displayName: "Email",
    schema: SCHEMA_STRING_COMP_PROP,
    validationList: [
        {
            name: "required",
            displayName: "Required",
            fields: [...]
        },
        {
            name: "email",
            displayName: "Email Format",
            fields: [...]
        }
    ]
}
```

## Common Properties

Many components share common properties:

- `visibility`: Show/hide component
- `designType`: Design variant
- `readOnly`: Read-only mode
- `disabled`: Disabled state

These are defined in `components/util/properties.ts` as `COMMON_COMPONENT_PROPERTIES`.

## Real Examples from Samples

### Button with Label and Click Event

```json
{
  "key": "button-1",
  "type": "Button",
  "properties": {
    "label": { "value": "Submit" },
    "onClick": { "value": "submitEvent" },
    "colorScheme": { "value": "_primary" }
  }
}
```

### Text with Dynamic Content

```json
{
  "key": "text-1",
  "type": "Text",
  "properties": {
    "text": {
      "location": {
        "type": "EXPRESSION",
        "expression": "Store.userName || 'Guest'"
      }
    }
  }
}
```

### Icon with Theme Color

```json
{
  "key": "icon-1",
  "type": "Icon",
  "properties": {
    "icon": { "value": "fa-solid fa-user" },
    "colorScheme": {
      "location": {
        "type": "EXPRESSION",
        "expression": "Theme.iconColor"
      }
    }
  }
}
```

## Related Documents

- [06-state-management.md](06-state-management.md) - Store system and extractors
- [11-data-binding.md](11-data-binding.md) - Data binding details
- [13-translations.md](13-translations.md) - Translation system
- [12-validation-system.md](12-validation-system.md) - Validation system
