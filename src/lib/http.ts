import { NextResponse } from "next/server";

import type { Result } from "@/lib/result";

export function toResponse<T>(result: Result<T>, extra?: Record<string, unknown>) {
  if (!result.ok) {
    return NextResponse.json({ ok: false, error: result.error }, { status: result.status });
  }
  return NextResponse.json({ ok: true, data: result.data, ...extra });
}

export function unauthorized() {
  return NextResponse.json({ ok: false, error: "Sign in required." }, { status: 401 });
}

export async function readJson(request: Request): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    return undefined;
  }
}
