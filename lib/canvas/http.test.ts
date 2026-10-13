import { describe, expect, it } from "vitest";
import { canvasGetAll, CanvasRequestError, readCanvasConfig } from "./http";
import { parseNextUrl } from "./link";

const config = { baseUrl: "https://school.instructure.com", token: "secret-token" };

function jsonResponse(body: unknown, link?: string, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: link ? { link } : undefined,
  });
}

describe("parseNextUrl", () => {
  it("reads the next link and ignores other relations", () => {
    const header =
      '<https://school.instructure.com/api/v1/courses?page=2&per_page=10>; rel="next", <https://school.instructure.com/api/v1/courses?page=1>; rel="first"';
    expect(parseNextUrl(header, config.baseUrl)).toBe("https://school.instructure.com/api/v1/courses?page=2&per_page=10");
  });

  it("refuses a next link on another origin", () => {
    expect(parseNextUrl('<https://evil.example/steal>; rel="next"', config.baseUrl)).toBeNull();
  });
});

describe("canvasGetAll", () => {
  it("follows Link headers and sends the token only as a bearer header", async () => {
    const seen: { url: string; authorization: string | null }[] = [];
    const fetchImpl: typeof fetch = async (input, init) => {
      const url = String(input);
      const headers = new Headers(init?.headers);
      seen.push({ url, authorization: headers.get("authorization") });
      if (url.endsWith("/api/v1/courses?per_page=2")) {
        return jsonResponse([{ id: 1 }], '<https://school.instructure.com/api/v1/courses?page=2>; rel="next"');
      }
      return jsonResponse([{ id: 2 }]);
    };

    const rows = await canvasGetAll<{ id: number }>(config, "/api/v1/courses?per_page=2", fetchImpl);
    expect(rows).toEqual([{ id: 1 }, { id: 2 }]);
    expect(seen.map((call) => call.url)).toEqual([
      "https://school.instructure.com/api/v1/courses?per_page=2",
      "https://school.instructure.com/api/v1/courses?page=2",
    ]);
    expect(seen.every((call) => call.authorization === "Bearer secret-token")).toBe(true);
    expect(seen.every((call) => !call.url.includes("secret-token"))).toBe(true);
  });

  it("stops when a next link leaves the Canvas host", async () => {
    const fetchImpl: typeof fetch = async () =>
      jsonResponse([{ id: 1 }], '<https://evil.example/next>; rel="next"');
    const rows = await canvasGetAll<{ id: number }>(config, "/api/v1/courses", fetchImpl);
    expect(rows).toEqual([{ id: 1 }]);
  });

  it("reports status without the token", async () => {
    const fetchImpl: typeof fetch = async () => jsonResponse({ errors: [{ message: "invalid" }] }, undefined, 401);
    await expect(canvasGetAll(config, "/api/v1/courses?access_token=secret-token", fetchImpl)).rejects.toMatchObject({
      name: "CanvasRequestError",
      status: 401,
      message: "Canvas rejected the access token.",
    });
    try {
      await canvasGetAll(config, "/api/v1/courses?access_token=secret-token", fetchImpl);
    } catch (error) {
      expect(error).toBeInstanceOf(CanvasRequestError);
      expect(String(error)).not.toContain("secret-token");
    }
  });
});

describe("readCanvasConfig", () => {
  it("requires both values and a web url", () => {
    expect(readCanvasConfig({})).toBeNull();
    expect(readCanvasConfig({ CANVAS_BASE_URL: "https://school.instructure.com", CANVAS_TOKEN: "  abc  " })).toEqual({
      baseUrl: "https://school.instructure.com",
      token: "abc",
    });
    expect(readCanvasConfig({ CANVAS_BASE_URL: "not a url", CANVAS_TOKEN: "abc" })).toBeNull();
  });
});
