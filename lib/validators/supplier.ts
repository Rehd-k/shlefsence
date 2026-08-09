import { z } from "zod";

export const supplierCreateSchema = z
  .object({
    name: z.string().min(1),
    companyName: z.string().optional(),
    code: z.string().optional(),
  })
  .passthrough();
