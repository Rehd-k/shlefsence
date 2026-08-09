import { z } from "zod";

export const productCreateSchema = z
  .object({
    sku: z.string().min(1),
    name: z.string().min(1).optional(),
    product: z.string().min(1).optional(),
    brand: z.string().optional(),
    category: z.string().optional(),
    quality: z.string().optional(),
    cost: z.number().nonnegative().optional(),
    sellingPrice: z.number().nonnegative().optional(),
  })
  .passthrough()
  .refine((data) => Boolean(data.name || data.product), {
    message: "Product name is required",
    path: ["name"],
  });
