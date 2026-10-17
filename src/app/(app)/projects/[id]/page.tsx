import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { DeleteProjectDialog } from "@/components/delete-project-dialog";
import { ProjectForm } from "@/components/project-form";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SAMPLE_SOURCE } from "@/lib/analytics";
import { getAppContext } from "@/lib/context";
import { formatCount, formatTimestamp } from "@/lib/format";
import { can } from "@/lib/rbac";
import { eventStore, projectStore } from "@/lib/stores";

export const dynamic = "force-dynamic";

export default async function ProjectDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const ctx = await getAppContext();
  if (!ctx) redirect("/login");
  const { id } = await params;
  const query = await searchParams;
  const project = await projectStore.findById(ctx.organization.id, id);
  if (!project) notFound();
  const events = await eventStore.list(ctx.organization.id, project.id);
  const canWrite = can(ctx.role, "project:write");

  return (
    <div className="grid gap-6">
      <div>
        <Link href="/projects" className="text-sm text-muted-foreground">
          Projects
        </Link>
        <h1 className="mt-1 text-2xl font-medium">{project.name}</h1>
        <p className="text-sm text-muted-foreground">{project.description || "No description."}</p>
        <div className="mt-2">
          {project.seeded ? <Badge variant="outline">Seeded demo project</Badge> : null}
        </div>
      </div>
      {query.error ? <p role="alert" className="text-sm text-destructive">{query.error}</p> : null}
      <Card>
        <CardHeader>
          <CardTitle>Recent events</CardTitle>
          <CardDescription>{formatCount(events.length)} rows on this project.</CardDescription>
        </CardHeader>
        <CardContent>
          {events.length === 0 ? (
            <p className="text-sm text-muted-foreground">No events yet.</p>
          ) : (
            <ul className="grid gap-2 text-sm">
              {events.slice(0, 8).map((event) => (
                <li key={event.id} className="flex flex-wrap items-center justify-between gap-2 border-b pb-2">
                  <span>{event.name}</span>
                  <span className="text-muted-foreground">
                    {formatCount(event.count)} · {formatTimestamp(event.occurredAt)} ·{" "}
                    {event.source === SAMPLE_SOURCE ? "Sample data" : "Recorded in demo"}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
      {canWrite ? (
        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Edit project</CardTitle>
            </CardHeader>
            <CardContent>
              <ProjectForm mode="edit" project={project} />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Delete</CardTitle>
              <CardDescription>Removes the project and its events from this demo.</CardDescription>
            </CardHeader>
            <CardContent>
              <DeleteProjectDialog id={project.id} name={project.name} />
            </CardContent>
          </Card>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">Your role can read this project.</p>
      )}
    </div>
  );
}
