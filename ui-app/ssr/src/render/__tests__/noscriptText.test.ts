import { describe, it } from "node:test";
import assert from "node:assert/strict";

import {
  markdownToHtml,
  noscriptBlock,
  pageTextHtml,
} from "../noscriptText.js";
import type { ComponentDefinition, PageDefinition } from "../../api/client.js";

/**
 * The block exists so a crawler that runs no JavaScript (Facebook's, reading a
 * privacy policy for Meta's review) sees the page's text. Each test stands for
 * text that would be lost, or markup that must never get through.
 */

const v = <T>(value: T) => ({ value });

function comp(
  key: string,
  type: string,
  props: ComponentDefinition["properties"] = {},
  children: string[] = [],
  displayOrder = 0,
): ComponentDefinition {
  return {
    key,
    name: key,
    type,
    properties: props,
    children: Object.fromEntries(children.map((c) => [c, true])),
    displayOrder,
  };
}

function page(...defs: ComponentDefinition[]): PageDefinition {
  return {
    name: "p",
    rootComponent: defs[0].key,
    componentDefinition: Object.fromEntries(defs.map((d) => [d.key, d])),
  };
}

describe("pageTextHtml", () => {
  it("reads Text components in display order, not insertion order", () => {
    const p = page(
      comp("root", "Grid", {}, ["b", "a"]),
      comp("b", "Text", { text: v("second") }, [], 1),
      comp("a", "Text", { text: v("first") }, [], 0),
    );
    assert.equal(pageTextHtml(p), "<p>first</p>\n<p>second</p>");
  });

  it("skips expression-bound text and components hidden by a plain false", () => {
    const p = page(
      comp("root", "Grid", {}, ["dyn", "hidden", "shown"]),
      comp("dyn", "Text", {
        text: {
          value: "stale",
          location: { type: "EXPRESSION", expression: "Page.x" },
        },
      }),
      comp("hidden", "Grid", { visibility: v(false) }, ["inner"]),
      comp("inner", "Text", { text: v("never") }),
      comp("shown", "Text", { text: v("kept") }),
    );
    assert.equal(pageTextHtml(p), "<p>kept</p>");
  });

  it("escapes text so a page cannot inject markup", () => {
    const p = page(
      comp("root", "Text", { text: v('<script>alert(1)</script> & "x"') }),
    );
    assert.equal(
      pageTextHtml(p),
      "<p>&lt;script&gt;alert(1)&lt;/script&gt; &amp; &quot;x&quot;</p>",
    );
  });

  it("gives nothing for a page with no static text, so other pages are unchanged", () => {
    assert.equal(noscriptBlock(page(comp("root", "Grid"))), "");
    assert.equal(noscriptBlock(null), "");
  });
});

describe("markdownToHtml", () => {
  it("turns headings, paragraphs, lists and emphasis into tags", () => {
    const html = markdownToHtml(
      "# Privacy Policy\n\n**Effective date:** 28th January\nsecond line\n\n- one\n- *two*\n\n1. first\n2. second",
    );
    assert.equal(
      html,
      "<h1>Privacy Policy</h1>\n<p><strong>Effective date:</strong> 28th January second line</p>\n" +
        "<ul><li>one</li><li><em>two</em></li></ul>\n<ol><li>first</li><li>second</li></ol>",
    );
  });

  it("keeps safe links and drops a javascript: href to its label", () => {
    assert.equal(
      markdownToHtml("[Mail](mailto:support@modlix.com)"),
      '<p><a href="mailto:support@modlix.com">Mail</a></p>',
    );
    assert.equal(markdownToHtml("[x](javascript:alert)"), "<p>x</p>");
  });

  it("reads a markdown Text through the page walk", () => {
    const p = page(
      comp("root", "Text", {
        text: v("## 1. Who we are\n\nModlix"),
        textType: v("MD"),
      }),
    );
    assert.equal(
      noscriptBlock(p),
      "<noscript><main>\n<h2>1. Who we are</h2>\n<p>Modlix</p>\n</main></noscript>",
    );
  });
});
