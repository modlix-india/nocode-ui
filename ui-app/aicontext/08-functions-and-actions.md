# UIEngine Functions Reference

## Overview

UIEngine functions are built-in actions that can be executed in event functions. They handle navigation, data operations, store management, authentication, and UI interactions. All functions are in the `UIEngine` namespace.

## Function Repository

Functions are registered in `ui-app/client/src/functions/index.ts`:

```typescript
export class UIFunctionRepository extends HybridRepository<Function> {
  constructor() {
    super(new KIRunFunctionRepository(), new _UIFunctionRepository());
  }
}
```

This combines UIEngine functions with KIRun System functions.

---

## Navigation Functions

### Navigate

Navigate to a page or URL.

**Namespace**: `UIEngine`  
**Name**: `Navigate`

**Parameters**:

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `linkPath` | string | Yes | - | Page name or URL path to navigate to |
| `target` | string | No | `"_self"` | Window target (`_self`, `_blank`, `_parent`, `_top`) |
| `force` | boolean | No | `false` | Force full page navigation (skip SPA routing) |
| `removeThisPageFromHistory` | boolean | No | `false` | Replace current history entry instead of pushing |

**Events**: `output`

**Example**:

```json
{
  "name": "Navigate",
  "namespace": "UIEngine",
  "parameterMap": {
    "linkPath": {
      "p1": { "type": "VALUE", "value": "/dashboard", "order": 1 }
    }
  }
}
```

**Example - Navigate with target**:

```json
{
  "name": "Navigate",
  "namespace": "UIEngine",
  "parameterMap": {
    "linkPath": {
      "p1": { "type": "VALUE", "value": "https://example.com", "order": 1 }
    },
    "target": {
      "p2": { "type": "VALUE", "value": "_blank", "order": 1 }
    }
  }
}
```

---

### NavigateBack

Navigate back in browser history.

**Namespace**: `UIEngine`  
**Name**: `NavigateBack`

**Parameters**: None

**Events**: `output`

**Example**:

```json
{
  "name": "NavigateBack",
  "namespace": "UIEngine",
  "parameterMap": {}
}
```

---

### NavigateForward

Navigate forward in browser history.

**Namespace**: `UIEngine`  
**Name**: `NavigateForward`

**Parameters**: None

**Events**: `output`

**Example**:

```json
{
  "name": "NavigateForward",
  "namespace": "UIEngine",
  "parameterMap": {}
}
```

---

### Refresh

Refresh the current page.

**Namespace**: `UIEngine`  
**Name**: `Refresh`

**Parameters**: None

**Events**: `output`

**Example**:

```json
{
  "name": "Refresh",
  "namespace": "UIEngine",
  "parameterMap": {}
}
```

---

## Data Functions

### FetchData

Fetch data from an API endpoint using HTTP GET.

**Namespace**: `UIEngine`  
**Name**: `FetchData`

**Parameters**:

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `url` | string | Yes | - | API endpoint URL |
| `queryParams` | object | No | `{}` | Query parameters as key-value pairs |
| `pathParams` | object | No | `{}` | Path parameters for URL substitution |
| `headers` | object | No | Auth headers | Request headers |

**Default Headers**:
- `Authorization`: From `LocalStore.AuthToken`
- `clientCode`: From `Store.auth.loggedInClientCode`

**Events**:
- `output`: Success with `data` (response data)
- `error`: Failure with `data`, `headers`, `status`

**Example**:

```json
{
  "name": "FetchData",
  "namespace": "UIEngine",
  "parameterMap": {
    "url": {
      "p1": { "type": "VALUE", "value": "/api/users", "order": 1 }
    }
  }
}
```

**Example - With parameters**:

```json
{
  "name": "FetchData",
  "namespace": "UIEngine",
  "parameterMap": {
    "url": {
      "p1": { "type": "VALUE", "value": "/api/users/{id}", "order": 1 }
    },
    "pathParams": {
      "p2": { 
        "type": "VALUE", 
        "value": { 
          "id": { "location": { "type": "EXPRESSION", "expression": "Page.userId" } }
        }, 
        "order": 1 
      }
    },
    "queryParams": {
      "p3": {
        "type": "VALUE",
        "value": {
          "include": { "value": "orders" }
        },
        "order": 1
      }
    }
  }
}
```

