import Link from "next/link";
import { redirect } from "next/navigation";

import { ProjectForm } from "@/components/project-form";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getAppContext } from "@/lib/context";
import { can } from "@/lib/rbac";
import { projectStore } from "@/lib/stores";

export const dynamic = "force-dynamic";

export default async function ProjectsPage({
  searchParams,
}: {
  searchParams: Promise<{ notice?: string; error?: string }>;
}) {
  const ctx = await getAppContext();
  if (!ctx) redirect("/login");
  const params = await searchParams;
  const projects = await projectStore.list(ctx.organization.id);
  const canWrite = can(ctx.role, "project:write");

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-2xl font-medium">Projects</h1>
        <p className="text-sm text-muted-foreground">{ctx.organization.name}</p>
      </div>
      {params.notice ? <p role="status" className="text-sm">{params.notice}</p> : null}
      {params.error ? <p role="alert" className="text-sm text-destructive">{params.error}</p> : null}
      {projects.length === 0 ? (
        <p className="rounded-lg border border-dashed px-3 py-6 text-sm text-muted-foreground">
          No projects in this organisation yet.
        </p>
      ) : (
        <ul className="grid gap-3">
          {projects.map((project) => (
            <li key={project.id}>
              <Card>
                <CardHeader>
                  <CardTitle>
                    <Link href={`/projects/${project.id}`} className="hover:underline">
                      {project.name}
                    </Link>
                  </CardTitle>
                  <CardDescription>{project.description || "No description."}</CardDescription>
                </CardHeader>
                <CardContent className="flex items-center gap-2">
                  {project.seeded ? <Badge variant="outline">Seeded demo project</Badge> : <Badge variant="secondary">Created in demo</Badge>}
                  <span className="text-xs text-muted-foreground">{project.slug}</span>
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>
      )}
      {canWrite ? (
        <Card>
          <CardHeader>
            <CardTitle>New project</CardTitle>
            <CardDescription>Saved only in this demo database.</CardDescription>
          </CardHeader>
          <CardContent>
            <ProjectForm mode="create" />
          </CardContent>
        </Card>
      ) : (
        <p className="text-sm text-muted-foreground">Viewers can read projects. Owners and admins can change them.</p>
      )}
    </div>
  );
}
