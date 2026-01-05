# Nocode UI System - Context Documents

This directory contains comprehensive context documents for the nocode UI system. These documents are designed for use in a RAG (Retrieval-Augmented Generation) system to help LLMs understand and generate applications and websites using this nocode platform.

## Document Structure

### Core Architecture

1. **[01-architecture-overview.md](01-architecture-overview.md)** - System architecture, initialization flow, and key concepts
2. **[02-application-and-page-definitions.md](02-application-and-page-definitions.md)** - Application and page definition structures, APIs, and examples

### Component System

3. **[03-component-system.md](03-component-system.md)** - Component registry, structure, and rendering
4. **[10-component-reference.md](10-component-reference.md)** - Complete reference of all available components

### Data and Properties

5. **[04-property-system.md](04-property-system.md)** - Property types, editors, and resolution
6. **[11-data-binding.md](11-data-binding.md)** - Data binding paths and expressions
7. **[06-state-management.md](06-state-management.md)** - Store architecture, extractors, and reactivity

### Styling

8. **[05-style-system.md](05-style-system.md)** - Responsive styles, pseudo-states, and breakpoints
9. **[17-theme-definitions.md](17-theme-definitions.md)** - Theme structure, variables, and responsive breakpoints
10. **[18-style-definitions.md](18-style-definitions.md)** - Global style definitions and CSS

### Functionality

11. **[07-event-system.md](07-event-system.md)** - Event functions and execution
12. **[08-functions-and-actions.md](08-functions-and-actions.md)** - UIEngine functions reference (complete)
13. **[21-kirun-system-functions.md](21-kirun-system-functions.md)** - KIRun System functions (Array, String, Math, Date, etc.)
14. **[12-validation-system.md](12-validation-system.md)** - Validation structure and rules
15. **[13-translations.md](13-translations.md)** - Translation and multi-language support

### Definition Types

16. **[16-schema-definitions.md](16-schema-definitions.md)** - Schema definitions for data validation
17. **[19-function-definitions.md](19-function-definitions.md)** - KIRun function definition structure
18. **[20-filler-and-uripath.md](20-filler-and-uripath.md)** - Filler values and custom API endpoints (URIPath)

### Implementation

19. **[09-rendering-flow.md](09-rendering-flow.md)** - Detailed rendering process and hierarchy
20. **[14-api-reference.md](14-api-reference.md)** - API endpoints and request/response formats

### Examples

21. **[15-examples-and-patterns.md](15-examples-and-patterns.md)** - Real-world examples and best practices

## Sample Data

The `samples/` directory contains real examples exported from MongoDB:

