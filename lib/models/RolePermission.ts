import mongoose, { Schema, Document, Model } from "mongoose";
import { organizationIdField, type OrganizationId } from "@/lib/tenancy/schema";

export interface IRolePermissionDocument extends Document {
  organizationId: OrganizationId;
  role: string;
  allowedPages: string[];
  allowAllLocations: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const RolePermissionSchema = new Schema<IRolePermissionDocument>(
  {
    ...organizationIdField,
    role: { type: String, required: true, index: true },
    allowedPages: { type: [String], default: [] },
    allowAllLocations: { type: Boolean, default: false },
  },
  { timestamps: true }
);

RolePermissionSchema.index({ organizationId: 1, role: 1 }, { unique: true });

const RolePermission: Model<IRolePermissionDocument> =
  mongoose.models.RolePermission ||
  mongoose.model<IRolePermissionDocument>("RolePermission", RolePermissionSchema);

export default RolePermission;
