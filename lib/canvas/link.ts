/** Pull the `rel="next"` URL out of a Canvas Link header, staying on the same origin. */
export function parseNextUrl(linkHeader: string | null, baseUrl: string): string | null {
  if (!linkHeader) return null;
  let base: URL;
  try {
    base = new URL(baseUrl);
  } catch {
    return null;
  }
  for (const part of linkHeader.split(",")) {
    const match = part.match(/<([^>]+)>\s*;\s*rel="?next"?/i);
    if (!match) continue;
    let next: URL;
    try {
      next = new URL(match[1], base);
    } catch {
      return null;
    }
    if (next.origin !== base.origin) return null;
    return next.toString();
  }
  return null;
}
