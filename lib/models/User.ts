import mongoose, { Schema, Document, Model } from "mongoose";

export type UserRole = "Admin" | "Manager" | "Supervisor" | "Sales";

export interface IUserDocument extends Document {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  assignedLocation: string;
  phone?: string;
  status: "Active" | "Inactive";
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUserDocument>(
  {
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
      default: "Main Hub - Lagos",
      required: true,
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

const User: Model<IUserDocument> =
  mongoose.models.User || mongoose.model<IUserDocument>("User", UserSchema);

export default User;
