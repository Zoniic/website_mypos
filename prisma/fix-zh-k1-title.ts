/**
 * Fixes the Chinese text of the K1 paper-change guide. The zh title, summary
 * and KB category were machine-translated as "修改文件" ("modify file"); the
 * article is about changing the printer paper, so they become
 * "K1 更换打印纸" / "更换打印纸". Only zh rows are touched; the article body
 * (which is correct) is not changed.
 *
 * Same convention as the other prisma/ scripts:
 *   dry run by default (prints current and new values, writes nothing);
 *   --write saves a JSON backup to prisma/backups/ first, then updates;
 *   --restore <backup> puts the saved values back.
 *
 * Run: node node_modules/tsx/dist/cli.mjs prisma/fix-zh-k1-title.ts [--write | --restore <file>]
 */
import { PrismaClient } from "@prisma/client";
import fs from "node:fs";
import path from "node:path";

const prisma = new PrismaClient();
const ARTICLE_SLUG = "change-paper-k1";
const WRONG = "修改文件";
const NEW_TITLE = "K1 更换打印纸";
const NEW_CATEGORY = "更换打印纸";

type Backup = {
  createdAt: string;
  article: { id: number; title: string; summary: string } | null;
  category: { id: number; name: string } | null;
};

function fixText(value: string, replacement: string): string {
  // "修改文件 K1" -> "K1 更换打印纸"; a bare "修改文件" -> the category wording.
  return value.replace(`${WRONG} K1`, NEW_TITLE).replace(WRONG, replacement);
}

async function main() {
  const args = process.argv.slice(2);
  if (args[0] === "--restore") {
    const file = args[1];
    if (!file) throw new Error("Usage: --restore <backup file>");
    const backup = JSON.parse(fs.readFileSync(file, "utf8")) as Backup;
    if (backup.article) await prisma.kbArticleTranslation.update({ where: { id: backup.article.id }, data: { title: backup.article.title, summary: backup.article.summary } });
    if (backup.category) await prisma.kbCategoryTranslation.update({ where: { id: backup.category.id }, data: { name: backup.category.name } });
    console.log("Restored from", file);
    return;
  }

  const article = await prisma.kbArticle.findUnique({ where: { slug: ARTICLE_SLUG }, select: { id: true, categoryId: true } });
  if (!article) throw new Error(`KB article ${ARTICLE_SLUG} not found`);
  const zhArticle = await prisma.kbArticleTranslation.findUnique({
    where: { articleId_locale: { articleId: article.id, locale: "zh" } },
    select: { id: true, title: true, summary: true },
  });
  const zhCategory = await prisma.kbCategoryTranslation.findUnique({
    where: { categoryId_locale: { categoryId: article.categoryId, locale: "zh" } },
    select: { id: true, name: true },
  });

  const changes: string[] = [];
  const articleData: { title?: string; summary?: string } = {};
  if (zhArticle?.title.includes(WRONG)) {
    articleData.title = fixText(zhArticle.title, NEW_CATEGORY);
    changes.push(`article title: "${zhArticle.title}" -> "${articleData.title}"`);
  }
  if (zhArticle?.summary.includes(WRONG)) {
    articleData.summary = fixText(zhArticle.summary, NEW_CATEGORY);
    changes.push(`article summary: "${zhArticle.summary}" -> "${articleData.summary}"`);
  }
  const categoryName = zhCategory?.name.includes(WRONG) ? fixText(zhCategory.name, NEW_CATEGORY) : null;
  if (categoryName) changes.push(`category name: "${zhCategory!.name}" -> "${categoryName}"`);

  console.log(changes.length ? changes.join("\n") : "Nothing to change");
  if (!args.includes("--write") || changes.length === 0) {
    if (changes.length) console.log("Dry run: nothing written. Re-run with --write.");
    return;
  }

  const backup: Backup = {
    createdAt: new Date().toISOString(),
    article: zhArticle ? { id: zhArticle.id, title: zhArticle.title, summary: zhArticle.summary } : null,
    category: zhCategory ? { id: zhCategory.id, name: zhCategory.name } : null,
  };
  const dir = path.join(process.cwd(), "prisma", "backups");
  fs.mkdirSync(dir, { recursive: true });
  const file = path.join(dir, `fix-zh-k1-title-${backup.createdAt.replace(/[:.]/g, "-")}.json`);
  fs.writeFileSync(file, JSON.stringify(backup, null, 2), "utf8");
  console.log("Backup:", file);

  await prisma.$transaction([
    ...(zhArticle && Object.keys(articleData).length ? [prisma.kbArticleTranslation.update({ where: { id: zhArticle.id }, data: articleData })] : []),
    ...(zhCategory && categoryName ? [prisma.kbCategoryTranslation.update({ where: { id: zhCategory.id }, data: { name: categoryName } })] : []),
  ]);
  console.log("Applied. The public site shows it within 5 minutes (cache), or at once after any admin save.");
}

main()
  .catch((e) => {
    console.error("ERROR", e instanceof Error ? e.message : e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
