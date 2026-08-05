import mongoose, { Schema, Document, Model } from "mongoose";

export interface IBrandDocument extends Document {
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

const BrandSchema = new Schema<IBrandDocument>(
  {
    name: { type: String, required: true, unique: true, index: true },
  },
  { timestamps: true }
);

const Brand: Model<IBrandDocument> =
  mongoose.models.Brand || mongoose.model<IBrandDocument>("Brand", BrandSchema);

export default Brand;
