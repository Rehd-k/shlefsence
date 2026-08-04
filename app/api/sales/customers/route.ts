import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/mongodb";
import WholesaleCustomer from "@/lib/models/WholesaleCustomer";
import { SEED_WHOLESALE_CUSTOMERS } from "@/lib/seed/salesSeedData";

export async function GET(req: Request) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";

    const query: any = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { companyName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    let customers = await WholesaleCustomer.find(query).sort({ createdAt: -1 }).lean();

    if (customers.length === 0 && !search) {
      const seeded = await WholesaleCustomer.insertMany(
        SEED_WHOLESALE_CUSTOMERS.map((c) => {
          const { id, ...rest } = c;
          return rest;
        })
      );
      customers = seeded.map((s) => s.toObject());
    }

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
    await connectToDatabase();
    const body = await req.json();

    const newCustomer = await WholesaleCustomer.create(body);
    const obj = newCustomer.toObject();

    return NextResponse.json({
      success: true,
      data: { ...obj, id: obj._id.toString() },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
