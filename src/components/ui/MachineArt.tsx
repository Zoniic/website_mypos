/**
 * Flat, front-elevation drawings of the four MYPOS machine families. They
 * stand in for product photography until real photos are uploaded in the
 * admin, so every placeholder on the site shows the kind of machine the
 * page is actually about instead of an empty box.
 *
 * All four share one scale (1 unit ≈ 0.6 cm) and a floor at the bottom of
 * their viewBox, so they can be lined up side by side in proportion.
 */

export type MachineKind = "kiosk" | "pos" | "scale" | "ticket" | "kds" | "queue" | "vending";

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

/** Kitchen display: 15.6" landscape touchscreen on a counter stand. */
function Kds() {
  const tickets = [0, 1, 2];
  return (
    <svg viewBox="0 0 120 100" aria-hidden="true" className="h-full w-auto overflow-visible">
      <ellipse cx="60" cy="98" rx="30" ry="2.4" fill={INK} opacity="0.18" />
      <path d="M40 96h40l-5 -7h-30Z" fill={INK} />
      <path d="M55 89h10l-2 -24h-6Z" fill={INK} />
      <rect x="6" y="6" width="108" height="64" rx="5" fill={INK} />
      <rect x="11" y="10" width="98" height="56" rx="2" fill={SCREEN} />
      <rect x="11" y="10" width="98" height="7" rx="2" fill={INK_SOFT} />
      <rect x="15" y="12.5" width="18" height="2" rx="1" fill={PAPER} opacity="0.8" />
      {tickets.map((i) => {
        const x = 15 + i * 31.5;
        return (
          <g key={i}>
            <rect x={x} y="21" width="28" height="41" rx="2" fill={PAPER} stroke={INK} strokeOpacity="0.08" />
            <rect x={x} y="21" width="28" height="7" rx="2" fill={i === 0 ? ACCENT : TILE} />
            <rect x={x + 3} y="23.5" width="10" height="2.2" rx="1.1" fill={i === 0 ? PAPER : INK} opacity={i === 0 ? 0.95 : 0.45} />
            <rect x={x + 3} y="32" width="20" height="2" rx="1" fill={INK} opacity="0.4" />
            <rect x={x + 3} y="37" width="15" height="2" rx="1" fill={INK} opacity="0.25" />
            <rect x={x + 3} y="42" width="18" height="2" rx="1" fill={INK} opacity="0.25" />
            <rect x={x + 3} y="54" width="22" height="5" rx="1.5" fill={i === 2 ? ACCENT : TILE} />
          </g>
        );
      })}
    </svg>
  );
}

/** Queue display: wall-mounted TV driven by the MYPOS Android box. */
function QueueTv() {
  const columns = [
    { head: INK_SOFT, numbers: ["A18", "A19"] },
    { head: TILE, numbers: ["A15", "A16", "A17"] },
    { head: ACCENT, numbers: ["A12", "A14"] },
  ];
  return (
    <svg viewBox="0 0 170 110" aria-hidden="true" className="h-full w-auto overflow-visible">
      <rect x="4" y="4" width="162" height="94" rx="4" fill={INK} />
      <rect x="8" y="8" width="154" height="86" rx="1.5" fill={SCREEN} />
      {columns.map((col, i) => {
        const x = 12 + i * 50;
        return (
          <g key={i}>
            <rect x={x} y="12" width="46" height="10" rx="1.5" fill={col.head} />
            <rect x={x + 4} y="15.8" width="20" height="2.4" rx="1.2" fill={col.head === TILE ? INK : PAPER} opacity={col.head === TILE ? 0.5 : 0.9} />
            {col.numbers.map((n, j) => (
              <g key={n}>
                <rect x={x} y={26 + j * 21} width="46" height="17" rx="2" fill={PAPER} stroke={INK} strokeOpacity="0.06" />
                <text
                  x={x + 23}
                  y={38.5 + j * 21}
                  textAnchor="middle"
                  fontSize="11"
                  fontWeight="700"
                  fontFamily="inherit"
                  fill={i === 2 ? ACCENT : INK}
                >
                  {n}
                </text>
              </g>
            ))}
          </g>
        );
      })}
      {/* Android box and its cable, tucked under the TV */}
      <path d="M130 98v6" stroke={INK} strokeOpacity="0.4" strokeWidth="1.2" />
      <rect x="118" y="104" width="24" height="5" rx="1.5" fill={INK_SOFT} />
      <circle cx="138" cy="106.5" r="0.9" fill={ACCENT} />
    </svg>
  );
}

