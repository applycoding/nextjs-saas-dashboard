import { RECORDED_SOURCE } from "@/lib/analytics";
import { can, type Role } from "@/lib/rbac";
import { fail, ok, type Result } from "@/lib/result";
import { eventInputSchema, fieldError, parseOccurredAt } from "@/lib/validations";

export type EventRecord = {
  id: string;
  name: string;
  projectId: string;
  projectName: string;
  occurredAt: Date;
  count: number;
  source: string;
  createdAt: Date;
};

export type EventStore = {
  list(organizationId: string, projectId?: string): Promise<EventRecord[]>;
  findProject(organizationId: string, projectId: string): Promise<{ id: string; name: string } | null>;
  findById(organizationId: string, id: string): Promise<EventRecord | null>;
  create(input: {
    name: string;
    projectId: string;
    occurredAt: Date;
    count: number;
    source: string;
  }): Promise<EventRecord>;
  update(
    organizationId: string,
    id: string,
    input: { name: string; occurredAt: Date; count: number },
  ): Promise<EventRecord>;
  delete(organizationId: string, id: string): Promise<void>;
};

function eventBody(body: unknown, occurredAt: unknown) {
  if (!body || typeof body !== "object") return { parsed: null, occurredAt };
  return { parsed: body, occurredAt: occurredAt ?? (body as { occurredAt?: unknown }).occurredAt };
}

export async function listEvents(
  role: Role,
  organizationId: string,
  projectId: string | undefined,
  store: EventStore,
): Promise<Result<EventRecord[]>> {
  if (!can(role, "event:read")) return fail(403, "You cannot view events.");
  if (projectId) {
    const project = await store.findProject(organizationId, projectId);
    if (!project) return fail(404, "Project not found.");
  }
  return ok(await store.list(organizationId, projectId));
}

export async function createEvent(
  role: Role,
  organizationId: string,
  body: unknown,
  store: EventStore,
  now = new Date(),
): Promise<Result<EventRecord>> {
  if (!can(role, "event:write")) return fail(403, "Viewers cannot record events.");
  const parsed = eventInputSchema.safeParse(body);
  if (!parsed.success) return fail(400, fieldError(parsed.error));
  const project = await store.findProject(organizationId, parsed.data.projectId);
  if (!project) return fail(404, "Project not found.");
  const occurred = parseOccurredAt(eventBody(body, undefined).occurredAt, now);
  if (!occurred.ok) return occurred;
  const event = await store.create({
    name: parsed.data.name,
    projectId: project.id,
    occurredAt: occurred.data,
    count: parsed.data.count,
    source: RECORDED_SOURCE,
  });
  return ok(event);
}

export async function updateEvent(
  role: Role,
  organizationId: string,
  id: string,
  body: unknown,
  store: EventStore,
  now = new Date(),
): Promise<Result<EventRecord>> {
  if (!can(role, "event:write")) return fail(403, "Viewers cannot record events.");
  const current = await store.findById(organizationId, id);
  if (!current) return fail(404, "Event not found.");
  const parsed = eventInputSchema.safeParse({
    ...(body && typeof body === "object" ? body : {}),
    projectId: current.projectId,
  });
  if (!parsed.success) return fail(400, fieldError(parsed.error));
  const occurred = parseOccurredAt(eventBody(body, undefined).occurredAt, current.occurredAt ?? now);
  if (!occurred.ok) return occurred;
  const event = await store.update(organizationId, id, {
    name: parsed.data.name,
    occurredAt: occurred.data,
    count: parsed.data.count,
  });
  return ok(event);
}

export async function deleteEvent(
  role: Role,
  organizationId: string,
  id: string,
  store: EventStore,
): Promise<Result<{ id: string }>> {
  if (!can(role, "event:write")) return fail(403, "Viewers cannot record events.");
  const current = await store.findById(organizationId, id);
  if (!current) return fail(404, "Event not found.");
  await store.delete(organizationId, id);
  return ok({ id });
}
