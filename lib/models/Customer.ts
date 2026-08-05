import mongoose, { Schema, Document, Model } from "mongoose";
import {
  CustomerType,
  ICustomerAddress,
  ICommunicationLog,
  ITimelineEvent,
  IReturnItem,
} from "@/lib/types/crm";

export interface ICustomerDocument extends Document {
  businessName: string;
  contactName: string;
  customerType: CustomerType;
  email: string;
  phone: string;
  address: ICustomerAddress;
  warehouse: string;
  outstandingDebt: number;
  walletBalance: number;
  creditLimit: number;
  notes?: string;
  tags: string[];
  avatarColor: string;
  status: "Active" | "Inactive" | "On Hold";
  totalSpent: number;
  totalOrders: number;
  communications: ICommunicationLog[];
  timeline: ITimelineEvent[];
  returnsHistory: IReturnItem[];
  createdAt: Date;
  updatedAt: Date;
}

const AddressSchema = new Schema<ICustomerAddress>({
  street: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  zipCode: { type: String, required: true },
  country: { type: String, required: true, default: "USA" },
});

const CommunicationLogSchema = new Schema<ICommunicationLog>({
  id: { type: String, required: true },
  type: {
    type: String,
    required: true,
    enum: ["Email", "Call", "Meeting", "Note", "SMS"],
  },
  subject: { type: String, required: true },
  content: { type: String, required: true },
  loggedBy: { type: String, required: true },
  date: { type: String, required: true },
});

const TimelineEventSchema = new Schema<ITimelineEvent>({
  id: { type: String, required: true },
  type: {
    type: String,
    required: true,
    enum: ["order", "payment", "warranty", "return", "communication", "wallet", "credit"],
  },
  title: { type: String, required: true },
  description: { type: String, required: true },
  amount: { type: Number },
  badge: { type: String },
  date: { type: String, required: true },
});

const ReturnItemSchema = new Schema<IReturnItem>({
  id: { type: String, required: true },
  rmaNumber: { type: String, required: true },
  date: { type: String, required: true },
  partName: { type: String, required: true },
  reason: { type: String, required: true },
  status: {
    type: String,
    required: true,
    enum: ["Approved", "Pending", "Rejected", "Processed"],
    default: "Pending",
  },
  amount: { type: Number, required: true },
  quantity: { type: Number, required: true },
});

const CustomerSchema = new Schema<ICustomerDocument>(
  {
    businessName: { type: String, required: true, index: true },
    contactName: { type: String, required: true, index: true },
    customerType: {
      type: String,
      required: true,
      enum: ["Repair Shop", "Retail", "Distributor"],
      default: "Repair Shop",
      index: true,
    },
    email: { type: String, required: true, unique: true, index: true },
    phone: { type: String, required: true },
    address: { type: AddressSchema, required: true },
    warehouse: { type: String, index: true, default: "Main Hub - Lagos" },
    outstandingDebt: { type: Number, required: true, default: 0 },
    walletBalance: { type: Number, required: true, default: 0 },
    creditLimit: { type: Number, required: true, default: 0 },
    notes: { type: String },
    tags: [{ type: String }],
    avatarColor: { type: String, default: "bg-indigo-600" },
    status: {
      type: String,
      required: true,
      enum: ["Active", "Inactive", "On Hold"],
      default: "Active",
      index: true,
    },
    totalSpent: { type: Number, required: true, default: 0 },
    totalOrders: { type: Number, required: true, default: 0 },
    communications: [CommunicationLogSchema],
    timeline: [TimelineEventSchema],
    returnsHistory: [ReturnItemSchema],
  },
  {
    timestamps: true,
  }
);

const Customer: Model<ICustomerDocument> =
  mongoose.models.Customer || mongoose.model<ICustomerDocument>("Customer", CustomerSchema);

export default Customer;
