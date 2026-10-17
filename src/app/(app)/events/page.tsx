import { redirect } from "next/navigation";

import { EventForm } from "@/components/event-form";
import { deleteEventAction } from "@/lib/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { SAMPLE_SOURCE } from "@/lib/analytics";
import { getAppContext } from "@/lib/context";
import { formatCount, formatTimestamp } from "@/lib/format";
import { can } from "@/lib/rbac";
import { eventStore, projectStore } from "@/lib/stores";

export const dynamic = "force-dynamic";

export default async function EventsPage({
  searchParams,
}: {
  searchParams: Promise<{ notice?: string; error?: string; projectId?: string }>;
}) {
  const ctx = await getAppContext();
  if (!ctx) redirect("/login");
  const params = await searchParams;
  const projects = await projectStore.list(ctx.organization.id);
  const events = await eventStore.list(ctx.organization.id, params.projectId);
  const canWrite = can(ctx.role, "event:write");

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-2xl font-medium">Events</h1>
        <p className="text-sm text-muted-foreground">
          Sample rows come from the seed. New rows are marked as recorded in this demo.
        </p>
      </div>
      {params.notice ? <p role="status" className="text-sm">{params.notice}</p> : null}
      {params.error ? <p role="alert" className="text-sm text-destructive">{params.error}</p> : null}
      {projects.length > 1 ? (
        <form className="flex flex-wrap items-end gap-2" method="get">
          <label className="grid gap-1 text-sm" htmlFor="filter-project">
            Filter by project
            <select
              id="filter-project"
              name="projectId"
              defaultValue={params.projectId ?? ""}
              className="h-8 rounded-lg border border-input bg-transparent px-2"
            >
              <option value="">All projects</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
          </label>
          <Button type="submit" variant="outline">
            Apply
          </Button>
        </form>
      ) : null}
      {events.length === 0 ? (
        <p className="rounded-lg border border-dashed px-3 py-6 text-sm text-muted-foreground">No events match this view.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Project</TableHead>
              <TableHead>Count</TableHead>
              <TableHead>When (UTC)</TableHead>
              <TableHead>Source</TableHead>
              {canWrite ? <TableHead>Actions</TableHead> : null}
            </TableRow>
          </TableHeader>
          <TableBody>
            {events.map((event) => (
              <TableRow key={event.id}>
                <TableCell>{event.name}</TableCell>
                <TableCell>{event.projectName}</TableCell>
                <TableCell>{formatCount(event.count)}</TableCell>
                <TableCell>{formatTimestamp(event.occurredAt)}</TableCell>
                <TableCell>
                  {event.source === SAMPLE_SOURCE ? (
                    <Badge variant="outline">Sample data</Badge>
                  ) : (
                    <Badge variant="secondary">Recorded in demo</Badge>
                  )}
                </TableCell>
                {canWrite ? (
                  <TableCell>
                    <form action={deleteEventAction}>
                      <input type="hidden" name="id" value={event.id} />
                      <Button type="submit" variant="ghost" size="sm">
                        Delete
                      </Button>
                    </form>
                  </TableCell>
                ) : null}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
      {canWrite ? (
        <Card>
          <CardHeader>
            <CardTitle>Record an event</CardTitle>
            <CardDescription>This row is stored as recorded in this demo, not as sample data.</CardDescription>
          </CardHeader>
          <CardContent>
            {projects.length === 0 ? (
              <p className="text-sm text-muted-foreground">Create a project before recording events.</p>
            ) : (
              <EventForm projects={projects.map((project) => ({ id: project.id, name: project.name }))} />
            )}
          </CardContent>
        </Card>
      ) : (
        <p className="text-sm text-muted-foreground">Viewers can read events. Owners and admins can record them.</p>
      )}
    </div>
  );
}
