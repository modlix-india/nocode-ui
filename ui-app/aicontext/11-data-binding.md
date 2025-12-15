# Data Binding

## Overview

Data binding allows components to bind to data sources using binding paths. Components can have up to 10 binding paths (`bindingPath` through `bindingPath10`) that provide data context for the component and its children.

## Binding Path Structure

Binding paths are `DataLocation` objects:

```typescript
interface ComponentDefinition {
  bindingPath?: DataLocation;
  bindingPath2?: DataLocation;
  bindingPath3?: DataLocation;
  // ... up to bindingPath10
}

interface DataLocation {
  type: "EXPRESSION" | "VALUE";
  value?: string; // Store path (for VALUE type)
  expression?: string; // Expression (for EXPRESSION type)
}
```

## Binding Path Types

### VALUE Type

Direct store path reference:

```json
{
  "bindingPath": {
    "type": "VALUE",
    "value": "Store.items"
  }
}
```

This binds the component to `Store.items` array.

### EXPRESSION Type

JavaScript expression:

```json
{
  "bindingPath": {
    "type": "EXPRESSION",
    "expression": "Store.items.filter(i => i.active)"
  }
}
```

This binds to the result of the expression.

## Binding Path Usage

### In Components

Components can access binding paths:

```typescript
const bindingPath = definition.bindingPath;
const data = bindingPath
  ? getDataFromLocation(bindingPath, locationHistory, ...extractors)
  : undefined;
```

### In ArrayRepeater

ArrayRepeater uses `bindingPath` to iterate over arrays:

```json
{
  "type": "ArrayRepeater",
  "bindingPath": {
    "type": "VALUE",
    "value": "Store.items"
  },
  "children": {
    "item-template": true
  }
}
```

Each item in the array becomes available as `Parent.` context.

### In Table

Table uses `bindingPath` for data:

```json
{
  "type": "Table",
  "bindingPath": {
    "type": "VALUE",
    "value": "Store.users"
  }
}
```

## Parent Context

When a component is nested (e.g., in ArrayRepeater), it can access parent data via `Parent.` prefix:

```typescript
// In ArrayRepeater item
const locationHistory: LocationHistory[] = [
  {
    location: { type: "VALUE", value: "Store.items" },
    index: 0,
    pageName: "home",
    componentKey: "repeater-1",
  },
];

// Child component can access:
// Parent.name -> items[0].name
// Parent.id -> items[0].id
```

### Parent Extractor

The `ParentExtractor` provides access to parent data:

```typescript
class ParentExtractor extends SpecialTokenValueExtractor {
  getPrefix(): string; // Returns "Parent."

  // Resolves "Parent.name" to parent item's name
  getValueInternal(token: string): any;
}
```

## Multiple Binding Paths

Components can have multiple binding paths for different data:

```json
{
  "type": "CustomComponent",
  "bindingPath": {
    "type": "VALUE",
    "value": "Store.items"
  },
  "bindingPath2": {
    "type": "VALUE",
    "value": "Store.categories"
  },
  "bindingPath3": {
    "type": "EXPRESSION",
    "expression": "Store.items.length"
  }
}
```

## Binding Path Examples

### Simple Array Binding

```json
{
  "type": "ArrayRepeater",
  "bindingPath": {
    "type": "VALUE",
    "value": "Store.products"
  },
  "children": {
    "product-card": true
  }
}
```

### Filtered Array Binding

```json
{
  "type": "ArrayRepeater",
  "bindingPath": {
    "type": "EXPRESSION",
    "expression": "Store.products.filter(p => p.category === 'electronics')"
  },
  "children": {
    "product-card": true
  }
}
```

### Nested Object Binding

```json
{
  "type": "Text",
  "properties": {
    "text": {
      "location": {
        "type": "EXPRESSION",
        "expression": "Parent.name"
      }
    }
  }
}
```

### Computed Binding

```json
{
  "type": "Text",
  "bindingPath": {
    "type": "EXPRESSION",
    "expression": "Store.items.reduce((sum, item) => sum + item.price, 0)"
  },
  "properties": {
    "text": {
      "location": {
        "type": "EXPRESSION",
        "expression": "'Total: $' + Parent"
      }
    }
  }
}
```

## Store Path Syntax

Store paths use dot notation:

- `Store.user.name` - Global store
- `Page.currentItem` - Page-scoped data
- `Url.id` - URL parameter
- `Theme.primaryColor` - Theme variable
- `Parent.name` - Parent context (nested components)

## Expression Evaluation

Expressions are evaluated using KIRun's expression evaluator:

```typescript
const value = _getData(expression, ...tokenExtractors);
```

Expressions can use:

- Store paths
- JavaScript operators
- Functions (Math, String, Array methods)
- Conditional operators

## Binding Path Resolution

Binding paths are resolved in this order:

1. **Parent Context**: If in nested component, parent data is available
2. **Store Extractors**: Store, Page, Url, Theme, etc.
3. **Expression Evaluation**: If EXPRESSION type, evaluate expression

## Real Examples from Samples

### ArrayRepeater with Items

```json
{
  "type": "ArrayRepeater",
  "bindingPath": {
    "type": "VALUE",
    "value": "Store.cartItems"
  },
  "children": {
    "cart-item": true
  }
}
```

### Table with Data

```json
{
  "type": "Table",
  "bindingPath": {
    "type": "VALUE",
    "value": "Page.users"
  },
  "properties": {
    "columns": {
      "value": [
        { "field": "name", "header": "Name" },
        { "field": "email", "header": "Email" }
      ]
    }
  }
}
```

## Related Documents

- [04-property-system.md](04-property-system.md) - Property system
- [06-state-management.md](06-state-management.md) - Store system
- [09-rendering-flow.md](09-rendering-flow.md) - Rendering with location history
