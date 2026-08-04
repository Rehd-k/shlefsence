"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Building2,
  User,
  Mail,
  Phone,
  MapPin,
  DollarSign,
  CreditCard,
  History,
  ShieldCheck,
  RotateCcw,
  MessageSquare,
  Clock,
  Plus,
  Send,
  AlertCircle,
  FileText,
  BadgeAlert,
  Wallet,
  TrendingUp,
  Tag,
  CheckCircle2,
} from "lucide-react";
import { ICustomer, CommunicationType } from "@/lib/types/crm";

interface CustomerProfileModalProps {
  customer: ICustomer | null;
  isOpen: boolean;
  onClose: () => void;
  onCustomerUpdated: (updated: ICustomer) => void;
}

export const CustomerProfileModal: React.FC<CustomerProfileModalProps> = ({
  customer,
  isOpen,
  onClose,
  onCustomerUpdated,
}) => {
  const [activeTab, setActiveTab] = useState<
    "overview" | "timeline" | "purchases" | "warranty" | "returns" | "communication"
  >("overview");

  const [customerData, setCustomerData] = useState<ICustomer | null>(customer);
  const [purchaseHistory, setPurchaseHistory] = useState<any[]>([]);
  const [warrantyHistory, setWarrantyHistory] = useState<any[]>([]);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // Quick Action Modal states (Wallet, Debt, Credit)
  const [walletModalOpen, setWalletModalOpen] = useState(false);
  const [walletAmount, setWalletAmount] = useState("");
  const [debtModalOpen, setDebtModalOpen] = useState(false);
  const [debtAmount, setDebtAmount] = useState("");
  const [creditModalOpen, setCreditModalOpen] = useState(false);
  const [creditLimitInput, setCreditLimitInput] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  // New Communication Form state
  const [commType, setCommType] = useState<CommunicationType>("Call");
  const [commSubject, setCommSubject] = useState("");
  const [commContent, setCommContent] = useState("");
  const [commLoading, setCommLoading] = useState(false);
  const [commSuccess, setCommSuccess] = useState(false);

  useEffect(() => {
    if (customer && isOpen) {
      setCustomerData(customer);
      fetchCustomerFullData(customer.id);
    }
  }, [customer, isOpen]);

  const fetchCustomerFullData = async (id: string) => {
    setLoadingDetails(true);
    try {
      const res = await fetch(`/api/crm/customers/${id}`);
      const json = await res.json();
      if (json.success && json.data) {
        setCustomerData(json.data.customer);
        setPurchaseHistory(json.data.purchaseHistory || []);
        setWarrantyHistory(json.data.warrantyHistory || []);
        setCreditLimitInput(json.data.customer.creditLimit?.toString() || "0");
      }
    } catch (err) {
      console.error("Error fetching detailed customer profile:", err);
    } finally {
      setLoadingDetails(false);
    }
  };

  if (!isOpen || !customerData) return null;

  // Financial calculations
  const debt = customerData.outstandingDebt || 0;
  const wallet = customerData.walletBalance || 0;
  const creditLimit = customerData.creditLimit || 0;
  const availableCredit = Math.max(0, creditLimit - debt);
  const creditUsagePct = creditLimit > 0 ? Math.min(100, Math.round((debt / creditLimit) * 100)) : 0;

  // Handle Wallet Deposit / Deduction
  const handleWalletSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(walletAmount);
    if (isNaN(amount) || amount === 0) return;

    setActionLoading(true);
    try {
      const res = await fetch(`/api/crm/customers/${customerData.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ walletAdjustment: amount }),
      });
      const json = await res.json();
      if (json.success && json.data) {
        setCustomerData(json.data);
        onCustomerUpdated(json.data);
        setWalletModalOpen(false);
        setWalletAmount("");
      }
    } catch (err) {
      console.error("Wallet update error:", err);
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Debt Settlement
  const handleDebtSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(debtAmount);
    if (isNaN(amount) || amount <= 0) return;

    setActionLoading(true);
    try {
      const res = await fetch(`/api/crm/customers/${customerData.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ debtSettlement: amount }),
      });
      const json = await res.json();
      if (json.success && json.data) {
        setCustomerData(json.data);
        onCustomerUpdated(json.data);
        setDebtModalOpen(false);
        setDebtAmount("");
      }
    } catch (err) {
      console.error("Debt settlement error:", err);
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Credit Limit Update
  const handleCreditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const limit = parseFloat(creditLimitInput);
    if (isNaN(limit)) return;

    setActionLoading(true);
    try {
      const res = await fetch(`/api/crm/customers/${customerData.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ creditLimit: limit }),
      });
      const json = await res.json();
      if (json.success && json.data) {
        setCustomerData(json.data);
        onCustomerUpdated(json.data);
        setCreditModalOpen(false);
      }
    } catch (err) {
      console.error("Credit limit update error:", err);
    } finally {
      setActionLoading(false);
    }
  };

  // Handle New Communication Submission
  const handleCommSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commSubject.trim() || !commContent.trim()) return;

    setCommLoading(true);
    try {
      const res = await fetch(`/api/crm/customers/${customerData.id}/communications`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: commType,
          subject: commSubject,
          content: commContent,
          loggedBy: "Alex Rivers",
        }),
      });

      const json = await res.json();
      if (json.success && json.data) {
        setCustomerData(json.data);
        onCustomerUpdated(json.data);
        setCommSubject("");
        setCommContent("");
        setCommSuccess(true);
        setTimeout(() => setCommSuccess(false), 3000);
      }
    } catch (err) {
      console.error("Error logging communication:", err);
    } finally {
      setCommLoading(false);
    }
  };

  const getCustomerTypeBadge = (type: string) => {
    switch (type) {
      case "Repair Shop":
        return "bg-indigo-100 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800";
      case "Retail":
        return "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800";
      case "Distributor":
        return "bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200 dark:border-purple-800";
      default:
        return "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300";
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col h-[90vh]">
        {/* TOP PROFILE BANNER */}
        <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-800 bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-4">
            <div
              className={`w-14 h-14 rounded-2xl ${
                customerData.avatarColor || "bg-indigo-600"
              } flex items-center justify-center font-extrabold text-white text-xl shadow-lg border border-white/20 shrink-0`}
            >
              {customerData.businessName.substring(0, 2).toUpperCase()}
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl font-bold tracking-tight text-white">{customerData.businessName}</h1>
                <span
                  className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${getCustomerTypeBadge(
                    customerData.customerType
                  )}`}
                >
                  {customerData.customerType}
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                    customerData.status === "Active"
                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                      : customerData.status === "On Hold"
                      ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                      : "bg-slate-500/20 text-slate-300 border border-slate-500/30"
                  }`}
                >
                  ● {customerData.status}
                </span>
              </div>

              <div className="flex items-center gap-4 text-xs text-slate-300 mt-1 flex-wrap">
                <span className="flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-indigo-400" /> {customerData.contactName}
                </span>
                <span className="flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-indigo-400" /> {customerData.email}
                </span>
                <span className="flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-indigo-400" /> {customerData.phone}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setWalletModalOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-indigo-600/30 transition cursor-pointer"
            >
              <Wallet className="w-3.5 h-3.5" /> + Wallet Funds
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* TABS HEADER */}
        <div className="px-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 flex items-center gap-2 overflow-x-auto shrink-0">
          {[
            { key: "overview", label: "Overview & Ledger", icon: Building2 },
            { key: "timeline", label: "Customer Timeline", icon: Clock, count: customerData.timeline?.length },
            { key: "purchases", label: "Purchase History", icon: History, count: purchaseHistory.length },
            { key: "warranty", label: "Warranty History", icon: ShieldCheck, count: warrantyHistory.length },
            { key: "returns", label: "Returns Ledger", icon: RotateCcw, count: customerData.returnsHistory?.length },
            {
              key: "communication",
              label: "Communication Log",
              icon: MessageSquare,
              count: customerData.communications?.length,
            },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`py-3 px-3.5 text-xs font-bold border-b-2 flex items-center gap-2 transition whitespace-nowrap cursor-pointer ${
                  isActive
                    ? "border-indigo-600 text-indigo-600 dark:text-indigo-400"
                    : "border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                {tab.count !== undefined && tab.count > 0 && (
                  <span
                    className={`px-1.5 py-0.2 text-[10px] rounded-full font-extrabold ${
                      isActive
                        ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300"
                        : "bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* TAB CONTENTS CONTAINER */}
        <div className="flex-1 overflow-y-auto p-6 text-xs">
          {/* TAB 1: OVERVIEW & LEDGER */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              {/* Financial KPI Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Debt Card */}
                <div className="p-4 rounded-2xl bg-rose-50/60 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/60 flex flex-col justify-between space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-rose-700 dark:text-rose-400">Outstanding Debt</span>
                    <BadgeAlert className="w-4 h-4 text-rose-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-extrabold text-rose-700 dark:text-rose-300">
                      ${debt.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </p>
                    <p className="text-[10px] text-rose-600/80 dark:text-rose-400/80">Unpaid Invoice Balance</p>
                  </div>
                  <button
                    onClick={() => setDebtModalOpen(true)}
                    className="w-full py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition cursor-pointer"
                  >
                    Settle Account Debt
                  </button>
                </div>

                {/* Wallet Card */}
                <div className="p-4 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-900/60 flex flex-col justify-between space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-indigo-700 dark:text-indigo-400">Store Credit Wallet</span>
                    <Wallet className="w-4 h-4 text-indigo-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-extrabold text-indigo-700 dark:text-indigo-300">
                      ${wallet.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </p>
                    <p className="text-[10px] text-indigo-600/80 dark:text-indigo-400/80">Prepaid Account Balance</p>
                  </div>
                  <button
                    onClick={() => setWalletModalOpen(true)}
                    className="w-full py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition cursor-pointer"
                  >
                    Deposit Funds
                  </button>
                </div>

                {/* Credit Limit Card */}
                <div className="p-4 rounded-2xl bg-purple-50/60 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-900/60 flex flex-col justify-between space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-purple-700 dark:text-purple-400">Revolving Credit Limit</span>
                    <CreditCard className="w-4 h-4 text-purple-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-extrabold text-purple-700 dark:text-purple-300">
                      ${creditLimit.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </p>
                    <div className="w-full bg-purple-200 dark:bg-purple-900/60 h-1.5 rounded-full mt-1.5 overflow-hidden">
                      <div
                        className="bg-purple-600 h-full rounded-full transition-all"
                        style={{ width: `${creditUsagePct}%` }}
                      />
                    </div>
                    <p className="text-[10px] text-purple-600/80 dark:text-purple-400/80 mt-1">
                      ${availableCredit.toLocaleString("en-US")} Available
                    </p>
                  </div>
                  <button
                    onClick={() => setCreditModalOpen(true)}
                    className="w-full py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs transition cursor-pointer"
                  >
                    Adjust Credit Line
                  </button>
                </div>

                {/* Total Lifetime Value Card */}
                <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/60 flex flex-col justify-between space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-emerald-700 dark:text-emerald-400">Lifetime Revenue</span>
                    <TrendingUp className="w-4 h-4 text-emerald-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-extrabold text-emerald-700 dark:text-emerald-300">
                      ${(customerData.totalSpent || 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </p>
                    <p className="text-[10px] text-emerald-600/80 dark:text-emerald-400/80">
                      {customerData.totalOrders || 0} Total Orders Placed
                    </p>
                  </div>
                  <div className="py-1 px-2.5 bg-emerald-100 dark:bg-emerald-900/40 rounded-lg text-emerald-800 dark:text-emerald-300 font-bold text-center text-[11px]">
                    Net Terms: {customerData.tags?.find((t) => t.includes("Net")) || "Standard B2B"}
                  </div>
                </div>
              </div>

              {/* Account Details & Address */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-3">
                  <h3 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-indigo-500" /> Corporate & Shipping Address
                  </h3>
                  <div className="space-y-1 text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
                    <p className="font-bold text-slate-900 dark:text-white">{customerData.businessName}</p>
                    <p>{customerData.address?.street}</p>
                    <p>
                      {customerData.address?.city}, {customerData.address?.state} {customerData.address?.zipCode}
                    </p>
                    <p className="text-slate-400">{customerData.address?.country || "United States"}</p>
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-3">
                  <h3 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider flex items-center gap-2">
                    <Tag className="w-4 h-4 text-indigo-500" /> CRM Account Tags & Notes
                  </h3>
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {customerData.tags?.map((t) => (
                      <span
                        key={t}
                        className="px-2.5 py-1 rounded-lg bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 font-bold text-[11px]"
                      >
                        #{t}
                      </span>
                    ))}
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 italic bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                    "{customerData.notes || "No additional account notes attached."}"
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: CUSTOMER TIMELINE */}
          {activeTab === "timeline" && (
            <div className="space-y-4">
              <h3 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider flex items-center gap-2">
                <Clock className="w-4 h-4 text-indigo-500" /> Chronological Customer Activity Feed
              </h3>

              {!customerData.timeline || customerData.timeline.length === 0 ? (
                <p className="text-slate-400 py-8 text-center">No activity timeline recorded yet.</p>
              ) : (
                <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
                  {customerData.timeline.map((event) => (
                    <div key={event.id} className="relative flex items-start gap-4 group">
                      <div className="absolute -left-6 top-1 w-5 h-5 rounded-full bg-indigo-600 border-2 border-white dark:border-slate-900 flex items-center justify-center text-white text-[10px] shadow-sm">
                        ●
                      </div>
                      <div className="flex-1 bg-slate-50 dark:bg-slate-800/40 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800">
                        <div className="flex items-center justify-between gap-2 flex-wrap mb-1">
                          <span className="font-bold text-slate-900 dark:text-white text-xs">{event.title}</span>
                          <div className="flex items-center gap-2">
                            {event.badge && (
                              <span className="px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 font-bold text-[10px]">
                                {event.badge}
                              </span>
                            )}
                            <span className="text-[10px] text-slate-400 font-medium">
                              {new Date(event.date).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>
                        </div>
                        <p className="text-slate-600 dark:text-slate-300">{event.description}</p>
                        {event.amount !== undefined && (
                          <p className="mt-1 font-bold text-indigo-600 dark:text-indigo-400 text-xs">
                            Amount: ${event.amount.toFixed(2)}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: PURCHASE HISTORY */}
          {activeTab === "purchases" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider flex items-center gap-2">
                  <History className="w-4 h-4 text-indigo-500" /> Invoices & Sales Orders ({purchaseHistory.length})
                </h3>
              </div>

              {purchaseHistory.length === 0 ? (
                <div className="p-8 text-center text-slate-400">
                  No sales orders or invoices linked to this customer yet.
                </div>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 font-bold text-[11px]">
                      <tr>
                        <th className="py-2.5 px-3">Invoice #</th>
                        <th className="py-2.5 px-3">Date</th>
                        <th className="py-2.5 px-3">Items</th>
                        <th className="py-2.5 px-3">Total Amount</th>
                        <th className="py-2.5 px-3">Status</th>
                        <th className="py-2.5 px-3">Fulfillment</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {purchaseHistory.map((inv) => (
                        <tr key={inv.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                          <td className="py-2.5 px-3 font-bold text-indigo-600 dark:text-indigo-400">
                            {inv.invoiceNumber}
                          </td>
                          <td className="py-2.5 px-3 text-slate-500">{inv.issueDate}</td>
                          <td className="py-2.5 px-3 font-medium text-slate-700 dark:text-slate-300">
                            {inv.items?.length || 0} items
                          </td>
                          <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-white">
                            ${inv.totalAmount?.toFixed(2)}
                          </td>
                          <td className="py-2.5 px-3">
                            <span
                              className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                                inv.status === "Paid"
                                  ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                                  : inv.status === "Overdue"
                                  ? "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300"
                                  : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                              }`}
                            >
                              {inv.status}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-slate-600 dark:text-slate-400">
                            {inv.fulfillmentStatus || "Processing"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: WARRANTY HISTORY */}
          {activeTab === "warranty" && (
            <div className="space-y-4">
              <h3 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-indigo-500" /> Warranty & RMA Claims ({warrantyHistory.length})
              </h3>

              {warrantyHistory.length === 0 ? (
                <div className="p-8 text-center text-slate-400">No warranty claims on record for this customer.</div>
              ) : (
                <div className="space-y-3">
                  {warrantyHistory.map((claim) => (
                    <div
                      key={claim.id || claim.claimId}
                      className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-indigo-600 dark:text-indigo-400 text-xs">
                            {claim.claimId}
                          </span>
                          <span className="text-[10px] text-slate-400 font-medium">{claim.date}</span>
                        </div>
                        <p className="font-semibold text-slate-900 dark:text-white mt-1">{claim.part}</p>
                        <p className="text-slate-500 text-[11px] mt-0.5">Issue: {claim.issue}</p>
                      </div>

                      <span
                        className={`px-3 py-1 rounded-full font-bold text-[11px] self-start sm:self-center ${
                          claim.status?.includes("Approved")
                            ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                            : claim.status?.includes("Rejected")
                            ? "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300"
                            : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                        }`}
                      >
                        {claim.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 5: RETURNS LEDGER */}
          {activeTab === "returns" && (
            <div className="space-y-4">
              <h3 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-indigo-500" /> Part Return & Credit Ledger
              </h3>

              {!customerData.returnsHistory || customerData.returnsHistory.length === 0 ? (
                <div className="p-8 text-center text-slate-400">No parts returns logged for this customer.</div>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 font-bold text-[11px]">
                      <tr>
                        <th className="py-2.5 px-3">RMA #</th>
                        <th className="py-2.5 px-3">Date</th>
                        <th className="py-2.5 px-3">Part Affected</th>
                        <th className="py-2.5 px-3">Reason</th>
                        <th className="py-2.5 px-3">Qty</th>
                        <th className="py-2.5 px-3">Refund Value</th>
                        <th className="py-2.5 px-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {customerData.returnsHistory.map((ret) => (
                        <tr key={ret.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                          <td className="py-2.5 px-3 font-bold text-indigo-600 dark:text-indigo-400 font-mono">
                            {ret.rmaNumber}
                          </td>
                          <td className="py-2.5 px-3 text-slate-500">{ret.date}</td>
                          <td className="py-2.5 px-3 font-semibold text-slate-900 dark:text-white">{ret.partName}</td>
                          <td className="py-2.5 px-3 text-slate-500 max-w-xs truncate">{ret.reason}</td>
                          <td className="py-2.5 px-3 font-bold">{ret.quantity}</td>
                          <td className="py-2.5 px-3 font-extrabold text-slate-900 dark:text-white">
                            ${ret.amount?.toFixed(2)}
                          </td>
                          <td className="py-2.5 px-3">
                            <span
                              className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                                ret.status === "Approved"
                                  ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                                  : ret.status === "Rejected"
                                  ? "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300"
                                  : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                              }`}
                            >
                              {ret.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 6: COMMUNICATION LOG */}
          {activeTab === "communication" && (
            <div className="space-y-6">
              {/* Form to log new communication */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider flex items-center gap-2">
                    <Plus className="w-4 h-4 text-indigo-500" /> Log New Customer Interaction
                  </h3>
                  {commSuccess && (
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Interaction logged to timeline!
                    </span>
                  )}
                </div>

                <form onSubmit={handleCommSubmit} className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                        Channel / Type
                      </label>
                      <select
                        value={commType}
                        onChange={(e) => setCommType(e.target.value as any)}
                        className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-semibold text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                      >
                        <option value="Call">📞 Phone Call</option>
                        <option value="Email">✉️ Email Message</option>
                        <option value="Meeting">🤝 In-Person Meeting</option>
                        <option value="Note">📝 Internal Note</option>
                        <option value="SMS">💬 SMS Text Alert</option>
                      </select>
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                        Subject / Topic *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Discussed Q3 display screen pricing"
                        value={commSubject}
                        onChange={(e) => setCommSubject(e.target.value)}
                        className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-xs placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      Notes & Summary *
                    </label>
                    <textarea
                      rows={2}
                      required
                      placeholder="Enter detailed conversation notes or outcome..."
                      value={commContent}
                      onChange={(e) => setCommContent(e.target.value)}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-xs placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={commLoading}
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-2 shadow-md transition cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    {commLoading ? "Saving..." : "Log Interaction"}
                  </button>
                </form>
              </div>

              {/* Past Interactions List */}
              <div className="space-y-3">
                <h3 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-indigo-500" /> Past Communication Records
                </h3>

                {!customerData.communications || customerData.communications.length === 0 ? (
                  <div className="p-8 text-center text-slate-400">No interaction logs found for this customer.</div>
                ) : (
                  customerData.communications.map((comm) => (
                    <div
                      key={comm.id}
                      className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-1.5"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="font-bold px-2 py-0.5 rounded bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 text-[10px]">
                            {comm.type}
                          </span>
                          <span className="font-bold text-slate-900 dark:text-white text-xs">{comm.subject}</span>
                        </div>
                        <span className="text-[10px] text-slate-400">
                          {new Date(comm.date).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                      <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{comm.content}</p>
                      <p className="text-[10px] text-slate-400 font-medium">Logged by: {comm.loggedBy}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* MODAL: Deposit Wallet Funds */}
      {walletModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl max-w-sm w-full border border-slate-200 dark:border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Wallet className="w-4 h-4 text-indigo-500" /> Deposit Wallet Funds
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Add prepaid store credit to {customerData.businessName}'s wallet account.
            </p>
            <form onSubmit={handleWalletSubmit} className="space-y-3 text-xs">
              <input
                type="number"
                step="0.01"
                required
                placeholder="Enter deposit amount ($)"
                value={walletAmount}
                onChange={(e) => setWalletAmount(e.target.value)}
                className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setWalletModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold"
                >
                  {actionLoading ? "Updating..." : "Add Funds"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Settle Account Debt */}
      {debtModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl max-w-sm w-full border border-slate-200 dark:border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <BadgeAlert className="w-4 h-4 text-rose-500" /> Settle Account Debt
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Apply payment to reduce outstanding debt balance of ${debt.toFixed(2)}.
            </p>
            <form onSubmit={handleDebtSubmit} className="space-y-3 text-xs">
              <input
                type="number"
                step="0.01"
                required
                placeholder="Payment clearance amount ($)"
                value={debtAmount}
                onChange={(e) => setDebtAmount(e.target.value)}
                className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500/20"
              />
              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setDebtModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold"
                >
                  {actionLoading ? "Processing..." : "Clear Debt"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Adjust Credit Line */}
      {creditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl max-w-sm w-full border border-slate-200 dark:border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-purple-500" /> Adjust Revolving Credit Line
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Set new credit limit for {customerData.businessName}.
            </p>
            <form onSubmit={handleCreditSubmit} className="space-y-3 text-xs">
              <input
                type="number"
                step="100"
                required
                placeholder="New credit limit ($)"
                value={creditLimitInput}
                onChange={(e) => setCreditLimitInput(e.target.value)}
                className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/20"
              />
              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setCreditModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-bold"
                >
                  {actionLoading ? "Updating..." : "Save Credit Limit"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
