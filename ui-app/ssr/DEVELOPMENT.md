# SSR Development Guide

This guide covers setting up and running the SSR (Server-Side Rendering) service for local development.

## Overview

The SSR service provides server-side rendering for the Modlix no-code platform, enabling:
- Faster initial page loads (First Contentful Paint)
- SEO-friendly pages for search engine crawlers
- Hydration of pre-rendered HTML on the client

## Tech Stack

- **Runtime**: Node.js 20+
- **Framework**: TanStack Start (React Server Components + TanStack Router)
- **Build Tool**: Vite 7
- **Caching**: Redis (ioredis)
- **Language**: TypeScript

## Prerequisites

1. **Node.js 20+**: Install from [nodejs.org](https://nodejs.org/)
2. **Redis**: Local instance or Docker container
3. **Backend Services**: Gateway service running on port 8080
4. **Client Bundle**: Pre-built client bundle in `../client/dist/`

## Project Structure

```
ui-app/ssr/
├── src/
│   ├── api/           # Backend API client
│   │   └── client.ts  # Fetch functions for page/app data
│   ├── cache/         # Redis caching layer
│   │   └── redis.ts   # Cache operations
│   ├── config/        # Configuration loading
│   │   └── configLoader.ts  # Config server integration
│   ├── render/        # SSR rendering components
│   │   ├── components.tsx   # SSR component implementations
│   │   └── pageRenderer.tsx # Page rendering logic
│   ├── resolver/      # URL resolution
│   │   └── codeResolver.ts  # App/client code extraction
│   └── routes/        # TanStack Router routes
│       ├── __root.tsx # Root layout
│       └── $.tsx      # Catch-all route handler
├── Dockerfile         # Production container build
├── docker-compose.example.yml  # Deployment template
├── package.json
├── tsconfig.json
└── vite.config.ts     # Vite configuration
```

## Quick Start

### 1. Install Dependencies

```bash
cd ui-app/ssr
npm install
```

### 2. Build the Client Bundle

The SSR service needs the client bundle to serve static assets:

```bash
cd ../client
npm install
npm run build -- --env publicUrl=/js/dist/
```

### 3. Start Redis (if not running)

Using Docker:
```bash
docker run -d --name redis -p 6379:6379 redis:alpine
```

Or with password:
```bash
docker run -d --name redis -p 6379:6379 redis:alpine redis-server --requirepass "yourpassword"
```

### 4. Start the Gateway Service

Ensure the nocode-saas gateway is running on port 8080:
```bash
cd /path/to/nocode-saas
./runmvn.sh gateway
```

### 5. Start SSR Development Server

```bash
cd ui-app/ssr
npm run dev
```

The server will start on `http://localhost:3080`

## Configuration

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `SERVER_PORT` | `3080` | Port for SSR server |
| `GATEWAY_URL` | `http://localhost:8080` | Backend gateway URL |
| `REDIS_URL` | `redis://:Kiran%40123@localhost:6379` | Redis connection URL |
| `CDN_HOST_NAME` | (empty) | CDN hostname for static assets |
| `CDN_STRIP_API_PREFIX` | `true` | Strip API prefix from CDN URLs |
| `CDN_REPLACE_PLUS` | `false` | Replace + in URLs |
| `CDN_RESIZE_OPTIONS_TYPE` | `none` | Image resize options |
| `CACHE_TTL_SECONDS` | `1800` | Cache TTL (30 minutes) |
| `CACHE_INVALIDATION_SECRET` | `dev-secret` | Secret for cache invalidation API |

### Config Server Integration

For production environments, the SSR service can load configuration from Spring Cloud Config Server:

| Variable | Default | Description |
|----------|---------|-------------|
| `CLOUD_CONFIG_SERVER` | `localhost` | Config server hostname |
| `CLOUD_CONFIG_SERVER_PORT` | `8888` | Config server port |
| `SPRING_PROFILE` | `default` | Spring profile name |

## Development Workflow

### Making Changes

1. **SSR Components** (`src/render/components.tsx`):
   - Add new component renderers for SSR support
   - Match class names exactly with client components

2. **Routes** (`src/routes/$.tsx`):
   - Modify page rendering logic
   - Update critical CSS for new component types

3. **API Client** (`src/api/client.ts`):
   - Add new backend API calls
   - Update data fetching logic

### Testing Changes

1. **View Page Source**: Check SSR output by viewing page source in browser
2. **Network Tab**: Verify API calls and static asset loading
3. **Hydration**: Ensure no hydration mismatches in console

### Common Issues

#### "Hydration failed" errors
- Ensure SSR component output matches client exactly
- Check class names, attributes, and DOM structure

#### Table displaying vertically
- Critical CSS may be overriding table display
- Check `.comp` class doesn't have `display: block`

#### Static assets not loading
- Verify client bundle is built with correct `publicUrl`
- Check Nginx routing for `/js/dist/` path

## API Endpoints

### Health Check
```
GET /health
```
Returns server health status.

### Cache Invalidation
```
POST /api/cache/invalidate
Authorization: Bearer <CACHE_INVALIDATION_SECRET>
Content-Type: application/json

{
  "appCode": "myapp",
  "clientCode": "SYSTEM",  // optional
  "pageName": "HomePage"   // optional
}
```

## Debugging

### Enable Debug Logging

Set environment variable:
```bash
DEBUG=* npm run dev
```

### Check Redis Cache

```bash
redis-cli
> KEYS ssr:*
> GET ssr:appCode:clientCode:pageName
```

### View SSR Output

Use curl to see raw SSR HTML:
```bash
curl http://localhost:3080/your-page-path
```

## Integration with Nginx

For local development with the full stack, configure Nginx to route:
- `/js/dist/*` → SSR service (port 3080)
- `/api/*` → Gateway (port 8080)
- `/*` → SSR service (port 3080)

See `dbs/nginx/nginx/myconf.d/local.modlix.com.conf` for example configuration.

## Next Steps

- See [DEPLOYMENT.md](./DEPLOYMENT.md) for production deployment guide
- See main project README for architecture overview
