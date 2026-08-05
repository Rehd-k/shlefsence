import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/mongodb";
import PurchaseOrder from "@/lib/models/PurchaseOrder";

const INITIAL_POS = [
  { poNumber: "PO-2026-8810", supplier: "Foxconn Electronics Shenzhen", warehouse: "Main Hub - New York", totalUnits: 150, totalValue: 18750.0, status: "Awaiting Arrival", expectedDate: "2026-08-02" },
  { poNumber: "PO-2026-8809", supplier: "Sunsky Technology Wholesale", warehouse: "West Coast Depot - LA", totalUnits: 300, totalValue: 8400.0, status: "In Transit", expectedDate: "2026-08-01" },
  { poNumber: "PO-2026-8808", supplier: "DJI & Parts Global Corp", warehouse: "Central Hub - Texas", totalUnits: 80, totalValue: 12500.0, status: "Received & Putaway", expectedDate: "2026-07-28" },
];

export async function GET(req: Request) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const warehouse = searchParams.get("warehouse") || "";
    const startDate = searchParams.get("startDate") || "";
    const endDate = searchParams.get("endDate") || "";

    const query: any = {};
    if (warehouse && warehouse !== "All Locations" && warehouse !== "All Warehouses") {
      query.warehouse = warehouse;
    }
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.createdAt.$lte = end;
      }
    }

    const pos = await PurchaseOrder.find(query).sort({ createdAt: -1 }).lean();

    const formatted = pos.map((po: any) => ({
      ...po,
      id: po._id.toString(),
    }));

    return NextResponse.json({ success: true, data: formatted });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await connectToDatabase();
    const body = await req.json();

    const newPO = await PurchaseOrder.create(body);
    const obj = newPO.toObject();

    return NextResponse.json({
      success: true,
      data: { ...obj, id: obj._id.toString() },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
