# SSR Deployment Guide

This guide covers deploying the SSR service to development, staging, and production environments.

## Architecture Overview

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Nginx     │────▶│ SSR Service │────▶│   Gateway   │
│ (Reverse    │     │ (Port 3080) │     │ (Port 8080) │
│  Proxy)     │     └──────┬──────┘     └─────────────┘
└─────────────┘            │
                           ▼
                    ┌─────────────┐
                    │    Redis    │
                    │   (Cache)   │
                    └─────────────┘
```

## Deployment Environments

| Environment | Branch | Profile | CDN Domain |
|-------------|--------|---------|------------|
| Development | `oci-development` | `ocidev` | `cdn-dev.modlix.com` |
| Staging | `oci-stage` | `ocistage` | `cdn-stage.modlix.com` |
| Production | `oci-production` | `ociprod` | `cdn.modlix.com` |

## Prerequisites

1. **Docker Registry Access**: OCIR credentials configured
2. **Config Server**: Spring Cloud Config Server running
3. **Redis**: Redis instance accessible from deployment environment
4. **Gateway**: Backend gateway service running

## Building the Docker Image

### Manual Build

```bash
# From nocode-ui root directory
cd nocode-ui

# Build client bundle first (if not already built)
cd ui-app/client
npm ci
npm run cf-dev  # or cf-stage, cf-prod for respective environments
cd ..

