/**
 * Idempotent migration adding the "industries" namespace — copy for the
 * /industries index and one landing page per business type — plus the nav
 * labels that link to them. Writes the DB (source of truth at runtime) and
 * messages/*.json (seed fallback), same as the other add-*.ts scripts.
 *
 * Copy is a first draft with no invented statistics; the team should add
 * real numbers and customer names via Admin → Page Content → industries.
 * Run: npx tsx prisma/add-industries.ts
 */
import { PrismaClient } from "@prisma/client";
import fs from "node:fs";
import path from "node:path";

const prisma = new PrismaClient();
const messagesDir = path.join(__dirname, "..", "messages");
type Locale = "th" | "en" | "zh";

type PainGain = { pain: string; gain: string };
type Step = { title: string; description: string };
type Faq = { question: string; answer: string };
type Industry = {
  metaTitle: string;
  metaDescription: string;
  hero: { eyebrow: string; title: string; subtitle: string };
  painGain: PainGain[];
  steps: Step[];
  faq: Faq[];
};

type LocaleContent = {
  nav: { industries: string; savingsCalculator: string };
  common: Record<string, unknown>;
  index: Record<string, string>;
  types: Record<string, Industry>;
};

const CONTENT: Record<Locale, LocaleContent> = {
  th: {
    nav: { industries: "ประเภทธุรกิจ", savingsCalculator: "คำนวณความคุ้มค่า" },
    common: {
      breadcrumb: "ประเภทธุรกิจ",
      painGainTitle: "ปัญหาที่เจอบ่อย และสิ่งที่เปลี่ยนไปเมื่อใช้ MYPOS",
      painLabel: "ปัญหาเดิม",
      gainLabel: "หลังใช้ MYPOS",
      stepsTitle: "ระบบทำงานในร้านคุณอย่างไร",
      solutionsTitle: "โซลูชันที่แนะนำ",
      solutionsLede: "เลือกเฉพาะส่วนที่ร้านคุณต้องการ แล้วต่อเพิ่มภายหลังได้",
      solutionBlurbs: {
        selfOrder: "ลูกค้าสั่งและจ่ายเงินเองที่ตู้ ออเดอร์เข้าครัวทันที ลดคิวหน้าเคาน์เตอร์",
        weighPay: "ชั่งน้ำหนักและคิดราคาอัตโนมัติ ลูกค้าจ่ายเองได้ ไม่ต้องรอพนักงาน",
        pos: "เครื่องคิดเงินหน้าร้าน ตัดสต็อก ออกใบเสร็จ และดูรายงานยอดขายได้ทุกที่",
        ticketing: "ขายบัตรและออกตั๋วด้วยตัวเอง รองรับลูกค้าจำนวนมากพร้อมกัน",
      },
      viewSolution: "ดูรายละเอียด",
      productsTitle: "รุ่นที่เหมาะกับธุรกิจนี้",
      viewAllProducts: "ดูสินค้าทั้งหมด",
      casesTitle: "ลูกค้าในธุรกิจนี้",
      casesNote: "ตัวอย่างการติดตั้งจริงจากลูกค้า MYPOS",
      faqTitle: "คำถามที่พบบ่อย",
      calculatorTitle: "อยากรู้ว่าคุ้มแค่ไหน?",
      calculatorBody: "ลองใส่ตัวเลขของร้านคุณ ระบบจะประเมินค่าแรงที่ประหยัดได้และระยะเวลาคืนทุนให้ทันที",
      calculatorCta: "คำนวณความคุ้มค่า",
      ctaDemo: "นัดสาธิตฟรี",
      ctaQuote: "ขอใบเสนอราคา",
    },
    index: {
      metaTitle: "ระบบ POS และ Kiosk ตามประเภทธุรกิจ | MYPOS",
      metaDescription:
        "เลือกระบบ POS ตู้สั่งอาหาร และเครื่องชั่งคิดเงิน ที่ออกแบบมาสำหรับร้านอาหาร โรงอาหาร บุฟเฟต์ เบเกอรี่ ค้าปลีก โรงแรม และสวนสนุก ผลิตในไทย พร้อมทีมดูแลตลอดอายุการใช้งาน",
      eyebrow: "ตามประเภทธุรกิจ",
      title: "ระบบที่ออกแบบมาสำหรับธุรกิจของคุณ",
      lede: "แต่ละธุรกิจมีจังหวะการขายและปัญหาไม่เหมือนกัน เลือกประเภทของคุณเพื่อดูว่าเครื่องและซอฟต์แวร์ของเราช่วยได้อย่างไร",
    },
    types: {
      restaurant: {
        metaTitle: "ระบบ POS ร้านอาหาร และตู้สั่งอาหารด้วยตนเอง | MYPOS",
        metaDescription:
          "ระบบ POS ร้านอาหารพร้อมตู้สั่งอาหาร (Self-Order Kiosk) ส่งออเดอร์เข้าครัวอัตโนมัติ เชื่อมเดลิเวอรีและพร้อมเพย์ ลดคิวช่วงเร่งด่วน ผลิตและดูแลโดยทีมไทย",
        hero: {
          eyebrow: "ร้านอาหาร",
          title: "รับออเดอร์ได้มากขึ้นในช่วงเร่งด่วน โดยไม่ต้องเพิ่มพนักงาน",
          subtitle:
            "ตู้สั่งอาหารและระบบ POS ที่ส่งออเดอร์ตรงเข้าครัว รับชำระเงินได้ทุกช่องทาง และสรุปยอดขายให้เจ้าของร้านดูได้จากมือถือ",
        },
        painGain: [
          { pain: "ช่วงเที่ยงคิวยาว พนักงานรับออเดอร์ไม่ทัน ลูกค้าเดินออก", gain: "ลูกค้าสั่งเองที่ตู้ได้หลายจุดพร้อมกัน พนักงานมีเวลาดูแลหน้าร้าน" },
          { pain: "จดออเดอร์ผิด ครัวทำผิดเมนู เสียทั้งวัตถุดิบและเวลา", gain: "ออเดอร์จากตู้และเครื่อง POS ส่งเข้าครัวตรงตามที่ลูกค้าเลือก" },
          { pain: "แท็บเล็ตเดลิเวอรีหลายเครื่อง ต้องคีย์ออเดอร์ซ้ำ", gain: "รวมออเดอร์หน้าร้านและเดลิเวอรีไว้ในระบบเดียว" },
        ],
        steps: [
          { title: "ลูกค้าสั่งและจ่ายเงิน", description: "สั่งที่ตู้หรือกับพนักงาน จ่ายด้วย QR พร้อมเพย์ บัตร หรือเงินสด" },
          { title: "ออเดอร์เข้าครัวทันที", description: "ใบสั่งพิมพ์ที่ครัวหรือขึ้นจอครัว แยกตามสถานี ไม่ต้องเดินส่งกระดาษ" },
          { title: "เจ้าของร้านเห็นยอดขาย", description: "ดูยอดขายรายเมนู รายชั่วโมง และรายสาขา ได้จากมือถือ" },
        ],
        faq: [
          { question: "ร้านเล็กที่มีพนักงาน 2–3 คน จำเป็นต้องมีตู้สั่งอาหารไหม?", answer: "ไม่จำเป็นต้องเริ่มด้วยตู้ เริ่มจากเครื่อง POS หน้าร้านก่อนได้ และเพิ่มตู้สั่งอาหารภายหลังเมื่อคิวเริ่มยาว ระบบใช้ข้อมูลเมนูชุดเดียวกัน" },
          { question: "เชื่อมกับเดลิเวอรีอย่าง LINE MAN หรือ GrabFood ได้ไหม?", answer: "ได้ ทีมงานจะแนะนำวิธีเชื่อมต่อที่เหมาะกับร้านของคุณในขั้นตอนสำรวจหน้างาน" },
          { question: "ติดตั้งใช้เวลานานแค่ไหน ต้องปิดร้านหรือเปล่า?", answer: "ทีมช่างเข้าติดตั้ง ตั้งค่าเมนู และสอนพนักงานใช้งานถึงร้าน โดยนัดวันเวลาที่ไม่กระทบการขาย" },
        ],
      },
      cafeteria: {
        metaTitle: "ระบบโรงอาหาร ตู้สั่งอาหาร และบัตรพนักงาน | MYPOS",
        metaDescription:
          "ระบบโรงอาหารสำหรับโรงงาน โรงเรียน โรงพยาบาล และอาคารสำนักงาน ตู้สั่งอาหาร เครื่องชั่งคิดเงิน ตัดยอดบัตรพนักงานหรือคูปองอัตโนมัติ สรุปยอดแยกร้านค้าได้",
        hero: {
          eyebrow: "โรงอาหาร",
          title: "ช่วงพักเที่ยงคิวสั้นลง และสรุปยอดแต่ละร้านได้โดยไม่ต้องนับมือ",
          subtitle:
            "ตู้สั่งอาหาร เครื่องชั่งคิดเงิน และระบบตัดยอดบัตรหรือคูปองพนักงาน สำหรับโรงอาหารที่มีหลายร้านค้าและคนจำนวนมากในเวลาเดียวกัน",
        },
        painGain: [
          { pain: "พักเที่ยงมีเวลาจำกัด แต่คิวซื้ออาหารยาว", gain: "กระจายการสั่งและจ่ายเงินไปหลายจุด คิวสั้นลง" },
          { pain: "ใช้คูปองกระดาษ นับยอดและแบ่งเงินให้ร้านค้าผิดพลาดง่าย", gain: "ตัดยอดบัตรหรือคูปองอัตโนมัติ สรุปยอดแยกรายร้านได้ทันที" },
          { pain: "ผู้บริหารไม่เห็นข้อมูลว่าพนักงานใช้สวัสดิการอาหารไปเท่าไร", gain: "รายงานการใช้งานรายคน รายแผนก และรายวัน" },
        ],
        steps: [
          { title: "พนักงานเลือกอาหาร", description: "สั่งที่ตู้หรือวางถาดบนเครื่องชั่งเพื่อคิดราคาตามน้ำหนัก" },
          { title: "จ่ายด้วยบัตรหรือคูปอง", description: "ตัดยอดจากบัตรพนักงาน คูปอง หรือ QR ได้ในจุดเดียว" },
          { title: "สรุปยอดให้แต่ละร้าน", description: "ผู้ดูแลโรงอาหารดูยอดขายแยกรายร้านและรายวันเพื่อแบ่งจ่ายได้ถูกต้อง" },
        ],
        faq: [
          { question: "ใช้กับบัตรพนักงานที่บริษัทมีอยู่แล้วได้ไหม?", answer: "ขึ้นอยู่กับชนิดบัตรที่ใช้ ทีมงานจะตรวจสอบในขั้นตอนสำรวจหน้างานและเสนอวิธีที่เหมาะสม" },
          { question: "โรงอาหารมีหลายร้านค้า แยกยอดขายแต่ละร้านได้ไหม?", answer: "ได้ ระบบบันทึกยอดแยกตามร้านค้า และสรุปรายงานสำหรับการแบ่งจ่ายให้แต่ละร้าน" },
          { question: "มีทั้งอาหารจานเดียวและอาหารตักตามน้ำหนัก ใช้ระบบเดียวกันได้ไหม?", answer: "ได้ ใช้ตู้สั่งอาหารสำหรับเมนูจานเดียว และเครื่องชั่งคิดเงินสำหรับอาหารตักเอง โดยรวมยอดไว้ในระบบเดียว" },
        ],
      },
      buffet: {
        metaTitle: "ระบบร้านบุฟเฟต์ และเครื่องชั่งคิดเงินอัตโนมัติ | MYPOS",
        metaDescription:
          "ระบบสำหรับร้านบุฟเฟต์และร้านตักเองคิดตามน้ำหนัก เช่น มาลาทัง สุกี้ สลัดบาร์ เครื่องชั่งคิดเงินแบบ self-service คิดราคาแม่นยำ ลดคิวจ่ายเงิน",
        hero: {
          eyebrow: "บุฟเฟต์และร้านตักเอง",
          title: "คิดราคาตามน้ำหนักได้แม่นยำ ลูกค้าจ่ายเองได้ไม่ต้องรอ",
          subtitle:
            "เครื่องชั่งคิดเงินแบบ self-service สำหรับร้านมาลาทัง สลัดบาร์ และร้านตักเอง พร้อมระบบ POS สำหรับบุฟเฟต์แบบคิดตามหัว",
        },
        painGain: [
          { pain: "พนักงานชั่งและคิดเงินเอง คิวติดตรงจุดจ่าย", gain: "ลูกค้าวางชาม ระบบชั่งและคิดราคาให้ แล้วจ่ายเองได้ทันที" },
          { pain: "คิดราคาผิด หักภาชนะไม่ตรง ลูกค้าไม่มั่นใจ", gain: "ตั้งค่าน้ำหนักภาชนะและราคาต่อหน่วยไว้ในระบบ คิดราคาเหมือนกันทุกครั้ง" },
          { pain: "บุฟเฟต์คิดตามหัว ต้องจำเวลาเข้าโต๊ะเอง", gain: "บันทึกจำนวนลูกค้าและเวลาเข้าต่อโต๊ะไว้ในระบบ POS" },
        ],
        steps: [
          { title: "ลูกค้าตักอาหาร", description: "เลือกวัตถุดิบหรือเมนูตามต้องการ" },
          { title: "วางบนเครื่องชั่ง", description: "ระบบหักน้ำหนักภาชนะและคำนวณราคาอัตโนมัติ" },
          { title: "จ่ายเงินและรับใบเสร็จ", description: "จ่ายด้วย QR พร้อมเพย์หรือบัตร แล้วส่งออเดอร์เข้าครัวต่อได้ทันที" },
        ],
        faq: [
          { question: "เครื่องชั่งแม่นยำแค่ไหน ลูกค้าจะเชื่อถือไหม?", answer: "ทีมงานจะตั้งค่าน้ำหนักภาชนะและราคาต่อหน่วยให้ตรงกับร้าน และสอนวิธีตรวจสอบความถูกต้องเป็นประจำ" },
          { question: "ร้านมาลาทังต้องส่งชามเข้าครัวต่อ ระบบช่วยตรงนี้ได้ไหม?", answer: "ได้ หลังจ่ายเงิน ระบบพิมพ์หมายเลขออเดอร์เพื่อให้ครัวจับคู่ชามกับลูกค้าได้" },
          { question: "ใช้ร่วมกับระบบบุฟเฟต์แบบคิดตามหัวได้ไหม?", answer: "ได้ ร้านที่มีทั้งแบบคิดตามหัวและตามน้ำหนักใช้เครื่อง POS และเครื่องชั่งร่วมกันในระบบเดียว" },
        ],
      },
      bakery: {
        metaTitle: "ระบบ POS ร้านเบเกอรี่ และเครื่องชั่งคิดเงิน | MYPOS",
        metaDescription:
          "ระบบ POS ร้านเบเกอรี่และคาเฟ่ ขายหน้าร้าน ชั่งน้ำหนักขนม คิดราคาอัตโนมัติ ตัดสต็อกตามรอบอบ และดูเมนูขายดีรายวัน",
        hero: {
          eyebrow: "เบเกอรี่และคาเฟ่",
          title: "ขายหน้าร้านได้เร็วขึ้น และรู้ว่าควรอบอะไรเพิ่มในแต่ละวัน",
          subtitle:
            "เครื่อง POS และเครื่องชั่งคิดเงิน สำหรับร้านที่ขายทั้งชิ้นและตามน้ำหนัก พร้อมรายงานสินค้าขายดีเพื่อวางแผนการผลิต",
        },
        painGain: [
          { pain: "ขนมบางอย่างขายตามน้ำหนัก ต้องคิดราคาเองทุกครั้ง", gain: "เครื่องชั่งคิดราคาตามน้ำหนักให้อัตโนมัติ" },
          { pain: "ไม่รู้ว่าเมนูไหนขายหมดเร็ว อบไม่พอหรืออบเกิน", gain: "ดูยอดขายรายสินค้าและรายช่วงเวลา เพื่อวางแผนรอบอบ" },
          { pain: "ช่วงเช้าลูกค้าเยอะ คิวที่เคาน์เตอร์ยาว", gain: "คิดเงินเร็วขึ้นด้วยปุ่มสินค้าและการจ่ายผ่าน QR" },
        ],
        steps: [
          { title: "เลือกสินค้าหน้าร้าน", description: "ขายเป็นชิ้นหรือชั่งน้ำหนักได้ในเครื่องเดียว" },
          { title: "คิดเงินและจ่าย", description: "รับเงินสด QR พร้อมเพย์ หรือบัตร และออกใบเสร็จ" },
          { title: "ดูรายงานปิดวัน", description: "รู้ว่าสินค้าไหนขายดี ขายหมดตอนไหน เพื่อวางแผนวันถัดไป" },
        ],
        faq: [
          { question: "ร้านเบเกอรี่เล็กๆ เริ่มจากอะไรดี?", answer: "เริ่มจากเครื่อง POS หน้าร้านก่อน และเพิ่มเครื่องชั่งเมื่อมีสินค้าที่ขายตามน้ำหนัก" },
          { question: "มีหลายสาขา ดูยอดรวมได้ไหม?", answer: "ได้ ดูยอดขายแยกรายสาขาและยอดรวมได้จากระบบหลังบ้าน" },
          { question: "รับชำระเงินผ่าน QR ได้ไหม?", answer: "ได้ รองรับพร้อมเพย์ (QR) บัตรเครดิต/เดบิต และช่องทางอื่นตามที่ร้านต้องการ" },
        ],
      },
      retail: {
        metaTitle: "ระบบ POS ร้านค้าปลีก ขายหน้าร้าน ตัดสต็อกอัตโนมัติ | MYPOS",
        metaDescription:
          "ระบบ POS สำหรับร้านค้าปลีก สแกนบาร์โค้ด ตัดสต็อกอัตโนมัติ จัดการหลายสาขา ออกใบกำกับภาษี และดูรายงานยอดขาย เครื่องผลิตในไทย มีทีมดูแลหลังการขาย",
        hero: {
          eyebrow: "ค้าปลีก",
          title: "คิดเงินเร็ว สต็อกตรง และรู้ว่าสินค้าไหนควรสั่งเพิ่ม",
          subtitle:
            "เครื่อง POS หน้าร้านพร้อมสแกนบาร์โค้ด ตัดสต็อกทุกการขาย และรายงานที่ช่วยให้ตัดสินใจเรื่องสินค้าได้จากข้อมูลจริง",
        },
        painGain: [
          { pain: "นับสต็อกด้วยมือ ตัวเลขไม่ตรงกับของจริง", gain: "ตัดสต็อกอัตโนมัติทุกครั้งที่ขาย และแจ้งเมื่อสินค้าใกล้หมด" },
          { pain: "คิดเงินช้าเพราะต้องพิมพ์ราคาเอง", gain: "สแกนบาร์โค้ดแล้วราคาขึ้นทันที ลดการกดผิด" },
          { pain: "มีหลายสาขา แต่รวมยอดขายได้ช้า", gain: "ดูยอดขายและสต็อกทุกสาขาจากที่เดียว" },
        ],
        steps: [
          { title: "สแกนสินค้า", description: "ใช้เครื่องสแกนบาร์โค้ดหรือค้นหาจากหน้าจอ" },
          { title: "รับชำระเงิน", description: "เงินสด QR พร้อมเพย์ บัตร พร้อมออกใบเสร็จหรือใบกำกับภาษี" },
          { title: "สต็อกและรายงานอัปเดตทันที", description: "ดูสินค้าขายดี สินค้าค้างสต็อก และยอดขายรายวัน" },
        ],
        faq: [
          { question: "มีสินค้าหลายพันรายการ ระบบรองรับไหม?", answer: "รองรับ ทีมงานช่วยนำเข้ารายการสินค้าและตั้งค่าเริ่มต้นให้ในขั้นตอนติดตั้ง" },
          { question: "ออกใบกำกับภาษีอิเล็กทรอนิกส์ (e-Tax) ได้ไหม?", answer: "สอบถามทีมงานเพื่อตรวจสอบรูปแบบที่เหมาะกับธุรกิจของคุณ" },
          { question: "ใช้กับเครื่องสแกนและลิ้นชักเก็บเงินได้ไหม?", answer: "ได้ ดูอุปกรณ์เสริมที่รองรับได้ในหน้าอุปกรณ์เสริม หรือให้ทีมงานจัดชุดให้ครบ" },
        ],
      },
      convenience: {
        metaTitle: "ระบบ POS ร้านสะดวกซื้อ มินิมาร์ท ร้านโชห่วย | MYPOS",
        metaDescription:
          "ระบบ POS ร้านสะดวกซื้อและมินิมาร์ท สแกนเร็ว ปิดการขายไว ตัดสต็อกอัตโนมัติ รับพร้อมเพย์และบัตร ดูรายงานยอดขายจากมือถือ",
        hero: {
          eyebrow: "ร้านสะดวกซื้อและมินิมาร์ท",
          title: "ปิดการขายไว ลูกค้าไม่ต้องรอ และรู้ทุกยอดแม้ไม่ได้อยู่หน้าร้าน",
          subtitle:
            "เครื่อง POS ที่ออกแบบมาสำหรับร้านที่ขายเร็วต่อเนื่องทั้งวัน พร้อมตัดสต็อกและรายงานที่เจ้าของร้านดูได้จากทุกที่",
        },
        painGain: [
          { pain: "ช่วงคนเยอะคิดเงินไม่ทัน ลูกค้าวางของแล้วเดินออก", gain: "สแกนและรับเงินได้เร็ว รองรับหลายช่องทางการจ่าย" },
          { pain: "เจ้าของร้านไม่อยู่ ไม่รู้ว่ายอดขายวันนี้เท่าไร", gain: "ดูยอดขายแบบเรียลไทม์จากมือถือ" },
          { pain: "ของหายหรือสต็อกไม่ตรง ตรวจสอบย้อนหลังไม่ได้", gain: "บันทึกทุกการขายและการปรับสต็อก ตรวจสอบย้อนหลังได้" },
        ],
        steps: [
          { title: "สแกนและคิดเงิน", description: "สแกนบาร์โค้ด ราคาขึ้นทันที" },
          { title: "จ่ายได้หลายช่องทาง", description: "เงินสด QR พร้อมเพย์ บัตร และ e-Wallet" },
          { title: "ดูยอดขายจากที่ไหนก็ได้", description: "สรุปยอดรายวันและสินค้าใกล้หมดส่งถึงเจ้าของร้าน" },
        ],
        faq: [
          { question: "ร้านเปิด 24 ชั่วโมง เครื่องทนไหม?", answer: "เราออกแบบและผลิตเครื่องเองสำหรับการใช้งานหน้าร้านต่อเนื่อง และมีทีมซัพพอร์ตไทยดูแลตลอดอายุการใช้งาน" },
          { question: "เริ่มใช้แล้วต้องย้ายข้อมูลสินค้าเองไหม?", answer: "ทีมงานช่วยนำเข้ารายการสินค้าเริ่มต้นให้ในขั้นตอนติดตั้ง" },
          { question: "มีบริการซ่อมถ้าเครื่องเสียไหม?", answer: "มี ดูรายละเอียดการรับประกันและบริการหลังการขายได้ที่หน้าบริการ" },
        ],
      },
      hotel: {
        metaTitle: "ระบบ POS โรงแรม ห้องอาหาร และคีออสก์ | MYPOS",
        metaDescription:
          "ระบบ POS สำหรับห้องอาหารและบาร์ในโรงแรม ตู้สั่งอาหาร คีออสก์ขายบัตรกิจกรรม รองรับการจ่ายเงินหลายสกุลเงินดิจิทัล ดูยอดขายทุกจุดขายในที่เดียว",
        hero: {
          eyebrow: "โรงแรมและรีสอร์ต",
          title: "ทุกจุดขายในโรงแรมอยู่ในระบบเดียว ตั้งแต่ห้องอาหารถึงกิจกรรม",
          subtitle:
            "ระบบ POS สำหรับห้องอาหาร บาร์ และร้านค้า พร้อมตู้สั่งอาหารและคีออสก์ขายบัตรกิจกรรม เพื่อบริการแขกได้เร็วขึ้นในทุกภาษา",
        },
        painGain: [
          { pain: "จุดขายหลายแห่งใช้ระบบคนละแบบ รวมยอดยาก", gain: "ห้องอาหาร บาร์ และร้านค้า ใช้ระบบเดียวกัน ดูยอดรวมได้ทันที" },
          { pain: "แขกต่างชาติสื่อสารกับพนักงานได้ไม่คล่อง", gain: "ตู้สั่งอาหารและคีออสก์รองรับหลายภาษา แขกเลือกเองได้" },
          { pain: "เคาน์เตอร์กิจกรรมคิวยาวช่วงวันหยุด", gain: "คีออสก์ขายบัตรกิจกรรมให้แขกซื้อเองได้ตลอดวัน" },
        ],
        steps: [
          { title: "แขกเลือกบริการ", description: "สั่งอาหารหรือซื้อบัตรกิจกรรมที่ตู้ หรือกับพนักงาน" },
          { title: "ชำระเงินตามสะดวก", description: "บัตร QR พร้อมเพย์ และ e-Wallet ต่างประเทศ เช่น AliPay / WeChat Pay" },
          { title: "ผู้จัดการเห็นทุกจุดขาย", description: "รายงานยอดขายแยกตามแผนกและจุดขาย" },
        ],
        faq: [
          { question: "ตู้สั่งอาหารรองรับภาษาอะไรบ้าง?", answer: "ตั้งค่าเมนูได้หลายภาษา ทีมงานจะตั้งค่าตามกลุ่มแขกหลักของโรงแรม" },
          { question: "เชื่อมกับระบบโรงแรม (PMS) ได้ไหม?", answer: "สอบถามทีมงานพร้อมแจ้งระบบที่ใช้อยู่ เพื่อตรวจสอบแนวทางการเชื่อมต่อ" },
          { question: "มีหลายโครงการ ดูข้อมูลรวมได้ไหม?", answer: "ได้ ดูยอดขายแยกและรวมได้ทุกโครงการจากระบบหลังบ้าน" },
        ],
      },
      themepark: {
        metaTitle: "ระบบขายตั๋ว คีออสก์จำหน่ายตั๋ว สวนสนุก สถานที่ท่องเที่ยว | MYPOS",
        metaDescription:
          "คีออสก์จำหน่ายตั๋วและระบบขายบัตรสำหรับสวนสนุก สวนน้ำ พิพิธภัณฑ์ และสถานที่ท่องเที่ยว ลดคิวหน้าประตู ขายกิจกรรมเสริม และสรุปยอดทุกจุดขาย",
        hero: {
          eyebrow: "สวนสนุกและสถานที่ท่องเที่ยว",
          title: "ลดคิวหน้าประตู และขายกิจกรรมเสริมได้มากขึ้น",
          subtitle:
            "คีออสก์จำหน่ายตั๋วให้ลูกค้าซื้อเองได้หลายจุดพร้อมกัน ร่วมกับระบบ POS สำหรับร้านอาหารและร้านของที่ระลึกภายในพื้นที่",
        },
        painGain: [
          { pain: "วันหยุดคิวซื้อตั๋วยาว ลูกค้าเสียเวลาก่อนเข้าเล่น", gain: "ลูกค้าซื้อตั๋วเองที่คีออสก์หลายจุดพร้อมกัน" },
          { pain: "ขายกิจกรรมเสริมได้น้อย เพราะพนักงานไม่มีเวลาแนะนำ", gain: "คีออสก์แนะนำแพ็กเกจและกิจกรรมเสริมทุกครั้งที่ซื้อ" },
          { pain: "จุดขายตั๋ว ร้านอาหาร และร้านของฝาก แยกระบบกัน", gain: "รวมยอดทุกจุดขายไว้ในที่เดียว" },
        ],
        steps: [
          { title: "ลูกค้าเลือกบัตรหรือแพ็กเกจ", description: "เลือกประเภทบัตร จำนวน และกิจกรรมเสริมที่คีออสก์" },
          { title: "จ่ายเงินและรับตั๋ว", description: "จ่ายด้วย QR หรือบัตร แล้วรับตั๋วที่พิมพ์ออกมาทันที" },
          { title: "ผู้บริหารเห็นยอดทุกจุด", description: "รายงานยอดขายตั๋วและยอดร้านค้าภายในพื้นที่แบบรวมศูนย์" },
        ],
        faq: [
          { question: "คีออสก์ตั้งกลางแจ้งได้ไหม?", answer: "แจ้งสภาพพื้นที่ติดตั้งกับทีมงาน เพื่อเลือกรุ่นและตำแหน่งติดตั้งที่เหมาะสม" },
          { question: "ใช้ร่วมกับระบบตรวจตั๋วที่ประตูได้ไหม?", answer: "สอบถามทีมงานพร้อมแจ้งระบบที่ใช้อยู่ เพื่อตรวจสอบแนวทางการเชื่อมต่อ" },
          { question: "ช่วงไฮซีซันต้องการเครื่องเพิ่มชั่วคราว ทำได้ไหม?", answer: "ติดต่อทีมขายเพื่อพูดคุยรูปแบบที่เหมาะกับช่วงเวลาและจำนวนลูกค้าของคุณ" },
        ],
      },
      manufacturing: {
        metaTitle: "ระบบโรงอาหารโรงงาน และจุดขายภายในโรงงาน | MYPOS",
        metaDescription:
          "ระบบโรงอาหารและจุดขายสำหรับโรงงานและนิคมอุตสาหกรรม ตู้สั่งอาหาร ตัดยอดบัตรพนักงาน สรุปการใช้สวัสดิการรายคนและรายแผนก ผลิตและดูแลโดยทีมไทย",
        hero: {
          eyebrow: "โรงงานและนิคมอุตสาหกรรม",
          title: "โรงอาหารพนักงานที่รองรับคนหลายร้อยคนในช่วงพักเดียวกัน",
          subtitle:
            "ตู้สั่งอาหาร ระบบตัดยอดบัตรพนักงาน และรายงานการใช้สวัสดิการ สำหรับโรงงานที่ต้องการลดคิวและตรวจสอบค่าใช้จ่ายได้ชัดเจน",
        },
        painGain: [
          { pain: "พักเที่ยงแบ่งเป็นรอบ แต่ยังต่อคิวนานจนกินไม่ทัน", gain: "กระจายจุดสั่งและจ่ายเงิน ลดเวลารอในแต่ละรอบพัก" },
          { pain: "ตรวจสอบค่าสวัสดิการอาหารรายคนไม่ได้", gain: "รายงานการใช้งานรายคนและรายแผนก ส่งต่อฝ่ายบุคคลได้" },
          { pain: "ร้านค้าในโรงงานใช้เงินสด ตรวจยอดยาก", gain: "ใช้บัตรพนักงานหรือ QR ตรวจสอบย้อนหลังได้ทุกรายการ" },
        ],
        steps: [
          { title: "พนักงานสั่งอาหาร", description: "เลือกเมนูที่ตู้ หรือซื้อที่ร้านค้าในโรงงาน" },
          { title: "ตัดยอดอัตโนมัติ", description: "ตัดจากบัตรพนักงาน สิทธิ์สวัสดิการ หรือ QR" },
          { title: "สรุปให้ฝ่ายบุคคล", description: "รายงานรายคน รายแผนก และรายเดือน สำหรับตัดเงินเดือนหรือจ่ายร้านค้า" },
        ],
        faq: [
          { question: "มีพนักงานหลายกะ ตั้งสิทธิ์อาหารต่างกันได้ไหม?", answer: "แจ้งเงื่อนไขสวัสดิการของโรงงาน ทีมงานจะเสนอการตั้งค่าที่ตรงกับแต่ละกะ" },
          { question: "ส่งข้อมูลไปยังฝ่ายบุคคลหรือระบบเงินเดือนได้ไหม?", answer: "ส่งออกรายงานเพื่อใช้กับระบบเงินเดือนได้ รายละเอียดการเชื่อมต่อสอบถามทีมงาน" },
          { question: "ติดตั้งในนิคมต่างจังหวัดได้ไหม?", answer: "ได้ ทีมงานเข้าสำรวจและติดตั้งถึงหน้างาน สอบถามพื้นที่ให้บริการได้ที่ทีมขาย" },
        ],
      },
    },
  },
  en: {
    nav: { industries: "Industries", savingsCalculator: "Savings calculator" },
    common: {
      breadcrumb: "Industries",
      painGainTitle: "Common problems — and what changes with MYPOS",
      painLabel: "Before",
      gainLabel: "With MYPOS",
      stepsTitle: "How it works in your business",
      solutionsTitle: "Recommended solutions",
      solutionsLede: "Start with only what you need and add more later.",
      solutionBlurbs: {
        selfOrder: "Customers order and pay at the kiosk; orders go straight to the kitchen.",
        weighPay: "Weigh and price automatically; customers pay without waiting for staff.",
        pos: "Counter checkout with stock control, receipts and sales reports anywhere.",
        ticketing: "Self-service ticket sales that handle large crowds at once.",
      },
      viewSolution: "View details",
      productsTitle: "Models for this industry",
      viewAllProducts: "View all products",
      casesTitle: "Customers in this industry",
      casesNote: "Real installations by MYPOS customers",
      faqTitle: "Frequently asked questions",
      calculatorTitle: "Want to know if it pays off?",
      calculatorBody: "Enter your own numbers to estimate labour savings and payback time instantly.",
      calculatorCta: "Calculate savings",
      ctaDemo: "Book a free demo",
      ctaQuote: "Request a quote",
    },
    index: {
      metaTitle: "POS & Kiosk Systems by Industry | MYPOS",
      metaDescription:
        "POS systems, self-order kiosks and weigh-and-pay scales built for restaurants, cafeterias, buffets, bakeries, retail, hotels and theme parks. Made in Thailand with lifetime local support.",
      eyebrow: "By industry",
      title: "Systems built for your kind of business",
      lede: "Every business sells differently. Pick yours to see how our hardware and software fit.",
    },
    types: {
      restaurant: {
        metaTitle: "Restaurant POS & Self-Order Kiosks | MYPOS",
        metaDescription:
          "Restaurant POS with self-order kiosks, orders sent straight to the kitchen, delivery and PromptPay support. Shorter peak-hour queues. Made and supported in Thailand.",
        hero: {
          eyebrow: "Restaurants",
          title: "Take more orders at peak hours without adding staff",
          subtitle: "Self-order kiosks and POS that send orders straight to the kitchen, accept every payment method, and report sales to your phone.",
        },
        painGain: [
          { pain: "Lunch queues outpace staff and customers walk away", gain: "Customers order at several kiosks at once; staff focus on service" },
          { pain: "Handwritten orders get mixed up in the kitchen", gain: "Orders reach the kitchen exactly as the customer chose them" },
          { pain: "Several delivery tablets and orders keyed in twice", gain: "In-store and delivery orders in one system" },
        ],
        steps: [
          { title: "Customer orders and pays", description: "At the kiosk or with staff — PromptPay QR, card or cash" },
          { title: "Order hits the kitchen", description: "Printed or shown on a kitchen screen, split by station" },
          { title: "Owner sees the numbers", description: "Sales by menu item, hour and branch, on your phone" },
        ],
        faq: [
          { question: "Does a small restaurant with 2–3 staff need a kiosk?", answer: "Not to start. Begin with a counter POS and add kiosks later when queues grow — they share the same menu data." },
          { question: "Can it work with LINE MAN or GrabFood?", answer: "Yes. Our team recommends the right setup for your restaurant during the site survey." },
          { question: "How long does installation take? Do we need to close?", answer: "Our technicians install, set up the menu and train staff on-site at a time that doesn't disrupt service." },
        ],
      },
      cafeteria: {
        metaTitle: "Cafeteria Systems, Kiosks & Staff Card Payment | MYPOS",
        metaDescription:
          "Cafeteria systems for factories, schools, hospitals and office buildings: self-order kiosks, weigh-and-pay scales, automatic staff card or coupon deduction, and per-vendor reports.",
        hero: {
          eyebrow: "Cafeterias",
          title: "Shorter lunch queues and vendor totals without manual counting",
          subtitle: "Kiosks, weigh-and-pay scales and staff card or coupon payment for cafeterias with many vendors and large crowds.",
        },
        painGain: [
          { pain: "Short lunch breaks but long food queues", gain: "Ordering and payment spread across several points" },
          { pain: "Paper coupons make vendor settlement error-prone", gain: "Automatic card/coupon deduction with per-vendor totals" },
          { pain: "Management can't see meal-benefit usage", gain: "Usage reports per person, department and day" },
        ],
        steps: [
          { title: "Staff choose their food", description: "Order at a kiosk or weigh the tray for self-serve dishes" },
          { title: "Pay by card or coupon", description: "Staff card, coupon or QR at one point" },
          { title: "Totals per vendor", description: "Daily sales per vendor for accurate settlement" },
        ],
        faq: [
          { question: "Can we use our existing staff cards?", answer: "It depends on the card type. We check this during the site survey and propose the best approach." },
          { question: "Can sales be split by vendor?", answer: "Yes. Sales are recorded per vendor with settlement reports." },
          { question: "We serve both set dishes and self-serve by weight — one system?", answer: "Yes. Kiosks for set dishes and scales for self-serve, all totalled in one system." },
        ],
      },
      buffet: {
        metaTitle: "Buffet & Weigh-and-Pay Checkout Systems | MYPOS",
        metaDescription:
          "Systems for buffets and pay-by-weight shops such as mala tang, suki and salad bars. Self-service weigh-and-pay scales price accurately and shorten checkout queues.",
        hero: {
          eyebrow: "Buffets & self-serve",
          title: "Accurate pay-by-weight pricing that customers can pay for themselves",
          subtitle: "Self-service weigh-and-pay scales for mala tang, salad bars and self-serve shops, plus POS for per-head buffets.",
        },
        painGain: [
          { pain: "Staff weigh and charge by hand, so checkout backs up", gain: "Customers place the bowl, the system prices it, and they pay" },
          { pain: "Pricing and container weight vary, customers doubt it", gain: "Container weight and unit price set in the system — consistent every time" },
          { pain: "Per-head buffets rely on remembering seating times", gain: "Guest count and seating time recorded per table in the POS" },
        ],
        steps: [
          { title: "Customer serves themselves", description: "Choose ingredients or dishes" },
          { title: "Place it on the scale", description: "Container weight is deducted and the price calculated" },
          { title: "Pay and get a receipt", description: "PromptPay QR or card, then the order goes to the kitchen" },
        ],
        faq: [
          { question: "How accurate is the scale?", answer: "We configure container weights and unit prices for your shop and show staff how to check accuracy regularly." },
          { question: "Mala tang bowls go to the kitchen — can the system help?", answer: "Yes. After payment it prints an order number so the kitchen can match bowls to customers." },
          { question: "Can it work alongside per-head buffet pricing?", answer: "Yes. Shops using both share one POS and scale system." },
        ],
      },
      bakery: {
        metaTitle: "Bakery POS & Weighing Scales | MYPOS",
        metaDescription:
          "POS for bakeries and cafés: sell by piece or weight, automatic pricing, stock by baking batch, and daily best-seller reports.",
        hero: {
          eyebrow: "Bakeries & cafés",
          title: "Faster counter sales — and knowing what to bake more of",
          subtitle: "POS and weighing scales for shops selling by piece and by weight, with best-seller reports to plan production.",
        },
        painGain: [
          { pain: "Items sold by weight need manual price calculation", gain: "The scale prices by weight automatically" },
          { pain: "Unsure what sells out, so you under- or over-bake", gain: "Sales by item and time slot to plan baking" },
          { pain: "Morning rush creates long counter queues", gain: "Faster checkout with item buttons and QR payment" },
        ],
        steps: [
          { title: "Pick items at the counter", description: "Sell by piece or by weight on one device" },
          { title: "Checkout", description: "Cash, PromptPay QR or card, with receipts" },
          { title: "End-of-day report", description: "See best sellers and sell-out times to plan tomorrow" },
        ],
        faq: [
          { question: "Where should a small bakery start?", answer: "Start with a counter POS and add a scale when you sell items by weight." },
          { question: "Can I see totals across branches?", answer: "Yes, per branch and combined, from the back office." },
          { question: "Can customers pay by QR?", answer: "Yes — PromptPay QR, credit/debit cards and other methods you need." },
        ],
      },
      retail: {
        metaTitle: "Retail POS with Automatic Stock Control | MYPOS",
        metaDescription:
          "Retail POS with barcode scanning, automatic stock deduction, multi-branch management, tax invoices and sales reports. Made in Thailand with after-sales support.",
        hero: {
          eyebrow: "Retail",
          title: "Fast checkout, accurate stock, and clear reorder decisions",
          subtitle: "Counter POS with barcode scanning, stock deducted on every sale, and reports that turn real data into buying decisions.",
        },
        painGain: [
          { pain: "Manual stock counts never match reality", gain: "Stock deducted on every sale, with low-stock alerts" },
          { pain: "Slow checkout from typing prices by hand", gain: "Scan a barcode and the price appears — fewer mistakes" },
          { pain: "Several branches but slow to consolidate sales", gain: "Sales and stock for every branch in one place" },
        ],
        steps: [
          { title: "Scan items", description: "Barcode scanner or on-screen search" },
          { title: "Take payment", description: "Cash, PromptPay QR or card, with receipt or tax invoice" },
          { title: "Stock and reports update", description: "Best sellers, slow movers and daily sales" },
        ],
        faq: [
          { question: "We have thousands of SKUs — is that supported?", answer: "Yes. Our team helps import your product list during installation." },
          { question: "Can it issue e-Tax invoices?", answer: "Please ask our team to confirm the right format for your business." },
          { question: "Does it work with scanners and cash drawers?", answer: "Yes. See supported devices on the Accessories page, or let our team put together a complete set." },
        ],
      },
      convenience: {
        metaTitle: "POS for Convenience Stores & Minimarts | MYPOS",
        metaDescription:
          "Convenience store and minimart POS: fast scanning and checkout, automatic stock deduction, PromptPay and card payments, and sales reports on your phone.",
        hero: {
          eyebrow: "Convenience stores & minimarts",
          title: "Quick checkout, no waiting — and every sale visible even when you're away",
          subtitle: "POS built for all-day, high-frequency sales, with stock control and reports the owner can check from anywhere.",
        },
        painGain: [
          { pain: "Rush hours overwhelm the till and customers leave", gain: "Fast scanning and payment with many methods" },
          { pain: "The owner is away and can't see today's sales", gain: "Real-time sales on your phone" },
          { pain: "Shrinkage or stock gaps with no audit trail", gain: "Every sale and stock adjustment recorded and traceable" },
        ],
        steps: [
          { title: "Scan and charge", description: "Scan a barcode and the price appears" },
          { title: "Many payment options", description: "Cash, PromptPay QR, cards and e-wallets" },
          { title: "Sales from anywhere", description: "Daily totals and low-stock items sent to the owner" },
        ],
        faq: [
          { question: "We're open 24 hours — is the hardware durable?", answer: "We design and build our own hardware for continuous counter use, with Thai support for its whole working life." },
          { question: "Do we have to migrate product data ourselves?", answer: "Our team imports your initial product list during installation." },
          { question: "Is repair service available?", answer: "Yes. See warranty and after-sales details on the Service page." },
        ],
      },
      hotel: {
        metaTitle: "Hotel POS, Restaurant Systems & Kiosks | MYPOS",
        metaDescription:
          "POS for hotel restaurants and bars, self-order kiosks and activity ticket kiosks, with international e-wallet support and every outlet's sales in one place.",
        hero: {
          eyebrow: "Hotels & resorts",
          title: "Every outlet in one system — from restaurant to activities",
          subtitle: "POS for restaurants, bars and shops, plus self-order and activity ticket kiosks to serve guests faster in their own language.",
        },
        painGain: [
          { pain: "Outlets run different systems and totals are hard to combine", gain: "Restaurant, bar and shop on one system with instant totals" },
          { pain: "International guests struggle to communicate with staff", gain: "Multilingual kiosks let guests choose for themselves" },
          { pain: "Activity desks get long queues on holidays", gain: "Activity ticket kiosks guests use all day" },
        ],
        steps: [
          { title: "Guests choose", description: "Order food or buy activity tickets at a kiosk or with staff" },
          { title: "Pay their way", description: "Cards, PromptPay QR and international e-wallets such as AliPay / WeChat Pay" },
          { title: "Managers see every outlet", description: "Sales reports by department and outlet" },
        ],
        faq: [
          { question: "Which languages do the kiosks support?", answer: "Menus can be set up in several languages; we configure them for your main guest groups." },
          { question: "Can it connect to our hotel PMS?", answer: "Tell our team which system you use and we'll check the integration options." },
          { question: "We run several properties — can we see combined data?", answer: "Yes, per property and combined, from the back office." },
        ],
      },
      themepark: {
        metaTitle: "Ticketing Kiosks for Theme Parks & Attractions | MYPOS",
        metaDescription:
          "Self-service ticketing kiosks and ticket sales for theme parks, water parks, museums and attractions. Shorter gate queues, more add-on sales, and every outlet's totals in one place.",
        hero: {
          eyebrow: "Theme parks & attractions",
          title: "Shorter gate queues and more add-on sales",
          subtitle: "Ticketing kiosks guests use at several points at once, plus POS for food and souvenir outlets on site.",
        },
        painGain: [
          { pain: "Long weekend ticket queues before guests even get in", gain: "Guests buy tickets at several kiosks at once" },
          { pain: "Few add-on sales because staff have no time to upsell", gain: "Kiosks suggest packages and add-ons on every purchase" },
          { pain: "Tickets, food and souvenirs run on separate systems", gain: "All outlets' totals in one place" },
        ],
        steps: [
          { title: "Choose tickets or packages", description: "Ticket type, quantity and add-ons at the kiosk" },
          { title: "Pay and collect", description: "QR or card, with tickets printed on the spot" },
          { title: "Management sees everything", description: "Central reports for tickets and on-site outlets" },
        ],
        faq: [
          { question: "Can kiosks be installed outdoors?", answer: "Tell our team about the installation area so we can recommend the right model and placement." },
          { question: "Can it work with our gate access system?", answer: "Tell our team which system you use and we'll check the integration options." },
          { question: "Can we add kiosks temporarily for high season?", answer: "Talk to our sales team about an arrangement that fits your season and visitor numbers." },
        ],
      },
      manufacturing: {
        metaTitle: "Factory Canteen Systems & On-Site Points of Sale | MYPOS",
        metaDescription:
          "Canteen and point-of-sale systems for factories and industrial estates: self-order kiosks, staff card deduction, and meal-benefit reports per person and department. Made and supported in Thailand.",
        hero: {
          eyebrow: "Factories & industrial estates",
          title: "A staff canteen that serves hundreds in the same break",
          subtitle: "Self-order kiosks, staff card payment and meal-benefit reports for factories that want shorter queues and clear cost tracking.",
        },
        painGain: [
          { pain: "Staggered breaks, yet queues still eat into meal time", gain: "More ordering and payment points, less waiting per break" },
          { pain: "No way to audit meal benefits per person", gain: "Usage reports per person and department for HR" },
          { pain: "On-site shops take cash that's hard to reconcile", gain: "Staff card or QR with a full audit trail" },
        ],
        steps: [
          { title: "Staff order", description: "At a kiosk or an on-site shop" },
          { title: "Automatic deduction", description: "From staff cards, meal allowances or QR" },
          { title: "Summary for HR", description: "Per person, department and month for payroll or vendor payment" },
        ],
        faq: [
          { question: "We run several shifts — can meal allowances differ?", answer: "Share your benefit rules and we'll propose settings for each shift." },
          { question: "Can data go to HR or payroll?", answer: "Reports can be exported for payroll; ask our team about integration details." },
          { question: "Can you install at estates outside Bangkok?", answer: "Yes. Our team surveys and installs on site — ask sales about service areas." },
        ],
      },
    },
  },
  zh: {
    nav: { industries: "行业方案", savingsCalculator: "节省计算器" },
    common: {
      breadcrumb: "行业方案",
      painGainTitle: "常见问题，以及使用 MYPOS 后的改变",
      painLabel: "以前",
      gainLabel: "使用 MYPOS 后",
      stepsTitle: "系统在您店里如何运作",
      solutionsTitle: "推荐方案",
      solutionsLede: "只选您需要的部分，之后可随时扩展。",
      solutionBlurbs: {
        selfOrder: "顾客在自助机点餐付款，订单即时传到厨房，减少柜台排队。",
        weighPay: "自动称重计价，顾客可自助付款，无需等待店员。",
        pos: "前台收银，自动扣减库存，出具收据，随时随地查看销售报表。",
        ticketing: "自助售票出票，可同时服务大量顾客。",
      },
      viewSolution: "查看详情",
      productsTitle: "适合该行业的机型",
      viewAllProducts: "查看全部产品",
      casesTitle: "该行业的客户",
      casesNote: "MYPOS 客户的真实安装案例",
      faqTitle: "常见问题",
      calculatorTitle: "想知道是否划算？",
      calculatorBody: "输入您店里的数字，立即估算可节省的人工成本和回本时间。",
      calculatorCta: "计算节省",
      ctaDemo: "预约免费演示",
      ctaQuote: "获取报价",
    },
    index: {
      metaTitle: "按行业选择 POS 与自助机系统 | MYPOS",
      metaDescription:
        "为餐厅、食堂、自助餐、烘焙店、零售、酒店和主题乐园打造的 POS 系统、自助点餐机和称重收银秤。泰国制造，全生命周期本地服务。",
      eyebrow: "按行业",
      title: "为您的行业量身打造的系统",
      lede: "每个行业的销售方式各不相同。选择您的行业，了解我们的硬件和软件如何帮助您。",
    },
    types: {
      restaurant: {
        metaTitle: "餐厅 POS 系统与自助点餐机 | MYPOS",
        metaDescription: "餐厅 POS 与自助点餐机，订单自动传到厨房，支持外卖平台与 PromptPay，缩短高峰排队。泰国制造与服务。",
        hero: {
          eyebrow: "餐厅",
          title: "高峰期接更多订单，无需增加人手",
          subtitle: "自助点餐机与 POS 将订单直接送到厨房，支持各种付款方式，销售数据随时在手机上查看。",
        },
        painGain: [
          { pain: "午餐高峰点餐跟不上，顾客离开", gain: "顾客可在多台自助机同时点餐，店员专注服务" },
          { pain: "手写订单出错，厨房做错菜", gain: "订单按顾客所选准确送达厨房" },
          { pain: "多台外卖平板，订单重复录入", gain: "堂食与外卖订单集中在一个系统" },
        ],
        steps: [
          { title: "顾客点餐付款", description: "在自助机或店员处点餐，PromptPay 二维码、银行卡或现金付款" },
          { title: "订单即时到厨房", description: "打印或显示在厨房屏幕上，按工位分单" },
          { title: "老板查看销售", description: "在手机上查看按菜品、时段和分店的销售" },
        ],
        faq: [
          { question: "只有 2–3 名员工的小餐厅需要自助机吗？", answer: "不必一开始就上自助机。可先用前台 POS，排队变长时再加装自助机，共用同一套菜单数据。" },
          { question: "能对接 LINE MAN 或 GrabFood 吗？", answer: "可以。我们会在现场勘察时推荐适合您餐厅的对接方式。" },
          { question: "安装需要多久？需要停业吗？", answer: "技术人员上门安装、设置菜单并培训员工，时间安排不影响营业。" },
        ],
      },
      cafeteria: {
        metaTitle: "食堂系统、自助点餐机与员工卡支付 | MYPOS",
        metaDescription: "适用于工厂、学校、医院和写字楼的食堂系统：自助点餐机、称重收银秤、员工卡或餐券自动扣款，按商户出报表。",
        hero: {
          eyebrow: "食堂",
          title: "午餐排队更短，各商户营业额无需手工统计",
          subtitle: "为商户多、人流大的食堂提供自助点餐机、称重收银秤以及员工卡或餐券支付。",
        },
        painGain: [
          { pain: "午休时间短，排队却很长", gain: "点餐与付款分散到多个点位" },
          { pain: "纸质餐券结算容易出错", gain: "员工卡/餐券自动扣款，按商户汇总" },
          { pain: "管理层看不到餐补使用情况", gain: "按人员、部门和日期出使用报表" },
        ],
        steps: [
          { title: "员工选餐", description: "在自助机点餐，或将餐盘放上秤按重量计价" },
          { title: "刷卡或用餐券付款", description: "员工卡、餐券或二维码一处完成" },
          { title: "按商户汇总", description: "每日各商户销售数据，结算准确" },
        ],
        faq: [
          { question: "可以使用公司现有的员工卡吗？", answer: "取决于卡片类型，我们会在现场勘察时确认并提出合适方案。" },
          { question: "能按商户拆分营业额吗？", answer: "可以，系统按商户记录并提供结算报表。" },
          { question: "既有套餐又有称重自选，能用同一系统吗？", answer: "可以。套餐用自助机，自选用称重秤，统一汇总。" },
        ],
      },
      buffet: {
        metaTitle: "自助餐与称重收银系统 | MYPOS",
        metaDescription: "适用于自助餐及按重量计价门店（如麻辣烫、寿喜锅、沙拉吧）的系统。自助称重收银秤计价准确，缩短结账排队。",
        hero: {
          eyebrow: "自助餐与自选店",
          title: "按重量精准计价，顾客可自助付款",
          subtitle: "为麻辣烫、沙拉吧和自选店提供自助称重收银秤，并为按人头计价的自助餐提供 POS。",
        },
        painGain: [
          { pain: "店员手工称重收款，结账处拥堵", gain: "顾客放碗，系统自动计价，顾客自助付款" },
          { pain: "计价与扣除容器重量不一致，顾客存疑", gain: "系统预设容器重量与单价，每次一致" },
          { pain: "按人头计价需人工记住入座时间", gain: "POS 按桌记录人数与入座时间" },
        ],
        steps: [
          { title: "顾客自选", description: "选择食材或菜品" },
          { title: "放上秤", description: "自动扣除容器重量并计算价格" },
          { title: "付款取小票", description: "PromptPay 二维码或银行卡付款，订单随即送往厨房" },
        ],
        faq: [
          { question: "秤的精度如何？", answer: "我们会按门店设置容器重量和单价，并教店员定期校验。" },
          { question: "麻辣烫的碗要送厨房，系统能帮忙吗？", answer: "可以。付款后打印订单号，方便厨房对应顾客。" },
          { question: "能与按人头计价的自助餐一起使用吗？", answer: "可以，两种模式共用一套 POS 与称重系统。" },
        ],
      },
      bakery: {
        metaTitle: "烘焙店 POS 与称重秤 | MYPOS",
        metaDescription: "适用于烘焙店和咖啡馆的 POS：按件或按重量销售、自动计价、按烘焙批次管理库存、每日畅销报表。",
        hero: {
          eyebrow: "烘焙店与咖啡馆",
          title: "前台卖得更快，也知道每天该多烤什么",
          subtitle: "适用于按件和按重量销售的门店的 POS 与称重秤，并提供畅销报表以规划生产。",
        },
        painGain: [
          { pain: "按重量销售的商品需人工计价", gain: "秤自动按重量计价" },
          { pain: "不清楚什么先卖完，烤少或烤多", gain: "按商品和时段查看销售，规划烘焙批次" },
          { pain: "早高峰前台排队长", gain: "商品按键与二维码付款，结账更快" },
        ],
        steps: [
          { title: "前台选购", description: "按件或按重量在同一设备上销售" },
          { title: "结账", description: "现金、PromptPay 二维码或银行卡，并出具收据" },
          { title: "日终报表", description: "查看畅销品和售罄时间，规划明天" },
        ],
        faq: [
          { question: "小型烘焙店应从什么开始？", answer: "先从前台 POS 开始，有按重量销售的商品时再加装称重秤。" },
          { question: "能查看多家分店的汇总吗？", answer: "可以，在后台查看各分店及汇总数据。" },
          { question: "顾客能用二维码付款吗？", answer: "可以，支持 PromptPay 二维码、借记卡/信用卡等方式。" },
        ],
      },
      retail: {
        metaTitle: "零售 POS，自动库存管理 | MYPOS",
        metaDescription: "零售 POS：条码扫描、自动扣减库存、多门店管理、开具税务发票和销售报表。泰国制造，提供售后服务。",
        hero: {
          eyebrow: "零售",
          title: "结账快、库存准，补货决策更清晰",
          subtitle: "带条码扫描的前台 POS，每笔销售自动扣库存，用真实数据支持进货决策。",
        },
        painGain: [
          { pain: "手工盘点与实际不符", gain: "每笔销售自动扣库存，并提醒低库存" },
          { pain: "手动输入价格导致结账慢", gain: "扫码即出价，减少错误" },
          { pain: "多家门店汇总销售慢", gain: "所有门店的销售与库存集中查看" },
        ],
        steps: [
          { title: "扫描商品", description: "条码扫描枪或屏幕搜索" },
          { title: "收款", description: "现金、PromptPay 二维码或银行卡，出具收据或税务发票" },
          { title: "库存与报表即时更新", description: "畅销品、滞销品和每日销售" },
        ],
        faq: [
          { question: "我们有几千个商品，系统支持吗？", answer: "支持。安装时我们会协助导入商品清单。" },
          { question: "能开具电子税务发票（e-Tax）吗？", answer: "请咨询我们的团队，以确认适合您业务的格式。" },
          { question: "能配合扫描枪和钱箱使用吗？", answer: "可以。在配件页面查看支持的设备，或由我们为您配齐。" },
        ],
      },
      convenience: {
        metaTitle: "便利店与迷你超市 POS | MYPOS",
        metaDescription: "便利店与迷你超市 POS：快速扫码结账、自动扣库存、支持 PromptPay 和银行卡，手机查看销售报表。",
        hero: {
          eyebrow: "便利店与迷你超市",
          title: "结账快不用等，人不在店也能看到每笔销售",
          subtitle: "为全天高频销售打造的 POS，配备库存管理和老板随时可查的报表。",
        },
        painGain: [
          { pain: "高峰收银跟不上，顾客放下商品离开", gain: "扫码快、收款快，支持多种付款方式" },
          { pain: "老板不在店，不知道今天卖了多少", gain: "手机实时查看销售" },
          { pain: "商品丢失或库存不符，无法追溯", gain: "每笔销售与库存调整都有记录可查" },
        ],
        steps: [
          { title: "扫码收银", description: "扫描条码即出价格" },
          { title: "多种付款方式", description: "现金、PromptPay 二维码、银行卡和电子钱包" },
          { title: "随时随地看销售", description: "每日汇总与低库存商品推送给老板" },
        ],
        faq: [
          { question: "我们 24 小时营业，设备耐用吗？", answer: "我们自主设计和生产适合前台连续使用的设备，并由泰国团队提供全生命周期支持。" },
          { question: "需要自己迁移商品数据吗？", answer: "安装时我们会导入初始商品清单。" },
          { question: "设备坏了有维修服务吗？", answer: "有。保修与售后详情请见服务页面。" },
        ],
      },
      hotel: {
        metaTitle: "酒店 POS、餐厅系统与自助机 | MYPOS",
        metaDescription: "适用于酒店餐厅与酒吧的 POS、自助点餐机和活动售票机，支持国际电子钱包，所有营业点销售集中查看。",
        hero: {
          eyebrow: "酒店与度假村",
          title: "所有营业点统一系统——从餐厅到活动",
          subtitle: "为餐厅、酒吧和商店提供 POS，并配备自助点餐机和活动售票机，用客人的语言更快地服务。",
        },
        painGain: [
          { pain: "各营业点系统不同，难以汇总", gain: "餐厅、酒吧和商店共用一个系统，即时汇总" },
          { pain: "外国客人与员工沟通困难", gain: "多语言自助机让客人自己选择" },
          { pain: "假期活动柜台排长队", gain: "客人全天可在活动售票机自助购票" },
        ],
        steps: [
          { title: "客人选择服务", description: "在自助机或员工处点餐或购买活动票" },
          { title: "灵活付款", description: "银行卡、PromptPay 二维码及 AliPay / 微信支付等国际电子钱包" },
          { title: "经理掌握所有营业点", description: "按部门和营业点的销售报表" },
        ],
        faq: [
          { question: "自助机支持哪些语言？", answer: "菜单可设置多种语言，我们会按酒店主要客群进行配置。" },
          { question: "能对接酒店 PMS 系统吗？", answer: "请告知您使用的系统，我们会确认对接方案。" },
          { question: "我们有多个项目，能看汇总数据吗？", answer: "可以，在后台查看各项目及汇总数据。" },
        ],
      },
      themepark: {
        metaTitle: "主题乐园与景区自助售票机 | MYPOS",
        metaDescription: "适用于主题乐园、水上乐园、博物馆和景区的自助售票机与售票系统，缩短入口排队、增加附加销售，所有营业点集中汇总。",
        hero: {
          eyebrow: "主题乐园与景区",
          title: "入口排队更短，附加项目卖得更多",
          subtitle: "多点位同时自助售票的售票机，并为园区内餐饮和纪念品店提供 POS。",
        },
        painGain: [
          { pain: "周末购票排长队，还没入园就耗时", gain: "顾客可在多台售票机同时购票" },
          { pain: "员工没空推荐，附加项目销售少", gain: "每次购票时自助机推荐套票与附加项目" },
          { pain: "门票、餐饮与纪念品系统分离", gain: "所有营业点集中汇总" },
        ],
        steps: [
          { title: "选择门票或套票", description: "在售票机选择票种、数量和附加项目" },
          { title: "付款取票", description: "二维码或银行卡付款，当场打印门票" },
          { title: "管理层一览全局", description: "门票与园区营业点的集中报表" },
        ],
        faq: [
          { question: "售票机能安装在户外吗？", answer: "请告知安装区域情况，我们会推荐合适的机型和位置。" },
          { question: "能与闸机检票系统配合吗？", answer: "请告知您使用的系统，我们会确认对接方案。" },
          { question: "旺季能临时增加售票机吗？", answer: "请联系销售团队，商讨适合您旺季和客流的方案。" },
        ],
      },
      manufacturing: {
        metaTitle: "工厂食堂系统与厂区销售点 | MYPOS",
        metaDescription: "适用于工厂和工业园区的食堂与销售点系统：自助点餐机、员工卡扣款，以及按人员和部门的餐补报表。泰国制造与服务。",
        hero: {
          eyebrow: "工厂与工业园区",
          title: "同一休息时段服务数百名员工的食堂",
          subtitle: "自助点餐机、员工卡支付和餐补报表，帮助工厂缩短排队并清晰管控成本。",
        },
        painGain: [
          { pain: "分批午休，排队仍占用用餐时间", gain: "增加点餐与付款点位，每批等待更短" },
          { pain: "无法按人核查餐补", gain: "按人员和部门的使用报表，可交给人事部" },
          { pain: "厂内商店收现金，难以对账", gain: "员工卡或二维码付款，全程可追溯" },
        ],
        steps: [
          { title: "员工点餐", description: "在自助机或厂内商店" },
          { title: "自动扣款", description: "从员工卡、餐补额度或二维码扣款" },
          { title: "为人事部汇总", description: "按人员、部门和月份，用于工资扣款或商户结算" },
        ],
        faq: [
          { question: "我们有多个班次，餐补能不同吗？", answer: "请告知贵厂的福利规则，我们会为各班次提出设置方案。" },
          { question: "数据能导给人事或工资系统吗？", answer: "可导出报表用于工资系统，对接细节请咨询我们的团队。" },
          { question: "能在曼谷以外的工业园区安装吗？", answer: "可以。我们上门勘察和安装，服务区域请咨询销售团队。" },
        ],
      },
    },
  },
};

