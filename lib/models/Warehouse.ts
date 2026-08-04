import mongoose, { Schema, Document, Model } from "mongoose";

export interface IWarehouseDocument extends Document {
  code: string;
  name: string;
  type: "Main Hub" | "Regional Depot" | "Retail Branch";
  address: string;
  skusCount: number;
  capacity: string;
  manager: string;
  totalZones?: number;
  totalBins?: number;
  occupiedBins?: number;
  createdAt: Date;
  updatedAt: Date;
}

const WarehouseSchema = new Schema<IWarehouseDocument>(
  {
    code: { type: String, required: true, default: "WH-01" },
    name: { type: String, required: true, unique: true, index: true },
    type: {
      type: String,
      enum: ["Main Hub", "Regional Depot", "Retail Branch"],
      default: "Main Hub",
    },
    address: { type: String, required: true },
    skusCount: { type: Number, default: 0 },
    capacity: { type: String, default: "50% Full" },
    manager: { type: String, required: true },
    totalZones: { type: Number, default: 4 },
    totalBins: { type: Number, default: 96 },
    occupiedBins: { type: Number, default: 62 },
  },
  {
    timestamps: true,
  }
);

const Warehouse: Model<IWarehouseDocument> =
  mongoose.models.Warehouse || mongoose.model<IWarehouseDocument>("Warehouse", WarehouseSchema);

export default Warehouse;
