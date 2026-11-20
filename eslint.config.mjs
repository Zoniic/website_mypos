import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

/**
 * The Lucide Rule (DESIGN.md §10): icons come from `lucide-react` only.
 *  - no emoji anywhere in UI strings,
 *  - no text characters standing in for an icon (→ ↗ ↑ ↓ ✓ ✕ ▾ ✱) at the start or
 *    end of a string / JSX text (a mid-sentence arrow in prose is left alone),
 *  - no hand-drawn inline <svg>.
 */
// ©, ® and ™ are legal marks, not emoji. Zero-width characters are left alone:
// edit mode uses them as invisible markers (src/lib/editMode.ts).
const EMOJI = /(?![\u00A9\u00AE\u2122])\p{Extended_Pictographic}/u;
const ICON_GLYPH = /^\s*[\u2190-\u21FF\u2713\u2715\u25BE\u2731]|[\u2190-\u21FF\u2713\u2715\u25BE\u2731]\s*$/u;

// A string that is only a symbol (a button label such as "×", "+", "−").
// Padding must contain a line break, so inline operators like " × " (quantity ×
// price) and " + " (a list separator) are left alone.
const SOLE_SYMBOL = /^(?:[\t ]*[\r\n]\s*)?[\u00D7\u2212+\u2715](?:\s*[\r\n]\s*)?$/u;

function glyphProblem(text) {
  if (SOLE_SYMBOL.test(text)) return "Do not use a text character as an icon. Use an icon from lucide-react (DESIGN.md §10).";
  if (EMOJI.test(text)) return "Emoji is not allowed. Use an icon from lucide-react (DESIGN.md §10).";
  if (ICON_GLYPH.test(text)) return "Do not use a text character as an icon. Use an icon from lucide-react (DESIGN.md §10).";
  return null;
}

const lucideRulePlugin = {
  rules: {
    "no-icon-glyphs": {
      meta: { type: "problem", schema: [] },
      create(context) {
        const check = (node, text) => {
          if (typeof text !== "string") return;
          const message = glyphProblem(text);
          if (message) context.report({ node, message });
        };
        return {
          Literal: (node) => check(node, node.value),
          TemplateElement: (node) => check(node, node.value.cooked),
          JSXText: (node) => check(node, node.value),
        };
      },
    },
    "no-raw-svg": {
      meta: { type: "problem", schema: [] },
      create(context) {
        return {
          JSXOpeningElement(node) {
            if (node.name.type === "JSXIdentifier" && node.name.name === "svg") {
              context.report({ node, message: "Do not hand-draw icons in inline <svg>. Use an icon from lucide-react (DESIGN.md §10)." });
            }
          },
        };
      },
    },
  },
};

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    files: ["src/**/*.{ts,tsx}"],
    plugins: { lucide: lucideRulePlugin },
    rules: {
      "lucide/no-icon-glyphs": "warn",
      "lucide/no-raw-svg": "warn",
    },
  },
  // Allowed exceptions (DESIGN.md §10).
  {
    files: [
      "src/components/ui/MachineArt.tsx", // product illustration, not an icon
      "src/components/ui/BrandIcons.tsx", // LINE / Shopee / Lazada / Facebook marks
      "src/lib/ogImage.tsx", // Satori renders plain SVG, no React icon components
      "src/lib/notify.ts", // plain-text LINE/email alerts, not site UI
    ],
    rules: {
      "lucide/no-icon-glyphs": "off",
      "lucide/no-raw-svg": "off",
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
