/**
 * One-off, idempotent seed for the first batch of SEO blog articles, built
 * around the real MYPOS self-order selling points (anti-fraud, labour cost,
 * multilingual). Idempotent by slug — safe to re-run; it overwrites the
 * article bodies with the versions below.
 *
 * Bodies are Markdown (rendered by components/ui/Markdown): "## " headings,
 * **bold**, and [text](/path) internal links. Edit later via Admin → Blog.
 *
 * Run: npx tsx prisma/add-blog-seo-articles.ts
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

type Locale = "th" | "en" | "zh";
type Article = {
  slug: string;
  featured: boolean;
  sortOrder: number;
  translations: Record<Locale, { title: string; excerpt: string; body: string }>;
};

const ARTICLES: Article[] = [
  {
    slug: "self-order-kiosk-prevent-staff-fraud",
    featured: true,
    sortOrder: 1,
    translations: {
      th: {
        title: "ตู้สั่งอาหารเองแก้ปัญหาพนักงานทุจริตได้อย่างไร",
        excerpt:
          "หนึ่งในปัญหาที่เจ้าของร้านอาหารเจอบ่อยแต่จับได้ยากคือพนักงานรับเงินสดโดยไม่กดขาย ตู้สั่งอาหารด้วยตนเองช่วยปิดช่องโหว่นี้ได้อย่างไร มาดูกัน",
        body: `เจ้าของร้านอาหารหลายคนเคยสงสัยว่า ทำไมวันที่ลูกค้าแน่น ยอดขายในระบบกลับไม่สอดคล้องกับความวุ่นวายหน้าร้าน คำตอบที่พบบ่อยแต่พูดถึงกันน้อยคือ **การทุจริตของพนักงานหน้าเคาน์เตอร์**

## ปัญหานี้เกิดขึ้นได้อย่างไร

รูปแบบที่พบบ่อยที่สุดคือ พนักงานรับออเดอร์และรับเงินสดจากลูกค้า แต่ไม่กดสร้างบิลในระบบ POS แล้วเก็บเงินส่วนนั้นเข้ากระเป๋าตัวเอง เจ้าของร้านที่ไม่ได้อยู่หน้าร้านตลอดเวลาแทบไม่มีทางรู้ เพราะในระบบไม่มีออเดอร์นั้นอยู่เลย ยอดขายที่หายไปจึงกลายเป็นต้นทุนที่มองไม่เห็นซึ่งกัดกินกำไรทุกวัน

## ทำไมการตรวจสอบด้วยคนถึงไม่พอ

การจ้างคนคุมหรือดูกล้องวงจรปิดย้อนหลังทำได้ แต่กินเวลาและต้นทุนสูง อีกทั้งยังจับได้ยากเพราะเกิดเร็วและปะปนกับความวุ่นวายช่วงพีค สุดท้ายเจ้าของร้านส่วนใหญ่จึงได้แค่สงสัย แต่พิสูจน์ไม่ได้

## ตู้สั่งอาหารด้วยตนเองปิดช่องโหว่นี้อย่างไร

หลักการง่ายมาก เมื่อลูกค้าเป็นคนกดสั่งเองที่ตู้ Self-Order **ทุกออเดอร์จะถูกสร้างขึ้นในระบบเสมอ** ไม่มีขั้นตอนที่พนักงานจะเลือกไม่กดได้อีกต่อไป เงินทุกบาทที่เข้ามาจึงผูกกับออเดอร์จริงในระบบ เจ้าของร้านเห็นยอดขายที่แท้จริงแบบเรียลไทม์

## ผลพลอยได้ที่ตามมา

นอกจากปิดช่องทุจริตแล้ว การให้ลูกค้ากดสั่งเองยังลดข้อผิดพลาดของออเดอร์ ลดคิวหน้าเคาน์เตอร์ และปลดพนักงานออกจากการยืนรับออเดอร์ ให้ไปโฟกัสกับการทำอาหารและบริการอื่นแทน กลายเป็นการแก้หลายปัญหาพร้อมกันในการลงทุนครั้งเดียว

## สรุป

การทุจริตของพนักงานเป็นปัญหาที่แก้ด้วยการไว้ใจอย่างเดียวไม่ได้ แต่แก้ได้ด้วยการออกแบบระบบให้ทุกออเดอร์ถูกบันทึกเสมอ [ตู้สั่งอาหารด้วยตนเองของ MYPOS](/solutions/self-order) ทำหน้าที่นี้ได้ตั้งแต่วันแรกที่ติดตั้ง

สนใจดูว่าตู้ Self-Order เหมาะกับร้านคุณไหม [ขอคำปรึกษาและใบเสนอราคา](/contact) กับทีมงาน MYPOS ได้เลย`,
      },
      en: {
        title: "How self-order kiosks stop staff cash-skimming",
        excerpt:
          "A common but hard-to-catch problem for restaurant owners is staff taking cash without ringing up the sale. Here is how self-order kiosks close that gap.",
        body: `Many restaurant owners have wondered why, on the busiest days, the sales in the system don't match the chaos at the counter. A common but rarely-discussed answer is **staff cash-skimming**.

## How it happens

The most common pattern: a staff member takes the order and the cash, but never creates the bill in the POS — then pockets that money. An owner who isn't at the counter all day has almost no way to know, because the order never existed in the system. That lost revenue becomes an invisible cost that eats into profit every day.

## Why manual checks aren't enough

Hiring a supervisor or reviewing CCTV works, but it is slow and expensive — and hard, because it happens fast and blends into the rush. Most owners end up only suspecting, without proof.

## How self-order kiosks close the gap

The principle is simple: when the customer places the order themselves at the kiosk, **every order is always created in the system**. There is no step where a staff member can choose not to ring it up. Every baht received is tied to a real order, and the owner sees true sales in real time.

## The side benefits

Beyond closing the fraud gap, letting customers order themselves reduces order mistakes, shortens the counter queue, and frees staff from taking orders so they can focus on cooking and service — solving several problems with one investment.

## Conclusion

Staff fraud can't be solved by trust alone — it's solved by designing a system where every order is always recorded. [MYPOS self-order kiosks](/solutions/self-order) do exactly that from day one.

Want to see whether a self-order kiosk fits your shop? [Request advice and a quote](/contact) from the MYPOS team.`,
      },
      zh: {
        title: "自助点餐机如何杜绝员工私吞现金",
        excerpt:
          "餐厅老板常遇到却难以察觉的问题：员工收了现金却不开单。自助点餐机如何堵住这个漏洞？",
        body: `许多餐厅老板都疑惑：为何最忙的日子，系统里的营业额与前台的忙碌程度对不上？一个常见却少被讨论的答案是——**员工私吞现金**。

## 问题如何发生

最常见的方式是：员工接单并收取现金，却不在 POS 上开单，然后把这笔钱收进自己口袋。不常在前台的老板几乎无从得知，因为这笔订单在系统里根本不存在。流失的营业额成为每天侵蚀利润的隐形成本。

## 为何人工检查不够

雇人监督或事后查监控可行，但既慢又贵，而且难以取证，因为事情发生得快、又混在高峰期里。多数老板最终只是怀疑，却无法证明。

## 自助点餐机如何堵住漏洞

原理很简单：当顾客自己在自助机上下单，**每一单都必然在系统中生成**，员工再也没有选择不开单的环节。收到的每一分钱都与真实订单绑定，老板可实时看到真实营业额。

## 附带好处

除了堵住漏洞，让顾客自助下单还能减少点错单、缩短前台排队，并让员工从接单中解放出来，专注于备餐与服务——一次投资解决多个问题。

## 结语

员工舞弊无法仅靠信任解决，而是靠设计一套让每一单都被记录的系统。[MYPOS 自助点餐机](/solutions/self-order)从上线第一天起就能做到这一点。

想了解自助点餐机是否适合您的门店？请[联系 MYPOS 团队获取咨询与报价](/contact)。`,
      },
    },
  },
  {
    slug: "reduce-restaurant-labor-cost-self-order",
    featured: false,
    sortOrder: 2,
    translations: {
      th: {
        title: "ลดต้นทุนพนักงานร้านอาหารด้วยตู้ Self-Order Kiosk",
        excerpt:
          "ค่าแรงสูงขึ้นและหาคนทำงานยากคือโจทย์ใหญ่ของร้านอาหารยุคนี้ ตู้สั่งอาหารด้วยตนเองช่วยแบ่งเบาภาระและควบคุมต้นทุนได้อย่างไร",
        body: `ต้นทุนพนักงานคือหนึ่งในค่าใช้จ่ายก้อนใหญ่ที่สุดของร้านอาหาร และในช่วงหลังยิ่งหนักขึ้นจากสองปัจจัย คือค่าแรงที่ปรับสูงขึ้น และการหาพนักงานที่ยากกว่าเดิม

## ปัญหาที่ร้านอาหารกำลังเจอ

หลายร้านเปิดได้ไม่เต็มที่เพราะหาคนไม่ทัน บางร้านต้องจ่ายค่าล่วงเวลาสูงในชั่วโมงพีค และเมื่อพนักงานลาออกบ่อย ต้นทุนการฝึกคนใหม่ก็เพิ่มขึ้นเรื่อย ๆ

## ตู้ Self-Order ช่วยอย่างไร

ตู้สั่งอาหารด้วยตนเองทำหน้าที่รับออเดอร์แทนพนักงานได้ตลอดเวลา โดยไม่ต้องพัก ไม่ลาป่วย และรองรับลูกค้าหลายคนพร้อมกัน ทำให้ร้านไม่ต้องพึ่งจำนวนพนักงานหน้าเคาน์เตอร์มากเท่าเดิม พนักงานที่มีอยู่จึงถูกจัดไปทำงานที่สร้างมูลค่ามากกว่า เช่น ทำอาหารให้ทันและดูแลคุณภาพบริการ

## ไม่ใช่การแทนที่คน แต่คือการจัดสรรคนให้คุ้มค่าขึ้น

เป้าหมายไม่ใช่การไล่พนักงานออก แต่คือการให้เครื่องรับงานซ้ำ ๆ ที่ไม่ต้องใช้ทักษะ แล้วปล่อยให้คนไปทำงานที่เครื่องทำแทนไม่ได้ ร้านจึงบริการได้เท่าเดิมหรือดีขึ้นด้วยจำนวนคนที่เหมาะสม

## คำนวณความคุ้มค่าอย่างไร

ลองเทียบค่าใช้จ่ายพนักงานหนึ่งตำแหน่งต่อเดือนกับค่าตู้ที่จ่ายครั้งเดียวแล้วใช้ได้หลายปี หลายร้านพบว่า **จุดคืนทุนอยู่ในหลักเดือน ไม่ใช่หลักปี** โดยเฉพาะร้านที่มีชั่วโมงพีคชัดเจน

## สรุป

ในยุคที่ค่าแรงสูงและหาคนยาก การลงทุนกับ[ตู้สั่งอาหารด้วยตนเอง](/solutions/self-order)คือวิธีควบคุมต้นทุนที่ยั่งยืนกว่าการแบกค่าจ้างที่เพิ่มขึ้นทุกปี

อยากรู้ว่าร้านคุณคืนทุนภายในกี่เดือน [ติดต่อทีมงาน MYPOS](/contact) เพื่อประเมินและขอใบเสนอราคา`,
      },
      en: {
        title: "Cut restaurant labour cost with a self-order kiosk",
        excerpt:
          "Rising wages and hard-to-fill roles are a major challenge for today's restaurants. Here is how self-order kiosks ease the load and control cost.",
        body: `Labour is one of the biggest costs in a restaurant, and it has grown heavier from two forces: rising wages and the growing difficulty of finding staff.

## The problem restaurants face

Many can't open at full capacity because they can't hire fast enough. Some pay high overtime during peak hours, and frequent turnover keeps pushing up the cost of training new people.

## How self-order kiosks help

A kiosk takes orders in place of staff around the clock — no breaks, no sick days — and serves several customers at once. The shop no longer depends on as many counter staff, so the team you have can be redeployed to higher-value work like keeping food on time and maintaining service quality.

## Not replacing people — allocating them better

The goal isn't to lay people off; it's to let machines handle repetitive, low-skill work and free people for what machines can't do. The shop serves as well or better with the right headcount.

## How to judge the return

Compare the monthly cost of one position against a kiosk you pay for once and use for years. Many shops find the **payback measured in months, not years** — especially those with clear peak hours.

## Conclusion

In an era of high wages and scarce staff, investing in a [self-order kiosk](/solutions/self-order) is a more sustainable way to control cost than absorbing wage increases every year.

Want to know your payback period? [Contact the MYPOS team](/contact) for an assessment and a quote.`,
      },
      zh: {
        title: "用自助点餐机降低餐厅人力成本",
        excerpt:
          "工资上涨、招工困难，是当今餐厅的一大难题。自助点餐机如何分担压力、控制成本？",
        body: `人力是餐厅最大的成本之一，近来又因两大因素而更沉重：工资上涨，以及招工越来越难。

## 餐厅面临的问题

许多店因招不到人而无法满负荷营业；有些店在高峰期支付高额加班费；员工频繁离职又不断推高新人培训成本。

## 自助点餐机如何帮助

自助机可全天代替员工接单——不休息、不请假，并能同时服务多位顾客。门店不再需要那么多前台人员，现有团队便可调配到更有价值的工作，如按时出餐与维护服务质量。

## 不是取代人，而是更合理地配置人

目标不是裁员，而是让机器处理重复、低技能的工作，把人解放到机器做不到的事情上。门店以合适的人手，服务同样出色甚至更好。

## 如何衡量回报

将一个岗位的月成本与一次性购买、可用多年的自助机相比。许多门店发现**回本以月计，而非以年计**，尤其是高峰时段明显的店。

## 结语

在高工资、缺人手的时代，投资[自助点餐机](/solutions/self-order)比每年承担工资上涨更可持续。

想知道您的回本周期？请[联系 MYPOS 团队](/contact)进行评估与报价。`,
      },
    },
  },
  {
    slug: "multilingual-self-order-foreign-customers",
    featured: false,
    sortOrder: 3,
    translations: {
      th: {
        title: "ร้านอาหารรับลูกค้าต่างชาติ ควรมีระบบสั่งอาหารกี่ภาษา",
        excerpt:
          "เมื่อลูกค้าต่างชาติสั่งอาหารไม่ได้เพราะสื่อสารกับพนักงานไม่รู้เรื่อง ร้านก็เสียโอกาสขาย ระบบสั่งอาหารหลายภาษาช่วยได้อย่างไร",
        body: `ในย่านท่องเที่ยวหรือเมืองใหญ่ ลูกค้าต่างชาติคือกลุ่มที่มีกำลังซื้อสูง แต่กลับเป็นกลุ่มที่ร้านอาหารหลายแห่งบริการได้ไม่เต็มที่ เพราะกำแพงภาษา

## ปัญหาที่มองข้ามไม่ได้

เมื่อพนักงานสื่อสารกับลูกค้าต่างชาติไม่ได้ สิ่งที่ตามมาคือออเดอร์ผิด ใช้เวลานาน ลูกค้าหงุดหงิด และบางครั้งลูกค้าเดินออกไปเลย ทุกครั้งที่เกิดเหตุการณ์แบบนี้คือยอดขายที่หายไปและภาพลักษณ์ที่เสียไป

## ควรรองรับกี่ภาษา

คำตอบขึ้นกับกลุ่มลูกค้าของร้าน แต่หลักการคือควรครอบคลุมภาษาของนักท่องเที่ยวกลุ่มหลักที่มาไทย เช่น อังกฤษ จีน ญี่ปุ่น เกาหลี และภาษายุโรปหลัก การรองรับหลายภาษาในเครื่องเดียวจึงยืดหยุ่นกว่าการพึ่งพนักงานที่พูดได้เฉพาะบางภาษา

## ตู้สั่งอาหารหลายภาษาช่วยอย่างไร

[ตู้ Self-Order ของ MYPOS](/solutions/self-order) รองรับ UI **ถึง 10 ภาษา** ลูกค้าเลือกภาษาของตัวเองแล้วสั่งได้ทันที เห็นรูปเมนู รายละเอียด และราคาชัดเจน ไม่ต้องกังวลว่าจะสื่อสารกับพนักงานไม่รู้เรื่อง ออเดอร์จึงถูกต้องตั้งแต่ต้น

## ผลที่ได้กับร้าน

ร้านให้บริการลูกค้าต่างชาติได้ราบรื่นขึ้น ลดออเดอร์ผิด ลดเวลาต่อโต๊ะ และสร้างประสบการณ์ที่ดีจนลูกค้าอยากกลับมาและบอกต่อ กลายเป็นข้อได้เปรียบที่จับต้องได้ในย่านที่มีนักท่องเที่ยว

## สรุป

กำแพงภาษาไม่ควรเป็นเหตุให้เสียลูกค้า ระบบสั่งอาหารหลายภาษาเปลี่ยนอุปสรรคนี้ให้เป็นจุดแข็งของร้าน

อยากให้ร้านคุณรับลูกค้าต่างชาติได้อย่างมืออาชีพ [ติดต่อทีมงาน MYPOS](/contact) เพื่อดูตู้สั่งอาหารหลายภาษา`,
      },
      en: {
        title: "How many languages should your restaurant's ordering system support?",
        excerpt:
          "When foreign customers can't order because they can't communicate with staff, the shop loses sales. Here is how a multilingual ordering system helps.",
        body: `In tourist areas and big cities, foreign customers are a high-spending group — yet one that many restaurants underserve, because of the language barrier.

## A problem you can't ignore

When staff can't communicate with foreign customers, the result is wrong orders, long waits, frustrated guests — and sometimes customers who simply walk out. Every time this happens is lost revenue and a dented reputation.

## How many languages should you support?

It depends on your customer mix, but the principle is to cover the languages of the main tourist groups — for Thailand, that means English, Chinese, Japanese, Korean, and major European languages. Supporting many languages in one device is far more flexible than relying on staff who each speak only a few.

## How a multilingual kiosk helps

[MYPOS self-order kiosks](/solutions/self-order) support a UI in **up to 10 languages**. Customers pick their own language and order right away, seeing menu photos, details, and prices clearly — no worry about miscommunication with staff, so orders are correct from the start.

## The payoff for the shop

You serve foreign customers more smoothly, cut wrong orders, reduce time per table, and create an experience good enough to bring guests back and earn referrals — a tangible edge in tourist areas.

## Conclusion

A language barrier shouldn't cost you customers. A multilingual ordering system turns that obstacle into a strength.

Want your shop to serve foreign customers professionally? [Contact the MYPOS team](/contact) to see the multilingual self-order kiosk.`,
      },
      zh: {
        title: "餐厅点餐系统应支持多少种语言？",
        excerpt:
          "当外国顾客因无法与员工沟通而点不了餐，门店就会流失销售。多语言点餐系统如何解决？",
        body: `在旅游区和大城市，外国顾客是消费力很强的群体，却因语言障碍而被许多餐厅服务不到位。

## 不可忽视的问题

当员工无法与外国顾客沟通，随之而来的是点错单、等待久、顾客不满，有时顾客干脆离开。每一次这样的情况都是流失的营业额与受损的口碑。

## 应支持多少种语言

这取决于您的客群，但原则是覆盖主要旅游群体的语言——对泰国而言，即英语、中文、日语、韩语及主要欧洲语言。一台设备支持多语言，远比依赖各自只会几种语言的员工更灵活。

## 多语言自助机如何帮助

[MYPOS 自助点餐机](/solutions/self-order)的界面支持**多达 10 种语言**。顾客选择自己的语言即可立即下单，清晰看到菜品图片、详情与价格，无需担心与员工沟通不畅，订单从一开始就准确。

## 对门店的收益

您能更顺畅地服务外国顾客，减少错单、缩短每桌用时，并创造足以让顾客回头与推荐的体验——这是旅游区里实实在在的优势。

## 结语

语言障碍不该让您流失顾客。多语言点餐系统把这一障碍变成门店的强项。

想让您的门店专业地服务外国顾客？请[联系 MYPOS 团队](/contact)了解多语言自助点餐机。`,
      },
    },
  },
];

async function main() {
  const locales: Locale[] = ["th", "en", "zh"];
  for (const article of ARTICLES) {
    const post = await prisma.blogPost.upsert({
      where: { slug: article.slug },
      create: { slug: article.slug, featured: article.featured, sortOrder: article.sortOrder },
      update: { featured: article.featured, sortOrder: article.sortOrder },
    });

    for (const locale of locales) {
      const tr = article.translations[locale];
      await prisma.blogPostTranslation.upsert({
        where: { postId_locale: { postId: post.id, locale } },
        create: { postId: post.id, locale, ...tr },
        update: tr,
      });
    }
    console.log(`Seeded article: ${article.slug}`);
  }
  console.log("Done.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