function flatten(content: LocaleContent): Record<string, string> {
  const rows: Record<string, string> = {};
  const put = (key: string, value: unknown) => {
    rows[key] = typeof value === "string" ? value : JSON.stringify(value);
  };
  for (const [key, value] of Object.entries(content.common)) put(`common.${key}`, value);
  for (const [key, value] of Object.entries(content.index)) put(`index.${key}`, value);
  for (const [type, page] of Object.entries(content.types)) {
    put(`${type}.metaTitle`, page.metaTitle);
    put(`${type}.metaDescription`, page.metaDescription);
    put(`${type}.hero.eyebrow`, page.hero.eyebrow);
    put(`${type}.hero.title`, page.hero.title);
    put(`${type}.hero.subtitle`, page.hero.subtitle);
    put(`${type}.painGain`, page.painGain);
    put(`${type}.steps`, page.steps);
    put(`${type}.faq`, page.faq);
  }
  return rows;
}

async function upsert(namespace: string, key: string, locale: Locale, value: string) {
  await prisma.pageContent.upsert({
    where: { namespace_key_locale: { namespace, key, locale } },
    create: { namespace, key, locale, value },
    update: { value },
  });
}

async function main() {
  for (const locale of Object.keys(CONTENT) as Locale[]) {
    const content = CONTENT[locale];
    for (const [key, value] of Object.entries(flatten(content))) {
      await upsert("industries", key, locale, value);
    }
    for (const [key, value] of Object.entries(content.nav)) {
      await upsert("nav", key, locale, value);
    }

    const file = path.join(messagesDir, `${locale}.json`);
    const messages = JSON.parse(fs.readFileSync(file, "utf8"));
    messages.industries = { common: content.common, index: content.index, ...content.types };
    messages.nav = { ...messages.nav, ...content.nav };
    fs.writeFileSync(file, JSON.stringify(messages, null, 2) + "\n", "utf8");
    console.log(`Updated ${locale}: DB + messages/${locale}.json`);
  }
  console.log("Done.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
