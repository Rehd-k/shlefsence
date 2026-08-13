import mongoose, { Schema, Document, Model } from "mongoose";
import { organizationIdField, type OrganizationId } from "@/lib/tenancy/schema";

export interface IWholesaleCustomerDocument extends Document {
  organizationId: OrganizationId;
  name: string;
  companyName: string;
  email: string;
  phone: string;
  tier: "Gold VIP" | "Silver Tier" | "Bronze Tier" | "Standard B2B";
  creditLimit: number;
  usedCredit: number;
  availableCredit: number;
  paymentTerms: "Net 15" | "Net 30" | "Net 60" | "Due on Receipt";
  taxExemptionId?: string;
  totalOrders: number;
  totalSpent: number;
  createdAt: Date;
  updatedAt: Date;
}

const WholesaleCustomerSchema = new Schema<IWholesaleCustomerDocument>(
  {
    ...organizationIdField,
    name: { type: String, required: true, index: true },
    companyName: { type: String, required: true, index: true },
    email: { type: String, required: true, index: true },
    phone: { type: String, required: true },
    tier: {
      type: String,
      required: true,
      enum: ["Gold VIP", "Silver Tier", "Bronze Tier", "Standard B2B"],
      default: "Standard B2B",
    },
    creditLimit: { type: Number, required: true, default: 0 },
    usedCredit: { type: Number, required: true, default: 0 },
    availableCredit: { type: Number, required: true, default: 0 },
    paymentTerms: {
      type: String,
      required: true,
      enum: ["Net 15", "Net 30", "Net 60", "Due on Receipt"],
      default: "Net 30",
    },
    taxExemptionId: { type: String },
    totalOrders: { type: Number, required: true, default: 0 },
    totalSpent: { type: Number, required: true, default: 0 },
  },
  {
    timestamps: true,
  }
);

WholesaleCustomerSchema.index({ organizationId: 1, email: 1 }, { unique: true });

const WholesaleCustomer: Model<IWholesaleCustomerDocument> =
  mongoose.models.WholesaleCustomer ||
  mongoose.model<IWholesaleCustomerDocument>("WholesaleCustomer", WholesaleCustomerSchema);

export default WholesaleCustomer;
