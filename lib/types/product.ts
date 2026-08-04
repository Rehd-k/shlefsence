import { StockStatus, QualityGrade } from "./inventory";

export interface IWarehouseStock {
  warehouse: string;
  shelf: string;
  quantity: number;
  reserved: number;
  available: number;
  reorderPoint: number;
}

export interface IPricingTier {
  minQty: number;
  price: number;
  discountPercentage: number;
}

export interface IPhoneCompatibility {
  modelName: string;
  brand: string;
  year: number;
  modelNumbers: string[];
  notes?: string;
}

export interface IPurchaseRecord {
  poNumber: string;
  supplier: string;
  orderDate: string;
  receiveDate: string;
  quantity: number;
  unitCost: number;
  totalCost: number;
  status: "Received" | "Pending" | "In Transit";
}

export interface ISalesRecord {
  soNumber: string;
  customerName: string;
  customerType: string;
  saleDate: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface IWarrantyLog {
  rmaNumber: string;
  customerName: string;
  claimDate: string;
  defectType: string;
  resolution: "Replaced" | "Refunded" | "Rejected" | "Pending Lab Test";
  notes: string;
}

export interface IProductImage {
  id: string;
  url: string;
  title: string;
  isPrimary?: boolean;
}

export interface IProductNote {
  id: string;
  author: string;
  role: string;
  content: string;
  createdAt: string;
  isWarning?: boolean;
}

export interface IProduct {
  id: string;
  sku: string;
  name: string;
  image: string;
  barcode: string;
  brand: string;
  compatibleModels: string[];
  quality: QualityGrade;
  category: string;
  supplier: string;
  purchasePrice: number; // Cost price
  sellingPrice: number;  // Retail selling price
  wholesalePrice: number; // B2B wholesale price
  warranty: string;      // e.g. "12 Months OEM Warranty"
  warehouse: string;
  shelf: string;
  stock: {
    total: number;
    available: number;
    reserved: number;
    reorderPoint: number;
    status: StockStatus;
  };
  // Detailed Tab Data
  warehouseStocks?: IWarehouseStock[];
  pricingTiers?: IPricingTier[];
  compatibilities?: IPhoneCompatibility[];
  purchaseHistory?: IPurchaseRecord[];
  salesHistory?: ISalesRecord[];
  warrantyLogs?: IWarrantyLog[];
  images?: IProductImage[];
  notes?: IProductNote[];
  createdAt: string;
  updatedAt: string;
}
