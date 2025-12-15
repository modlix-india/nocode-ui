# Translations

## Overview

The translation system supports multi-language applications. Properties can be marked as translatable and translations are stored in page definitions.

## Translation Structure

Translations are stored in page definitions:

```typescript
interface PageDefinition {
  translations: {
    [languageCode: string]: {
      [key: string]: string;
    };
  };
}
```

## Translatable Properties

Properties marked as `translatable: true` support translations:

```typescript
{
    name: "label",
    displayName: "Label",
    translatable: true,
    schema: SCHEMA_STRING_COMP_PROP
}
```

## Translation Keys

Translation keys are generated from property values:

```json
{
  "properties": {
    "text": {
      "value": "Hello World"
    }
  }
}
```

The system looks for translation key `"Hello World"` in translations.

## Translation Lookup

When a translatable property is resolved:

1. Get current language from `Store.application.defaultLanguage` or `LocalStore.currentLanguage`
2. Look up translation in `pageDefinition.translations[languageCode][key]`
3. Fall back to property value if translation not found

## Multi-Language Support

### Setting Language

Language can be set:

```typescript
setData("LocalStore.currentLanguage", "en");
// or
setData("Store.application.defaultLanguage", "fr");
```

### Language Codes

Common language codes:

- `en`: English
- `fr`: French
- `es`: Spanish
- `de`: German
- `zh`: Chinese
- etc.

## Translation Example

### Page Definition

```json
{
  "translations": {
    "en": {
      "Hello World": "Hello World",
      "Welcome": "Welcome"
    },
    "fr": {
      "Hello World": "Bonjour le monde",
      "Welcome": "Bienvenue"
    },
    "es": {
      "Hello World": "Hola Mundo",
      "Welcome": "Bienvenido"
    }
  },
  "componentDefinition": {
    "text-1": {
      "type": "Text",
      "properties": {
        "text": {
          "value": "Hello World"
        }
      }
    }
  }
}
```

### Component Usage

```json
{
  "type": "Text",
  "properties": {
    "text": {
      "value": "Hello World",
      "translatable": true
    }
  }
}
```

When language is `fr`, displays "Bonjour le monde".

## Translation in Expressions

Translations can be used in expressions:

```json
{
  "properties": {
    "text": {
      "location": {
        "type": "EXPRESSION",
        "expression": "Translations['Hello World']"
      }
    }
  }
}
```

## Application-Level Translations

Application can define global translations:

```typescript
Store.application.translations = {
    "en": { ... },
    "fr": { ... }
};
```

## Real Examples from Samples

Translations are typically defined at the page level and applied to translatable properties automatically.

## Related Documents

- [04-property-system.md](04-property-system.md) - Translatable properties
- [02-application-and-page-definitions.md](02-application-and-page-definitions.md) - Page definitions
