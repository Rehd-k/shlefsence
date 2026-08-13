import mongoose, { Schema, Document, Model } from "mongoose";
import { PaymentMethod } from "@/lib/types/sales";
import { organizationIdField, type OrganizationId } from "@/lib/tenancy/schema";

export interface IPaymentDocument extends Document {
  organizationId: OrganizationId;
  paymentRef: string;
  invoiceId: string;
  invoiceNumber: string;
  customerName: string;
  amount: number;
  method: PaymentMethod;
  status: "Completed" | "Pending Clearing" | "Processing" | "Failed";
  date: string;
  warehouse?: string;
  notes?: string;
  receivedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

const PaymentSchema = new Schema<IPaymentDocument>(
  {
    ...organizationIdField,
    paymentRef: { type: String, required: true, index: true },
    invoiceId: { type: String, required: true, index: true },
    invoiceNumber: { type: String, required: true, index: true },
    customerName: { type: String, required: true, index: true },
    amount: { type: Number, required: true },
    method: { type: String, required: true },
    warehouse: { type: String, index: true },
    status: {
      type: String,
      required: true,
      enum: ["Completed", "Pending Clearing", "Processing", "Failed"],
      default: "Completed",
      index: true,
    },
    date: { type: String, required: true },
    notes: { type: String },
    receivedBy: { type: String },
  },
  {
    timestamps: true,
  }
);

PaymentSchema.index({ organizationId: 1, paymentRef: 1 }, { unique: true });

const Payment: Model<IPaymentDocument> =
  mongoose.models.Payment || mongoose.model<IPaymentDocument>("Payment", PaymentSchema);

export default Payment;
