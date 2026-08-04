import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/mongodb";
import PurchaseOrder from "@/lib/models/PurchaseOrder";

const INITIAL_POS = [
  { poNumber: "PO-2026-8810", supplier: "Foxconn Electronics Shenzhen", warehouse: "Main Hub - New York", totalUnits: 150, totalValue: 18750.0, status: "Awaiting Arrival", expectedDate: "2026-08-02" },
  { poNumber: "PO-2026-8809", supplier: "Sunsky Technology Wholesale", warehouse: "West Coast Depot - LA", totalUnits: 300, totalValue: 8400.0, status: "In Transit", expectedDate: "2026-08-01" },
  { poNumber: "PO-2026-8808", supplier: "DJI & Parts Global Corp", warehouse: "Central Hub - Texas", totalUnits: 80, totalValue: 12500.0, status: "Received & Putaway", expectedDate: "2026-07-28" },
];

export async function GET() {
  try {
    await connectToDatabase();

    let pos = await PurchaseOrder.find({}).sort({ createdAt: -1 }).lean();

    if (pos.length === 0) {
      const seeded = await PurchaseOrder.insertMany(INITIAL_POS);
      pos = seeded.map((s) => s.toObject());
    }

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
