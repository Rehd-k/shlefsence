import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/mongodb";
import QualityGrade from "@/lib/models/QualityGrade";
import { requireTenantSession } from "@/lib/auth/apiAuth";

export async function GET(req: Request) {
  try {
    const auth = await requireTenantSession(req);
    if ("error" in auth) return auth.error;
    const { organizationId } = auth;

    await connectToDatabase();
    const grades = await QualityGrade.find({ organizationId }).sort({ name: 1 }).lean();

    const formatted = grades.map((g: any) => ({
      id: g._id.toString(),
      name: g.name,
      label: g.label,
      value: g.name,
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

    if (!body.name || !body.label) {
      return NextResponse.json({ success: false, error: "Name and Label are required" }, { status: 400 });
    }

    const newGrade = await QualityGrade.create({
      organizationId,
      name: body.name,
      label: body.label,
    });
    const obj = newGrade.toObject();

    return NextResponse.json({
      success: true,
      data: {
        ...obj,
        id: obj._id.toString(),
        value: obj.name,
        label: obj.label,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
