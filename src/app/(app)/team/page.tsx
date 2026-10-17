import { redirect } from "next/navigation";

import { removeMemberAction, updateRoleAction } from "@/lib/actions";
import { RoleBadge } from "@/components/role-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getAppContext } from "@/lib/context";
import { can, ROLES, roleLabel } from "@/lib/rbac";
import { asMembers, ownerCount } from "@/lib/server/members";
import { listMembers } from "@/lib/stores";

export const dynamic = "force-dynamic";

export default async function TeamPage({
  searchParams,
}: {
  searchParams: Promise<{ notice?: string; error?: string }>;
}) {
  const ctx = await getAppContext();
  if (!ctx) redirect("/login");
  const params = await searchParams;
  const members = asMembers(await listMembers(ctx.organization.id));
  const owners = ownerCount(members);
  const canManage = can(ctx.role, "member:update");

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-2xl font-medium">Team</h1>
        <p className="text-sm text-muted-foreground">
          {ctx.organization.name}. Owners manage roles. Admins change projects and events. Viewers read.
        </p>
      </div>
      {params.notice ? <p role="status" className="text-sm">{params.notice}</p> : null}
      {params.error ? <p role="alert" className="text-sm text-destructive">{params.error}</p> : null}
      {members.length === 0 ? (
        <p className="text-sm text-muted-foreground">No members in this organisation.</p>
      ) : (
        <ul className="grid gap-3">
          {members.map((member) => (
            <li key={member.userId}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex flex-wrap items-center gap-2">
                    {member.name ?? member.email ?? "Member"}
                    <RoleBadge role={member.role} />
                  </CardTitle>
                  <CardDescription>{member.email}</CardDescription>
                </CardHeader>
                {canManage ? (
                  <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-end">
                    <form action={updateRoleAction} className="flex flex-wrap items-end gap-2">
                      <input type="hidden" name="userId" value={member.userId} />
                      <label className="grid gap-1 text-sm" htmlFor={`role-${member.userId}`}>
                        Role
                        <select
                          id={`role-${member.userId}`}
                          name="role"
                          defaultValue={member.role}
                          className="h-8 rounded-lg border border-input bg-transparent px-2"
                        >
                          {ROLES.map((role) => (
                            <option key={role} value={role}>
                              {roleLabel(role)}
                            </option>
                          ))}
                        </select>
                      </label>
                      <Button type="submit" variant="secondary" size="sm">
                        Save role
                      </Button>
                    </form>
                    {member.userId !== ctx.user.id ? (
                      <form action={removeMemberAction}>
                        <input type="hidden" name="userId" value={member.userId} />
                        <Button type="submit" variant="ghost" size="sm">
                          Remove
                        </Button>
                      </form>
                    ) : null}
                  </CardContent>
                ) : null}
              </Card>
            </li>
          ))}
        </ul>
      )}
      <p className="text-sm text-muted-foreground">Owners in this organisation: {owners}.</p>
    </div>
  );
}
