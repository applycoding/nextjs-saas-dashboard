import { describe, expect, it } from "vitest";

import { createProject, deleteProject, updateProject, type ProjectRecord, type ProjectStore } from "@/lib/server/projects";

function memoryProjects(): ProjectStore & { rows: ProjectRecord[] } {
  const rows: ProjectRecord[] = [];
  return {
    rows,
    async list(organizationId) {
      return rows.filter((row) => row.organizationId === organizationId);
    },
    async findBySlug(organizationId, slug) {
      return rows.find((row) => row.organizationId === organizationId && row.slug === slug) ?? null;
    },
    async findById(organizationId, id) {
      return rows.find((row) => row.organizationId === organizationId && row.id === id) ?? null;
    },
    async create(input) {
      const row: ProjectRecord = {
        ...input,
        id: `p${rows.length + 1}`,
        createdAt: new Date("2026-10-17T00:00:00.000Z"),
        updatedAt: new Date("2026-10-17T00:00:00.000Z"),
      };
      rows.push(row);
      return row;
    },
    async update(organizationId, id, input) {
      const row = rows.find((item) => item.organizationId === organizationId && item.id === id);
      if (!row) throw new Error("missing");
      Object.assign(row, input);
      return row;
    },
    async delete(organizationId, id) {
      const index = rows.findIndex((item) => item.organizationId === organizationId && item.id === id);
      if (index >= 0) rows.splice(index, 1);
    },
  };
}

describe("project commands", () => {
  it("blocks viewers and creates a project for an admin", async () => {
    const store = memoryProjects();
    const denied = await createProject("viewer", "org", { name: "Checkout" }, store);
    expect(denied.ok).toBe(false);
    const created = await createProject("admin", "org", { name: "Checkout", description: "Payments" }, store);
    expect(created.ok).toBe(true);
    if (created.ok) {
      expect(created.data.slug).toBe("checkout");
      expect(created.data.seeded).toBe(false);
    }
    const conflict = await createProject("owner", "org", { name: "Checkout" }, store);
    expect(conflict.ok).toBe(false);
    if (!conflict.ok) expect(conflict.status).toBe(409);
  });

  it("updates and deletes inside the organisation", async () => {
    const store = memoryProjects();
    const created = await createProject("owner", "org", { name: "Docs portal" }, store);
    if (!created.ok) throw new Error("expected create");
    const updated = await updateProject("admin", "org", created.data.id, { name: "Docs", description: "Reads" }, store);
    expect(updated.ok).toBe(true);
    const missing = await deleteProject("admin", "other", created.data.id, store);
    expect(missing.ok).toBe(false);
    const removed = await deleteProject("owner", "org", created.data.id, store);
    expect(removed.ok).toBe(true);
    expect(store.rows).toHaveLength(0);
  });
});
