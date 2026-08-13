import mongoose, { Schema, Document, Model } from "mongoose";
import { organizationIdField, type OrganizationId } from "@/lib/tenancy/schema";

export interface ICategoryDocument extends Document {
  organizationId: OrganizationId;
  name: string;
  code: string;
  description: string;
  itemCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const CategorySchema = new Schema<ICategoryDocument>(
  {
    ...organizationIdField,
    name: { type: String, required: true, index: true },
    code: { type: String, required: true },
    description: { type: String, default: "" },
    itemCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

CategorySchema.index({ organizationId: 1, name: 1 }, { unique: true });
CategorySchema.index({ organizationId: 1, code: 1 }, { unique: true });

const Category: Model<ICategoryDocument> =
  mongoose.models.Category || mongoose.model<ICategoryDocument>("Category", CategorySchema);

export default Category;
