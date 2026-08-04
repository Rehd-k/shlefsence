import mongoose, { Schema, Document, Model } from "mongoose";

export interface IStoreSettingsDocument extends Document {
  businessName: string;
  businessPhone: string;
  businessAddress: string;
  currencyDefault: string;
  createdAt: Date;
  updatedAt: Date;
}

const StoreSettingsSchema = new Schema<IStoreSettingsDocument>(
  {
    businessName: { type: String, required: true, default: "ShelfSense Lagos" },
    businessPhone: { type: String, required: true, default: "+234 (1) 555-0192" },
    businessAddress: { type: String, required: true, default: "14 Logistics Way, Ikeja, Lagos" },
    currencyDefault: { type: String, required: true, default: "₦" },
  },
  {
    timestamps: true,
  }
);

const StoreSettings: Model<IStoreSettingsDocument> =
  mongoose.models.StoreSettings || mongoose.model<IStoreSettingsDocument>("StoreSettings", StoreSettingsSchema);

export default StoreSettings;
