import localFont from "next/font/local";

/**
 * Self-hosted fonts (OFL, files from Fontsource — see the OFL-*.txt files).
 * next/font/google downloads fonts at build time, which fails on servers
 * that can't reach fonts.gstatic.com; these ship with the repo instead.
 *
 * Each font is split into a Latin and a Thai subset file loaded as two
 * families. The stack "latin, thai" lets the browser pick per character, so
 * only the Latin file is used for English/digits and the Thai file for Thai.
 * The Latin family skips next/font's metric fallback so that fallback (a
 * system font without Thai) can't sit between the two in the stack.
 */

const anuphanLatin = localFont({
  src: "./anuphan-latin-wght-normal.woff2",
  weight: "100 700",
  variable: "--font-sans-latin",
  adjustFontFallback: false,
});

const anuphanThai = localFont({
  src: "./anuphan-thai-wght-normal.woff2",
  weight: "100 700",
  variable: "--font-sans-thai",
});

const chakraLatin = localFont({
  src: [
    { path: "./chakra-petch-latin-600-normal.woff2", weight: "600" },
    { path: "./chakra-petch-latin-700-normal.woff2", weight: "700" },
  ],
  variable: "--font-display-latin",
  adjustFontFallback: false,
});

const chakraThai = localFont({
  src: [
    { path: "./chakra-petch-thai-600-normal.woff2", weight: "600" },
    { path: "./chakra-petch-thai-700-normal.woff2", weight: "700" },
  ],
  variable: "--font-display-thai",
});

const promptLatin = localFont({
  src: [
    { path: "./prompt-latin-400-normal.woff2", weight: "400" },
    { path: "./prompt-latin-500-normal.woff2", weight: "500" },
    { path: "./prompt-latin-600-normal.woff2", weight: "600" },
    { path: "./prompt-latin-700-normal.woff2", weight: "700" },
  ],
  variable: "--font-admin-latin",
  adjustFontFallback: false,
  // Admin only: don't compete with the admin page's own requests.
  preload: false,
});

const promptThai = localFont({
  src: [
    { path: "./prompt-thai-400-normal.woff2", weight: "400" },
    { path: "./prompt-thai-500-normal.woff2", weight: "500" },
    { path: "./prompt-thai-600-normal.woff2", weight: "600" },
    { path: "./prompt-thai-700-normal.woff2", weight: "700" },
  ],
  variable: "--font-admin-thai",
  preload: false,
});

/** Public site: class names defining the variables + the stacks globals.css reads. */
export const siteFonts = {
  className: [anuphanLatin.variable, anuphanThai.variable, chakraLatin.variable, chakraThai.variable].join(" "),
  style: {
    "--font-sans-loaded": "var(--font-sans-latin), var(--font-sans-thai)",
    "--font-display-loaded": "var(--font-display-latin), var(--font-display-thai)",
  } as React.CSSProperties,
};

/** Admin: Prompt for both Latin and Thai. */
export const adminFonts = {
  className: [promptLatin.variable, promptThai.variable].join(" "),
  style: { "--font-sans-loaded": "var(--font-admin-latin), var(--font-admin-thai)" } as React.CSSProperties,
};
