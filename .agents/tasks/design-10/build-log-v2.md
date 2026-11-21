# MYPOS design-10 v2 build log

## D01

- Page: `v2 - D01 เส้นเคาน์เตอร์`
- Page node id: `57:2`
- Scope: four desktop frames at 1440 px wide. The existing D01 page was fixed in place; no other Figma page was touched.
- Review findings resolved: `D01-1` through `D01-5` from `review-v2/D01.json`.

### Frames

| Frame | Node id | Link | Final get_screenshot result | Checked |
|---|---|---|---|---|
| D01 Home | `57:3` | https://www.figma.com/design/RfzIGGGsN5zgLssxmgHouj?node-id=57-3 | PASS, rendered `1153 × 3000` from `1440 × 3748` | The unchanged frame still renders fully. The two-line hero, real deployment scene, T70/dashboard pairing, team photo, full-size K156 stage, consultation rows, header/subnav, CTA color use, and footer remain aligned with no visible clipping or overlap. |
| D01 Products listing | `57:122` | https://www.figma.com/design/RfzIGGGsN5zgLssxmgHouj?node-id=57-122 | PASS, rendered `880 × 4000` from `1440 × 6548` | The filter shell shows `พบ 10 รายการ`; C01–C10 remain in D01 order. C02, C04, C05, and C08 now use 760 × 428 FIT image canvases inside 420 × 428 clipped whitespace viewports, so each full machine is readable and grounded on the counter line without cropping the hardware. Names, highlights, metadata, actions, chooser, and footer remain legible. |
| D01 Product detail | `57:347` | https://www.figma.com/design/RfzIGGGsN5zgLssxmgHouj?node-id=57-347 | PASS, rendered `1147 × 3000` from `1440 × 3768` | The K156 hero and quote path remain intact. Gallery card shells are gone; the three FIT images and captions now sit on one shared ruled rail. All nine exact specification facts are distributed through the specifications band with closing dividers, eliminating the lower blank run. The service evidence, quote rail, and footer render without clipping. |
| D01 Contact / quote request | `57:480` | https://www.figma.com/design/RfzIGGGsN5zgLssxmgHouj?node-id=57-480 | PASS, rendered `1440 × 2588` from `1440 × 2588` | All Contract A fields, labels, placeholders, process columns, and separately labelled office/sales/email channels remain visible. The privacy note and submit CTA now anchor the lower form band, the closing baseline sits near the section end, and the internal submitting/error/success annotation is absent. |

### Assets used

- Shared: `logo`.
- Home: `solution-pos`, `mypos-t70`, `software-screenshot-dashboard`, `about-team`, `mypos-k156`.
- Products listing: `mypos-k156`, `mypos-fm-ea-22`, `mypos-k1`, `mypos-fm-ea-slim-22--desktop-`, `mypos-f62`, `mypos-fm-ea-22mart`, `mypos-t70`, `mypos-f58`, `mypos-nb65`, `mypos-nb80t`.
- Product detail: `mypos-k156`, `mypos-k156-gallery-1`, `mypos-k156-gallery-2`, `mypos-k156-gallery-3`, `about-assembly`.
- Contact: `logo` only.

### Image provenance flag

- `solution-pos` is used as the Home hero scene.
- The disputed `software-hero` hero photo was **not used**.
- The disputed `a-beachside-resort-hotel` / `solution-self-order` hotel-lobby kiosk photo was **not used**.
- The real-photo/render status of the disputed hero and hotel-lobby images remains an open user decision; this D01 build makes no determination.

### Placeholders marked

- Products search: `ค้นหาชื่อรุ่นหรือฟังก์ชัน` is styled as placeholder text.
- Contact product field: `เลือกรุ่น (ไม่บังคับ)` marks the intentionally blank product selection.
- Contact name and phone fields: `กรอกชื่อ-นามสกุล` and `กรอกเบอร์โทร` are styled as input placeholders.
- Contact message: `ตัวอย่าง: ลักษณะร้าน จุดใช้งาน และสิ่งที่ต้องการให้ทีมช่วย` is styled as example placeholder copy.
- No testimonial, client name, address, price, SLA, stock value, or unconfirmed number was introduced.

