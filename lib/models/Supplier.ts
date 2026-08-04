import mongoose, { Schema, Document, Model } from "mongoose";

export interface ISupplierDocument extends Document {
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

  address: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    addressType?: string;
  };

  contacts: Array<{
    id?: string;
    name: string;
    role: string;
    email: string;
    phone: string;
    isPrimary: boolean;
  }>;

  products: Array<{
    id?: string;
    sku: string;
    name: string;
    category: string;
    unitCost: number;
    moq: number;
    leadTimeDays: number;
  }>;

  performance: {
    overallScore: number;
    qualityPassRate: number;
    onTimeDeliveryRate: number;
    avgDeliveryDays: number;
    defectiveRate: number;
    totalOrdersFulfilled: number;
  };

  documents: Array<{
    id: string;
    title: string;
    type: string;
    fileUrl: string;
    fileSize: string;
    uploadedAt: string;
  }>;

  communications: Array<{
    id: string;
    type: string;
    subject: string;
    summary: string;
    author: string;
    date: string;
  }>;

  createdAt: Date;
  updatedAt: Date;
}

const SupplierSchema = new Schema<ISupplierDocument>(
  {
    code: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true, unique: true, index: true },
    companyName: { type: String, required: true, index: true },
    taxId: { type: String, required: true, default: "N/A" },
    industry: { type: String, required: true, default: "Electronics & Spare Parts" },
    status: {
      type: String,
      enum: ["Preferred", "Active", "Under Review", "Inactive"],
      default: "Active",
      index: true,
    },
    paymentTerms: { type: String, default: "Net 30" },
    creditLimit: { type: Number, default: 50000 },
    outstandingBalance: { type: Number, default: 0 },
    pendingInvoicesCount: { type: Number, default: 0 },
    totalPurchasesValue: { type: Number, default: 0 },
    website: { type: String, default: "https://example.com" },
    rating: { type: String, default: "98.0% Quality" },
    activePOs: { type: Number, default: 0 },
    leadTime: { type: String, default: "4 Days" },

    contact: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },

    address: {
      street: { type: String, default: "100 Logistics Blvd" },
      city: { type: String, default: "Shenzhen" },
      state: { type: String, default: "Guangdong" },
      postalCode: { type: String, default: "518000" },
      country: { type: String, default: "China" },
      addressType: { type: String, default: "Manufacturing HQ" },
    },

    contacts: [
      {
        id: String,
        name: String,
        role: String,
        email: String,
        phone: String,
        isPrimary: Boolean,
      },
    ],

    products: [
      {
        id: String,
        sku: String,
        name: String,
        category: String,
        unitCost: Number,
        moq: Number,
        leadTimeDays: Number,
      },
    ],

    performance: {
      overallScore: { type: Number, default: 98.0 },
      qualityPassRate: { type: Number, default: 99.0 },
      onTimeDeliveryRate: { type: Number, default: 97.0 },
      avgDeliveryDays: { type: Number, default: 4.0 },
      defectiveRate: { type: Number, default: 0.8 },
      totalOrdersFulfilled: { type: Number, default: 42 },
    },

    documents: [Schema.Types.Mixed],
    communications: [Schema.Types.Mixed],
  },
  {
    timestamps: true,
  }
);

if (mongoose.models.Supplier) {
  delete (mongoose.models as any).Supplier;
}

const Supplier: Model<ISupplierDocument> =
  mongoose.models.Supplier || mongoose.model<ISupplierDocument>("Supplier", SupplierSchema);

export default Supplier;
