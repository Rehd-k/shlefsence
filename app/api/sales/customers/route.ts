import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/mongodb";
import WholesaleCustomer from "@/lib/models/WholesaleCustomer";
import { requireTenantSession } from "@/lib/auth/apiAuth";

export async function GET(req: Request) {
  try {
    const auth = await requireTenantSession(req);
    if ("error" in auth) return auth.error;
    const { organizationId } = auth;

    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";

    const query: Record<string, unknown> = { organizationId };
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { companyName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    const customers = await WholesaleCustomer.find(query).sort({ createdAt: -1 }).lean();

    const formatted = customers.map((c: any) => ({
      ...c,
      id: c._id.toString(),
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

    const newCustomer = await WholesaleCustomer.create({ ...body, organizationId });
    const obj = newCustomer.toObject();

    return NextResponse.json({
      success: true,
      data: { ...obj, id: obj._id.toString() },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
