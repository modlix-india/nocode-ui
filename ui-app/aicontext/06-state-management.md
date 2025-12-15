# State Management

## Overview

The nocode UI system uses a reactive store architecture with multiple extractors for different data scopes. The store is path-based and supports reactivity through listeners.

## Store Architecture

The store is built on `@fincity/path-reactive-state-management` and supports:

- Path-based data access
- Reactive listeners
- Multiple data extractors
- Nested data structures

## Store Prefixes

Different data scopes use different prefixes:

### Store (Global Application Store)

**Prefix**: `Store.`

Global application-wide data:

```typescript
Store.application; // Application definition
Store.pageDefinition; // Page definitions
Store.auth; // Authentication data
Store.theme; // Theme variables
Store.devices; // Device type flags
Store.window; // Window properties
Store.urlDetails; // URL details
Store.pageData; // Page-scoped data
Store.urlData; // URL-scoped data
```

### Page (Page-Scoped Data)

**Prefix**: `Page.`

Data scoped to a specific page:

```typescript
Page.currentItem; // Current item in page
Page.formData; // Form data
Page.menu; // Menu state
```

Access via `PageStoreExtractor`:

```typescript
const pageExtractor = PageStoreExtractor.getForContext(pageName);
// Resolves to: Store.pageData.{pageName}.currentItem
```

### Url (URL Parameters)

**Prefix**: `Url.`

URL parameters and query strings:

```typescript
Url.pageName; // Current page name
Url.queryParameters; // Query parameters
Url.pathParameters; // Path parameters
```

Access via `UrlDetailsExtractor`:

```typescript
const urlExtractor = UrlDetailsExtractor.getForContext(pageName);
// Resolves to: Store.urlData.{pageName}.pageName
```

### LocalStore (Browser localStorage)

**Prefix**: `LocalStore.`

Browser localStorage data:

```typescript
LocalStore.userPreferences; // User preferences
LocalStore.settings; // Settings
```

Persists across sessions.

### Theme (Theme Variables)

**Prefix**: `Theme.`

Theme variables:

```typescript
Theme.primaryColor; // Primary color
Theme.backgroundColor; // Background color
Theme.fontFamily; // Font family
```

### Filler (Filler Values)

**Prefix**: `Filler.`

Global filler values from application:

```typescript
Filler.companyName; // Company name
Filler.appVersion; // App version
```

### SampleDataStore (Sample Data)

**Prefix**: `SampleDataStore.`

Sample data for development:

```typescript
SampleDataStore.users; // Sample users
SampleDataStore.products; // Sample products
```

## Token Value Extractors

Extractors resolve paths to values:

```typescript
interface TokenValueExtractor {
  getPrefix(): string; // Prefix (e.g., "Store.")
  getValueInternal(token: string): any; // Get value
}
```

### Available Extractors

1. **StoreExtractor**: `Store.` prefix
2. **PageStoreExtractor**: `Page.` prefix
3. **UrlDetailsExtractor**: `Url.` prefix
4. **LocalStoreExtractor**: `LocalStore.` prefix
5. **ThemeExtractor**: `Theme.` prefix
6. **FillerExtractor**: `Filler.` prefix
7. **ParentExtractor**: `Parent.` prefix (for nested components)

## Store Functions

### getData

Get data from a ComponentProperty:

```typescript
function getData<T>(
  prop: ComponentProperty<T> | undefined,
  locationHistory: Array<LocationHistory>,
  ...tve: Array<TokenValueExtractor>
): T | undefined;
```

Example:

```typescript
const text = getData(
  definition.properties.text,
  locationHistory,
  pageExtractor,
  urlExtractor
);
```

### getDataFromPath

Get data from a store path:

```typescript
function getDataFromPath(
  path: string | undefined,
  locationHistory: Array<LocationHistory>,
  ...tve: Array<TokenValueExtractor>
): any;
```

Example:

```typescript
const userName = getDataFromPath(
  "Store.user.name",
  locationHistory,
  storeExtractor
);
```

### setData

Set data in the store:

```typescript
function setData(
  path: string,
  value: any,
  context?: string,
  deleteKey?: boolean
): void;
```

Example:

```typescript
setData("Store.user.name", "John Doe");
setData("Page.currentItem", item, pageName);
```

### addListener

Add a reactive listener:

```typescript
function addListener(
  pageName: string | undefined,
  callback: (path: string, value: any) => void,
  ...path: Array<string>
): () => void; // Returns unsubscribe function
```

Example:

```typescript
useEffect(() => {
  return addListener(
    pageName,
    (path, value) => {
      console.log(`${path} changed to:`, value);
      // Update component
    },
    "Store.user.name",
    "Page.currentItem"
  );
}, []);
```

