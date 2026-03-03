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

### 2. Property Values - MUST Use DataLocation Format

Every property value MUST be a DataLocation object with `type` field. NEVER use bare strings or `{value: "..."}` without `type`.

**WRONG ❌ (bare string):**
```json
{
  "properties": {
    "text": "Hello World",
    "textContainer": "SPAN"
  }
}
```

**WRONG ❌ (missing type field):**
```json
{
  "properties": {
    "text": { "value": "Hello World" }
  }
}
```

**CORRECT ✅ (DataLocation with type):**
```json
{
  "properties": {
    "text": { "type": "VALUE", "value": "Hello World" },
    "textContainer": { "type": "VALUE", "value": "SPAN" }
  }
}
```

**CORRECT ✅ (dynamic expression):**
```json
{
  "properties": {
    "text": { "type": "EXPRESSION", "expression": "Store.user.name" }
  }
}
```

**Key rules:**
- `type` is REQUIRED — must be `"VALUE"` or `"EXPRESSION"`
- For static values: `{"type": "VALUE", "value": "the value"}`
- For dynamic/computed values: `{"type": "EXPRESSION", "expression": "Store.path"}`
- This applies to ALL properties: text, label, onClick, visibility, placeholder, etc.

### 3. Event Functions - NO ARGUMENTS

Event functions **CANNOT** receive arguments from the caller.

**WRONG ❌:**
```json
{
  "properties": {
    "onClick": {
      "type": "VALUE",
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
    "onClick": { "type": "VALUE", "value": "onNumber5Click" }
  }
}
```

Or use **component data with store:**
1. Store the value in a component property
2. Event reads from store to get the value

### 4. Event onClick Value - Simple String

The `onClick` property value is the event function key as a string.

**WRONG ❌ (bare string):**
```json
{
  "properties": {
    "onClick": "myEvent"
  }
}
```

**CORRECT ✅ (DataLocation):**
```json
{
  "properties": {
    "onClick": { "type": "VALUE", "value": "myEvent" }
  }
}
```

### 5. SetStore - Always Use for State

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

### 6. Store Initialization

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

### 7. Calculator Example - The Right Way

For a calculator with 10 number buttons, create 10 separate event functions:

```json
{
  "componentDefinition": {
    "btn1": {
      "key": "btn1",
      "type": "Button",
      "properties": {
        "label": { "type": "VALUE", "value": "1" },
        "onClick": { "type": "VALUE", "value": "appendDigit1" }
      }
    },
    "btn2": {
      "key": "btn2",
      "type": "Button",
      "properties": {
        "label": { "type": "VALUE", "value": "2" },
        "onClick": { "type": "VALUE", "value": "appendDigit2" }
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

### 8. Component Type Names - ONLY USE THESE

**VALID COMPONENT TYPES (USE ONLY THESE):**
- `Grid` - Container/layout (for ANY container, section, card, box, div, wrapper, header, footer, nav)
- `Text` - Text display (for ANY text, label, heading, paragraph, span, h1-h6)
- `Button` - Clickable button
- `TextBox` - Text input (for ANY input, textfield, textarea)
- `Checkbox` - Boolean input
- `Dropdown` - Selection dropdown
- `RadioButton` - Single selection
- `Image` - Image display
- `Icon` - Icon display (Font Awesome, Material icons)
- `Link` - Navigation link

**INVALID TYPES - NEVER USE THESE:**
- ❌ `Box` → Use `Grid`
- ❌ `Container` → Use `Grid`
- ❌ `Div` → Use `Grid`
- ❌ `Section` → Use `Grid`
- ❌ `Card` → Use `Grid`
- ❌ `Flex` → Use `Grid`
- ❌ `Row` → Use `Grid`
- ❌ `Column` → Use `Grid`
- ❌ `Wrapper` → Use `Grid`
- ❌ `Header` → Use `Grid`
- ❌ `Footer` → Use `Grid`
- ❌ `Nav` → Use `Grid`
- ❌ `Span` → Use `Text`
- ❌ `Paragraph` → Use `Text`
- ❌ `Label` → Use `Text`
- ❌ `Heading` → Use `Text`
- ❌ `H1`/`H2`/`H3`/`H4`/`H5`/`H6` → Use `Text`
- ❌ `Input` → Use `TextBox`
- ❌ `TextField` → Use `TextBox`
- ❌ `Anchor` → Use `Link` or `Button`

### 9. Style Properties Structure

Styles go in `styleProperties` with unique style keys. Each CSS value MUST be a DataLocation with `type` field.

**Style property key format**: `<subComponent>-<cssProp>:<pseudoState>`
- `cssProp` is **mandatory** (e.g. `backgroundColor`)
- `subComponent` is optional (e.g. `comp-label-fontSize` targets the label sub-component)
- `pseudoState` is optional (e.g. `backgroundColor:hover`)
- Full example: `comp-icon-color:hover` (icon sub-component, color prop, hover state)

**CSS property names MUST be camelCase**, NEVER shorthand or kebab-case:
- ✅ `paddingLeft`, `paddingRight`, `paddingTop`, `paddingBottom`
- ✅ `marginLeft`, `marginRight`, `marginTop`, `marginBottom`
- ✅ `borderTopLeftRadius`, `borderBottomRightRadius`
- ❌ `padding` (shorthand — use individual sides)
- ❌ `margin` (shorthand — use individual sides)
- ❌ `padding-left` (kebab-case — use `paddingLeft`)
- ❌ `border-radius` (kebab-case — use `borderRadius`)

**WRONG ❌ (shorthand + missing type):**
```json
{
  "styleProperties": {
    "s1": {
      "resolutions": {
        "ALL": {
          "padding": { "value": "12px" }
        }
      }
    }
  }
}
```

**CORRECT ✅:**
```json
{
  "styleProperties": {
    "uniqueStyleId123": {
      "resolutions": {
        "ALL": {
          "backgroundColor": { "type": "VALUE", "value": "#4F46E5" },
          "paddingLeft": { "type": "VALUE", "value": "12px" },
          "paddingRight": { "type": "VALUE", "value": "12px" },
          "paddingTop": { "type": "VALUE", "value": "8px" },
          "paddingBottom": { "type": "VALUE", "value": "8px" }
        }
      }
    }
  }
}
```

**CORRECT ✅ (dynamic expression):**
```json
{
  "styleProperties": {
    "s1": {
      "resolutions": {
        "ALL": {
          "width": { "type": "EXPRESSION", "expression": "{{Page.sliderValue}}+'px'" }
        }
      }
    }
  }
}
```

**CORRECT ✅ (sub-component + pseudo-state in key):**
```json
{
  "styleProperties": {
    "s1": {
      "resolutions": {
        "ALL": {
          "backgroundColor": { "type": "VALUE", "value": "#4F46E5" },
          "backgroundColor:hover": { "type": "VALUE", "value": "#4338CA" },
          "comp-label-fontSize": { "type": "VALUE", "value": "14px" },
          "comp-icon-color:hover": { "type": "VALUE", "value": "#ffffff" }
        }
      }
    }
  }
}
```

### 10. When Modifying Existing Pages

- Keep ALL existing components that aren't being changed
- Don't regenerate the entire page
- Only modify/add components specified in the request
- Preserve all existing event functions unless explicitly changing them