**Using Result**:

```json
{
  "steps": {
    "fetch": {
      "name": "FetchData",
      "namespace": "UIEngine",
      "parameterMap": { "url": { "p1": { "type": "VALUE", "value": "/api/data" } } }
    },
    "saveData": {
      "name": "SetStore",
      "namespace": "UIEngine",
      "parameterMap": {
        "path": { "p1": { "type": "VALUE", "value": "Page.data" } },
        "value": { "p2": { "type": "EXPRESSION", "expression": "Steps.fetch.output.data" } }
      },
      "dependentStatements": { "Steps.fetch.output": true }
    }
  }
}
```

---

### SendData

Send data to an API endpoint (POST, PUT, PATCH, etc.).

**Namespace**: `UIEngine`  
**Name**: `SendData`

**Parameters**:

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `url` | string | Yes | - | API endpoint URL |
| `method` | string | Yes | - | HTTP method (POST, PUT, PATCH, DELETE) |
| `queryParams` | object | No | `{}` | Query parameters |
| `pathParams` | object | No | `{}` | Path parameters |
| `payload` | any | No | - | Request body data |
| `headers` | object | No | Auth headers | Request headers |
| `downloadAsAFile` | boolean | No | `false` | Download response as file |
| `downloadFileName` | string | No | `""` | Custom filename for download |

**Events**:
- `output`: Success with `data`
- `error`: Failure with `data`, `headers`, `status`

**Example - POST**:

```json
{
  "name": "SendData",
  "namespace": "UIEngine",
  "parameterMap": {
    "url": {
      "p1": { "type": "VALUE", "value": "/api/users", "order": 1 }
    },
    "method": {
      "p2": { "type": "VALUE", "value": "POST", "order": 1 }
    },
    "payload": {
      "p3": { 
        "type": "EXPRESSION", 
        "expression": "Page.formData", 
        "order": 1 
      }
    }
  }
}
```

**Example - File Upload**:

```json
{
  "name": "SendData",
  "namespace": "UIEngine",
  "parameterMap": {
    "url": { "p1": { "type": "VALUE", "value": "/api/upload" } },
    "method": { "p2": { "type": "VALUE", "value": "POST" } },
    "payload": { "p3": { "type": "EXPRESSION", "expression": "Page.fileData" } },
    "headers": {
      "p4": {
        "type": "VALUE",
        "value": { "content-type": { "value": "multipart/form-data" } }
      }
    }
  }
}
```

**Example - Download File**:

```json
{
  "name": "SendData",
  "namespace": "UIEngine",
  "parameterMap": {
    "url": { "p1": { "type": "VALUE", "value": "/api/export" } },
    "method": { "p2": { "type": "VALUE", "value": "POST" } },
    "payload": { "p3": { "type": "EXPRESSION", "expression": "Page.exportConfig" } },
    "downloadAsAFile": { "p4": { "type": "VALUE", "value": true } },
    "downloadFileName": { "p5": { "type": "VALUE", "value": "export.xlsx" } }
  }
}
```

---

### DeleteData

Delete data via HTTP DELETE.

**Namespace**: `UIEngine`  
**Name**: `DeleteData`

**Parameters**:

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `url` | string | Yes | - | API endpoint URL |
| `queryParams` | object | No | `{}` | Query parameters |
| `pathParams` | object | No | `{}` | Path parameters |
| `headers` | object | No | Auth headers | Request headers |

**Events**:
- `output`: Success with `data`
- `error`: Failure with `data`, `headers`, `status`

**Example**:

```json
{
  "name": "DeleteData",
  "namespace": "UIEngine",
  "parameterMap": {
    "url": {
      "p1": { "type": "VALUE", "value": "/api/users/{id}", "order": 1 }
    },
    "pathParams": {
      "p2": {
        "type": "VALUE",
        "value": { "id": { "location": { "type": "EXPRESSION", "expression": "Page.userId" } } },
        "order": 1
      }
    }
  }
}
```

---

## Store Functions

