import { a as createServerRpc, c as createServerFn, b as getRequest, s as setResponseHeader } from "../server.js";
import Redis from "ioredis";
import { createHash } from "node:crypto";
import "@tanstack/history";
import "@tanstack/router-core/ssr/client";
import "@tanstack/router-core";
import "node:async_hooks";
import "@tanstack/router-core/ssr/server";
import "h3-v2";
import "tiny-invariant";
import "seroval";
import "react/jsx-runtime";
import "@tanstack/react-router/ssr/server";
import "@tanstack/react-router";
const REDIS_URL = process.env.REDIS_URL || "redis://:Kiran%40123@localhost:6379";
const CACHE_PREFIX = "ssr:";
let redisClient = null;
function getRedisClient() {
  if (!redisClient) {
    redisClient = new Redis(REDIS_URL, {
      lazyConnect: true,
      maxRetriesPerRequest: 3,
      retryStrategy: (times) => {
        if (times > 3) return null;
        return Math.min(times * 100, 3e3);
      }
    });
    redisClient.on("error", (err) => {
      console.error("Redis connection error:", err);
    });
    redisClient.on("connect", () => {
      console.log("Connected to Redis");
    });
  }
  return redisClient;
}
async function getCachedData(key) {
  try {
    const redis = getRedisClient();
    const data = await redis.get(`${CACHE_PREFIX}${key}`);
    if (!data) return null;
    return JSON.parse(data);
  } catch (error) {
    console.error("Redis get error:", error);
    return null;
  }
}
async function setCachedData(key, data, ttlSeconds = 1800) {
  try {
    const redis = getRedisClient();
    await redis.setex(`${CACHE_PREFIX}${key}`, ttlSeconds, JSON.stringify(data));
  } catch (error) {
    console.error("Redis set error:", error);
  }
}
function generateCacheKey(appCode, clientCode, pageName) {
  return `${appCode}:${clientCode}:${pageName}`;
}
const GATEWAY_URL$1 = process.env.GATEWAY_URL || "http://localhost:8080";
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
    const response = await fetch(
      `${GATEWAY_URL$1}/api/security/clients/internal/getClientNAppCode?scheme=${scheme}&host=${host}&port=${port}`
    );
    if (!response.ok) {
      console.warn(`Security service returned ${response.status}, using defaults`);
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
    console.error("Failed to resolve codes from security service:", error);
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
const GATEWAY_URL = process.env.GATEWAY_URL || "http://localhost:8080";
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
    const response = await fetch(`${GATEWAY_URL}${endpoint}`, { headers });
    if (!response.ok) {
      console.error(`API error ${response.status} for ${endpoint}`);
      return null;
    }
    return response.json();
  } catch (error) {
    console.error(`Failed to fetch ${endpoint}:`, error);
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
async function fetchStyles(options) {
  return fetchApi("/api/ui/styles", options);
}
async function fetchAllPageData(pageName, options) {
  const application = await fetchApplication(options);
  let actualPageName = pageName;
  if (pageName === "index" && application?.properties?.defaultPage) {
    actualPageName = application.properties.defaultPage;
  }
  const [page, theme, styles] = await Promise.all([
    fetchPage(actualPageName, options),
    fetchTheme(options),
    fetchStyles(options)
  ]);
  return { application, page, theme, styles, resolvedPageName: actualPageName };
}
function generateETag(data) {
  const content = JSON.stringify({
    app: data.application?.id,
    page: data.page?.id,
    pageName: data.pageName,
    cachedAt: data.cachedAt
  });
  return `"${createHash("md5").update(content).digest("hex").slice(0, 16)}"`;
}
function setCacheHeaders(isAuthenticated, fromCache, etag) {
  if (isAuthenticated) {
    setResponseHeader("Cache-Control", "private, no-cache, no-store, must-revalidate");
    setResponseHeader("Pragma", "no-cache");
    setResponseHeader("Expires", "0");
  } else {
    setResponseHeader("Cache-Control", "public, max-age=300, s-maxage=1800, stale-while-revalidate=3600");
    setResponseHeader("Vary", "Authorization, Cookie");
  }
  if (etag) {
    setResponseHeader("ETag", etag);
  }
  setResponseHeader("X-Cache-Status", fromCache ? "HIT" : "MISS");
}
const getPageData_createServerFn_handler = createServerRpc("05b41f6f8aa2632b11ea197ed3a3b6672085e9fcbafb9e30e264c1e0d5134c10", (opts, signal) => getPageData.__executeServer(opts, signal));
const getPageData = createServerFn().handler(getPageData_createServerFn_handler, async () => {
  const request = getRequest();
  const codes = await resolveCodesFromRequest(request);
  const urlPageName = extractPageName(new URL(request.url).pathname);
  const authToken = getAuthToken(request);
  const isAuthenticated = !!authToken;
  if (urlPageName !== "index" && !isAuthenticated) {
    const cacheKey2 = generateCacheKey(codes.appCode, codes.clientCode, urlPageName);
    const cached = await getCachedData(cacheKey2);
    if (cached) {
      const etag2 = generateETag(cached);
      setCacheHeaders(isAuthenticated, true, etag2);
      return {
        ...cached,
        fromCache: true,
        isAuthenticated
      };
    }
  }
  const data = await fetchAllPageData(urlPageName, {
    appCode: codes.appCode,
    clientCode: codes.clientCode,
    authToken
  });
  const actualPageName = data.resolvedPageName;
  if (urlPageName === "index" && !isAuthenticated) {
    const cacheKey2 = generateCacheKey(codes.appCode, codes.clientCode, actualPageName);
    const cached = await getCachedData(cacheKey2);
    if (cached) {
      const etag2 = generateETag(cached);
      setCacheHeaders(isAuthenticated, true, etag2);
      return {
        ...cached,
        fromCache: true,
        isAuthenticated
      };
    }
  }
  if (!data.application || !data.page) {
    setCacheHeaders(true, false);
    return {
      error: "Page not found",
      codes,
      pageName: actualPageName
    };
  }
  const result = {
    application: data.application,
    page: data.page,
    theme: data.theme,
    styles: data.styles,
    codes,
    pageName: actualPageName,
    cachedAt: Date.now()
  };
  const cacheKey = generateCacheKey(codes.appCode, codes.clientCode, actualPageName);
  if (!isAuthenticated) {
    await setCachedData(cacheKey, result, 1800);
  }
  const etag = generateETag(result);
  setCacheHeaders(isAuthenticated, false, etag);
  return {
    ...result,
    fromCache: false,
    isAuthenticated
  };
});
export {
  getPageData_createServerFn_handler
};
