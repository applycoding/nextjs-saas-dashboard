import { describe, expect, it } from "vitest";

import { RECORDED_SOURCE } from "@/lib/analytics";
import { createEvent, deleteEvent, type EventRecord, type EventStore } from "@/lib/server/events";

function memoryEvents(): EventStore {
  const projects = [{ id: "p1", name: "Checkout" }];
  const rows: EventRecord[] = [];
  return {
    async list() {
      return rows;
    },
    async findProject(_organizationId, projectId) {
      return projects.find((project) => project.id === projectId) ?? null;
    },
    async findById(_organizationId, id) {
      return rows.find((row) => row.id === id) ?? null;
    },
    async create(input) {
      const row: EventRecord = {
        id: `e${rows.length + 1}`,
        name: input.name,
        projectId: input.projectId,
        projectName: "Checkout",
        occurredAt: input.occurredAt,
        count: input.count,
        source: input.source,
        createdAt: input.occurredAt,
      };
      rows.push(row);
      return row;
    },
    async update() {
      throw new Error("unused");
    },
    async delete(_organizationId, id) {
      const index = rows.findIndex((row) => row.id === id);
      if (index >= 0) rows.splice(index, 1);
    },
  };
}

describe("event commands", () => {
  it("records a manual event as recorded, never sample", async () => {
    const store = memoryEvents();
    const denied = await createEvent("viewer", "org", { projectId: "p1", name: "signup_completed", count: 1 }, store);
    expect(denied.ok).toBe(false);
    const created = await createEvent(
      "admin",
      "org",
      { projectId: "p1", name: "signup_completed", count: 3, source: "sample", occurredAt: "2026-10-17T00:00:00.000Z" },
      store,
    );
    expect(created.ok).toBe(true);
    if (created.ok) expect(created.data.source).toBe(RECORDED_SOURCE);
  });

  it("returns not found for another organisation project", async () => {
    const store = memoryEvents();
    const result = await createEvent("owner", "org", { projectId: "missing", name: "signup_completed", count: 1 }, store);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.status).toBe(404);
    const removed = await deleteEvent("admin", "org", "missing", store);
    expect(removed.ok).toBe(false);
  });
});
