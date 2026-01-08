import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import Redis from "ioredis";
const LOG_LEVELS = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3
};
const config = {
  logDirectory: process.env.LOG_DIRECTORY || "/logs",
  logFileName: `ssr-${process.env.INSTANCE_ID || "default"}.log`,
  maxFileSizeMB: 50,
  enableFileLogging: process.env.NODE_ENV === "production",
  enableConsoleLogging: true,
  minLevel: process.env.LOG_LEVEL || "INFO"
};
let logStream = null;
let currentLogFile = "";
function initLogStream() {
  if (!config.enableFileLogging) return;
  try {
    if (!fs.existsSync(config.logDirectory)) {
      if (config.logDirectory === "/logs") {
        config.enableFileLogging = false;
        console.log("File logging disabled: /logs directory not available");
        return;
      }
      fs.mkdirSync(config.logDirectory, { recursive: true });
    }
    currentLogFile = path.join(config.logDirectory, config.logFileName);
    logStream = fs.createWriteStream(currentLogFile, { flags: "a" });
    logStream.on("error", (err) => {
      console.error("Log stream error:", err);
      config.enableFileLogging = false;
    });
  } catch (error) {
    console.error("Failed to initialize log stream:", error);
    config.enableFileLogging = false;
  }
}
function rotateLogIfNeeded() {
  if (!config.enableFileLogging || !currentLogFile) return;
  try {
    const stats = fs.statSync(currentLogFile);
    const fileSizeMB = stats.size / (1024 * 1024);
    if (fileSizeMB >= config.maxFileSizeMB) {
      if (logStream) {
        logStream.end();
      }
      const timestamp = (/* @__PURE__ */ new Date()).toISOString().replace(/[:.]/g, "-");
      const rotatedFile = currentLogFile.replace(".log", `-${timestamp}.log`);
      fs.renameSync(currentLogFile, rotatedFile);
      logStream = fs.createWriteStream(currentLogFile, { flags: "a" });
    }
  } catch {
  }
}
function formatMessage(level, message, meta) {
  const timestamp = (/* @__PURE__ */ new Date()).toISOString();
  const instanceId = process.env.INSTANCE_ID || "default";
  const environment = process.env.INSTANCE_ENVIRONMENT || "Local";
  let formattedMessage = `${timestamp} [${level}] [${environment}/${instanceId}] ${message}`;
  if (meta && Object.keys(meta).length > 0) {
    formattedMessage += ` ${JSON.stringify(meta)}`;
  }
  return formattedMessage;
}
function writeLog(level, message, meta) {
  if (LOG_LEVELS[level] < LOG_LEVELS[config.minLevel]) {
    return;
  }
  const formattedMessage = formatMessage(level, message, meta);
  {
    switch (level) {
      case "ERROR":
        console.error(formattedMessage);
        break;
      case "WARN":
        console.warn(formattedMessage);
        break;
      case "DEBUG":
        console.debug(formattedMessage);
        break;
      default:
        console.log(formattedMessage);
    }
  }
  if (config.enableFileLogging && logStream) {
    rotateLogIfNeeded();
    logStream.write(formattedMessage + "\n");
  }
}
initLogStream();
const logger = {
  debug: (message, meta) => writeLog("DEBUG", message, meta),
  info: (message, meta) => writeLog("INFO", message, meta),
  warn: (message, meta) => writeLog("WARN", message, meta),
  error: (message, meta) => writeLog("ERROR", message, meta),
  /**
   * Log an error with stack trace
   */
  errorWithStack: (message, error, meta) => {
    const errorMeta = {
      ...meta,
      errorMessage: error.message,
      stack: error.stack
    };
    writeLog("ERROR", message, errorMeta);
  },
  /**
   * Close log stream (for graceful shutdown)
   */
  close: () => {
    if (logStream) {
      logStream.end();
      logStream = null;
    }
  }
};
const defaultConfig = {
  configServer: {
    host: process.env.CLOUD_CONFIG_SERVER || "localhost",
    port: Number.parseInt(process.env.CLOUD_CONFIG_SERVER_PORT || "8888", 10),
    profile: process.env.SPRING_PROFILE || process.env.SPRING_PROFILES_ACTIVE || "default",
    appName: process.env.SSR_APP_NAME || "ssr"
  },
  server: {
    port: 3080
  },
  redis: {
    url: "redis://:Kiran%40123@localhost:6379"
  },
  gateway: {
    url: "http://localhost:8080"
  },
  cdn: {
    hostName: "",
    stripAPIPrefix: true,
    replacePlus: false,
    resizeOptionsType: "none"
  },
  cache: {
    ttlSeconds: 1800
    // 30 minutes
  }
};
let loadedConfig = null;
async function fetchFromConfigServer() {
  const { host, port, profile, appName } = defaultConfig.configServer;
  const url = `http://${host}:${port}/${appName}/${profile}`;
  logger.info("Fetching configuration from config server", { url });
  try {
    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json"
      },
      signal: AbortSignal.timeout(5e3)
      // 5 second timeout
    });
    if (!response.ok) {
      logger.warn("Config server returned error, using defaults", { status: response.status });
      return null;
    }
    const data = await response.json();
    const source = data.propertySources?.[0]?.source || {};
    return {
      server: {
        port: source["ssr.server.port"] || source["server.port"] || defaultConfig.server.port
      },
      redis: {
        url: source["ssr.redis.url"] || defaultConfig.redis.url
      },
      gateway: {
        url: source["ssr.gateway.url"] || source["gateway.url"] || defaultConfig.gateway.url
      },
      cdn: {
        hostName: source["ssr.cdn.hostName"] || source["ui.cdnHostName"] || defaultConfig.cdn.hostName,
        stripAPIPrefix: source["ssr.cdn.stripAPIPrefix"] ?? source["ui.cdnStripAPIPrefix"] ?? defaultConfig.cdn.stripAPIPrefix,
        replacePlus: source["ssr.cdn.replacePlus"] ?? source["ui.cdnReplacePlus"] ?? defaultConfig.cdn.replacePlus,
        resizeOptionsType: source["ssr.cdn.resizeOptionsType"] || source["ui.cdnResizeOptionsType"] || defaultConfig.cdn.resizeOptionsType
      },
      cache: {
        ttlSeconds: source["ssr.cache.ttlSeconds"] || defaultConfig.cache.ttlSeconds
      }
    };
  } catch (error) {
    logger.warn("Failed to fetch from config server, using defaults", { error: String(error) });
    return null;
  }
}
function loadFromEnvironment() {
  return {
    server: {
      port: process.env.SERVER_PORT ? Number.parseInt(process.env.SERVER_PORT, 10) : defaultConfig.server.port
    },
    redis: {
      url: process.env.REDIS_URL || defaultConfig.redis.url
    },
    gateway: {
      url: process.env.GATEWAY_URL || defaultConfig.gateway.url
    },
    cdn: {
      hostName: process.env.CDN_HOST_NAME || defaultConfig.cdn.hostName,
      stripAPIPrefix: process.env.CDN_STRIP_API_PREFIX === "true" || defaultConfig.cdn.stripAPIPrefix,
      replacePlus: process.env.CDN_REPLACE_PLUS === "true" || defaultConfig.cdn.replacePlus,
      resizeOptionsType: process.env.CDN_RESIZE_OPTIONS_TYPE || defaultConfig.cdn.resizeOptionsType
    },
    cache: {
      ttlSeconds: process.env.CACHE_TTL_SECONDS ? Number.parseInt(process.env.CACHE_TTL_SECONDS, 10) : defaultConfig.cache.ttlSeconds
    }
  };
}
function mergeConfigs(...configs) {
  const result = { ...defaultConfig };
  for (const config2 of configs) {
    if (!config2) continue;
    if (config2.configServer) {
      result.configServer = { ...result.configServer, ...config2.configServer };
    }
    if (config2.server) {
      result.server = { ...result.server, ...config2.server };
    }
    if (config2.redis) {
      result.redis = { ...result.redis, ...config2.redis };
    }
    if (config2.gateway) {
      result.gateway = { ...result.gateway, ...config2.gateway };
    }
    if (config2.cdn) {
      result.cdn = { ...result.cdn, ...config2.cdn };
    }
    if (config2.cache) {
      result.cache = { ...result.cache, ...config2.cache };
    }
  }
  return result;
}
async function loadConfig() {
  if (loadedConfig) {
    return loadedConfig;
  }
  logger.info("Loading SSR configuration...");
  logger.info("Config server settings", {
    host: defaultConfig.configServer.host,
    port: defaultConfig.configServer.port,
    profile: defaultConfig.configServer.profile,
    appName: defaultConfig.configServer.appName
  });
  const configServerConfig = await fetchFromConfigServer();
  const envConfig = loadFromEnvironment();
  loadedConfig = mergeConfigs(defaultConfig, configServerConfig, envConfig);
  logger.info("Configuration loaded", {
    serverPort: loadedConfig.server.port,
    gatewayUrl: loadedConfig.gateway.url,
    redisUrl: loadedConfig.redis.url ? "(configured)" : "(not configured)",
    cdnHostName: loadedConfig.cdn.hostName || "(none)",
    cdnStripAPIPrefix: loadedConfig.cdn.stripAPIPrefix,
    cdnReplacePlus: loadedConfig.cdn.replacePlus,
    cdnResizeOptionsType: loadedConfig.cdn.resizeOptionsType,
    cacheTtlSeconds: loadedConfig.cache.ttlSeconds
  });
  return loadedConfig;
}
function getConfig() {
  if (!loadedConfig) {
    throw new Error("Configuration not loaded. Call loadConfig() first.");
  }
  return loadedConfig;
}
const CACHE_PREFIX = "ssr:";
const SSR_CACHE_INVALIDATION_CHANNEL = "ssr:cache:invalidation";
let redisClient = null;
let subscriberClient = null;
function getRedisUrl() {
  try {
    return getConfig().redis.url;
  } catch {
    return process.env.REDIS_URL || "redis://:Kiran%40123@localhost:6379";
  }
}
function getRedisClient() {
  if (!redisClient) {
    const redisUrl = getRedisUrl();
    redisClient = new Redis(redisUrl, {
      lazyConnect: true,
      maxRetriesPerRequest: 3,
      retryStrategy: (times) => {
        if (times > 3) return null;
        return Math.min(times * 100, 3e3);
      }
    });
    redisClient.on("error", (err) => {
      logger.error("Redis connection error", { error: String(err) });
    });
    redisClient.on("connect", () => {
      logger.info("Connected to Redis");
    });
  }
  return redisClient;
}
async function initCacheInvalidationSubscriber() {
  if (subscriberClient) {
    logger.info("Cache invalidation subscriber already initialized");
    return;
  }
  const redisUrl = getRedisUrl();
  subscriberClient = new Redis(redisUrl, {
    maxRetriesPerRequest: 3,
    retryStrategy: (times) => {
      if (times > 3) return null;
      return Math.min(times * 100, 3e3);
    }
  });
  subscriberClient.on("error", (err) => {
    logger.error("Redis subscriber connection error", { error: String(err) });
  });
  subscriberClient.on("connect", () => {
    logger.info("Redis subscriber connected");
  });
  await subscriberClient.subscribe(SSR_CACHE_INVALIDATION_CHANNEL);
  logger.info("Subscribed to cache invalidation channel", { channel: SSR_CACHE_INVALIDATION_CHANNEL });
  subscriberClient.on("message", async (channel, message) => {
    if (channel !== SSR_CACHE_INVALIDATION_CHANNEL) return;
    try {
      const data = JSON.parse(message);
      logger.info("Received cache invalidation message", {
        appCode: data.appCode,
        clientCode: data.clientCode,
        pageName: data.pageName
      });
      let pattern;
      if (data.pageName && data.clientCode) {
        pattern = `${data.appCode}:${data.clientCode}:${data.pageName}`;
      } else if (data.clientCode) {
        pattern = `${data.appCode}:${data.clientCode}:*`;
      } else if (data.pageName) {
        pattern = `${data.appCode}:*:${data.pageName}`;
      } else {
        pattern = `${data.appCode}:*`;
      }
      const invalidated = await invalidateCache(pattern);
      logger.info("Cache invalidated", { pattern, keysRemoved: invalidated });
    } catch (error) {
      logger.error("Error processing cache invalidation message", { error: String(error) });
    }
  });
}
async function getCachedData(key) {
  try {
    const redis = getRedisClient();
    const data = await redis.get(`${CACHE_PREFIX}${key}`);
    if (!data) return null;
    return JSON.parse(data);
  } catch (error) {
    logger.error("Redis get error", { key, error: String(error) });
    return null;
  }
}
async function setCachedData(key, data, ttlSeconds = 1800) {
  try {
    const redis = getRedisClient();
    await redis.setex(`${CACHE_PREFIX}${key}`, ttlSeconds, JSON.stringify(data));
  } catch (error) {
    logger.error("Redis set error", { key, ttlSeconds, error: String(error) });
  }
}
async function invalidateCache(pattern) {
  try {
    const redis = getRedisClient();
    const keys = await redis.keys(`${CACHE_PREFIX}${pattern}`);
    if (keys.length === 0) return 0;
    return await redis.del(...keys);
  } catch (error) {
    logger.error("Redis invalidate error", { pattern, error: String(error) });
    return 0;
  }
}
function generateCacheKey(appCode, clientCode, pageName) {
  return `${appCode}:${clientCode}:${pageName}`;
}
function getGatewayUrl$1() {
  try {
    return getConfig().gateway.url;
  } catch {
    return process.env.GATEWAY_URL || "http://localhost:8080";
  }
}
const DEFAULT_CLIENT = "SYSTEM";
const DEFAULT_APP = "nothing";
async function resolveCodesFromRequest(request) {
  const url = new URL(request.url);
  const pathParts = url.pathname.split("/").filter(Boolean);
  const pageIndex = pathParts.indexOf("page");
  if (pageIndex >= 2) {
    return {
      clientCode: pathParts[0],
      appCode: pathParts[1]
    };
  }
  const scheme = request.headers.get("x-forwarded-proto") || url.protocol.replace(":", "");
  const host = request.headers.get("x-forwarded-host") || url.hostname;
  const port = request.headers.get("x-forwarded-port") || url.port || (scheme === "https" ? "443" : "80");
  return resolveFromSecurityService(scheme, host, port);
}
async function resolveFromSecurityService(scheme, host, port) {
  const cacheKey = `resolver:${scheme}:${host}:${port}`;
  try {
    const redis = getRedisClient();
    const cached = await redis.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }
    const gatewayUrl = getGatewayUrl$1();
    const response = await fetch(
      `${gatewayUrl}/api/security/clients/internal/getClientNAppCode?scheme=${scheme}&host=${host}&port=${port}`
    );
    if (!response.ok) {
      logger.warn("Security service returned error, using defaults", { status: response.status });
      return { clientCode: DEFAULT_CLIENT, appCode: DEFAULT_APP };
    }
    const data = await response.json();
    const codes = {
      clientCode: Array.isArray(data) ? data[0] : data.clientCode || DEFAULT_CLIENT,
      appCode: Array.isArray(data) ? data[1] : data.appCode || DEFAULT_APP
    };
    await redis.setex(cacheKey, 600, JSON.stringify(codes));
    return codes;
  } catch (error) {
    logger.error("Failed to resolve codes from security service", { error: String(error) });
    return { clientCode: DEFAULT_CLIENT, appCode: DEFAULT_APP };
  }
}
function extractPageName(pathname) {
  const pathParts = pathname.split("/").filter(Boolean);
  const pageIndex = pathParts.indexOf("page");
  if (pageIndex !== -1 && pageIndex + 1 < pathParts.length) {
    return pathParts.slice(pageIndex + 1).join("/");
  }
  return pathParts[0] || "index";
}
function getAuthToken(request) {
  const authHeader = request.headers.get("Authorization");
  if (authHeader) return authHeader;
  const cookies = request.headers.get("Cookie");
  if (cookies) {
    const match = cookies.match(/AuthToken=([^;]+)/);
    if (match) return match[1];
  }
  return null;
}
function getGatewayUrl() {
  try {
    return getConfig().gateway.url;
  } catch {
    return process.env.GATEWAY_URL || "http://localhost:8080";
  }
}
async function fetchApi(endpoint, options) {
  const headers = {
    "Content-Type": "application/json",
    appCode: options.appCode,
    clientCode: options.clientCode
  };
  if (options.authToken) {
    headers["Authorization"] = options.authToken;
  }
  try {
    const gatewayUrl = getGatewayUrl();
    const response = await fetch(`${gatewayUrl}${endpoint}`, { headers });
    if (!response.ok) {
      logger.error("API error", { status: response.status, endpoint });
      return null;
    }
    return response.json();
  } catch (error) {
    logger.error("Failed to fetch endpoint", { endpoint, error: String(error) });
    return null;
  }
}
async function fetchApplication(options) {
  return fetchApi("/api/ui/application", options);
}
async function fetchPage(pageName, options) {
  return fetchApi(`/api/ui/page/${encodeURIComponent(pageName)}`, options);
}
async function fetchTheme(options) {
  return fetchApi("/api/ui/theme", options);
}
async function fetchAllPageData(pageName, options) {
  const application = await fetchApplication(options);
  let actualPageName = pageName;
  if (pageName === "index" && application?.properties?.defaultPage) {
    actualPageName = application.properties.defaultPage;
  }
  const [page, theme] = await Promise.all([
    fetchPage(actualPageName, options),
    fetchTheme(options)
  ]);
  return { application, page, theme, resolvedPageName: actualPageName };
}
function createRequestFromIncoming(req) {
  const protocol = req.headers["x-forwarded-proto"] || "http";
  const host = req.headers["x-forwarded-host"] || req.headers.host || "localhost";
  const url = `${protocol}://${host}${req.url || "/"}`;
  const headers = new Headers();
  for (const [key, value] of Object.entries(req.headers)) {
    if (value) {
      headers.set(key, Array.isArray(value) ? value.join(", ") : value);
    }
  }
  return new Request(url, {
    method: req.method || "GET",
    headers
  });
}
function getCdnConfig() {
  try {
    const config2 = getConfig();
    return {
      hostName: config2.cdn.hostName || "",
      stripAPIPrefix: config2.cdn.stripAPIPrefix,
      replacePlus: config2.cdn.replacePlus,
      resizeOptionsType: config2.cdn.resizeOptionsType || ""
    };
  } catch {
    return {
      hostName: "",
      stripAPIPrefix: true,
      replacePlus: false,
      resizeOptionsType: ""
    };
  }
}
function generateHtml(pageData) {
  const { application, page, theme, resolvedPageName, appCode, clientCode } = pageData;
  const appProps = application?.properties || {};
  const pageProps = page?.properties || {};
  let title = appProps.title || "Loading...";
  if (pageProps.title?.name?.value) {
    if (pageProps.title?.append?.value) {
      title = `${pageProps.title.name.value} - ${title}`;
    } else {
      title = pageProps.title.name.value;
    }
  }
  const metaTags = [];
  const seo = pageProps.seo;
  if (seo?.description?.value) {
    metaTags.push(
      `<meta name="description" content="${escapeHtml(seo.description.value)}">`
    );
  }
  if (seo?.keywords?.value) {
    metaTags.push(`<meta name="keywords" content="${escapeHtml(seo.keywords.value)}">`);
  }
  if (seo?.ogTitle?.value) {
    metaTags.push(
      `<meta property="og:title" content="${escapeHtml(seo.ogTitle.value)}">`
    );
  }
  if (seo?.ogDescription?.value) {
    metaTags.push(
      `<meta property="og:description" content="${escapeHtml(seo.ogDescription.value)}">`
    );
  }
  if (seo?.ogImage?.value) {
    metaTags.push(
      `<meta property="og:image" content="${escapeHtml(seo.ogImage.value)}">`
    );
  }
  if (appProps.metas && Array.isArray(appProps.metas)) {
    for (const meta of appProps.metas) {
      if (meta.name && meta.content) {
        metaTags.push(
          `<meta name="${escapeHtml(meta.name)}" content="${escapeHtml(meta.content)}">`
        );
      }
    }
  }
  const cdn = getCdnConfig();
  const jsPath = cdn.hostName ? `https://${cdn.hostName}/js/dist` : "/js/dist";
  const bootstrapData = {
    application,
    pageDefinition: { [resolvedPageName]: page },
    theme,
    styles: null,
    // Styles are loaded via api/ui/style
    urlDetails: {
      pageName: resolvedPageName,
      appCode,
      clientCode
    }
  };
  const globalVars = [
    "globalThis.nodeDev = true;",
    `window.__APP_BOOTSTRAP__ = ${JSON.stringify(bootstrapData)};`
  ];
  if (cdn.hostName) {
    globalVars.push(`globalThis.cdnPrefix = '${cdn.hostName}';`);
    globalVars.push(`globalThis.cdnStripAPIPrefix = ${cdn.stripAPIPrefix};`);
    globalVars.push(`globalThis.cdnReplacePlus = ${cdn.replacePlus};`);
    if (cdn.resizeOptionsType) {
      globalVars.push(`globalThis.cdnResizeOptionsType = '${cdn.resizeOptionsType}';`);
    }
  }
  if (appCode) {
    globalVars.push(`globalThis.domainAppCode = '${appCode}';`);
  }
  if (clientCode) {
    globalVars.push(`globalThis.domainClientCode = '${clientCode}';`);
  }
  globalVars.push(
    `globalThis.__LOCAL_STATIC_PREFIX__ = ${cdn.hostName ? "null" : "'/js/dist'"};`
  );
  const loaderStyles = `@keyframes loaderAnimation {
	0% { background-position: 0% 0%; }
	50% { background-position: 90% 0%; }
	100% { background-position: 0% 0%; }
}`;
  const loaderDiv = `<div style="position: fixed; top: 0px; left: 0px; width: 100%; height: 3px; opacity: 0.5; background: linear-gradient(90deg, rgba(36, 36, 36, 1) 0%, rgba(117, 117, 117, 1) 20%, rgba(144, 144, 144, 1) 40%, rgba(175, 175, 175, 1) 60%, rgba(36, 36, 36, 1) 80%, rgba(117, 117, 112, 1) 100%); display: block; animation: loaderAnimation 1s ease-in-out infinite; background-size: 200%;"></div>`;
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <script>${globalVars.join("\n        ")}<\/script>
    <title>${escapeHtml(title)}</title>
    ${metaTags.join("\n    ")}
    <script defer src="${jsPath}/vendors.js"><\/script>
    <script defer src="${jsPath}/index.js"><\/script>
</head>
<body>
    <div id="app">
        <style>${loaderStyles}</style>
        ${loaderDiv}
    </div>
    <link rel="stylesheet" id="serviceStyle">
    <script>document.getElementById('serviceStyle').setAttribute('href', 'api/ui/style');<\/script>
</body>
</html>`;
}
function escapeHtml(text) {
  if (text === null || text === void 0) {
    return "";
  }
  let str;
  if (typeof text === "string") {
    str = text;
  } else if (typeof text === "number" || typeof text === "boolean") {
    str = String(text);
  } else {
    return "";
  }
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}
function generateFallbackHtml() {
  const cdn = getCdnConfig();
  const jsPath = cdn.hostName ? `https://${cdn.hostName}/js/dist` : "/js/dist";
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <script>globalThis.nodeDev = true;<\/script>
    <title>Loading...</title>
    <script defer src="${jsPath}/vendors.js"><\/script>
    <script defer src="${jsPath}/index.js"><\/script>
</head>
<body>
    <div id="app"></div>
    <link rel="stylesheet" id="serviceStyle">
    <script>document.getElementById('serviceStyle').setAttribute('href', 'api/ui/style');<\/script>
</body>
</html>`;
}
async function renderPage(req) {
  const startTime = Date.now();
  try {
    const request = createRequestFromIncoming(req);
    const url = new URL(request.url);
    const codes = await resolveCodesFromRequest(request);
    const pageName = extractPageName(url.pathname);
    const authToken = getAuthToken(request);
    logger.debug("Rendering page", {
      pageName,
      appCode: codes.appCode,
      clientCode: codes.clientCode,
      hasAuth: !!authToken
    });
    let pageData = null;
    const cacheKey = generateCacheKey(codes.appCode, codes.clientCode, pageName);
    if (!authToken) {
      pageData = await getCachedData(cacheKey);
      if (pageData) {
        logger.debug("Cache hit", { cacheKey });
      }
    }
    if (!pageData) {
      const fetchOptions = {
        appCode: codes.appCode,
        clientCode: codes.clientCode,
        authToken
      };
      const { application, page, theme, resolvedPageName } = await fetchAllPageData(
        pageName,
        fetchOptions
      );
      pageData = {
        application,
        page,
        theme,
        resolvedPageName,
        appCode: codes.appCode,
        clientCode: codes.clientCode,
        cachedAt: Date.now()
      };
      if (!authToken) {
        try {
          const config2 = getConfig();
          await setCachedData(cacheKey, pageData, config2.cache.ttlSeconds);
          logger.debug("Cached page data", { cacheKey, ttl: config2.cache.ttlSeconds });
        } catch {
        }
      }
    }
    const html = generateHtml(pageData);
    const duration = Date.now() - startTime;
    logger.info("Page rendered", {
      pageName: pageData.resolvedPageName,
      appCode: codes.appCode,
      clientCode: codes.clientCode,
      durationMs: duration,
      cached: pageData.cachedAt < startTime
    });
    return html;
  } catch (error) {
    logger.error("Error rendering page", { error: String(error), url: req.url });
    return generateFallbackHtml();
  }
}
const __filename$1 = fileURLToPath(import.meta.url);
const __dirname$1 = path.dirname(__filename$1);
const clientDistPath = path.resolve(__dirname$1, "../../client/dist");
const CONTENT_TYPES = {
  ".js": "application/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".html": "text/html",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
  ".eot": "application/vnd.ms-fontobject",
  ".ico": "image/x-icon"
};
function serveStaticFile(res, filePath) {
  try {
    if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
      return false;
    }
    const ext = path.extname(filePath).toLowerCase();
    const contentType = CONTENT_TYPES[ext] || "application/octet-stream";
    res.setHeader("Content-Type", contentType);
    res.setHeader("Cache-Control", "public, max-age=31536000");
    res.statusCode = 200;
    fs.createReadStream(filePath).pipe(res);
    return true;
  } catch {
    return false;
  }
}
async function handleRequest(req, res) {
  const url = req.url || "/";
  if (req.method === "GET" && url === "/health") {
    res.setHeader("Content-Type", "application/json");
    res.statusCode = 200;
    res.end(JSON.stringify({ status: "healthy", timestamp: (/* @__PURE__ */ new Date()).toISOString() }));
    return;
  }
  if (url.startsWith("/js/dist/")) {
    const relativePath = url.replace("/js/dist/", "").split("?")[0];
    const filePath = path.join(clientDistPath, relativePath);
    if (serveStaticFile(res, filePath)) {
      return;
    }
  }
  const urlPath = url.split("?")[0];
  if (urlPath.includes(".") && !urlPath.endsWith("/")) {
    res.statusCode = 404;
    res.end("Not Found");
    return;
  }
  try {
    const html = await renderPage(req);
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.statusCode = 200;
    res.end(html);
  } catch (error) {
    logger.error("SSR render error", { error: String(error), url });
    res.statusCode = 500;
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.end(`<!DOCTYPE html>
<html>
<head><title>Error</title></head>
<body>
<div id="app"></div>
<script src="/js/dist/vendors.js"><\/script>
<script src="/js/dist/index.js"><\/script>
</body>
</html>`);
  }
}
async function startServer() {
  try {
    await loadConfig();
    await initCacheInvalidationSubscriber();
    const config2 = getConfig();
    const port = config2.server.port;
    const server = http.createServer(handleRequest);
    server.listen(port, "0.0.0.0", () => {
      logger.info("SSR server started", { port, environment: process.env.INSTANCE_ENVIRONMENT || "Local" });
    });
    const shutdown = () => {
      logger.info("Shutting down SSR server...");
      server.close(() => {
        logger.info("SSR server stopped");
        process.exit(0);
      });
    };
    process.on("SIGTERM", shutdown);
    process.on("SIGINT", shutdown);
  } catch (error) {
    logger.error("Failed to start SSR server", { error: String(error) });
    process.exit(1);
  }
}
startServer();
