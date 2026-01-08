# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files for SSR
COPY ui-app/ssr/package*.json ./ssr/

# Copy client dist (pre-built client bundle)
# Note: Client must be built first with npm run cf-dev/cf-stage/cf-prod
# The build bundles @modlix/ui-components into the output files
COPY ui-app/client/dist/ ./client/dist/

# Install SSR dependencies
WORKDIR /app/ssr
RUN npm ci --only=production

# Copy SSR source code
COPY ui-app/ssr/ ./

# Build SSR application
RUN npm run build

# Stage 2: Production
FROM node:20-alpine AS production

WORKDIR /app

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Copy built SSR application
COPY --from=builder /app/ssr/dist ./dist
COPY --from=builder /app/ssr/node_modules ./node_modules
COPY --from=builder /app/ssr/package.json ./

# Copy client dist for serving static files
COPY --from=builder /app/client/dist ./client/dist

# Create logs directory and set ownership
RUN mkdir -p /logs && chown -R nodejs:nodejs /app /logs

USER nodejs

# Expose port
EXPOSE 3080

# Environment variables with defaults
# These can be overridden at runtime
ENV NODE_ENV=production \
    SERVER_PORT=3080 \
    # Config server settings (for Spring Cloud Config integration)
    CLOUD_CONFIG_SERVER=config-server \
    CLOUD_CONFIG_SERVER_PORT=8888 \
    SPRING_PROFILE=default \
    # Instance identification
    INSTANCE_ID=default \
    INSTANCE_ENVIRONMENT=Local

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3080/health || exit 1

# Start the server
CMD ["node", "dist/server/server.js"]
