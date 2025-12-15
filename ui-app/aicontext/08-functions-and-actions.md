# Functions and Actions

## Overview

The nocode UI system includes built-in functions (actions) that can be executed in event functions. These functions are part of the `UIEngine` namespace and are executed via KIRun runtime.

## Function Repository

Functions are registered in `ui-app/client/src/functions/index.ts`:

```typescript
export class UIFunctionRepository extends HybridRepository<Function> {
  constructor() {
    super(new KIRunFunctionRepository(), new _UIFunctionRepository());
  }
}
```

## Available Functions

### Navigation Functions

#### Navigate

Navigate to a page.

**Namespace**: `UIEngine`  
**Name**: `Navigate`

**Parameters**:

- `pageName` (string): Page name to navigate to
- `queryParameters` (object, optional): Query parameters
- `pathParameters` (object, optional): Path parameters

**Example**:

```json
{
  "name": "Navigate",
  "namespace": "UIEngine",
  "parameterMap": {
    "pageName": {
      "param1": {
        "type": "VALUE",
        "value": "home",
        "order": 1
      }
    }
  }
}
```

#### NavigateBack

Navigate back in browser history.

**Namespace**: `UIEngine`  
**Name**: `NavigateBack`

**Parameters**: None

#### NavigateForward

Navigate forward in browser history.

**Namespace**: `UIEngine`  
**Name**: `NavigateForward`

**Parameters**: None

### Data Functions

#### FetchData

Fetch data from an API endpoint.

**Namespace**: `UIEngine`  
**Name**: `FetchData`

**Parameters**:

- `url` (string): API endpoint URL
- `method` (string): HTTP method (GET, POST, PUT, DELETE, etc.)
- `headers` (object, optional): Request headers
- `body` (any, optional): Request body
- `storePath` (string, optional): Store path to save response
- `responseType` (string, optional): Response type

**Example**:

```json
{
  "name": "FetchData",
  "namespace": "UIEngine",
  "parameterMap": {
    "url": {
      "param1": {
        "type": "VALUE",
        "value": "/api/users",
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
        "value": "Page.users",
        "order": 1
      }
    }
  }
}
```

#### SendData

Send data to an API endpoint.

**Namespace**: `UIEngine`  
**Name**: `SendData`

**Parameters**:

- `url` (string): API endpoint URL
- `method` (string): HTTP method
- `headers` (object, optional): Request headers
- `body` (any): Request body
- `storePath` (string, optional): Store path to save response

#### DeleteData

Delete data via API.

**Namespace**: `UIEngine`  
**Name**: `DeleteData`

**Parameters**:

- `url` (string): API endpoint URL
- `headers` (object, optional): Request headers
- `storePath` (string, optional): Store path to save response

### Store Functions

#### SetStore

Set a value in the store.

**Namespace**: `UIEngine`  
**Name**: `SetStore`

**Parameters**:

- `path` (string): Store path
- `value` (any): Value to set

**Example**:

```json
{
  "name": "SetStore",
  "namespace": "UIEngine",
  "parameterMap": {
    "path": {
      "param1": {
        "type": "VALUE",
        "value": "Page.counter",
        "order": 1
      }
    },
    "value": {
      "param2": {
        "type": "EXPRESSION",
        "expression": "Page.counter + 1",
        "order": 1
      }
    }
  }
}
```

#### GetStoreData

Get a value from the store.

**Namespace**: `UIEngine`  
**Name**: `GetStoreData`

**Parameters**:

- `path` (string): Store path
- `defaultValue` (any, optional): Default value if not found

### Authentication Functions

#### Login

Login a user.

**Namespace**: `UIEngine`  
**Name**: `Login`

**Parameters**:

- `username` (string): Username
- `password` (string): Password
- `storePath` (string, optional): Store path to save auth data

#### Logout

Logout current user.

**Namespace**: `UIEngine`  
**Name**: `Logout`

**Parameters**: None

### UI Functions

#### Message

Show a message to the user.

**Namespace**: `UIEngine`  
**Name**: `Message`

**Parameters**:

