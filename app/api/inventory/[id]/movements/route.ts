import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/mongodb";
import InventoryMovement from "@/lib/models/InventoryMovement";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await connectToDatabase();
    const movements = await InventoryMovement.find({
      $or: [{ inventoryItemId: id }, { sku: id }],
    })
      .sort({ createdAt: -1 })
      .lean();

    const formatted = movements.map((m) => ({
      ...m,
      _id: m._id.toString(),
      inventoryItemId: m.inventoryItemId?.toString?.() ?? String(m.inventoryItemId),
      createdAt: new Date(m.createdAt).toISOString(),
    }));

    return NextResponse.json({ success: true, data: formatted });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Database error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