### SetStore

Set a value in the store.

**Namespace**: `UIEngine`  
**Name**: `SetStore`

**Parameters**:

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `path` | string | Yes | - | Store path (e.g., `Page.counter`, `Store.user`) |
| `value` | any | Yes | - | Value to set |
| `deleteKey` | boolean | No | `false` | Delete the key instead of setting value |

**Events**: `output`

**Example - Set value**:

```json
{
  "name": "SetStore",
  "namespace": "UIEngine",
  "parameterMap": {
    "path": {
      "p1": { "type": "VALUE", "value": "Page.counter", "order": 1 }
    },
    "value": {
      "p2": { "type": "VALUE", "value": 0, "order": 1 }
    }
  }
}
```

**Example - Increment**:

```json
{
  "name": "SetStore",
  "namespace": "UIEngine",
  "parameterMap": {
    "path": {
      "p1": { "type": "VALUE", "value": "Page.counter", "order": 1 }
    },
    "value": {
      "p2": { "type": "EXPRESSION", "expression": "Page.counter + 1", "order": 1 }
    }
  }
}
```

**Example - Delete key**:

```json
{
  "name": "SetStore",
  "namespace": "UIEngine",
  "parameterMap": {
    "path": { "p1": { "type": "VALUE", "value": "Page.temporaryData" } },
    "value": { "p2": { "type": "VALUE", "value": null } },
    "deleteKey": { "p3": { "type": "VALUE", "value": true } }
  }
}
```

---

### GetStoreData

Get a value from the store.

**Namespace**: `UIEngine`  
**Name**: `GetStoreData`

**Parameters**:

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `path` | string | Yes | - | Store path to retrieve |

**Events**: `output` with `data` (the retrieved value)

**Example**:

```json
{
  "name": "GetStoreData",
  "namespace": "UIEngine",
  "parameterMap": {
    "path": {
      "p1": { "type": "VALUE", "value": "Store.user.name", "order": 1 }
    }
  }
}
```

---

## Authentication Functions

### Login

Authenticate a user.

**Namespace**: `UIEngine`  
**Name**: `Login`

**Parameters**:

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `userName` | string | Yes | - | Username or email |
| `password` | string | No | `""` | Password |
| `userId` | any | No | `null` | User ID for alternative auth |
| `otp` | string | No | `""` | One-time password |
| `pin` | string | No | `""` | PIN code |
| `identifierType` | string | No | `""` | Type of identifier |
| `rememberMe` | boolean | No | `false` | Remember login |
| `cookie` | boolean | No | `false` | Use cookie-based auth |

**Events**:
- `output`: Success with `data` (auth response)
- `error`: Failure with `data`, `headers`, `status`

**Side Effects**:
- Sets `Store.auth` with authentication data
- Sets `LocalStore.AuthToken` with access token
- Sets `LocalStore.AuthTokenExpiry` with expiry time
- Clears page state

**Example**:

```json
{
  "name": "Login",
  "namespace": "UIEngine",
  "parameterMap": {
    "userName": {
      "p1": { "type": "EXPRESSION", "expression": "Page.email", "order": 1 }
    },
    "password": {
      "p2": { "type": "EXPRESSION", "expression": "Page.password", "order": 1 }
    },
    "rememberMe": {
      "p3": { "type": "EXPRESSION", "expression": "Page.rememberMe", "order": 1 }
    }
  }
}
```

---

### Logout

Log out the current user.

**Namespace**: `UIEngine`  
**Name**: `Logout`

**Parameters**:

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `ssoLogout` | boolean | No | `false` | Also logout from SSO provider |

**Events**:
- `output`: Success
- `error`: Failure with `data`, `headers`, `status`

**Side Effects**:
- Clears `Store.auth`
- Clears `LocalStore.AuthToken`
- Clears page definitions and data
- Calls `/api/security/revoke`

**Example**:

```json
{
  "name": "Logout",
  "namespace": "UIEngine",
  "parameterMap": {
    "ssoLogout": {
      "p1": { "type": "VALUE", "value": true, "order": 1 }
    }
  }
}
```

---

## UI Functions

### Message

Show a message notification to the user.

