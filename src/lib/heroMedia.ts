/**
 * Shared between Hero.tsx (server) and HeroBackgroundUploadField.tsx
 * (client) so the "is this an mp4 or an image" check can't drift between
 * the admin preview and what actually renders on the public homepage.
 */
export function isVideoUrl(url: string): boolean {
  return /\.mp4($|\?)/i.test(url);
}
