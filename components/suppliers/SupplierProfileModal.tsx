"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Tabs } from "@/components/ui/Tabs";
import { ISupplier, ISupplierContact, ISupplierProduct, ISupplierCommunicationLog, ISupplierDocumentItem } from "@/lib/types/supplier";
import {
  Truck,
  Building,
  Users,
  Package,
  ShoppingBag,
  CreditCard,
  Award,
  ShieldCheck,
  FileText,
  MessageSquare,
  MapPin,
  Mail,
  Phone,
  Globe,
  Plus,
  Clock,
  CheckCircle2,
  AlertTriangle,
  File,
  Download,
  Calendar,
  DollarSign,
} from "lucide-react";

interface SupplierProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  supplier: ISupplier | null;
  onLogCommunication: (supplier: ISupplier) => void;
  onAttachDocument: (supplier: ISupplier) => void;
  onAddContact: (supplier: ISupplier) => void;
}

export const SupplierProfileModal: React.FC<SupplierProfileModalProps> = ({
  isOpen,
  onClose,
  supplier,
  onLogCommunication,
  onAttachDocument,
  onAddContact,
}) => {
  const [activeTab, setActiveTab] = useState("overview");

  if (!supplier) return null;

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(val || 0);

  const tabs = [
    { id: "overview", label: "Company & Address", icon: <Building className="w-3.5 h-3.5" /> },
    { id: "contacts", label: `Contacts (${supplier.contacts?.length || 0})`, icon: <Users className="w-3.5 h-3.5" /> },
    { id: "products", label: `Supplied Products (${supplier.products?.length || 0})`, icon: <Package className="w-3.5 h-3.5" /> },
    { id: "purchases", label: "Purchase History", icon: <ShoppingBag className="w-3.5 h-3.5" /> },
    { id: "financials", label: "Financials & Payables", icon: <CreditCard className="w-3.5 h-3.5" /> },
    { id: "performance", label: "Performance SLA", icon: <Award className="w-3.5 h-3.5" /> },
    { id: "warranty", label: "Warranty & RMAs", icon: <ShieldCheck className="w-3.5 h-3.5" /> },
    { id: "communications", label: "Communications & Docs", icon: <MessageSquare className="w-3.5 h-3.5" /> },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title=""
      maxWidth="4xl"
    >
      <div className="space-y-6">
        {/* Header Hero Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 dark:border-slate-800 pb-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center font-black text-xl shadow-md shrink-0">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                  {supplier.name}
                </h2>
                <Badge
                  variant={
                    supplier.status === "Preferred"
                      ? "success"
                      : supplier.status === "Active"
                      ? "purple"
                      : "warning"
                  }
                >
                  {supplier.status}
                </Badge>
              </div>
              <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-3">
                <span>Code: <strong className="text-slate-700 dark:text-slate-300">{supplier.code || "SUP-1001"}</strong></span>
                <span>•</span>
                <span>Tax ID: <strong className="text-slate-700 dark:text-slate-300">{supplier.taxId || "N/A"}</strong></span>
                <span>•</span>
                <span>Industry: <strong className="text-indigo-600 dark:text-indigo-400">{supplier.industry}</strong></span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              icon={<MessageSquare className="w-3.5 h-3.5" />}
              onClick={() => onLogCommunication(supplier)}
            >
              Log Interaction
            </Button>
            <Button
              variant="outline"
              size="sm"
              icon={<FileText className="w-3.5 h-3.5" />}
              onClick={() => onAttachDocument(supplier)}
            >
              Attach Doc
            </Button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

        {/* Tab 1: Company & Address Profile */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Company Info Box */}
              <div className="bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 space-y-4">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Building className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  Company Profile & Terms
                </h3>

                <div className="space-y-2.5 text-xs">
                  <div className="flex justify-between py-1 border-b border-slate-200/60 dark:border-slate-700/60">
                    <span className="text-slate-400">Legal Company Name</span>
                    <strong className="text-slate-900 dark:text-white">{supplier.companyName || supplier.name}</strong>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200/60 dark:border-slate-700/60">
                    <span className="text-slate-400">Website</span>
                    <a href={supplier.website} target="_blank" rel="noreferrer" className="text-indigo-600 dark:text-indigo-400 font-semibold flex items-center gap-1 hover:underline">
                      <Globe className="w-3.5 h-3.5" />
                      {supplier.website || "N/A"}
                    </a>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200/60 dark:border-slate-700/60">
                    <span className="text-slate-400">Contract Payment Terms</span>
                    <strong className="text-slate-900 dark:text-white">{supplier.paymentTerms || "Net 30"}</strong>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200/60 dark:border-slate-700/60">
                    <span className="text-slate-400">Approved Credit Limit</span>
                    <strong className="text-emerald-600 dark:text-emerald-400">{formatCurrency(supplier.creditLimit || 100000)}</strong>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200/60 dark:border-slate-700/60">
                    <span className="text-slate-400">Overall Quality Rating</span>
                    <Badge variant="purple" size="sm">{supplier.rating || "98.5% Quality"}</Badge>
                  </div>
                </div>
              </div>

              {/* Address Box */}
              <div className="bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 space-y-4">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  Primary HQ & Fulfillment Address
                </h3>

                <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl space-y-2 text-xs">
                  <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
                    <span>{supplier.address?.addressType || "Manufacturing HQ"}</span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                    {supplier.address?.street || "100 Logistics Blvd"}<br />
                    {supplier.address?.city || "Shenzhen"}, {supplier.address?.state || "Guangdong"} {supplier.address?.postalCode || "518000"}<br />
                    <strong className="text-indigo-600 dark:text-indigo-400">{supplier.address?.country || "China"}</strong>
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl">
                    <span className="text-[10px] text-slate-400 font-semibold uppercase">Primary Phone</span>
                    <p className="font-bold text-slate-900 dark:text-white mt-0.5 flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-indigo-500" />
                      {supplier.phone || supplier.contacts?.[0]?.phone || "+86 755 8399 1000"}
                    </p>
                  </div>
                  <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl">
                    <span className="text-[10px] text-slate-400 font-semibold uppercase">Orders Email</span>
                    <p className="font-bold text-slate-900 dark:text-white mt-0.5 flex items-center gap-1.5 truncate">
                      <Mail className="w-3.5 h-3.5 text-indigo-500" />
                      <span className="truncate">{supplier.email || supplier.contacts?.[0]?.email || "orders@vendor.com"}</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Contacts Directory */}
        {activeTab === "contacts" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Authorized Supplier Representatives & Key Contacts
              </h3>
              <Button
                variant="outline"
                size="sm"
                icon={<Plus className="w-3.5 h-3.5" />}
                onClick={() => onAddContact(supplier)}
              >
                Add Representative
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {supplier.contacts?.map((cnt) => (
                <div
                  key={cnt.id || cnt.name}
                  className="bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/80 rounded-2xl p-4 space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                        {cnt.name.split(" ").map((n) => n[0]).join("")}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 dark:text-white text-xs">
                          {cnt.name}
                        </h4>
                        <p className="text-[11px] text-slate-400">{cnt.role}</p>
                      </div>
                    </div>
                    {cnt.isPrimary && (
                      <Badge variant="success" size="sm">
                        Primary Rep
                      </Badge>
                    )}
                  </div>

                  <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/60 space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      <span className="truncate">{cnt.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span>{cnt.phone}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Supplied Products Catalog */}
        {activeTab === "products" && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Supplied Component SKUs & Price Contract Matrix
            </h3>

            <div className="border border-slate-200/80 dark:border-slate-800 rounded-2xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200/80 dark:border-slate-800 font-bold uppercase tracking-wider text-[10px] text-slate-400">
                    <th className="py-3 px-4">SKU Code</th>
                    <th className="py-3 px-4">Component Name</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Contract Unit Cost</th>
                    <th className="py-3 px-4">Min Order Qty (MOQ)</th>
                    <th className="py-3 px-4">Lead Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {supplier.products?.map((prod) => (
                    <tr key={prod.id || prod.sku} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                      <td className="py-3 px-4 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                        {prod.sku}
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                        {prod.name}
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant="purple" size="sm">{prod.category}</Badge>
                      </td>
                      <td className="py-3 px-4 font-bold text-emerald-600 dark:text-emerald-400">
                        {formatCurrency(prod.unitCost)}
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-700 dark:text-slate-300">
                        {prod.moq} Units
                      </td>
                      <td className="py-3 px-4 text-slate-500">
                        {prod.leadTimeDays} Days
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 4: Purchase History */}
        {activeTab === "purchases" && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Purchase Order History & Fulfillments
            </h3>

            <div className="border border-slate-200/80 dark:border-slate-800 rounded-2xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200/80 dark:border-slate-800 font-bold uppercase tracking-wider text-[10px] text-slate-400">
                    <th className="py-3 px-4">PO Number</th>
                    <th className="py-3 px-4">Destination Warehouse</th>
                    <th className="py-3 px-4">Total Units</th>
                    <th className="py-3 px-4">Total Value</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Expected Arrival</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {(supplier.purchaseOrders && supplier.purchaseOrders.length > 0) ? (
                    supplier.purchaseOrders.map((po: any) => (
                      <tr key={po.poNumber} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                        <td className="py-3 px-4 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                          {po.poNumber}
                        </td>
                        <td className="py-3 px-4 text-slate-700 dark:text-slate-300">{po.warehouse}</td>
                        <td className="py-3 px-4 font-semibold">{po.totalUnits} Units</td>
                        <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">{formatCurrency(po.totalValue)}</td>
                        <td className="py-3 px-4">
                          <Badge variant={po.status.includes("Received") ? "success" : "purple"} size="sm">
                            {po.status}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-slate-500">{po.expectedDate}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="py-6 text-center text-slate-400">
                        Active PO-2026-8810: 150 units of OLED panels awaiting delivery.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 5: Financials & Payables */}
        {activeTab === "financials" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
                  Outstanding Payables Balance
                </span>
                <h3 className="text-2xl font-black text-amber-900 dark:text-amber-200 mt-1">
                  {formatCurrency(supplier.outstandingBalance || 34500)}
                </h3>
                <p className="text-[11px] text-amber-600 dark:text-amber-400 mt-1 font-medium">
                  {supplier.pendingInvoicesCount || 2} Pending Vendor Invoices
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-200/80 dark:border-indigo-900">
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-400">
                  Credit Line Limit
                </span>
                <h3 className="text-2xl font-black text-indigo-900 dark:text-indigo-200 mt-1">
                  {formatCurrency(supplier.creditLimit || 250000)}
                </h3>
                <p className="text-[11px] text-indigo-600 dark:text-indigo-400 mt-1 font-medium">
                  {Math.round(((supplier.outstandingBalance || 34500) / (supplier.creditLimit || 250000)) * 100)}% Credit Utilization
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-900">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                  Lifetime Total Purchases
                </span>
                <h3 className="text-2xl font-black text-emerald-900 dark:text-emerald-200 mt-1">
                  {formatCurrency(supplier.totalPurchasesValue || 482900)}
                </h3>
                <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 font-medium">
                  Total Orders Settled
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tab 6: Performance SLA */}
        {activeTab === "performance" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700 rounded-2xl text-center">
                <span className="text-[10px] font-bold uppercase text-slate-400">Overall SLA Score</span>
                <p className="text-3xl font-black text-indigo-600 dark:text-indigo-400 mt-1">
                  {supplier.performance?.overallScore || 99.2}%
                </p>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700 rounded-2xl text-center">
                <span className="text-[10px] font-bold uppercase text-slate-400">Quality Pass Rate</span>
                <p className="text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
                  {supplier.performance?.qualityPassRate || 99.5}%
                </p>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700 rounded-2xl text-center">
                <span className="text-[10px] font-bold uppercase text-slate-400">On-Time Delivery Rate</span>
                <p className="text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
                  {supplier.performance?.onTimeDeliveryRate || 98.4}%
                </p>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700 rounded-2xl text-center">
                <span className="text-[10px] font-bold uppercase text-slate-400">RMA Defect Rate</span>
                <p className="text-3xl font-black text-rose-500 mt-1">
                  {supplier.performance?.defectiveRate || 0.5}%
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tab 7: Warranty & RMAs */}
        {activeTab === "warranty" && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Vendor Defect Claims & RMA Defect History
            </h3>
            <div className="p-4 bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 rounded-2xl text-xs space-y-2">
              <div className="flex items-center justify-between font-bold text-slate-900 dark:text-white">
                <span>RMA-400: Galaxy S24 Ultra Battery Pack Defect</span>
                <Badge variant="success" size="sm">Approved & Refunded</Badge>
              </div>
              <p className="text-slate-500">
                15 units thermal cycle failure. Supplier refunded $360.00 and dispatched replacements.
              </p>
            </div>
          </div>
        )}

        {/* Tab 8: Communications & Documents */}
        {activeTab === "communications" && (
          <div className="space-y-6">
            {/* Activity History */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Vendor Activity Timeline & Interaction Logs
                </h3>
                <Button
                  variant="outline"
                  size="sm"
                  icon={<Plus className="w-3.5 h-3.5" />}
                  onClick={() => onLogCommunication(supplier)}
                >
                  Log Interaction
                </Button>
              </div>

              <div className="space-y-3">
                {supplier.communications?.map((comm) => (
                  <div
                    key={comm.id}
                    className="p-4 bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/80 rounded-2xl space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
                        <Badge variant="purple" size="sm">{comm.type}</Badge>
                        <span>{comm.subject}</span>
                      </div>
                      <span className="text-[11px] text-slate-400 font-medium">{comm.date}</span>
                    </div>
                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                      {comm.summary}
                    </p>
                    <div className="text-[11px] text-slate-400">Logged by: {comm.author}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Document Vault */}
            <div className="space-y-3 pt-4 border-t border-slate-200/80 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Document Vault & Attached Compliance Forms
                </h3>
                <Button
                  variant="outline"
                  size="sm"
                  icon={<Plus className="w-3.5 h-3.5" />}
                  onClick={() => onAttachDocument(supplier)}
                >
                  Upload Document
                </Button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {supplier.documents?.map((doc) => (
                  <div
                    key={doc.id}
                    className="p-3 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                        <File className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 dark:text-white truncate max-w-[180px]">
                          {doc.title}
                        </h4>
                        <p className="text-[10px] text-slate-400">{doc.type} • {doc.fileSize}</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="xs" icon={<Download className="w-3.5 h-3.5 text-slate-500" />} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
