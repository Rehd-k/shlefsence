import mongoose, { Schema, Document, Model } from "mongoose";
import { organizationIdField, type OrganizationId } from "@/lib/tenancy/schema";

export type UserRole = "Admin" | "Manager" | "Supervisor" | "Sales";

export interface IUserDocument extends Document {
  organizationId: OrganizationId;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  assignedLocation: string;
  supervisedLocations?: string[];
  phone?: string;
  status: "Active" | "Inactive";
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUserDocument>(
  {
    ...organizationIdField,
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, index: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ["Admin", "Manager", "Supervisor", "Sales"],
      default: "Sales",
      required: true,
    },
    assignedLocation: {
      type: String,
      default: "Main Hub",
      required: true,
    },
    supervisedLocations: {
      type: [String],
      default: [],
    },
    phone: { type: String, default: "" },
    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active",
    },
  },
  { timestamps: true }
);

UserSchema.index({ organizationId: 1, role: 1 });

const User: Model<IUserDocument> =
  mongoose.models.User || mongoose.model<IUserDocument>("User", UserSchema);

export default User;
