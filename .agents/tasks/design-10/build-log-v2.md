# MYPOS design-10 v2 build log

## D01

- Page: `v2 - D01 เส้นเคาน์เตอร์`
- Page node id: `57:2`
- Scope: four desktop frames at 1440 px wide. No pre-existing Figma page was edited.

### Frames

| Frame | Node id | Link | Final get_screenshot result | Checked |
|---|---|---|---|---|
| D01 Home | `57:3` | https://www.figma.com/design/RfzIGGGsN5zgLssxmgHouj?node-id=57-3 | PASS, rendered `1153 × 3000` from `1440 × 3748` | Two-line hero headline and supporting copy do not overlap; primary scene remains large; T70/dashboard, team photo, K156 counter stage, consultation rows, global header/local subnav, CTA color use, and footer/contact values are visible and aligned. |
| D01 Products listing | `57:122` | https://www.figma.com/design/RfzIGGGsN5zgLssxmgHouj?node-id=57-122 | PASS, rendered `880 × 4000` from `1440 × 6548` | Default filter shell shows `พบ 10 รายการ`; C01–C10 appear in the required D01 order; alternating counter bands and full-height media stages prevent white-card treatment; product names, highlights, metadata, detail actions, chooser, and footer have no visible overlap or clipping. |
| D01 Product detail | `57:347` | https://www.figma.com/design/RfzIGGGsN5zgLssxmgHouj?node-id=57-347 | PASS, rendered `1147 × 3000` from `1440 × 3768` | Breadcrumb, 560 × 792 K156 stage, first four facts, quote CTA, three gallery views, all nine exact spec rows, reference rail, 176 × 176 assembly evidence, quote rail, and footer render within the frame without clipping. |
| D01 Contact / quote request | `57:480` | https://www.figma.com/design/RfzIGGGsN5zgLssxmgHouj?node-id=57-480 | PASS, rendered `1440 × 2588` from `1440 × 2588` | Contract A quote state, labels, input boundaries, subtle placeholders, process columns, separately labelled office/sales/email channels, state note, header/local subnav, and footer are legible and aligned; no placeholder block dominates the layout. |

### Assets used

- Shared: `logo`.
- Home: `solution-pos`, `mypos-t70`, `software-screenshot-dashboard`, `about-team`, `mypos-k156`.
- Products listing: `mypos-k156`, `mypos-fm-ea-22`, `mypos-k1`, `mypos-fm-ea-slim-22--desktop-`, `mypos-f62`, `mypos-fm-ea-22mart`, `mypos-t70`, `mypos-f58`, `mypos-nb65`, `mypos-nb80t`.
- Product detail: `mypos-k156`, `mypos-k156-gallery-1`, `mypos-k156-gallery-2`, `mypos-k156-gallery-3`, `about-assembly`.
- Contact: `logo` only.

### Image provenance flag

- `software-hero` hero photo: **not used**.
- `a-beachside-resort-hotel` / `solution-self-order` hotel-lobby kiosk photo: **not used**.
- Neither disputed image appears in D01. Keep their provenance/status flagged in the combined report rather than making a new determination in this direction build.

### Placeholders marked

- Products search: `ค้นหาชื่อรุ่นหรือฟังก์ชัน` is styled as placeholder text.
- Contact product field: `เลือกรุ่น (ไม่บังคับ)` marks the intentionally blank product selection.
- Contact name and phone: `กรอกชื่อ-นามสกุล` and `กรอกเบอร์โทร` are styled as input placeholders.
- Contact message: `ตัวอย่าง: ลักษณะร้าน จุดใช้งาน และสิ่งที่ต้องการให้ทีมช่วย` is styled as example placeholder copy.
- No testimonial, client name, address, price, SLA, stock value, or unconfirmed number was introduced.
