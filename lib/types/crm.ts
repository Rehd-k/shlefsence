export type CustomerType = "Repair Shop" | "Retail" | "Distributor";

export interface ICustomerAddress {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export type CommunicationType = "Email" | "Call" | "Meeting" | "Note" | "SMS";

export interface ICommunicationLog {
  id: string;
  type: CommunicationType;
  subject: string;
  content: string;
  loggedBy: string;
  date: string;
}

export type TimelineEventType =
  | "order"
  | "payment"
  | "warranty"
  | "return"
  | "communication"
  | "wallet"
  | "credit";

export interface ITimelineEvent {
  id: string;
  type: TimelineEventType;
  title: string;
  description: string;
  amount?: number;
  badge?: string;
  date: string;
}

export type ReturnStatus = "Approved" | "Pending" | "Rejected" | "Processed";

export interface IReturnItem {
  id: string;
  rmaNumber: string;
  date: string;
  partName: string;
  reason: string;
  status: ReturnStatus;
  amount: number;
  quantity: number;
}

export interface ICustomer {
  id: string;
  businessName: string;
  contactName: string;
  customerType: CustomerType;
  email: string;
  phone: string;
  address: ICustomerAddress;
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
  createdAt?: string;
  updatedAt?: string;
}
