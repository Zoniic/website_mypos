/**
 * Scratch-DB only: seeds fake leads for the admin list checks.
 * Refuses to run unless DATABASE_URL points at localhost:5433.
 * Run: node node_modules/tsx/dist/cli.mjs .agents/tasks/admin-improve/seed-leads-scratch.ts [--empty]
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  if (!/@localhost:5433\//.test(process.env.DATABASE_URL ?? "")) {
    throw new Error("Refusing: DATABASE_URL is not the scratch DB on localhost:5433");
  }
  await prisma.quoteRequestItem.deleteMany();
  await prisma.quoteRequest.deleteMany();
  await prisma.contactMessage.deleteMany();
  await prisma.warrantyClaim.deleteMany();
  await prisma.newsletterSubscriber.deleteMany();
  if (process.argv.includes("--empty")) return console.log("scratch leads emptied");

  const admin = await prisma.adminUser.findFirstOrThrow();
  const names = ["สมชาย ใจดี", "Alice Wong", "นภา =cmd|calc", "บริษัท \"ร้านกาแฟ\", จำกัด", "+66 Test", "Bob"];
  const topics = ["demo", "quote", "general", "support"];
  const statuses = ["new", "contacted", "closed"];
  const day = 86400000;
  for (let i = 0; i < 60; i++) {
    await prisma.contactMessage.create({
      data: {
        topic: topics[i % 4],
        name: `${names[i % names.length]} ${i}`,
        phone: `08${String(10000000 + i * 137).slice(0, 8)}`,
        product: i % 3 ? "MYPOS Lite" : null,
        message: i % 5 === 0 ? "สนใจเครื่อง POS\nบรรทัดสอง, มีเครื่องหมายคอมมา" : `ข้อความทดสอบ ${i}`,
        status: statuses[i % 3],
        createdAt: new Date(Date.now() - i * day),
        assigneeId: i % 4 === 0 ? admin.id : null,
        adminNote: i % 6 === 0 ? "โน้ตภายใน" : null,
      },
    });
  }
  for (let i = 0; i < 30; i++) {
    await prisma.quoteRequest.create({
      data: {
        name: `${names[i % names.length]} Q${i}`,
        company: i % 2 ? "บริษัท ทดสอบ" : null,
        phone: `09${String(10000000 + i * 91).slice(0, 8)}`,
        email: `q${i}@example.invalid`,
        message: i % 4 === 0 ? "ขอใบเสนอราคา" : null,
        status: statuses[i % 3],
        createdAt: new Date(Date.now() - i * day),
        items: { create: [{ productSlug: "lite", productName: "MYPOS Lite", quantity: 1 + (i % 3) }] },
      },
    });
  }
  const wst = ["open", "in_progress", "resolved"];
  for (let i = 0; i < 30; i++) {
    await prisma.warrantyClaim.create({
      data: {
        name: `${names[i % names.length]} W${i}`,
        phone: `06${String(10000000 + i * 53).slice(0, 8)}`,
        email: `w${i}@example.invalid`,
        serialNumber: `SN-${1000 + i}`,
        issue: `เครื่องเปิดไม่ติด ${i}`,
        status: wst[i % 3],
        createdAt: new Date(Date.now() - i * day),
      },
    });
  }
  for (let i = 0; i < 3; i++) await prisma.newsletterSubscriber.create({ data: { email: `n${i}@example.invalid` } });
  console.log("scratch leads seeded: 60 contact, 30 quote, 30 warranty, 3 newsletter");
}

main().finally(() => prisma.$disconnect());
