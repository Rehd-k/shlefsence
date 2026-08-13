import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/auth/sessionEdge", () => ({
  SESSION_COOKIE: "shelfsense_session",
  verifySessionToken: vi.fn(),
}));

import { middleware } from "@/middleware";
import { verifySessionToken } from "@/lib/auth/sessionEdge";
import { NextRequest } from "next/server";

function makeReq(path: string, cookie?: string) {
  const headers = new Headers();
  if (cookie) headers.set("cookie", `shelfsense_session=${cookie}`);
  return new NextRequest(new URL(path, "http://localhost"), { headers });
}

describe("middleware", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("allows public login page without session", async () => {
    vi.mocked(verifySessionToken).mockResolvedValue(null);
    const res = await middleware(makeReq("/login"));
    expect(res.status).toBeLessThan(400);
  });

  it("redirects unauthenticated page hits to login", async () => {
    vi.mocked(verifySessionToken).mockResolvedValue(null);
    const res = await middleware(makeReq("/inventory"));
    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toContain("/login");
  });

  it("returns 401 for unauthenticated API calls", async () => {
    vi.mocked(verifySessionToken).mockResolvedValue(null);
    const res = await middleware(makeReq("/api/products"));
    expect(res.status).toBe(401);
  });

  it("allows authenticated API calls", async () => {
    vi.mocked(verifySessionToken).mockResolvedValue({
      sub: "1",
      email: "a@b.com",
      name: "Admin",
      role: "Admin",
      assignedLocation: "All",
      organizationId: "aaaaaaaaaaaaaaaaaaaaaaaa",
    } as never);
    const res = await middleware(makeReq("/api/products", "tok"));
    expect(res.status).toBe(200);
    expect(res.headers.get("x-organization-id")).toBe("aaaaaaaaaaaaaaaaaaaaaaaa");
  });
});
