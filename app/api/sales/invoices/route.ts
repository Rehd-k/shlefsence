import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/mongodb";
import Invoice from "@/lib/models/Invoice";
import { requireTenantSession } from "@/lib/auth/apiAuth";

export async function GET(req: Request) {
  try {
    const auth = await requireTenantSession(req);
    if ("error" in auth) return auth.error;
    const { organizationId } = auth;

    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";
    const warehouse = searchParams.get("warehouse") || "";
    const startDate = searchParams.get("startDate") || "";
    const endDate = searchParams.get("endDate") || "";

    const query: Record<string, unknown> = { organizationId };
    if (search) {
      query.$or = [
        { invoiceNumber: { $regex: search, $options: "i" } },
        { orderNumber: { $regex: search, $options: "i" } },
        { customerName: { $regex: search, $options: "i" } },
      ];
    }
    if (status && status !== "All") query.status = status;
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

    const invoices = await Invoice.find(query).sort({ createdAt: -1 }).lean();

    const formatted = invoices.map((inv: any) => ({
      ...inv,
      id: inv._id.toString(),
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
    const { invoiceCreateSchema } = await import("@/lib/validators/sales");
    const parsed = parseBody(invoiceCreateSchema, body);
    if ("error" in parsed) return parsed.error;

    const newInvoice = await Invoice.create({ ...parsed.data, organizationId });
    const obj = newInvoice.toObject();

    return NextResponse.json({
      success: true,
      data: { ...obj, id: obj._id.toString() },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
