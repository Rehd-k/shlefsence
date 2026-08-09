import { z } from "zod";

export const posSaleSchema = z.object({
  customerName: z.string().optional(),
  customerType: z.string().optional(),
  items: z
    .array(
      z.object({
        quantity: z.number().positive(),
        product: z
          .object({
            name: z.string().optional(),
            sku: z.string().optional(),
          })
          .passthrough(),
      }).passthrough()
    )
    .min(1),
  totalAmount: z.number().nonnegative(),
  paymentMethod: z.string().optional(),
  cashierName: z.string().optional(),
});

export const invoiceCreateSchema = z.object({
  customerName: z.string().min(1),
  totalAmount: z.number().nonnegative().optional(),
  balanceDue: z.number().optional(),
}).passthrough();

export const paymentCreateSchema = z.object({
  amount: z.number().positive(),
  customerName: z.string().min(1).optional(),
  invoiceRef: z.string().optional(),
}).passthrough();
