import "server-only";
import { resolveHub } from "./resolve-hub";

/** Server entry. The token is read here and never returned to the client. */
export async function loadHub() {
  return resolveHub({
    env: {
      CANVAS_BASE_URL: process.env.CANVAS_BASE_URL,
      CANVAS_TOKEN: process.env.CANVAS_TOKEN,
    },
  });
}
