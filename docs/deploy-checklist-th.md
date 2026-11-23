# รายการตรวจตอนขึ้นเว็บจริง (deploy checklist)

สำหรับเจ้าของเว็บและผู้ดูแลเซิร์ฟเวอร์ ใช้ตอนย้ายเว็บขึ้นโดเมนจริง `https://mypos.co.th`

เขียนเมื่อ 23 พฤศจิกายน 2569 (2026) ตอนเขียนยังไม่มีเว็บจริงที่ขึ้นใช้งาน ทุกช่อง "ยืนยัน" จึงว่างไว้ ห้ามติ๊กว่าเสร็จจนกว่าจะมีหลักฐาน เช่น ภาพหน้าจอ หรือผลคำสั่งที่คัดลอกมาวาง

## สิ่งที่โค้ดทำให้แล้ว และสิ่งที่โค้ดทำแทนไม่ได้

- ตัวเว็บ (`next.config.ts`) ส่ง header เหล่านี้ทุกหน้า: `X-Content-Type-Options`, `Referrer-Policy`, `X-Frame-Options`, `Permissions-Policy` และ `Content-Security-Policy-Report-Only`
- CSP ตอนนี้เป็นแบบ "รายงานอย่างเดียว" (Report-Only) ยังไม่บล็อกอะไร ถ้ามีสคริปต์หรือรูปจากที่อื่นที่ไม่ได้อยู่ในรายการ เบราว์เซอร์จะแจ้งใน Console เท่านั้น การเปลี่ยนเป็นบล็อกจริงต้องให้เจ้าของอนุมัติ และต้องตรวจแล้วไม่มีรายการแจ้งเตือนก่อน
- HSTS ตัวเว็บไม่ได้ส่ง เพราะตัวเว็บไม่รู้ว่าอยู่หลัง HTTPS หรือไม่ ถ้าตั้งผิดแล้วแก้คืนยาก จึงต้องตั้งที่ reverse proxy (เช่น nginx) หลังเปิด HTTPS ได้แล้ว
- สคริปต์ `prisma/backup-db.ts` ส่งออกข้อมูลทุกตารางเป็นไฟล์ JSON ได้ แต่ **ไม่ใช่การสำรองฐานข้อมูลของโฮสต์** ไม่มีโครงสร้างตาราง ไม่มีไฟล์รูปใน Supabase Storage ไม่มีรหัสผ่านแอดมิน และยังไม่เคยทดสอบการกู้คืน
- ระบบแจ้งเตือนลูกค้าใหม่ (LINE และอีเมล) ทำงานเมื่อตั้งค่า env ครบเท่านั้น ถ้าไม่ตั้งทั้งสองช่องทาง ลูกค้าใหม่จะเห็นเป็นตัวเลขในหลังบ้านอย่างเดียว ไม่มีใครได้รับแจ้ง

## ตารางตรวจ

"ที่ไหน" หมายถึงต้องทำที่ app (โค้ดเว็บ), reverse proxy (เช่น nginx หน้าเว็บ) หรือ host (ผู้ให้บริการเซิร์ฟเวอร์ ฐานข้อมูล หรือบริการภายนอก)

