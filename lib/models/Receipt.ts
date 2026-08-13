import mongoose, { Schema, Document, Model } from "mongoose";
import { OrderType, PaymentMethod } from "@/lib/types/sales";
import { organizationIdField, type OrganizationId } from "@/lib/tenancy/schema";

export interface IReceiptDocument extends Document {
  organizationId: OrganizationId;
  receiptNumber: string;
  invoiceNumber: string;
  customerName: string;
  customerType: OrderType;
  itemsCount: number;
  totalAmount: number;
  paymentMethod: PaymentMethod;
  cashierName: string;
  timestamp: string;
  itemsSummary: string;
  storeName: string;
  storeAddress: string;
  warehouse?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ReceiptSchema = new Schema<IReceiptDocument>(
  {
    ...organizationIdField,
    receiptNumber: { type: String, required: true, index: true },
    invoiceNumber: { type: String, required: true, index: true },
    customerName: { type: String, required: true },
    customerType: { type: String, required: true },
    itemsCount: { type: Number, required: true },
    totalAmount: { type: Number, required: true },
    paymentMethod: { type: String, required: true },
    cashierName: { type: String, required: true },
    timestamp: { type: String, required: true },
    itemsSummary: { type: String, required: true },
    storeName: { type: String, required: true, default: "ShelfSense Main Store" },
    storeAddress: { type: String, required: true, default: "142 Logistics Way, Queens NY" },
    warehouse: { type: String, index: true },
  },
  {
    timestamps: true,
  }
);

ReceiptSchema.index({ organizationId: 1, receiptNumber: 1 }, { unique: true });

const Receipt: Model<IReceiptDocument> =
  mongoose.models.Receipt || mongoose.model<IReceiptDocument>("Receipt", ReceiptSchema);

export default Receipt;
