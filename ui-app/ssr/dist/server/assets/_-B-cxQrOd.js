import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import { R as Route } from "./router-wCTnV4Zh.js";
import "@tanstack/react-router";
import "../server.js";
import "@tanstack/history";
import "@tanstack/router-core/ssr/client";
import "@tanstack/router-core";
import "node:async_hooks";
import "@tanstack/router-core/ssr/server";
import "h3-v2";
import "tiny-invariant";
import "seroval";
import "@tanstack/react-router/ssr/server";
function resolveValue(prop, defaultValue) {
  if (!prop) return defaultValue;
  if (prop.value !== void 0) return prop.value;
  return defaultValue;
}
function getProp(props, key) {
  if (!props) return void 0;
  return props[key];
}
function resolveThemeColor(prop, theme) {
  if (!prop) return void 0;
  if (prop.value) return prop.value;
  if (prop.location?.expression?.startsWith("Theme.")) {
    const colorName = prop.location.expression.replace("Theme.", "");
    return theme?.ALL?.[colorName];
  }
  return void 0;
}
function resolveStyles(styleProperties, theme) {
  if (!styleProperties) return {};
  const styles = {};
  for (const [, styleValue] of Object.entries(styleProperties)) {
    const styleObj = styleValue;
    const allStyles = styleObj?.resolutions?.ALL;
    if (!allStyles) continue;
    for (const [cssKey, cssValue] of Object.entries(allStyles)) {
      if (!cssValue) continue;
      const prop = cssValue;
      if (prop.location?.expression?.startsWith("Theme.")) {
        const themeValue = resolveThemeColor(prop, theme);
        if (themeValue) {
          styles[cssKey] = themeValue;
        }
      } else if (prop.value !== void 0) {
        styles[cssKey] = String(prop.value);
      }
    }
  }
  return styles;
}
function SSRGrid({ definition, context, children }) {
  const styles = resolveStyles(definition.styleProperties, context.theme);
  const layout = resolveValue(getProp(definition.properties, "layout"), "SINGLECOLUMNLAYOUT");
  return /* @__PURE__ */ jsx(
    "div",
    {
      className: `comp compGrid _noAnchorGrid _${layout}`,
      id: definition.key,
      style: styles,
      children
    }
  );
}
function SSRText({ definition, context }) {
  const text = resolveValue(getProp(definition.properties, "text"), "");
  const styles = resolveStyles(definition.styleProperties, context.theme);
  const textType = resolveValue(getProp(definition.properties, "textType"), "span");
  const textContainer = resolveValue(getProp(definition.properties, "textContainer"), "");
  const Tag = textType === "h1" ? "h1" : textType === "h2" ? "h2" : textType === "h3" ? "h3" : textType === "h4" ? "h4" : textType === "h5" ? "h5" : textType === "h6" ? "h6" : textType === "p" ? "p" : "span";
  return /* @__PURE__ */ jsx(
    Tag,
    {
      className: `comp compText ${textContainer}`,
      id: definition.key,
      style: styles,
      children: text
    }
  );
}
function SSRImage({ definition, context }) {
  const src = resolveValue(getProp(definition.properties, "src"), "");
  const alt = resolveValue(getProp(definition.properties, "alt"), "");
  const styles = resolveStyles(definition.styleProperties, context.theme);
  if (!src) return null;
  return /* @__PURE__ */ jsx(
    "img",
    {
      className: "comp compImage",
      id: definition.key,
      src,
      alt,
      style: styles,
      loading: "lazy"
    }
  );
}
function SSRIcon({ definition, context }) {
  const icon = resolveValue(getProp(definition.properties, "icon"), "");
  const styles = resolveStyles(definition.styleProperties, context.theme);
  return /* @__PURE__ */ jsx(
    "i",
    {
      className: `comp compIcon ${icon}`,
      id: definition.key,
      style: styles
    }
  );
}
function SSRButton({ definition, context, children }) {
  const label = resolveValue(getProp(definition.properties, "label"), "");
  const styles = resolveStyles(definition.styleProperties, context.theme);
  const designType = resolveValue(getProp(definition.properties, "designType"), "");
  const colorScheme = resolveValue(getProp(definition.properties, "colorScheme"), "");
  return /* @__PURE__ */ jsx(
    "button",
    {
      className: `comp compButton ${designType} ${colorScheme}`,
      id: definition.key,
      style: styles,
      type: "button",
      children: label || children
    }
  );
}
function SSRLink({ definition, context, children }) {
  const href = resolveValue(getProp(definition.properties, "linkPath"), "#");
  const target = resolveValue(getProp(definition.properties, "target"), "_self");
  const styles = resolveStyles(definition.styleProperties, context.theme);
  return /* @__PURE__ */ jsx(
    "a",
    {
      className: "comp compLink",
      id: definition.key,
      href,
      target,
      style: styles,
      children
    }
  );
}
function SSRTextBox({ definition, context }) {
  const placeholder = resolveValue(getProp(definition.properties, "placeholder"), "");
  const styles = resolveStyles(definition.styleProperties, context.theme);
  const designType = resolveValue(getProp(definition.properties, "designType"), "");
  const colorScheme = resolveValue(getProp(definition.properties, "colorScheme"), "");
  return /* @__PURE__ */ jsx(
    "div",
    {
      className: `comp compTextBox ${designType} ${colorScheme}`,
      id: definition.key,
      style: styles,
      children: /* @__PURE__ */ jsx(
        "input",
        {
          type: "text",
          placeholder,
          disabled: true,
          readOnly: true
        }
      )
    }
  );
}
function SSRIframe({ definition, context }) {
  const src = resolveValue(getProp(definition.properties, "src"), "");
  const styles = resolveStyles(definition.styleProperties, context.theme);
  if (!src) return null;
  return /* @__PURE__ */ jsx(
    "iframe",
    {
      className: "comp compIframe",
      id: definition.key,
      src,
      style: styles,
      loading: "lazy"
    }
  );
}
function SSRArrayRepeater({ definition, context, children }) {
  const styles = resolveStyles(definition.styleProperties, context.theme);
  return /* @__PURE__ */ jsx(
    "div",
    {
      className: "comp compArrayRepeater",
      id: definition.key,
      style: styles,
      children
    }
  );
}
function SSRTabs({ definition, context, children }) {
  const styles = resolveStyles(definition.styleProperties, context.theme);
  const tabsOrientation = resolveValue(getProp(definition.properties, "tabsOrientation"), "");
  const designType = resolveValue(getProp(definition.properties, "designType"), "");
  const colorScheme = resolveValue(getProp(definition.properties, "colorScheme"), "");
  return /* @__PURE__ */ jsx(
    "div",
    {
      className: `comp compTabs ${tabsOrientation} ${designType} ${colorScheme}`,
      id: definition.key,
      style: styles,
      children
    }
  );
}
function SSRClientOnly({ definition }) {
  const componentType = definition.type;
  return /* @__PURE__ */ jsx(
    "div",
    {
      className: `comp comp${componentType}`,
      id: definition.key,
      "data-ssr-placeholder": "true"
    }
  );
}
function SSRGeneric({ definition, context, children }) {
  const styles = resolveStyles(definition.styleProperties, context.theme);
  return /* @__PURE__ */ jsx(
    "div",
    {
      className: `comp comp${definition.type}`,
      id: definition.key,
      style: styles,
      children
    }
  );
}
function SSRSectionGrid({ definition, context, children }) {
  const styles = resolveStyles(definition.styleProperties, context.theme);
  const layout = resolveValue(getProp(definition.properties, "layout"), "SINGLECOLUMNLAYOUT");
  return /* @__PURE__ */ jsx(
    "div",
    {
      className: `comp compSectionGrid _noAnchorGrid _${layout}`,
      id: definition.key,
      style: styles,
      children
    }
  );
}
const SSRComponents = {
  // Layout
  Grid: SSRGrid,
  SectionGrid: SSRSectionGrid,
  // Content
  Text: SSRText,
  Image: SSRImage,
  Icon: SSRIcon,
  Link: SSRLink,
  Iframe: SSRIframe,
  // Interactive (rendered but disabled)
  Button: SSRButton,
  TextBox: SSRTextBox,
  // Data components
  ArrayRepeater: SSRArrayRepeater,
  Tabs: SSRTabs,
  // Table components - rendered as client-only since they require data bindings
  // The structure is too complex to render without the runtime data context
  Table: SSRClientOnly,
  TableColumns: SSRClientOnly,
  TableColumn: SSRClientOnly,
  TableColumnHeader: SSRClientOnly,
  TableGrid: SSRClientOnly,
  TableEmptyGrid: SSRClientOnly,
  TablePreviewGrid: SSRClientOnly,
  TableDynamicColumn: SSRClientOnly,
  TableDynamicColumns: SSRClientOnly,
  // Client-only components (placeholder)
  Chart: SSRClientOnly,
  FileUpload: SSRClientOnly,
  KIRunEditor: SSRClientOnly,
  TextEditor: SSRClientOnly,
  SchemaBuilder: SSRClientOnly,
  ThemeEditor: SSRClientOnly,
  FormEditor: SSRClientOnly,
  PageEditor: SSRClientOnly,
  FileSelector: SSRClientOnly,
  ColorPicker: SSRClientOnly,
  Calendar: SSRClientOnly,
  Video: SSRClientOnly,
  Audio: SSRClientOnly,
  MarkdownEditor: SSRClientOnly
};
function getSSRComponent(type) {
  return SSRComponents[type] || SSRGeneric;
}
function renderChildren(childrenMap, pageDefinition, context, depth = 0) {
  if (!childrenMap || depth > 50) return [];
  const { componentDefinition } = pageDefinition;
  const childKeys = Object.entries(childrenMap).filter(([, enabled]) => enabled).map(([key]) => key).filter((key) => componentDefinition[key]).sort((a, b) => {
    const orderA = componentDefinition[a]?.displayOrder ?? 0;
    const orderB = componentDefinition[b]?.displayOrder ?? 0;
    if (orderA !== orderB) return orderA - orderB;
    return a.localeCompare(b);
  });
  return childKeys.map((key) => {
    const def = componentDefinition[key];
    return renderComponent(def, pageDefinition, context, depth + 1);
  });
}
function renderComponent(definition, pageDefinition, context, depth = 0) {
  if (!definition || depth > 50) return null;
  const Component = getSSRComponent(definition.type);
  const children = definition.children ? renderChildren(definition.children, pageDefinition, context, depth) : null;
  return /* @__PURE__ */ jsx(
    Component,
    {
      definition,
      pageDefinition,
      context,
      children
    },
    definition.key
  );
}
function SSRPageRenderer({
  pageDefinition,
  application,
  theme
}) {
  const { componentDefinition, rootComponent } = pageDefinition;
  const context = {
    pageName: pageDefinition.name,
    appCode: application.appCode,
    clientCode: application.clientCode,
    theme,
    application
  };
  const rootDef = componentDefinition[rootComponent];
  if (!rootDef) {
    return /* @__PURE__ */ jsx("div", { className: "comp compPage", children: /* @__PURE__ */ jsx("p", { children: "Page structure error: root component not found" }) });
  }
  const renderedTree = renderComponent(rootDef, pageDefinition, context, 0);
  return /* @__PURE__ */ jsx("div", { className: "comp compPage", children: renderedTree });
}
const CRITICAL_CSS = `
	.comp { display: block; box-sizing: border-box; }
	.compPage { min-height: 100vh; }
	.compGrid { display: flex; flex-direction: column; }
	.compMessages { position: fixed; top: 10px; right: 10px; z-index: 10000; }
	._noAnchorGrid { }
	._ROWLAYOUT { flex-direction: row; }
	._SINGLECOLUMNLAYOUT { flex-direction: column; }
	._ROWCOLUMNLAYOUT { flex-direction: column; }
	._TWOCOLUMNSLAYOUT { display: grid; grid-template-columns: 1fr; }
	._THREECOLUMNSLAYOUT { display: grid; grid-template-columns: 1fr; }
	._FOURCOLUMNSLAYOUT { display: grid; grid-template-columns: 1fr; }
	._FIVECOLUMNSLAYOUT { display: grid; grid-template-columns: 1fr; }
	@media screen and (min-width: 641px) {
		._TWOCOLUMNSLAYOUT, ._THREECOLUMNSLAYOUT, ._FOURCOLUMNSLAYOUT, ._FIVECOLUMNSLAYOUT {
			grid-template-columns: 1fr 1fr;
		}
	}
	@media screen and (min-width: 1025px) {
		._TWOCOLUMNSLAYOUT { grid-template-columns: 1fr 1fr; }
		._THREECOLUMNSLAYOUT { grid-template-columns: 1fr 1fr 1fr; }
		._FOURCOLUMNSLAYOUT { grid-template-columns: 1fr 1fr 1fr 1fr; }
		._FIVECOLUMNSLAYOUT { grid-template-columns: 1fr 1fr 1fr 1fr 1fr; }
		._ROWCOLUMNLAYOUT { flex-direction: row; }
	}
`;
function collectUsedComponents(pageDefinition) {
  const components = /* @__PURE__ */ new Set();
  if (pageDefinition?.componentDefinition) {
    for (const comp of Object.values(pageDefinition.componentDefinition)) {
      if (comp?.type) {
        components.add(comp.type);
      }
    }
  }
  return Array.from(components);
}
function PageComponent() {
  const data = Route.useLoaderData();
  if (!data || "error" in data) {
    return /* @__PURE__ */ jsxs("div", { id: "app", children: [
      /* @__PURE__ */ jsxs("div", { className: "comp compPage", children: [
        /* @__PURE__ */ jsx("h1", { children: "Page Not Found" }),
        /* @__PURE__ */ jsx("p", { children: "The requested page could not be found." })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "comp compMessages" }),
      /* @__PURE__ */ jsx("div", { id: "_rendered", "data-used-components": "" })
    ] });
  }
  const {
    application,
    page,
    theme,
    styles,
    codes,
    pageName
  } = data;
  const usedComponents = collectUsedComponents(page);
  const bootstrapData = {
    application,
    pageDefinition: {
      [pageName]: page
    },
    theme,
    styles,
    urlDetails: {
      pageName,
      appCode: codes.appCode,
      clientCode: codes.clientCode
    }
  };
  const cdnHostName = process.env.CDN_HOST_NAME || "";
  const cdnStripAPIPrefix = process.env.CDN_STRIP_API_PREFIX || "true";
  const cdnReplacePlus = process.env.CDN_REPLACE_PLUS === "true";
  const cdnResizeOptionsType = process.env.CDN_RESIZE_OPTIONS_TYPE || "";
  const cdnUrl = cdnHostName ? `https://${cdnHostName}/js/dist/` : "/js/dist/";
  const externalLinks = application?.properties?.links || {};
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    cdnHostName && /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsx("link", { rel: "dns-prefetch", href: `https://${cdnHostName}` }),
      /* @__PURE__ */ jsx("link", { rel: "preconnect", href: `https://${cdnHostName}`, crossOrigin: "anonymous" })
    ] }),
    /* @__PURE__ */ jsx("link", { rel: "preload", href: `${cdnUrl}vendors.js`, as: "script" }),
    /* @__PURE__ */ jsx("link", { rel: "preload", href: `${cdnUrl}index.js`, as: "script" }),
    /* @__PURE__ */ jsx("link", { rel: "preload", href: `${cdnUrl}css/App.css`, as: "style" }),
    /* @__PURE__ */ jsx("style", { id: "criticalCss", dangerouslySetInnerHTML: {
      __html: CRITICAL_CSS
    } }),
    /* @__PURE__ */ jsx("link", { rel: "stylesheet", href: `${cdnUrl}css/App.css` }),
    Object.entries(externalLinks).map(([key, link]) => /* @__PURE__ */ jsx("link", { rel: link.rel || "stylesheet", href: link.href }, key)),
    /* @__PURE__ */ jsx("script", { dangerouslySetInnerHTML: {
      __html: `
						window.__APP_BOOTSTRAP__ = ${JSON.stringify(bootstrapData)};
						window.domainAppCode = '${codes.appCode}';
						window.domainClientCode = '${codes.clientCode}';
						${cdnHostName ? `window.cdnPrefix = '${cdnHostName}';` : ""}
						${cdnHostName ? `window.cdnStripAPIPrefix = ${cdnStripAPIPrefix};` : ""}
						${cdnHostName ? `window.cdnReplacePlus = ${cdnReplacePlus};` : ""}
						${cdnHostName && cdnResizeOptionsType ? `window.cdnResizeOptionsType = '${cdnResizeOptionsType}';` : ""}
						// When no CDN, use local path prefix for styleProperties and css files
						// This ensures requests go through /js/dist/ which Nginx routes to gateway
						window.__LOCAL_STATIC_PREFIX__ = ${cdnHostName ? "null" : "'/js/dist'"};
					`
    } }),
    /* @__PURE__ */ jsxs("div", { id: "app", children: [
      /* @__PURE__ */ jsx(SSRPageRenderer, { pageDefinition: page, application, theme: theme || void 0, styles }),
      /* @__PURE__ */ jsx("div", { className: "comp compMessages" }),
      /* @__PURE__ */ jsx("div", { id: "_rendered", "data-used-components": usedComponents.join(",") })
    ] }),
    /* @__PURE__ */ jsx("script", { src: `${cdnUrl}vendors.js`, defer: true }),
    /* @__PURE__ */ jsx("script", { src: `${cdnUrl}index.js`, defer: true })
  ] });
}
export {
  PageComponent as component
};
