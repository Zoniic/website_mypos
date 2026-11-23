import { test } from "node:test";
import assert from "node:assert/strict";
import { decodeSlugParam, isSafeSlug, slugFormError, slugKey, slugify } from "@/lib/slug";
import { matchPublicRoute } from "@/lib/routeMap";

test("slugify and slugKey map old slugs to the stored lowercase slug", () => {
  assert.equal(slugify("mypos-FM-EA-SLIM-22-(Desktop)"), "mypos-fm-ea-slim-22-desktop");
  assert.equal(slugKey("Change%20paper%20K1"), "change-paper-k1");
  assert.equal(slugKey("mypos-K1"), slugKey("mypos-k1"));
  assert.equal(decodeSlugParam("%E0%A4"), "%E0%A4"); // malformed encoding is returned as is
});

test("only lowercase, digits and single hyphens are safe slugs", () => {
  assert.ok(isSafeSlug("mypos-k1"));
  for (const bad of ["Mypos", "my pos", "a--b", "-a", "a-", "k1(desktop)", ""]) assert.ok(!isSafeSlug(bad), bad);
  assert.equal(slugFormError("mypos-k1"), null);
  assert.match(slugFormError("My Pos") ?? "", /my-pos/);
});

test("matchPublicRoute classifies known pages, records and unknown paths", () => {
  assert.deepEqual(matchPublicRoute("/th"), { type: "page" });
  assert.deepEqual(matchPublicRoute("/en/about"), { type: "page" });
  assert.deepEqual(matchPublicRoute("/zh/solutions/pos"), { type: "page" });
  assert.deepEqual(matchPublicRoute("/th/knowledge-base/hardware"), { type: "page" });
  assert.deepEqual(matchPublicRoute("/th/products/mypos-k1"), { type: "dynamic", kind: "product", slug: "mypos-k1" });
  assert.deepEqual(matchPublicRoute("/th/knowledge-base/article/Change%20paper%20K1"), {
    type: "dynamic",
    kind: "kbArticle",
    slug: "Change paper K1",
  });
  assert.deepEqual(matchPublicRoute("/th/no-such-page"), { type: "unknown" });
  assert.deepEqual(matchPublicRoute("/th/knowledge-base/nope"), { type: "unknown" });
  assert.deepEqual(matchPublicRoute("/th/products/%E0%A4"), { type: "unknown" });
  assert.deepEqual(matchPublicRoute("/admin"), { type: "outside" });
  assert.deepEqual(matchPublicRoute("/fr/about"), { type: "outside" });
});
