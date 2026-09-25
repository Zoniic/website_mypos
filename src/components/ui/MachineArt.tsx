/**
 * Flat, front-elevation drawings of the four MYPOS machine families. They
 * stand in for product photography until real photos are uploaded in the
 * admin, so every placeholder on the site shows the kind of machine the
 * page is actually about instead of an empty box.
 *
 * All four share one scale (1 unit ≈ 0.6 cm) and a floor at the bottom of
 * their viewBox, so they can be lined up side by side in proportion.
 */

export type MachineKind = "kiosk" | "pos" | "scale" | "ticket";

const INK = "#16181d";
const INK_SOFT = "#2b2e36";
const SCREEN = "#f4f5f7";
const TILE = "#dfe2e7";
const ACCENT = "#e85520";
const PAPER = "#ffffff";

function ScreenTiles({ x, y, cols, rows, w, h, gap }: { x: number; y: number; cols: number; rows: number; w: number; h: number; gap: number }) {
  const tiles = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const tx = x + c * (w + gap);
      const ty = y + r * (h + gap);
      tiles.push(
        <g key={`${r}-${c}`}>
          <rect x={tx} y={ty} width={w} height={h} rx={2} fill={TILE} />
          <rect x={tx + 3} y={ty + h - 6} width={w * 0.55} height={2.4} rx={1.2} fill={INK} opacity={0.35} />
          <circle cx={tx + w / 2} cy={ty + h * 0.38} r={Math.min(w, h) * 0.18} fill={(r + c) % 3 === 0 ? ACCENT : "#c3c8d0"} />
        </g>,
      );
    }
  }
  return <>{tiles}</>;
}

function Kiosk() {
  return (
    <svg viewBox="0 0 120 300" aria-hidden="true" className="h-full w-auto overflow-visible">
      <ellipse cx="60" cy="297" rx="44" ry="3.5" fill={INK} opacity="0.18" />
      <rect x="30" y="286" width="60" height="10" rx="3" fill={INK} />
      <rect x="49" y="204" width="22" height="84" fill={INK} />
      <rect x="53" y="204" width="4" height="84" fill={INK_SOFT} />
      <rect x="12" y="14" width="96" height="196" rx="11" fill={INK} />
      <rect x="15" y="17" width="3" height="190" rx="1.5" fill="#ffffff" opacity="0.07" />
      <rect x="20" y="24" width="80" height="130" rx="4" fill={SCREEN} />
      <rect x="20" y="24" width="80" height="14" rx="4" fill={ACCENT} />
      <rect x="20" y="31" width="80" height="7" fill={ACCENT} />
      <rect x="25" y="29" width="22" height="3.5" rx="1.75" fill={PAPER} opacity="0.9" />
      <ScreenTiles x={25} y={44} cols={2} rows={3} w={33} h={27} gap={4} />
      <rect x="25" y="140" width="70" height="9" rx="3" fill={INK} />
      <rect x="62" y="143" width="28" height="3" rx="1.5" fill={ACCENT} />
      <rect x="36" y="163" width="48" height="4" rx="2" fill={INK_SOFT} />
      <rect x="34" y="176" width="52" height="5" rx="2" fill="#0a0b0e" />
      <path d="M44 179h32v16l-4 -2 -4 2 -4 -2 -4 2 -4 -2 -4 2 -4 -2 -4 2Z" fill={PAPER} />
      <rect x="48" y="184" width="18" height="1.6" rx="0.8" fill={INK} opacity="0.3" />
      <rect x="48" y="188" width="12" height="1.6" rx="0.8" fill={INK} opacity="0.3" />
    </svg>
  );
}

function Pos() {
  return (
    <svg viewBox="0 0 140 110" aria-hidden="true" className="h-full w-auto overflow-visible">
      <ellipse cx="70" cy="108" rx="40" ry="2.6" fill={INK} opacity="0.18" />
      <path d="M44 106h52l-6 -8h-40Z" fill={INK} />
      <path d="M63 98h14l-3 -34h-8Z" fill={INK} />
      <rect x="66" y="64" width="3" height="34" fill={INK_SOFT} />
      <rect x="10" y="4" width="120" height="68" rx="6" fill={INK} />
      <rect x="16" y="9" width="108" height="58" rx="3" fill={SCREEN} />
      <ScreenTiles x={20} y={14} cols={3} rows={2} w={18} h={20} gap={3} />
      <rect x="85" y="14" width="35" height="48" rx="2" fill="#ffffff" />
      <rect x="89" y="19" width="22" height="2" rx="1" fill={INK} opacity="0.35" />
      <rect x="89" y="25" width="26" height="2" rx="1" fill={INK} opacity="0.2" />
      <rect x="89" y="31" width="18" height="2" rx="1" fill={INK} opacity="0.2" />
      <rect x="89" y="37" width="24" height="2" rx="1" fill={INK} opacity="0.2" />
      <rect x="89" y="52" width="27" height="7" rx="2" fill={ACCENT} />
      <rect x="20" y="58" width="60" height="4" rx="2" fill={TILE} />
    </svg>
  );
}

