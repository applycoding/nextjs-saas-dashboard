import { describe, expect, it } from "vitest";

import { can, isRole, planRemoveMember, planRoleChange, roleLabel } from "@/lib/rbac";

describe("rbac", () => {
  it("recognises the three roles", () => {
    expect(isRole("owner")).toBe(true);
    expect(isRole("admin")).toBe(true);
    expect(isRole("viewer")).toBe(true);
    expect(isRole("guest")).toBe(false);
  });

  it("lets viewers read and blocks writes", () => {
    expect(can("viewer", "project:read")).toBe(true);
    expect(can("viewer", "event:read")).toBe(true);
    expect(can("viewer", "project:write")).toBe(false);
    expect(can("viewer", "event:write")).toBe(false);
    expect(can("viewer", "member:update")).toBe(false);
  });

  it("lets admins change projects and events, not membership", () => {
    expect(can("admin", "project:write")).toBe(true);
    expect(can("admin", "event:write")).toBe(true);
    expect(can("admin", "member:update")).toBe(false);
    expect(can("admin", "member:remove")).toBe(false);
  });

  it("lets owners manage members", () => {
    expect(can("owner", "member:update")).toBe(true);
    expect(can("owner", "member:remove")).toBe(true);
    expect(can("owner", "org:update")).toBe(true);
  });

  it("labels every role", () => {
    expect(roleLabel("owner")).toBe("Owner");
    expect(roleLabel("admin")).toBe("Admin");
    expect(roleLabel("viewer")).toBe("Viewer");
  });

  it("refuses to demote the last owner", () => {
    const result = planRoleChange({
      actorRole: "owner",
      targetRole: "owner",
      nextRole: "admin",
      ownerCount: 1,
    });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.status).toBe(409);
  });

  it("allows an owner to promote a viewer", () => {
    const result = planRoleChange({
      actorRole: "owner",
      targetRole: "viewer",
      nextRole: "admin",
      ownerCount: 1,
    });
    expect(result).toEqual({ ok: true, data: { role: "admin" } });
  });

  it("blocks admins from changing roles", () => {
    const result = planRoleChange({
      actorRole: "admin",
      targetRole: "viewer",
      nextRole: "admin",
      ownerCount: 1,
    });
    expect(result.ok).toBe(false);
  });

  it("blocks removing yourself or the last owner", () => {
    expect(
      planRemoveMember({
        actorRole: "owner",
        actorUserId: "u1",
        targetUserId: "u1",
        targetRole: "owner",
        ownerCount: 2,
      }).ok,
    ).toBe(false);
    expect(
      planRemoveMember({
        actorRole: "owner",
        actorUserId: "u1",
        targetUserId: "u2",
        targetRole: "owner",
        ownerCount: 1,
      }).ok,
    ).toBe(false);
    expect(
      planRemoveMember({
        actorRole: "viewer",
        actorUserId: "u1",
        targetUserId: "u2",
        targetRole: "admin",
        ownerCount: 1,
      }).ok,
    ).toBe(false);
  });
});
