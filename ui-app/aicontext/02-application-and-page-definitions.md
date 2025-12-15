# Application and Page Definitions

## Overview

The nocode UI system is driven by two primary definition types:

1. **Application Definition**: Contains application-wide settings, themes, styles, and metadata
2. **Page Definition**: Contains the structure and content of individual pages

Both are stored in MongoDB and fetched via REST APIs at runtime.

## Application Definition

### API Endpoint

```
GET /api/ui/application
```

### Request Headers

- `Authorization`: JWT token (if authenticated)
- `appCode`: Application code (optional, from URL)
- `clientCode`: Client code (optional, from URL)
- `x-debug`: Debug mode identifier (if in debug mode)

### Structure

The application definition contains:

```typescript
interface ApplicationDefinition {
  _id: string; // MongoDB ID
  name: string; // Application name
  appCode: string; // Unique application code
  clientCode: string; // Client/organization code
  version: number; // Version number
  properties: {
    title?: string; // Application title
    defaultPage?: string; // Default page to load
    shellPage?: string; // Shell page name (wraps content)
    loginPage?: string; // Login page name
    forbiddenPage?: string; // 403 page name
    notFoundPage?: string; // 404 page name

    // Head tags
    links?: {
      // Link tags for <head>
      [key: string]: {
        rel: string;
        href: string;
        type?: string;
        crossorigin?: boolean;
        // ... other link attributes
      };
    };
    scripts?: {
      // Script tags for <head>
      [key: string]: {
        src: string;
        async?: boolean;
        defer?: boolean;
        type?: string;
        // ... other script attributes
      };
    };
    metas?: {
      // Meta tags
      [key: string]: {
        name?: string;
        "http-equiv"?: string;
        content: string;
        charset?: string;
      };
    };

    // Font and Icon Packs
    fontPacks?: {
      [key: string]: {
        name: string;
        code: string; // HTML to inject
        order?: number;
      };
    };
    iconPacks?: {
      [key: string]: {
        name: string; // e.g., "FREE_FONT_AWESOME_ALL"
        code?: string; // Optional custom code
      };
    };

    // Code Parts (injected HTML)
    codeParts?: {
      [key: string]: {
        part: string; // HTML code
        place: "BEFORE_HEAD" | "AFTER_HEAD" | "BEFORE_BODY" | "AFTER_BODY";
        order?: number;
      };
    };

    // Theme and Style References
    themes?: {
      [key: string]: {
        name: string; // Theme name
      };
    };
    styles?: {
      [key: string]: {
        name: string; // Style name
      };
    };

    // PWA Manifest
    manifest?: {
      name: string;
      short_name: string;
      icons: Array<{
        src: string;
        sizes: string;
        type: string;
      }>;
      theme_color?: string;
      background_color?: string;
      display?: string;
    };

    // Content Security Policy
    csp?: {
      defaultSrc?: string;
      scriptSrc?: string;
      styleSrc?: string;
      fontSrc?: string;
      frameSrc?: string;
      // ... other CSP directives
    };

    // SSO Configuration
    sso?: {
      redirectURL?: string; // SSO redirect URL template
    };

    // Filler Values (global variables)
    fillerValues?: {
      [key: string]: any;
    };

    defaultLanguage?: string; // Default language code
  };
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  updatedBy: string;
}
```

### Real Example

From `samples/application-samples.json`:

```json
{
  "_id": "63bce182d071ab04c40babff",
  "name": "appbuilder",
  "appCode": "appbuilder",
  "clientCode": "SYSTEM",
  "version": 86,
  "properties": {
    "title": "Openbracket",
    "defaultPage": "homeTwo",
    "shellPage": "shellPage",
    "loginPage": "loginPage",
    "forbiddenPage": "forbiddenPage",
    "iconPacks": {
      "uuid1": { "name": "FREE_FONT_AWESOME_ALL" },
      "uuid2": { "name": "MATERIAL_SYMBOLS_OUTLINED" }
    },
    "fontPacks": {
      "uuid1": {
        "name": "ASAP",
        "code": "<link rel=\"preconnect\" href=\"https://fonts.googleapis.com\">..."
      }
    },
    "links": {
      "66c3ae46cd81": {
        "rel": "icon",
        "type": "image/png",
        "href": "/api/files/static/file/SYSTEM/appbuilder/openbracket/favicon/favicon.ico"
      }
    },
    "themes": {
      "618a75b9e594": { "name": "appbuildertheme" }
    },
    "styles": {
      "a522d5f666cf9": { "name": "appbuilderstyle" }
    }
  }
}
```

