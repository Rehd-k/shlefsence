import { describe, it, expect, vi, beforeEach } from "vitest";

const { findOne, countDocuments, create, compare, setSessionCookie } = vi.hoisted(() => ({
  findOne: vi.fn(),
  countDocuments: vi.fn(),
  create: vi.fn(),
  compare: vi.fn(),
  setSessionCookie: vi.fn(),
}));

vi.mock("@/lib/db/mongodb", () => ({
  connectToDatabase: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@/lib/models/User", () => ({
  default: { findOne, countDocuments, create },
}));

vi.mock("@/lib/models/RolePermission", () => ({
  default: {
    findOne: vi.fn().mockReturnValue({ lean: () => Promise.resolve(null) }),
  },
}));

vi.mock("bcrypt", () => ({
  default: { compare, hash: vi.fn() },
  compare,
  hash: vi.fn(),
}));

vi.mock("@/lib/auth/session", async () => {
  const actual = await vi.importActual<typeof import("@/lib/auth/session")>("@/lib/auth/session");
  return {
    ...actual,
    createSessionToken: vi.fn().mockResolvedValue("test-token"),
    setSessionCookie,
  };
});

import { POST } from "@/app/api/auth/login/route";

describe("POST /api/auth/login", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    countDocuments.mockResolvedValue(1);
    process.env.NODE_ENV = "test";
  });

  it("returns 400 for invalid payload", async () => {
    const res = await POST(
      new Request("http://localhost/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email: "bad" }),
      })
    );
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.success).toBe(false);
  });

  it("returns 401 for bad credentials", async () => {
    findOne.mockResolvedValue(null);
    const res = await POST(
      new Request("http://localhost/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "a@b.com", password: "wrong" }),
      })
    );
    expect(res.status).toBe(401);
  });

  it("sets session cookie on success", async () => {
    findOne.mockResolvedValue({
      password: "hashed",
      role: "Admin",
      toObject: () => ({
        _id: { toString: () => "507f1f77bcf86cd799439011" },
        email: "a@b.com",
        name: "Admin",
        role: "Admin",
        assignedLocation: "All Locations",
      }),
    });
    compare.mockResolvedValue(true);

    const res = await POST(
      new Request("http://localhost/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "a@b.com", password: "Password123!" }),
      })
    );
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(setSessionCookie).toHaveBeenCalled();
  });
});
