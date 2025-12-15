# Validation System

## Overview

The validation system provides form and component-level validation. Validations can be defined per component and are executed when needed (e.g., on form submit).

## Validation Structure

Validations are defined in component definitions:

```typescript
interface ComponentDefinition {
  validations?: Array<Validation>;
}

interface Validation {
  name: string; // Validation rule name
  message?: string; // Error message
  parameters?: {
    // Validation parameters
    [key: string]: any;
  };
}
```

## Validation Types

Common validation types:

- `required`: Field is required
- `minLength`: Minimum length
- `maxLength`: Maximum length
- `min`: Minimum value
- `max`: Maximum value
- `pattern`: Regex pattern
- `email`: Email format
- `url`: URL format
- `custom`: Custom validation function

## Validation Definition Example

```json
{
  "type": "TextBox",
  "properties": {
    "value": {
      "location": {
        "type": "VALUE",
        "value": "Page.formData.email"
      }
    }
  },
  "validations": [
    {
      "name": "required",
      "message": "Email is required"
    },
    {
      "name": "email",
      "message": "Invalid email format"
    },
    {
      "name": "minLength",
      "parameters": {
        "value": 5
      },
      "message": "Email must be at least 5 characters"
    }
  ]
}
```

## Validation Execution

Validations are executed:

1. **On Form Submit**: All form field validations run
2. **On Blur**: Field-level validation can run
3. **On Change**: Real-time validation (optional)
4. **Manually**: Via `validationCheck` in events

## Validation Triggers

Validation triggers are stored in:

```typescript
Store.validationTriggers.{pageName}.{componentKey} = true;
```

This marks a component for validation.

## Validation Results

Validation results are stored in:

```typescript
Store.validations.{pageName}.{componentKey} = [
    "Error message 1",
    "Error message 2"
];
```

## Custom Validation

Components can define custom validation functions:

```typescript
validations: {
    customValidation: (
        validation: any,
        value: any,
        def: ComponentDefinition,
        locationHistory: Array<LocationHistory>,
        pageExtractor: PageStoreExtractor
    ) => Array<string> {
        // Return array of error messages
        if (!value) return ["Value is required"];
        if (value.length < 5) return ["Value must be at least 5 characters"];
        return [];
    }
}
```

## Form Validation

Forms validate all child components:

```json
{
  "type": "Form",
  "properties": {
    "onSubmit": {
      "value": "submitForm"
    }
  },
  "children": {
    "email-field": true,
    "password-field": true
  }
}
```

On submit, all child validations run.

## Validation in Events

Events can trigger validation:

```json
{
  "name": "submitForm",
  "validationCheck": "form-1",
  "steps": {
    "submit": {
      "name": "SendData",
      "namespace": "UIEngine",
      "parameterMap": { ... }
    }
  }
}
```

If validation fails, the event doesn't execute.

## Validation Messages

Validation messages are displayed:

1. **Component Level**: Messages shown near component
2. **Form Level**: Summary of all errors
3. **Toast Messages**: Error toast notifications

## Real Examples

### Required Field

```json
{
  "type": "TextBox",
  "validations": [
    {
      "name": "required",
      "message": "This field is required"
    }
  ]
}
```

### Email Validation

```json
{
  "type": "TextBox",
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
}
```

### Custom Range Validation

```json
{
  "type": "TextBox",
  "validations": [
    {
      "name": "min",
      "parameters": { "value": 0 },
      "message": "Value must be positive"
    },
    {
      "name": "max",
      "parameters": { "value": 100 },
      "message": "Value must be less than 100"
    }
  ]
}
```

## Related Documents

- [04-property-system.md](04-property-system.md) - Property system
- [07-event-system.md](07-event-system.md) - Event system with validation
