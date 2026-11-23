/**
 * Logical JSON export of every Prisma model (the model list comes from
 * Prisma.dmmf, so new models are included automatically).
 *
 * This is a data export, not a host backup. It does not replace the database
 * host's scheduled backups, it does not include the schema, sequences,
 * storage files (Supabase Storage) or AdminUser.passwordHash (excluded on
 * purpose; admins can be re-seeded), and no restore script has been tested.
 *
 * Safe by default:
 *   - dry run: prints the row count of every model and the target file, writes nothing;
 *   - --write: saves prisma/backups/full-<timestamp>.json (gitignored);
 *   - --verify <file>: compares the counts in a saved file with the live counts;
 *   - --self-test: runs the export and verify logic on an in-memory fake, no database.
 * The script only reads from the database.
 *
 * Run:
 *   node node_modules/tsx/dist/cli.mjs prisma/backup-db.ts
 *   node node_modules/tsx/dist/cli.mjs prisma/backup-db.ts --write
 *   node node_modules/tsx/dist/cli.mjs prisma/backup-db.ts --verify prisma/backups/full-<ts>.json
 *   node node_modules/tsx/dist/cli.mjs prisma/backup-db.ts --self-test
 */
import { Prisma, PrismaClient } from "@prisma/client";
import fs from "node:fs";
import path from "node:path";

const BATCH = 1000;

/** Fields never written to the export. */
const EXCLUDED_FIELDS: Record<string, string[]> = {
  AdminUser: ["passwordHash"],
};

type ModelInfo = { name: string; orderBy: string[] };

type Delegate = {
  count: () => Promise<number>;
  findMany: (args: { orderBy: Record<string, "asc">[]; skip: number; take: number }) => Promise<Record<string, unknown>[]>;
};

type ClientLike = Record<string, unknown>;

type BackupFile = {
  kind: "mypos-logical-export";
  note: string;
  createdAt: string;
  excludedFields: Record<string, string[]>;
  counts: Record<string, number>;
  data: Record<string, unknown[]>;
};

function delegateName(model: string): string {
  return model.charAt(0).toLowerCase() + model.slice(1);
}

function delegateOf(client: ClientLike, model: string): Delegate {
  const delegate = client[delegateName(model)] as Delegate | undefined;
  if (!delegate || typeof delegate.count !== "function") throw new Error(`No Prisma delegate for model ${model}`);
  return delegate;
}

function modelsFromDmmf(): ModelInfo[] {
  return Prisma.dmmf.datamodel.models.map((model) => {
    const idFields = model.primaryKey?.fields?.length
      ? [...model.primaryKey.fields]
      : model.fields.filter((field) => field.isId).map((field) => field.name);
    const fallback = model.fields.filter((field) => field.kind === "scalar").map((field) => field.name);
    return { name: model.name, orderBy: idFields.length ? idFields : fallback.slice(0, 1) };
  });
}

/** JSON.stringify replacer: BigInt and Bytes are not JSON types. Date and Decimal have toJSON. */
function jsonReplacer(_key: string, value: unknown): unknown {
  if (typeof value === "bigint") return { $bigint: value.toString() };
  if (value instanceof Uint8Array) return { $bytes: Buffer.from(value).toString("base64") };
  if (value && typeof value === "object" && (value as { type?: unknown }).type === "Buffer" && Array.isArray((value as { data?: unknown }).data)) {
    return { $bytes: Buffer.from((value as { data: number[] }).data).toString("base64") };
  }
  return value;
}

async function countAll(client: ClientLike, models: ModelInfo[]): Promise<Record<string, number>> {
  const counts: Record<string, number> = {};
  for (const model of models) counts[model.name] = await delegateOf(client, model.name).count();
  return counts;
}

async function exportAll(client: ClientLike, models: ModelInfo[]): Promise<BackupFile> {
  const data: Record<string, unknown[]> = {};
  const counts: Record<string, number> = {};
  for (const model of models) {
    const delegate = delegateOf(client, model.name);
    const excluded = EXCLUDED_FIELDS[model.name] ?? [];
    const rows: unknown[] = [];
    for (let skip = 0; ; skip += BATCH) {
      const batch = await delegate.findMany({ orderBy: model.orderBy.map((field) => ({ [field]: "asc" as const })), skip, take: BATCH });
      for (const row of batch) {
        const copy = { ...row };
        for (const field of excluded) delete copy[field];
        rows.push(copy);
      }
      if (batch.length < BATCH) break;
    }
    data[model.name] = rows;
    counts[model.name] = rows.length;
  }
  return {
    kind: "mypos-logical-export",
    note: "Logical data export, not a host backup. AdminUser.passwordHash excluded. No tested restore script.",
    createdAt: new Date().toISOString(),
    excludedFields: EXCLUDED_FIELDS,
    counts,
    data,
  };
}

type VerifyLine = { model: string; file: number | null; live: number | null; ok: boolean };

function compareCounts(fileCounts: Record<string, number>, liveCounts: Record<string, number>): VerifyLine[] {
  const names = [...new Set([...Object.keys(liveCounts), ...Object.keys(fileCounts)])].sort();
  return names.map((model) => {
    const file = model in fileCounts ? fileCounts[model] : null;
    const live = model in liveCounts ? liveCounts[model] : null;
    return { model, file, live, ok: file !== null && file === live };
  });
}