### addListenerAndCallImmediately

Add listener and call immediately with current value:

```typescript
function addListenerAndCallImmediately(
  pageName: string | undefined,
  callback: (path: string, value: any) => void,
  ...path: Array<string>
): () => void;
```

## PageStoreExtractor

Page-scoped data extractor:

```typescript
class PageStoreExtractor extends SpecialTokenValueExtractor {
  getPrefix(): string; // Returns "Page."

  // Resolves "Page.currentItem" to "Store.pageData.{pageName}.currentItem"
  getValueInternal(token: string): any;

  static getForContext(pageName: string): PageStoreExtractor;
}
```

Usage:

```typescript
const pageExtractor = PageStoreExtractor.getForContext("home");
const currentItem = getDataFromPath("Page.currentItem", [], pageExtractor);
// Resolves to: Store.pageData.home.currentItem
```

## UrlDetailsExtractor

URL parameter extractor:

```typescript
class UrlDetailsExtractor extends SpecialTokenValueExtractor {
  getPrefix(): string; // Returns "Url."

  // Resolves "Url.pageName" to "Store.urlData.{pageName}.pageName"
  getValueInternal(token: string): any;

  static getForContext(pageName: string): UrlDetailsExtractor;
  static addDetails(details: URLDetails): void;
}
```

Usage:

```typescript
const urlExtractor = UrlDetailsExtractor.getForContext("home");
const pageName = getDataFromPath("Url.pageName", [], urlExtractor);
// Resolves to: Store.urlData.home.pageName
```

## Parent Extractor

For nested components (ArrayRepeater, etc.):

```typescript
class ParentExtractor extends SpecialTokenValueExtractor {
  getPrefix(): string; // Returns "Parent."

  // Resolves "Parent.name" to parent component's data
  getValueInternal(token: string): any;
}
```

Usage in nested components:

```typescript
// In ArrayRepeater item
const parentName = getDataFromPath(
  "Parent.name",
  locationHistory,
  parentExtractor
);
```

## Location History

Tracks component nesting for parent access:

```typescript
interface LocationHistory {
  location: DataLocation | string;
  index: number | string;
  pageName: string;
  componentKey: string;
}
```

Example:

```typescript
// When rendering ArrayRepeater items
const locationHistory: LocationHistory[] = [
  {
    location: { type: "VALUE", value: "Store.items" },
    index: 0,
    pageName: "home",
    componentKey: "repeater-1",
  },
];
```

## Store Initialization

Store is initialized in `StoreContext.ts`:

```typescript
const storeInitialObject: any = {
    url: { appCode: urlAppCode, clientCode: urlClientCode }
};

if (globalThis.appDefinitionResponse) {
    storeInitialObject = { ...storeInitialObject, ...globalThis.appDefinitionResponse };
}

if (globalThis.pageDefinitionResponse) {
    storeInitialObject.pageDefinition = {
        [globalThis.pageDefinitionRequestPageName]: globalThis.pageDefinitionResponse,
    };
}

const { getData, setData, store, addListener, ... } = useStore(
    storeInitialObject,
    STORE_PREFIX,
    localStoreExtractor,
    themeExtractor,
    authoritiesExtractor,
    fillerExtractor,
    new StoreExtractor(sample, `${SAMPLE_STORE_PREFIX}.`),
);
```

## Device Detection

Device type is automatically detected and stored:

```typescript
Store.devices = {
  WIDE_SCREEN: true,
  DESKTOP_SCREEN: true,
  // ... based on window width
};

Store.window = {
  innerWidth: 1920,
  innerHeight: 1080,
  scrollY: 0,
  // ... window properties
};
```

## Real Examples

### Accessing Store Data

```typescript
// In component
const userName = getDataFromPath(
  "Store.user.name",
  locationHistory,
  storeExtractor
);
const currentPage = getDataFromPath(
  "Page.currentItem",
  locationHistory,
  pageExtractor
);
const urlParam = getDataFromPath("Url.id", locationHistory, urlExtractor);
```

### Setting Store Data

```typescript
// Set global data
setData("Store.user.name", "John Doe");

// Set page data
setData("Page.currentItem", item, pageName);

// Set URL data (via extractor)
UrlDetailsExtractor.addDetails({
  pageName: "home",
  queryParameters: { id: "123" },
});
```

### Reactive Listeners

```typescript
useEffect(() => {
  return addListener(
    pageName,
    (path, value) => {
      // React to changes
      setUserName(value);
    },
    "Store.user.name"
  );
}, []);
```

## Related Documents

- [04-property-system.md](04-property-system.md) - Property resolution
- [11-data-binding.md](11-data-binding.md) - Data binding
- [07-event-system.md](07-event-system.md) - Event system
