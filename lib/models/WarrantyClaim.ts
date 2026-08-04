import mongoose, { Schema, Document, Model } from "mongoose";

export interface IWarrantyClaimDocument extends Document {
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
    claimId: { type: String, required: true, unique: true, index: true },
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

const WarrantyClaim: Model<IWarrantyClaimDocument> =
  mongoose.models.WarrantyClaim || mongoose.model<IWarrantyClaimDocument>("WarrantyClaim", WarrantyClaimSchema);

export default WarrantyClaim;
