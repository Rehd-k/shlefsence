import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/mongodb";
import PurchaseOrder from "@/lib/models/PurchaseOrder";
import { requireTenantSession } from "@/lib/auth/apiAuth";

export async function GET(req: Request) {
  try {
    const auth = await requireTenantSession(req);
    if ("error" in auth) return auth.error;
    const { organizationId } = auth;

    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const warehouse = searchParams.get("warehouse") || "";
    const startDate = searchParams.get("startDate") || "";
    const endDate = searchParams.get("endDate") || "";

    const query: Record<string, unknown> = { organizationId };
    if (warehouse && warehouse !== "All Locations" && warehouse !== "All Warehouses") {
      query.warehouse = warehouse;
    }
    if (startDate || endDate) {
      const createdAt: Record<string, Date> = {};
      if (startDate) createdAt.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        createdAt.$lte = end;
      }
      query.createdAt = createdAt;
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
    const auth = await requireTenantSession(req);
    if ("error" in auth) return auth.error;
    const { organizationId } = auth;

    await connectToDatabase();
    const body = await req.json();
    const { parseBody } = await import("@/lib/validators/parse");
    const { purchaseOrderCreateSchema } = await import("@/lib/validators/purchaseOrder");
    const parsed = parseBody(purchaseOrderCreateSchema, body);
    if ("error" in parsed) return parsed.error;

    const newPO = await PurchaseOrder.create({ ...parsed.data, organizationId });
    const obj = newPO.toObject();

    return NextResponse.json({
      success: true,
      data: { ...obj, id: obj._id.toString() },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
