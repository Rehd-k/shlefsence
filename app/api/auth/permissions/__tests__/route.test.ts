import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/db/mongodb", () => ({
  connectToDatabase: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@/lib/models/RolePermission", () => ({
  default: {
    findOne: vi.fn().mockReturnValue({ lean: () => Promise.resolve(null) }),
    findOneAndUpdate: vi.fn(),
  },
}));

import { GET, POST } from "@/app/api/auth/permissions/route";

describe("/api/auth/permissions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("GET returns defaults when DB empty", async () => {
    const res = await GET(new Request("http://localhost/api/auth/permissions?role=Admin"));
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.data.allowedPages).toContain("dashboard");
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
});
