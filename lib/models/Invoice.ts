import mongoose, { Schema, Document, Model } from "mongoose";
import { OrderType, InvoiceStatus, FulfillmentStatus, PaymentMethod, IInvoiceItem, IPaymentRecord } from "@/lib/types/sales";
import { organizationIdField, type OrganizationId } from "@/lib/tenancy/schema";

export interface IInvoiceDocument extends Document {
  organizationId: OrganizationId;
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
  createdAt: Date;
  updatedAt: Date;
}

const InvoiceItemSchema = new Schema<IInvoiceItem>({
  id: { type: String, required: true },
  productId: { type: String, required: true },
  sku: { type: String, required: true },
  name: { type: String, required: true },
  quality: { type: String, required: true },
  quantity: { type: Number, required: true },
  unitPrice: { type: Number, required: true },
  wholesalePrice: { type: Number },
  discountPercentage: { type: Number, default: 0 },
  lineTotal: { type: Number, required: true },
  warehouseSource: { type: String, required: true },
  image: { type: String },
});

const PaymentRecordSchema = new Schema<IPaymentRecord>({
  id: { type: String, required: true },
  paymentRef: { type: String, required: true },
  invoiceId: { type: String, required: true },
  invoiceNumber: { type: String, required: true },
  customerName: { type: String, required: true },
  amount: { type: Number, required: true },
  method: { type: String, required: true },
  status: { type: String, required: true },
  date: { type: String, required: true },
  notes: { type: String },
  receivedBy: { type: String },
});

const InvoiceSchema = new Schema<IInvoiceDocument>(
  {
    ...organizationIdField,
    invoiceNumber: { type: String, required: true, index: true },
    orderNumber: { type: String, required: true, index: true },
    customerName: { type: String, required: true, index: true },
    customerEmail: { type: String, required: true },
    customerPhone: { type: String },
    customerType: { type: String, required: true },
    issueDate: { type: String, required: true },
    dueDate: { type: String, required: true },
    items: [InvoiceItemSchema],
    subtotal: { type: Number, required: true, default: 0 },
    discountTotal: { type: Number, required: true, default: 0 },
    taxAmount: { type: Number, required: true, default: 0 },
    totalAmount: { type: Number, required: true, default: 0 },
    paidAmount: { type: Number, required: true, default: 0 },
    balanceDue: { type: Number, required: true, default: 0 },
    status: {
      type: String,
      required: true,
      enum: ["Paid", "Partial", "Unpaid", "Overdue", "Draft", "Void"],
      default: "Unpaid",
      index: true,
    },
    fulfillmentStatus: {
      type: String,
      required: true,
      enum: ["Awaiting Dispatch", "Processing", "Dispatched", "Delivered", "Picked Up"],
      default: "Awaiting Dispatch",
      index: true,
    },
    paymentMethod: { type: String, required: true },
    shippingAddress: { type: String },
    warehouse: { type: String, required: true },
    notes: { type: String },
    payments: [PaymentRecordSchema],
  },
  {
    timestamps: true,
  }
);

InvoiceSchema.index({ organizationId: 1, invoiceNumber: 1 }, { unique: true });

const Invoice: Model<IInvoiceDocument> =
  mongoose.models.Invoice || mongoose.model<IInvoiceDocument>("Invoice", InvoiceSchema);

export default Invoice;
