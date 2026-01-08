import { createRootRoute, HeadContent, Outlet, createFileRoute, lazyRouteComponent, createRouter } from "@tanstack/react-router";
import { jsxs, jsx } from "react/jsx-runtime";
import { T as TSS_SERVER_FUNCTION, g as getServerFnById, c as createServerFn } from "../server.js";
const Route$1 = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" }
    ]
  }),
  component: RootComponent
});
function RootComponent() {
  return /* @__PURE__ */ jsxs("html", { lang: "en", children: [
    /* @__PURE__ */ jsx("head", { children: /* @__PURE__ */ jsx(HeadContent, {}) }),
    /* @__PURE__ */ jsx("body", { children: /* @__PURE__ */ jsx(Outlet, {}) })
  ] });
}
const createSsrRpc = (functionId, importer) => {
  const url = "/_serverFn/" + functionId;
  const fn = async (...args) => {
    const serverFn = await getServerFnById(functionId);
    return serverFn(...args);
  };
  return Object.assign(fn, {
    url,
    functionId,
    [TSS_SERVER_FUNCTION]: true
  });
};
const $$splitComponentImporter = () => import("./_-B-cxQrOd.js");
const getPageData = createServerFn().handler(createSsrRpc("05b41f6f8aa2632b11ea197ed3a3b6672085e9fcbafb9e30e264c1e0d5134c10"));
const Route = createFileRoute("/$")({
  loader: async () => {
    return getPageData();
  },
  head: ({
    loaderData
  }) => {
    if (!loaderData || "error" in loaderData) {
      return {
        meta: [{
          title: "Page Not Found"
        }]
      };
    }
    const {
      page,
      application
    } = loaderData;
    const pageTitle = page?.properties?.title?.name?.value || application?.properties?.title || "Modlix";
    const seo = page?.properties?.seo;
    return {
      meta: [
        {
          title: pageTitle
        },
        seo?.description?.value && {
          name: "description",
          content: seo.description.value
        },
        seo?.keywords?.value && {
          name: "keywords",
          content: seo.keywords.value
        },
        // Open Graph
        seo?.ogTitle?.value && {
          property: "og:title",
          content: seo.ogTitle.value
        },
        seo?.ogDescription?.value && {
          property: "og:description",
          content: seo.ogDescription.value
        },
        seo?.ogImage?.value && {
          property: "og:image",
          content: seo.ogImage.value
        }
      ].filter(Boolean)
    };
  },
  component: lazyRouteComponent($$splitComponentImporter, "component")
});
const SplatRoute = Route.update({
  id: "/$",
  path: "/$",
  getParentRoute: () => Route$1
});
const rootRouteChildren = {
  SplatRoute
};
const routeTree = Route$1._addFileChildren(rootRouteChildren)._addFileTypes();
function getRouter() {
  const router2 = createRouter({
    routeTree,
    defaultPreload: "intent",
    scrollRestoration: true
  });
  return router2;
}
const router = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  getRouter
}, Symbol.toStringTag, { value: "Module" }));
export {
  Route as R,
  router as r
};
