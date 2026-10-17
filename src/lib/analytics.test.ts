import { describe, expect, it } from "vitest";

import { buildAnalyticsPayload, dailySeries, summarizeEvents } from "@/lib/analytics";

const now = new Date("2026-10-17T12:00:00.000Z");

describe("analytics", () => {
  it("sums sample and recorded counts without inventing rates", () => {
    const summary = summarizeEvents([
      { name: "signup_completed", occurredAt: "2026-10-17T01:00:00.000Z", count: 4, source: "sample", projectId: "p1" },
      { name: "signup_completed", occurredAt: "2026-10-16T01:00:00.000Z", count: 2, source: "recorded", projectId: "p1" },
      { name: "docs_search", occurredAt: "2026-10-16T01:00:00.000Z", count: 1, source: "sample", projectId: "p2" },
    ]);
    expect(summary).toMatchObject({
      total: 7,
      sample: 5,
      recorded: 2,
      projectCount: 2,
      topEventName: "signup_completed",
      includesSample: true,
    });
  });

  it("fills missing days with zero", () => {
    const series = dailySeries(
      [{ name: "signup_completed", occurredAt: "2026-10-17T01:00:00.000Z", count: 3, source: "sample", projectId: "p1" }],
      3,
      now,
    );
    expect(series).toHaveLength(3);
    expect(series[2]).toEqual({ date: "2026-10-17", sample: 3, recorded: 0, total: 3 });
    expect(series[0]?.total).toBe(0);
  });

  it("builds a payload that flags sample data", () => {
    const payload = buildAnalyticsPayload(
      [{ name: "status_viewed", occurredAt: now, count: 1, source: "recorded", projectId: "p1" }],
      2,
      now,
    );
    expect(payload.summary.includesSample).toBe(false);
    expect(payload.byName[0]?.name).toBe("status_viewed");
    expect(payload.days).toBe(2);
  });
});
