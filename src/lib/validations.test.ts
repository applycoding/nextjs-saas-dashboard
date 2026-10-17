import { describe, expect, it } from "vitest";

import { analyticsQuerySchema, credentialsSchema, eventInputSchema, parseOccurredAt, projectInputSchema, roleUpdateSchema } from "@/lib/validations";

describe("validations", () => {
  it("accepts a demo login", () => {
    const parsed = credentialsSchema.safeParse({ email: "mira@signalboard.dev", password: "demo-password" });
    expect(parsed.success).toBe(true);
  });

  it("rejects a short project name", () => {
    const parsed = projectInputSchema.safeParse({ name: "A" });
    expect(parsed.success).toBe(false);
  });

  it("requires a lowercase event name", () => {
    expect(eventInputSchema.safeParse({ projectId: "p1", name: "Signup", count: "1" }).success).toBe(false);
    const parsed = eventInputSchema.safeParse({ projectId: "p1", name: "signup_completed", count: "2" });
    expect(parsed.success).toBe(true);
    if (parsed.success) expect(parsed.data.count).toBe(2);
  });

  it("parses role updates and analytics queries", () => {
    expect(roleUpdateSchema.safeParse({ userId: "u1", role: "admin" }).success).toBe(true);
    expect(roleUpdateSchema.safeParse({ userId: "u1", role: "guest" }).success).toBe(false);
    const query = analyticsQuerySchema.safeParse({ projectId: "", days: "14" });
    expect(query.success).toBe(true);
    if (query.success) {
      expect(query.data.projectId).toBeUndefined();
      expect(query.data.days).toBe(14);
    }
  });

  it("rejects an impossible timestamp and defaults an empty one", () => {
    expect(parseOccurredAt("not-a-date").ok).toBe(false);
    const fallback = new Date("2026-01-01T00:00:00.000Z");
    const parsed = parseOccurredAt("", fallback);
    expect(parsed.ok).toBe(true);
    if (parsed.ok) expect(parsed.data).toEqual(fallback);
  });
});
