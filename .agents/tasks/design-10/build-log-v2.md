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
- Scope: four desktop frames at 1440 px wide. The existing D02 page was fixed in place; no other Figma page or website code was changed.
- Review findings resolved: `D02-1` through `D02-4` from `review-v2/D02.json`.
- Structure audit: exactly four top-level frames with the required names and dimensions; zero missing fonts. The FMEA22, C02, C04, and C08 media now use clipped 520 × 360 orientation-aware stages with enlarged full-device images. Product image whites are blended into their column surfaces. The C04 and C08 model tokens occupy dedicated unbroken lines. The in-frame variants annotation was removed.

### Frames

| Frame | Node id | Link | Final get_screenshot result | Checked |
|---|---|---|---|---|
| D02 Home | `63:3` | https://www.figma.com/design/RfzIGGGsN5zgLssxmgHouj?node-id=63-3 | PASS, rendered `1123 × 3000` from `1440 × 3848` | Checked the complete frame, two-sided hero, real bakery-counter scene, sales UI, seam continuity, FMEA22 portrait stage, T70 pairing, dashboard evidence, Thai wrapping, CTA hierarchy, and footer. The FMEA22 is fully visible at a larger portrait scale without a white card or clipping. |
| D02 Products listing | `63:4` | https://www.figma.com/design/RfzIGGGsN5zgLssxmgHouj?node-id=63-4 | PASS, rendered `1074 × 4000` from `1440 × 5368` | Checked the exact filter shell, `พบ 10 รายการ`, five fixed customer/operator pairs, and C01–C10 order. C02, C04, and C08 are fully visible at comparable portrait heights; all product media blend into the split surfaces instead of appearing in white boxes. `FM-EA-SLIM-22-(Desktop)` and `FM-EA-22MART` remain whole on dedicated lines. No price, stock badge, pagination, clipping, or broken seam is present. |
| D02 Product detail | `63:5` | https://www.figma.com/design/RfzIGGGsN5zgLssxmgHouj?node-id=63-5 | PASS, rendered `1106 × 3000` from `1440 × 3908` | Checked the full-size T70 hero, explicitly neutral storefront/dashboard evidence, all nine exact T70 specification rows, all six decision questions, quote actions, compatibility disclaimer, active local subnav, section boundaries, and footer. No clipping or overlap is visible. |
| D02 Contact / quote request | `63:6` | https://www.figma.com/design/RfzIGGGsN5zgLssxmgHouj?node-id=63-6 | PASS, rendered `1440 × 2748` from `1440 × 2748` | Checked the real cafeteria scene, T70 selection, quote topic/product/industry prefill, Contract A-520 fields, marked placeholders, cause/effect rows, separately labelled office/sales/email rail, idle state, exact privacy note, and footer. The internal variants annotation is absent from the exported frame; no invented contact data appears. |

### Assets used

- Shared: `logo`.
- Home: `a-mall-bakery-counter`, `software-screenshot-sales`, `mypos-fm-ea-22`, `mypos-t70`, `software-screenshot-dashboard`.
- Products listing: `mypos-k156`, `mypos-fm-ea-22`, `mypos-k1`, `mypos-fm-ea-slim-22--desktop-`, `mypos-f62`, `mypos-fm-ea-22mart`, `mypos-t70`, `mypos-f58`, `mypos-nb65`, `mypos-nb80t`.
- Product detail: `mypos-t70`, `solution-pos`, `software-screenshot-dashboard`.
- Contact: `an-office-cafeteria`, `mypos-t70`.

### Image provenance flag

- The disputed `software-hero` hero photo was **not used**.
- The disputed `a-beachside-resort-hotel` / `solution-self-order` hotel-lobby kiosk photo was **not used**.
- Whether the hero photo and hotel-lobby kiosk photo are real photos or renders remains an open user decision; this D02 build makes no determination.

### Placeholders marked

- Products search: `ค้นหาชื่อรุ่นหรือฟังก์ชัน` is styled as placeholder text.
- Contact name and phone fields: `กรอกภายหลัง` is visibly styled as muted placeholder text.
- Contact message: `กรอกรายละเอียดบริบทหน้าร้านเพิ่มเติมภายหลัง` is visibly styled as muted placeholder text.
- Topic, product, and industry are confirmed prefill values for this mockup, not placeholders.
- No testimonial, client name, address, price, SLA, stock value, or unconfirmed number was introduced.

## D03

- Page: `v2 - D03 ครอบครัวเครื่อง`
- Page node id: `74:2`
- Scope: revised only the existing D03 page after review. It contains exactly four desktop frames at 1440 px wide; no other Figma page or website code was changed.
- Structure audit: the four top-level frames retain the required names. Final sizes are 1440 × 3788, 1440 × 4430, 1440 × 3648, and 1440 × 3128.
- Design treatment: editorial product-family stages organized by placement type, explicit non-scale disclosure, large full-device media, continuous ruled image rails instead of rounded product cards, IBM Plex Sans Thai/Prompt hierarchy, restrained neutral surfaces, and Ember Orange limited to primary CTAs.
- Review status: findings `D03-1` through `D03-6` were fixed and rechecked. `review-v2/D03.json` now records `APPROVED`.

