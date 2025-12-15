# API Reference

## Overview

The nocode UI system communicates with backend APIs to fetch application and page definitions. All APIs use REST endpoints.

## Base URL

APIs are relative to the application base URL. In development, typically:

- `http://localhost:8080`
- Or configured via environment

## Authentication

### Headers

- `Authorization`: JWT token (if authenticated)
  - Format: `Bearer {token}` or just the token string
  - Stored in: `localStorage.getItem('AuthToken')`

### Token Management

- **Token Storage**: `localStorage.AuthToken`
- **Token Expiry**: `localStorage.AuthTokenExpiry`
- **Token Refresh**: Automatic refresh via `api/security/refreshToken`
- **Token Verification**: `api/security/verifyToken`

## Application Definition API

### GET /api/ui/application

Fetches application definition.

**Request Headers**:

```
Authorization: {token}
appCode: {appCode} (optional, from URL)
clientCode: {clientCode} (optional, from URL)
x-debug: {debugId} (optional, if debug mode)
```

**Response**:

```typescript
{
    name: string;
    appCode: string;
    clientCode: string;
    version: number;
    properties: {
        title?: string;
        defaultPage?: string;
        shellPage?: string;
        // ... other properties
    };
}
```

**Example**:

```typescript
const response = await axios.get("api/ui/application", {
  headers: {
    Authorization: JSON.parse(localStorage.getItem("AuthToken") || '""'),
  },
});
```

## Page Definition API

### GET /api/ui/page/{pageName}

Fetches page definition.

**Request Headers**:

```
Authorization: {token}
appCode: {appCode} (optional)
clientCode: {clientCode} (optional)
x-debug: {debugId} (optional)
```

**Path Parameters**:

- `pageName`: Page name to fetch

**Response**:

```typescript
{
    name: string;
    appCode: string;
    clientCode: string;
    version: number;
    rootComponent: string;
    componentDefinition: { ... };
    eventFunctions: { ... };
    translations: { ... };
    properties: { ... };
}
```

**Example**:

```typescript
const response = await axios.get(`api/ui/page/${pageName}`, {
  headers: {
    Authorization: JSON.parse(localStorage.getItem("AuthToken") || '""'),
  },
});
```

## Theme API

### GET /api/ui/theme

Fetches theme definition.

**Request Headers**:

```
Authorization: {token}
x-debug: {debugId} (optional)
```

**Response**:

```typescript
{
    variables: {
        [key: string]: string;
    };
}
```

## URL Details API

### GET /api/ui/urlDetails

Gets URL details (appCode, clientCode from URL).

**Response**:

```typescript
{
  appCode: string;
  clientCode: string;
}
```

## Authentication APIs

### GET /api/security/verifyToken

Verifies authentication token.

**Request Headers**:

```
Authorization: {token}
```

**Response**:

```typescript
{
  userId: string;
  localeCode: string;
  // ... other user data
}
```

### GET /api/security/refreshToken

Refreshes authentication token.

**Request Headers**:

```
Authorization: {token}
```

**Response**:

```typescript
{
  accessToken: string;
  accessTokenExpiryAt: string;
}
```

## Error Handling

### Error Responses

APIs return standard HTTP status codes:

- `200`: Success
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `500`: Server Error

### Error Format

```typescript
{
  error: string;
  message: string;
  statusCode: number;
}
```

## Request Examples

### Fetch Application

```typescript
const axiosConfig = { headers: {} };
const authToken = localStorage.getItem("AuthToken");

if (authToken) {
  axiosConfig.headers["Authorization"] = JSON.parse(authToken);
}

const response = await axios.get("api/ui/application", axiosConfig);
const application = response.data;
```

### Fetch Page

```typescript
const axiosConfig = { headers: {} };
const authToken = localStorage.getItem("AuthToken");

if (authToken) {
  axiosConfig.headers["Authorization"] = JSON.parse(authToken);
}

if (appCode) axiosConfig.headers["appCode"] = appCode;
if (clientCode) axiosConfig.headers["clientCode"] = clientCode;

const response = await axios.get(`api/ui/page/${pageName}`, axiosConfig);
const pageDefinition = response.data;
```

## Debug Mode

When `?debug` is in URL, requests include:

```
x-debug: {shortUUID()}
```

For full debug mode:

```
x-debug: full-{shortUUID()}
```

## Related Documents

- [02-application-and-page-definitions.md](02-application-and-page-definitions.md) - Definition structures
- [06-state-management.md](06-state-management.md) - Store system
