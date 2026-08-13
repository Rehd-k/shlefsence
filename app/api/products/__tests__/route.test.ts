import { describe, it, expect, vi, beforeEach } from "vitest";

const { lean, sort, find, create, requireTenantSession } = vi.hoisted(() => {
  const lean = vi.fn();
  const sort = vi.fn(() => ({ lean }));
  const find = vi.fn(() => ({ sort }));
  const create = vi.fn();
  const requireTenantSession = vi.fn();
  return { lean, sort, find, create, requireTenantSession };
});

vi.mock("@/lib/db/mongodb", () => ({
  connectToDatabase: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@/lib/models/Product", () => ({
  default: { find, create },
}));

vi.mock("@/lib/auth/apiAuth", () => ({
  requireTenantSession,
  tenantFilter: (organizationId: string, extra: Record<string, unknown> = {}) => ({
    organizationId,
    ...extra,
  }),
}));

import { GET, POST } from "@/app/api/products/route";

const ORG_A = "aaaaaaaaaaaaaaaaaaaaaaaa";

describe("/api/products", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    requireTenantSession.mockResolvedValue({
      session: {
        sub: "u1",
        email: "a@b.com",
        name: "Admin",
        role: "Admin",
        assignedLocation: "Main Hub",
        organizationId: ORG_A,
      },
      organizationId: ORG_A,
    });
  });

  it("GET returns empty array for empty collection", async () => {
    lean.mockResolvedValue([]);
    const res = await GET(new Request("http://localhost/api/products"));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.data).toEqual([]);
    expect(find).toHaveBeenCalledWith(expect.objectContaining({ organizationId: ORG_A }));
  });

  it("GET rejects unauthenticated requests", async () => {
    const { NextResponse } = await import("next/server");
    requireTenantSession.mockResolvedValue({
      error: NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 }),
    });
    const res = await GET(new Request("http://localhost/api/products"));
    expect(res.status).toBe(401);
    expect(find).not.toHaveBeenCalled();
  });

  it("POST rejects invalid payload", async () => {
    const res = await POST(
      new Request("http://localhost/api/products", {
        method: "POST",
        body: JSON.stringify({ brand: "Apple" }),
      })
    );
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.success).toBe(false);
  });

  it("POST creates product stamped with organizationId", async () => {
    create.mockResolvedValue({
      toObject: () => ({
        _id: { toString: () => "507f1f77bcf86cd799439011" },
        sku: "SKU-1",
        name: "OLED",
        organizationId: ORG_A,
      }),
    });
    const res = await POST(
      new Request("http://localhost/api/products", {
        method: "POST",
        body: JSON.stringify({ sku: "SKU-1", name: "OLED" }),
      })
    );
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.data.sku).toBe("SKU-1");
    expect(create).toHaveBeenCalledWith(expect.objectContaining({ organizationId: ORG_A }));
  });
});
