/**
 * One-off bootstrap: creates the first AdminUser row so you can log in
 * after switching from the single shared ADMIN_PASSWORD to DB-backed
 * multi-user accounts. Skips if any admin user already exists.
 *
 * Uses ADMIN_PASSWORD from .env.local as the initial password, and
 * ADMIN_EMAIL if set (defaults to admin@mypos.co.th) — change both via
 * Admin -> Admin Users right after logging in.
 *
 * Run: npx tsx prisma/seed-admin-user.ts
 */
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const existing = await prisma.adminUser.count();
  if (existing > 0) {
    console.log(`Skipped: ${existing} admin user(s) already exist.`);
    return;
  }

  const email = (process.env.ADMIN_EMAIL ?? "admin@mypos.co.th").toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  if (!password) {
    throw new Error("ADMIN_PASSWORD is not set in .env.local.");
  }

  const passwordHash = await bcrypt.hash(password, 10);
  await prisma.adminUser.create({
    data: { email, name: "Admin", passwordHash },
  });
  console.log(`Created first admin user: ${email} (password from ADMIN_PASSWORD env var)`);
  console.log("Log in, then change the email/name/password via Admin -> Admin Users.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
