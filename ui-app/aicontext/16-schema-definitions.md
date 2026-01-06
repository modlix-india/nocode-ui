# Schema Definitions

## Overview

Schema definitions are JSON structures used to define data types and validation rules in the nocode UI system. They are stored in MongoDB and are based on JSON Schema with KIRun extensions. Schemas are used for:

- Validating component data binding
- Defining function parameters and return types
- Creating custom data structures for the application
- Enforcing data constraints in forms and inputs

## Storage Location

Schema definitions are stored in:
- **MongoDB Collection**: `schema`
- **File Export**: `appbuilder-data/Schema/`
- **Naming Convention**: `{Namespace}.{SchemaName}.json`

## Schema Definition Structure

### Top-Level Structure

```typescript
interface SchemaDocument {
  id: string;              // MongoDB ID
  createdAt: number;       // Unix timestamp
  createdBy: string;       // User ID
  updatedAt: number;       // Unix timestamp
  updatedBy: string;       // User ID
  name: string;            // Full schema name: "{Namespace}.{Name}"
  message?: string;        // Optional message (e.g., transport info)
  clientCode: string;      // Client code (e.g., "SYSTEM")
  appCode: string;         // Application code
  version: number;         // Version number
  definition: SchemaDefinition;  // The actual schema definition
}
```

### Schema Definition

```typescript
interface SchemaDefinition {
  // Identity
  namespace: string;       // Schema namespace (e.g., "TestUI")
  name: string;            // Schema name (e.g., "UserRecord")
  version?: number;        // Schema version (default: 1)

  // Type Definition
  type: SchemaType | SchemaType[];  // Data type(s)
  ref?: string;            // Reference to another schema

  // Composition
  anyOf?: SchemaDefinition[];    // Match any of these schemas
  allOf?: SchemaDefinition[];    // Match all of these schemas
  oneOf?: SchemaDefinition[];    // Match exactly one of these schemas
  not?: SchemaDefinition;        // Must not match this schema

  // Metadata
  title?: string;          // Human-readable title
  description?: string;    // Description
  examples?: any[];        // Example values
  defaultValue?: any;      // Default value
  comment?: string;        // Developer comment

  // String Constraints
  pattern?: string;        // Regex pattern
  format?: StringFormat;   // Format (DATETIME, TIME, DATE, EMAIL, REGEX)
  minLength?: number;      // Minimum length
  maxLength?: number;      // Maximum length
  enums?: any[];           // Allowed values

  // Number Constraints
  multipleOf?: number;     // Must be multiple of
  minimum?: number;        // Minimum value
  maximum?: number;        // Maximum value
  exclusiveMinimum?: number;  // Exclusive minimum
  exclusiveMaximum?: number;  // Exclusive maximum

  // Object Constraints
  properties?: { [key: string]: SchemaDefinition };  // Object properties
  additionalProperties?: boolean | SchemaDefinition; // Allow extra properties
  required?: string[];     // Required property names
  propertyNames?: SchemaDefinition;  // Property name validation
  minProperties?: number;  // Minimum properties
  maxProperties?: number;  // Maximum properties
  patternProperties?: { [pattern: string]: SchemaDefinition };  // Pattern-based properties

  // Array Constraints
  items?: SchemaDefinition | SchemaDefinition[];  // Array item schema(s)
  additionalItems?: boolean | SchemaDefinition;   // Additional items schema
  contains?: SchemaDefinition;     // Must contain matching item
  minContains?: number;    // Minimum matches for contains
  maxContains?: number;    // Maximum matches for contains
  minItems?: number;       // Minimum array length
  maxItems?: number;       // Maximum array length
  uniqueItems?: boolean;   // All items must be unique

  // Other
  constant?: any;          // Must equal this value
  $defs?: { [key: string]: SchemaDefinition };  // Schema definitions for references
  permission?: string;     // Permission required to access
}
```

### Schema Types

Available schema types:

```typescript
type SchemaType = 
  | "INTEGER"   // Integer numbers
  | "LONG"      // Long integers
  | "FLOAT"     // Floating point numbers
  | "DOUBLE"    // Double precision numbers
  | "STRING"    // Text strings
  | "OBJECT"    // Objects/Maps
  | "ARRAY"     // Arrays/Lists
  | "BOOLEAN"   // True/False
  | "NULL";     // Null value
```

### String Formats

```typescript
type StringFormat = 
  | "DATETIME"  // Date and time (ISO 8601)
  | "TIME"      // Time only
  | "DATE"      // Date only
  | "EMAIL"     // Email address
  | "REGEX";    // Regular expression pattern
```

## Real Example

From `appbuilder-data/Schema/TestUI.UserRecord.json`:

