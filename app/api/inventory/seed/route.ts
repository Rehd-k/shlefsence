import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/mongodb";
import { assertSeedAuthorized } from "@/lib/auth/seedGuard";
import InventoryItem from "@/lib/models/InventoryItem";
import InventoryMovement from "@/lib/models/InventoryMovement";
import { INITIAL_INVENTORY_ITEMS } from "@/lib/seed/inventorySeedData";

export async function POST(req: Request) {
  const denied = assertSeedAuthorized(req);
  if (denied) return denied;

  try {
    await connectToDatabase();
    await InventoryItem.deleteMany({});
    await InventoryMovement.deleteMany({});

    const createdItems = await InventoryItem.insertMany(INITIAL_INVENTORY_ITEMS);

    const movementsToCreate = createdItems.map((item) => ({
      inventoryItemId: item._id,
      sku: item.sku,
      productName: item.product,
      type: "RECEIPT",
      quantityChange: item.quantity,
      previousQuantity: 0,
      newQuantity: item.quantity,
      toWarehouse: item.warehouse,
      toShelf: item.shelf,
      reason: "Initial Warehouse Stock Intake PO-2026-001",
      performedBy: "System Seed",
    }));

    await InventoryMovement.insertMany(movementsToCreate);

    return NextResponse.json({
      success: true,
      message: `Seeded ${createdItems.length} inventory items and movement history entries successfully.`,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Seed failed";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
