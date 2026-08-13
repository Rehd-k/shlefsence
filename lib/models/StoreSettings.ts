import mongoose, { Schema, Document, Model } from "mongoose";
import { organizationIdField, type OrganizationId } from "@/lib/tenancy/schema";

export interface IStoreSettingsDocument extends Document {
  organizationId: OrganizationId;
  businessName: string;
  businessPhone: string;
  businessAddress: string;
  currencyDefault: string;
  createdAt: Date;
  updatedAt: Date;
}

const StoreSettingsSchema = new Schema<IStoreSettingsDocument>(
  {
    ...organizationIdField,
    businessName: { type: String, required: true, default: "My Business" },
    businessPhone: { type: String, required: true, default: "" },
    businessAddress: { type: String, required: true, default: "" },
    currencyDefault: { type: String, required: true, default: "₦" },
  },
  {
    timestamps: true,
  }
);

StoreSettingsSchema.index({ organizationId: 1 }, { unique: true });

const StoreSettings: Model<IStoreSettingsDocument> =
  mongoose.models.StoreSettings ||
  mongoose.model<IStoreSettingsDocument>("StoreSettings", StoreSettingsSchema);

export default StoreSettings;