- **application/**: Sample application definitions
- **page/**: Sample page definitions
- **style/**: Sample style definitions
- **theme/**: Sample theme definitions

These samples demonstrate real-world usage patterns and can be referenced when generating new applications.

## Object Types Reference

The nocode system stores these object types in `appbuilder-data/`:

| Object Type | Directory | Documentation |
|-------------|-----------|---------------|
| Application | `Application/` | [02-application-and-page-definitions.md](02-application-and-page-definitions.md) |
| Page | `Page/` | [02-application-and-page-definitions.md](02-application-and-page-definitions.md) |
| Schema | `Schema/` | [16-schema-definitions.md](16-schema-definitions.md) |
| Theme | `Theme/` | [17-theme-definitions.md](17-theme-definitions.md) |
| Style | `Style/` | [18-style-definitions.md](18-style-definitions.md) |
| Function | `Function/` | [19-function-definitions.md](19-function-definitions.md) |
| Filler | (in Application) | [20-filler-and-uripath.md](20-filler-and-uripath.md) |
| URIPath | `URIPath/` | [20-filler-and-uripath.md](20-filler-and-uripath.md) |

## Quick Start Guide

### For LLM RAG Systems

1. **Start with Architecture**: Read `01-architecture-overview.md` to understand the system
2. **Understand Definitions**: Review `02-application-and-page-definitions.md` for data structures
3. **Learn Components**: Check `03-component-system.md` and `10-component-reference.md` for available components
4. **Study Functions**: Review `08-functions-and-actions.md` and `21-kirun-system-functions.md` for available functions
5. **Study Examples**: Look at `15-examples-and-patterns.md` and `samples/` for real examples

### For Application Generation

When generating an application:

1. Create **Application Definition** (see `02-application-and-page-definitions.md`)
2. Create **Page Definitions** with components (see `03-component-system.md`)
3. Define **Event Functions** for interactions (see `07-event-system.md`)
4. Use **UIEngine Functions** for actions (see `08-functions-and-actions.md`)
5. Configure **Styles** for responsive design (see `05-style-system.md`)
6. Set up **Data Binding** for dynamic content (see `11-data-binding.md`)

### For Custom Objects

When generating other object types:

1. **Schemas**: Use `16-schema-definitions.md` for data validation schemas
2. **Themes**: Use `17-theme-definitions.md` for design tokens
3. **Styles**: Use `18-style-definitions.md` for global CSS
4. **Functions**: Use `19-function-definitions.md` for reusable KIRun functions
5. **URIPath**: Use `20-filler-and-uripath.md` for custom API endpoints

## Key Concepts

- **Definitions Drive Everything**: Applications are defined as JSON structures
- **Component-Based**: Everything is a component with properties and styles
- **Reactive Store**: Data flows through a reactive store system
- **Event-Driven**: User interactions trigger event functions
- **Responsive by Default**: Styles support multiple breakpoints
- **Expression-Based**: Properties can use expressions for dynamic values
- **Function Composition**: KIRun functions can call other functions

## Document Dependencies

```
01-architecture-overview.md
    ├── 02-application-and-page-definitions.md
    │   ├── 03-component-system.md
    │   │   ├── 04-property-system.md
    │   │   ├── 05-style-system.md
    │   │   └── 10-component-reference.md
    │   ├── 06-state-management.md
    │   ├── 07-event-system.md
    │   │   ├── 08-functions-and-actions.md (UIEngine)
    │   │   └── 21-kirun-system-functions.md (System)
    │   ├── 11-data-binding.md
    │   ├── 12-validation-system.md
    │   └── 13-translations.md
    ├── 09-rendering-flow.md
    ├── 14-api-reference.md
    ├── 15-examples-and-patterns.md
    │
    └── Definition Types
        ├── 16-schema-definitions.md
        ├── 17-theme-definitions.md
        ├── 18-style-definitions.md
        ├── 19-function-definitions.md
        └── 20-filler-and-uripath.md
```

## Usage Tips

1. **Cross-Reference**: Documents reference each other - follow the links
2. **Check Samples**: Real examples in `samples/` show actual usage
3. **Type Definitions**: All TypeScript interfaces are documented
4. **API Examples**: Code examples show actual implementation
5. **Patterns**: Common patterns are documented in `15-examples-and-patterns.md`
6. **Functions**: Both UIEngine (08) and System (21) functions are documented

## File Locations

All code references point to files in:

- `ui-app/client/src/` - Main source code
- `ui-app/client/src/components/` - Component implementations
- `ui-app/client/src/types/` - TypeScript type definitions
- `ui-app/client/src/functions/` - UIEngine functions
- `ui-app/client/src/context/` - Store and context management
- `kirun-js/src/engine/function/system/` - KIRun System functions

## MongoDB Collections

Definitions are stored in MongoDB:

- **Database**: `ui`
- **Collections**: `application`, `page`, `style`, `theme`, `schema`, `function`, `uripath`

See `samples/` for exported examples.

## Version Information

These documents are based on the codebase as of the export date. The system uses:

- React for UI rendering
- KIRun for function execution
- MongoDB for definition storage
- REST APIs for data fetching
