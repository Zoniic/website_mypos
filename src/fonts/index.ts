import localFont from "next/font/local";

/**
 * Prompt (OFL, files from Fontsource — see OFL-Prompt.txt), self-hosted:
 * next/font/google downloads fonts at build time, which fails on servers
 * that can't reach fonts.gstatic.com.
 *
 * The font is split into a Latin and a Thai subset file per weight, loaded
 * as two families. The stack "latin, thai" lets the browser pick per
 * character, so English/digits come from the Latin file and Thai from the
 * Thai file. The Latin family skips next/font's metric fallback so that
 * fallback (a system font without Thai) can't sit between the two.
 * Weights match what the site uses: 400 body, 500/600 UI, 700 headings.
 */

const promptLatin = localFont({
  src: [
    { path: "./prompt-latin-400-normal.woff2", weight: "400" },
    { path: "./prompt-latin-500-normal.woff2", weight: "500" },
    { path: "./prompt-latin-600-normal.woff2", weight: "600" },
    { path: "./prompt-latin-700-normal.woff2", weight: "700" },
  ],
  variable: "--font-prompt-latin",
  adjustFontFallback: false,
});

const promptThai = localFont({
  src: [
    { path: "./prompt-thai-400-normal.woff2", weight: "400" },
    { path: "./prompt-thai-500-normal.woff2", weight: "500" },
    { path: "./prompt-thai-600-normal.woff2", weight: "600" },
    { path: "./prompt-thai-700-normal.woff2", weight: "700" },
  ],
  variable: "--font-prompt-thai",
});

const stack = "var(--font-prompt-latin), var(--font-prompt-thai)";

/** Public site: body and headings both use Prompt. */
export const siteFonts = {
  className: [promptLatin.variable, promptThai.variable].join(" "),
  style: { "--font-sans-loaded": stack, "--font-display-loaded": stack } as React.CSSProperties,
};

/** Admin uses the same font. */
export const adminFonts = {
  className: siteFonts.className,
  style: { "--font-sans-loaded": stack } as React.CSSProperties,
};
