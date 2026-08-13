import { describe, it, expect, vi, beforeEach } from "vitest";

const ORG_A = "aaaaaaaaaaaaaaaaaaaaaaaa";

const { findOne, find, findOneAndUpdate, leanFind, requireTenantSession } = vi.hoisted(() => {
  const leanFind = vi.fn();
  const find = vi.fn(() => ({ lean: leanFind }));
  const findOne = vi.fn(() => ({ lean: vi.fn().mockResolvedValue(null) }));
  const findOneAndUpdate = vi.fn();
  const requireTenantSession = vi.fn();
  return { findOne, find, findOneAndUpdate, leanFind, requireTenantSession };
});

vi.mock("@/lib/db/mongodb", () => ({
  connectToDatabase: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@/lib/auth/apiAuth", () => ({
  requireTenantSession,
}));

vi.mock("@/lib/models/RolePermission", () => ({
  default: {
    findOne,
    find,
    findOneAndUpdate,
  },
}));

import { GET, POST } from "@/app/api/auth/permissions/route";

describe("/api/auth/permissions", () => {
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

  it("GET returns defaults when DB empty", async () => {
    const res = await GET(new Request("http://localhost/api/auth/permissions?role=Admin"));
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.data.allowedPages).toContain("dashboard");
    expect(findOne).toHaveBeenCalledWith({ organizationId: ORG_A, role: "Admin" });
  });

  it("POST requires role", async () => {
    const res = await POST(
      new Request("http://localhost/api/auth/permissions", {
        method: "POST",
        body: JSON.stringify({}),
      })
    );
    expect(res.status).toBe(400);
  });

  it("POST upserts within organization", async () => {
    findOneAndUpdate.mockResolvedValue({
      role: "Sales",
      allowedPages: ["sales"],
      allowAllLocations: false,
      organizationId: ORG_A,
    });
    const res = await POST(
      new Request("http://localhost/api/auth/permissions", {
        method: "POST",
        body: JSON.stringify({
          role: "Sales",
          allowedPages: ["sales"],
          allowAllLocations: false,
        }),
      })
    );
    expect(res.status).toBe(200);
    expect(findOneAndUpdate).toHaveBeenCalledWith(
      { organizationId: ORG_A, role: "Sales" },
      expect.objectContaining({ organizationId: ORG_A, role: "Sales" }),
      expect.any(Object)
    );
  });
});
