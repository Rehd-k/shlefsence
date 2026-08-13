import mongoose, { Schema, Document, Model } from "mongoose";
import { StockStatus, QualityGrade } from "@/lib/types/inventory";
import { organizationIdField, type OrganizationId } from "@/lib/tenancy/schema";

export interface IInventoryItemDocument extends Document {
  organizationId: OrganizationId;
  sku: string;
  product: string;
  brand: string;
  phoneModel: string;
  category: string;
  quality: QualityGrade;
  supplier: string;
  warehouse: string;
  shelf: string;
  quantity: number;
  reserved: number;
  available: number;
  cost: number;
  sellingPrice: number;
  status: StockStatus;
  reorderPoint: number;
  barcode: string;
  lastMovedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const InventoryItemSchema = new Schema<IInventoryItemDocument>(
  {
    ...organizationIdField,
    sku: { type: String, required: true, index: true },
    product: { type: String, required: true, index: true },
    brand: { type: String, required: true, index: true },
    phoneModel: { type: String, required: true, index: true },
    category: { type: String, required: true, index: true },
    quality: {
      type: String,
      required: true,
      default: "OEM_ORIGINAL",
      index: true,
    },
    supplier: { type: String, required: true, index: true },
    warehouse: { type: String, required: true, index: true },
    shelf: { type: String, required: true },
    quantity: { type: Number, required: true, default: 0, min: 0 },
    reserved: { type: Number, required: true, default: 0, min: 0 },
    cost: { type: Number, required: true, default: 0 },
    sellingPrice: { type: Number, required: true, default: 0 },
    status: {
      type: String,
      required: true,
      enum: ["IN_STOCK", "LOW_STOCK", "OUT_OF_STOCK", "DEAD_STOCK", "OVERSTOCKED"],
      default: "IN_STOCK",
    },
    reorderPoint: { type: Number, default: 10 },
    barcode: { type: String, required: true },
    lastMovedAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

InventoryItemSchema.index({ organizationId: 1, sku: 1 }, { unique: true });

InventoryItemSchema.virtual("available").get(function (this: IInventoryItemDocument) {
  return Math.max(0, (this.quantity || 0) - (this.reserved || 0));
});

InventoryItemSchema.pre("save", function (this: IInventoryItemDocument) {
  const avail = (this.quantity || 0) - (this.reserved || 0);
  if (this.quantity === 0) {
    this.status = "OUT_OF_STOCK";
  } else if (avail <= (this.reorderPoint || 10)) {
    this.status = "LOW_STOCK";
  } else if (this.status !== "DEAD_STOCK" && this.status !== "OVERSTOCKED") {
    this.status = "IN_STOCK";
  }
});

const InventoryItem: Model<IInventoryItemDocument> =
  mongoose.models.InventoryItem ||
  mongoose.model<IInventoryItemDocument>("InventoryItem", InventoryItemSchema);

export default InventoryItem;
