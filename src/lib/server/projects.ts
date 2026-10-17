import { slugify } from "@/lib/slug";
import { fieldError, projectInputSchema } from "@/lib/validations";
import { can, type Role } from "@/lib/rbac";
import { fail, ok, type Result } from "@/lib/result";

export type ProjectRecord = {
  id: string;
  name: string;
  slug: string;
  description: string;
  organizationId: string;
  seeded: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type ProjectStore = {
  list(organizationId: string): Promise<ProjectRecord[]>;
  findBySlug(organizationId: string, slug: string): Promise<ProjectRecord | null>;
  findById(organizationId: string, id: string): Promise<ProjectRecord | null>;
  create(input: {
    name: string;
    slug: string;
    description: string;
    organizationId: string;
    seeded: boolean;
  }): Promise<ProjectRecord>;
  update(
    organizationId: string,
    id: string,
    input: { name: string; slug: string; description: string },
  ): Promise<ProjectRecord>;
  delete(organizationId: string, id: string): Promise<void>;
};

export async function listProjects(
  role: Role,
  organizationId: string,
  store: ProjectStore,
): Promise<Result<ProjectRecord[]>> {
  if (!can(role, "project:read")) return fail(403, "You cannot view projects.");
  return ok(await store.list(organizationId));
}

export async function getProject(
  role: Role,
  organizationId: string,
  id: string,
  store: ProjectStore,
): Promise<Result<ProjectRecord>> {
  if (!can(role, "project:read")) return fail(403, "You cannot view projects.");
  const project = await store.findById(organizationId, id);
  if (!project) return fail(404, "Project not found.");
  return ok(project);
}

export async function createProject(
  role: Role,
  organizationId: string,
  body: unknown,
  store: ProjectStore,
): Promise<Result<ProjectRecord>> {
  if (!can(role, "project:write")) return fail(403, "Viewers cannot change projects.");
  const parsed = projectInputSchema.safeParse(body);
  if (!parsed.success) return fail(400, fieldError(parsed.error));
  const slug = slugify(parsed.data.name);
  const existing = await store.findBySlug(organizationId, slug);
  if (existing) return fail(409, "A project with that name already exists.");
  const project = await store.create({
    name: parsed.data.name,
    slug,
    description: parsed.data.description,
    organizationId,
    seeded: false,
  });
  return ok(project);
}

export async function updateProject(
  role: Role,
  organizationId: string,
  id: string,
  body: unknown,
  store: ProjectStore,
): Promise<Result<ProjectRecord>> {
  if (!can(role, "project:write")) return fail(403, "Viewers cannot change projects.");
  const current = await store.findById(organizationId, id);
  if (!current) return fail(404, "Project not found.");
  const parsed = projectInputSchema.safeParse(body);
  if (!parsed.success) return fail(400, fieldError(parsed.error));
  const slug = slugify(parsed.data.name);
  if (slug !== current.slug) {
    const existing = await store.findBySlug(organizationId, slug);
    if (existing && existing.id !== id) return fail(409, "A project with that name already exists.");
  }
  const project = await store.update(organizationId, id, {
    name: parsed.data.name,
    slug,
    description: parsed.data.description,
  });
  return ok(project);
}

export async function deleteProject(
  role: Role,
  organizationId: string,
  id: string,
  store: ProjectStore,
): Promise<Result<{ id: string }>> {
  if (!can(role, "project:write")) return fail(403, "Viewers cannot change projects.");
  const current = await store.findById(organizationId, id);
  if (!current) return fail(404, "Project not found.");
  await store.delete(organizationId, id);
  return ok({ id });
}