function printCounts(counts: Record<string, number>) {
  let total = 0;
  for (const [model, count] of Object.entries(counts)) {
    total += count;
    console.log(`  ${model.padEnd(28)} ${count}`);
  }
  console.log(`  ${"total".padEnd(28)} ${total}`);
}

function fakeDelegate(rows: Record<string, unknown>[]): Delegate {
  return {
    count: async () => rows.length,
    findMany: async ({ skip, take }) => rows.slice(skip, skip + take),
  };
}

async function selfTest(): Promise<never> {
  const users = [{ id: 1, email: "a@example.com", passwordHash: "secret", createdAt: new Date("2026-01-01T00:00:00Z") }];
  const many = Array.from({ length: BATCH * 2 + 5 }, (_, i) => ({ id: i + 1, big: BigInt(i), bytes: new Uint8Array([1, 2, 3]) }));
  const client: ClientLike = { adminUser: fakeDelegate(users), contactMessage: fakeDelegate(many), order: fakeDelegate([]) };
  const models: ModelInfo[] = [
    { name: "AdminUser", orderBy: ["id"] },
    { name: "ContactMessage", orderBy: ["id"] },
    { name: "Order", orderBy: ["id"] },
  ];
  const checks: [string, boolean][] = [];
  const backup = await exportAll(client, models);
  const json = JSON.stringify(backup, jsonReplacer);
  const parsed = JSON.parse(json) as BackupFile;
  const user = parsed.data.AdminUser[0] as Record<string, unknown>;
  checks.push(["passwordHash excluded", !("passwordHash" in user) && !json.includes("secret")]);
  checks.push(["other user fields kept", user.email === "a@example.com" && user.createdAt === "2026-01-01T00:00:00.000Z"]);
  checks.push(["pagination reads every row", parsed.counts.ContactMessage === many.length && parsed.data.ContactMessage.length === many.length]);
  checks.push(["empty model exported", parsed.counts.Order === 0 && Array.isArray(parsed.data.Order)]);
  const row = parsed.data.ContactMessage[3] as Record<string, unknown>;
  checks.push(["BigInt serialized", JSON.stringify(row.big) === JSON.stringify({ $bigint: "3" })]);
  checks.push(["Bytes serialized", JSON.stringify(row.bytes) === JSON.stringify({ $bytes: "AQID" })]);
  const live = await countAll(client, models);
  checks.push(["verify passes on equal counts", compareCounts(parsed.counts, live).every((line) => line.ok)]);
  const drift = compareCounts({ ...parsed.counts, Order: 1 }, live);
  checks.push(["verify flags a changed count", drift.some((line) => line.model === "Order" && !line.ok)]);
  const missing = compareCounts({ AdminUser: 1 }, live);
  checks.push(["verify flags a model missing from the file", missing.some((line) => line.model === "ContactMessage" && line.file === null && !line.ok)]);
  checks.push(["dmmf lists models", modelsFromDmmf().some((model) => model.name === "AdminUser" && model.orderBy.length > 0)]);
  let failed = 0;
  for (const [name, ok] of checks) {
    if (!ok) {
      failed += 1;
      console.error(`FAIL: ${name}`);
    }
  }
  console.log(failed ? `${failed} of ${checks.length} checks failed` : `All ${checks.length} checks passed`);
  process.exit(failed ? 1 : 0);
}

async function main() {
  if (process.argv.includes("--self-test")) await selfTest();

  const write = process.argv.includes("--write");
  const verifyIndex = process.argv.indexOf("--verify");
  const verifyFile = verifyIndex >= 0 ? process.argv[verifyIndex + 1] : undefined;
  if (verifyIndex >= 0 && !verifyFile) throw new Error("--verify needs a file path");

  const models = modelsFromDmmf();
  const prisma = new PrismaClient();
  const client = prisma as unknown as ClientLike;
  try {
    if (verifyFile) {
      const saved = JSON.parse(fs.readFileSync(verifyFile, "utf8")) as BackupFile;
      const lines = compareCounts(saved.counts ?? {}, await countAll(client, models));
      for (const line of lines) {
        console.log(`  ${line.ok ? "same " : "DIFF "} ${line.model.padEnd(28)} file=${line.file ?? "-"} live=${line.live ?? "-"}`);
      }
      const diffs = lines.filter((line) => !line.ok).length;
      console.log(diffs ? `${diffs} model(s) differ (rows may have changed since the export).` : "All counts match.");
      process.exitCode = diffs ? 1 : 0;
      return;
    }

    const stamp = new Date().toISOString().replace(/[:.]/g, "-");
    const target = path.join(__dirname, "backups", `full-${stamp}.json`);

    if (!write) {
      console.log("Row counts:");
      printCounts(await countAll(client, models));
      console.log(`\nDry run: nothing was written. --write would save ${target}`);
      return;
    }

    const backup = await exportAll(client, models);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, JSON.stringify(backup, jsonReplacer), "utf8");
    console.log("Exported rows:");
    printCounts(backup.counts);
    console.log(`\nWritten: ${target}`);
    console.log("This is a data export, not a host backup. Check it with --verify.");
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
