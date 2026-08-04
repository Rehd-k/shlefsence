import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/mongodb";
import InventoryItem from "@/lib/models/InventoryItem";
import Invoice from "@/lib/models/Invoice";
import Payment from "@/lib/models/Payment";
import PurchaseOrder from "@/lib/models/PurchaseOrder";
import WarrantyClaim from "@/lib/models/WarrantyClaim";
import {
  INITIAL_DASHBOARD_METRICS,
  INITIAL_DAILY_SALES,
  INITIAL_MONTHLY_REVENUE,
  INITIAL_CATEGORY_SALES,
  INITIAL_TOP_BRANDS,
  INITIAL_TOP_MODELS,
  INITIAL_LATEST_ORDERS,
  INITIAL_LOW_STOCK_PRODUCTS,
  INITIAL_RECENT_PAYMENTS,
} from "@/lib/seed/dashboardSeedData";

export async function GET() {
  try {
    await connectToDatabase();

    // Query collections for counts and totals
    const inventoryCount = await InventoryItem.countDocuments();
    const lowStockCount = await InventoryItem.countDocuments({ status: "LOW_STOCK" });
    const outOfStockCount = await InventoryItem.countDocuments({ status: "OUT_OF_STOCK" });
    const pendingPOsCount = await PurchaseOrder.countDocuments({ status: { $regex: "Awaiting|Transit", $options: "i" } });
    const warrantyClaimsCount = await WarrantyClaim.countDocuments();
    const latestInvoices = await Invoice.find({}).sort({ createdAt: -1 }).limit(5).lean();
    const recentPaymentsList = await Payment.find({}).sort({ createdAt: -1 }).limit(5).lean();

    const metrics = { ...INITIAL_DASHBOARD_METRICS };

    if (inventoryCount > 0) {
      metrics.lowStockAlerts = {
        count: lowStockCount || 23,
        criticalCount: Math.min(lowStockCount, 7),
      };
      metrics.outOfStockItems = {
        count: outOfStockCount || 6,
        lostRevenueEst: (outOfStockCount || 6) * 1400,
      };
    }

    if (pendingPOsCount > 0) {
      metrics.pendingPOs.count = pendingPOsCount;
    }

    if (warrantyClaimsCount > 0) {
      metrics.warrantyClaims.count = warrantyClaimsCount;
    }

    const latestOrders = latestInvoices.length > 0
      ? latestInvoices.map((inv: any) => ({
          id: inv._id.toString(),
          orderNumber: inv.orderNumber || inv.invoiceNumber,
          customerName: inv.customerName,
          customerType: inv.customerType || "Wholesale",
          itemsCount: inv.items?.length || 1,
          totalAmount: inv.totalAmount,
          paymentStatus: inv.status,
          fulfillmentStatus: inv.fulfillmentStatus,
          createdAt: inv.createdAt ? new Date(inv.createdAt).toISOString() : new Date().toISOString(),
        }))
      : INITIAL_LATEST_ORDERS;

    const recentPayments = recentPaymentsList.length > 0
      ? recentPaymentsList.map((p: any) => ({
          id: p._id.toString(),
          paymentRef: p.paymentRef,
          customerName: p.customerName,
          invoiceRef: p.invoiceNumber,
          amount: p.amount,
          paymentMethod: p.method,
          status: p.status,
          date: p.date,
        }))
      : INITIAL_RECENT_PAYMENTS;

    return NextResponse.json({
      success: true,
      data: {
        metrics,
        dailySales: INITIAL_DAILY_SALES,
        monthlyRevenue: INITIAL_MONTHLY_REVENUE,
        categorySales: INITIAL_CATEGORY_SALES,
        topBrands: INITIAL_TOP_BRANDS,
        topModels: INITIAL_TOP_MODELS,
        latestOrders,
        lowStockProducts: INITIAL_LOW_STOCK_PRODUCTS,
        recentPayments,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
