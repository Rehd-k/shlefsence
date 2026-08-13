import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

vi.mock("@/lib/db/mongodb", () => ({
  connectToDatabase: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@/lib/tenancy/migrateToDefaultOrg", () => ({
  ensureDefaultOrganizationMigration: vi.fn().mockResolvedValue({
    organizationId: "aaaaaaaaaaaaaaaaaaaaaaaa",
    backfilled: {},
  }),
}));

import { GET, POST } from "@/app/api/seed/route";

describe("/api/seed", () => {
  const prev = { ...process.env };

  beforeEach(() => {
    process.env.SEED_SECRET = "secret";
    process.env.NODE_ENV = "development";
  });

  afterEach(() => {
    process.env = { ...prev };
  });

  it("GET is disabled", async () => {
    const res = await GET();
    expect(res.status).toBe(405);
  });

  it("POST without token is unauthorized", async () => {
    const res = await POST(new Request("http://localhost/api/seed", { method: "POST" }));
    expect(res.status).toBe(401);
  });
});
