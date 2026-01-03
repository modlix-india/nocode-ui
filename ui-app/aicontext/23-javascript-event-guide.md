# LLM Guide: Generating JavaScript for KIRun Conversion

This guide explains how to generate JavaScript code that can be converted to KIRun function definitions.

## Overview

The JavaScript-to-KIRun converter transforms JavaScript code into event functions for the nocode UI system. When generating JavaScript for this converter:

1. **No local variables** - All state lives in Page/Store/Url/Parent
2. **Use KIRun paths** for data access
3. **Follow supported patterns** for operations

## Core Principles

### 1. No Local Variables

All state must be stored in Page, Store, Url, or Parent objects. **Do not use local variables**.

**DON'T:**

```javascript
const counter = 0;
counter++;
```

**DO:**

```javascript
Page.counter = 0;
Page.counter = Page.counter + 1;
```

### 2. KIRun Paths

All data access uses these prefixes:

- `Page.*` - Page-scoped state
- `Store.*` - Global application state
- `Url.*` - URL parameters and path
- `Parent.*` - Parent component context
- `Steps.*` - Results from previous steps
- `Arguments.*` - Function arguments

**Examples:**

```javascript
Page.counter;
Store.user.name;
Url.queryParameters.id;
Steps.fetchData1.output.data;
```

### 3. Sequential Steps

Each JavaScript statement becomes a KIRun step. Steps execute in order unless dependencies are specified.

## Supported Patterns

### Store Operations

**Set a value:**

```javascript
Page.counter = 0;
Store.user.name = "John";
```

**Increment/Decrement:**

```javascript
Page.counter = Page.counter + 1;
Page.counter = Page.counter - 1;
// Or shorthand (also works):
Page.counter++;
```

**Compound operations:**

```javascript
Page.total = Page.total + Page.itemPrice;
Page.message = Page.firstName + " " + Page.lastName;
```

### API Calls

**Note:** The `await` keyword is optional. The converter handles async operations implicitly through step dependencies.

**GET request:**

```javascript
fetch("/api/users");
Page.users = Steps.fetchData1.output.data;
```

**POST request:**

```javascript
fetch("/api/users", {
  method: "POST",
  body: Page.formData,
});
Page.result = Steps.sendData1.output.data;
```

**DELETE request:**

```javascript
fetch("/api/users/" + Page.userId, {
  method: "DELETE",
});
```

**With headers:**

```javascript
fetch("/api/data", {
  method: "POST",
  body: Page.payload,
  headers: {
    "Content-Type": "application/json",
  },
});
```

### Navigation

**Navigate to path:**

```javascript
navigate("/dashboard");
navigate("/users/" + Page.userId);
```

### Messages

**Show message:**

```javascript
alert("Operation completed!");
showMessage("Error occurred", "ERROR");
```

### Conditionals

**If-else:**

```javascript
if (Page.isLoggedIn) {
  navigate("/dashboard");
} else {
  navigate("/login");
}
```

**Nested conditions:**

```javascript
if (Page.userRole === "admin") {
  Page.canEdit = true;
} else if (Page.userRole === "editor") {
  Page.canEdit = true;
} else {
  Page.canEdit = false;
}
```

### Loops

**For loop (range):**

```javascript
for (let i = 0; i < Page.itemCount; i++) {
  Page.total = Page.total + Page.items[i].price;
}
```

**For-of loop:**

```javascript
for (const item of Page.items) {
  Page.total = Page.total + item.price;
}
```

## Expression Guidelines

### Binary Operations

Use standard JavaScript operators:

```javascript
Page.total = Page.price * Page.quantity;
Page.isValid = Page.age >= 18;
Page.fullName = Page.firstName + " " + Page.lastName;
Page.isActive = Page.status === "active";
```

### Member Access

Access nested properties:

```javascript
Page.userName = Store.user.profile.name;
Page.firstItem = Page.items[0];
Page.itemName = Page.items[Page.selectedIndex].name;
```

### Ternary Expressions

```javascript
Page.status = Page.isActive ? "Active" : "Inactive";
Page.discount = Page.isPremium ? 0.2 : 0.1;
```

## Common Patterns with Examples

### 1. Increment Counter

```javascript
Page.counter = Page.counter + 1;
```

### 2. Toggle Boolean

```javascript
Page.isVisible = !Page.isVisible;
```

### 3. Fetch and Store Data

```javascript
fetch("/api/users");
Page.users = Steps.fetchData1.output.data;
Page.loading = false;
```

### 4. Conditional Navigation

```javascript
if (Page.isLoggedIn) {
  navigate("/dashboard");
} else {
  navigate("/login");
}
```

### 5. Form Submission

```javascript
fetch("/api/submit", {
  method: "POST",
  body: Page.formData,
});

if (Steps.sendData1.output.status === 200) {
  Page.success = true;
  navigate("/success");
} else {
  Page.error = Steps.sendData1.output.data.message;
}
```

### 6. Error Handling

```javascript
fetch("/api/data");

if (Steps.fetchData1.error) {
  Page.errorMessage = Steps.fetchData1.error.data.message;
} else {
  Page.data = Steps.fetchData1.output.data;
}
```

### 7. Array Operations

