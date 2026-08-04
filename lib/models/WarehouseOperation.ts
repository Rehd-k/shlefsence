import mongoose, { Schema, Document, Model } from "mongoose";

// --- RECEIVING ---
export interface IReceivingItem {
  sku: string;
  name: string;
  expectedQty: number;
  receivedQty: number;
  binCode?: string;
  status: "Pending" | "Putaway" | "Discrepancy";
}

export interface IWarehouseReceivingDocument extends Document {
  receiptNumber: string;
  supplierName: string;
  poNumber?: string;
  warehouseId: mongoose.Types.ObjectId | string;
  status: "Pending" | "In-Progress" | "Completed";
  items: IReceivingItem[];
  receivedBy: string;
  createdAt: Date;
  updatedAt: Date;
}

const ReceivingItemSchema = new Schema<IReceivingItem>({
  sku: { type: String, required: true },
  name: { type: String, required: true },
  expectedQty: { type: Number, required: true },
  receivedQty: { type: Number, default: 0 },
  binCode: { type: String },
  status: { type: String, enum: ["Pending", "Putaway", "Discrepancy"], default: "Pending" },
});

const WarehouseReceivingSchema = new Schema<IWarehouseReceivingDocument>(
  {
    receiptNumber: { type: String, required: true, unique: true, index: true },
    supplierName: { type: String, required: true },
    poNumber: { type: String },
    warehouseId: { type: Schema.Types.ObjectId, ref: "Warehouse", required: true, index: true },
    status: { type: String, enum: ["Pending", "In-Progress", "Completed"], default: "Pending" },
    items: [ReceivingItemSchema],
    receivedBy: { type: String, default: "Warehouse Supervisor" },
  },
  { timestamps: true }
);

export const WarehouseReceiving: Model<IWarehouseReceivingDocument> =
  mongoose.models.WarehouseReceiving ||
  mongoose.model<IWarehouseReceivingDocument>("WarehouseReceiving", WarehouseReceivingSchema);

// --- PICKING ---
export interface IPickingItem {
  sku: string;
  name: string;
  binCode: string;
  requestedQty: number;
  pickedQty: number;
  status: "Pending" | "Picked" | "Shortage";
}

export interface IWarehousePickingDocument extends Document {
  ticketNumber: string;
  orderId: string;
  customerName: string;
  warehouseId: mongoose.Types.ObjectId | string;
  status: "Pending" | "Picking" | "Completed";
  assignedPicker?: string;
  items: IPickingItem[];
  createdAt: Date;
  updatedAt: Date;
}

const PickingItemSchema = new Schema<IPickingItem>({
  sku: { type: String, required: true },
  name: { type: String, required: true },
  binCode: { type: String, required: true },
  requestedQty: { type: Number, required: true },
  pickedQty: { type: Number, default: 0 },
  status: { type: String, enum: ["Pending", "Picked", "Shortage"], default: "Pending" },
});

const WarehousePickingSchema = new Schema<IWarehousePickingDocument>(
  {
    ticketNumber: { type: String, required: true, unique: true, index: true },
    orderId: { type: String, required: true },
    customerName: { type: String, required: true },
    warehouseId: { type: Schema.Types.ObjectId, ref: "Warehouse", required: true, index: true },
    status: { type: String, enum: ["Pending", "Picking", "Completed"], default: "Pending" },
    assignedPicker: { type: String, default: "Pick Staff" },
    items: [PickingItemSchema],
  },
  { timestamps: true }
);

export const WarehousePicking: Model<IWarehousePickingDocument> =
  mongoose.models.WarehousePicking ||
  mongoose.model<IWarehousePickingDocument>("WarehousePicking", WarehousePickingSchema);

// --- PACKING ---
export interface IWarehousePackingDocument extends Document {
  packNumber: string;
  pickTicketId: string;
  warehouseId: mongoose.Types.ObjectId | string;
  packageType: "Carton Box Small" | "Carton Box Medium" | "Pallet" | "Bubble Mailer";
  weightKg: number;
  trackingNumber: string;
  status: "Packing" | "Ready for Dispatch" | "Shipped";
  packedBy: string;
  createdAt: Date;
  updatedAt: Date;
}

