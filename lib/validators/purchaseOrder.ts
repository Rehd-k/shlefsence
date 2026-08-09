import { z } from "zod";

export const purchaseOrderCreateSchema = z
  .object({
    supplier: z.string().min(1),
    warehouse: z.string().min(1),
    totalUnits: z.number().nonnegative().optional(),
    totalValue: z.number().nonnegative().optional(),
  })
  .passthrough();
