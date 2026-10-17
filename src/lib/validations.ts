import { z } from "zod";

import { ROLES } from "@/lib/rbac";
import { fail, ok, type Result } from "@/lib/result";

export const credentialsSchema = z.object({
  email: z.email("Enter a valid email."),
  password: z.string().min(1, "Enter the password.").max(200),
});

export const projectInputSchema = z.object({
  name: z.string().trim().min(2, "Name needs at least 2 characters.").max(80),
  description: z.string().trim().max(280).optional().default(""),
});

export const eventInputSchema = z.object({
  projectId: z.string().trim().min(1, "Choose a project."),
  name: z
    .string()
    .trim()
    .min(2, "Name needs at least 2 characters.")
    .max(64)
    .regex(/^[a-z][a-z0-9_]*$/, "Use a lowercase name such as signup_completed."),
  count: z.coerce.number().int().min(1).max(100000),
});

export const roleUpdateSchema = z.object({
  userId: z.string().trim().min(1),
  role: z.enum(ROLES),
});

export const analyticsQuerySchema = z.object({
  projectId: z
    .string()
    .trim()
    .optional()
    .transform((value) => (value ? value : undefined)),
  days: z.coerce.number().int().min(1).max(90).default(14),
});

export function parseOccurredAt(value: unknown, now = new Date()): Result<Date> {
  if (value === undefined || value === null || value === "") return ok(now);
  if (typeof value !== "string") return fail(400, "Occurred at must be a date.");
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return fail(400, "Occurred at must be a date.");
  return ok(date);
}

export function fieldError(error: z.ZodError): string {
  return error.issues[0]?.message ?? "Check the form and try again.";
}
