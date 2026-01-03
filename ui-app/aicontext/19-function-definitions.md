# KIRun Function Definitions

## Overview

KIRun Function Definitions are reusable, visual programming constructs that define logic as a graph of steps. They are the core building blocks for business logic in the nocode UI system. Functions can be:

- Called from event functions in pages
- Used as custom API endpoints (via URIPath)
- Composed with other functions
- Called from other functions

## Storage Location

Function definitions are stored in:
- **MongoDB Collection**: `function`
- **File Export**: `appbuilder-data/Function/`
- **Naming Convention**: `{Namespace}.{FunctionName}.json`

## Function Definition Structure

### Top-Level Document Structure

```typescript
interface FunctionDocument {
  id: string;              // MongoDB ID
  createdAt: number;       // Unix timestamp
  createdBy: string;       // User ID
  updatedAt: number;       // Unix timestamp
  updatedBy: string;       // User ID
  name: string;            // Full name: "{Namespace}.{Name}"
  message?: string;        // Optional message
  clientCode: string;      // Client code (e.g., "SYSTEM")
  appCode: string;         // Application code
  version: number;         // Version number
  definition: FunctionDefinition;  // The function definition
}
```

### Function Definition

```typescript
interface FunctionDefinition {
  name: string;            // Function name
  namespace: string;       // Namespace (e.g., "TestUI")
  version?: number;        // Version (default: 1)
  
  // Input parameters
  parameters?: {
    [parameterName: string]: Parameter;
  };
  
  // Output events
  events?: {
    [eventName: string]: Event;
  };
  
  // Execution steps
  steps: {
    [statementName: string]: Statement;
  };
  
  // Optional step groups
  stepGroups?: {
    [groupName: string]: StatementGroup;
  };
  
  // Sub-function parts
  parts?: FunctionDefinition[];
}
```

### Parameter Definition

```typescript
interface Parameter {
  parameterName: string;   // Parameter name
  schema: SchemaDefinition; // Type schema
  variableArgument?: boolean; // Is variadic?
}
```

### Event Definition

```typescript
interface Event {
  name: string;            // Event name (e.g., "output")
  parameters: {
    [paramName: string]: SchemaDefinition; // Event output parameters
  };
}
```

### Statement (Step) Definition

```typescript
interface Statement {
  statementName: string;   // Unique step identifier
  name: string;            // Function name to call
  namespace: string;       // Function namespace
  comment?: string;        // Developer comment
  description?: string;    // Description
  
  // Visual position in editor
  position?: {
    left: number;
    top: number;
  };
  
  // Parameter values
  parameterMap: {
    [paramName: string]: {
      [key: string]: ParameterReference;
    };
  };
  
  // Step dependencies (execution order)
  dependentStatements?: {
    [stepPath: string]: boolean; // true = execute after, false = don't wait
  };
  
  // Conditional execution
  executeIftrue?: {
    [stepPath: string]: boolean;
  };
}
```

### Parameter Reference

```typescript
interface ParameterReference {
  key: string;             // Unique key
  type: "VALUE" | "EXPRESSION"; // Value type
  value?: any;             // Static value (when type is VALUE)
  expression?: string;     // Expression (when type is EXPRESSION)
  order?: number;          // Execution order
}
```

## Real Examples

### Simple Function with Conditional Logic

From `TestUI.testNumber.json`:

```json
{
  "name": "TestUI.testNumber",
  "clientCode": "SYSTEM",
  "appCode": "appbuilder",
  "version": 11,
  "definition": {
    "name": "testNumber",
    "namespace": "TestUI",
    "parameters": {
      "a": {
        "parameterName": "a",
        "schema": {
          "version": 1,
          "type": ["INTEGER"]
        }
      }
    },
    "events": {
      "output": {
        "name": "output",
        "parameters": {
          "returnValue": {
            "schema": {
              "type": ["INTEGER"],
              "version": 1
            }
          }
        }
      }
    },
    "steps": {
      "if": {
        "statementName": "if",
        "name": "If",
        "namespace": "System",
        "position": { "left": 148, "top": 135 },
        "parameterMap": {
          "condition": {
            "condKey": {
              "key": "condKey",
              "type": "EXPRESSION",
              "expression": "(Arguments.a % 2) = 1",
              "order": 1
            }
          }
        }
      },
      "generateEvent": {
        "statementName": "generateEvent",
        "name": "GenerateEvent",
        "namespace": "System",
        "position": { "left": 507, "top": 55.5 },
        "parameterMap": {
          "eventName": {
            "evKey": {
              "key": "evKey",
              "type": "VALUE",
              "value": "output"
            }
          },
          "results": {
            "resKey": {
              "key": "resKey",
              "type": "VALUE",
              "order": 1,
              "value": {
                "name": "returnValue",
                "value": {
                  "isExpression": true,
                  "value": "Arguments.a + 1"
                }
              }
            }
          }
        },
        "dependentStatements": {
          "Steps.if.true": true
        }
      },
      "generateEvent1": {
        "statementName": "generateEvent1",
        "name": "GenerateEvent",
        "namespace": "System",
        "position": { "left": 585, "top": 345.5 },
        "parameterMap": {
          "eventName": {
            "evKey": {
              "key": "evKey",
              "type": "VALUE",
              "value": "output"
            }
          },
          "results": {
            "resKey": {
              "key": "resKey",
              "type": "VALUE",
              "order": 1,
              "value": {
                "name": "returnValue",
                "value": {
                  "isExpression": true,
                  "value": "Arguments.a + 2"
                }
              }
            }
          }
        },
        "dependentStatements": {
          "Steps.if.false": true
        }
      }
    }
  }
}
```

