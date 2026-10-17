"use server";

import { AuthError } from "next-auth";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { signIn, signOut } from "@/auth";
import { ACTIVE_ORG_COOKIE, getAppContext } from "@/lib/context";
import { credentialsSchema } from "@/lib/validations";
import type { ActionState } from "@/lib/result";
import { asMembers, changeMemberRole, ownerCount, removeMember } from "@/lib/server/members";
import { createEvent, deleteEvent, updateEvent } from "@/lib/server/events";
import { createProject, deleteProject, updateProject } from "@/lib/server/projects";
import { deleteMembership, eventStore, listMembers, projectStore, saveMemberRole } from "@/lib/stores";

async function requireContext() {
  const ctx = await getAppContext();
  if (!ctx) redirect("/login");
  return ctx;
}

export async function loginAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = credentialsSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { ok: false, error: "Enter the email and password from the demo accounts." };
  }
  try {
    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirectTo: "/overview",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return { ok: false, error: "Those credentials were not recognised." };
    }
    throw error;
  }
  return { ok: false, error: "Sign in did not complete." };
}

export async function githubSignInAction() {
  if (!process.env.AUTH_GITHUB_ID || !process.env.AUTH_GITHUB_SECRET) {
    redirect("/login?error=GitHub%20login%20needs%20AUTH_GITHUB_ID%20and%20AUTH_GITHUB_SECRET");
  }
  await signIn("github", { redirectTo: "/overview" });
}

export async function signOutAction() {
  await signOut({ redirectTo: "/" });
}

export async function switchOrganizationAction(formData: FormData) {
  const ctx = await requireContext();
  const organizationId = String(formData.get("organizationId") ?? "");
  const membership = ctx.memberships.find((item) => item.organizationId === organizationId);
  if (!membership) redirect("/overview?error=That%20organisation%20is%20not%20on%20your%20account");
  const cookieStore = await cookies();
  cookieStore.set(ACTIVE_ORG_COOKIE, organizationId, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
  });
  revalidatePath("/", "layout");
  redirect("/overview");
}

export async function createProjectAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const ctx = await getAppContext();
  if (!ctx) return { ok: false, error: "Sign in required." };
  const result = await createProject(
    ctx.role,
    ctx.organization.id,
    { name: formData.get("name"), description: formData.get("description") },
    projectStore,
  );
  if (!result.ok) return { ok: false, error: result.error };
  revalidatePath("/projects");
  revalidatePath("/overview");
  return { ok: true, message: "Project saved in this demo." };
}

export async function updateProjectAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const ctx = await getAppContext();
  if (!ctx) return { ok: false, error: "Sign in required." };
  const id = String(formData.get("id") ?? "");
  const result = await updateProject(
    ctx.role,
    ctx.organization.id,
    id,
    { name: formData.get("name"), description: formData.get("description") },
    projectStore,
  );
  if (!result.ok) return { ok: false, error: result.error };
  revalidatePath("/projects");
  revalidatePath(`/projects/${id}`);
  revalidatePath("/overview");
  return { ok: true, message: "Project updated." };
}

export async function deleteProjectAction(formData: FormData) {
  const ctx = await requireContext();
  const id = String(formData.get("id") ?? "");
  const result = await deleteProject(ctx.role, ctx.organization.id, id, projectStore);
  if (!result.ok) redirect(`/projects/${id}?error=${encodeURIComponent(result.error)}`);
  revalidatePath("/projects");
  revalidatePath("/overview");
  redirect("/projects?notice=Project%20deleted");
}

export async function createEventAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const ctx = await getAppContext();
  if (!ctx) return { ok: false, error: "Sign in required." };
  const occurredAt = formData.get("occurredAt");
  const result = await createEvent(
    ctx.role,
    ctx.organization.id,
    {
      projectId: formData.get("projectId"),
      name: formData.get("name"),
      count: formData.get("count"),
      occurredAt: occurredAt ? String(occurredAt) : undefined,
    },
    eventStore,
  );
  if (!result.ok) return { ok: false, error: result.error };
  revalidatePath("/events");
  revalidatePath("/overview");
  revalidatePath("/projects");
  return { ok: true, message: "Event recorded in this demo." };
}

export async function updateEventAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const ctx = await getAppContext();
  if (!ctx) return { ok: false, error: "Sign in required." };
  const id = String(formData.get("id") ?? "");
  const occurredAt = formData.get("occurredAt");
  const result = await updateEvent(
    ctx.role,
    ctx.organization.id,
    id,
    {
      name: formData.get("name"),
      count: formData.get("count"),
      occurredAt: occurredAt ? String(occurredAt) : undefined,
    },
    eventStore,
  );
  if (!result.ok) return { ok: false, error: result.error };
  revalidatePath("/events");
  revalidatePath("/overview");
  return { ok: true, message: "Event updated." };
}

export async function deleteEventAction(formData: FormData) {
  const ctx = await requireContext();
  const id = String(formData.get("id") ?? "");
  const result = await deleteEvent(ctx.role, ctx.organization.id, id, eventStore);
  if (!result.ok) redirect(`/events?error=${encodeURIComponent(result.error)}`);
  revalidatePath("/events");
  revalidatePath("/overview");
  redirect("/events?notice=Event%20deleted");
}

export async function updateRoleAction(formData: FormData) {
  const ctx = await requireContext();
  const rows = asMembers(await listMembers(ctx.organization.id));
  const result = await changeMemberRole({
    actorRole: ctx.role,
    actorUserId: ctx.user.id,
    ownerCount: ownerCount(rows),
    members: rows,
    body: { userId: formData.get("userId"), role: formData.get("role") },
  });
  if (!result.ok) redirect(`/team?error=${encodeURIComponent(result.error)}`);
  await saveMemberRole(ctx.organization.id, result.data.userId, result.data.role);
  revalidatePath("/team");
  redirect("/team?notice=Role%20updated");
}

export async function removeMemberAction(formData: FormData) {
  const ctx = await requireContext();
  const rows = asMembers(await listMembers(ctx.organization.id));
  const targetUserId = String(formData.get("userId") ?? "");
  const result = await removeMember({
    actorRole: ctx.role,
    actorUserId: ctx.user.id,
    targetUserId,
    members: rows,
    ownerCount: ownerCount(rows),
  });
  if (!result.ok) redirect(`/team?error=${encodeURIComponent(result.error)}`);
  await deleteMembership(ctx.organization.id, result.data.userId);
  revalidatePath("/team");
  redirect("/team?notice=Member%20removed");
}
