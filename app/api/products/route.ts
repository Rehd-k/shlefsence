import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/mongodb";
import Product from "@/lib/models/Product";
import { requireTenantSession } from "@/lib/auth/apiAuth";

export async function GET(req: Request) {
  try {
    const auth = await requireTenantSession(req);
    if ("error" in auth) return auth.error;
    const { organizationId } = auth;

    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const brand = searchParams.get("brand") || "";
    const category = searchParams.get("category") || "";
    const quality = searchParams.get("quality") || "";

    const query: Record<string, unknown> = { organizationId };

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

    const products = await Product.find(query).sort({ createdAt: -1 }).lean();

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
    const auth = await requireTenantSession(req);
    if ("error" in auth) return auth.error;
    const { organizationId } = auth;

    await connectToDatabase();
    const body = await req.json();
    const { parseBody } = await import("@/lib/validators/parse");
    const { productCreateSchema } = await import("@/lib/validators/product");
    const parsed = parseBody(productCreateSchema, body);
    if ("error" in parsed) return parsed.error;

    const newProduct = await Product.create({ ...parsed.data, organizationId });
    const obj = newProduct.toObject();

    return NextResponse.json({
      success: true,
      data: { ...obj, id: obj._id.toString() },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
