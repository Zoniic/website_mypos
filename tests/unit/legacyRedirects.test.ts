import { test } from "node:test";
import assert from "node:assert/strict";
import { legacyRedirects } from "../../src/data/legacyRedirects";
import { matchPublicRoute } from "@/lib/routeMap";

test("every old URL has exactly one redirect", () => {
  const sources = legacyRedirects.map((r) => r.source);
  assert.equal(new Set(sources).size, sources.length, "duplicate source");
  for (const s of sources) assert.ok(s.startsWith("/"), s);
});

test("every redirect points at a page the new site actually has", () => {
  const knownRecords = new Set(["/products/mypos-f58", "/products/mypos-t70", "/products/mypos-k156", "/references/dreamworld", "/references/ruengrawin-metal"]);
  for (const { source, destination } of legacyRedirects) {
    assert.ok(!/^\/(th|en|zh)(\/|$)/.test(destination), `${source}: destination must not carry a locale`);
    const match = matchPublicRoute(`/th${destination === "/" ? "" : destination}`);
    if (match.type === "dynamic") {
      assert.ok(knownRecords.has(destination), `${source} -> ${destination}: record not in the known list`);
    } else {
      assert.equal(match.type, "page", `${source} -> ${destination} is not a known page`);
    }
  }
});