```json
{
  "id": "649e92ede51dd9346df52191",
  "createdAt": 1688113901,
  "createdBy": "1",
  "updatedAt": 1759226440,
  "updatedBy": "142",
  "name": "TestUI.UserRecord",
  "clientCode": "SYSTEM",
  "appCode": "appbuilder",
  "version": 12,
  "definition": {
    "name": "UserRecord",
    "namespace": "TestUI",
    "type": ["OBJECT"],
    "properties": {
      "name": {
        "type": "STRING"
      },
      "phone": {
        "type": "STRING"
      }
    }
  }
}
```

## Schema Examples by Type

### Simple String Schema

```json
{
  "definition": {
    "name": "Email",
    "namespace": "App",
    "type": "STRING",
    "format": "EMAIL",
    "maxLength": 255
  }
}
```

### Number Schema with Constraints

```json
{
  "definition": {
    "name": "Age",
    "namespace": "App",
    "type": "INTEGER",
    "minimum": 0,
    "maximum": 150
  }
}
```

### Object Schema with Required Properties

```json
{
  "definition": {
    "name": "Product",
    "namespace": "Store",
    "type": ["OBJECT"],
    "properties": {
      "id": {
        "type": "STRING"
      },
      "name": {
        "type": "STRING",
        "minLength": 1,
        "maxLength": 100
      },
      "price": {
        "type": "DOUBLE",
        "minimum": 0
      },
      "inStock": {
        "type": "BOOLEAN",
        "defaultValue": true
      }
    },
    "required": ["id", "name", "price"]
  }
}
```

### Array Schema

```json
{
  "definition": {
    "name": "Tags",
    "namespace": "App",
    "type": ["ARRAY"],
    "items": {
      "type": "STRING",
      "minLength": 1,
      "maxLength": 50
    },
    "minItems": 1,
    "maxItems": 10,
    "uniqueItems": true
  }
}
```

### Schema with Enum

```json
{
  "definition": {
    "name": "Status",
    "namespace": "Order",
    "type": "STRING",
    "enums": ["PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"]
  }
}
```

### Nested Object Schema

```json
{
  "definition": {
    "name": "Order",
    "namespace": "Store",
    "type": ["OBJECT"],
    "properties": {
      "orderId": {
        "type": "STRING"
      },
      "customer": {
        "type": ["OBJECT"],
        "properties": {
          "name": { "type": "STRING" },
          "email": { "type": "STRING", "format": "EMAIL" }
        },
        "required": ["name", "email"]
      },
      "items": {
        "type": ["ARRAY"],
        "items": {
          "type": ["OBJECT"],
          "properties": {
            "productId": { "type": "STRING" },
            "quantity": { "type": "INTEGER", "minimum": 1 },
            "price": { "type": "DOUBLE", "minimum": 0 }
          },
          "required": ["productId", "quantity", "price"]
        },
        "minItems": 1
      },
      "status": {
        "type": "STRING",
        "enums": ["PENDING", "PROCESSING", "SHIPPED", "DELIVERED"]
      }
    },
    "required": ["orderId", "customer", "items", "status"]
  }
}
```

### Schema Reference

Reference another schema:

```json
{
  "definition": {
    "name": "OrderList",
    "namespace": "Store",
    "type": ["ARRAY"],
    "items": {
      "ref": "Store.Order"
    }
  }
}
```

## Using Schemas in Functions

Schemas are used to define function parameters:

```json
{
  "definition": {
    "name": "createUser",
    "namespace": "App",
    "parameters": {
      "userData": {
        "parameterName": "userData",
        "schema": {
          "ref": "App.UserRecord"
        }
      }
    }
  }
}
```

## Using Schemas in Components

Schemas can be referenced in component bindings for validation:

```json
{
  "type": "TextBox",
  "properties": {
    "label": { "value": "Email" }
  },
  "bindingPath": {
    "type": "VALUE",
    "value": "Page.formData.email"
  }
}
```

## Schema Validation

The system uses schemas to validate data at runtime:

1. **Form Validation**: Input components validate against bound schema
2. **API Validation**: Request/response data validated against schema
3. **Function Validation**: Function parameters validated before execution

## Best Practices

1. **Naming Convention**: Use `{Domain}.{EntityName}` format (e.g., `Store.Product`)
2. **Reuse Schemas**: Use `ref` to reference common schemas
3. **Required Fields**: Always specify `required` array for objects
4. **Default Values**: Provide sensible defaults with `defaultValue`
5. **Descriptions**: Add `description` for documentation
6. **Constraints**: Add appropriate min/max constraints for validation

## Related Documents

- [04-property-system.md](04-property-system.md) - Property types
- [12-validation-system.md](12-validation-system.md) - Validation rules
- [19-function-definitions.md](19-function-definitions.md) - Function parameters