### Frames

| Frame | Node id | Link | Final get_screenshot result | Checked |
|---|---|---|---|---|
| D03 Home | `74:3` | https://www.figma.com/design/RfzIGGGsN5zgLssxmgHouj?node-id=74-3 | PASS, rendered `1440 × 3788` from `1440 × 3788` | Checked the two-line hero, non-scale disclosure, readable K156/FM-EA-22/T70 family portrait, compact-device stage, placement criteria, `solution-pos` context scene, consultation rows, header/subnav, CTA hierarchy, and footer. FM-EA-22 now uses a portrait-aware 420 × 594 clipped viewport; its complete device is visible without upscaling. The context heading and body have a measured 24 px gap, and no label crosses the next section boundary. |
| D03 Products listing | `74:150` | https://www.figma.com/design/RfzIGGGsN5zgLssxmgHouj?node-id=74-150 | PASS, rendered `1301 × 4000` from `1440 × 4430` | Checked the complete filter shell, `พบ 10 รายการ`, exact C01–C10 order, five distinct family stages, readable full-device media, long model names, separated highlights/metadata, result rail, and footer. FM-EA-22 now uses a portrait-aware 520 × 594 clipped viewport. Every family stage ends with 48 px bottom padding; the repeated dead bands are gone. No prices, stock badges, pagination, clipping, or text collision remain. |
| D03 Product detail | `74:330` | https://www.figma.com/design/RfzIGGGsN5zgLssxmgHouj?node-id=74-330 | PASS, rendered `1440 × 3648` from `1440 × 3648` | Checked the full-size K156 stage, exact product copy, first four decision specs, quote path, three-image gallery rail, all nine exact specification rows, size/placement comparison path, closing quote rail, active local subnav, and footer. |
| D03 Contact / quote request | `74:475` | https://www.figma.com/design/RfzIGGGsN5zgLssxmgHouj?node-id=74-475 | PASS, rendered `1440 × 3128` from `1440 × 3128` | Checked K156 and T70 at quantity 1 with Lucide Minus/Plus/X controls, all Contract B fields, muted placeholders, submit CTA, two-item review rows, three process rows, separately labelled office/sales/email strip, and footer. The heading now breaks semantically as `ส่งคำขอ` / `ใบเสนอราคา`; the message field ends 16 px before the submit button, and the inline state is back in its contracted position. |

### Assets used

- Shared: `logo`.
- Home: `mypos-k156`, `mypos-fm-ea-22`, `mypos-t70`, `mypos-nb65`, `mypos-f62`, `solution-pos`.
- Products listing: `mypos-k156`, `mypos-fm-ea-22`, `mypos-k1`, `mypos-fm-ea-slim-22--desktop-`, `mypos-f62`, `mypos-fm-ea-22mart`, `mypos-t70`, `mypos-f58`, `mypos-nb65`, `mypos-nb80t`.
- Product detail: `mypos-k156`, `mypos-k156-gallery-1`, `mypos-k156-gallery-2`, `mypos-k156-gallery-3`.
- Contact: `mypos-k156`, `mypos-t70`.

### Image provenance flag

- `solution-pos` is used as the Home context scene.
- The hero photo was **not used**.
- The `a-beachside-resort-hotel` / `solution-self-order` hotel-lobby kiosk photo was **not used**.
- The brief leaves whether the hero photo and hotel-lobby kiosk photo are real photos or renders unresolved. This D03 build makes no determination and keeps the question flagged for the final report.

### Placeholders marked

- Products search: `ค้นหาชื่อรุ่นหรือฟังก์ชัน` is styled as muted placeholder text.
- Quote name, company, phone, and email fields use visibly muted `กรอก...` placeholder text; the company label also states `(ถ้ามี)`.
- Quote message: `ระบุบริบทการใช้งาน จำนวน และสิ่งที่ต้องการให้ทีมช่วย` is styled as muted example placeholder copy.
- The two selected products and quantity values are confirmed mockup state, not placeholders; the matching item payload stays in a hidden text layer rather than appearing as another input.
- No testimonial, client name, address, price, SLA, stock value, or unconfirmed number was introduced.

## D04

