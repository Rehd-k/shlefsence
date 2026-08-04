import mongoose, { Schema, Document, Model } from "mongoose";
import { StockStatus, QualityGrade } from "@/lib/types/inventory";
import {
  IWarehouseStock,
  IPricingTier,
  IPhoneCompatibility,
  IPurchaseRecord,
  ISalesRecord,
  IWarrantyLog,
  IProductImage,
  IProductNote,
} from "@/lib/types/product";

export interface IProductDocument extends Document {
  sku: string;
  name: string;
  image: string;
  barcode: string;
  brand: string;
  compatibleModels: string[];
  quality: QualityGrade;
  category: string;
  supplier: string;
  purchasePrice: number;
  sellingPrice: number;
  wholesalePrice: number;
  warranty: string;
  warehouse: string;
  shelf: string;
  stock: {
    total: number;
    available: number;
    reserved: number;
    reorderPoint: number;
    status: StockStatus;
  };
  warehouseStocks?: IWarehouseStock[];
  pricingTiers?: IPricingTier[];
  compatibilities?: IPhoneCompatibility[];
  purchaseHistory?: IPurchaseRecord[];
  salesHistory?: ISalesRecord[];
  warrantyLogs?: IWarrantyLog[];
  images?: IProductImage[];
  notes?: IProductNote[];
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema = new Schema<IProductDocument>(
  {
    sku: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true, index: true },
    image: { type: String, default: "" },
    barcode: { type: String, required: true, index: true },
    brand: { type: String, required: true, index: true },
    compatibleModels: [{ type: String }],
    quality: {
      type: String,
      required: true,
      enum: ["OEM_ORIGINAL", "SERVICE_PACK", "REFURBISHED_A", "PREMIUM_AFTERMARKET"],
      default: "OEM_ORIGINAL",
    },
    category: { type: String, required: true, index: true },
    supplier: { type: String, required: true, index: true },
    purchasePrice: { type: Number, required: true, default: 0 },
    sellingPrice: { type: Number, required: true, default: 0 },
    wholesalePrice: { type: Number, required: true, default: 0 },
    warranty: { type: String, default: "12 Months OEM Warranty" },
    warehouse: { type: String, required: true },
    shelf: { type: String, required: true },
    stock: {
      total: { type: Number, required: true, default: 0 },
      available: { type: Number, required: true, default: 0 },
      reserved: { type: Number, required: true, default: 0 },
      reorderPoint: { type: Number, default: 10 },
      status: {
        type: String,
        enum: ["IN_STOCK", "LOW_STOCK", "OUT_OF_STOCK", "DEAD_STOCK", "OVERSTOCKED"],
        default: "IN_STOCK",
      },
    },
    warehouseStocks: [
      {
        warehouse: String,
        shelf: String,
        quantity: Number,
        reserved: Number,
        available: Number,
        reorderPoint: Number,
      },
    ],
    pricingTiers: [
      {
        minQty: Number,
        price: Number,
        discountPercentage: Number,
      },
    ],
    compatibilities: [
      {
        modelName: String,
        brand: String,
        year: Number,
        modelNumbers: [String],
        notes: String,
      },
    ],
    purchaseHistory: [
      {
        poNumber: String,
        supplier: String,
        orderDate: String,
        receiveDate: String,
        quantity: Number,
        unitCost: Number,
        totalCost: Number,
        status: String,
      },
    ],
    salesHistory: [
      {
        soNumber: String,
        customerName: String,
        customerType: String,
        saleDate: String,
        quantity: Number,
        unitPrice: Number,
        totalPrice: Number,
      },
    ],
    warrantyLogs: [
      {
        rmaNumber: String,
        customerName: String,
        claimDate: String,
        defectType: String,
        resolution: String,
        notes: String,
      },
    ],
    images: [
      {
        id: String,
        url: String,
        title: String,
        isPrimary: Boolean,
      },
    ],
    notes: [
      {
        id: String,
        author: String,
        role: String,
        content: String,
        createdAt: String,
        isWarning: Boolean,
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Product: Model<IProductDocument> =
  mongoose.models.Product || mongoose.model<IProductDocument>("Product", ProductSchema);

export default Product;
