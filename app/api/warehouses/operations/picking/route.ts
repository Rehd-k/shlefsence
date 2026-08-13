import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/mongodb";
import { WarehousePicking } from "@/lib/models/WarehouseOperation";
import { WarehouseBin } from "@/lib/models/WarehouseLocation";
import InventoryItem from "@/lib/models/InventoryItem";
import InventoryMovement from "@/lib/models/InventoryMovement";
import { requireTenantSession, tenantFilter } from "@/lib/auth/apiAuth";

export async function GET(req: Request) {
  try {
    const auth = await requireTenantSession(req);
    if ("error" in auth) return auth.error;
    const { organizationId } = auth;

    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const warehouseId = searchParams.get("warehouseId");

    const query = warehouseId
      ? tenantFilter(organizationId, { warehouseId })
      : { organizationId };
    const pickings = await WarehousePicking.find(query).sort({ createdAt: -1 }).lean();

    const formatted = pickings.map((p: any) => ({
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

    const newPicking = await WarehousePicking.create({ ...body, organizationId });
    const obj = newPicking.toObject();

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
    const auth = await requireTenantSession(req);
    if ("error" in auth) return auth.error;
    const { organizationId } = auth;

    await connectToDatabase();
    const body = await req.json();
    const { id, sku, pickedQty, performedBy } = body;

    const picking = await WarehousePicking.findOne(tenantFilter(organizationId, { _id: id }));
    if (!picking) {
      return NextResponse.json({ success: false, error: "Pick ticket not found" }, { status: 404 });
    }

    const item = picking.items.find((i) => i.sku === sku);
    if (item) {
      item.pickedQty = Number(pickedQty);
      item.status = item.pickedQty >= item.requestedQty ? "Picked" : "Pending";

      const bin = await WarehouseBin.findOne(
        tenantFilter(organizationId, { binCode: item.binCode })
      );
      if (bin) {
        const binItem = bin.items.find((i) => i.sku === sku);
        if (binItem) {
          binItem.quantity = Math.max(0, binItem.quantity - Number(pickedQty));
        }
        bin.currentCount = bin.items.reduce((acc, curr) => acc + curr.quantity, 0);
        if (bin.currentCount < bin.maxCapacity && bin.status === "Full") bin.status = "Available";
        await bin.save();
      }

      let invItem = await InventoryItem.findOne(tenantFilter(organizationId, { sku }));
      if (invItem) {
        const prevQty = invItem.quantity;
        invItem.quantity = Math.max(0, invItem.quantity - Number(pickedQty));
        await invItem.save();

        await InventoryMovement.create({
          organizationId,
          inventoryItemId: invItem._id,
          sku: invItem.sku,
          productName: invItem.product,
          type: "SALE",
          quantityChange: -Number(pickedQty),
          previousQuantity: prevQty,
          newQuantity: invItem.quantity,
          fromWarehouse: picking.warehouseId?.toString(),
          fromShelf: item.binCode,
          reason: `Picked for ticket ${picking.ticketNumber}`,
          performedBy: performedBy || "Picker",
        });
      }
    }

    const allPicked = picking.items.every((i) => i.status === "Picked");
    picking.status = allPicked ? "Completed" : "Picking";
    await picking.save();

    return NextResponse.json({
      success: true,
      data: { ...picking.toObject(), id: picking._id.toString() },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
