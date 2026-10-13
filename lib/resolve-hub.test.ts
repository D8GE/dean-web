import { describe, expect, it } from "vitest";
import { clearHubCache, resolveHub } from "./resolve-hub";

describe("resolveHub fallback", () => {
  it("uses demo data when the env vars are missing", async () => {
    const hub = await resolveHub({ env: {} });
    expect(hub.source).toBe("demo");
    expect(hub.courses.map((course) => course.code)).toContain("BIBL 104");
    expect(hub.semester.today).toBe("Monday, October 12");
    expect(hub.canvasUrl).toBe("https://canvas.instructure.com");
    expect(hub.sourceNote).toMatch(/CANVAS_BASE_URL/);
  });

  it("uses demo data when Canvas rejects the token, and does not echo the token", async () => {
    clearHubCache();
    const token = "super-secret-token";
    const fetchImpl: typeof fetch = async () => new Response(JSON.stringify({ message: "bad" }), { status: 401 });
    const hub = await resolveHub({
      env: { CANVAS_BASE_URL: "https://school.instructure.com", CANVAS_TOKEN: token },
      fetchImpl,
    });
    expect(hub.source).toBe("demo");
    expect(hub.courseByCode["MATH 121"]?.grade).toBe(81);
    expect(hub.sourceNote).toBe("Canvas rejected the access token.");
    expect(hub.canvasUrl).toBe("https://school.instructure.com");
    expect(hub.sourceNote).not.toContain(token);
    expect(JSON.stringify(hub)).not.toContain(token);
  });

  it("uses demo data when Canvas cannot be reached, without the raw fetch error", async () => {
    clearHubCache();
    const token = "super-secret-token";
    const fetchImpl: typeof fetch = async () => {
      throw new TypeError("fetch failed");
    };
    const hub = await resolveHub({
      env: { CANVAS_BASE_URL: "https://invalid.canvas.example", CANVAS_TOKEN: token },
      fetchImpl,
    });
    expect(hub.source).toBe("demo");
    expect(hub.courses.map((course) => course.code)).toContain("BIBL 104");
    expect(hub.sourceNote).toBe("Couldn't reach Canvas. Showing the demo school.");
    expect(JSON.stringify(hub)).not.toContain(token);
    expect(hub.sourceNote).not.toContain("fetch failed");
  });
});
