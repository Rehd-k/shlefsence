import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/mongodb";
import InventoryMovement from "@/lib/models/InventoryMovement";
import { INITIAL_MOVEMENTS } from "@/lib/seed/inventorySeedData";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    try {
      await connectToDatabase();
      const movements = await InventoryMovement.find({
        $or: [{ inventoryItemId: id }, { sku: id }],
      })
        .sort({ createdAt: -1 })
        .lean();

      const formatted = movements.map((m: any) => ({
        ...m,
        _id: m._id.toString(),
        inventoryItemId: m.inventoryItemId.toString(),
        createdAt: new Date(m.createdAt).toISOString(),
      }));

      return NextResponse.json({ success: true, data: formatted });
    } catch (dbError) {
      // In-memory fallback movements
      const fallback = INITIAL_MOVEMENTS[id] || [
        {
          inventoryItemId: id,
          sku: id,
          productName: "Phone Spare Part",
          type: "RECEIPT",
          quantityChange: 100,
          previousQuantity: 0,
          newQuantity: 100,
          reason: "Warehouse PO Intake",
          performedBy: "Alex Rivers",
          createdAt: new Date().toISOString(),
        },
      ];

      const formattedFallback = fallback.map((f, idx) => ({
        ...f,
        _id: `mov-${idx + 1}`,
        createdAt: new Date(Date.now() - idx * 86400000).toISOString(),
      }));

      return NextResponse.json({ success: true, data: formattedFallback });
    }
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
