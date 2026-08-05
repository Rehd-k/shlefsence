import mongoose, { Schema, Document, Model } from "mongoose";
import { PaymentMethod } from "@/lib/types/sales";

export interface IPaymentDocument extends Document {
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
    paymentRef: { type: String, required: true, unique: true, index: true },
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

const Payment: Model<IPaymentDocument> =
  mongoose.models.Payment || mongoose.model<IPaymentDocument>("Payment", PaymentSchema);

export default Payment;
