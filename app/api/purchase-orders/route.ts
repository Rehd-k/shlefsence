import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/mongodb";
import PurchaseOrder from "@/lib/models/PurchaseOrder";

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
    const { parseBody } = await import("@/lib/validators/parse");
    const { purchaseOrderCreateSchema } = await import("@/lib/validators/purchaseOrder");
    const parsed = parseBody(purchaseOrderCreateSchema, body);
    if ("error" in parsed) return parsed.error;

    const newPO = await PurchaseOrder.create(parsed.data);
    const obj = newPO.toObject();

    return NextResponse.json({
      success: true,
      data: { ...obj, id: obj._id.toString() },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
