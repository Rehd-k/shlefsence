import mongoose, { Schema, Document, Model } from "mongoose";
import { organizationIdField, type OrganizationId } from "@/lib/tenancy/schema";

export interface IWarrantyClaimDocument extends Document {
  organizationId: OrganizationId;
  claimId: string;
  customer: string;
  part: string;
  issue: string;
  status: string;
  date: string;
  createdAt: Date;
  updatedAt: Date;
}

const WarrantyClaimSchema = new Schema<IWarrantyClaimDocument>(
  {
    ...organizationIdField,
    claimId: { type: String, required: true, index: true },
    customer: { type: String, required: true, index: true },
    part: { type: String, required: true },
    issue: { type: String, required: true },
    status: { type: String, required: true, default: "Pending Inspection" },
    date: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

WarrantyClaimSchema.index({ organizationId: 1, claimId: 1 }, { unique: true });

const WarrantyClaim: Model<IWarrantyClaimDocument> =
  mongoose.models.WarrantyClaim || mongoose.model<IWarrantyClaimDocument>("WarrantyClaim", WarrantyClaimSchema);

export default WarrantyClaim;
