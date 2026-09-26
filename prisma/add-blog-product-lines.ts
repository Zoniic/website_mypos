/**
 * Idempotent seed: three buying-guide articles for the newer product lines
 * (vending, KDS, queue display). Same editorial rules as
 * add-blog-buying-guides.ts — no invented statistics, customers or
 * competitor claims; MYPOS facts only as confirmed by the product owner.
 * Run: npx tsx prisma/add-blog-product-lines.ts
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

type Locale = "th" | "en" | "zh";
type Article = {
  slug: string;
  sortOrder: number;
  translations: Record<Locale, { title: string; excerpt: string; body: string }>;
};

const ARTICLES: Article[] = [
  {
    slug: "vending-machine-online-vs-coin",
    sortOrder: 9,
    translations: {
      th: {
        title: "ตู้ Vending Machine แบบออนไลน์ กับแบบหยอดเหรียญ เลือกแบบไหนดี",
        excerpt:
          "ตู้ขายสินค้าอัตโนมัติมีทั้งแบบหยอดเหรียญที่ทำงานได้เองและแบบออนไลน์ที่รับสแกนจ่ายและดูสต็อกจากระยะไกล เทียบให้เห็นว่าแต่ละแบบเหมาะกับจุดติดตั้งแบบไหน",
        body: `ตู้ขายสินค้าอัตโนมัติ (Vending Machine) ขายได้ 24 ชั่วโมงโดยไม่ต้องมีพนักงาน แต่ก่อนซื้อต้องตัดสินใจเรื่องใหญ่ข้อแรก คือจะใช้ **แบบหยอดเหรียญที่ทำงานได้เอง** หรือ **แบบออนไลน์ที่เชื่อมระบบหลังบ้าน**

## แบบหยอดเหรียญ (Offline)

รับเหรียญและธนบัตรอย่างเดียว ไม่ต้องต่ออินเทอร์เน็ต และไม่มีระบบหลังบ้าน

- เหมาะกับจุดที่อินเทอร์เน็ตไม่เสถียร หรือต้องการตู้ที่เรียบง่ายที่สุด
- เจ้าของตู้ต้องไปเช็กสต็อกและเก็บเงินที่ตู้เอง

## แบบออนไลน์ (Online)

มีจอสัมผัส รับได้ทั้งเงินสดและสแกนจ่าย และจัดการผ่านระบบหลังบ้าน

- ลูกค้าที่ไม่มีเงินสดก็ซื้อได้ ด้วย QR เช่น PromptPay, WeChat Pay, Alipay, TrueMoney หรือ LAO QR
- ดูสต็อกของทุกตู้จากเว็บหลังบ้าน ไม่ต้องไปเปิดตู้ทีละตู้
- ใช้บัตรเงินสดระบบปิด (Closed-loop) ได้ เหมาะกับโรงงาน สำนักงาน หรือโรงเรียนที่มีบัตรของตัวเอง
- ร้านแจกคูปองส่วนลดเป็นรหัสหรือ QR Code ให้ลูกค้ามาใช้ที่หน้าตู้ได้

## เลือกตู้ตามสินค้า

- **ตู้แบบ CAN** เหมาะกับขวดและกระป๋องทรงกลม มักมีระบบทำความเย็น
- **ตู้แบบ Spiral (สปริงเกลียว)** ใส่สินค้าได้หลากหลายทั้งเครื่องดื่มและถุงขนม บางรุ่นมีลิฟต์ส่งสินค้าลงช่องรับแทนการปล่อยตก

## คำถามที่ควรถามก่อนซื้อ

- จุดติดตั้งมีอินเทอร์เน็ตที่เสถียรไหม
- ลูกค้าส่วนใหญ่จ่ายเงินสดหรือสแกนจ่าย มีนักท่องเที่ยวต่างชาติไหม
- ต้องการดูสต็อกและยอดขายจากระยะไกลหรือเปล่า
- สินค้าที่จะขายต้องแช่เย็นไหม และบรรจุภัณฑ์เป็นแบบไหน

## สรุป

ถ้าต้องการตู้เรียบง่ายในจุดที่ไม่มีอินเทอร์เน็ต เลือก [Vending Machine Offline](/solutions/vending-offline) ถ้าต้องการรับสแกนจ่ายและจัดการหลายตู้จากที่เดียว เลือก [Vending Machine Online](/solutions/vending-online) หรือ [คุยกับทีมงาน](/contact?topic=demo) เพื่อเลือกตู้ให้ตรงกับสินค้าของคุณ`,
      },
      en: {
        title: "Online vs coin-operated vending machines: which should you choose?",
        excerpt:
          "Vending machines come as standalone coin-operated units or online machines that take QR payments and report stock remotely. Here's which fits which location.",
        body: `A vending machine sells around the clock without staff, but the first decision is whether to go **standalone coin-operated** or **online with a back office**.

## Coin-operated (Offline)

Coins and banknotes only, no internet and no back office.

- Suits locations with unreliable internet, or owners who want the simplest machine.
- Stock checks and cash collection happen at the machine.

## Online

A touchscreen, cash plus QR payments, managed from a back office.

- Customers without cash can pay by QR — PromptPay, WeChat Pay, Alipay, TrueMoney or LAO QR.
- See every machine's stock on the web instead of opening each one.
- Closed-loop cash cards for factories, offices or schools with their own cards.
- Shops can hand out discount coupons as codes or QR codes, redeemed at the machine.

## Pick the cabinet for your products

- **CAN cabinets** suit round bottles and cans and are usually refrigerated.
- **Spiral cabinets** take drinks and snack bags; some models have a lift that lowers products to the pickup bay instead of dropping them.

## Questions to ask

- Is there reliable internet at the location?
- Do customers mostly pay cash or scan? Are there foreign tourists?
- Do you need stock and sales remotely?
- Do products need refrigeration, and how are they packaged?

## In short

For a simple machine without internet, choose [Vending Machine Offline](/solutions/vending-offline). For QR payments and managing many machines in one place, choose [Vending Machine Online](/solutions/vending-online) — or [talk to our team](/contact?topic=demo) to match a cabinet to your products.`,
      },
      zh: {
        title: "联网售货机与投币售货机：该选哪一种？",
        excerpt: "自动售货机分为独立运行的投币款和支持扫码支付、远程查看库存的联网款。看看哪种适合哪种场所。",
        body: `自动售货机无需店员即可 24 小时销售，但首先要决定：选择**独立运行的投币款**，还是**连接后台的联网款**。

## 投币款（Offline）

只收硬币和纸币，无需联网，也没有后台。

- 适合网络不稳定的地点，或只想要最简单机器的机主。
- 需要到机器前查库存和收钱。

## 联网款（Online）

配有触摸屏，现金和扫码都能收，并通过后台管理。

- 没有现金的顾客也能用 PromptPay、WeChat Pay、Alipay、TrueMoney 或 LAO QR 扫码购买。
- 在网页上查看每台机器的库存，无需逐台开柜。
- 支持封闭式储值卡，适合有自有卡的工厂、办公室或学校。
- 商家可发放代码或二维码形式的折扣优惠券，在机器前使用。

## 按商品选择机柜

- **CAN 机柜**适合圆形瓶罐，通常带制冷。
- **Spiral 螺旋机柜**可放饮料和袋装零食，部分型号配有升降梯，把商品送到取货口而不是直接掉落。

## 购买前要问的问题

- 安装地点网络是否稳定？
- 顾客主要用现金还是扫码？有外国游客吗？
- 是否需要远程查看库存和销售？
- 商品是否需要冷藏？包装是什么形式？

## 总结

需要在无网络的地点放一台简单的机器，选 [Vending Machine Offline](/solutions/vending-offline)；需要扫码支付并集中管理多台机器，选 [Vending Machine Online](/solutions/vending-online)，或[联系我们的团队](/contact?topic=demo)为您的商品挑选机柜。`,
      },
    },
  },
  {
    slug: "what-is-kds-kitchen-display",
    sortOrder: 10,
    translations: {
      th: {
        title: "KDS จอครัวคืออะไร ร้านอาหารแบบไหนควรใช้",
        excerpt:
          "KDS (Kitchen Display System) คือจอที่แสดงออเดอร์ในครัวแทนใบสั่งกระดาษ มาดูว่าช่วยครัวอย่างไร และต้องเช็กอะไรบ้างก่อนเลือก",
        body: `KDS ย่อมาจาก **Kitchen Display System** คือจอในครัวที่แสดงออเดอร์ทันทีที่ลูกค้าสั่ง แทนการเดินส่งใบสั่งกระดาษหรือตะโกนบอกกัน

## KDS ช่วยครัวอย่างไร

- **ออเดอร์ไม่หาย** ทุกออเดอร์จากตู้สั่งอาหารและ POS ขึ้นจอพร้อมตัวเลือกเสริมและหมายเหตุ
- **เห็นลำดับชัด** ออเดอร์เรียงตามเวลาที่สั่ง ครัวรู้ทันทีว่าออเดอร์ไหนรอนานแล้ว
- **เรียกคิวได้จากจอ** เมื่ออาหารเสร็จ กดเรียกคิวแล้วเลขคิวไปขึ้นบน [จอเรียกคิว](/solutions/queue-display) หน้าร้าน

## ยังพิมพ์ใบสั่งได้ไหม

ได้ ครัวหลายแห่งยังต้องการกระดาษในบางสถานี KDS ของ MYPOS กำหนดได้ว่าหมวดเมนูไหนพิมพ์ออกเครื่องพิมพ์ไหน รองรับทั้งเครื่องพิมพ์ใบเสร็จและเครื่องพิมพ์ฉลาก

## ร้านแบบไหนควรใช้

- ร้านที่ใช้ [ตู้สั่งอาหาร](/solutions/self-order) เพราะออเดอร์เข้ามาพร้อมกันหลายจุด
- ร้านที่ครัวแยกหลายสถานี เช่น เครื่องดื่ม ของทอด อาหารจานหลัก
- ร้านที่ลูกค้ารับอาหารเองที่เคาน์เตอร์และต้องเรียกคิว

## เช็กลิสต์ก่อนเลือก

- ขนาดจอ: จอ 14 นิ้วเหมาะกับครัวเล็กหรือเคาน์เตอร์ จอ 15.6 นิ้วอ่านง่ายจากระยะไกลกว่า
- เชื่อมกับตู้สั่งอาหารและ POS ที่ใช้อยู่ได้โดยตรงไหม
- พิมพ์ใบสั่งแยกสถานีได้ไหม
- ใช้เป็นจุดรับชำระเงินหน้าเคาน์เตอร์ได้ด้วยหรือเปล่า

## สรุป

KDS ทำให้ครัวทำงานตามจอแทนกระดาษ ลดออเดอร์หายและลดการตะโกนเรียกคิว ดูรายละเอียด [KDS จอครัวของ MYPOS](/solutions/kds) หรือ [นัดสาธิตฟรี](/contact?topic=demo)`,
      },
      en: {
        title: "What is a KDS kitchen display, and which restaurants need one?",
        excerpt:
          "A KDS (Kitchen Display System) shows orders on a kitchen screen instead of paper tickets. How it helps, and what to check before choosing one.",
        body: `A **Kitchen Display System (KDS)** is a screen in the kitchen that shows each order the moment it's placed, instead of paper tickets or shouting.

## How a KDS helps

- **No lost orders.** Every order from kiosks and POS appears with options and notes.
- **Clear sequence.** Orders are sorted by time, so the kitchen sees what has waited longest.
- **Call from the screen.** When food is ready, call the number and it appears on the [queue display](/solutions/queue-display).

## Can it still print tickets?

Yes. Many kitchens still want paper at some stations; the MYPOS KDS lets you choose which menu category prints on which printer, receipt or label.

## Which restaurants should use one

- Shops using [self-order kiosks](/solutions/self-order), where orders arrive from several points at once
- Kitchens split into stations — drinks, fryer, mains
- Counter-pickup shops that call queue numbers

## Checklist

- Screen size: 14" suits small kitchens or counters; 15.6" is easier to read from a distance
- Direct connection to your kiosks and POS
- Printing by station
- Can it double as a counter payment point?

## In short

A KDS lets the kitchen work from a screen instead of paper — fewer lost orders, no shouting. See the [MYPOS KDS](/solutions/kds) or [book a free demo](/contact?topic=demo).`,
      },
      zh: {
        title: "什么是 KDS 厨房显示屏？哪些餐厅需要？",
        excerpt: "KDS（厨房显示系统）用厨房屏幕代替纸质单据显示订单。看看它如何帮助厨房，以及选购前要检查什么。",
        body: `**KDS（Kitchen Display System，厨房显示系统）** 是厨房里的屏幕，顾客一下单就显示订单，不再需要送纸单或大声喊单。

## KDS 如何帮助厨房

- **不丢单**：点餐机和 POS 的每张订单连同加料和备注都会显示。
- **顺序清楚**：订单按下单时间排序，厨房一眼看出哪张等得最久。
- **在屏幕上叫号**：餐好后叫号，号码显示在店内[叫号屏](/solutions/queue-display)上。

## 还能打印单据吗？

可以。很多厨房在部分工作站仍需要纸单，MYPOS KDS 可设置各菜单分类打印到哪台打印机，支持小票和标签打印机。

## 哪些餐厅适合

- 使用[自助点餐机](/solutions/self-order)的店，订单同时从多个点进来
- 厨房分成多个工作站，如饮品、油炸、主菜
- 顾客到柜台取餐、需要叫号的店

## 选购清单

- 屏幕尺寸：14 英寸适合小厨房或柜台；15.6 英寸远距离更易读
- 能否直接连接现有点餐机和 POS
- 能否按工作站打印
- 能否兼作柜台收款点

## 总结

KDS 让厨房按屏幕工作，减少丢单、不再喊号。了解 [MYPOS KDS](/solutions/kds) 或[预约免费演示](/contact?topic=demo)。`,
      },
    },
  },
  {
    slug: "queue-display-restaurant",
    sortOrder: 11,
    translations: {
      th: {
        title: "จอเรียกคิวร้านอาหาร ช่วยลดคนมุงหน้าเคาน์เตอร์ได้อย่างไร",
        excerpt:
          "จอเรียกคิวบนทีวีบอกลูกค้าว่าออเดอร์อยู่ขั้นไหน รอชำระ กำลังทำ หรือพร้อมรับ ลดคำถามซ้ำๆ และการตะโกนเรียกคิว ติดตั้งได้ด้วยทีวีที่ร้านมีอยู่",
        body: `ช่วงลูกค้าแน่น ภาพที่เห็นบ่อยคือคนยืนมุงหน้าเคาน์เตอร์ถามว่า "ของผมได้หรือยัง" ขณะที่พนักงานต้องตะโกนเรียกเลขคิวแข่งกับเสียงในร้าน **จอเรียกคิว** แก้ปัญหานี้ด้วยการให้ลูกค้าเห็นสถานะคิวของตัวเองบนจอ

## จอเรียกคิวแสดงอะไรบ้าง

จอเรียกคิวของ MYPOS แบ่งเป็น 3 สถานะ

- **รอชำระเงิน**: สั่งแล้วแต่ยังไม่จ่าย
- **กำลังทำ**: ครัวรับออเดอร์แล้ว
- **พร้อมรับ**: มารับได้เลย

แต่ละสถานะแสดงทั้งจำนวนคิวและเลขคิว

## ได้อะไรจากการมีจอเรียกคิว

- ลูกค้ารอได้อย่างสบายใจ ไม่ต้องถามซ้ำ
- พนักงานไม่ต้องตะโกนเรียก เพราะกดเรียกคิวจาก [KDS จอครัว](/solutions/kds) แล้วเลขคิวขึ้นช่องพร้อมรับทันที
- เจ้าของร้านเห็นว่ามีกี่คิวที่สั่งแล้วแต่ยังไม่จ่าย

## ติดตั้งอย่างไร

- ใช้ทีวีที่มีช่อง HDMI ของร้าน หรือรับเป็นชุดพร้อมทีวี
- เสียบ Android Box ของ MYPOS และต่ออินเทอร์เน็ต
- คิวจาก [ตู้สั่งอาหาร](/solutions/self-order), POS และ KDS ขึ้นจออัตโนมัติ

## สรุป

จอเรียกคิวเป็นอุปกรณ์เล็กๆ ที่ทำให้หน้าร้านเป็นระเบียบขึ้นทันที ดูรายละเอียด [จอเรียกคิวของ MYPOS](/solutions/queue-display) หรือ [ขอคำปรึกษาฟรี](/contact?topic=demo)`,
      },
      en: {
        title: "How a restaurant queue display stops crowding at the counter",
        excerpt:
          "A queue display on your TV tells customers whether their order is awaiting payment, being prepared or ready — fewer repeated questions, no shouting, and it works with the TV you already have.",
        body: `At peak times customers crowd the counter asking "is mine ready?" while staff shout numbers over the noise. A **queue display** fixes this by showing each customer their order status on screen.

## What it shows

The MYPOS queue display has three statuses:

- **Awaiting payment** — ordered but not yet paid
- **Preparing** — the kitchen has it
- **Ready** — come and collect

Each shows the count and the queue numbers.

## What you get

- Customers wait calmly instead of asking again
- No shouting: call from the [KDS kitchen display](/solutions/kds) and the number moves to Ready
- Owners see how many orders are placed but unpaid

## Setup

- Use any TV with HDMI, or get a set with a TV
- Plug in the MYPOS Android box and connect to the internet
- Queues from [self-order kiosks](/solutions/self-order), POS and KDS appear automatically

## In short

A small device that makes the front of the shop orderly straight away. See the [MYPOS queue display](/solutions/queue-display) or [get free advice](/contact?topic=demo).`,
      },
      zh: {
        title: "餐厅叫号显示屏如何减少柜台前的拥挤",
        excerpt: "电视上的叫号屏告诉顾客订单是待付款、制作中还是可取餐——减少重复询问，不用大声喊号，还能用店里现有的电视。",
        body: `高峰时段，顾客常围在柜台前问“我的好了吗”，店员则要在嘈杂中大声喊号。**叫号显示屏**让每位顾客在屏幕上看到自己的订单状态，解决这个问题。

## 显示什么

MYPOS 叫号屏分为三种状态：

- **待付款**：已下单但未付款
- **制作中**：厨房已接单
- **可取餐**：可以来取了

每种状态都显示数量和号码。

## 带来的好处

- 顾客安心等待，不再反复询问
- 不用喊号：在 [KDS 厨房显示屏](/solutions/kds)上叫号，号码即刻移到可取餐栏
- 老板能看到有多少单已下未付

## 如何安装

- 使用店里带 HDMI 的电视，或购买含电视的套装
- 插上 MYPOS Android 盒子并联网
- [自助点餐机](/solutions/self-order)、POS 和 KDS 的号码自动显示

## 总结

一个小设备，立刻让店面更有秩序。了解 [MYPOS 叫号显示屏](/solutions/queue-display)或[获取免费咨询](/contact?topic=demo)。`,
      },
    },
  },
];

async function main() {
  const locales: Locale[] = ["th", "en", "zh"];
  for (const article of ARTICLES) {
    const post = await prisma.blogPost.upsert({
      where: { slug: article.slug },
      create: { slug: article.slug, featured: false, sortOrder: article.sortOrder },
      update: { sortOrder: article.sortOrder },
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
