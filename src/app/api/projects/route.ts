import { getAppContext } from "@/lib/context";
import { readJson, toResponse, unauthorized } from "@/lib/http";
import { createProject, listProjects } from "@/lib/server/projects";
import { projectStore } from "@/lib/stores";

export async function GET() {
  const ctx = await getAppContext();
  if (!ctx) return unauthorized();
  const result = await listProjects(ctx.role, ctx.organization.id, projectStore);
  return toResponse(result);
}

export async function POST(request: Request) {
  const ctx = await getAppContext();
  if (!ctx) return unauthorized();
  const result = await createProject(ctx.role, ctx.organization.id, await readJson(request), projectStore);
  return toResponse(result);
}