### Loop Example (Fibonacci)

From `TestUI.fibonaccii.json`:

```json
{
  "definition": {
    "name": "fibonaccii",
    "namespace": "TestUI",
    "parameters": {
      "n": {
        "parameterName": "n",
        "schema": {
          "type": ["INTEGER"],
          "version": 1
        }
      }
    },
    "events": {
      "output": {
        "name": "output",
        "parameters": {
          "result": {
            "type": ["ARRAY"],
            "version": 1,
            "items": {
              "type": ["INTEGER"]
            }
          }
        }
      }
    },
    "steps": {
      "create": {
        "statementName": "create",
        "name": "Create",
        "namespace": "System.Context",
        "parameterMap": {
          "name": {
            "key1": {
              "type": "VALUE",
              "value": "a"
            }
          },
          "schema": {
            "key2": {
              "type": "VALUE",
              "value": {
                "type": "ARRAY",
                "items": { "type": "INTEGER" }
              }
            }
          }
        }
      },
      "rangeLoop": {
        "statementName": "rangeLoop",
        "name": "RangeLoop",
        "namespace": "System.Loop",
        "parameterMap": {
          "to": {
            "key1": {
              "type": "EXPRESSION",
              "expression": "Arguments.n"
            }
          }
        },
        "dependentStatements": {
          "Steps.create.output": false,
          "Steps.set2.output": true
        }
      }
    }
  }
}
```

## Expression Context

Within function steps, expressions have access to:

| Prefix | Description | Example |
|--------|-------------|---------|
| `Arguments.` | Function input parameters | `Arguments.n` |
| `Steps.` | Previous step outputs | `Steps.if.true` |
| `Context.` | Function-local variables | `Context.a` |

## Step Dependencies

Dependencies control execution order:

```json
"dependentStatements": {
  "Steps.if.true": true,      // Execute after if.true event
  "Steps.create.output": false // Connected but don't wait
}
```

Dependency paths:
- `Steps.{stepName}.output` - After step completes
- `Steps.{stepName}.true` - After if condition is true
- `Steps.{stepName}.false` - After if condition is false
- `Steps.{stepName}.iteration.index` - Loop iteration index

## Built-in Functions by Namespace

### System

| Function | Description |
|----------|-------------|
| `If` | Conditional branching |
| `GenerateEvent` | Emit output event |
| `Print` | Debug print |
| `Wait` | Delay execution |
| `ValidateSchema` | Validate against schema |

### System.Loop

| Function | Description |
|----------|-------------|
| `RangeLoop` | Loop from 0 to n |
| `CountLoop` | Count-based loop |
| `ForEachLoop` | Iterate array |
| `Break` | Exit loop |

### System.Context

| Function | Description |
|----------|-------------|
| `Create` | Create variable |
| `Set` | Set variable value |
| `Get` | Get variable value |

### System.Array

| Function | Description |
|----------|-------------|
| `InsertLast` | Append element |
| `AddFirst` | Prepend element |
| `Delete` | Remove element |
| `Sort` | Sort array |
| `IndexOf` | Find index |

See [21-kirun-system-functions.md](21-kirun-system-functions.md) for complete list.

## Function vs Event Functions

| Aspect | KIRun Function | Event Function |
|--------|----------------|----------------|
| Location | `appbuilder-data/Function/` | Page `eventFunctions` |
| Reusability | Cross-page/app | Page-scoped |
| Parameters | Typed schemas | Runtime context |
| Calling | From other functions/URIPath | From component events |
| Namespace | Custom (e.g., `TestUI`) | Page-specific |

## Calling Functions

### From Event Functions

```json
{
  "steps": {
    "callCustom": {
      "statementName": "callCustom",
      "name": "testNumber",
      "namespace": "TestUI",
      "parameterMap": {
        "a": {
          "key1": {
            "type": "VALUE",
            "value": 42
          }
        }
      }
    }
  }
}
```

### From URIPath

```json
{
  "pathString": "/api/custom/{id}",
  "pathDefinitions": {
    "GET": {
      "uriType": "KIRUN_FUNCTION",
      "kiRunFxDefinition": {
        "name": "getData",
        "namespace": "MyApp",
        "pathParamMapping": {
          "id": "itemId"
        }
      }
    }
  }
}
```

## Best Practices

1. **Clear Naming**: Use descriptive names for functions and steps
2. **Namespace Organization**: Group related functions in namespaces
3. **Type Safety**: Define parameter schemas properly
4. **Error Handling**: Use try-catch patterns with events
5. **Reusability**: Create generic, parameterized functions
6. **Documentation**: Add comments to complex steps
7. **Position**: Organize visual layout for readability

## Related Documents

- [07-event-system.md](07-event-system.md) - Event functions in pages
- [08-functions-and-actions.md](08-functions-and-actions.md) - UIEngine functions
- [21-kirun-system-functions.md](21-kirun-system-functions.md) - System functions
- [16-schema-definitions.md](16-schema-definitions.md) - Parameter schemas
- [20-filler-and-uripath.md](20-filler-and-uripath.md) - URIPath integration

