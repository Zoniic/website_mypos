// Brand marks that are not in Lucide. This file is one of the allowed
// exceptions to The Lucide Rule (DESIGN.md §10); every other icon in the
// project comes from lucide-react.

/** LINE chat bubble, used on the LINE call-to-action. */
export function LineIcon({ size = 20, className }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" className={className}>
      <path
        d="M12 3C6.5 3 2 6.6 2 11c0 3.9 3.6 7.2 8.4 7.9.3.1.8.3.9.6.1.3.1.7 0 1l-.1.9c0 .3-.2 1 .9.5 1.1-.4 5.7-3.4 7.8-5.8C21.2 14.2 22 12.7 22 11c0-4.4-4.5-8-10-8z"
        fill="currentColor"
      />
    </svg>
  );
}