### Fetching Application Definition

Code from `App/appDefinition.ts`:

```typescript
export async function getAppDefinition(): Promise<AppDefinitionResponse> {
  const authToken = localStorage.getItem("AuthToken");
  const axiosOptions: AxiosRequestConfig<any> = { headers: {} };

  if (authToken) {
    axiosOptions.headers!["Authorization"] = JSON.parse(authToken);
  }

  const response = await axios.get("api/ui/application", axiosOptions);
  return {
    application: response.data,
    auth: authData,
    theme: themeData,
    isApplicationLoadFailed: false,
  };
}
```

## Page Definition

### API Endpoint

```
GET /api/ui/page/{pageName}
```

### Request Headers

- `Authorization`: JWT token (if authenticated)
- `appCode`: Application code (optional)
- `clientCode`: Client code (optional)
- `x-debug`: Debug mode identifier (if in debug mode)

### Structure

The page definition contains:

```typescript
interface PageDefinition {
  _id: string; // MongoDB ID
  name: string; // Page name (used in URL)
  appCode: string; // Application code
  clientCode: string; // Client code
  baseClientCode?: string; // Base client code (for inheritance)
  permission?: string; // Permission required to access
  version: number; // Version number
  isFromUndoRedoStack: boolean; // Whether from undo/redo

  // Root component key
  rootComponent: string; // Key of root component

  // Component tree
  componentDefinition: {
    [key: string]: ComponentDefinition;
  };

  // Event functions
  eventFunctions: {
    [key: string]: any; // KIRun function definitions
  };

  // Translations
  translations: {
    [languageCode: string]: {
      [key: string]: string;
    };
  };

  // Page properties
  properties: {
    title?: {
      name?: ComponentProperty<string>;
      append?: ComponentProperty<string | boolean>;
    };
    onLoadEvent?: string; // Event function key to run on load
    loadStrategy?: "default" | "always" | "once";
    wrapShell?: boolean; // Whether to wrap in shell page

    // SEO properties
    seo?: {
      description?: ComponentProperty<string>;
      keywords?: ComponentProperty<string>;
      robots?: ComponentProperty<string>;
      charset?: ComponentProperty<string>;
      author?: ComponentProperty<string>;
      applicationName?: ComponentProperty<string>;
      generator?: ComponentProperty<string>;
    };

    // CSS classes
    classes?: {
      [key: string]: StyleClassDefinition;
    };
  };

  // Processed CSS classes (runtime)
  processedClasses?: {
    [key: string]: { [key: string]: string };
  };

  createdAt: string;
  createdBy: string;
  updatedAt: string;
  updatedBy: string;
}
```

### Component Definition Structure

Each component in `componentDefinition`:

```typescript
interface ComponentDefinition {
  key: string; // Unique key (UUID)
  name: string; // Display name
  type: string; // Component type (Button, Text, Grid, etc.)

  // Properties (component-specific)
  properties?: {
    [propertyName: string]:
      | ComponentProperty<any>
      | ComponentMultiProperty<any>;
  };

  // Style properties (responsive)
  styleProperties?: ComponentStyle;

  // Validations
  validations?: Array<Validation>;

  // Children (component keys)
  children?: {
    [childKey: string]: boolean;
  };

  // Display order
  displayOrder?: number;

  // Binding paths (for data binding)
  bindingPath?: DataLocation;
  bindingPath2?: DataLocation;
  // ... up to bindingPath10
}
```

### Real Example

From `samples/page-samples.json`:

