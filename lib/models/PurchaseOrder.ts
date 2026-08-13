import mongoose, { Schema, Document, Model } from "mongoose";
import { organizationIdField, type OrganizationId } from "@/lib/tenancy/schema";

export interface IPurchaseOrderDocument extends Document {
  organizationId: OrganizationId;
  poNumber: string;
  supplier: string;
  warehouse: string;
  totalUnits: number;
  totalValue: number;
  status: string;
  expectedDate: string;
  createdAt: Date;
  updatedAt: Date;
}

const PurchaseOrderSchema = new Schema<IPurchaseOrderDocument>(
  {
    ...organizationIdField,
    poNumber: { type: String, required: true, index: true },
    supplier: { type: String, required: true, index: true },
    warehouse: { type: String, required: true, index: true },
    totalUnits: { type: Number, required: true, default: 0 },
    totalValue: { type: Number, required: true, default: 0 },
    status: { type: String, required: true, default: "Awaiting Arrival" },
    expectedDate: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

PurchaseOrderSchema.index({ organizationId: 1, poNumber: 1 }, { unique: true });

const PurchaseOrder: Model<IPurchaseOrderDocument> =
  mongoose.models.PurchaseOrder || mongoose.model<IPurchaseOrderDocument>("PurchaseOrder", PurchaseOrderSchema);

export default PurchaseOrder;
