# Examples and Patterns

## Overview

This document provides real-world examples and common patterns for building applications with the nocode UI system.

## Common Patterns

### Pattern 1: Simple Page with Text and Button

```json
{
  "name": "home",
  "rootComponent": "grid-1",
  "componentDefinition": {
    "grid-1": {
      "key": "grid-1",
      "type": "Grid",
      "styleProperties": {
        "style-1": {
          "resolutions": {
            "ALL": {
              "display": { "type": "VALUE", "value": "flex" },
              "flexDirection": { "type": "VALUE", "value": "column" },
              "alignItems": { "type": "VALUE", "value": "center" },
              "paddingLeft": { "type": "VALUE", "value": "20px" },
              "paddingRight": { "type": "VALUE", "value": "20px" },
              "paddingTop": { "type": "VALUE", "value": "20px" },
              "paddingBottom": { "type": "VALUE", "value": "20px" }
            }
          }
        }
      },
      "children": {
        "text-1": true,
        "button-1": true
      }
    },
    "text-1": {
      "key": "text-1",
      "type": "Text",
      "properties": {
        "text": { "type": "VALUE", "value": "Welcome to our app" }
      },
      "styleProperties": {
        "style-1": {
          "resolutions": {
            "ALL": {
              "fontSize": { "type": "VALUE", "value": "24px" },
              "marginBottom": { "type": "VALUE", "value": "20px" }
            }
          }
        }
      }
    },
    "button-1": {
      "key": "button-1",
      "type": "Button",
      "properties": {
        "label": { "type": "VALUE", "value": "Get Started" },
        "onClick": { "type": "VALUE", "value": "navigateToDashboard" }
      }
    }
  },
  "eventFunctions": {
    "navigateToDashboard": {
      "name": "navigateToDashboard",
      "steps": {
        "navigate": {
          "name": "Navigate",
          "namespace": "UIEngine",
          "parameterMap": {
            "linkPath": {
              "param1": {
                "type": "VALUE",
                "value": "/page/dashboard",
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

### Pattern 2: Form with Validation

```json
{
  "name": "login",
  "rootComponent": "form-1",
  "componentDefinition": {
    "form-1": {
      "key": "form-1",
      "type": "Form",
      "properties": {
        "onSubmit": { "type": "VALUE", "value": "handleLogin" }
      },
      "children": {
        "email-field": true,
        "password-field": true,
        "submit-button": true
      }
    },
    "email-field": {
      "key": "email-field",
      "type": "TextBox",
      "properties": {
        "placeholder": { "type": "VALUE", "value": "Email" }
      },
      "validations": [
        {
          "name": "required",
          "message": "Email is required"
        },
        {
          "name": "email",
          "message": "Invalid email format"
        }
      ]
    },
    "password-field": {
      "key": "password-field",
      "type": "TextBox",
      "properties": {
        "placeholder": { "type": "VALUE", "value": "Password" },
        "type": { "type": "VALUE", "value": "password" }
      },
      "validations": [
        {
          "name": "required",
          "message": "Password is required"
        },
        {
          "name": "minLength",
          "parameters": { "value": 8 },
          "message": "Password must be at least 8 characters"
        }
      ]
    },
    "submit-button": {
      "key": "submit-button",
      "type": "Button",
      "properties": {
        "label": { "type": "VALUE", "value": "Login" }
      }
    }
  },
  "eventFunctions": {
    "handleLogin": {
      "name": "handleLogin",
      "validationCheck": "form-1",
      "steps": {
        "login": {
          "name": "Login",
          "namespace": "UIEngine",
          "parameterMap": {
            "username": {
              "param1": {
                "type": "EXPRESSION",
                "expression": "Page.formData.email",
                "order": 1
              }
            },
            "password": {
              "param2": {
                "type": "EXPRESSION",
                "expression": "Page.formData.password",
                "order": 1
              }
            }
          }
        },
        "navigate": {
          "name": "Navigate",
          "namespace": "UIEngine",
          "parameterMap": {
            "linkPath": {
              "param1": {
                "type": "VALUE",
                "value": "/page/dashboard",
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

### Pattern 3: Data List with ArrayRepeater

```json
{
  "name": "products",
  "rootComponent": "grid-1",
  "componentDefinition": {
    "grid-1": {
      "key": "grid-1",
      "type": "Grid",
      "children": {
        "repeater-1": true
      }
    },
    "repeater-1": {
      "key": "repeater-1",
      "type": "ArrayRepeater",
      "bindingPath": {
        "type": "VALUE",
        "value": "Page.products"
      },
      "children": {
        "product-card": true
      }
    },
    "product-card": {
      "key": "product-card",
      "type": "Grid",
      "styleProperties": {
        "style-1": {
          "resolutions": {
            "ALL": {
              "borderWidth": { "type": "VALUE", "value": "1px" },
              "borderStyle": { "type": "VALUE", "value": "solid" },
              "borderColor": { "type": "VALUE", "value": "#ccc" },
              "paddingLeft": { "type": "VALUE", "value": "16px" },
              "paddingRight": { "type": "VALUE", "value": "16px" },
              "paddingTop": { "type": "VALUE", "value": "16px" },
              "paddingBottom": { "type": "VALUE", "value": "16px" },
              "marginLeft": { "type": "VALUE", "value": "8px" },
              "marginRight": { "type": "VALUE", "value": "8px" },
              "marginTop": { "type": "VALUE", "value": "8px" },
              "marginBottom": { "type": "VALUE", "value": "8px" }
            }
          }
        }
      },
      "children": {
        "product-name": true,
        "product-price": true,
        "buy-button": true
      }
    },
    "product-name": {
      "key": "product-name",
      "type": "Text",
      "properties": {
        "text": {
          "type": "EXPRESSION",
          "expression": "Parent.name"
        }
      }
    },
    "product-price": {
      "key": "product-price",
      "type": "Text",
      "properties": {
        "text": {
          "type": "EXPRESSION",
          "expression": "'$' + Parent.price"
        }
      }
    },
    "buy-button": {
      "key": "buy-button",
      "type": "Button",
      "properties": {
        "label": { "type": "VALUE", "value": "Buy" },
        "onClick": { "type": "VALUE", "value": "addToCart" }
      }
    }
  },
  "eventFunctions": {
    "addToCart": {
      "name": "addToCart",
      "steps": {
        "setStore": {
          "name": "SetStore",
          "namespace": "UIEngine",
          "parameterMap": {
            "path": {
              "param1": {
                "type": "VALUE",
                "value": "Page.cart",
                "order": 1
              }
            },
            "value": {
              "param2": {
                "type": "EXPRESSION",
                "expression": "[...Page.cart, Parent]",
                "order": 1
              }
            }
          }
        }
      }
    }
  },
  "properties": {
    "onLoadEvent": { "type": "VALUE", "value": "loadProducts" }
  },
  "eventFunctions": {
    "loadProducts": {
      "name": "loadProducts",
      "steps": {
        "fetchData": {
          "name": "FetchData",
          "namespace": "UIEngine",
          "parameterMap": {
            "url": {
              "param1": {
                "type": "VALUE",
                "value": "/api/products",
                "order": 1
              }
            },
            "method": {
              "param2": {
                "type": "VALUE",
                "value": "GET",
                "order": 1
              }
            },
            "storePath": {
              "param3": {
                "type": "VALUE",
                "value": "Page.products",
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

### Pattern 4: Conditional Rendering

```json
{
  "menu": {
    "key": "menu",
    "type": "Menu",
    "properties": {
      "visibility": {
        "type": "EXPRESSION",
        "expression": "Store.user.isAuthenticated"
      }
    }
  },
  "login-button": {
    "key": "login-button",
    "type": "Button",
    "properties": {
      "visibility": {
        "type": "EXPRESSION",
        "expression": "!Store.user.isAuthenticated"
      },
      "label": { "type": "VALUE", "value": "Login" },
      "onClick": { "type": "VALUE", "value": "navigateToLogin" }
    }
  }
}
```

### Pattern 5: Responsive Layout

```json
{
  "grid-1": {
    "key": "grid-1",
    "type": "Grid",
    "styleProperties": {
      "style-1": {
        "resolutions": {
          "ALL": {
            "display": { "type": "VALUE", "value": "flex" },
            "flexDirection": { "type": "VALUE", "value": "column" }
          },
          "DESKTOP_SCREEN": {
            "flexDirection": { "type": "VALUE", "value": "row" },
            "gap": { "type": "VALUE", "value": "20px" }
          }
        }
      }
    },
    "children": {
      "sidebar": true,
      "content": true
    }
  },
  "sidebar": {
    "key": "sidebar",
    "type": "Grid",
    "styleProperties": {
      "style-1": {
        "resolutions": {
          "ALL": {
            "width": { "type": "VALUE", "value": "100%" }
          },
          "DESKTOP_SCREEN": {
            "width": { "type": "VALUE", "value": "250px" },
            "flexShrink": { "type": "VALUE", "value": "0" }
          }
        }
      }
    }
  }
}
```

## Best Practices

### 1. Use Page Data for Form State

```json
{
  "value": {
    "type": "EXPRESSION",
    "expression": "Page.formData.fieldName"
  }
}
```

### 2. Use Store for Global State

```json
{
  "value": {
    "type": "EXPRESSION",
    "expression": "Store.user.name"
  }
}
```

### 3. Use Expressions for Computed Values

```json
{
  "text": {
    "type": "EXPRESSION",
    "expression": "Store.items.length > 0 ? 'Items: ' + Store.items.length : 'No items'"
  }
}
```

### 4. Organize Components Hierarchically

- Use Grid for layout
- Group related components
- Use meaningful component keys

### 5. Use Event Functions for Actions

- Keep event functions focused
- Chain multiple steps for complex flows
- Use validation checks before actions

## Real Examples from Samples

See `samples/` directory for real application and page definitions from the live system.

## Related Documents

- [02-application-and-page-definitions.md](02-application-and-page-definitions.md) - Definition structures
- [03-component-system.md](03-component-system.md) - Component system
- [07-event-system.md](07-event-system.md) - Event system
- [08-functions-and-actions.md](08-functions-and-actions.md) - Available functions