const WarehousePackingSchema = new Schema<IWarehousePackingDocument>(
  {
    packNumber: { type: String, required: true, unique: true, index: true },
    pickTicketId: { type: String, required: true },
    warehouseId: { type: Schema.Types.ObjectId, ref: "Warehouse", required: true },
    packageType: {
      type: String,
      enum: ["Carton Box Small", "Carton Box Medium", "Pallet", "Bubble Mailer"],
      default: "Carton Box Medium",
    },
    weightKg: { type: Number, default: 1.2 },
    trackingNumber: { type: String, required: true },
    status: { type: String, enum: ["Packing", "Ready for Dispatch", "Shipped"], default: "Packing" },
    packedBy: { type: String, default: "Pack Station 1" },
  },
  { timestamps: true }
);

export const WarehousePacking: Model<IWarehousePackingDocument> =
  mongoose.models.WarehousePacking ||
  mongoose.model<IWarehousePackingDocument>("WarehousePacking", WarehousePackingSchema);

// --- CYCLE COUNT ---
export interface ICycleCountBin {
  binCode: string;
  sku: string;
  productName: string;
  systemQty: number;
  countedQty?: number;
  variance?: number;
  reconciled: boolean;
}

export interface IWarehouseCycleCountDocument extends Document {
  countId: string;
  title: string;
  warehouseId: mongoose.Types.ObjectId | string;
  zoneName: string;
  status: "Draft" | "In-Progress" | "Reconciled";
  counterName: string;
  bins: ICycleCountBin[];
  createdAt: Date;
  updatedAt: Date;
}

const CycleCountBinSchema = new Schema<ICycleCountBin>({
  binCode: { type: String, required: true },
  sku: { type: String, required: true },
  productName: { type: String, required: true },
  systemQty: { type: Number, required: true },
  countedQty: { type: Number },
  variance: { type: Number, default: 0 },
  reconciled: { type: Boolean, default: false },
});

const WarehouseCycleCountSchema = new Schema<IWarehouseCycleCountDocument>(
  {
    countId: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true },
    warehouseId: { type: Schema.Types.ObjectId, ref: "Warehouse", required: true },
    zoneName: { type: String, required: true },
    status: { type: String, enum: ["Draft", "In-Progress", "Reconciled"], default: "Draft" },
    counterName: { type: String, default: "Auditor" },
    bins: [CycleCountBinSchema],
  },
  { timestamps: true }
);

export const WarehouseCycleCount: Model<IWarehouseCycleCountDocument> =
  mongoose.models.WarehouseCycleCount ||
  mongoose.model<IWarehouseCycleCountDocument>("WarehouseCycleCount", WarehouseCycleCountSchema);

// --- TRANSFER ---
export interface ITransferItem {
  sku: string;
  name: string;
  quantity: number;
  sourceBinCode: string;
  targetBinCode?: string;
}

export interface IWarehouseTransferDocument extends Document {
  transferNumber: string;
  sourceWarehouseId: mongoose.Types.ObjectId | string;
  sourceWarehouseName: string;
  targetWarehouseId: mongoose.Types.ObjectId | string;
  targetWarehouseName: string;
  status: "Requested" | "In-Transit" | "Completed" | "Cancelled";
  requestedBy: string;
  items: ITransferItem[];
  createdAt: Date;
  updatedAt: Date;
}

const TransferItemSchema = new Schema<ITransferItem>({
  sku: { type: String, required: true },
  name: { type: String, required: true },
  quantity: { type: Number, required: true },
  sourceBinCode: { type: String, required: true },
  targetBinCode: { type: String },
});

const WarehouseTransferSchema = new Schema<IWarehouseTransferDocument>(
  {
    transferNumber: { type: String, required: true, unique: true, index: true },
    sourceWarehouseId: { type: Schema.Types.ObjectId, ref: "Warehouse", required: true },
    sourceWarehouseName: { type: String, required: true },
    targetWarehouseId: { type: Schema.Types.ObjectId, ref: "Warehouse", required: true },
    targetWarehouseName: { type: String, required: true },
    status: { type: String, enum: ["Requested", "In-Transit", "Completed", "Cancelled"], default: "Requested" },
    requestedBy: { type: String, default: "Logistics Manager" },
    items: [TransferItemSchema],
  },
  { timestamps: true }
);

export const WarehouseTransfer: Model<IWarehouseTransferDocument> =
  mongoose.models.WarehouseTransfer ||
  mongoose.model<IWarehouseTransferDocument>("WarehouseTransfer", WarehouseTransferSchema);
