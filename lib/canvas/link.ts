export const DEFAULT_CANVAS_URL = "https://canvas.instructure.com";

/** http(s) only. Rejects `javascript:` and other non-web URLs. */
export function safeHttpUrl(value: string | null | undefined): string | null {
  if (!value?.trim()) return null;
  try {
    const url = new URL(value.trim());
    if (url.protocol !== "https:" && url.protocol !== "http:") return null;
    return url.toString();
  } catch {
    return null;
  }
}

/** Keep an absolute Canvas link only when it stays on the school host. */
export function sameOriginHttpUrl(baseUrl: string, value: string | null | undefined): string | null {
  const safe = safeHttpUrl(value);
  if (!safe) return null;
  try {
    if (new URL(safe).origin !== new URL(baseUrl).origin) return null;
  } catch {
    return null;
  }
  return safe;
}

/**
 * Prefer a same-origin `html_url`. Otherwise build the Canvas page from `path`
 * on the school host. A bad or off-host link never wins.
 */
export function canvasPageUrl(baseUrl: string, path: string, htmlUrl?: string | null): string | null {
  const direct = sameOriginHttpUrl(baseUrl, htmlUrl);
  if (direct) return direct;
  if (htmlUrl?.startsWith("/")) {
    try {
      const resolved = sameOriginHttpUrl(baseUrl, new URL(htmlUrl, baseUrl).toString());
      if (resolved) return resolved;
    } catch {
      /* fall through to the known path */
    }
  }
  try {
    return sameOriginHttpUrl(baseUrl, new URL(path, baseUrl).toString());
  } catch {
    return null;
  }
}

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
