import { getAppContext } from "@/lib/context";
import { readJson, toResponse, unauthorized } from "@/lib/http";
import { createEvent, listEvents } from "@/lib/server/events";
import { eventStore } from "@/lib/stores";
import { analyticsQuerySchema, fieldError } from "@/lib/validations";
import { fail } from "@/lib/result";

export async function GET(request: Request) {
  const ctx = await getAppContext();
  if (!ctx) return unauthorized();
  const url = new URL(request.url);
  const parsed = analyticsQuerySchema.safeParse({
    projectId: url.searchParams.get("projectId") ?? undefined,
    days: url.searchParams.get("days") ?? undefined,
  });
  if (!parsed.success) return toResponse(fail(400, fieldError(parsed.error)));
  return toResponse(await listEvents(ctx.role, ctx.organization.id, parsed.data.projectId, eventStore));
}

export async function POST(request: Request) {
  const ctx = await getAppContext();
  if (!ctx) return unauthorized();
  return toResponse(await createEvent(ctx.role, ctx.organization.id, await readJson(request), eventStore));
}
