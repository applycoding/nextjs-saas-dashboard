export type Result<T> =
  | { ok: true; data: T }
  | { ok: false; error: string; status: number };

export type ActionState = { ok: true; message?: string } | { ok: false; error: string } | null;

export function ok<T>(data: T): Result<T> {
  return { ok: true, data };
}

export function fail(status: number, error: string): Result<never> {
  return { ok: false, error, status };
}
