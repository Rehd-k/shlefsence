import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/mongodb";
import { WarehouseReceiving } from "@/lib/models/WarehouseOperation";
import { WarehouseBin } from "@/lib/models/WarehouseLocation";
import InventoryItem from "@/lib/models/InventoryItem";
import InventoryMovement from "@/lib/models/InventoryMovement";

export async function GET(req: Request) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const warehouseId = searchParams.get("warehouseId");

    const query = warehouseId ? { warehouseId } : {};
    const receivings = await WarehouseReceiving.find(query).sort({ createdAt: -1 }).lean();

    const formatted = receivings.map((r: any) => ({
      ...r,
      id: r._id.toString(),
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

    const newReceiving = await WarehouseReceiving.create(body);
    const obj = newReceiving.toObject();

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
    const { id, action, binCode, sku, quantity, performedBy } = body;

    const receiving = await WarehouseReceiving.findById(id);
    if (!receiving) {
      return NextResponse.json({ success: false, error: "Receiving order not found" }, { status: 404 });
    }

    if (action === "PUTAWAY") {
      const item = receiving.items.find((i) => i.sku === sku);
      if (item) {
        item.receivedQty = (item.receivedQty || 0) + Number(quantity);
        item.binCode = binCode;
        item.status = "Putaway";
      }

      const allDone = receiving.items.every((i) => i.status === "Putaway");
      if (allDone) {
        receiving.status = "Completed";
      } else {
        receiving.status = "In-Progress";
      }
      await receiving.save();

      // Update WarehouseBin
      let bin = await WarehouseBin.findOne({ binCode });
      if (bin) {
        const existingItem = bin.items.find((i) => i.sku === sku);
        if (existingItem) {
          existingItem.quantity += Number(quantity);
        } else {
          bin.items.push({
            sku,
            name: item?.name || sku,
            quantity: Number(quantity),
          });
        }
        bin.currentCount = bin.items.reduce((acc, curr) => acc + curr.quantity, 0);
        if (bin.currentCount >= bin.maxCapacity) bin.status = "Full";
        await bin.save();
      }

      // Sync with global InventoryItem & create InventoryMovement log
      let invItem = await InventoryItem.findOne({ sku });
      if (invItem) {
        const prevQty = invItem.quantity;
        invItem.quantity += Number(quantity);
        await invItem.save();

        await InventoryMovement.create({
          inventoryItemId: invItem._id,
          sku: invItem.sku,
          productName: invItem.product,
          type: "RECEIPT",
          quantityChange: Number(quantity),
          previousQuantity: prevQty,
          newQuantity: invItem.quantity,
          toWarehouse: receiving.warehouseId?.toString(),
          toShelf: binCode,
          reason: `Receiving putaway for ${receiving.receiptNumber}`,
          performedBy: performedBy || "Warehouse Clerk",
        });
      }
    }

    return NextResponse.json({
      success: true,
      data: { ...receiving.toObject(), id: receiving._id.toString() },
    });
  } catch (error: any) {
    console.error("Receiving PUT error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
