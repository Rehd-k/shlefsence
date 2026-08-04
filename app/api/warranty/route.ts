import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/mongodb";
import WarrantyClaim from "@/lib/models/WarrantyClaim";

const INITIAL_WARRANTY_CLAIMS = [
  { claimId: "RMA-401", customer: "Apex Mobile Repairs Inc", part: "iPhone 15 Pro Max OLED Assembly", issue: "Touch digitizer unresponsive on bottom right", status: "Pending Inspection", date: "2026-07-29" },
  { claimId: "RMA-400", customer: "iFixFast Depot Brooklyn", part: "Galaxy S24 Ultra Battery Pack", issue: "Fails high-rate thermal cycle test", status: "Approved & Refunded", date: "2026-07-28" },
  { claimId: "RMA-399", customer: "QuickFix Cellular Queens", part: "Pixel 8 Pro Charging Port Flex", issue: "Physical pin bending post install", status: "Rejected (Physical Damage)", date: "2026-07-26" },
];

export async function GET() {
  try {
    await connectToDatabase();

    let claims = await WarrantyClaim.find({}).sort({ createdAt: -1 }).lean();

    if (claims.length === 0) {
      const seeded = await WarrantyClaim.insertMany(INITIAL_WARRANTY_CLAIMS);
      claims = seeded.map((s) => s.toObject());
    }

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