- `message` (string): Message text
- `type` (string): Message type (SUCCESS, ERROR, WARNING, INFO)
- `duration` (number, optional): Display duration in milliseconds

**Example**:

```json
{
  "name": "Message",
  "namespace": "UIEngine",
  "parameterMap": {
    "message": {
      "param1": {
        "type": "VALUE",
        "value": "Operation successful",
        "order": 1
      }
    },
    "type": {
      "param2": {
        "type": "VALUE",
        "value": "SUCCESS",
        "order": 1
      }
    }
  }
}
```

#### ScrollTo

Scroll to an element.

**Namespace**: `UIEngine`  
**Name**: `ScrollTo`

**Parameters**:

- `elementId` (string): Element ID to scroll to
- `block` (string, optional): Scroll block position
- `inline` (string, optional): Scroll inline position

#### ScrollToGrid

Scroll to a grid component.

**Namespace**: `UIEngine`  
**Name**: `ScrollToGrid`

**Parameters**:

- `componentKey` (string): Component key to scroll to

#### Refresh

Refresh the page.

**Namespace**: `UIEngine`  
**Name**: `Refresh`

**Parameters**: None

### Utility Functions

#### CopyTextToClipboard

Copy text to clipboard.

**Namespace**: `UIEngine`  
**Name**: `CopyTextToClipboard`

**Parameters**:

- `text` (string): Text to copy

#### EncodeURIComponent

Encode URI component.

**Namespace**: `UIEngine`  
**Name**: `EncodeURIComponent`

**Parameters**:

- `text` (string): Text to encode

#### DecodeURIComponent

Decode URI component.

**Namespace**: `UIEngine`  
**Name**: `DecodeURIComponent`

**Parameters**:

- `text` (string): Text to decode

#### ShortUniqueId

Generate a short unique ID.

**Namespace**: `UIEngine`  
**Name**: `ShortUniqueId`

**Parameters**: None

**Returns**: Short unique ID string

#### ExecuteJSFunction

Execute a JavaScript function.

**Namespace**: `UIEngine`  
**Name**: `ExecuteJSFunction`

**Parameters**:

- `functionName` (string): Function name
- `args` (array, optional): Function arguments

## Function Execution

Functions are executed via KIRun runtime:

```typescript
const runtime = new KIRuntime(
    functionDefinition,
    UI_FUN_REPO,
    UI_SCHEMA_REPO
);

const result = await runtime.execute(
    new FunctionExecutionParameters()
        .setArguments(args)
        .setContext(...)
);
```

## Function Signatures

Functions follow KIRun function signature format:

```typescript
interface FunctionSignature {
  name: string;
  namespace: string;
  parameters: Map<string, Schema>;
  returnType: Schema;
}
```

## Using Functions in Events

Functions are used in event function steps:

```json
{
  "name": "myEvent",
  "steps": {
    "step1": {
      "name": "SetStore",
      "namespace": "UIEngine",
      "parameterMap": {
        "path": { ... },
        "value": { ... }
      }
    },
    "step2": {
      "name": "Navigate",
      "namespace": "UIEngine",
      "parameterMap": {
        "pageName": { ... }
      }
    }
  }
}
```

## Function Chaining

Multiple functions can be chained in a single event:

```json
{
  "name": "submitForm",
  "steps": {
    "validate": {
      "name": "GetStoreData",
      "namespace": "UIEngine",
      "parameterMap": { ... }
    },
    "send": {
      "name": "SendData",
      "namespace": "UIEngine",
      "parameterMap": { ... }
    },
    "navigate": {
      "name": "Navigate",
      "namespace": "UIEngine",
      "parameterMap": { ... }
    }
  }
}
```

## Error Handling

Functions can throw errors that are caught by the event system:

```typescript
try {
    await runEvent(eventFunction, ...);
} catch (error) {
    // Error handling
    addMessage(MESSAGE_TYPE.ERROR, error.message, false);
}
```

## Related Documents

- [07-event-system.md](07-event-system.md) - Event system
- [06-state-management.md](06-state-management.md) - Store system
- [14-api-reference.md](14-api-reference.md) - API endpoints
