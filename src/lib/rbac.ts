export const ROLES = ["owner", "admin", "viewer"] as const;

export type Role = (typeof ROLES)[number];

export const ACTIONS = [
  "org:read",
  "org:update",
  "member:read",
  "member:update",
  "member:remove",
  "project:read",
  "project:write",
  "event:read",
  "event:write",
] as const;

export type Action = (typeof ACTIONS)[number];

const PERMISSIONS: Record<Role, readonly Action[]> = {
  owner: ACTIONS,
  admin: ["org:read", "member:read", "project:read", "project:write", "event:read", "event:write"],
  viewer: ["org:read", "member:read", "project:read", "event:read"],
};

export function isRole(value: string): value is Role {
  return ROLES.some((role) => role === value);
}

export function can(role: Role, action: Action): boolean {
  return PERMISSIONS[role].includes(action);
}

export function roleLabel(role: Role): string {
  switch (role) {
    case "owner":
      return "Owner";
    case "admin":
      return "Admin";
    case "viewer":
      return "Viewer";
    default: {
      const exhaustive: never = role;
      return exhaustive;
    }
  }
}

export function planRoleChange(input: {
  actorRole: Role;
  targetRole: Role;
  nextRole: Role;
  ownerCount: number;
}): ResultRole {
  if (!can(input.actorRole, "member:update")) {
    return { ok: false, error: "Only an owner can change roles.", status: 403 };
  }
  if (input.targetRole === "owner" && input.nextRole !== "owner" && input.ownerCount <= 1) {
    return { ok: false, error: "The organisation needs at least one owner.", status: 409 };
  }
  return { ok: true, data: { role: input.nextRole } };
}

export function planRemoveMember(input: {
  actorRole: Role;
  actorUserId: string;
  targetUserId: string;
  targetRole: Role;
  ownerCount: number;
}): { ok: true } | { ok: false; error: string; status: number } {
  if (!can(input.actorRole, "member:remove")) {
    return { ok: false, error: "Only an owner can remove a member.", status: 403 };
  }
  if (input.actorUserId === input.targetUserId) {
    return { ok: false, error: "Leave the organisation from another owner account.", status: 409 };
  }
  if (input.targetRole === "owner" && input.ownerCount <= 1) {
    return { ok: false, error: "The organisation needs at least one owner.", status: 409 };
  }
  return { ok: true };
}

type ResultRole = { ok: true; data: { role: Role } } | { ok: false; error: string; status: number };
