import { parseNextUrl } from "./link";

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

export function readCanvasConfig(env: CanvasEnv): CanvasConfig | null {
  const rawBase = env.CANVAS_BASE_URL?.trim() ?? "";
  const token = env.CANVAS_TOKEN?.trim() ?? "";
  if (!rawBase || !token) return null;
  let parsed: URL;
  try {
    parsed = new URL(rawBase);
  } catch {
    return null;
  }
  if (parsed.protocol !== "https:" && parsed.protocol !== "http:") return null;
  return { baseUrl: parsed.origin, token };
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
  return items;
}
