/**
 * In-memory sliding-window rate limiter. Good enough for a single
 * long-running Node process (self-hosted / `npm run start`); on
 * serverless platforms each instance has its own memory, so this is
 * best-effort there, not a hard guarantee.
 */
const attempts = new Map<string, number[]>();

const WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const MAX_ATTEMPTS = 5;

/** Returns true if `key` has exceeded MAX_ATTEMPTS within the window. */
export function isRateLimited(key: string): boolean {
  const now = Date.now();
  const timestamps = (attempts.get(key) ?? []).filter((t) => now - t < WINDOW_MS);
  attempts.set(key, timestamps);
  return timestamps.length >= MAX_ATTEMPTS;
}

/** Records a failed attempt for `key`. */
export function recordAttempt(key: string): void {
  const now = Date.now();
  const timestamps = (attempts.get(key) ?? []).filter((t) => now - t < WINDOW_MS);
  timestamps.push(now);
  attempts.set(key, timestamps);
}

/** Clears attempts for `key` (call on successful login). */
export function clearAttempts(key: string): void {
  attempts.delete(key);
}
