/**
 * One-off, idempotent migration: adds the contact.formSubmitting/formSuccessTitle/
 * formSuccessBody/formError keys to PageContent for th/en/zh. Needed because
 * ContactForm.tsx now shows real loading/success/error states, but runtime
 * content lives in MySQL (not messages/*.json — see README), so those files
 * alone don't reach the live site.
 *
 * Run once: npx tsx prisma/add-contact-form-feedback-keys.ts
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const values: Record<string, Record<"th" | "en" | "zh", string>> = {
  formSubmitting: {
    th: "กำลังส่ง...",
    en: "Sending...",
    zh: "发送中...",
  },
  formSuccessTitle: {
    th: "ส่งข้อความเรียบร้อยแล้ว",
    en: "Message sent",
    zh: "留言已发送",
  },
  formSuccessBody: {
    th: "ทีมงานของเราจะติดต่อกลับโดยเร็วที่สุด",
    en: "Our team will get back to you as soon as possible.",
    zh: "我们的团队将尽快与您联系。",
  },
  formError: {
    th: "ส่งข้อความไม่สำเร็จ กรุณาลองใหม่อีกครั้ง",
    en: "Something went wrong. Please try again.",
    zh: "发送失败，请重试。",
  },
};

async function main() {
  for (const [key, byLocale] of Object.entries(values)) {
    for (const [locale, value] of Object.entries(byLocale)) {
      await prisma.pageContent.upsert({
        where: { namespace_key_locale: { namespace: "contact", key, locale } },
        create: { namespace: "contact", key, locale, value },
        update: { value },
      });
    }
  }
  console.log("Done: contact form feedback keys upserted for th/en/zh.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
