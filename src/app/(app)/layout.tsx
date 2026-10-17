import { redirect } from "next/navigation";

import { AppChrome } from "@/components/app-chrome";
import { getAppContext } from "@/lib/context";

export const dynamic = "force-dynamic";

export default async function WorkspaceLayout({ children }: { children: React.ReactNode }) {
  const ctx = await getAppContext();
  if (!ctx) redirect("/login");

  return (
    <AppChrome
      organizationName={ctx.organization.name}
      role={ctx.role}
      email={ctx.user.email}
      memberships={ctx.memberships}
    >
      {children}
    </AppChrome>
  );
}
