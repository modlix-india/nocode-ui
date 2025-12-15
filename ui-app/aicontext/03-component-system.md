# Component System

## Overview

The component system is the core of the nocode UI engine. Components are React components that are dynamically registered and rendered based on definitions from the page definition.

## Component Registry

Components are registered in `ui-app/client/src/components/index.ts` in a Map structure:

```typescript
const componentMap = new Map<string, Component>();

// Components are registered by name
componentMap.set(Button.name, Button);
componentMap.set(Text.name, Text);
// ... etc
```

### Accessing Components

Components are accessed via the registry:

```typescript
import ComponentDefinitions from "./components";

const Comp = ComponentDefinitions.get(componentType)?.component;
if (!Comp) Comp = Nothing.component; // Fallback
```

## Component Interface

Each component must export a `Component` interface:

```typescript
interface Component {
    name: string;                    // Unique component name
    order?: number;                  // Display order in editor
    displayName: string;             // Human-readable name
    description: string;             // Component description
    component: React.ElementType;     // Main React component
    styleComponent?: React.ElementType;  // Style editor component
    propertyValidation: (props: any) => Array<string>;  // Validation function
    properties: Array<ComponentPropertyDefinition>;    // Property definitions
    styleProperties?: ComponentStylePropertyDefinition; // Style property definitions
    stylePseudoStates?: Array<string>;  // Supported pseudo-states (hover, focus, etc.)
    styleDefaults: Map<string, string>;  // Default style values
    allowedChildrenType?: Map<string, number>;  // Allowed child component types
    parentType?: string;              // Required parent type (if any)
    isHidden?: boolean;               // Hide from component palette
    subComponentDefinition: ComponentStyleSubComponentDefinition[];  // Sub-components for styling
    defaultTemplate?: ComponentDefinition;  // Default template when creating
    bindingPaths?: {                  // Binding path definitions
        bindingPath?: { name: string };
        bindingPath2?: { name: string };
        // ... up to bindingPath10
    };
    sections?: Array<Section>;        // Component sections
    needShowInDesginMode?: boolean;   // Show in design mode
    validations?: {                   // Custom validation functions
        [name: string]: (validation: any, value: any, def: ComponentDefinition, ...) => Array<string>;
    };
    propertiesForTheme?: Array<ComponentPropertyDefinition>;
    stylePropertiesForTheme: Array<StylePropertyDefinition>;
    externalStylePropsForThemeJson?: boolean;
    tutorial?: Tutorial;              // Tutorial information
}
```

## Component Definition Structure

When a component appears in a page definition, it has this structure:

```typescript
interface ComponentDefinition {
  key: string; // Unique key (UUID)
  name: string; // Display name
  type: string; // Component type (must match registry)

  // Component properties
  properties?: {
    [propertyName: string]:
      | ComponentProperty<any>
      | ComponentMultiProperty<any>;
  };

  // Style properties (responsive)
  styleProperties?: ComponentStyle;

  // Validations
  validations?: Array<Validation>;

  // Child component keys
  children?: {
    [childKey: string]: boolean;
  };

  // Display order
  displayOrder?: number;

  // Binding paths (for data binding)
  bindingPath?: DataLocation;
  bindingPath2?: DataLocation;
  // ... up to bindingPath10
}
```

## Component Rendering

### Component Props

Every component receives these props:

```typescript
interface ComponentProps {
  definition: ComponentDefinition; // Component definition
  pageDefinition: PageDefinition; // Page definition
  locationHistory: Array<LocationHistory>; // Location history for nested components
  context: RenderContext; // Rendering context
}
```

### Render Context

```typescript
interface RenderContext {
  pageName: string; // Current page name
  isReadonly?: boolean; // Read-only mode
  formKey?: Array<string>; // Form context
  showValidationMessages?: boolean; // Show validation messages
  table?: any; // Table context
  disableSelection?: boolean; // Disable selection
  level: number; // Nesting level
  menuLevel?: number; // Menu nesting level
  shellPageName: string; // Shell page name
}
```

## Component Lifecycle

### 1. Definition Resolution

Components are resolved from the registry in `Children.tsx`:

```typescript
let Comp = ComponentDefinitions.get(e.type)?.component;
if (!Comp) Comp = Nothing.component; // Fallback to Nothing component
```

### 2. Property Resolution

Properties are resolved using the `useDefinition` hook:

```typescript
const { properties, stylePropertiesWithPseudoStates } = useDefinition(
  definition,
  propertiesDefinition,
  stylePropertiesDefinition,
  locationHistory,
  pageExtractor,
  urlExtractor
);
```

This hook:

- Resolves `ComponentProperty` values from data locations
- Processes responsive style properties
- Handles pseudo-states
- Sets up reactivity listeners

### 3. Component Rendering

Components are rendered as React elements:

```typescript
const rComp = React.createElement(Comp, {
  definition: e,
  key: e.key,
  pageDefinition: pageDefinition,
  context: { ...ctx },
  locationHistory: locationHistory,
});
```

## Available Components

### Layout Components

- **Grid**: Flexbox-based grid layout
- **SectionGrid**: Section-based grid with responsive sections
- **Page**: Page container
- **SubPage**: Nested page component

### Form Input Components

