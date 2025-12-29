# CRITICAL RULES FOR AI AGENTS

## ⚠️ READ THIS FIRST - These are non-negotiable requirements

### 1. Page Structure - FLAT componentDefinition

The page uses a **FLAT** `componentDefinition` map, NOT nested children.

**WRONG ❌ (nested structure):**
```json
{
  "rootComponent": {
    "key": "root",
    "type": "Grid",
    "children": {
      "child1": {
        "key": "child1",
        "type": "Button"
      }
    }
  }
}
```

**CORRECT ✅ (flat structure):**
```json
{
  "rootComponent": "root",
  "componentDefinition": {
    "root": {
      "key": "root",
      "type": "Grid",
      "children": {
        "child1": true
      }
    },
    "child1": {
      "key": "child1",
      "type": "Button"
    }
  }
}
```

**Key rules:**
- `rootComponent` is a **STRING** key, not an object
- `componentDefinition` is a **FLAT MAP** of all components
- `children` contains `{ "childKey": true }` references, NOT nested objects
- Every component MUST be in `componentDefinition` with its `key` matching the map key

### 2. Event Functions - NO ARGUMENTS

Event functions **CANNOT** receive arguments from the caller.

**WRONG ❌:**
```json
{
  "properties": {
    "onClick": {
      "value": {
        "functionName": "onNumberClick",
        "arguments": { "number": "5" }
      }
    }
  }
}
```

**CORRECT ✅ - Use separate event functions:**
```json
{
  "properties": {
    "onClick": { "value": "onNumber5Click" }
  }
}
```

Or use **component data with store:**
1. Store the value in a component property
2. Event reads from store to get the value

### 3. Event onClick Value - Simple String

The `onClick` property is a **simple string** - the event function key.

**WRONG ❌:**
```json
{
  "properties": {
    "onClick": "myEvent"
  }
}
```

**CORRECT ✅:**
```json
{
  "properties": {
    "onClick": { "value": "myEvent" }
  }
}
```

### 4. SetStore - Always Use for State

To store values, use `SetStore` function from `UIEngine` namespace.

```json
{
  "steps": {
    "updateValue": {
      "statementName": "updateValue",
      "name": "SetStore",
      "namespace": "UIEngine",
      "parameterMap": {
        "path": {
          "one": {
            "key": "one",
            "type": "VALUE",
            "value": "Page.myValue",
            "order": 1
          }
        },
        "value": {
          "one": {
            "key": "one",
            "type": "VALUE",
            "value": "newValue",
            "order": 1
          }
        }
      }
    }
  }
}
```

### 5. Store Initialization

Initialize store values in `properties.storeInitialization`:

```json
{
  "properties": {
    "storeInitialization": {
      "Page.counter": 0,
      "Page.name": "",
      "Page.items": []
    }
  }
}
```

### 6. Calculator Example - The Right Way

For a calculator with 10 number buttons, create 10 separate event functions:

```json
{
  "componentDefinition": {
    "btn1": {
      "key": "btn1",
      "type": "Button",
      "properties": {
        "label": { "value": "1" },
        "onClick": { "value": "appendDigit1" }
      }
    },
    "btn2": {
      "key": "btn2",
      "type": "Button",
      "properties": {
        "label": { "value": "2" },
        "onClick": { "value": "appendDigit2" }
      }
    }
  },
  "eventFunctions": {
    "appendDigit1": {
      "name": "appendDigit1",
      "steps": {
        "append": {
          "statementName": "append",
          "name": "SetStore",
          "namespace": "UIEngine",
          "parameterMap": {
            "path": {
              "one": { "key": "one", "type": "VALUE", "value": "Page.display", "order": 1 }
            },
            "value": {
              "one": { 
                "key": "one", 
                "type": "EXPRESSION", 
                "expression": "Page.display + '1'", 
                "order": 1 
              }
            }
          }
        }
      }
    },
    "appendDigit2": {
      "name": "appendDigit2",
      "steps": {
        "append": {
          "statementName": "append",
          "name": "SetStore",
          "namespace": "UIEngine",
          "parameterMap": {
            "path": {
              "one": { "key": "one", "type": "VALUE", "value": "Page.display", "order": 1 }
            },
            "value": {
              "one": { 
                "key": "one", 
                "type": "EXPRESSION", 
                "expression": "Page.display + '2'", 
                "order": 1 
              }
            }
          }
        }
      }
    }
  }
}
```

### 7. Component Type Names

Use exact component type names:
- `Grid` (not GridLayout)
- `Button` (not Btn)
- `Text` (not Label, not Paragraph)
- `TextBox` (not Input, not TextField)
- `Icon` (not Image for icons)
- `Image` (for actual images)

### 8. Style Properties Structure

Styles go in `styleProperties` with unique IDs:

```json
{
  "styleProperties": {
    "uniqueStyleId123": {
      "resolutions": {
        "ALL": {
          "backgroundColor": { "value": "#4F46E5" },
          "padding": { "value": "12px" },
          "backgroundColor:hover": { "value": "#4338CA" }
        }
      }
    }
  }
}
```

### 9. When Modifying Existing Pages

- Keep ALL existing components that aren't being changed
- Don't regenerate the entire page
- Only modify/add components specified in the request
- Preserve all existing event functions unless explicitly changing them