**Namespace**: `UIEngine`  
**Name**: `Message`

**Parameters**:

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `msg` | any | Yes | - | Message content (string or object) |
| `type` | string | No | `"ERROR"` | Message type: `ERROR`, `WARNING`, `INFO`, `SUCCESS` |
| `isGlobalScope` | boolean | No | `true` | Show globally or page-scoped |
| `pageName` | string | No | `"_global"` | Page context for message |

**Events**: `output`

**Example - Success message**:

```json
{
  "name": "Message",
  "namespace": "UIEngine",
  "parameterMap": {
    "msg": {
      "p1": { "type": "VALUE", "value": "Operation completed successfully!", "order": 1 }
    },
    "type": {
      "p2": { "type": "VALUE", "value": "SUCCESS", "order": 1 }
    }
  }
}
```

**Example - Error message**:

```json
{
  "name": "Message",
  "namespace": "UIEngine",
  "parameterMap": {
    "msg": {
      "p1": { "type": "EXPRESSION", "expression": "Steps.saveData.error.data.message", "order": 1 }
    },
    "type": {
      "p2": { "type": "VALUE", "value": "ERROR", "order": 1 }
    }
  }
}
```

---

### ScrollTo

Scroll the window to a position.

**Namespace**: `UIEngine`  
**Name**: `ScrollTo`

**Parameters**:

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `vertical` | string | No | `"top"` | Vertical position: `top`, `bottom`, or pixel value |
| `horizontal` | string | No | `"left"` | Horizontal position: `left`, `right`, or pixel value |
| `behaviour` | string | No | `"Instant"` | Scroll behavior: `Instant` or `Smooth` |

**Events**: `output`

**Example**:

```json
{
  "name": "ScrollTo",
  "namespace": "UIEngine",
  "parameterMap": {
    "vertical": { "p1": { "type": "VALUE", "value": "top", "order": 1 } },
    "behaviour": { "p2": { "type": "VALUE", "value": "Smooth", "order": 1 } }
  }
}
```

---

### ScrollToGrid

Scroll to a specific component element.

**Namespace**: `UIEngine`  
**Name**: `ScrollToGrid`

**Parameters**:

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `gridkey` | string | Yes | - | Component key (element ID) |
| `behaviour` | string | No | `"Instant"` | Scroll behavior: `Instant` or `Smooth` |

**Events**: `output`

**Example**:

```json
{
  "name": "ScrollToGrid",
  "namespace": "UIEngine",
  "parameterMap": {
    "gridkey": {
      "p1": { "type": "VALUE", "value": "contact-section", "order": 1 }
    },
    "behaviour": {
      "p2": { "type": "VALUE", "value": "Smooth", "order": 1 }
    }
  }
}
```

---

## Utility Functions

### CopyTextToClipboard

Copy text to the system clipboard.

**Namespace**: `UIEngine`  
**Name**: `CopyTextToClipboard`

**Parameters**:

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `text` | string | Yes | - | Text to copy |

**Events**:
- `output`: Success
- `error`: Failure with `data`

**Example**:

```json
{
  "name": "CopyTextToClipboard",
  "namespace": "UIEngine",
  "parameterMap": {
    "text": {
      "p1": { "type": "EXPRESSION", "expression": "Page.shareLink", "order": 1 }
    }
  }
}
```

---

### EncodeURIComponent

Encode a string for use in a URL.

**Namespace**: `UIEngine`  
**Name**: `EncodeURIComponent`

**Parameters**:

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `uriComponent` | string | Yes | - | String to encode |

**Events**: `output` with `encodedValue`

**Example**:

```json
{
  "name": "EncodeURIComponent",
  "namespace": "UIEngine",
  "parameterMap": {
    "uriComponent": {
      "p1": { "type": "EXPRESSION", "expression": "Page.searchQuery", "order": 1 }
    }
  }
}
```

---

### DecodeURIComponent

Decode a URL-encoded string.

**Namespace**: `UIEngine`  
**Name**: `DecodeURIComponent`

**Parameters**:

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `uriComponent` | string | Yes | - | URL-encoded string to decode |

**Events**: `output` with `decodedValue`

