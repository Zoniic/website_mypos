/**
 * 301/308 redirects from the old .php site (https://mypos.co.th before the
 * switch) to the new route structure.
 *
 * Source list: a crawl of the live old site on 2026-11-23 (it has no
 * sitemap.xml): `.agents/tasks/fix-round2/old-site.txt`. Search Console may
 * know more old URLs; add them here when the domain is verified.
 *
 * Rules used:
 *  - a page goes to a product page only when the model is exactly the same
 *    (F58, T70, K156A/K156W -> K156);
 *  - discontinued models go to their product line (POS, self-order kiosk);
 *  - an accessory page goes to the accessory detail page when the model is
 *    the same (FM2200; F-330K-4B4C is the F-330K drawer with a 4-note,
 *    4-coin tray);
 *  - other cash drawers, scanners, printers, paper and labels go to Accessories.
 *
 * `destination` has no locale prefix: the i18n proxy adds /th (default).
 * Paths with a dot (".php") never reach src/proxy.ts, so these redirects are
 * the only thing that answers them. Matching is exact (case-sensitive), so
 * each path is written as the old site spells it.
 */
export type LegacyRedirect = {
  source: string;
  destination: string;
  has?: { type: "query"; key: string; value: string }[];
};

const to = (destination: string, sources: string[]): LegacyRedirect[] =>
  sources.map((source) => ({ source, destination }));

export const legacyRedirects: LegacyRedirect[] = [
  ...to("/", ["/index.php", "/index.html", "/Mypos-Home.php"]),
  ...to("/contact", ["/Contact-MYPOS.php"]),
  ...to("/software", ["/Mypos-Application.php"]),
  ...to("/products", ["/download.php"]),
  ...to("/references/dreamworld", ["/Dreamworld-Project.php"]),
  ...to("/references/ruengrawin-metal", ["/Ruengrawin-Project.php"]),

  // Same model on the new site.
  ...to("/products/mypos-f58", ["/products/F58.php"]),
  ...to("/products/mypos-t70", ["/products/t70.php"]),
  ...to("/products/mypos-k156", ["/products/K156A.php", "/products/K156W.php"]),

  // POS machines (Android and Windows) no longer listed: the POS line.
  ...to("/solutions/pos", [
    "/Android-POS-Machine.php",
    "/Windows-POS-Machine.php",
    "/products/F-59.php",
    "/products/o11.php",
    "/products/D1.php",
    "/products/F82.php",
    "/products/F85.php",
    "/products/ranger1-T8.php",
    "/products/T1-A.php",
    "/products/Q1A-Lite.php",
    "/products/F60-58.php",
    "/products/F60-80.php",
    "/products/F68-58.php",
    "/products/F68-80.php",
    "/products/F88.php",
    "/products/t50.php",
    "/products/t60.php",
    "/products/f1s.php",
    "/products/F3.php",
    "/products/F58-PLUS.php",
    "/products/F100.php",
    "/products/N1-A.php",
    "/products/p10.php",
    "/products/ranger1-T5.php",
    "/products/ranger2.php",
    "/products/F60W.php",
    "/products/F82W.php",
    "/products/F85W.php",
    "/products/F88W.php",
    "/products/T1-W.php",
    "/products/Q1-W.php",
    "/products/Q-80-Plus.php",
    "/products/F61W.php",
    "/products/N1-W.php",
    "/products/FM-185D.php",
  ]),

  // Self-service kiosks no longer listed: the self-order line.
  ...to("/solutions/self-order", [
    "/Self-Service-Kiosk.php",
    "/products/FM-KA-Series.php",
    "/products/FM-EA-Series.php",
    "/products/K215A.php",
    "/products/FM-KW-Series.php",
    "/products/FM-EW-Series.php",
    "/products/K215W.php",
  ]),

  // Same accessory model on the new site.
  ...to("/accessories/mypos-fm2200", ["/products/FM2200.php"]),
  ...to("/accessories/mypos-f-330k", ["/products/F-330K-4B4C.php"]),

  // Peripherals and consumables.
  ...to("/accessories", [
    "/Cash-Drawer.php",
    "/Barcode-Scanner.php",
    "/Thermal-Printer.php",
    "/Thermal-Paper.php",
    "/products/Label-Sticker.php",
    "/products/Thermal-Paper.php",
    "/products/F-330F-5B2C.php",
    "/products/F-400A-5B3C.php",
    "/products/F-400K-5B5C.php",
    "/products/F-405-5B4C.php",
    "/products/HR11.php",
    "/products/HR100.php",
    "/products/HR2081.php",
    "/products/HR3280.php",
    "/products/FM22.php",
    "/products/FM30.php",
    "/products/FM90.php",
    "/products/FM10.php",
    "/products/F-8220.php",
    "/products/F-8250.php",
    "/products/F-8380.php",
    "/products/P58.php",
    "/products/P-8025.php",
  ]),
];
