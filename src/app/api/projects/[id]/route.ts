import { getAppContext } from "@/lib/context";
import { readJson, toResponse, unauthorized } from "@/lib/http";
import { deleteProject, getProject, updateProject } from "@/lib/server/projects";
import { projectStore } from "@/lib/stores";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const ctx = await getAppContext();
  if (!ctx) return unauthorized();
  const { id } = await context.params;
  return toResponse(await getProject(ctx.role, ctx.organization.id, id, projectStore));
}

export async function PATCH(request: Request, context: RouteContext) {
  const ctx = await getAppContext();
  if (!ctx) return unauthorized();
  const { id } = await context.params;
  return toResponse(
    await updateProject(ctx.role, ctx.organization.id, id, await readJson(request), projectStore),
  );
}

export async function DELETE(_request: Request, context: RouteContext) {
  const ctx = await getAppContext();
  if (!ctx) return unauthorized();
  const { id } = await context.params;
  return toResponse(await deleteProject(ctx.role, ctx.organization.id, id, projectStore));
}