## D02

- Page: `v2 - D02 สองฝั่งร้าน`
- Page node id: `63:2`
- Scope: four desktop frames at 1440 px wide. This step created only the D02 page and did not change any other Figma page or website code.
- Structure audit: the page has exactly four top-level frames; every frame has the specified dimensions and zero missing fonts. No `review-v2/D02.json` existed when this build began.

### Frames

| Frame | Node id | Link | Final get_screenshot result | Checked |
|---|---|---|---|---|
| D02 Home | `63:3` | https://www.figma.com/design/RfzIGGGsN5zgLssxmgHouj?node-id=63-3 | PASS, rendered `824 × 2200` from `1440 × 3848` | The two-sided hero, real bakery-counter scene, sales UI, FMEA22/T70 physical-digital pairings, dashboard evidence, decision split, global header, active local subnav, CTA hierarchy, and footer all render completely. Checked image scale, seam continuity, Thai text wrapping, and absence of clipping or overlap. |
| D02 Products listing | `63:4` | https://www.figma.com/design/RfzIGGGsN5zgLssxmgHouj?node-id=63-4 | PASS, rendered `644 × 2400` from `1440 × 5368` | The exact filter shell and `พบ 10 รายการ` state render above five fixed customer/operator pairs. C01–C10 appear once in D02 order with large FIT media, exact product names and highlights, screen/OS facts, processor and memory rows, direct detail actions, result rail, and footer. Checked that there are no prices, stock badges, pagination, product-card shells, clipping, or broken pair seams. |
| D02 Product detail | `63:5` | https://www.figma.com/design/RfzIGGGsN5zgLssxmgHouj?node-id=63-5 | PASS, rendered `811 × 2200` from `1440 × 3908` | The T70 hero is readable at primary size; the storefront and dashboard evidence are explicitly neutral context. All nine exact T70 specification rows and all six specification-derived questions render without clipping. Checked the quote actions, compatibility disclaimer, active subnav, section boundaries, and footer. |
| D02 Contact / quote request | `63:6` | https://www.figma.com/design/RfzIGGGsN5zgLssxmgHouj?node-id=63-6 | PASS, rendered `1153 × 2200` from `1440 × 2748` | The real cafeteria scene, T70 selection, quote topic/product/industry prefill, Contract A-520 fields, marked placeholders, cause/effect rows, separately labelled office/sales/email rail, idle/privacy state, and footer all render fully. Checked field alignment, placeholder contrast, CTA placement, seam continuity, and absence of invented contact data. |

### Assets used

- Shared: `logo`.
- Home: `a-mall-bakery-counter`, `software-screenshot-sales`, `mypos-fm-ea-22`, `mypos-t70`, `software-screenshot-dashboard`.
- Products listing: `mypos-k156`, `mypos-fm-ea-22`, `mypos-k1`, `mypos-fm-ea-slim-22--desktop-`, `mypos-f62`, `mypos-fm-ea-22mart`, `mypos-t70`, `mypos-f58`, `mypos-nb65`, `mypos-nb80t`.
- Product detail: `mypos-t70`, `solution-pos`, `software-screenshot-dashboard`.
- Contact: `an-office-cafeteria`, `mypos-t70`.

### Image provenance flag

- The disputed `software-hero` hero photo was **not used**.
- The disputed `a-beachside-resort-hotel` / `solution-self-order` hotel-lobby kiosk photo was **not used**.
- Their real-photo/render status remains an open user decision; this D02 build makes no determination.

### Placeholders marked

- Products search: `ค้นหาชื่อรุ่นหรือฟังก์ชัน` is styled as placeholder text.
- Contact name and phone fields: `กรอกภายหลัง` is visibly styled as muted placeholder text.
- Contact message: `กรอกรายละเอียดบริบทหน้าร้านเพิ่มเติมภายหลัง` is visibly styled as muted placeholder text.
- Topic, product, and industry are confirmed prefill values for this mockup, not placeholders.
- No testimonial, client name, address, price, SLA, stock value, or unconfirmed number was introduced.
