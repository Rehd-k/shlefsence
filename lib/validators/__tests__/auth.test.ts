import { describe, it, expect } from "vitest";
import { loginSchema, objectIdSchema } from "@/lib/validators/auth";

describe("auth validators", () => {
  it("accepts valid login payload", () => {
    const result = loginSchema.safeParse({ email: "a@b.com", password: "secret" });
    expect(result.success).toBe(true);
  });

  it("rejects invalid email", () => {
    const result = loginSchema.safeParse({ email: "nope", password: "secret" });
    expect(result.success).toBe(false);
  });

  it("validates ObjectId", () => {
    expect(objectIdSchema.safeParse("507f1f77bcf86cd799439011").success).toBe(true);
    expect(objectIdSchema.safeParse("bad-id").success).toBe(false);
  });
});
