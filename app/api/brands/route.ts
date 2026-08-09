import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/mongodb";
import Brand from "@/lib/models/Brand";

export async function GET() {
  try {
    await connectToDatabase();
    const brands = await Brand.find({}).sort({ name: 1 }).lean();
    
    // Format to match Select component options
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
    await connectToDatabase();
    const body = await req.json();

    if (!body.name) {
      return NextResponse.json({ success: false, error: "Name is required" }, { status: 400 });
    }

    const newBrand = await Brand.create({ name: body.name });
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
