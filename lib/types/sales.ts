import { QualityGrade } from "./inventory";

export type OrderType = "Wholesale" | "Retail Repair" | "POS Quick Sale" | "Enterprise Tech";
export type InvoiceStatus = "Paid" | "Partial" | "Unpaid" | "Overdue" | "Draft" | "Void";
export type FulfillmentStatus = "Awaiting Dispatch" | "Processing" | "Dispatched" | "Delivered" | "Picked Up";
export type PaymentMethod = "Cash" | "Credit Card" | "Bank Transfer" | "Stripe" | "Credit Line" | "Split Payment";

export interface IInvoiceItem {
  id: string;
  productId: string;
  sku: string;
  name: string;
  quality: QualityGrade;
  quantity: number;
  unitPrice: number;
  wholesalePrice?: number;
  discountPercentage: number;
  lineTotal: number;
  warehouseSource: string;
  image?: string;
}

export interface IPaymentRecord {
  id: string;
  paymentRef: string;
  invoiceId: string;
  invoiceNumber: string;
  customerName: string;
  amount: number;
  method: PaymentMethod;
  status: "Completed" | "Pending Clearing" | "Processing" | "Failed";
  date: string;
  notes?: string;
  receivedBy?: string;
}

export interface IInvoice {
  id: string;
  invoiceNumber: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  customerType: OrderType;
  issueDate: string;
  dueDate: string;
  items: IInvoiceItem[];
  subtotal: number;
  discountTotal: number;
  taxAmount: number;
  totalAmount: number;
  paidAmount: number;
  balanceDue: number;
  status: InvoiceStatus;
  fulfillmentStatus: FulfillmentStatus;
  paymentMethod: PaymentMethod;
  shippingAddress?: string;
  warehouse: string;
  notes?: string;
  payments: IPaymentRecord[];
  createdAt: string;
}

export interface IPOSCatalogItem {
  id: string;
  sku: string;
  name: string;
  brand: string;
  category: string;
  quality: QualityGrade;
  retailPrice: number;
  wholesalePrice: number;
  stock: number;
  image: string;
  barcode: string;
  shelf: string;
  warehouse: string;
}

export interface IPOSCartItem {
  product: IPOSCatalogItem;
  quantity: number;
  unitPrice: number;
  discountPercentage: number;
  lineTotal: number;
}

export interface IReceipt {
  id: string;
  receiptNumber: string;
  invoiceNumber: string;
  customerName: string;
  customerType: OrderType;
  itemsCount: number;
  totalAmount: number;
  paymentMethod: PaymentMethod;
  cashierName: string;
  timestamp: string;
  itemsSummary: string;
  storeName: string;
  storeAddress: string;
}

export interface IWholesaleCustomer {
  id: string;
  name: string;
  companyName: string;
  email: string;
  phone: string;
  tier: "Gold VIP" | "Silver Tier" | "Bronze Tier" | "Standard B2B";
  creditLimit: number;
  usedCredit: number;
  availableCredit: number;
  paymentTerms: "Net 15" | "Net 30" | "Net 60" | "Due on Receipt";
  taxExemptionId?: string;
  totalOrders: number;
  totalSpent: number;
}

export interface SalesDashboardMetrics {
  totalRevenue: number;
  totalRevenueTrend: number;
  grossProfit: number;
  grossProfitMargin: number;
  totalOrders: number;
  totalOrdersTrend: number;
  avgOrderValue: number;
  paidInvoicesTotal: number;
  outstandingInvoicesTotal: number;
  overdueAmount: number;
  wholesaleRevenue: number;
  retailRevenue: number;
  posRevenue: number;
}

export interface DailySalesData {
  date: string;
  dayLabel: string;
  sales: number;
  wholesaleSales: number;
  retailSales: number;
  ordersCount: number;
  target: number;
}

export interface RevenueVsCostData {
  month: string;
  revenue: number;
  cost: number;
  profit: number;
}

export interface ProfitMarginData {
  month: string;
  grossProfit: number;
  netMarginPercentage: number;
  operatingExpenses: number;
}

export interface TopCustomerData {
  id: string;
  name: string;
  type: OrderType;
  totalSpent: number;
  ordersCount: number;
  avgOrderValue: number;
  paymentReliabilityScore: number; // 0-100%
  avatarColor: string;
}

export interface ARAgeingSummary {
  current: number; // 0-30 days
  days31to60: number;
  days61to90: number;
  overdue90Plus: number;
  totalOutstanding: number;
}
