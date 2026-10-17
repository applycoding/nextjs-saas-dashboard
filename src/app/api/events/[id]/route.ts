import { getAppContext } from "@/lib/context";
import { readJson, toResponse, unauthorized } from "@/lib/http";
import { deleteEvent, updateEvent } from "@/lib/server/events";
import { eventStore } from "@/lib/stores";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  const ctx = await getAppContext();
  if (!ctx) return unauthorized();
  const { id } = await context.params;
  return toResponse(await updateEvent(ctx.role, ctx.organization.id, id, await readJson(request), eventStore));
}

export async function DELETE(_request: Request, context: RouteContext) {
  const ctx = await getAppContext();
  if (!ctx) return unauthorized();
  const { id } = await context.params;
  return toResponse(await deleteEvent(ctx.role, ctx.organization.id, id, eventStore));
}