/** Vending machine: spiral product window + vertical touchscreen payment column. */
function Vending() {
  const rows = [0, 1, 2, 3, 4];
  const palette = [ACCENT, "#c3c8d0", TILE, "#ffb48a", "#9aa1ac"];
  return (
    <svg viewBox="0 0 160 310" aria-hidden="true" className="h-full w-auto overflow-visible">
      <ellipse cx="80" cy="307" rx="72" ry="3.5" fill={INK} opacity="0.18" />
      <rect x="6" y="6" width="148" height="296" rx="8" fill={INK} />
      <rect x="9" y="9" width="3" height="290" rx="1.5" fill="#ffffff" opacity="0.07" />
      {/* Product window */}
      <rect x="14" y="16" width="92" height="206" rx="3" fill="#e9edf2" />
      <rect x="14" y="16" width="92" height="206" rx="3" fill="#ffffff" opacity="0.35" />
      {rows.map((r) => (
        <g key={r}>
          <rect x="16" y={52 + r * 40} width="88" height="2.5" fill={INK} opacity="0.25" />
          {[0, 1, 2, 3].map((c) => (
            <rect
              key={c}
              x={21 + c * 21}
              y={26 + r * 40}
              width="14"
              height={r % 2 === 0 ? 25 : 20}
              rx={r % 2 === 0 ? 5 : 2}
              fill={palette[(r + c) % palette.length]}
              opacity="0.9"
              transform={r % 2 === 0 ? undefined : `translate(0 5)`}
            />
          ))}
        </g>
      ))}
      <rect x="14" y="16" width="16" height="206" fill="#ffffff" opacity="0.18" />
      {/* Payment column */}
      <rect x="112" y="16" width="36" height="64" rx="2.5" fill={INK_SOFT} />
      <rect x="115" y="19" width="30" height="58" rx="1.5" fill={SCREEN} />
      <rect x="115" y="19" width="30" height="6" rx="1.5" fill={ACCENT} />
      <rect x="118" y="30" width="24" height="10" rx="1" fill={TILE} />
      <rect x="118" y="43" width="24" height="10" rx="1" fill={TILE} />
      <rect x="118" y="62" width="24" height="10" rx="1" fill={INK} />
      <rect x="118" y="65" width="12" height="3" rx="1.5" fill={ACCENT} />
      <rect x="116" y="92" width="28" height="12" rx="2" fill={INK_SOFT} />
      <rect x="120" y="97" width="20" height="2.2" rx="1.1" fill="#0a0b0e" />
      <rect x="124" y="112" width="12" height="14" rx="2" fill={INK_SOFT} />
      <rect x="128.5" y="115" width="3" height="8" rx="1.5" fill="#0a0b0e" />
      <rect x="120" y="134" width="20" height="10" rx="2" fill={INK_SOFT} />
      <rect x="122" y="142" width="16" height="2" fill="#0a0b0e" />
      {/* Pickup bay */}
      <rect x="18" y="234" width="84" height="44" rx="3" fill="#0a0b0e" />
      <rect x="22" y="238" width="76" height="8" rx="2" fill={INK_SOFT} />
      <rect x="112" y="240" width="36" height="30" rx="2" fill={INK_SOFT} />
      <rect x="6" y="292" width="148" height="10" rx="3" fill="#0a0b0e" />
    </svg>
  );
}

const components: Record<MachineKind, () => React.ReactElement> = {
  kiosk: Kiosk,
  pos: Pos,
  scale: Scale,
  ticket: Ticket,
  kds: Kds,
  queue: QueueTv,
  vending: Vending,
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
