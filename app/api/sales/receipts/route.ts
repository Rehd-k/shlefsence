import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/mongodb";
import Receipt from "@/lib/models/Receipt";
import { requireTenantSession } from "@/lib/auth/apiAuth";

export async function GET(req: Request) {
  try {
    const auth = await requireTenantSession(req);
    if ("error" in auth) return auth.error;
    const { organizationId } = auth;

    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const warehouse = searchParams.get("warehouse") || "";
    const startDate = searchParams.get("startDate") || "";
    const endDate = searchParams.get("endDate") || "";

    const query: Record<string, unknown> = { organizationId };
    if (search) {
      query.$or = [
        { receiptNumber: { $regex: search, $options: "i" } },
        { invoiceNumber: { $regex: search, $options: "i" } },
        { customerName: { $regex: search, $options: "i" } },
      ];
    }
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

    const receipts = await Receipt.find(query).sort({ createdAt: -1 }).lean();

    const formatted = receipts.map((r: any) => ({
      ...r,
      id: r._id.toString(),
    }));

    return NextResponse.json({ success: true, data: formatted });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