```json
{
  "_id": "63bee0aa4d18a31536e81fa9",
  "name": "home",
  "appCode": "nothing",
  "clientCode": "SYSTEM",
  "version": 10,
  "rootComponent": "0710873b-933e-47f9-90f5-407e67e92d83",
  "properties": {
    "title": {
      "name": { "value": "Danger, Will Robinson" },
      "append": { "value": false }
    },
    "wrapShell": false
  },
  "componentDefinition": {
    "0710873b-933e-47f9-90f5-407e67e92d83": {
      "key": "0710873b-933e-47f9-90f5-407e67e92d83",
      "name": "mainGrid",
      "type": "Grid",
      "styleProperties": {
        "3INq4d0XPB2v7BL7Nb1sXO": {
          "resolutions": {
            "ALL": {
              "width": { "value": "100vw" },
              "height": { "value": "100vh" },
              "alignItems": { "value": "center" },
              "justifyContent": { "value": "center" }
            }
          }
        }
      },
      "children": {
        "WKcdRaOkRwO88RTZ3QPQV": true
      }
    },
    "WKcdRaOkRwO88RTZ3QPQV": {
      "key": "WKcdRaOkRwO88RTZ3QPQV",
      "name": "Grid",
      "type": "Grid",
      "children": {
        "71Tm5Nigkh1nIFgxGA7r8I": true,
        "4g2TF2fQLW468ILe9AYmb7": true
      },
      "displayOrder": 2
    },
    "71Tm5Nigkh1nIFgxGA7r8I": {
      "key": "71Tm5Nigkh1nIFgxGA7r8I",
      "name": "Icon",
      "type": "Icon",
      "properties": {
        "icon": { "value": "fa-solid fa-explosion fa-4x" },
        "colorScheme": { "value": "_quaternary" }
      },
      "displayOrder": 1
    },
    "4g2TF2fQLW468ILe9AYmb7": {
      "key": "4g2TF2fQLW468ILe9AYmb7",
      "name": "Text",
      "type": "Text",
      "properties": {
        "text": {
          "value": "You are not supposed to be on this page..."
        }
      },
      "styleProperties": {
        "3zHxLip0NfbU71SALwnHVh": {
          "resolutions": {
            "ALL": {
              "textAlign": { "value": "center" },
              "color": {
                "location": {
                  "type": "EXPRESSION",
                  "expression": "Theme.backgroundColorFour"
                }
              }
            }
          }
        }
      },
      "displayOrder": 2
    }
  }
}
```

### Fetching Page Definition

Code from `Engine/pageDefinition.ts`:

```typescript
export default async function getPageDefinition(
  pageName: string,
  appCode?: string,
  clientCode?: string
): Promise<PageDefinition> {
  const axiosConfig: AxiosRequestConfig<any> = { headers: {} };

  const authToken = localStorage.getItem("AuthToken");
  if (authToken) {
    axiosConfig.headers!["Authorization"] = JSON.parse(authToken);
  }

  if (appCode) axiosConfig.headers!["appCode"] = appCode;
  if (clientCode) axiosConfig.headers!["clientCode"] = clientCode;

  return (await axios.get(`api/ui/page/${pageName}`, axiosConfig)).data;
}
```

## Shell Pages

A shell page is a special page that wraps other pages. It's defined in the application's `shellPage` property.

### How It Works

1. Application definition specifies `shellPage: "shellPage"`
2. When a page loads, if `wrapShell: true` (default), the shell page wraps the content
3. The shell page typically contains:
   - Navigation menus
   - Headers/footers
   - Sidebars
   - Common UI elements

### Example

```typescript
// Application definition
{
  "properties": {
    "shellPage": "shellPage",
    "defaultPage": "home"
  }
}

// When loading "home" page:
// 1. Load shellPage definition
// 2. Load home page definition
// 3. Render shellPage with home page as content
```

## Page Properties

### Title

```typescript
properties: {
    title: {
        name: {
            value: "My Page Title"  // or location/expression
        },
        append: {
            value: true  // true = append to app title, "prepend" = prepend, false = replace
        }
    }
}
```

### SEO

```typescript
properties: {
    seo: {
        description: { value: "Page description" },
        keywords: { value: "keyword1, keyword2" },
        robots: { value: "index, follow" },
        author: { value: "Author Name" }
    }
}
```

### Load Strategy

- `default`: Load event runs only on first load
- `always`: Load event runs every time page is visited
- `once`: Load event runs once per session

### OnLoadEvent

Specifies an event function key to execute when the page loads:

```typescript
properties: {
  onLoadEvent: "37e6zV5DhRrmiLq4qW4dTU"; // Key in eventFunctions
}
```

## CSS Classes

Pages can define custom CSS classes:

```typescript
properties: {
    classes: {
        "7e72Poi9dkzP80MRqiA63Q": {
            key: "7e72Poi9dkzP80MRqiA63Q",
            selector: "@keyframes gradient",
            style: "0% { background-position: 0% 0%; } ...",
            mediaQuery: "@media (max-width: 768px)"  // Optional
        }
    }
}
```

These are injected into the page as `<style>` tags.

## Related Documents

- [03-component-system.md](03-component-system.md) - Component definitions
- [04-property-system.md](04-property-system.md) - ComponentProperty structure
- [05-style-system.md](05-style-system.md) - Style properties
- [07-event-system.md](07-event-system.md) - Event functions
- [14-api-reference.md](14-api-reference.md) - API details
