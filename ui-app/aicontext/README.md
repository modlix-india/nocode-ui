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

### Functionality

9. **[07-event-system.md](07-event-system.md)** - Event functions and execution
10. **[08-functions-and-actions.md](08-functions-and-actions.md)** - Built-in functions reference
11. **[12-validation-system.md](12-validation-system.md)** - Validation structure and rules
12. **[13-translations.md](13-translations.md)** - Translation and multi-language support

### Implementation

13. **[09-rendering-flow.md](09-rendering-flow.md)** - Detailed rendering process and hierarchy
14. **[14-api-reference.md](14-api-reference.md)** - API endpoints and request/response formats

### Examples

15. **[15-examples-and-patterns.md](15-examples-and-patterns.md)** - Real-world examples and best practices

## Sample Data

The `samples/` directory contains real examples exported from MongoDB:

- **application/**: Sample application definitions
- **page/**: Sample page definitions
- **style/**: Sample style definitions
- **theme/**: Sample theme definitions

These samples demonstrate real-world usage patterns and can be referenced when generating new applications.

## Quick Start Guide

### For LLM RAG Systems

1. **Start with Architecture**: Read `01-architecture-overview.md` to understand the system
2. **Understand Definitions**: Review `02-application-and-page-definitions.md` for data structures
3. **Learn Components**: Check `03-component-system.md` and `10-component-reference.md` for available components
4. **Study Examples**: Look at `15-examples-and-patterns.md` and `samples/` for real examples

### For Application Generation

When generating an application:

1. Create **Application Definition** (see `02-application-and-page-definitions.md`)
2. Create **Page Definitions** with components (see `03-component-system.md`)
3. Define **Event Functions** for interactions (see `07-event-system.md`)
4. Configure **Styles** for responsive design (see `05-style-system.md`)
5. Set up **Data Binding** for dynamic content (see `11-data-binding.md`)

## Key Concepts

- **Definitions Drive Everything**: Applications are defined as JSON structures
- **Component-Based**: Everything is a component with properties and styles
- **Reactive Store**: Data flows through a reactive store system
- **Event-Driven**: User interactions trigger event functions
- **Responsive by Default**: Styles support multiple breakpoints
- **Expression-Based**: Properties can use expressions for dynamic values

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
    │   │   └── 08-functions-and-actions.md
    │   ├── 11-data-binding.md
    │   ├── 12-validation-system.md
    │   └── 13-translations.md
    ├── 09-rendering-flow.md
    ├── 14-api-reference.md
    └── 15-examples-and-patterns.md
```

## Usage Tips

1. **Cross-Reference**: Documents reference each other - follow the links
2. **Check Samples**: Real examples in `samples/` show actual usage
3. **Type Definitions**: All TypeScript interfaces are documented
4. **API Examples**: Code examples show actual implementation
5. **Patterns**: Common patterns are documented in `15-examples-and-patterns.md`

## File Locations

All code references point to files in:

- `ui-app/client/src/` - Main source code
- `ui-app/client/src/components/` - Component implementations
- `ui-app/client/src/types/` - TypeScript type definitions
- `ui-app/client/src/functions/` - Built-in functions
- `ui-app/client/src/context/` - Store and context management

## MongoDB Collections

Definitions are stored in MongoDB:

- **Database**: `ui`
- **Collections**: `application`, `page`, `style`, `theme`

See `samples/` for exported examples.

## Version Information

These documents are based on the codebase as of the export date. The system uses:

- React for UI rendering
- KIRun for function execution
- MongoDB for definition storage
- REST APIs for data fetching
