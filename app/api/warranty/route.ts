import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/mongodb";
import WarrantyClaim from "@/lib/models/WarrantyClaim";

export async function GET() {
  try {
    await connectToDatabase();

    const claims = await WarrantyClaim.find({}).sort({ createdAt: -1 }).lean();

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
    await connectToDatabase();
    const body = await req.json();

    const newClaim = await WarrantyClaim.create(body);
    const obj = newClaim.toObject();

    return NextResponse.json({
      success: true,
      data: { ...obj, id: obj._id.toString() },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
