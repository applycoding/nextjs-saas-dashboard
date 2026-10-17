import { getAppContext } from "@/lib/context";
import { readJson, toResponse, unauthorized } from "@/lib/http";
import { ok } from "@/lib/result";
import { asMembers, changeMemberRole, ownerCount, removeMember } from "@/lib/server/members";
import { deleteMembership, listMembers, saveMemberRole } from "@/lib/stores";

export async function GET() {
  const ctx = await getAppContext();
  if (!ctx) return unauthorized();
  const members = asMembers(await listMembers(ctx.organization.id));
  return toResponse(
    ok({
      organization: ctx.organization,
      role: ctx.role,
      memberships: ctx.memberships,
      members,
    }),
  );
}

export async function PATCH(request: Request) {
  const ctx = await getAppContext();
  if (!ctx) return unauthorized();
  const rows = asMembers(await listMembers(ctx.organization.id));
  const result = await changeMemberRole({
    actorRole: ctx.role,
    actorUserId: ctx.user.id,
    ownerCount: ownerCount(rows),
    members: rows,
    body: await readJson(request),
  });
  if (!result.ok) return toResponse(result);
  await saveMemberRole(ctx.organization.id, result.data.userId, result.data.role);
  return toResponse(ok(result.data));
}

export async function DELETE(request: Request) {
  const ctx = await getAppContext();
  if (!ctx) return unauthorized();
  const url = new URL(request.url);
  const rows = asMembers(await listMembers(ctx.organization.id));
  const result = await removeMember({
    actorRole: ctx.role,
    actorUserId: ctx.user.id,
    targetUserId: url.searchParams.get("userId") ?? "",
    members: rows,
    ownerCount: ownerCount(rows),
  });
  if (!result.ok) return toResponse(result);
  await deleteMembership(ctx.organization.id, result.data.userId);
  return toResponse(ok(result.data));
}