# Build SSR Docker image
docker build -t ssr-server:latest -f ui-app/ssr/Dockerfile .
```

### CI/CD Build

The GitHub Actions workflows automatically build and push images:

- **Development**: `.github/workflows/ssr-dev-ci.yml`
- **Staging**: `.github/workflows/ssr-stage-ci.yml`
- **Production**: `.github/workflows/ssr-prod-ci.yml`

Workflows trigger on:
- Push to respective branch (`oci-development`, `oci-stage`, `oci-production`)
- Changes to `ui-app/ssr/**` or `ui-app/client/dist/**`
- Manual workflow dispatch

## Docker Image Registry

Images are pushed to Oracle Cloud Infrastructure Registry (OCIR):

```
ocir.us-ashburn-1.oci.oraclecloud.com/idfmutpuhiky/{env}-ssr-server:{tag}
```

| Environment | Image Name |
|-------------|------------|
| Development | `dev-ssr-server` |
| Staging | `stage-ssr-server` |
| Production | `prod-ssr-server` |

Tags:
- `latest`: Most recent build
- `{commit-sha}`: Specific version

## Configuration

### Environment Variables

Required environment variables for deployment:

```yaml
# Config Server (recommended)
CLOUD_CONFIG_SERVER: config-server
CLOUD_CONFIG_SERVER_PORT: '8888'
SPRING_PROFILE: ocidev  # ocidev, ocistage, ociprod

# Instance identification
INSTANCE_ID: blue  # or green, 1, 2, etc.
INSTANCE_ENVIRONMENT: Development  # Development, Stage, Production

# Direct configuration (overrides config server)
SERVER_PORT: '3080'
GATEWAY_URL: http://gateway:8080
REDIS_URL: redis://:password@redis:6379

# CDN configuration
CDN_HOST_NAME: cdn-dev.modlix.com  # Leave empty for local serving
CDN_STRIP_API_PREFIX: 'true'
CDN_REPLACE_PLUS: 'false'
CDN_RESIZE_OPTIONS_TYPE: 'none'

# Cache settings
CACHE_TTL_SECONDS: '1800'
CACHE_INVALIDATION_SECRET: 'secure-secret-here'
```

### Config Server Setup

Add SSR configuration to Spring Cloud Config Server repository:

**`ssr-ocidev.yml`** (Development):
```yaml
server:
  port: 3080

gateway:
  url: http://gateway:8080

redis:
  url: redis://:password@redis:6379

ui:
  cdnHostName: cdn-dev.modlix.com
  cdnStripAPIPrefix: true
  cdnReplacePlus: false
  cdnResizeOptionsType: none

ssr:
  cache:
    ttlSeconds: 1800
    invalidationSecret: ${SSR_CACHE_SECRET}
```

## Docker Compose Deployment

### Development Environment

```yaml
# docker-compose.yml
services:
  ssr-server-blue:
    container_name: ssr-server-blue
    image: ocir.us-ashburn-1.oci.oraclecloud.com/idfmutpuhiky/dev-ssr-server:latest
    pull_policy: always
    environment:
      CLOUD_CONFIG_SERVER: config-server
      CLOUD_CONFIG_SERVER_PORT: '8888'
      SPRING_PROFILE: ocidev
      INSTANCE_ID: blue
      INSTANCE_ENVIRONMENT: Development
      GATEWAY_URL: http://gateway:8080
      REDIS_URL: redis://:password@redis:6379
    ports:
      - '3080:3080'
    volumes:
      - '/var/log/apps/:/logs'
    healthcheck:
      test: ['CMD', 'wget', '--spider', '-q', 'http://localhost:3080/health']
      interval: 30s
      timeout: 10s
      retries: 3
    depends_on:
      config-server:
        condition: service_healthy
    restart: unless-stopped

  ssr-server-green:
    container_name: ssr-server-green
    image: ocir.us-ashburn-1.oci.oraclecloud.com/idfmutpuhiky/dev-ssr-server:latest
    pull_policy: always
    environment:
      CLOUD_CONFIG_SERVER: config-server
      CLOUD_CONFIG_SERVER_PORT: '8888'
      SPRING_PROFILE: ocidev
      INSTANCE_ID: green
      INSTANCE_ENVIRONMENT: Development
      GATEWAY_URL: http://gateway:8080
      REDIS_URL: redis://:password@redis:6379
    ports:
      - '3081:3080'
    volumes:
      - '/var/log/apps/:/logs'
    healthcheck:
      test: ['CMD', 'wget', '--spider', '-q', 'http://localhost:3080/health']
      interval: 30s
      timeout: 10s
      retries: 3
    depends_on:
      config-server:
        condition: service_healthy
    restart: unless-stopped
```

### Blue-Green Deployment

The SSR service supports blue-green deployments:

1. **Blue instance** runs on port 3080
2. **Green instance** runs on port 3081
3. Nginx routes traffic to active instance
4. Switch by updating Nginx upstream

## Nginx Configuration

### Upstream Definition

```nginx
upstream ssr_service {
    server ssr-server-blue:3080;
    # server ssr-server-green:3080;  # Uncomment to switch
    keepalive 32;
}
```

### Location Blocks

```nginx
# Static JS bundles - served from SSR service (client/dist)
location /js/dist/ {
    proxy_pass http://ssr_service;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_cache_valid 200 7d;
}

# All other routes - SSR rendering
location / {
    proxy_pass http://ssr_service;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_set_header X-Forwarded-Host $host;
    proxy_set_header X-Forwarded-Port $server_port;
    proxy_set_header Authorization $http_authorization;
    proxy_pass_header Set-Cookie;
}
```

## Health Checks

### Endpoint

```
GET /health
```

Response:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-07T12:00:00.000Z"
}
```

### Docker Health Check

```dockerfile
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3080/health || exit 1
```

## Cache Management

### Invalidation API

```bash
# Invalidate all pages for an application
curl -X POST http://ssr-server:3080/api/cache/invalidate \
  -H "Authorization: Bearer <secret>" \
  -H "Content-Type: application/json" \
  -d '{"appCode": "myapp"}'

# Invalidate specific client
curl -X POST http://ssr-server:3080/api/cache/invalidate \
  -H "Authorization: Bearer <secret>" \
  -H "Content-Type: application/json" \
  -d '{"appCode": "myapp", "clientCode": "SYSTEM"}'

# Invalidate specific page
curl -X POST http://ssr-server:3080/api/cache/invalidate \
  -H "Authorization: Bearer <secret>" \
  -H "Content-Type: application/json" \
  -d '{"appCode": "myapp", "clientCode": "SYSTEM", "pageName": "HomePage"}'
```

### Manual Redis Cache Clear

```bash
redis-cli -h redis-host -p 6379
> KEYS ssr:*
> DEL ssr:myapp:*
```

## Monitoring

### Logs

Logs are written to `/logs/` inside the container, mounted to `/var/log/apps/` on the host.

### Metrics

The health endpoint can be extended for Prometheus scraping:

```
GET /health
```

## Troubleshooting

### Container Won't Start

1. Check config server connectivity:
   ```bash
   curl http://config-server:8888/ssr/ocidev
   ```

2. Check Redis connectivity:
   ```bash
   redis-cli -h redis-host -p 6379 ping
   ```

3. Check gateway connectivity:
   ```bash
   curl http://gateway:8080/health
   ```

### SSR Returns Error Page

1. Check authentication headers are being forwarded
2. Verify gateway can serve page definitions
3. Check Redis cache for stale data

### Static Assets Not Loading

1. Verify client bundle is included in Docker image
2. Check Nginx routing for `/js/dist/`
3. Verify CDN configuration if using external CDN

### High Memory Usage

1. Check for memory leaks in SSR components
2. Monitor Redis cache size
3. Consider reducing cache TTL

## Rollback Procedure

### Using Blue-Green

1. Update Nginx to point to previous instance
2. Reload Nginx: `nginx -s reload`

### Using Docker Tags

```bash
# Pull specific version
docker pull ocir.us.../dev-ssr-server:abc123

# Update compose file or run directly
docker-compose up -d
```

## Security Considerations

1. **Cache Invalidation Secret**: Use strong, unique secrets per environment
2. **Redis Authentication**: Always use password-protected Redis
3. **Network Isolation**: SSR should only be accessible via Nginx
4. **Config Server**: Secure with authentication if exposing sensitive configs

## Performance Tuning

### Node.js Settings

```bash
# Increase memory limit if needed
NODE_OPTIONS="--max-old-space-size=4096"
```

### Redis Connection Pool

The SSR service uses connection pooling via ioredis with default settings. Adjust in `src/cache/redis.ts` if needed.

### Nginx Caching

Consider enabling Nginx proxy caching for SSR responses:

```nginx
proxy_cache_path /var/cache/nginx/ssr levels=1:2 keys_zone=ssr:10m max_size=1g;

location / {
    proxy_cache ssr;
    proxy_cache_valid 200 5m;
    proxy_cache_bypass $http_authorization;
    # ... other settings
}
```
