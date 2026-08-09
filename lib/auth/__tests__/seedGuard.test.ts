import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { assertSeedAuthorized } from "@/lib/auth/seedGuard";

describe("assertSeedAuthorized", () => {
  const prev = { ...process.env };

  beforeEach(() => {
    process.env.SEED_SECRET = "test-seed-secret";
    process.env.NODE_ENV = "development";
    delete process.env.ALLOW_SEED_IN_PRODUCTION;
  });

  afterEach(() => {
    process.env = { ...prev };
  });

  it("rejects missing bearer token", async () => {
    const res = assertSeedAuthorized(new Request("http://localhost/api/seed", { method: "POST" }));
    expect(res).not.toBeNull();
    expect(res!.status).toBe(401);
  });

  it("allows valid bearer token", () => {
    const res = assertSeedAuthorized(
      new Request("http://localhost/api/seed", {
        method: "POST",
        headers: { Authorization: "Bearer test-seed-secret" },
      })
    );
    expect(res).toBeNull();
  });

  it("blocks production without ALLOW_SEED_IN_PRODUCTION", () => {
    process.env.NODE_ENV = "production";
    const res = assertSeedAuthorized(
      new Request("http://localhost/api/seed", {
        method: "POST",
        headers: { Authorization: "Bearer test-seed-secret" },
      })
    );
    expect(res).not.toBeNull();
    expect(res!.status).toBe(403);
  });
});
