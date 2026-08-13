import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/mongodb";
import { WarehouseBin } from "@/lib/models/WarehouseLocation";
import InventoryItem from "@/lib/models/InventoryItem";
import InventoryMovement from "@/lib/models/InventoryMovement";
import { requireTenantSession, tenantFilter } from "@/lib/auth/apiAuth";

export async function POST(req: Request) {
  try {
    const auth = await requireTenantSession(req);
    if ("error" in auth) return auth.error;
    const { organizationId } = auth;

    await connectToDatabase();
    const body = await req.json();
    const { binCode, sku, quantityChange, reason, performedBy } = body;

    if (!binCode || !sku || quantityChange === undefined) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }

    const qtyNum = Number(quantityChange);

    const bin = await WarehouseBin.findOne(tenantFilter(organizationId, { binCode }));
    if (!bin) {
      return NextResponse.json({ success: false, error: "Bin not found" }, { status: 404 });
    }

    let binItem = bin.items.find((i) => i.sku === sku);
    if (binItem) {
      binItem.quantity = Math.max(0, binItem.quantity + qtyNum);
    } else if (qtyNum > 0) {
      bin.items.push({ sku, name: sku, quantity: qtyNum });
    }
    bin.currentCount = bin.items.reduce((acc, curr) => acc + curr.quantity, 0);
    if (bin.currentCount >= bin.maxCapacity) bin.status = "Full";
    else if (bin.currentCount < bin.maxCapacity && bin.status === "Full") bin.status = "Available";
    await bin.save();

    let invItem = await InventoryItem.findOne(tenantFilter(organizationId, { sku }));
    let previousQuantity = 0;
    let newQuantity = 0;

    if (invItem) {
      previousQuantity = invItem.quantity;
      invItem.quantity = Math.max(0, invItem.quantity + qtyNum);
      newQuantity = invItem.quantity;
      await invItem.save();

      await InventoryMovement.create({
        organizationId,
        inventoryItemId: invItem._id,
        sku: invItem.sku,
        productName: invItem.product,
        type: qtyNum < 0 && reason?.toLowerCase().includes("damage") ? "DAMAGE" : "ADJUSTMENT",
        quantityChange: qtyNum,
        previousQuantity,
        newQuantity,
        toShelf: binCode,
        reason: reason || "Manual Bin Adjustment",
        performedBy: performedBy || "Warehouse Manager",
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        bin: bin.toObject(),
        sku,
        quantityChange: qtyNum,
        previousQuantity,
        newQuantity,
      },
    });
  } catch (error: any) {
    console.error("Adjustment POST error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
