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
        "connect-src 'self' https://cdn.modlix.com https://analytics.modlix.com; " +
        "frame-src 'self' https://cdn.modlix.com https://analytics.modlix.com https://*.modlix.com",
    );
  });

  it("does not add it twice, nor at all without the snippet", () => {
    assert.equal(
      processCSP({ "script-src": "https://analytics.modlix.com" }, undefined, "https://analytics.modlix.com"),
      "script-src https://analytics.modlix.com",
    );
    assert.equal(
      processCSP({ defaultSrc: "'self'" }),
      "default-src 'self'; frame-src 'self' https://*.modlix.com",
    );
  });
});

describe("processCSP: the page editor's preview canvases", () => {
  it("adds the draft preview hosts to an existing frame-src", () => {
    assert.equal(
      processCSP({ defaultSrc: "'self'", frameSrc: "'self' https://*.razorpay.com" }),
      "default-src 'self'; frame-src 'self' https://*.razorpay.com https://*.modlix.com",
    );
  });

  it("without frame-src, frames only what default-src allowed plus the preview hosts", () => {
    assert.equal(
      processCSP({ defaultSrc: "'self' https://a.com" }, "cdn.modlix.com"),
      "default-src 'self' https://a.com https://cdn.modlix.com; " +
        "frame-src 'self' https://a.com https://cdn.modlix.com https://*.modlix.com",
    );
  });

  it("copies child-src first, and starts from nothing after 'none'", () => {
    assert.equal(
      processCSP({ defaultSrc: "'self'", childSrc: "https://c.com" }),
      "default-src 'self'; child-src https://c.com; frame-src https://c.com https://*.modlix.com",
    );
    assert.equal(
      processCSP({ defaultSrc: "'none'" }),
      "default-src 'none'; frame-src https://*.modlix.com",
    );
  });

  it("adds nothing when framing is not restricted at all, nor twice", () => {
    assert.equal(processCSP({ scriptSrc: "'self'" }), "script-src 'self'");
    assert.equal(
      processCSP({ frameSrc: "https://*.modlix.com" }),
      "frame-src https://*.modlix.com",
    );
  });
});
