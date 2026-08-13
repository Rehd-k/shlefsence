import mongoose, { Schema, Document, Model } from "mongoose";
import { organizationIdField, type OrganizationId } from "@/lib/tenancy/schema";

export interface IBrandDocument extends Document {
  organizationId: OrganizationId;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

const BrandSchema = new Schema<IBrandDocument>(
  {
    ...organizationIdField,
    name: { type: String, required: true, index: true },
  },
  { timestamps: true }
);

BrandSchema.index({ organizationId: 1, name: 1 }, { unique: true });

const Brand: Model<IBrandDocument> =
  mongoose.models.Brand || mongoose.model<IBrandDocument>("Brand", BrandSchema);

export default Brand;
