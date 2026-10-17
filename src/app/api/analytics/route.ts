import { buildAnalyticsPayload } from "@/lib/analytics";
import { getAppContext } from "@/lib/context";
import { toResponse, unauthorized } from "@/lib/http";
import { fail, ok } from "@/lib/result";
import { listEvents } from "@/lib/server/events";
import { eventStore } from "@/lib/stores";
import { analyticsQuerySchema, fieldError } from "@/lib/validations";

export async function GET(request: Request) {
  const ctx = await getAppContext();
  if (!ctx) return unauthorized();
  const url = new URL(request.url);
  const parsed = analyticsQuerySchema.safeParse({
    projectId: url.searchParams.get("projectId") ?? undefined,
    days: url.searchParams.get("days") ?? undefined,
  });
  if (!parsed.success) return toResponse(fail(400, fieldError(parsed.error)));
  const events = await listEvents(ctx.role, ctx.organization.id, parsed.data.projectId, eventStore);
  if (!events.ok) return toResponse(events);
  const payload = buildAnalyticsPayload(events.data, parsed.data.days);
  return toResponse(ok(payload), { sampleData: payload.summary.includesSample });
}
