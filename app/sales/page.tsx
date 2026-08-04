"use client";

import React, { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { SalesHeader, SalesTab } from "@/components/sales/SalesHeader";
import { SalesDashboardView } from "@/components/sales/SalesDashboardView";
import { InvoicesView } from "@/components/sales/InvoicesView";
import { POSView } from "@/components/sales/POSView";
import { TransactionsView } from "@/components/sales/TransactionsView";
import { WholesaleOrdersView } from "@/components/sales/WholesaleOrdersView";
import { RetailOrdersView } from "@/components/sales/RetailOrdersView";
import { PaymentsView } from "@/components/sales/PaymentsView";
import { ReceiptsView } from "@/components/sales/ReceiptsView";
import { OutstandingInvoicesView } from "@/components/sales/OutstandingInvoicesView";
import { ThermalReceiptModal } from "@/components/sales/modals/ThermalReceiptModal";
import { RecordPaymentModal } from "@/components/sales/modals/RecordPaymentModal";
import { CreateSaleModal } from "@/components/dashboard/modals/CreateSaleModal";
import {
  SEED_SALES_METRICS,
  SEED_INVOICES,
  SEED_PAYMENTS,
  SEED_RECEIPTS,
} from "@/lib/seed/salesSeedData";
import { IInvoice, IPaymentRecord, IReceipt } from "@/lib/types/sales";
import { CheckCircle2 } from "lucide-react";

export default function SalesManagementPage() {
  const [activeTab, setActiveTab] = useState<SalesTab>("dashboard");
  const [metrics, setMetrics] = useState(SEED_SALES_METRICS);
  const [invoices, setInvoices] = useState<IInvoice[]>([]);
  const [payments, setPayments] = useState<IPaymentRecord[]>([]);
  const [receipts, setReceipts] = useState<IReceipt[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal States
  const [isCreateInvoiceModalOpen, setIsCreateInvoiceModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedInvoiceForPayment, setSelectedInvoiceForPayment] = useState<IInvoice | null>(null);

  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<IReceipt | null>(null);

  // Toast alert
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const fetchSalesData = async () => {
    setLoading(true);
    try {
      const [invRes, pmtRes, rcpRes] = await Promise.all([
        fetch("/api/sales/invoices"),
        fetch("/api/sales/payments"),
        fetch("/api/sales/receipts"),
      ]);

      const [invJson, pmtJson, rcpJson] = await Promise.all([
        invRes.json(),
        pmtRes.json(),
        rcpRes.json(),
      ]);

      if (invJson.success) setInvoices(invJson.data);
      if (pmtJson.success) setPayments(pmtJson.data);
      if (rcpJson.success) setReceipts(rcpJson.data);
    } catch (err) {
      console.error("Error loading sales data from Mongoose:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSalesData();
  }, []);

  // Handlers
  const handlePaymentRecorded = async (newPayment: IPaymentRecord, invoiceId: string) => {
    try {
      await fetch("/api/sales/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newPayment),
      });
    } catch (e) {
      console.error(e);
    }

    setPayments((prev) => [newPayment, ...prev]);

    setInvoices((prev) =>
      prev.map((inv) => {
        if (inv.id === invoiceId) {
          const newPaid = inv.paidAmount + newPayment.amount;
          const newBalance = Math.max(0, inv.totalAmount - newPaid);
          const newStatus = newBalance === 0 ? "Paid" : "Partial";
          return {
            ...inv,
            paidAmount: newPaid,
            balanceDue: newBalance,
            status: newStatus,
            payments: [newPayment, ...(inv.payments || [])],
          };
        }
        return inv;
      })
    );

    setMetrics((prev) => ({
      ...prev,
      paidInvoicesTotal: prev.paidInvoicesTotal + newPayment.amount,
      outstandingInvoicesTotal: Math.max(0, prev.outstandingInvoicesTotal - newPayment.amount),
    }));

    triggerToast(`Payment ${newPayment.paymentRef} ($${newPayment.amount.toFixed(2)}) recorded successfully in Mongoose database.`);
  };

  const handlePOSSaleCompleted = (newReceipt: IReceipt) => {
    setReceipts((prev) => [newReceipt, ...prev]);

    setMetrics((prev) => ({
      ...prev,
      totalRevenue: prev.totalRevenue + newReceipt.totalAmount,
      totalOrders: prev.totalOrders + 1,
      posRevenue: prev.posRevenue + newReceipt.totalAmount,
    }));

    setSelectedReceipt(newReceipt);
    setIsReceiptModalOpen(true);
    triggerToast(`POS Sale completed! Thermal Receipt #${newReceipt.receiptNumber} issued & saved.`);
  };

  const handleSaleCreated = async (newOrder: any) => {
    const newInvPayload = {
      invoiceNumber: `INV-2026-${Math.floor(9410 + Math.random() * 500)}`,
      orderNumber: newOrder.orderNumber,
      customerName: newOrder.customerName,
      customerEmail: newOrder.customerEmail || "orders@customer.com",
      customerType: newOrder.customerType || "Wholesale",
      issueDate: new Date().toISOString().substring(0, 10),
      dueDate: "2026-08-30",
      items: newOrder.items || [],
      subtotal: newOrder.totalAmount,
      discountTotal: 0,
      taxAmount: 0,
      totalAmount: newOrder.totalAmount,
      paidAmount: newOrder.paymentStatus === "Paid" ? newOrder.totalAmount : 0,
      balanceDue: newOrder.paymentStatus === "Paid" ? 0 : newOrder.totalAmount,
      status: newOrder.paymentStatus === "Paid" ? "Paid" : "Unpaid",
      fulfillmentStatus: newOrder.fulfillmentStatus || "Awaiting Dispatch",
      paymentMethod: newOrder.paymentMethod || "Credit Card",
      warehouse: newOrder.warehouse || "Main Hub - Lagos",
      payments: [],
    };

    try {
      const res = await fetch("/api/sales/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newInvPayload),
      });
      const json = await res.json();
      if (json.success) {
        setInvoices((prev) => [json.data, ...prev]);
        triggerToast(`Invoice ${json.data.invoiceNumber} created for ${json.data.customerName}.`);
      }
    } catch (err) {
      console.error("Error creating invoice:", err);
    }
  };

  const openPaymentModal = (inv: IInvoice) => {
    setSelectedInvoiceForPayment(inv);
    setIsPaymentModalOpen(true);
  };

  const openReceiptModal = (rec: IReceipt) => {
    setSelectedReceipt(rec);
    setIsReceiptModalOpen(true);
  };

  const openReceiptFromInvoice = (inv: IInvoice) => {
    const matchedRec: IReceipt = {
      id: `REC-${inv.id}`,
      receiptNumber: `REC-2026-${inv.invoiceNumber.replace("INV-2026-", "")}`,
      invoiceNumber: inv.invoiceNumber,
      customerName: inv.customerName,
      customerType: inv.customerType,
      itemsCount: inv.items?.length || 1,
      totalAmount: inv.totalAmount,
      paymentMethod: inv.paymentMethod,
      cashierName: "Alex Rivers",
      timestamp: inv.createdAt,
      itemsSummary: (inv.items || []).map((i) => `${i.quantity}x ${i.name}`).join(", ") || `${inv.orderNumber} parts`,
      storeName: "ShelfSense Hub NY Counter",
      storeAddress: "350 5th Ave, Suite 1200, New York, NY 10118",
    };
    setSelectedReceipt(matchedRec);
    setIsReceiptModalOpen(true);
  };

  return (
    <AppLayout>
      {/* Toast Confirmation */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-5">
          <div className="bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl border border-indigo-500/40 flex items-center gap-3 text-xs font-bold">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      {/* Sales Module Navigation Header */}
      <SalesHeader
        activeTab={activeTab}
        onTabChange={(t) => setActiveTab(t)}
        onNewSale={() => setIsCreateInvoiceModalOpen(true)}
        onLaunchPOS={() => setActiveTab("pos")}
        onRecordPayment={() => {
          setSelectedInvoiceForPayment(invoices.find((i) => i.balanceDue > 0) || invoices[0]);
          setIsPaymentModalOpen(true);
        }}
        outstandingCount={invoices.filter((i) => i.status === "Overdue").length}
      />

      {/* TAB CONTENT VIEWS */}
      {activeTab === "dashboard" && (
        <SalesDashboardView
          metrics={metrics}
          onNavigateTab={(tab) => setActiveTab(tab)}
        />
      )}

      {activeTab === "invoices" && (
        <InvoicesView
          invoices={invoices}
          onRecordPayment={openPaymentModal}
          onPrintInvoice={openReceiptFromInvoice}
        />
      )}

      {activeTab === "pos" && (
        <POSView onCompletePOSSale={handlePOSSaleCompleted} />
      )}

      {activeTab === "transactions" && (
        <TransactionsView receipts={receipts} onViewReceipt={openReceiptModal} />
      )}

      {activeTab === "wholesale" && (
        <WholesaleOrdersView onNewWholesaleOrder={() => setIsCreateInvoiceModalOpen(true)} />
      )}

      {activeTab === "retail" && (
        <RetailOrdersView invoices={invoices} onPrintReceipt={openReceiptFromInvoice} />
      )}

      {activeTab === "payments" && (
        <PaymentsView
          payments={payments}
          onRecordNewPayment={() => {
            setSelectedInvoiceForPayment(invoices.find((i) => i.balanceDue > 0) || invoices[0]);
            setIsPaymentModalOpen(true);
          }}
        />
      )}

      {activeTab === "receipts" && (
        <ReceiptsView receipts={receipts} onViewReceipt={openReceiptModal} />
      )}

      {activeTab === "outstanding" && (
        <OutstandingInvoicesView invoices={invoices} onRecordPayment={openPaymentModal} />
      )}

      {/* MODAL DIALOGS */}
      <CreateSaleModal
        isOpen={isCreateInvoiceModalOpen}
        onClose={() => setIsCreateInvoiceModalOpen(false)}
        onSaleCreated={handleSaleCreated}
      />

      <RecordPaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        invoice={selectedInvoiceForPayment}
        onPaymentRecorded={handlePaymentRecorded}
      />

      <ThermalReceiptModal
        isOpen={isReceiptModalOpen}
        onClose={() => setIsReceiptModalOpen(false)}
        receipt={selectedReceipt}
      />
    </AppLayout>
  );
}
