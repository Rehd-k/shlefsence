import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/mongodb";
import { WarehousePacking } from "@/lib/models/WarehouseOperation";

export async function GET(req: Request) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const warehouseId = searchParams.get("warehouseId");

    const query = warehouseId ? { warehouseId } : {};
    const packings = await WarehousePacking.find(query).sort({ createdAt: -1 }).lean();

    const formatted = packings.map((p: any) => ({
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

    const newPacking = await WarehousePacking.create(body);
    const obj = newPacking.toObject();

    return NextResponse.json({
      success: true,
      data: { ...obj, id: obj._id.toString() },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    await connectToDatabase();
    const body = await req.json();
    const { id, status, packageType, weightKg, trackingNumber } = body;

    const packing = await WarehousePacking.findById(id);
    if (!packing) {
      return NextResponse.json({ success: false, error: "Pack order not found" }, { status: 404 });
    }

    if (status) packing.status = status;
    if (packageType) packing.packageType = packageType;
    if (weightKg !== undefined) packing.weightKg = weightKg;
    if (trackingNumber) packing.trackingNumber = trackingNumber;

    await packing.save();

    return NextResponse.json({
      success: true,
      data: { ...packing.toObject(), id: packing._id.toString() },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