- Page: `v2 - D04 สี่จังหวะหน้าร้าน`
- Page node id: `83:2`
- Scope: fixed the existing D04 page in place. It retains exactly four desktop frames at 1440 px wide; no other Figma page or website code was changed.
- Structure audit: the four direct children are the required frames at `1440 × 3928`, `1440 × 5588`, `1440 × 3708`, and `1440 × 2648`. IBM Plex Sans Thai, Prompt, and Noto Sans SC have zero missing-font nodes.
- Review fixes applied: `D04-1` through `D04-6` from `review-v2/D04.json`. A05/A07 were removed from all five flagged occurrences; exact highlights were restored for C04, C05, C06, C07, C09, and C10; all ten listing actions are visible above their section boundaries; subject-aware media viewports enlarge C02, C04, C05, and C08 without cropping hardware; the detail blank runs were removed; and exported production language was replaced with buyer-facing copy.

### Frames

| Frame | Node id | Link | Final get_screenshot result | Checked |
|---|---|---|---|---|
| D04 Home | `83:3` | https://www.figma.com/design/RfzIGGGsN5zgLssxmgHouj?node-id=83-3 | PASS, rendered `1100 × 3000` from `1440 × 3928` | Checked the full four-phase sequence, documentary retail and A03 POS-context imagery, cross-location disclosure, NB65/T70 evidence, dashboard caption, Thai hierarchy, header/subnav, CTA color use, and footer. No raw direction ID, asset filename, clipping, collision, or disallowed image remains visible. |
| D04 Products listing | `83:145` | https://www.figma.com/design/RfzIGGGsN5zgLssxmgHouj?node-id=83-145 | PASS, rendered `1031 × 4000` from `1440 × 5588` | Checked the exact filter shell, `พบ 10 รายการ`, and C01–C10 once each. Every block shows model, exact name, exact highlight, screen/OS, and `ดูรายละเอียด`; all ten actions end before the Results section. C02/C04/C05/C08 hardware reads at comparison scale in clipped whitespace viewports, while complete devices remain visible. The dashboard follows complete C06/C07 blocks and C10 clears the Results boundary. |
| D04 Product detail | `83:402` | https://www.figma.com/design/RfzIGGGsN5zgLssxmgHouj?node-id=83-402 | PASS, rendered `1166 × 3000` from `1440 × 3708` | Checked the enlarged complete NB65 overview, exact name/highlight/metadata, quote and compare actions, A03 POS-context image with the non-installation disclosure, all nine exact specification rows distributed through the section, four operational questions, CTA hierarchy, and footer. The two reviewed blank runs are gone. |
| D04 Contact / quote request | `83:557` | https://www.figma.com/design/RfzIGGGsN5zgLssxmgHouj?node-id=83-557 | PASS, rendered `1440 × 2648` from `1440 × 2648` | Checked the four phase tabs with `รับรายการ` selected, Contract A geometry, general-topic/message prefill, visibly muted placeholders, buyer-facing guidance `เลือกช่วงงาน แล้วเล่ารายละเอียดที่ทีมควรรู้`, separately labelled office/sales/email channels, CTA hierarchy, and footer. No field/payload implementation language or invented contact data remains visible. |

### Assets used

- Shared: `logo`.
- Home: `a-neighborhood-mini-mart`, `solution-pos` (A03 fallback in two phase scenes), `software-screenshot-dashboard`, `mypos-t70`, `mypos-nb65`.
- Products listing: `mypos-k156`, `mypos-fm-ea-22`, `mypos-k1`, `mypos-fm-ea-slim-22--desktop-`, `mypos-f62`, `mypos-fm-ea-22mart`, `mypos-t70`, `mypos-f58`, `mypos-nb65`, `mypos-nb80t`, `a-neighborhood-mini-mart`, `solution-pos` (A03 fallback in two context slots), `software-screenshot-dashboard`.
- Product detail: `mypos-nb65`, `solution-pos`.
- Contact: `logo` only.
- Removed after visual review: `an-office-cafeteria` and `an-outdoor-made-to-order-restaurant-chain`.

### Image provenance flag

- The hero photo (`software-hero`) was **not used**.
- The hotel-lobby kiosk photo (`a-beachside-resort-hotel` / `solution-self-order`) was **not used**.
- Whether those two images are real photos or renders remains an open user decision in the task brief. This D04 revision makes no determination.
- The reviewer found A05 and A07 render-like in the exported frames, so every D04 occurrence was replaced with the prescribed `solution-pos` A03 fallback; this does not resolve the separate hero/hotel-lobby question.

### Placeholders marked

- Products search: `ค้นหาชื่อรุ่นหรือฟังก์ชัน` is styled as muted placeholder text.
- Contact name, phone, and optional product fields use visibly muted `กรอกชื่อ-นามสกุล`, `กรอกเบอร์โทร`, and `ระบุรุ่น (ถ้ามี)` placeholders.
- `สอบถามข้อมูลทั่วไป` and `บริบทที่ต้องการคุย: รับรายการ` are confirmed mockup prefill values, not placeholders.
- No testimonial, client name, address, price, SLA, stock value, or unconfirmed number was introduced.
