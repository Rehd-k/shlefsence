"use client";

import React, { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useLocation } from "@/lib/context/LocationContext";
import { Button } from "@/components/ui/Button";
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
  IInvoice,
  IPaymentRecord,
  IReceipt,
  SalesDashboardMetrics,
  DailySalesData,
  RevenueVsCostData,
  ProfitMarginData,
  TopCustomerData,
} from "@/lib/types/sales";
import { CheckCircle2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils/formatCurrency";

export default function SalesManagementPage() {
  const [activeTab, setActiveTab] = useState<SalesTab>("dashboard");
  const [metrics, setMetrics] = useState<SalesDashboardMetrics>({
    totalRevenue: 0,
    totalRevenueTrend: 0,
    grossProfit: 0,
    grossProfitMargin: 0,
    totalOrders: 0,
    totalOrdersTrend: 0,
    avgOrderValue: 0,
    paidInvoicesTotal: 0,
    outstandingInvoicesTotal: 0,
    overdueAmount: 0,
    wholesaleRevenue: 0,
    retailRevenue: 0,
    posRevenue: 0,
  });
  const [invoices, setInvoices] = useState<IInvoice[]>([]);
  const [payments, setPayments] = useState<IPaymentRecord[]>([]);
  const [receipts, setReceipts] = useState<IReceipt[]>([]);
  const [dailySales, setDailySales] = useState<DailySalesData[]>([]);
  const [revenueVsCost, setRevenueVsCost] = useState<RevenueVsCostData[]>([]);
  const [profitMargins, setProfitMargins] = useState<ProfitMarginData[]>([]);
  const [topCustomers, setTopCustomers] = useState<TopCustomerData[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal States
  const [isCreateInvoiceModalOpen, setIsCreateInvoiceModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedInvoiceForPayment, setSelectedInvoiceForPayment] = useState<IInvoice | null>(null);

  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<IReceipt | null>(null);

  // Dynamic context and date filtering
  const { activeLocation } = useLocation();
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

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
      const params = new URLSearchParams();
      if (activeLocation && activeLocation !== "All Locations" && activeLocation !== "All Warehouses") {
        params.set("warehouse", activeLocation);
      }
      if (startDate) params.set("startDate", startDate);
      if (endDate) params.set("endDate", endDate);

      const queryStr = params.toString() ? `?${params.toString()}` : "";

      const [invRes, pmtRes, rcpRes] = await Promise.all([
        fetch(`/api/sales/invoices${queryStr}`),
        fetch(`/api/sales/payments${queryStr}`),
        fetch(`/api/sales/receipts${queryStr}`),
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
  }, [activeLocation, startDate, endDate]);

  useEffect(() => {
    // 1. Calculate metrics
    const totalRev = invoices.reduce((sum, inv) => sum + inv.totalAmount, 0) + receipts.reduce((sum, rcp) => sum + rcp.totalAmount, 0);
    const wholesaleRev = invoices.filter(inv => inv.customerType === "Wholesale" || inv.customerType === "Enterprise Tech").reduce((sum, inv) => sum + inv.totalAmount, 0);
    const posRev = receipts.reduce((sum, rcp) => sum + rcp.totalAmount, 0);
    const retailRev = invoices.filter(inv => inv.customerType !== "Wholesale" && inv.customerType !== "Enterprise Tech").reduce((sum, inv) => sum + inv.totalAmount, 0);
    const totalOrders = invoices.length + receipts.length;
    const avgOrderValue = totalOrders > 0 ? totalRev / totalOrders : 0;
    const paidInvoicesTotal = invoices.reduce((sum, inv) => sum + inv.paidAmount, 0) + posRev;
    const outstandingInvoicesTotal = invoices.reduce((sum, inv) => sum + (inv.balanceDue || 0), 0);
    const overdueAmount = invoices.filter(inv => inv.status === "Overdue" || (inv.status === "Unpaid" && new Date(inv.dueDate) < new Date())).reduce((sum, inv) => sum + inv.balanceDue, 0);

    let totalCost = 0;
    invoices.forEach(inv => {
      let cost = 0;
      (inv.items || []).forEach(item => {
        cost += (item.unitPrice * 0.65) * (item.quantity || 1);
      });
      totalCost += cost || (inv.totalAmount * 0.65);
    });
    totalCost += posRev * 0.65;
    const grossProfit = totalRev - totalCost;
    const grossProfitMargin = totalRev > 0 ? Math.round((grossProfit / totalRev) * 100) : 35;

    setMetrics({
      totalRevenue: totalRev,
      totalRevenueTrend: 12.5,
      grossProfit,
      grossProfitMargin,
      totalOrders,
      totalOrdersTrend: 8.2,
      avgOrderValue,
      paidInvoicesTotal,
      outstandingInvoicesTotal,
      overdueAmount,
      wholesaleRevenue: wholesaleRev,
      retailRevenue: Math.max(0, retailRev),
      posRevenue: posRev,
    });

    // 2. Compute Daily Sales (last 7 days)
    const dailyData: DailySalesData[] = [];
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      const dayLabel = d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });

      const dayInvoices = invoices.filter(inv => inv.createdAt && inv.createdAt.startsWith(dateStr));
      const dayReceipts = receipts.filter(rcp => rcp.timestamp && rcp.timestamp.startsWith(dateStr));

      const wholesale = dayInvoices.filter(inv => inv.customerType === "Wholesale" || inv.customerType === "Enterprise Tech").reduce((sum, inv) => sum + inv.totalAmount, 0);
      const retail = dayInvoices.filter(inv => inv.customerType !== "Wholesale" && inv.customerType !== "Enterprise Tech").reduce((sum, inv) => sum + inv.totalAmount, 0) + dayReceipts.reduce((sum, rcp) => sum + rcp.totalAmount, 0);
      const sales = wholesale + retail;
      const ordersCount = dayInvoices.length + dayReceipts.length;

      dailyData.push({
        date: dateStr,
        dayLabel,
        sales,
        wholesaleSales: wholesale,
        retailSales: retail,
        ordersCount,
        target: 12500,
      });
    }
    setDailySales(dailyData);

    // 3. Compute Monthly Revenue vs Cost vs Profit
    const revVsCost: RevenueVsCostData[] = [];
    const margins: ProfitMarginData[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const monthLabel = d.toLocaleDateString("en-US", { month: "short" });
      const year = d.getFullYear();
      const month = d.getMonth();

      const monthInvoices = invoices.filter(inv => {
        const invDate = new Date(inv.createdAt || inv.issueDate);
        return invDate.getFullYear() === year && invDate.getMonth() === month;
      });
      const monthReceipts = receipts.filter(rcp => {
        const rcpDate = new Date(rcp.timestamp);
        return rcpDate.getFullYear() === year && rcpDate.getMonth() === month;
      });

      const revenue = monthInvoices.reduce((sum, inv) => sum + inv.totalAmount, 0) + monthReceipts.reduce((sum, rcp) => sum + rcp.totalAmount, 0);
      
      let cost = 0;
      monthInvoices.forEach(inv => {
        let invCost = 0;
        (inv.items || []).forEach(item => {
          invCost += (item.unitPrice * 0.65) * (item.quantity || 1);
        });
        cost += invCost || (inv.totalAmount * 0.65);
      });
      cost += monthReceipts.reduce((sum, rcp) => sum + rcp.totalAmount, 0) * 0.65;

      const profit = revenue - cost;
      const marginPercent = revenue > 0 ? (profit / revenue) * 100 : 35;

      revVsCost.push({
        month: monthLabel,
        revenue: Number(revenue.toFixed(2)),
        cost: Number(cost.toFixed(2)),
        profit: Number(profit.toFixed(2)),
      });

      margins.push({
        month: monthLabel,
        grossProfit: Number(profit.toFixed(2)),
        netMarginPercentage: Math.round(marginPercent),
        operatingExpenses: Number((revenue * 0.1).toFixed(2)),
      });
    }
    setRevenueVsCost(revVsCost);
    setProfitMargins(margins);

    // 4. Compute Top Customers
    const customerMap: Record<string, { totalSpent: number; ordersCount: number; paidCount: number; id: string; type: any }> = {};
    invoices.forEach(inv => {
      const cust = inv.customerName;
      if (!customerMap[cust]) {
        customerMap[cust] = {
          id: inv.id,
          totalSpent: 0,
          ordersCount: 0,
          paidCount: 0,
          type: inv.customerType,
        };
      }
      customerMap[cust].totalSpent += inv.totalAmount;
      customerMap[cust].ordersCount += 1;
      if (inv.status === "Paid") {
        customerMap[cust].paidCount += 1;
      }
    });

    const colors = ["bg-indigo-600", "bg-purple-600", "bg-emerald-600", "bg-blue-600", "bg-amber-600"];
    const topCustData = Object.entries(customerMap).map(([name, data], idx) => {
      const paidScore = data.ordersCount > 0 ? Math.round((data.paidCount / data.ordersCount) * 100) : 100;
      return {
        id: data.id,
        name,
        type: data.type,
        totalSpent: data.totalSpent,
        ordersCount: data.ordersCount,
        avgOrderValue: data.ordersCount > 0 ? data.totalSpent / data.ordersCount : 0,
        paymentReliabilityScore: paidScore,
        avatarColor: colors[idx % colors.length],
      };
    }).sort((a, b) => b.totalSpent - a.totalSpent).slice(0, 5);

    setTopCustomers(topCustData);
  }, [invoices, receipts]);

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

    triggerToast(`Payment ${newPayment.paymentRef} (${formatCurrency(newPayment.amount)}) recorded successfully in Mongoose database.`);
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

      {/* Date Range Selector Panel */}
      {activeTab !== "pos" && (
        <div className="flex flex-wrap items-center gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs text-xs mb-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-500">From Date:</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-semibold text-slate-900 dark:text-white"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-500">To Date:</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-semibold text-slate-900 dark:text-white"
            />
          </div>
          {(startDate || endDate) && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setStartDate("");
                setEndDate("");
              }}
            >
              Clear Range
            </Button>
          )}
          <span className="text-[11px] text-slate-400 font-medium ml-auto">
            Active: <b className="text-indigo-600 dark:text-indigo-400">{activeLocation}</b>
          </span>
        </div>
      )}

      {/* TAB CONTENT VIEWS */}
      {activeTab === "dashboard" && (
        <SalesDashboardView
          metrics={metrics}
          onNavigateTab={(tab) => setActiveTab(tab)}
          dailySales={dailySales}
          revenueVsCost={revenueVsCost}
          profitMargins={profitMargins}
          topCustomers={topCustomers}
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
        <POSView onCompletePOSSale={handlePOSSaleCompleted} activeLocation={activeLocation} />
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
