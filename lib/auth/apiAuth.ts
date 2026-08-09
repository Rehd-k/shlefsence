import { NextResponse } from "next/server";
import { getSessionFromRequest, unauthorizedResponse, type SessionPayload } from "@/lib/auth/session";

export async function requireSession(
  req: Request
): Promise<{ session: SessionPayload } | { error: NextResponse }> {
  const session = await getSessionFromRequest(req);
  if (!session) {
    return { error: unauthorizedResponse() };
  }
  return { session };
}

export function actorName(session: SessionPayload): string {
  return session.name || session.email;
}
