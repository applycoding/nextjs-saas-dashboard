import { cookies } from "next/headers";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { isRole, type Role } from "@/lib/rbac";
import { slugify } from "@/lib/slug";

export const ACTIVE_ORG_COOKIE = "signalboard-org";

export type MembershipSummary = {
  organizationId: string;
  organizationName: string;
  organizationSlug: string;
  role: Role;
};

export type AppContext = {
  user: {
    id: string;
    name: string | null;
    email: string | null;
    image: string | null;
  };
  organization: {
    id: string;
    name: string;
    slug: string;
  };
  role: Role;
  memberships: MembershipSummary[];
};

async function ensurePersonalWorkspace(user: { id: string; name: string | null; email: string | null }) {
  const existing = await prisma.membership.findFirst({ where: { userId: user.id } });
  if (existing) return;
  const base = slugify(user.name || user.email?.split("@")[0] || "workspace");
  let slug = `${base}-workspace`;
  const taken = await prisma.organization.findUnique({ where: { slug } });
  if (taken) slug = `${base}-${user.id.slice(0, 6)}`;
  await prisma.organization.create({
    data: {
      name: user.name ? `${user.name} workspace` : "Personal workspace",
      slug,
      memberships: { create: { userId: user.id, role: "owner" } },
    },
  });
}

export async function getAppContext(): Promise<AppContext | null> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return null;

  const user = {
    id: userId,
    name: session.user.name ?? null,
    email: session.user.email ?? null,
    image: session.user.image ?? null,
  };

  await ensurePersonalWorkspace(user);

  const rows = await prisma.membership.findMany({
    where: { userId },
    include: { organization: true },
    orderBy: { createdAt: "asc" },
  });

  const memberships = rows.flatMap((row) => {
    if (!isRole(row.role)) return [];
    return [
      {
        organizationId: row.organizationId,
        organizationName: row.organization.name,
        organizationSlug: row.organization.slug,
        role: row.role,
      },
    ];
  });

  if (memberships.length === 0) return null;

  const cookieStore = await cookies();
  const requested = cookieStore.get(ACTIVE_ORG_COOKIE)?.value;
  const current = memberships.find((membership) => membership.organizationId === requested) ?? memberships[0];
  if (!current) return null;

  return {
    user,
    organization: {
      id: current.organizationId,
      name: current.organizationName,
      slug: current.organizationSlug,
    },
    role: current.role,
    memberships,
  };
}
