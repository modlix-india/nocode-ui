import { describe, it } from "node:test";
import assert from "node:assert/strict";

import {
  startupHintTags,
  startupScriptPreloads,
  startupScripts,
  stylePropertyComponentsFor,
  usesGoogleFonts,
} from "../startupHints.js";

/**
 * A preload only helps when the later request asks for the same URL, so each
 * test pins a URL to the form the client builds.
 */

describe("startupScripts", () => {
  it("lists every script once, entry first, file names only", () => {
    assert.deepEqual(
      startupScripts(
        ["vendors-a.js", "index-1.js"],
        ["Application-2.js", "vendors-a.js", "https://cdn.x/js/dist/kirun-3.js"],
      ),
      ["vendors-a.js", "index-1.js", "Application-2.js", "kirun-3.js"],
    );
  });
});

describe("stylePropertyComponentsFor", () => {
  it("names the page's external style components, sorted, once each", () => {
    const page = {
      componentDefinition: {
        a: { type: "TextBox" },
        b: { type: "Button" },
        c: { type: "Grid" },
        d: { type: "Button" },
      },
    };
    assert.deepEqual(stylePropertyComponentsFor(page), ["Button", "TextBox"]);
  });
});

describe("startupScriptPreloads", () => {
  it("keeps the entry and the two named chunks High, the rest of the group Low", () => {
    const tags = startupScriptPreloads(
      "https://cdn.x/js/dist/",
      ["vendors-a.js", "index-1.js"],
      ["chunk.4116.c.js", "Application-2.js", "kirun-3.js", "vendors-a.js", "ApplicationStyle-4.js"],
    ).split("\n\t\t");
    assert.deepEqual(tags, [
      '<link rel="preload" href="https://cdn.x/js/dist/vendors-a.js" as="script">',
      '<link rel="preload" href="https://cdn.x/js/dist/index-1.js" as="script">',
      '<link rel="preload" href="https://cdn.x/js/dist/chunk.4116.c.js" as="script" fetchpriority="low">',
      '<link rel="preload" href="https://cdn.x/js/dist/Application-2.js" as="script">',
      '<link rel="preload" href="https://cdn.x/js/dist/kirun-3.js" as="script" fetchpriority="low">',
      '<link rel="preload" href="https://cdn.x/js/dist/ApplicationStyle-4.js" as="script">',
    ]);
  });
});

describe("usesGoogleFonts", () => {
  it("is true only for a Google Fonts stylesheet in a pack", () => {
    assert.equal(
      usesGoogleFonts({
        a: { code: '<link rel="preconnect" href="https://fonts.googleapis.com"><link href="https://fonts.googleapis.com/css2?family=Inter" rel="stylesheet">' },
      }),
      true,
    );
    assert.equal(usesGoogleFonts({ a: { code: '<link rel="preconnect" href="https://fonts.googleapis.com">' } }), false);
    assert.equal(usesGoogleFonts(undefined), false);
  });
});

describe("startupHintTags", () => {
  const tags = startupHintTags({
    assetBase: "https://cdn.modlix.com/js/dist",
    buildVersion: "abc",
    page: { componentDefinition: { v: { type: "Video" } } },
    application: {
      properties: {
        iconPacks: { i: { name: "FREE_FONT_AWESOME_ALL" }, m: { name: "MATERIAL_ICONS_ROUNDED" } },
      },
    },
  });

  it("preloads the page's style JSON at the client's versioned URL, and no stylesheet", () => {
    assert.doesNotMatch(tags, /as="style"/);
    assert.match(
      tags,
      /<link rel="preload" href="https:\/\/cdn\.modlix\.com\/js\/dist\/styleProperties\/Video\.json\?v=abc" as="fetch" crossorigin="anonymous">/,
    );
  });

  it("opens the icon packs' hosts, crossorigin only for the font-file host", () => {
    assert.match(tags, /<link rel="preconnect" href="https:\/\/cdnjs\.cloudflare\.com">/);
    assert.match(tags, /<link rel="preconnect" href="https:\/\/cdn\.jsdelivr\.net">/);
    assert.match(tags, /<link rel="preconnect" href="https:\/\/fonts\.gstatic\.com" crossorigin>/);
  });

  it("leaves the version off when the manifest has none", () => {
    const bare = startupHintTags({
      assetBase: "",
      page: { componentDefinition: { b: { type: "Button" } } },
      application: null,
    });
    assert.equal(bare, '<link rel="preload" href="/styleProperties/Button.json" as="fetch" crossorigin="anonymous">');
  });
});
