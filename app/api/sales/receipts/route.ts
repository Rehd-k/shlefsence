import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/mongodb";
import Receipt from "@/lib/models/Receipt";
import { SEED_RECEIPTS } from "@/lib/seed/salesSeedData";

export async function GET(req: Request) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";

    const query: any = {};
    if (search) {
      query.$or = [
        { receiptNumber: { $regex: search, $options: "i" } },
        { invoiceNumber: { $regex: search, $options: "i" } },
        { customerName: { $regex: search, $options: "i" } },
      ];
    }

    let receipts = await Receipt.find(query).sort({ createdAt: -1 }).lean();

    if (receipts.length === 0 && !search) {
      const seeded = await Receipt.insertMany(
        SEED_RECEIPTS.map((r) => {
          const { id, ...rest } = r;
          return rest;
        })
      );
      receipts = seeded.map((s) => s.toObject());
    }

    const formatted = receipts.map((r: any) => ({
      ...r,
      id: r._id.toString(),
    }));

    return NextResponse.json({ success: true, data: formatted });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