- **TextBox**: Text input field
- **TextArea**: Multi-line text input
- **Dropdown**: Select dropdown
- **CheckBox**: Checkbox input
- **RadioButton**: Radio button input
- **ToggleButton**: Toggle switch
- **FileUpload**: File upload input
- **ColorPicker**: Color picker
- **PhoneNumber**: Phone number input with country code
- **Otp**: OTP input field
- **RangeSlider**: Range slider input
- **Calendar**: Date picker/calendar

### Display Components

- **Text**: Text display (plain text or markdown)
- **TextList**: List of text items
- **Image**: Image display
- **ImageWithBrowser**: Image with browser/lightbox
- **Video**: Video player
- **Audio**: Audio player
- **Icon**: Icon display
- **ProgressBar**: Progress bar
- **Chart**: Chart/graph component
- **Table**: Data table
- **TableGrid**: Table grid view
- **TableEmptyGrid**: Empty table state
- **TablePreviewGrid**: Table preview
- **TableColumns**: Table columns container
- **TableColumn**: Table column
- **TableColumnHeader**: Table column header
- **TableDynamicColumn**: Dynamic table column
- **Gallery**: Image gallery
- **Carousel**: Carousel/slider
- **SmallCarousel**: Small carousel
- **Tabs**: Tab container
- **Tags**: Tag display
- **Stepper**: Stepper/wizard component
- **Timer**: Timer/countdown
- **MarkdownEditor**: Markdown editor
- **MarkdownTOC**: Markdown table of contents

### Interactive Components

- **Button**: Button component
- **ButtonBar**: Button bar container
- **Link**: Link component
- **Menu**: Menu component
- **Popup**: Popup/modal
- **Popover**: Popover tooltip
- **Iframe**: Iframe embed

### Data Components

- **ArrayRepeater**: Repeat array items
- **Form**: Form container
- **SchemaForm**: Dynamic form from schema
- **SchemaBuilder**: Schema builder UI

### Editor Components (Design Mode)

- **PageEditor**: Page editor
- **FormEditor**: Form editor
- **FillerDefinitionEditor**: Filler definition editor
- **FillerValueEditor**: Filler value editor
- **KIRunEditor**: KIRun function editor
- **SchemaBuilder**: Schema builder
- **TemplateEditor**: Template editor
- **TextEditor**: Text/code editor
- **ThemeEditor**: Theme editor

### Other Components

- **Animator**: Animation component
- **SSEventListener**: Server-sent events listener
- **Jot**: Jot component

## Component Categories

Components can be categorized by their purpose:

1. **Layout**: Grid, SectionGrid, Page, SubPage
2. **Form Inputs**: TextBox, TextArea, Dropdown, CheckBox, etc.
3. **Display**: Text, Image, Video, Icon, Table, Chart, etc.
4. **Interactive**: Button, Link, Menu, Popup, Popover
5. **Data**: ArrayRepeater, Form, SchemaForm
6. **Editors**: PageEditor, FormEditor, KIRunEditor, etc.

## Children Rendering

Components can have children. The `Children` component handles rendering:

```typescript
// In component definition
children: {
    "child-key-1": true,
    "child-key-2": true
}

// Children are rendered by:
<Children
    pageDefinition={pageDefinition}
    renderableChildren={definition.children}
    context={context}
    locationHistory={locationHistory}
/>
```

### Children Ordering

Children are sorted by:

1. `displayOrder` (ascending)
2. `key` (alphabetical)

### Children Visibility

Children can be filtered by visibility:

```typescript
// Component with visibility property
properties: {
    visibility: {
        location: {
            type: "EXPRESSION",
            expression: "Store.showMenu"
        }
    }
}
```

## Component Examples

### Simple Button

```json
{
  "key": "button-1",
  "name": "Submit Button",
  "type": "Button",
  "properties": {
    "label": { "value": "Submit" },
    "onClick": { "value": "submitEvent" }
  },
  "styleProperties": {
    "style-1": {
      "resolutions": {
        "ALL": {
          "backgroundColor": { "value": "#007bff" },
          "color": { "value": "#ffffff" }
        }
      }
    }
  }
}
```

### Text with Expression

```json
{
  "key": "text-1",
  "name": "Dynamic Text",
  "type": "Text",
  "properties": {
    "text": {
      "location": {
        "type": "EXPRESSION",
        "expression": "Store.userName"
      }
    }
  }
}
```

### Grid with Children

```json
{
  "key": "grid-1",
  "name": "Main Grid",
  "type": "Grid",
  "styleProperties": {
    "style-1": {
      "resolutions": {
        "ALL": {
          "display": { "value": "flex" },
          "flexDirection": { "value": "column" }
        }
      }
    }
  },
  "children": {
    "text-1": true,
    "button-1": true
  }
}
```

## Component Validation

Components can define custom validation:

```typescript
validations: {
  customValidation: (
    validation,
    value,
    def,
    locationHistory,
    pageExtractor
  ) => {
    // Return array of error messages
    if (!value) return ["Value is required"];
    return [];
  };
}
```

## Related Documents

- [04-property-system.md](04-property-system.md) - Property system details
- [05-style-system.md](05-style-system.md) - Style system details
- [10-component-reference.md](10-component-reference.md) - Complete component reference
- [09-rendering-flow.md](09-rendering-flow.md) - Rendering process
