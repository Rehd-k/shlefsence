import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/mongodb";
import Product from "@/lib/models/Product";
import { INITIAL_PRODUCTS } from "@/lib/seed/productSeedData";

export async function GET(req: Request) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const brand = searchParams.get("brand") || "";
    const category = searchParams.get("category") || "";
    const quality = searchParams.get("quality") || "";

    const query: any = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { sku: { $regex: search, $options: "i" } },
        { barcode: { $regex: search, $options: "i" } },
        { compatibleModels: { $regex: search, $options: "i" } },
      ];
    }
    if (brand && brand !== "All") query.brand = brand;
    if (category && category !== "All") query.category = category;
    if (quality && quality !== "All") query.quality = quality;

    let products = await Product.find(query).sort({ createdAt: -1 }).lean();

    // Auto-seed if database empty
    if (products.length === 0 && !search && brand === "All" && category === "All") {
      const seeded = await Product.insertMany(
        INITIAL_PRODUCTS.map((p) => {
          const { id, ...rest } = p;
          return rest;
        })
      );
      products = seeded.map((s) => s.toObject());
    }

    const formatted = products.map((p: any) => ({
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

    const newProduct = await Product.create(body);
    const obj = newProduct.toObject();

    return NextResponse.json({
      success: true,
      data: { ...obj, id: obj._id.toString() },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
