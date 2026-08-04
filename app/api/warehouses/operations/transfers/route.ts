import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/mongodb";
import { WarehouseTransfer } from "@/lib/models/WarehouseOperation";
import { WarehouseBin } from "@/lib/models/WarehouseLocation";
import InventoryItem from "@/lib/models/InventoryItem";
import InventoryMovement from "@/lib/models/InventoryMovement";

export async function GET() {
  try {
    await connectToDatabase();
    const transfers = await WarehouseTransfer.find({}).sort({ createdAt: -1 }).lean();

    const formatted = transfers.map((t: any) => ({
      ...t,
      id: t._id.toString(),
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

    const newTransfer = await WarehouseTransfer.create(body);
    const obj = newTransfer.toObject();

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
    const { id, status, performedBy } = body;

    const transfer = await WarehouseTransfer.findById(id);
    if (!transfer) {
      return NextResponse.json({ success: false, error: "Transfer document not found" }, { status: 404 });
    }

    const prevStatus = transfer.status;
    transfer.status = status;
    await transfer.save();

    if (status === "Completed" && prevStatus !== "Completed") {
      for (const item of transfer.items) {
        // Deduct from source bin
        const srcBin = await WarehouseBin.findOne({ binCode: item.sourceBinCode });
        if (srcBin) {
          const binItem = srcBin.items.find((i) => i.sku === item.sku);
          if (binItem) {
            binItem.quantity = Math.max(0, binItem.quantity - item.quantity);
          }
          srcBin.currentCount = srcBin.items.reduce((acc, curr) => acc + curr.quantity, 0);
          await srcBin.save();
        }

        // Add to target bin if targetBinCode specified
        if (item.targetBinCode) {
          let tgtBin = await WarehouseBin.findOne({ binCode: item.targetBinCode });
          if (tgtBin) {
            const tgtItem = tgtBin.items.find((i) => i.sku === item.sku);
            if (tgtItem) {
              tgtItem.quantity += item.quantity;
            } else {
              tgtBin.items.push({ sku: item.sku, name: item.name, quantity: item.quantity });
            }
            tgtBin.currentCount = tgtBin.items.reduce((acc, curr) => acc + curr.quantity, 0);
            await tgtBin.save();
          }
        }

        // Log movement
        let invItem = await InventoryItem.findOne({ sku: item.sku });
        if (invItem) {
          await InventoryMovement.create({
            inventoryItemId: invItem._id,
            sku: invItem.sku,
            productName: invItem.product,
            type: "TRANSFER",
            quantityChange: item.quantity,
            previousQuantity: invItem.quantity,
            newQuantity: invItem.quantity,
            fromWarehouse: transfer.sourceWarehouseName,
            toWarehouse: transfer.targetWarehouseName,
            fromShelf: item.sourceBinCode,
            toShelf: item.targetBinCode,
            reason: `Transfer ${transfer.transferNumber} completed`,
            performedBy: performedBy || "Transfer Operator",
          });
        }
      }
    }

    return NextResponse.json({
      success: true,
      data: { ...transfer.toObject(), id: transfer._id.toString() },
    });
  } catch (error: any) {
    console.error("Transfer PUT error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
