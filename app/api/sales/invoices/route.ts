import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/mongodb";
import Invoice from "@/lib/models/Invoice";
import { SEED_INVOICES } from "@/lib/seed/salesSeedData";

export async function GET(req: Request) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";

    const query: any = {};
    if (search) {
      query.$or = [
        { invoiceNumber: { $regex: search, $options: "i" } },
        { orderNumber: { $regex: search, $options: "i" } },
        { customerName: { $regex: search, $options: "i" } },
      ];
    }
    if (status && status !== "All") query.status = status;

    let invoices = await Invoice.find(query).sort({ createdAt: -1 }).lean();

    if (invoices.length === 0 && !search && (!status || status === "All")) {
      const seeded = await Invoice.insertMany(
        SEED_INVOICES.map((inv) => {
          const { id, ...rest } = inv;
          return rest;
        })
      );
      invoices = seeded.map((s) => s.toObject());
    }

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
    await connectToDatabase();
    const body = await req.json();

    const newInvoice = await Invoice.create(body);
    const obj = newInvoice.toObject();

    return NextResponse.json({
      success: true,
      data: { ...obj, id: obj._id.toString() },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
