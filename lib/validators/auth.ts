import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const registerSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8),
  businessName: z.string().min(1),
  businessPhone: z.string().optional(),
  businessAddress: z.string().optional(),
});

export const objectIdSchema = z.string().regex(/^[a-f\d]{24}$/i, "Invalid ObjectId");
