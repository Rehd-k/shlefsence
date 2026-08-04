import mongoose, { Schema, Document, Model } from "mongoose";

export interface IRolePermissionDocument extends Document {
  role: string; // "Manager" | "Supervisor" | "Sales" (or "Admin", though Admin has full access by default)
  allowedPages: string[]; // e.g. ["dashboard", "crm", "products", "inventory", "sales", "purchase-orders", "suppliers", "warehouses", "warranty", "settings"]
  allowAllLocations: boolean; // default false for Supervisor & Sales
  createdAt: Date;
  updatedAt: Date;
}

const RolePermissionSchema = new Schema<IRolePermissionDocument>(
  {
    role: { type: String, required: true, unique: true, index: true },
    allowedPages: { type: [String], default: [] },
    allowAllLocations: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const RolePermission: Model<IRolePermissionDocument> =
  mongoose.models.RolePermission ||
  mongoose.model<IRolePermissionDocument>("RolePermission", RolePermissionSchema);

export default RolePermission;
