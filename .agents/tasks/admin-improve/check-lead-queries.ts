// Read-only: runs the three admin lead-list queries (the same functions the admin pages use)
// against the database in DATABASE_URL, to prove the pages no longer fail after lead-fields.sql.
// Run: node node_modules/tsx/dist/cli.mjs .agents/tasks/admin-improve/check-lead-queries.ts
import { prisma } from "../../../src/lib/prisma";
import {
  listAssigneeOptions,
  listContactMessages,
  listQuoteRequests,
  listWarrantyClaims,
  parseLeadParams,
} from "../../../src/lib/leadList";

async function main() {
  const contact = await listContactMessages(parseLeadParams("contact", {}));
  console.log(`contact OK total=${contact.total} rows=${contact.rows.length} firstHasNoteField=${contact.rows[0] ? "adminNote" in contact.rows[0] : "n/a"}`);
  const quotes = await listQuoteRequests(parseLeadParams("quote", {}));
  console.log(`quotes OK total=${quotes.total} rows=${quotes.rows.length} items=${quotes.rows[0]?.items.length ?? 0}`);
  const warranty = await listWarrantyClaims(parseLeadParams("warranty", {}));
  console.log(`warranty OK total=${warranty.total} rows=${warranty.rows.length}`);
  const filtered = await listContactMessages(parseLeadParams("contact", { q: "zzz-no-match", status: "new" }));
  console.log(`contact filtered OK total=${filtered.total}`);
  const admins = await listAssigneeOptions();
  console.log(`assignee options OK count=${admins.length}`);
}

main()
  .catch((e) => {
    console.error("ERROR", e instanceof Error ? e.message.slice(0, 400) : e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
