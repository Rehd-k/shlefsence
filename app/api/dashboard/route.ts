import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/mongodb";
import InventoryItem from "@/lib/models/InventoryItem";
import Invoice from "@/lib/models/Invoice";
import Payment from "@/lib/models/Payment";
import PurchaseOrder from "@/lib/models/PurchaseOrder";
import WarrantyClaim from "@/lib/models/WarrantyClaim";
import Supplier from "@/lib/models/Supplier";
import WholesaleCustomer from "@/lib/models/WholesaleCustomer";

export async function GET() {
  try {
    await connectToDatabase();

    const now = new Date();

    // 1. Setup date ranges
    // Today range
    const startOfToday = new Date(now);
    startOfToday.setHours(0, 0, 0, 0);
    const endOfToday = new Date(now);
    endOfToday.setHours(23, 59, 59, 999);

    // Yesterday range
    const startOfYesterday = new Date(startOfToday);
    startOfYesterday.setDate(startOfYesterday.getDate() - 1);
    const endOfYesterday = new Date(startOfYesterday);
    endOfYesterday.setHours(23, 59, 59, 999);

    // This month range
    const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);

    // Last month range
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1, 0, 0, 0, 0);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);

    // Last 14 days start date
    const startOf14DaysAgo = new Date(startOfToday);
    startOf14DaysAgo.setDate(startOf14DaysAgo.getDate() - 13); // includes today

    // Last 7 days (this week) for POs
    const startOfWeekAgo = new Date(startOfToday);
    startOfWeekAgo.setDate(startOfWeekAgo.getDate() - 6);

    // 2. Fetch invoice collections for calculations
    const invoicesToday = await Invoice.find({ createdAt: { $gte: startOfToday, $lte: endOfToday } }).lean();
    const invoicesYesterday = await Invoice.find({ createdAt: { $gte: startOfYesterday, $lte: endOfYesterday } }).lean();
    const invoicesThisMonth = await Invoice.find({ createdAt: { $gte: startOfThisMonth, $lte: now } }).lean();
    const invoicesLastMonth = await Invoice.find({ createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth } }).lean();
    
    // Fetch all inventory items to create a SKU to cost & price mapping
    const inventoryItems = await InventoryItem.find({}).select("sku cost sellingPrice quantity reorderPoint status shelf brand phoneModel category").lean();
    const skuCostMap: Record<string, number> = {};
    inventoryItems.forEach((item: any) => {
      skuCostMap[item.sku] = item.cost || 0;
    });

    const calculateCostOfInvoices = (invoicesList: any[]) => {
      let cost = 0;
      invoicesList.forEach((inv) => {
        (inv.items || []).forEach((item: any) => {
          const mappedCost = skuCostMap[item.sku];
          if (mappedCost === undefined || mappedCost === null) return;
          cost += mappedCost * (item.quantity || 0);
        });
      });
      return cost;
    };

    // 3. Compute Metrics
    // Revenue Today
    const todayAmount = invoicesToday.reduce((sum, inv) => sum + (inv.totalAmount || 0), 0);
    const yesterdayAmount = invoicesYesterday.reduce((sum, inv) => sum + (inv.totalAmount || 0), 0);
    const todayTrend = yesterdayAmount > 0 ? ((todayAmount - yesterdayAmount) / yesterdayAmount) * 105 : (todayAmount > 0 ? 100 : 0);

    // Revenue Month
    const monthAmount = invoicesThisMonth.reduce((sum, inv) => sum + (inv.totalAmount || 0), 0);
    const lastMonthAmount = invoicesLastMonth.reduce((sum, inv) => sum + (inv.totalAmount || 0), 0);
    const monthTrend = lastMonthAmount > 0 ? ((monthAmount - lastMonthAmount) / lastMonthAmount) * 105 : (monthAmount > 0 ? 100 : 0);

    // Gross Profit
    const thisMonthCost = calculateCostOfInvoices(invoicesThisMonth);
    const thisMonthProfit = monthAmount - thisMonthCost;
    const thisMonthMargin = monthAmount > 0 ? (thisMonthProfit / monthAmount) * 100 : 0;

    const lastMonthCost = calculateCostOfInvoices(invoicesLastMonth);
    const lastMonthProfit = lastMonthAmount - lastMonthCost;
    const profitTrend = lastMonthProfit > 0 ? ((thisMonthProfit - lastMonthProfit) / lastMonthProfit) * 100 : (thisMonthProfit > 0 ? 100 : 0);

    // Inventory Value
    const totalValue = inventoryItems.reduce((sum, item) => sum + ((item.sellingPrice || 0) * (item.quantity || 0)), 0);
    const totalCost = inventoryItems.reduce((sum, item) => sum + ((item.cost || 0) * (item.quantity || 0)), 0);
    const potentialProfit = totalValue - totalCost;

    // Customer Debts (Outstanding Debts)
    // Sum of balanceDue of unpaid or partially paid invoices
    const unpaidInvoices = await Invoice.find({ status: { $in: ["Unpaid", "Partial", "Overdue"] } }).lean();
    const totalBalanceDue = unpaidInvoices.reduce((sum, inv) => sum + (inv.balanceDue || 0), 0);
    const uniqueDebtors = new Set(unpaidInvoices.map((inv) => inv.customerName));
    const overdueInvoices = unpaidInvoices.filter((inv) => {
      if (inv.status === "Overdue") return true;
      if (inv.dueDate) return new Date(inv.dueDate) < now;
      return false;
    });
    const overdueBalanceDue = overdueInvoices.reduce((sum, inv) => sum + (inv.balanceDue || 0), 0);

    // Supplier Payables
    const suppliers = await Supplier.find({}).lean();
    const outstandingPayables = suppliers.reduce((sum, s: any) => sum + (s.outstandingBalance || 0), 0);
    const suppliersWithBalance = suppliers.filter((s: any) => (s.outstandingBalance || 0) > 0);
    const dueIn7DaysPayables = suppliersWithBalance.reduce((sum, s: any) => {
      if (s.dueIn7Days != null) return sum + (s.dueIn7Days || 0);
      return sum;
    }, 0);

    // Low Stock Alerts
    const lowStockCount = inventoryItems.filter(item => (item.quantity || 0) > 0 && (item.quantity || 0) <= (item.reorderPoint || 10)).length;
    const criticalCount = inventoryItems.filter(item => (item.quantity || 0) > 0 && (item.quantity || 0) <= Math.ceil((item.reorderPoint || 10) / 3)).length;

    // Out of Stock
    const outOfStockCount = inventoryItems.filter(item => (item.quantity || 0) === 0).length;
    const lostRevenueEst = inventoryItems.filter(item => (item.quantity || 0) === 0).reduce((sum, item) => sum + ((item.sellingPrice || 0) * (item.reorderPoint || 10)), 0);

    // Pending POs
    const pendingPOs = await PurchaseOrder.find({ status: { $in: ["Awaiting Arrival", "In Transit", "Draft", "Approved"] } }).lean();
    const poCount = pendingPOs.length;
    const poTotalValue = pendingPOs.reduce((sum, po) => sum + (po.totalValue || 0), 0);
    const poExpectedToday = pendingPOs.filter((po) => {
      if (!po.expectedDate) return false;
      const expDate = new Date(po.expectedDate);
      return expDate.toDateString() === now.toDateString();
    }).length;

    // Awaiting Dispatch
    const awaitingInvoices = await Invoice.find({ fulfillmentStatus: "Awaiting Dispatch" }).lean();
    const awaitingCount = awaitingInvoices.length;
    const awaitingValue = awaitingInvoices.reduce((sum, inv) => sum + (inv.totalAmount || 0), 0);
    const urgentAwaitingCount = awaitingInvoices.filter((inv) => {
      const diffTime = Math.abs(now.getTime() - new Date(inv.createdAt).getTime());
      const diffHours = diffTime / (1000 * 60 * 60);
      return diffHours > 24;
    }).length;

    // Warranty Claims
    const warrantyClaims = await WarrantyClaim.find({}).lean();
    const claimsCount = warrantyClaims.length;
    const pendingInspectionClaims = warrantyClaims.filter((c) => c.status === "Pending Inspection").length;
    const approvedCount = warrantyClaims.filter((c) => c.status && c.status.toLowerCase().includes("approved")).length;
    const rejectedCount = warrantyClaims.filter((c) => c.status && c.status.toLowerCase().includes("rejected")).length;
    const totalResolved = approvedCount + rejectedCount;
    const approvedRate = totalResolved > 0 ? (approvedCount / totalResolved) * 105 : 92.5;

    // POs This Week
    const poThisWeek = await PurchaseOrder.find({ createdAt: { $gte: startOfWeekAgo } }).lean();
    const poThisWeekCount = poThisWeek.length;
    const poThisWeekSpend = poThisWeek.reduce((sum, po) => sum + (po.totalValue || 0), 0);

    const metrics = {
      revenueToday: {
        amount: Number(todayAmount.toFixed(2)),
        trendPercentage: Number(todayTrend.toFixed(1)),
        comparedTo: "vs yesterday",
        target: 12500.0,
      },
      revenueMonth: {
        amount: Number(monthAmount.toFixed(2)),
        trendPercentage: Number(monthTrend.toFixed(1)),
        comparedTo: "vs last month",
        target: 320000.0,
      },
      grossProfit: {
        amount: Number(thisMonthProfit.toFixed(2)),
        marginPercentage: Number(thisMonthMargin.toFixed(1)),
        trendPercentage: Number(profitTrend.toFixed(1)),
      },
      inventoryValue: {
        totalValue: Number(totalValue.toFixed(2)),
        totalCost: Number(totalCost.toFixed(2)),
        potentialProfit: Number(potentialProfit.toFixed(2)),
      },
      outstandingDebts: {
        amount: Number(totalBalanceDue.toFixed(2)),
        overdueAmount: Number(overdueBalanceDue.toFixed(2)),
        customerCount: uniqueDebtors.size,
      },
      supplierPayables: {
        amount: Number(outstandingPayables.toFixed(2)),
        dueIn7Days: Number(dueIn7DaysPayables.toFixed(2)),
        supplierCount: suppliersWithBalance.length,
      },
      lowStockAlerts: {
        count: lowStockCount,
        criticalCount: criticalCount,
      },
      outOfStockItems: {
        count: outOfStockCount,
        lostRevenueEst: Number(lostRevenueEst.toFixed(2)),
      },
      pendingPOs: {
        count: poCount,
        totalValue: Number(poTotalValue.toFixed(2)),
        expectedToday: poExpectedToday,
      },
      awaitingDispatch: {
        count: awaitingCount,
        urgentCount: urgentAwaitingCount,
        totalValue: Number(awaitingValue.toFixed(2)),
      },
      warrantyClaims: {
        count: claimsCount,
        pendingInspection: pendingInspectionClaims,
        approvedRate: Number(approvedRate.toFixed(1)),
      },
      recentSales: {
        countToday: invoicesToday.length,
        avgOrderValue: invoicesToday.length > 0 ? Number((todayAmount / invoicesToday.length).toFixed(2)) : 0,
      },
      recentPurchases: {
        countThisWeek: poThisWeekCount,
        totalSpend: Number(poThisWeekSpend.toFixed(2)),
      },
    };

    // 4. Generate dailySales (Last 14 days)
    const dailySales: any[] = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date(startOfToday);
      d.setDate(d.getDate() - i);

      const dateStr = d.toISOString().split("T")[0];
      const dayLabel = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });

      const startOfDay = new Date(d);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(d);
      endOfDay.setHours(23, 59, 59, 999);

      const dayInvoices = await Invoice.find({ createdAt: { $gte: startOfDay, $lte: endOfDay } }).lean();
      const sales = dayInvoices.reduce((sum, inv) => sum + (inv.totalAmount || 0), 0);
      const orders = dayInvoices.length;

      dailySales.push({
        date: dateStr,
        dayLabel,
        sales: Number(sales.toFixed(2)),
        orders,
        target: 12000,
      });
    }

    // 5. Generate monthlyRevenue (Last 6 months)
    const monthlyRevenue: any[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthLabel = d.toLocaleDateString("en-US", { month: "short" });

      const startOfMonth = new Date(d.getFullYear(), d.getMonth(), 1, 0, 0, 0, 0);
      const endOfMonth = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);

      const monthInvoices = await Invoice.find({ createdAt: { $gte: startOfMonth, $lte: endOfMonth } }).lean();
      const revenue = monthInvoices.reduce((sum, inv) => sum + (inv.totalAmount || 0), 0);
      const cost = calculateCostOfInvoices(monthInvoices);
      const grossProfit = revenue - cost;

      monthlyRevenue.push({
        month: monthLabel,
        revenue: Number(revenue.toFixed(2)),
        cost: Number(cost.toFixed(2)),
        grossProfit: Number(grossProfit.toFixed(2)),
      });
    }

    // 6. Generate categorySales, topBrands, topModels from all-time (or last 90 days) Invoices
    const categorySalesMap: Record<string, { sales: number; itemCount: number }> = {};
    const brandSalesMap: Record<string, { sales: number; unitsSold: number }> = {};
    const modelSalesMap: Record<string, { brand: string; unitsSold: number; revenue: number }> = {};

    const allInvoices = await Invoice.find({}).lean();
    let totalAllSales = 0;

    allInvoices.forEach((inv) => {
      (inv.items || []).forEach((item: any) => {
        const lineTotal = item.lineTotal || (item.unitPrice * item.quantity) || 0;
        totalAllSales += lineTotal;

        // Categories
        const cat = item.category || "General Parts";
        if (!categorySalesMap[cat]) {
          categorySalesMap[cat] = { sales: 0, itemCount: 0 };
        }
        categorySalesMap[cat].sales += lineTotal;
        categorySalesMap[cat].itemCount += item.quantity || 0;

        // Brands
        const brand = item.brand || "Generic";
        if (!brandSalesMap[brand]) {
          brandSalesMap[brand] = { sales: 0, unitsSold: 0 };
        }
        brandSalesMap[brand].sales += lineTotal;
        brandSalesMap[brand].unitsSold += item.quantity || 0;

        // Models
        const model = item.phoneModel || item.name || "Unknown Model";
        if (!modelSalesMap[model]) {
          modelSalesMap[model] = { brand, unitsSold: 0, revenue: 0 };
        }
        modelSalesMap[model].unitsSold += item.quantity || 0;
        modelSalesMap[model].revenue += lineTotal;
      });
    });

    const colors = ["#6366f1", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899", "#06b6d4", "#ef4444", "#14b8a6"];
    const categorySales = Object.entries(categorySalesMap).map(([category, data], index) => {
      const percentage = totalAllSales > 0 ? (data.sales / totalAllSales) * 100 : 0;
      return {
        category,
        sales: Number(data.sales.toFixed(2)),
        percentage: Number(percentage.toFixed(1)),
        itemCount: data.itemCount,
        color: colors[index % colors.length],
      };
    }).sort((a, b) => b.sales - a.sales);

    const topBrands = Object.entries(brandSalesMap).map(([brand, data]) => {
      const marketShare = totalAllSales > 0 ? (data.sales / totalAllSales) * 100 : 0;
      return {
        brand,
        sales: Number(data.sales.toFixed(2)),
        unitsSold: data.unitsSold,
        marketShare: Number(marketShare.toFixed(1)),
      };
    }).sort((a, b) => b.sales - a.sales).slice(0, 5);

    const topModels = Object.entries(modelSalesMap).map(([model, data]) => {
      return {
        model,
        brand: data.brand,
        unitsSold: data.unitsSold,
        revenue: Number(data.revenue.toFixed(2)),
        growthRate: 0,
      };
    }).sort((a, b) => b.revenue - a.revenue).slice(0, 6);

    // 7. Get Low Stock Products (InventoryItem where quantity <= reorderPoint)
    const dbLowStockItems = await InventoryItem.find({
      quantity: { $gt: 0 },
      $expr: { $lte: ["$quantity", "$reorderPoint"] },
    }).limit(5).lean();

    const lowStockProducts = dbLowStockItems.map((item: any) => ({
      id: item._id.toString(),
      sku: item.sku,
      productName: item.product,
      brand: item.brand,
      phoneModel: item.phoneModel,
      quality: item.quality,
      currentStock: item.quantity,
      reorderPoint: item.reorderPoint || 10,
      warehouseBin: item.shelf || "N/A",
      estRestockDays: 3,
    }));

    // 8. Latest Orders & Recent Payments
    const latestInvoicesList = await Invoice.find({}).sort({ createdAt: -1 }).limit(5).lean();
    const latestOrders = latestInvoicesList.map((inv: any) => ({
      id: inv._id.toString(),
      orderNumber: inv.orderNumber || inv.invoiceNumber,
      customerName: inv.customerName,
      customerType: inv.customerType || "Wholesale",
      itemsCount: inv.items?.length || 1,
      totalAmount: inv.totalAmount,
      paymentStatus: inv.status,
      fulfillmentStatus: inv.fulfillmentStatus,
      createdAt: inv.createdAt ? new Date(inv.createdAt).toISOString() : new Date().toISOString(),
    }));

    const recentPaymentsList = await Payment.find({}).sort({ createdAt: -1 }).limit(5).lean();
    const recentPayments = recentPaymentsList.map((p: any) => ({
      id: p._id.toString(),
      paymentRef: p.paymentRef,
      customerName: p.customerName,
      invoiceRef: p.invoiceNumber,
      amount: p.amount,
      paymentMethod: p.method,
      status: p.status,
      date: p.date,
    }));

    return NextResponse.json({
      success: true,
      data: {
        metrics,
        dailySales,
        monthlyRevenue,
        categorySales,
        topBrands,
        topModels,
        latestOrders,
        lowStockProducts,
        recentPayments,
      },
    });
  } catch (error: any) {
    console.error("GET /api/dashboard error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
