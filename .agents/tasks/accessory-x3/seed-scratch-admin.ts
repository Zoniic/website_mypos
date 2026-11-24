// Creates one scratch-only owner account (localhost:5433 only) from SCRATCH_ADMIN_EMAIL / SCRATCH_ADMIN_PASSWORD.
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const url = process.env.DATABASE_URL ?? "";
if (!/@(localhost|127\.0\.0\.1):5433\//.test(url)) {
  console.error("Refusing: not scratch");
  process.exit(1);
}
const prisma = new PrismaClient();

async function main() {
  const email = process.env.SCRATCH_ADMIN_EMAIL!;
  const passwordHash = await bcrypt.hash(process.env.SCRATCH_ADMIN_PASSWORD!, 10);
  await prisma.adminUser.deleteMany({});
  await prisma.adminUser.create({ data: { email, name: "Scratch Owner", passwordHash, role: "owner" } });
  console.log("seeded admins", await prisma.adminUser.count());
}

main()
  .catch((e) => {
    console.error("ERROR", e instanceof Error ? e.message : e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