**Add to array:**

```javascript
Page.items.push(Page.newItem);
```

**Clear array:**

```javascript
Page.items = [];
```

### 8. Object Updates

```javascript
Page.user = {
  name: Page.inputName,
  email: Page.inputEmail,
  age: Page.inputAge,
};
```

## What NOT to Do

### ❌ Local Variables

```javascript
// BAD - Local variable not supported
const total = 0;
for (const item of Page.items) {
  total += item.price;
}
Page.total = total;
```

```javascript
// GOOD - Use Page/Store directly
Page.total = 0;
for (const item of Page.items) {
  Page.total = Page.total + item.price;
}
```

### ❌ Arrow Functions (except in array methods)

```javascript
// BAD - Arrow functions not fully supported
const calculate = (x) => x * 2;
Page.result = calculate(Page.value);
```

```javascript
// GOOD - Direct expression
Page.result = Page.value * 2;
```

### ❌ Closures

```javascript
// BAD - Closures not supported
function createCounter() {
  let count = 0;
  return () => count++;
}
```

### ❌ Complex Async Patterns

```javascript
// BAD - Promise.all not directly supported
Promise.all([fetch("/api/users"), fetch("/api/posts")]);
```

```javascript
// GOOD - Sequential fetches
fetch("/api/users");
Page.users = Steps.fetchData1.output.data;

fetch("/api/posts");
Page.posts = Steps.fetchData2.output.data;
```

### ❌ Destructuring

```javascript
// BAD - Destructuring to local variables
const { name, email } = Page.user;
Page.display = name + " - " + email;
```

```javascript
// GOOD - Direct access
Page.display = Page.user.name + " - " + Page.user.email;
```

## Conversion Examples

### Example 1: Counter Increment

**JavaScript:**

```javascript
Page.counter = Page.counter + 1;
```

**KIRun Output:**

```json
{
  "steps": {
    "setStore1": {
      "statementName": "setStore1",
      "name": "SetStore",
      "namespace": "UIEngine",
      "parameterMap": {
        "path": {
          "p1": { "type": "VALUE", "value": "Page.counter" }
        },
        "value": {
          "p2": { "type": "EXPRESSION", "expression": "(Page.counter + 1)" }
        }
      }
    }
  }
}
```

### Example 2: Fetch and Store

**JavaScript:**

```javascript
fetch("/api/users");
Page.users = Steps.fetchData1.output.data;
```

**KIRun Output:**

```json
{
  "steps": {
    "fetchData1": {
      "statementName": "fetchData1",
      "name": "FetchData",
      "namespace": "UIEngine",
      "parameterMap": {
        "url": {
          "p1": { "type": "VALUE", "value": "/api/users" }
        }
      }
    },
    "setStore1": {
      "statementName": "setStore1",
      "name": "SetStore",
      "namespace": "UIEngine",
      "parameterMap": {
        "path": {
          "p1": { "type": "VALUE", "value": "Page.users" }
        },
        "value": {
          "p2": {
            "type": "EXPRESSION",
            "expression": "Steps.fetchData1.output.data"
          }
        }
      },
      "dependentStatements": {
        "Steps.fetchData1.output": true
      }
    }
  }
}
```

### Example 3: Conditional Navigation

**JavaScript:**

```javascript
if (Page.isLoggedIn) {
  navigate("/dashboard");
} else {
  navigate("/login");
}
```

**KIRun Output:**

```json
{
  "steps": {
    "if1": {
      "statementName": "if1",
      "name": "If",
      "namespace": "System",
      "parameterMap": {
        "condition": {
          "p1": { "type": "EXPRESSION", "expression": "Page.isLoggedIn" }
        }
      }
    },
    "navigate1": {
      "statementName": "navigate1",
      "name": "Navigate",
      "namespace": "UIEngine",
      "parameterMap": {
        "linkPath": {
          "p1": { "type": "VALUE", "value": "/dashboard" }
        }
      },
      "dependentStatements": {
        "Steps.if1.true": true
      }
    },
    "navigate2": {
      "statementName": "navigate2",
      "name": "Navigate",
      "namespace": "UIEngine",
      "parameterMap": {
        "linkPath": {
          "p1": { "type": "VALUE", "value": "/login" }
        }
      },
      "dependentStatements": {
        "Steps.if1.false": true
      }
    }
  }
}
```

## Best Practices

1. **Use descriptive Page/Store paths**: `Page.userProfile.email` instead of `Page.e`

2. **Reference step outputs correctly**: `Steps.{stepName}.output.data`

3. **Keep expressions simple**: Break complex logic into multiple steps

4. **Use conditionals for branching**: Create separate steps for each branch

5. **Handle errors explicitly**: Check for `.error` events on API calls

6. **Avoid side effects**: Each statement should have a clear, single purpose

## Step Dependencies

Steps reference each other using the `dependentStatements` property:

- `Steps.{stepName}.output` - Step completed successfully
- `Steps.{stepName}.error` - Step failed with error
- `Steps.{stepName}.true` - If condition was true
- `Steps.{stepName}.false` - If condition was false
- `Steps.{stepName}.iteration` - Loop iteration

The converter automatically detects dependencies from step references in expressions.
