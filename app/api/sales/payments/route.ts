import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/mongodb";
import Payment from "@/lib/models/Payment";
import { SEED_PAYMENTS } from "@/lib/seed/salesSeedData";

export async function GET(req: Request) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";

    const query: any = {};
    if (search) {
      query.$or = [
        { paymentRef: { $regex: search, $options: "i" } },
        { invoiceNumber: { $regex: search, $options: "i" } },
        { customerName: { $regex: search, $options: "i" } },
      ];
    }

    let payments = await Payment.find(query).sort({ createdAt: -1 }).lean();

    if (payments.length === 0 && !search) {
      const seeded = await Payment.insertMany(
        SEED_PAYMENTS.map((p) => {
          const { id, ...rest } = p;
          return rest;
        })
      );
      payments = seeded.map((s) => s.toObject());
    }

    const formatted = payments.map((p: any) => ({
      ...p,
      id: p._id.toString(),
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

    const newPayment = await Payment.create(body);
    const obj = newPayment.toObject();

    return NextResponse.json({
      success: true,
      data: { ...obj, id: obj._id.toString() },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
