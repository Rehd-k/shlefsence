import { describe, it, expect, vi, beforeEach } from "vitest";

const { lean, sort, find, create } = vi.hoisted(() => {
  const lean = vi.fn();
  const sort = vi.fn(() => ({ lean }));
  const find = vi.fn(() => ({ sort }));
  const create = vi.fn();
  return { lean, sort, find, create };
});

vi.mock("@/lib/db/mongodb", () => ({
  connectToDatabase: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@/lib/models/Customer", () => ({
  default: { find, create },
}));

import { GET, POST } from "@/app/api/crm/customers/route";

describe("/api/crm/customers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("GET returns empty list", async () => {
    lean.mockResolvedValue([]);
    const res = await GET(new Request("http://localhost/api/crm/customers"));
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.data).toEqual([]);
  });

  it("POST rejects invalid payload", async () => {
    const res = await POST(
      new Request("http://localhost/api/crm/customers", {
        method: "POST",
        body: JSON.stringify({ businessName: "X" }),
      })
    );
    expect(res.status).toBe(400);
  });
});
