import type { ComponentDefinition, PageDefinition } from "../api/client.js";

/**
 * The page's static text for crawlers that do not run JavaScript.
 *
 * This service never renders components (full HTML rendering fought React
 * hydration), so `#app` goes out empty and a crawler such as Facebook's saw a
 * legal page as its title alone: Meta's review reads the privacy policy URL
 * that way and found nothing in it. The text goes in a `<noscript>` AFTER
 * `#app`, never inside it: the client hydrates only when `#_rendered` exists,
 * and a browser running scripts parses `<noscript>` as inert text, so nothing
 * here can reach React.
 *
 * Only Text components whose `text` is a plain value are read. An expression
 * (a `location`) is resolved by the client from its store, which this process
 * does not have, and a component hidden by a plain `visibility: false` is
 * skipped. Everything is escaped before the few markdown forms are turned into
 * tags, so a page cannot inject markup through it.
 */

const MAX_CHARS = 100_000;

function escape(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Bold, italic and links on an already escaped line. */
function inline(escaped: string): string {
  return escaped
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/__(.+?)__/g, "<strong>$1</strong>")
    .replace(/(^|[\s(])\*(?!\s)(.+?)\*(?=[\s).,;:!?]|$)/g, "$1<em>$2</em>")
    .replace(
      /\[([^\]]+)\]\(([^)\s]+)\)/g,
      (whole, label: string, href: string) =>
        /^(https?:|mailto:|\/(?!\/)|#)/i.test(href)
          ? `<a href="${href}">${label}</a>`
          : label,
    );
}

/** A small markdown subset: headings, paragraphs, bullet and numbered lists. */
export function markdownToHtml(md: string): string {
  const out: string[] = [];
  let para: string[] = [];
  let list: { tag: "ul" | "ol"; items: string[] } | null = null;

  const flushPara = () => {
    if (para.length) out.push(`<p>${inline(escape(para.join(" ")))}</p>`);
    para = [];
  };
  const flushList = () => {
    if (list)
      out.push(
        `<${list.tag}>${list.items.map((i) => `<li>${inline(escape(i))}</li>`).join("")}</${list.tag}>`,
      );
    list = null;
  };

  for (const raw of md.replace(/\r\n?/g, "\n").split("\n")) {
    const line = raw.trim();
    const heading = /^(#{1,6})\s+(.*)$/.exec(line);
    const bullet = /^[-*+]\s+(.*)$/.exec(line);
    const numbered = /^\d+[.)]\s+(.*)$/.exec(line);
    if (!line) {
      flushPara();
      flushList();
    } else if (heading) {
      flushPara();
      flushList();
      const level = heading[1].length;
      out.push(`<h${level}>${inline(escape(heading[2]))}</h${level}>`);
    } else if (bullet || numbered) {
      flushPara();
      const tag = bullet ? "ul" : "ol";
      if (list && list.tag !== tag) flushList();
      if (!list) list = { tag, items: [] };
      list.items.push((bullet ?? numbered)![1]);
    } else {
      flushList();
      para.push(line);
    }
  }
  flushPara();
  flushList();
  return out.join("\n");
}

function plainToHtml(text: string): string {
  return text
    .replace(/\r\n?/g, "\n")
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => `<p>${escape(p).replace(/\n/g, "<br>")}</p>`)
    .join("\n");
}

function staticValue(c: ComponentDefinition, name: string): unknown {
  const prop = c.properties?.[name];
  if (!prop || prop.location) return undefined;
  return prop.value;
}

/** The static text of the page's Text components in display order, as HTML. */
export function pageTextHtml(page: PageDefinition | null | undefined): string {
  const defs = page?.componentDefinition;
  if (!defs || !page?.rootComponent) return "";

  const parts: string[] = [];
  let size = 0;
  const seen = new Set<string>();

  const walk = (key: string) => {
    const c = defs[key];
    if (!c || seen.has(key) || size >= MAX_CHARS) return;
    seen.add(key);
    if (staticValue(c, "visibility") === false) return;

    if (c.type === "Text") {
      const text = staticValue(c, "text");
      if (typeof text === "string" && text.trim()) {
        const chunk = text.slice(0, MAX_CHARS - size);
        size += chunk.length;
        parts.push(
          staticValue(c, "textType") === "MD"
            ? markdownToHtml(chunk)
            : plainToHtml(chunk),
        );
      }
    }

    Object.entries(c.children ?? {})
      .filter(([, on]) => on)
      .map(([k]) => k)
      .sort(
        (a, b) => (defs[a]?.displayOrder ?? 0) - (defs[b]?.displayOrder ?? 0),
      )
      .forEach(walk);
  };
  walk(page.rootComponent);

  return parts.join("\n");
}

/** The `<noscript>` block, or nothing when the page has no static text. */
export function noscriptBlock(page: PageDefinition | null | undefined): string {
  const html = pageTextHtml(page);
  return html ? `<noscript><main>\n${html}\n</main></noscript>` : "";
}
