import { describe, it } from "node:test";
import assert from "node:assert/strict";

import { processCSP } from "../htmlRenderer.js";

/**
 * The SSR puts the CDN's scripts and the analytics snippet on every page, so an
 * app's own policy must not block them.
 */
describe("processCSP", () => {
  it("adds the analytics origin where a.js loads and posts, and nowhere else", () => {
    const csp = processCSP(
      { defaultSrc: "'self'", imgSrc: "'self'", connectSrc: "'self'" },
      "cdn.modlix.com",
      "https://analytics.modlix.com",
    );
    assert.equal(
      csp,
      "default-src 'self' https://cdn.modlix.com https://analytics.modlix.com; " +
        "img-src 'self' https://cdn.modlix.com; " +
        "connect-src 'self' https://cdn.modlix.com https://analytics.modlix.com",
    );
  });

  it("does not add it twice, nor at all without the snippet", () => {
    assert.equal(
      processCSP({ "script-src": "https://analytics.modlix.com" }, undefined, "https://analytics.modlix.com"),
      "script-src https://analytics.modlix.com",
    );
    assert.equal(processCSP({ defaultSrc: "'self'" }), "default-src 'self'");
  });
});
