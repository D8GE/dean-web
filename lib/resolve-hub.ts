import { fetchCanvasBundle } from "./canvas/bundle";
import { CanvasRequestError, readCanvasBaseUrl, readCanvasConfig, type CanvasEnv } from "./canvas/http";
import { DEFAULT_CANVAS_URL } from "./canvas/link";
import { mapCanvasBundle } from "./canvas/mappers";
import { demoSnapshot, refreshClock, type HubSnapshot } from "./hub";

const TTL_MS = 60_000;

type CacheEntry = { expires: number; hub: HubSnapshot };
const cache = new Map<string, CacheEntry>();

export function clearHubCache(): void {
  cache.clear();
}

function tokenFingerprint(token: string): string {
  let hash = 2166136261;
  for (let i = 0; i < token.length; i += 1) {
    hash ^= token.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16);
}

export async function resolveHub(options: {
  env: CanvasEnv;
  fetchImpl?: typeof fetch;
  now?: Date;
}): Promise<HubSnapshot> {
  const now = options.now ?? new Date();
  const canvasUrl = readCanvasBaseUrl(options.env) ?? DEFAULT_CANVAS_URL;
  const config = readCanvasConfig(options.env);
  if (!config) return demoSnapshot("Add CANVAS_BASE_URL and CANVAS_TOKEN to .env.local.", canvasUrl);

  const key = `${config.baseUrl}:${tokenFingerprint(config.token)}`;
  if (!options.fetchImpl) {
    const hit = cache.get(key);
    if (hit && hit.expires > Date.now()) return refreshClock(hit.hub, now);
  }

  try {
    const bundle = await fetchCanvasBundle(config, options.fetchImpl ?? fetch, now);
    const hub = { ...mapCanvasBundle(bundle, now), canvasUrl: config.baseUrl };
    if (!options.fetchImpl) cache.set(key, { expires: Date.now() + TTL_MS, hub });
    return refreshClock(hub, now);
  } catch (error) {
    const detail = error instanceof Error ? error.message : "Canvas request failed.";
    console.error(`[canvas] falling back to demo data: ${detail}`);
    const message =
      error instanceof CanvasRequestError ? error.message : "Couldn't reach Canvas. Showing the demo school.";
    return demoSnapshot(message, canvasUrl);
  }
}
