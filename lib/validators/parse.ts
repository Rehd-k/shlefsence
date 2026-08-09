import { NextResponse } from "next/server";
import type { ZodSchema } from "zod";

export function parseBody<T>(
  schema: ZodSchema<T>,
  body: unknown
): { data: T } | { error: NextResponse } {
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return {
      error: NextResponse.json(
        { success: false, error: "Invalid request payload", details: parsed.error.flatten() },
        { status: 400 }
      ),
    };
  }
  return { data: parsed.data };
}

export function parseParam(
  schema: ZodSchema<string>,
  value: string
): { data: string } | { error: NextResponse } {
  const parsed = schema.safeParse(value);
  if (!parsed.success) {
    return {
      error: NextResponse.json(
        { success: false, error: "Invalid route parameter", details: parsed.error.flatten() },
        { status: 400 }
      ),
    };
  }
  return { data: parsed.data };
}
