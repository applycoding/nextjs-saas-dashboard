import { Badge } from "@/components/ui/badge";
import { roleLabel, type Role } from "@/lib/rbac";

export function RoleBadge({ role }: { role: Role }) {
  return <Badge variant={role === "viewer" ? "outline" : "secondary"}>{roleLabel(role)}</Badge>;
}
