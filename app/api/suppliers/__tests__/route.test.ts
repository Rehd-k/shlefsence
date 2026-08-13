import { describe, it, expect, vi, beforeEach } from "vitest";

const { lean, find, requireTenantSession } = vi.hoisted(() => {
  const lean = vi.fn().mockResolvedValue([]);
  const find = vi.fn(() => ({
    sort: () => ({ lean }),
    lean,
  }));
  const requireTenantSession = vi.fn();
  return { lean, find, requireTenantSession };
});

vi.mock("@/lib/db/mongodb", () => ({
  connectToDatabase: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@/lib/auth/apiAuth", () => ({
  requireTenantSession,
  tenantFilter: (organizationId: string, extra: Record<string, unknown> = {}) => ({
    organizationId,
    ...extra,
  }),
  actorName: (s: { name?: string; email?: string }) => s.name || s.email || "System",
}));

vi.mock("@/lib/models/Supplier", () => ({
  default: { find, countDocuments: vi.fn(), create: vi.fn() },
}));

import { GET, POST } from "@/app/api/suppliers/route";

describe("/api/suppliers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    lean.mockResolvedValue([]);
    requireTenantSession.mockResolvedValue({
      session: {
        sub: "u1",
        email: "a@b.com",
        name: "Admin",
        role: "Admin",
        assignedLocation: "Main Hub",
        organizationId: "aaaaaaaaaaaaaaaaaaaaaaaa",
      },
      organizationId: "aaaaaaaaaaaaaaaaaaaaaaaa",
    });
  });

  it("GET returns empty list with zero KPIs", async () => {
    const res = await GET(new Request("http://localhost/api/suppliers"));
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.kpis.averageDeliveryTime).toBe(0);
    expect(json.kpis.defectiveRate).toBe(0);
  });

  it("POST rejects missing name", async () => {
    const res = await POST(
      new Request("http://localhost/api/suppliers", {
        method: "POST",
        body: JSON.stringify({ code: "SUP-1" }),
      })
    );
    expect(res.status).toBe(400);
  });
});
