import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/mongodb";
import Brand from "@/lib/models/Brand";
import { requireTenantSession } from "@/lib/auth/apiAuth";

export async function GET(req: Request) {
  try {
    const auth = await requireTenantSession(req);
    if ("error" in auth) return auth.error;
    const { organizationId } = auth;

    await connectToDatabase();
    const brands = await Brand.find({ organizationId }).sort({ name: 1 }).lean();

    const formatted = brands.map((b: any) => ({
      id: b._id.toString(),
      name: b.name,
      value: b.name,
      label: b.name,
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

    if (!body.name) {
      return NextResponse.json({ success: false, error: "Name is required" }, { status: 400 });
    }

    const newBrand = await Brand.create({ name: body.name, organizationId });
    const obj = newBrand.toObject();

    return NextResponse.json({
      success: true,
      data: {
        ...obj,
        id: obj._id.toString(),
        value: obj.name,
        label: obj.name,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
