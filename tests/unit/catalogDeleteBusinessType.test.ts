import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";

const SRC = readFileSync(join(__dirname, "..", "..", "src", "app", "admin", "(dashboard)", "catalog", "actions.ts"), "utf8");

test("deleteBusinessType removes the type's industries.<slug>.* page text", () => {
  const body = SRC.slice(SRC.indexOf("deleteBusinessType"));
  assert.match(body, /namespace: "industries", key: \{ startsWith: `\$\{slug\}\.` \}/);
});
