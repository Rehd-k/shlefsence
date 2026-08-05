export type StockStatus = "IN_STOCK" | "LOW_STOCK" | "OUT_OF_STOCK" | "DEAD_STOCK" | "OVERSTOCKED";

export type QualityGrade = string;

export type MovementType = "ADJUSTMENT" | "TRANSFER" | "RECEIPT" | "SALE" | "DAMAGE" | "INITIAL_IMPORT";

export interface IInventoryItem {
  _id: string;
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
  available: number; // Computed (quantity - reserved)
  cost: number;
  sellingPrice: number;
  status: StockStatus;
  reorderPoint: number;
  barcode: string;
  lastMovedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface IInventoryMovement {
  _id: string;
  inventoryItemId: string;
  sku: string;
  productName: string;
  type: MovementType;
  quantityChange: number; // e.g., +25, -10
  previousQuantity: number;
  newQuantity: number;
  fromWarehouse?: string;
  toWarehouse?: string;
  fromShelf?: string;
  toShelf?: string;
  reason: string;
  performedBy: string;
  createdAt: string;
}

export interface InventorySummary {
  totalStock: {
    units: number;
    skus: number;
    trendPercentage: number;
  };
  inventoryValue: {
    totalValue: number;
    totalCost: number;
    potentialProfit: number;
  };
  lowStock: {
    count: number;
    criticalCount: number;
  };
  deadStock: {
    count: number;
    tiedCapital: number;
  };
  incomingStock: {
    units: number;
    expectedPOs: number;
  };
}

export interface InventoryFilterOptions {
  search: string;
  warehouse: string;
  brand: string;
  supplier: string;
  category: string;
  quality: string;
  status: string;
}
