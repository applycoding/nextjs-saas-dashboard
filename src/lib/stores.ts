import { prisma } from "@/lib/db";
import type { EventStore } from "@/lib/server/events";
import type { ProjectStore } from "@/lib/server/projects";

export const projectStore: ProjectStore = {
  list(organizationId) {
    return prisma.project.findMany({
      where: { organizationId },
      orderBy: { createdAt: "desc" },
    });
  },
  findBySlug(organizationId, slug) {
    return prisma.project.findUnique({
      where: { organizationId_slug: { organizationId, slug } },
    });
  },
  findById(organizationId, id) {
    return prisma.project.findFirst({ where: { organizationId, id } });
  },
  create(input) {
    return prisma.project.create({ data: input });
  },
  async update(organizationId, id, input) {
    const current = await prisma.project.findFirst({ where: { organizationId, id } });
    if (!current) throw new Error("Project not found.");
    return prisma.project.update({ where: { id }, data: input });
  },
  async delete(organizationId, id) {
    const current = await prisma.project.findFirst({ where: { organizationId, id } });
    if (!current) return;
    await prisma.project.delete({ where: { id } });
  },
};

export const eventStore: EventStore = {
  async list(organizationId, projectId) {
    const rows = await prisma.event.findMany({
      where: {
        project: { organizationId },
        ...(projectId ? { projectId } : {}),
      },
      include: { project: { select: { name: true } } },
      orderBy: { occurredAt: "desc" },
    });
    return rows.map((row) => ({
      id: row.id,
      name: row.name,
      projectId: row.projectId,
      projectName: row.project.name,
      occurredAt: row.occurredAt,
      count: row.count,
      source: row.source,
      createdAt: row.createdAt,
    }));
  },
  findProject(organizationId, projectId) {
    return prisma.project.findFirst({
      where: { organizationId, id: projectId },
      select: { id: true, name: true },
    });
  },
  async findById(organizationId, id) {
    const row = await prisma.event.findFirst({
      where: { id, project: { organizationId } },
      include: { project: { select: { name: true } } },
    });
    if (!row) return null;
    return {
      id: row.id,
      name: row.name,
      projectId: row.projectId,
      projectName: row.project.name,
      occurredAt: row.occurredAt,
      count: row.count,
      source: row.source,
      createdAt: row.createdAt,
    };
  },
  async create(input) {
    const row = await prisma.event.create({
      data: input,
      include: { project: { select: { name: true } } },
    });
    return {
      id: row.id,
      name: row.name,
      projectId: row.projectId,
      projectName: row.project.name,
      occurredAt: row.occurredAt,
      count: row.count,
      source: row.source,
      createdAt: row.createdAt,
    };
  },
  async update(organizationId, id, input) {
    const current = await prisma.event.findFirst({ where: { id, project: { organizationId } } });
    if (!current) throw new Error("Event not found.");
    const row = await prisma.event.update({
      where: { id },
      data: input,
      include: { project: { select: { name: true } } },
    });
    return {
      id: row.id,
      name: row.name,
      projectId: row.projectId,
      projectName: row.project.name,
      occurredAt: row.occurredAt,
      count: row.count,
      source: row.source,
      createdAt: row.createdAt,
    };
  },
  async delete(organizationId, id) {
    const current = await prisma.event.findFirst({ where: { id, project: { organizationId } } });
    if (!current) return;
    await prisma.event.delete({ where: { id } });
  },
};

export async function listMembers(organizationId: string) {
  const rows = await prisma.membership.findMany({
    where: { organizationId },
    include: { user: { select: { id: true, name: true, email: true } } },
    orderBy: { createdAt: "asc" },
  });
  return rows.map((row) => ({
    userId: row.user.id,
    name: row.user.name,
    email: row.user.email,
    role: row.role,
  }));
}

export async function saveMemberRole(organizationId: string, userId: string, role: string) {
  await prisma.membership.update({
    where: { userId_organizationId: { userId, organizationId } },
    data: { role },
  });
}

export async function deleteMembership(organizationId: string, userId: string) {
  await prisma.membership.delete({
    where: { userId_organizationId: { userId, organizationId } },
  });
}
