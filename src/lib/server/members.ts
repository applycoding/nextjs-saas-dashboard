import { isRole, planRemoveMember, planRoleChange, type Role } from "@/lib/rbac";
import { fail, ok, type Result } from "@/lib/result";
import { fieldError, roleUpdateSchema } from "@/lib/validations";

export type MemberRecord = {
  userId: string;
  name: string | null;
  email: string | null;
  role: Role;
};

export async function changeMemberRole(input: {
  actorRole: Role;
  actorUserId: string;
  ownerCount: number;
  members: MemberRecord[];
  body: unknown;
}): Promise<Result<{ userId: string; role: Role }>> {
  const parsed = roleUpdateSchema.safeParse(input.body);
  if (!parsed.success) return fail(400, fieldError(parsed.error));
  const target = input.members.find((member) => member.userId === parsed.data.userId);
  if (!target) return fail(404, "Member not found.");
  const plan = planRoleChange({
    actorRole: input.actorRole,
    targetRole: target.role,
    nextRole: parsed.data.role,
    ownerCount: input.ownerCount,
  });
  if (!plan.ok) return plan;
  return ok({ userId: target.userId, role: plan.data.role });
}

export async function removeMember(input: {
  actorRole: Role;
  actorUserId: string;
  targetUserId: string;
  members: MemberRecord[];
  ownerCount: number;
}): Promise<Result<{ userId: string }>> {
  const target = input.members.find((member) => member.userId === input.targetUserId);
  if (!target) return fail(404, "Member not found.");
  const plan = planRemoveMember({
    actorRole: input.actorRole,
    actorUserId: input.actorUserId,
    targetUserId: target.userId,
    targetRole: target.role,
    ownerCount: input.ownerCount,
  });
  if (!plan.ok) return plan;
  return ok({ userId: target.userId });
}

export function ownerCount(members: { role: string }[]): number {
  return members.filter((member) => member.role === "owner").length;
}

export function asMembers(
  rows: { userId: string; name: string | null; email: string | null; role: string }[],
): MemberRecord[] {
  return rows.flatMap((row) => {
    if (!isRole(row.role)) return [];
    return [{ userId: row.userId, name: row.name, email: row.email, role: row.role }];
  });
}
