# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files for SSR
COPY ui-app/ssr/package*.json ./ssr/

# Install SSR dependencies
WORKDIR /app/ssr
RUN npm ci

# Copy SSR source code
COPY ui-app/ssr/ ./

# The SSR prebuild step runs scripts/copyShared.js, which copies the files SSR
# and the browser client must agree on (currently util/pageRouting.ts) out of
# the client tree at /app/client/src. That tree has to exist in the image even
# though only SSR is built here, or the build dies with ENOENT. Copying the
# whole util directory rather than the single file so that adding another entry
# to SHARED_FILES from it does not break this image again.
COPY ui-app/client/src/util/ /app/client/src/util/

# Build SSR application (TypeScript compilation)
RUN npm run build

# Stage 2: Production
FROM node:20-alpine AS production

WORKDIR /app

# Copy built SSR application
COPY --from=builder /app/ssr/dist ./dist
COPY --from=builder /app/ssr/node_modules ./node_modules
COPY --from=builder /app/ssr/package.json ./

# Copy asset manifest (generated from client build and downloaded from CDN in CI)
COPY ui-app/ssr/manifests ./manifests

# Create logs directory
RUN mkdir -p /logs

# Who gets the page drawn into #app when manifests/server-render/ is in the image: `all` anonymous
# visitors, only crawlers (`bots`, src/render/bots.ts) or `off`. The deploy workflow passes `bots`
# for dev and prod; stage keeps `all`. ssr.serverRender.for in the config server, or
# SERVER_RENDER_FOR on the container, overrides it without a new image.
ARG SERVER_RENDER_FOR_DEFAULT=all
ENV SERVER_RENDER_FOR_DEFAULT=${SERVER_RENDER_FOR_DEFAULT}

# Expose port
EXPOSE 3080

VOLUME [ "/logs" ]

# Environment variables with defaults
ENV NODE_ENV=production \
    SERVER_PORT=3080 \
    LOG_DIRECTORY=/logs \
    LOG_LEVEL=DEBUG \
    CLOUD_CONFIG_SERVER=config-server \
    CLOUD_CONFIG_SERVER_PORT=8888 \
    SPRING_PROFILE=default \
    INSTANCE_ID=default \
    INSTANCE_ENVIRONMENT=Local

# Health check - use node instead of wget
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3080/health', (r) => process.exit(r.statusCode === 200 ? 0 : 1)).on('error', () => process.exit(1))"

# Start the server
CMD ["node", "dist/server.js"]