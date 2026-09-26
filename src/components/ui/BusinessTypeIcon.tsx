// One small line-icon per business type — inline SVG (no icon library/asset
// files needed), same stroke convention as the rest of the icon set
// (currentColor, ~1.3 stroke, 18x18 viewBox).
const paths: Record<string, React.ReactNode> = {
  restaurant: (
    <>
      <path d="M5 2v5a1 1 0 0 1-2 0V2M4 7v9" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      <path d="M13 2c-1.4 0-2 1.3-2 3s.6 3 2 3v8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </>
  ),
  retail: (
    <path
      d="M3 3h6l7 7-6 6-7-7V3Z M6.3 6.3h.01"
      stroke="currentColor"
      strokeWidth="1.3"
      strokeLinejoin="round"
      strokeLinecap="round"
      fill="none"
    />
  ),
  buffet: (
    <path
      d="M3 13h12M4 13a5 5 0 0 1 10 0M9 8V5M7.5 5h3"
      stroke="currentColor"
      strokeWidth="1.3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  ),
  convenience: (
    <path
      d="M3 7l1-4h10l1 4M3 7v7a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V7M3 7h12M8 15v-4h2v4"
      stroke="currentColor"
      strokeWidth="1.3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  ),
  themepark: (
    <>
      <circle cx="9" cy="9" r="5.5" stroke="currentColor" strokeWidth="1.3" />
      <path d="M9 3.5v11M3.5 9h11" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </>
  ),
  hotel: (
    <path
      d="M3 14.5V5M3 10h12v4.5M6 10V8.3a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1V10M15 14.5V12"
      stroke="currentColor"
      strokeWidth="1.3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  ),
  cafeteria: (
    <path
      d="M2.5 4.5h13a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1h-13a1 1 0 0 1-1-1v-7a1 1 0 0 1 1-1ZM5 8h3M5 10.5h5"
      stroke="currentColor"
      strokeWidth="1.3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  ),
  bakery: (
    <path
      d="M3 10.5a6 3 0 0 1 12 0v1a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-1ZM6 10.5V8M9 10.5V7M12 10.5V8"
      stroke="currentColor"
      strokeWidth="1.3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  ),
  office: (
    <path
      d="M4 15.5V3.5h7v12M11 7.5h3v8M2.5 15.5h13M6.5 6h2M6.5 9h2M6.5 12h2"
      stroke="currentColor"
      strokeWidth="1.3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  ),
  school: (
    <path
      d="M9 3.5 2 7l7 3.5L16 7 9 3.5ZM5 8.8v3.7c0 1 1.8 2 4 2s4-1 4-2V8.8M16 7v4"
      stroke="currentColor"
      strokeWidth="1.3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  ),
  manufacturing: (
    <path
      d="M3 15.5V9l3 2.2V9l3 2.2V9l4-3v9.5H3ZM3 15.5h10M13 6.5V4.5h2v2"
      stroke="currentColor"
      strokeWidth="1.3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  ),
};

export function BusinessTypeIcon({ type, size = 18 }: { type: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 18 18" fill="none" aria-hidden="true">
      {paths[type]}
    </svg>
  );
}
