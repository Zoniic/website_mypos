# Admin v2 (C1 history, C2 roles, C3 two-step login): owner decisions

Mockups: Figma file `RfzIGGGsN5zgLssxmgHouj`, page "ADMIN-IMPROVE v2" (node 163:2).

| # | Question | Answer | Date |
|---|---|---|---|
| R1 | What can the editor role do? | R1b + R1c: editors can also export lead CSV and delete records. Admin users, site settings and the change history stay owner-only. | 2026-11-24 |
| R2 | Two-step login policy | R2c: not required for anyone. Every admin may turn it on for their own account. | 2026-11-24 |
| R3 | History retention and restore scope | R3a: keep 1 year; restore only text (PageContent and translated text fields). Prices, photos and deleted records can be viewed, not restored. | 2026-11-24 |
| R4 | Owner loses phone and backup codes | R4a: a server-side script may turn off two-step login for one account; every use is written to the change history. | 2026-11-24 |
| Mockups | Approve H1-H3, P1-P3, T1-T3 | 2a: approved as shown (with the R1 change already applied to P1/P2). Add a "บัญชีของฉัน" link under the user name in the sidebar to open T1. | 2026-11-24 |
| Schema | Apply admin-v2-schema.sql to the shared DB | Approved ("Migrate DB เลย"). Applied 2026-11-24 13:20 (+07) in one transaction: 4 AdminUser columns, AdminBackupCode, AuditLog, 5 indexes, 1 FK. All 8 admins are owners. Log: `migrate-log.txt`; backups `prisma/backups/admin-v2-before-2026-11-24T06-19-41-181Z.json`, `full-2026-11-24T06-19-46-816Z.json` (verify: all counts match). Production build on the real DB: 10/10 page checks, bug re-check 40/40. | 2026-11-24 |
| 2FA key | `TWO_FACTOR_ENCRYPTION_KEY` | Not now: the owner does not use two-step login yet. Without the key everything works; turning on 2FA is not possible. | 2026-11-24 |
| Supabase region | | ap-southeast-1 (Singapore), from the pooler host. | 2026-11-24 |
| Hosting | Where to deploy | 3a: a container hosting service. Proposed: Railway, Singapore region (`asia-southeast1-eqsg3a`). Railway pricing checked 2026-11-24 at https://railway.com/pricing: Hobby $5/month incl. $5 usage (described as personal projects), Pro $20/month per workspace incl. $20 usage (teams shipping to production); usage about $10 per GB RAM-month and $20 per vCPU-month, billed per second. Provider and plan not confirmed by the owner yet. | 2026-11-24 |

Editor permissions after R1 (P1 mockup updated to match):

| Action | Owner | Editor |
|---|---|---|
| Answer leads, change status, notes, orders | yes | yes |
| Add, edit and delete products, copy, photos, articles | yes | yes |
| Export lead CSV | yes | yes |
| Manage admin users and roles | yes | no |
| Site settings (payments, pixels, contact numbers) | yes | no |
| View change history and restore | yes | no |

Consequences for the build:
- P1 "รหัส 2 ขั้นตอน" column stays, but "ยังไม่เปิด" is informational, not a warning that blocks anything (R2c).
- Schema changes (new `AuditLog` table; `AdminUser.role`, encrypted TOTP secret, hashed backup codes) are additive only and still need the owner's approval before they run on the shared database.
