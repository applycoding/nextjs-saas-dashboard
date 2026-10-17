import { describe, expect, it } from "vitest";

import { slugify } from "@/lib/slug";
import { isProtectedPath } from "@/lib/routes";
import { githubLoginConfigured } from "@/lib/demo";
import { buildSampleEvents } from "@/lib/sample-events";

describe("slug and routes", () => {
  it("slugifies names", () => {
    expect(slugify("Docs portal")).toBe("docs-portal");
    expect(slugify("!!!")).toBe("item");
  });

  it("protects workspace routes only", () => {
    expect(isProtectedPath("/overview")).toBe(true);
    expect(isProtectedPath("/projects/abc")).toBe(true);
    expect(isProtectedPath("/login")).toBe(false);
    expect(isProtectedPath("/")).toBe(false);
  });

  it("treats blank GitHub credentials as unconfigured", () => {
    expect(githubLoginConfigured({})).toBe(false);
    expect(githubLoginConfigured({ AUTH_GITHUB_ID: "id", AUTH_GITHUB_SECRET: "secret" })).toBe(true);
  });
});

describe("sample events", () => {
  it("labels every seeded row as sample data inside the chart window", () => {
    const now = new Date("2026-10-17T15:00:00.000Z");
    const drafts = buildSampleEvents(now);
    expect(drafts.length).toBeGreaterThan(0);
    const oldest = Date.UTC(2026, 9, 17) - 13 * 24 * 60 * 60 * 1000;
    for (const draft of drafts) {
      expect(draft.source).toBe("sample");
      expect(draft.count).toBeGreaterThan(0);
      expect(draft.occurredAt.getTime()).toBeGreaterThanOrEqual(oldest);
      expect(draft.occurredAt.getTime()).toBeLessThanOrEqual(Date.UTC(2026, 9, 17));
    }
  });
});
