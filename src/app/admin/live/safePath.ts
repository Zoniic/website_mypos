/** Only same-site public paths (no //host, no admin loops); anything else goes to the Thai home. */
export function safeSitePath(path: string | null): string {
  if (!path || !path.startsWith("/") || path.startsWith("//") || path.startsWith("/admin") || /[\s\\]/.test(path)) {
    return "/th";
  }
  return path;
}
