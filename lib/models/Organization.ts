import mongoose, { Schema, Document, Model } from "mongoose";

export interface IOrganizationDocument extends Document {
  name: string;
  slug: string;
  status: "Active" | "Suspended";
  createdAt: Date;
  updatedAt: Date;
}

const OrganizationSchema = new Schema<IOrganizationDocument>(
  {
    name: { type: String, required: true, index: true },
    slug: { type: String, required: true, unique: true, index: true },
    status: {
      type: String,
      enum: ["Active", "Suspended"],
      default: "Active",
      index: true,
    },
  },
  { timestamps: true }
);

const Organization: Model<IOrganizationDocument> =
  mongoose.models.Organization ||
  mongoose.model<IOrganizationDocument>("Organization", OrganizationSchema);

export default Organization;
