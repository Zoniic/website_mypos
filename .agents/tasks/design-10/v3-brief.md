Task size: medium (10 single-frame Home designs in Figma plus one comparison sheet). The owner is waiting and has twice complained that he cannot see options yet, so the time until he sees the first finished Home matters.

## Task
Redo the MYPOS website redesign exploration in Figma as 10 visually distinct directions, Home page only for now. The owner looked at the previous result (v2 directions D01–D04, contact sheet `d:\Folk\Own_Dir\FMT\DEV\mypos website\.agents\tasks\design-10\homes-d01-d04.png`) and said: "ฉันไม่เห็น Mockup 10 แบบที่ต่างกันที่คุณจะให้ผมเลือกเลย" (I don't see 10 different mockups to choose from). He will pick 1–3 directions from these 10 Homes. The Products listing, Product detail and Contact/quote pages for the chosen direction(s) are a later, separate task and are out of scope for this run. The rest of the v2 plan (D05–D10 and the v2 final report) is cancelled.

## Verified cause of the sameness
`d:\Folk\Own_Dir\FMT\DEV\mypos website\.agents\tasks\design-10\directions-v2.md` §4 "Shared build foundation" locked every direction to the same tokens (white #ffffff and light-gray surfaces only; Primary orange #e85520 only as the fill of a single primary CTA per viewport; no orange text or decoration), the same two fonts (IBM Plex Sans Thai, Prompt), the same header geometry (§5) and the same content contract. The directions therefore differed only in section order. Also visible in the sheet: the same red LEO kiosk photo (`solution-pos`) is the main image in D01, D03 and D04, and the top-right of D02 shows a dense report screenshot that cannot be read at page scale.

## Owner decisions (this conversation)
- 1a: Home only first. One Home frame per direction, 10 directions, shown side by side so he can choose.
- 2a: keep the MYPOS logo and keep MYPOS orange (#e85520) as the main brand color. Background colors, secondary colors, fonts, layout, header treatment and photo treatment may change per direction. This replaces the color and typography lock in directions-v2.md §4 and the header geometry in §5.
- The owner approved these 10 directions as written (Thai, his wording):
  1. โปสเตอร์ส้ม: พื้นส้ม MYPOS เต็มจอ หัวเรื่องไทยตัวใหญ่มาก วางภาพเครื่องบนพื้นสีเหมือนป้ายโฆษณาหน้าร้าน
  2. โชว์รูมพื้นดำ: พื้นดำ ส่องไฟที่เครื่องทีละรุ่นแบบโชว์รูมรถ ตัวหนังสือบาง ใช้ส้มแค่จุดเล็กๆ
  3. นิตยสาร: พื้นกระดาษสีครีม หัวเรื่องเป็นฟอนต์มีหัว เล่าเรื่องร้านลูกค้าเป็นคอลัมน์
  4. แคตตาล็อกช่าง: พื้นเทาอ่อนมีเส้นกริด ตัวเลขสเปกเด่น ภาพเครื่องมีเส้นบอกขนาด เหมือนเอกสารสเปกจากโรงงาน
  5. ภาพหน้างานเต็มจอ: ทุกช่วงเป็นรูปร้านจริงเต็มความกว้าง วางข้อความบนรูป แทบไม่มีกรอบหรือกล่อง
  6. งานพิมพ์สองสี: รูปจริงทำเป็นเม็ดสกรีนสองสี (ส้มกับกรมท่า) ให้ดูเหมือนใบปลิวงานพิมพ์
  7. ผังร้าน: ผังร้านมองจากด้านบน บอกว่าเครื่องแต่ละรุ่นวางตรงไหน (หน้าร้าน เคาน์เตอร์ ครัว) โทนพิมพ์เขียว
  8. หน้าจอซอฟต์แวร์: พื้นกรมท่าเข้ม หน้าเว็บดูเหมือนหน้าจอระบบหลังร้าน และเน้นภาพหน้าจอระบบ
  9. เป็นกันเอง: พื้นสีพีช ตัวหนังสือโค้งมน มีป้ายแบบสติกเกอร์ เหมาะกับเจ้าของร้านเล็ก
  10. ตัวอักษรยักษ์: พื้นขาวกับดำ หัวเรื่องและตัวเลขขนาดยักษ์บนกริดเข้ม มีส้มเป็นสีเดียวในหน้า
- Designer: the owner chose GPT 5.6 Sol (model id `gpt-5.6-sol`) to do the design work.

## Constraints carried over from earlier owner decisions
Full text of earlier decisions: `d:\Folk\Own_Dir\FMT\DEV\mypos website\.agents\tasks\design-10\orchestrator-clarifications.md` (C3).
- Human-made look, not AI-generic. The original request was a "humanizer without AI" UX/UI web designer who uses the awwwards MCP (already configured and connected) for real Awwwards reference sites.
- Real photos only. Excluded: `a-beachside-resort-hotel` = `solution-self-order` (hash 379310d70c386017ae791043b22348f024e519af, owner-confirmed render) and the live home hero background video (owner-confirmed render, not in Assets v2). `software-hero` (hash 1bd4d8a51a27c2765c7c9656b85ebc0e58dc2d77) is unconfirmed (open question to the owner): exclude it. Treating a real photo (duotone, halftone, crop) is allowed. Never caption a photo as a different place or business than it shows.
- No invented facts: no made-up statistics, testimonials, client names, results, prices, SLAs or addresses.
- Icons: Lucide only. No emoji. No text characters used as icons.
- Thai-first copy taken from the real site content; directions-v2.md §6 holds exact Thai strings and product data that can be reused. Layouts must also hold up with English and Chinese text lengths.
- Main menu: the current site menu (โซลูชัน · สินค้า · อุปกรณ์เสริม · ประเภทธุรกิจ · ข้อมูล/บริการ · เกี่ยวกับเรา, plus search, compare, language switch and the primary CTA "นัดสาธิตฟรี"). Its visual treatment may differ per direction.
- Contact details wherever shown: office "02 521 7155-59" labelled สำนักงาน, sales "086 688 9050" labelled ฝ่ายขาย, email Sales@fmtcorp.co.th.
- Do not enlarge images beyond their source size. Source sizes are in `assets-v2.md`; for example `about-assembly` is only 350×350.
- Figma file key `RfzIGGGsN5zgLssxmgHouj`. Images are already uploaded on page "Assets v2" (id 45:2); their hashes and sizes are in `d:\Folk\Own_Dir\FMT\DEV\mypos website\.agents\tasks\design-10\assets-v2.md`. Leave every existing page untouched (00 - อ่านก่อน, A - Showroom, B - System map, Assets, Assets v2, old - D01..D07, v2 - D01..D04, including the one open review finding on v2 D04). Create new pages only, with names that cannot be confused with the v2 pages.
- Figma plugin-API pitfalls found in earlier steps: use `await figma.setCurrentPageAsync`; do not use `createImageAsync`, `loadAllPagesAsync` or `setPluginData`; upload new images with `upload_assets`; open a Figma MCP file session with `create_session` before other file tools.
- Earlier runs built directions one at a time in this Figma file. Whether parallel edits to the same file are safe has not been tested.
- Git: committing `.agents/tasks` logs locally is fine. Do not push; the owner approves every push.
- No worktree needed: this run changes no application code.

## Starting paths
Repo root `d:\Folk\Own_Dir\FMT\DEV\mypos website`: `PRODUCT.md`, `DESIGN.md`, `design-tokens.json`, `.agents\tasks\redesign-brief.md`, `.agents\tasks\design-10\directions-v2.md`, `.agents\tasks\design-10\assets-v2.md`, `.agents\tasks\design-10\orchestrator-clarifications.md`, `.agents\tasks\design-10\build-log-v2.md`, `.agents\tasks\design-10\review-v2\` (past review findings: a list of mistakes such as low-resolution upscaling, duplicate photos and empty bands), `.agents\tasks\design-10\make-sheet.ps1` (the script that produced homes-d01-d04.png; arguments `-Out <png> -UrlList "a,b" -LabelList "D01,D02"`).

Environment: Windows with pwsh. The Windows username contains "^" (P^chapol), which cmd and npx strip, so run global Node tools as `node <full path>`. Long multi-line terminal output is sometimes lost, so write command output to a file and read the file. The terminal sometimes prefixes the first token with a stray character; starting commands with `$null;` avoids it.

## Deliverables and the check that proves the work done
- 10 new Figma pages, one per direction above, each with one Home frame 1440 px wide, each verified with a fresh `get_screenshot`.
- Each Home reported with its Figma link as soon as it is finished; the orchestrator relays them to the owner one by one.
- A labelled side-by-side contact sheet PNG of all 10 Homes at `d:\Folk\Own_Dir\FMT\DEV\mypos website\.agents\tasks\design-10\homes-v3.png`.
- A short Thai summary at `d:\Folk\Own_Dir\FMT\DEV\mypos website\.agents\tasks\design-10\v3-summary.md` with page and frame ids, Figma links, the Awwwards references used per direction, and the photos used per direction.
- Pass condition: an independent look at the contact sheet confirms that each direction is recognizable at a glance from the other nine (background, typography, layout and photo treatment) and matches its line in the list above; no excluded photo appears; no emoji and no invented facts appear.