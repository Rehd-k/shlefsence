import mongoose, { Schema, Document, Model } from "mongoose";
import { organizationIdField, type OrganizationId } from "@/lib/tenancy/schema";

// --- ZONE ---
export interface IWarehouseZoneDocument extends Document {
  organizationId: OrganizationId;
  warehouseId: mongoose.Types.ObjectId | string;
  code: string;
  name: string;
  type: "Storage" | "Receiving" | "Picking" | "Packing" | "Quarantine";
  color: string;
  x: number;
  y: number;
  width: number;
  height: number;
  createdAt: Date;
  updatedAt: Date;
}

const WarehouseZoneSchema = new Schema<IWarehouseZoneDocument>(
  {
    ...organizationIdField,
    warehouseId: { type: Schema.Types.ObjectId, ref: "Warehouse", required: true, index: true },
    code: { type: String, required: true, index: true },
    name: { type: String, required: true },
    type: {
      type: String,
      required: true,
      enum: ["Storage", "Receiving", "Picking", "Packing", "Quarantine"],
      default: "Storage",
    },
    color: { type: String, default: "indigo" },
    x: { type: Number, default: 0 },
    y: { type: Number, default: 0 },
    width: { type: Number, default: 2 },
    height: { type: Number, default: 2 },
  },
  { timestamps: true }
);

export const WarehouseZone: Model<IWarehouseZoneDocument> =
  mongoose.models.WarehouseZone || mongoose.model<IWarehouseZoneDocument>("WarehouseZone", WarehouseZoneSchema);

// --- RACK ---
export interface IWarehouseRackDocument extends Document {
  organizationId: OrganizationId;
  zoneId: mongoose.Types.ObjectId | string;
  warehouseId: mongoose.Types.ObjectId | string;
  code: string;
  name: string;
  shelvesCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const WarehouseRackSchema = new Schema<IWarehouseRackDocument>(
  {
    ...organizationIdField,
    zoneId: { type: Schema.Types.ObjectId, ref: "WarehouseZone", required: true, index: true },
    warehouseId: { type: Schema.Types.ObjectId, ref: "Warehouse", required: true, index: true },
    code: { type: String, required: true, index: true },
    name: { type: String, required: true },
    shelvesCount: { type: Number, default: 4 },
  },
  { timestamps: true }
);

export const WarehouseRack: Model<IWarehouseRackDocument> =
  mongoose.models.WarehouseRack || mongoose.model<IWarehouseRackDocument>("WarehouseRack", WarehouseRackSchema);

// --- SHELF ---
export interface IWarehouseShelfDocument extends Document {
  organizationId: OrganizationId;
  rackId: mongoose.Types.ObjectId | string;
  zoneId: mongoose.Types.ObjectId | string;
  warehouseId: mongoose.Types.ObjectId | string;
  code: string;
  name: string;
  binsCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const WarehouseShelfSchema = new Schema<IWarehouseShelfDocument>(
  {
    ...organizationIdField,
    rackId: { type: Schema.Types.ObjectId, ref: "WarehouseRack", required: true, index: true },
    zoneId: { type: Schema.Types.ObjectId, ref: "WarehouseZone", required: true },
    warehouseId: { type: Schema.Types.ObjectId, ref: "Warehouse", required: true },
    code: { type: String, required: true, index: true },
    name: { type: String, required: true },
    binsCount: { type: Number, default: 6 },
  },
  { timestamps: true }
);

export const WarehouseShelf: Model<IWarehouseShelfDocument> =
  mongoose.models.WarehouseShelf || mongoose.model<IWarehouseShelfDocument>("WarehouseShelf", WarehouseShelfSchema);

// --- BIN ---
export interface IBinItem {
  productId?: string;
  sku: string;
  name: string;
  quantity: number;
  lotNumber?: string;
}

export interface IWarehouseBinDocument extends Document {
  organizationId: OrganizationId;
  shelfId: mongoose.Types.ObjectId | string;
  rackId: mongoose.Types.ObjectId | string;
  zoneId: mongoose.Types.ObjectId | string;
  warehouseId: mongoose.Types.ObjectId | string;
  binCode: string;
  maxCapacity: number;
  currentCount: number;
  pickVelocity: "HOT" | "WARM" | "COLD";
  status: "Available" | "Full" | "Quarantine" | "Maintenance";
  x: number;
  y: number;
  items: IBinItem[];
  createdAt: Date;
  updatedAt: Date;
}

const BinItemSchema = new Schema<IBinItem>({
  productId: { type: String },
  sku: { type: String, required: true },
  name: { type: String, required: true },
  quantity: { type: Number, required: true, default: 0 },
  lotNumber: { type: String },
});

const WarehouseBinSchema = new Schema<IWarehouseBinDocument>(
  {
    ...organizationIdField,
    shelfId: { type: Schema.Types.ObjectId, ref: "WarehouseShelf", required: true },
    rackId: { type: Schema.Types.ObjectId, ref: "WarehouseRack", required: true },
    zoneId: { type: Schema.Types.ObjectId, ref: "WarehouseZone", required: true, index: true },
    warehouseId: { type: Schema.Types.ObjectId, ref: "Warehouse", required: true, index: true },
    binCode: { type: String, required: true, index: true },
    maxCapacity: { type: Number, default: 200 },
    currentCount: { type: Number, default: 0 },
    pickVelocity: { type: String, enum: ["HOT", "WARM", "COLD"], default: "WARM" },
    status: { type: String, enum: ["Available", "Full", "Quarantine", "Maintenance"], default: "Available" },
    x: { type: Number, default: 0 },
    y: { type: Number, default: 0 },
    items: [BinItemSchema],
  },
  { timestamps: true }
);

WarehouseBinSchema.index({ organizationId: 1, binCode: 1 }, { unique: true });

export const WarehouseBin: Model<IWarehouseBinDocument> =
  mongoose.models.WarehouseBin || mongoose.model<IWarehouseBinDocument>("WarehouseBin", WarehouseBinSchema);
