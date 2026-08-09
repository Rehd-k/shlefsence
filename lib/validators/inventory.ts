import { z } from "zod";
import { objectIdSchema } from "@/lib/validators/auth";

export const inventoryCreateSchema = z
  .object({
    sku: z.string().min(1),
    product: z.string().min(1).optional(),
    quantity: z.number().int().nonnegative().optional(),
    warehouse: z.string().optional(),
  })
  .passthrough();

export const inventoryIdParamSchema = z.union([
  objectIdSchema,
  z.string().min(1), // allow SKU lookups
]);