| # | รายการ | ต้องทำที่ไหน | วิธีตรวจ | ยืนยันเมื่อ | โดย | หลักฐาน |
|---|---|---|---|---|---|---|
| 1 | Security headers ของตัวเว็บ | app (ทำในโค้ดแล้ว ต้องตรวจบนเว็บจริง) | รัน `curl -I https://mypos.co.th/th` ต้องเห็น `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `X-Frame-Options: SAMEORIGIN`, `Permissions-Policy: camera=(), microphone=(), geolocation=()` และ `Content-Security-Policy-Report-Only` ถ้า proxy ส่ง header ชื่อเดียวกันซ้ำ ให้เหลือชุดเดียว | | | |
| 2 | CSP ไม่มีรายการแจ้งเตือน | app | เปิดหน้าแรก หน้าสินค้า หน้าบทความ หน้าติดต่อ (ภาษา th, en, zh) กดยอมรับคุกกี้ แล้วดูแท็บ Console ของเบราว์เซอร์ว่าไม่มีข้อความ "Content Security Policy" หรือรัน `node .agents/tasks/admin-improve/headers-check.cjs` โดยตั้ง `BASE=https://mypos.co.th` ต้องได้ `violations: 0` ทำซ้ำหลังใส่รหัส Pixel ในตั้งค่าเว็บไซต์ | | | |
| 3 | เปลี่ยน CSP เป็นบล็อกจริง | app (ต้องให้เจ้าของอนุมัติ) | ทำหลังข้อ 2 ผ่านอย่างน้อย 1 ถึง 2 สัปดาห์บนเว็บจริง โดยเปลี่ยนชื่อ header ใน `next.config.ts` เป็น `Content-Security-Policy` แล้วตรวจข้อ 2 ซ้ำ | | | |
| 4 | HTTPS และใบรับรอง TLS | reverse proxy / host | เปิด `https://mypos.co.th` ไม่มีคำเตือนใบรับรอง และ `curl -I http://mypos.co.th/th` ได้ 301 หรือ 308 ไปที่ `https://` | | | |
| 5 | HSTS | reverse proxy | ตั้งหลังข้อ 4 ผ่าน เริ่มด้วยค่าสั้น `max-age=300` ดูว่าทุกหน้าใช้ได้ แล้วค่อยเพิ่มเป็น `max-age=31536000` ห้ามใส่ `preload` จนกว่าจะแน่ใจว่าทุก subdomain ใช้ HTTPS ตรวจด้วย `curl -I https://mypos.co.th/th` ต้องเห็น `Strict-Transport-Security` | | | |
| 6 | `x-forwarded-for` | reverse proxy | ตัวจำกัดจำนวนการส่งฟอร์ม (`src/lib/rateLimit.ts`) เชื่อค่าขวาสุดของ `x-forwarded-for` ต้องใช้ proxy ที่เติม IP จริงของผู้ใช้ เช่น nginx `proxy_add_x_forwarded_for` (ดู HANDOFF ข้อ 12.3 รายการ 5) | | | |
| 7 | `SESSION_SECRET` | host | ตั้งเป็นค่าสุ่มยาวอย่างน้อย 32 ตัวอักษร ไม่ใช้ค่าเดียวกับเครื่องพัฒนา ตรวจโดยล็อกอิน `/admin` ได้ และค่านี้ไม่อยู่ใน git | | | |
| 8 | การแจ้งเตือนทาง LINE | host (env) | ตั้ง `LINE_CHANNEL_ACCESS_TOKEN`, `LINE_CHANNEL_SECRET`, `LINE_NOTIFY_TO` แล้วส่งฟอร์มติดต่อทดสอบ 1 ครั้งจากหน้า `/th/contact` ต้องได้ข้อความในกลุ่ม LINE ของทีมขาย จากนั้นลบหรือปิดรายการทดสอบในหลังบ้าน | | | |
| 9 | การแจ้งเตือนทางอีเมล | host (env) | ตั้ง `RESEND_API_KEY`, `NOTIFY_EMAIL_FROM`, `NOTIFY_EMAIL_TO` (ยืนยันโดเมนผู้ส่งใน Resend ก่อน) ส่งฟอร์มทดสอบแบบข้อ 8 ต้องได้อีเมล ถ้าได้รับเฉพาะ LINE หรือเฉพาะอีเมล ให้บันทึกไว้ว่าใช้ช่องทางไหน ต้องมีอย่างน้อย 1 ช่องทางที่ได้รับจริง | | | |
| 10 | สำรองฐานข้อมูลของโฮสต์ | host | ฐานข้อมูลอยู่ที่ Supabase เปิด Supabase Dashboard > โปรเจกต์ > Database > Backups ดูว่ามีรายการสำรองรายวันและเก็บย้อนหลังกี่วัน ถ้าไม่มี ต้องตัดสินใจเรื่องแพ็กเกจหรือวิธีสำรองอื่นก่อนเปิดเว็บ แนบภาพหน้าจอหน้านั้นเป็นหลักฐาน **โค้ดในโปรเจกต์นี้มองไม่เห็นตารางสำรองของโฮสต์ ห้ามติ๊กช่องนี้จากการดูโค้ด** | | | |
| 11 | ทดสอบกู้คืนจากสำรองของโฮสต์ | host | กู้คืนลงโปรเจกต์ทดสอบ (ไม่ใช่ฐานข้อมูลจริง) แล้วเปิดเว็บทดสอบว่าข้อมูลครบ | | | |
| 12 | ส่งออกข้อมูลก่อนสลับโดเมน | app (คนรันสคริปต์) | รัน `node node_modules/tsx/dist/cli.mjs prisma/backup-db.ts --write` แล้ว `--verify <ไฟล์ที่ได้>` ต้องได้ "All counts match." เก็บไฟล์ไว้นอกเครื่องเซิร์ฟเวอร์ ไฟล์มีข้อมูลส่วนตัวของลูกค้า เก็บในที่ปลอดภัย นี่เป็นสำเนาข้อมูลเสริม ไม่ใช่สำรองของโฮสต์ (ข้อ 10) | | | |
| 13 | สำรองไฟล์รูปใน Supabase Storage | host | ข้อ 10 และ 12 ไม่รวมไฟล์รูป ตรวจใน Supabase Dashboard > Storage ว่ามีวิธีสำรอง bucket ของเว็บ | | | |
| 14 | สลับโดเมน | host | ทำตามส่วนที่ 11 ของ `docs/owner-data-guide-th.md` | | | |

## ตัวอย่างการตั้ง header ที่ nginx

ใช้เมื่อเว็บอยู่หลัง nginx ให้ตัวเว็บส่ง header ของข้อ 1 เอง nginx เพิ่มเฉพาะ HSTS ห้ามประกาศ header ข้อ 1 ซ้ำใน nginx

```nginx
server {
    listen 443 ssl;
    server_name mypos.co.th;

    # เริ่มด้วยค่าสั้น แล้วค่อยเพิ่มเป็น 31536000 เมื่อแน่ใจ (ข้อ 5)
    add_header Strict-Transport-Security "max-age=300" always;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}

server {
    listen 80;
    server_name mypos.co.th;
    return 301 https://$host$request_uri;
}
```
