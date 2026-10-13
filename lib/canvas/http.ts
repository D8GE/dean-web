import { parseNextUrl, safeHttpUrl } from "./link";

export type CanvasConfig = {
  baseUrl: string;
  token: string;
};

const PAGE_CAP = 20;

export class CanvasRequestError extends Error {
  readonly status: number;

  constructor(status: number, path: string) {
    super(status === 401 ? "Canvas rejected the access token." : `Canvas responded ${status} for ${path}`);
    this.name = "CanvasRequestError";
    this.status = status;
  }
}

export type CanvasEnv = {
  CANVAS_BASE_URL?: string;
  CANVAS_TOKEN?: string;
};

/** School host only. Null when the variable is missing or not an http(s) URL. */
export function readCanvasBaseUrl(env: CanvasEnv): string | null {
  const raw = safeHttpUrl(env.CANVAS_BASE_URL);
  if (!raw) return null;
  return new URL(raw).origin;
}

export function readCanvasConfig(env: CanvasEnv): CanvasConfig | null {
  const baseUrl = readCanvasBaseUrl(env);
  const token = env.CANVAS_TOKEN?.trim() ?? "";
  if (!baseUrl || !token) return null;
  return { baseUrl, token };
}

function safePath(url: string): string {
  try {
    return new URL(url).pathname;
  } catch {
    return "canvas";
  }
}

function authHeaders(token: string): HeadersInit {
  return {
    Authorization: `Bearer ${token}`,
    Accept: "application/json",
  };
}

export async function canvasGet<T>(config: CanvasConfig, path: string, fetchImpl: typeof fetch = fetch): Promise<T> {
  const url = new URL(path, config.baseUrl).toString();
  const response = await fetchImpl(url, {
    headers: authHeaders(config.token),
    cache: "no-store",
    signal: AbortSignal.timeout(20_000),
  });
  if (!response.ok) throw new CanvasRequestError(response.status, safePath(url));
  return (await response.json()) as T;
}

export async function canvasGetAll<T>(
  config: CanvasConfig,
  path: string,
  fetchImpl: typeof fetch = fetch,
): Promise<T[]> {
  const items: T[] = [];
  let url: string | null = new URL(path, config.baseUrl).toString();
  for (let page = 0; url && page < PAGE_CAP; page += 1) {
    const response = await fetchImpl(url, {
      headers: authHeaders(config.token),
      cache: "no-store",
      signal: AbortSignal.timeout(20_000),
    });
    if (!response.ok) throw new CanvasRequestError(response.status, safePath(url));
    const body: unknown = await response.json();
    if (!Array.isArray(body)) throw new CanvasRequestError(response.status, safePath(url));
    items.push(...(body as T[]));
    url = parseNextUrl(response.headers.get("link"), config.baseUrl);
  }
  if (url) console.error(`[canvas] stopped after ${PAGE_CAP} pages for ${safePath(url)}`);
  return items;
}