**Example**:

```json
{
  "name": "DecodeURIComponent",
  "namespace": "UIEngine",
  "parameterMap": {
    "uriComponent": {
      "p1": { "type": "EXPRESSION", "expression": "Url.queryParameters.search", "order": 1 }
    }
  }
}
```

---

### ShortUniqueId

Generate a short unique identifier.

**Namespace**: `UIEngine`  
**Name**: `ShortUniqueId`

**Parameters**: None

**Events**: `output` with `id` (unique string)

**Example**:

```json
{
  "name": "ShortUniqueId",
  "namespace": "UIEngine",
  "parameterMap": {}
}
```

**Using the result**:

```json
{
  "steps": {
    "generateId": {
      "name": "ShortUniqueId",
      "namespace": "UIEngine",
      "parameterMap": {}
    },
    "setId": {
      "name": "SetStore",
      "namespace": "UIEngine",
      "parameterMap": {
        "path": { "p1": { "type": "VALUE", "value": "Page.newItemId" } },
        "value": { "p2": { "type": "EXPRESSION", "expression": "Steps.generateId.output.id" } }
      },
      "dependentStatements": { "Steps.generateId.output": true }
    }
  }
}
```

---

### ExecuteJSFunction

Execute a JavaScript function by name.

**Namespace**: `UIEngine`  
**Name**: `ExecuteJSFunction`

**Parameters**:

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `name` | string | Yes | - | Name of global JavaScript function |
| `params` | array | No | `[]` | Array of parameters (variadic) |

**Events**:
- `output`: Success with `result`
- `error`: Failure with `data`

**Example**:

```json
{
  "name": "ExecuteJSFunction",
  "namespace": "UIEngine",
  "parameterMap": {
    "name": {
      "p1": { "type": "VALUE", "value": "customValidation", "order": 1 }
    },
    "params": {
      "p2": { "type": "EXPRESSION", "expression": "Page.formData", "order": 1 }
    }
  }
}
```

---

## Function Chaining Pattern

Multiple functions can be chained in a single event:

```json
{
  "name": "submitAndNavigate",
  "steps": {
    "submitData": {
      "name": "SendData",
      "namespace": "UIEngine",
      "parameterMap": {
        "url": { "p1": { "type": "VALUE", "value": "/api/submit" } },
        "method": { "p2": { "type": "VALUE", "value": "POST" } },
        "payload": { "p3": { "type": "EXPRESSION", "expression": "Page.formData" } }
      }
    },
    "showSuccess": {
      "name": "Message",
      "namespace": "UIEngine",
      "parameterMap": {
        "msg": { "p1": { "type": "VALUE", "value": "Submitted successfully!" } },
        "type": { "p2": { "type": "VALUE", "value": "SUCCESS" } }
      },
      "dependentStatements": { "Steps.submitData.output": true }
    },
    "navigate": {
      "name": "Navigate",
      "namespace": "UIEngine",
      "parameterMap": {
        "linkPath": { "p1": { "type": "VALUE", "value": "/dashboard" } }
      },
      "dependentStatements": { "Steps.showSuccess.output": true }
    }
  }
}
```

## Error Handling Pattern

```json
{
  "name": "handleErrors",
  "steps": {
    "fetchData": {
      "name": "FetchData",
      "namespace": "UIEngine",
      "parameterMap": {
        "url": { "p1": { "type": "VALUE", "value": "/api/data" } }
      }
    },
    "handleError": {
      "name": "Message",
      "namespace": "UIEngine",
      "parameterMap": {
        "msg": { "p1": { "type": "EXPRESSION", "expression": "Steps.fetchData.error.data.message" } },
        "type": { "p2": { "type": "VALUE", "value": "ERROR" } }
      },
      "dependentStatements": { "Steps.fetchData.error": true }
    }
  }
}
```

## Related Documents

- [07-event-system.md](07-event-system.md) - Event system overview
- [06-state-management.md](06-state-management.md) - Store prefixes
- [21-kirun-system-functions.md](21-kirun-system-functions.md) - KIRun System functions
- [14-api-reference.md](14-api-reference.md) - API endpoints
