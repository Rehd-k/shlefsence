import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/mongodb";
import WarrantyClaim from "@/lib/models/WarrantyClaim";
import { requireTenantSession } from "@/lib/auth/apiAuth";

export async function GET(req: Request) {
  try {
    const auth = await requireTenantSession(req);
    if ("error" in auth) return auth.error;
    const { organizationId } = auth;

    await connectToDatabase();

    const claims = await WarrantyClaim.find({ organizationId }).sort({ createdAt: -1 }).lean();

    const formatted = claims.map((c: any) => ({
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

    const newClaim = await WarrantyClaim.create({ ...body, organizationId });
    const obj = newClaim.toObject();

    return NextResponse.json({
      success: true,
      data: { ...obj, id: obj._id.toString() },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
