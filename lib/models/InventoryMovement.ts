import mongoose, { Schema, Document, Model } from "mongoose";
import { MovementType } from "@/lib/types/inventory";

export interface IInventoryMovementDocument extends Document {
  inventoryItemId: mongoose.Types.ObjectId | string;
  sku: string;
  productName: string;
  type: MovementType;
  quantityChange: number;
  previousQuantity: number;
  newQuantity: number;
  fromWarehouse?: string;
  toWarehouse?: string;
  fromShelf?: string;
  toShelf?: string;
  reason: string;
  performedBy: string;
  createdAt: Date;
}

const InventoryMovementSchema = new Schema<IInventoryMovementDocument>(
  {
    inventoryItemId: { type: Schema.Types.ObjectId, ref: "InventoryItem", required: true, index: true },
    sku: { type: String, required: true, index: true },
    productName: { type: String, required: true },
    type: {
      type: String,
      required: true,
      enum: ["ADJUSTMENT", "TRANSFER", "RECEIPT", "SALE", "DAMAGE", "INITIAL_IMPORT"],
      index: true,
    },
    quantityChange: { type: Number, required: true },
    previousQuantity: { type: Number, required: true },
    newQuantity: { type: Number, required: true },
    fromWarehouse: { type: String },
    toWarehouse: { type: String },
    fromShelf: { type: String },
    toShelf: { type: String },
    reason: { type: String, required: true },
    performedBy: { type: String, required: true, default: "System Admin" },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

const InventoryMovement: Model<IInventoryMovementDocument> =
  mongoose.models.InventoryMovement ||
  mongoose.model<IInventoryMovementDocument>("InventoryMovement", InventoryMovementSchema);

export default InventoryMovement;
