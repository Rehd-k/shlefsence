import { StockStatus, QualityGrade } from "./inventory";

export interface DashboardHealthMetrics {
  revenueToday: {
    amount: number;
    trendPercentage: number;
    comparedTo: string;
    target: number;
  };
  revenueMonth: {
    amount: number;
    trendPercentage: number;
    comparedTo: string;
    target: number;
  };
  grossProfit: {
    amount: number;
    marginPercentage: number;
    trendPercentage: number;
  };
  inventoryValue: {
    totalValue: number;
    totalCost: number;
    potentialProfit: number;
  };
  outstandingDebts: {
    amount: number;
    overdueAmount: number;
    customerCount: number;
  };
  supplierPayables: {
    amount: number;
    dueIn7Days: number;
    supplierCount: number;
  };
  lowStockAlerts: {
    count: number;
    criticalCount: number;
  };
  outOfStockItems: {
    count: number;
    lostRevenueEst: number;
  };
  pendingPOs: {
    count: number;
    totalValue: number;
    expectedToday: number;
  };
  awaitingDispatch: {
    count: number;
    urgentCount: number;
    totalValue: number;
  };
  warrantyClaims: {
    count: number;
    pendingInspection: number;
    approvedRate: number;
  };
  recentSales: {
    countToday: number;
    avgOrderValue: number;
  };
  recentPurchases: {
    countThisWeek: number;
    totalSpend: number;
  };
}

export interface DailySalesPoint {
  date: string;
  dayLabel: string;
  sales: number;
  orders: number;
  target: number;
}

export interface MonthlyRevenuePoint {
  month: string;
  revenue: number;
  cost: number;
  grossProfit: number;
}

export interface CategorySalesPoint {
  category: string;
  sales: number;
  percentage: number;
  itemCount: number;
  color: string;
}

export interface BrandSalesPoint {
  brand: string;
  sales: number;
  unitsSold: number;
  marketShare: number;
}

export interface PhoneModelSalesPoint {
  model: string;
  brand: string;
  unitsSold: number;
  revenue: number;
  growthRate: number;
}

export interface LatestOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  customerType: "Wholesale" | "Retail Repair" | "Enterprise Tech";
  itemsCount: number;
  totalAmount: number;
  paymentStatus: "Paid" | "Partial" | "Unpaid" | "Overdue";
  fulfillmentStatus: "Awaiting Dispatch" | "Processing" | "Dispatched" | "Delivered";
  createdAt: string;
}

export interface LowStockProduct {
  id: string;
  sku: string;
  productName: string;
  brand: string;
  phoneModel: string;
  quality: QualityGrade;
  currentStock: number;
  reorderPoint: number;
  warehouseBin: string;
  estRestockDays: number;
}

export interface RecentPayment {
  id: string;
  paymentRef: string;
  customerName: string;
  invoiceRef: string;
  amount: number;
  paymentMethod: "Bank Transfer" | "Credit Card" | "Credit Line" | "Stripe";
  status: "Completed" | "Pending Clearing" | "Processing";
  date: string;
}