function Scale() {
  return (
    <svg viewBox="0 0 120 110" aria-hidden="true" className="h-full w-auto overflow-visible">
      <ellipse cx="58" cy="108" rx="48" ry="2.6" fill={INK} opacity="0.18" />
      <rect x="10" y="96" width="96" height="10" rx="3" fill={INK} />
      <rect x="6" y="90" width="104" height="7" rx="2" fill="#c7cbd2" />
      <rect x="6" y="90" width="104" height="2" rx="1" fill="#ffffff" opacity="0.6" />
      <path d="M26 66h52c-2 14 -10 23 -26 23s-24 -9 -26 -23Z" fill={PAPER} />
      <ellipse cx="52" cy="66" rx="26" ry="4.5" fill="#f0f1f3" />
      <path d="M36 66c4 -6 10 -9 16 -9s12 3 16 9" fill={ACCENT} opacity="0.85" />
      <path d="M26 66h52c-2 14 -10 23 -26 23s-24 -9 -26 -23Z" fill="none" stroke={INK} strokeOpacity="0.12" />
      <rect x="96" y="30" width="6" height="60" fill={INK} />
      <rect x="76" y="6" width="42" height="32" rx="4" fill={INK} />
      <rect x="80" y="10" width="34" height="24" rx="2" fill={SCREEN} />
      <rect x="84" y="14" width="16" height="3" rx="1.5" fill={INK} opacity="0.35" />
      <rect x="84" y="21" width="26" height="6" rx="1.5" fill={INK} />
      <rect x="84" y="29" width="12" height="2.5" rx="1.25" fill={ACCENT} />
    </svg>
  );
}

function Ticket() {
  return (
    <svg viewBox="0 0 110 280" aria-hidden="true" className="h-full w-auto overflow-visible">
      <ellipse cx="55" cy="277" rx="46" ry="3.5" fill={INK} opacity="0.18" />
      <rect x="8" y="266" width="94" height="10" rx="3" fill={INK} />
      <rect x="14" y="92" width="82" height="176" rx="8" fill={INK} />
      <rect x="18" y="96" width="3" height="168" rx="1.5" fill="#ffffff" opacity="0.07" />
      <path d="M8 94h94l-8 -78h-78Z" fill={INK} />
      <path d="M19 86h72l-6 -62h-60Z" fill={SCREEN} />
      <path d="M22 34h66l-0.9 -9h-64.2Z" fill={ACCENT} />
      <rect x="28" y="42" width="54" height="10" rx="2" fill={TILE} />
      <rect x="31" y="45.5" width="20" height="3" rx="1.5" fill={INK} opacity="0.4" />
      <rect x="28" y="56" width="54" height="10" rx="2" fill={TILE} />
      <rect x="31" y="59.5" width="26" height="3" rx="1.5" fill={INK} opacity="0.4" />
      <rect x="30" y="72" width="50" height="8" rx="2.5" fill={INK} />
      <rect x="60" y="75" width="16" height="2" rx="1" fill={ACCENT} />
      <rect x="30" y="122" width="50" height="5" rx="2" fill="#0a0b0e" />
      <path d="M40 125h30v20h-30Z" fill={PAPER} />
      <path d="M40 135h30" stroke={INK} strokeOpacity="0.25" strokeDasharray="2 2" />
      <rect x="44" y="129" width="12" height="2" rx="1" fill={ACCENT} />
      <rect x="38" y="164" width="34" height="18" rx="3" fill={INK_SOFT} />
      <rect x="42" y="172" width="26" height="2" rx="1" fill={ACCENT} />
    </svg>
  );
}

const components: Record<MachineKind, () => React.ReactElement> = {
  kiosk: Kiosk,
  pos: Pos,
  scale: Scale,
  ticket: Ticket,
};

/** One machine, sized by its container's height. */
export function MachineArt({ kind, className = "" }: { kind: MachineKind; className?: string }) {
  const Component = components[kind];
  return (
    <span className={`inline-flex items-end ${className}`}>
      <Component />
    </span>
  );
}
