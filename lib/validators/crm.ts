import { z } from "zod";
import { objectIdSchema } from "@/lib/validators/auth";

export const customerCreateSchema = z
  .object({
    businessName: z.string().min(1),
    contactName: z.string().min(1),
    email: z.string().email(),
    phone: z.string().min(1),
    name: z.string().optional(),
  })
  .passthrough();

export const customerIdSchema = objectIdSchema;

export const communicationCreateSchema = z
  .object({
    type: z.string().min(1),
    subject: z.string().optional(),
    content: z.string().optional(),
    loggedBy: z.string().optional(),
  })
  .passthrough();
