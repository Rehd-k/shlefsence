export interface ISupplierContact {
  id?: string;
  name: string;
  role: string;
  email: string;
  phone: string;
  isPrimary: boolean;
}

export interface ISupplierAddress {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  addressType?: string;
}

export interface ISupplierProduct {
  id?: string;
  sku: string;
  name: string;
  category: string;
  unitCost: number;
  moq: number; // Minimum Order Quantity
  leadTimeDays: number;
}

export interface ISupplierPerformance {
  overallScore: number; // Percentage e.g. 98.5
  qualityPassRate: number; // Percentage e.g. 99.2
  onTimeDeliveryRate: number; // Percentage e.g. 96.8
  avgDeliveryDays: number; // Days e.g. 4.2
  defectiveRate: number; // Percentage e.g. 0.8
  totalOrdersFulfilled: number;
}

export interface ISupplierDocumentItem {
  id: string;
  title: string;
  type: "Contract" | "ISO Certification" | "Tax Form" | "NDA" | "Price List" | "Compliance";
  fileUrl: string;
  fileSize: string;
  uploadedAt: string;
}

export interface ISupplierCommunicationLog {
  id: string;
  type: "Email" | "Call" | "Meeting" | "Note";
  subject: string;
  summary: string;
  author: string;
  date: string;
}

export interface ISupplierWarrantySummary {
  totalClaims: number;
  openClaims: number;
  totalRefunded: number;
  defectRatePercentage: number;
}

export interface ISupplier {
  id?: string;
  _id?: string;
  code: string;
  name: string;
  companyName: string;
  taxId: string;
  industry: string;
  status: "Preferred" | "Active" | "Under Review" | "Inactive";
  paymentTerms: string;
  creditLimit: number;
  outstandingBalance: number;
  pendingInvoicesCount: number;
  totalPurchasesValue: number;
  website: string;
  rating: string;
  activePOs: number;
  leadTime: string;

  contact: string;
  email: string;
  phone: string;
  
  address: ISupplierAddress;
  contacts: ISupplierContact[];
  products: ISupplierProduct[];
  performance: ISupplierPerformance;
  documents: ISupplierDocumentItem[];
  communications: ISupplierCommunicationLog[];
  warrantySummary?: ISupplierWarrantySummary;
  purchaseOrders?: any[];
  warrantyClaims?: any[];
  
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface ISupplierKPIs {
  totalPurchases: number;
  outstandingBalance: number;
  averageDeliveryTime: number;
  defectiveRate: number;
  activeSuppliersCount: number;
  totalSuppliersCount: number;
}
