import { describe, expect, it } from "vitest";

import { changeMemberRole, removeMember, type MemberRecord } from "@/lib/server/members";

const members: MemberRecord[] = [
  { userId: "owner", name: "Mira", email: "mira@signalboard.dev", role: "owner" },
  { userId: "admin", name: "Owen", email: "owen@signalboard.dev", role: "admin" },
  { userId: "viewer", name: "Priya", email: "priya@signalboard.dev", role: "viewer" },
];

describe("member commands", () => {
  it("lets an owner change a viewer and blocks an admin", async () => {
    const changed = await changeMemberRole({
      actorRole: "owner",
      actorUserId: "owner",
      ownerCount: 1,
      members,
      body: { userId: "viewer", role: "admin" },
    });
    expect(changed).toEqual({ ok: true, data: { userId: "viewer", role: "admin" } });

    const blocked = await changeMemberRole({
      actorRole: "admin",
      actorUserId: "admin",
      ownerCount: 1,
      members,
      body: { userId: "viewer", role: "admin" },
    });
    expect(blocked.ok).toBe(false);
  });

  it("removes a non-owner member", async () => {
    const result = await removeMember({
      actorRole: "owner",
      actorUserId: "owner",
      targetUserId: "admin",
      members,
      ownerCount: 1,
    });
    expect(result).toEqual({ ok: true, data: { userId: "admin" } });
  });
});
