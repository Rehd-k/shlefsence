import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/mongodb";
import { WarehouseCycleCount } from "@/lib/models/WarehouseOperation";
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
    const counts = await WarehouseCycleCount.find(query).sort({ createdAt: -1 }).lean();

    const formatted = counts.map((c: any) => ({
      ...c,
      id: c._id.toString(),
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

    const newCount = await WarehouseCycleCount.create({ ...body, organizationId });
    const obj = newCount.toObject();

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
    const { id, action, binCode, countedQty, performedBy } = body;

    const countDoc = await WarehouseCycleCount.findOne(
      tenantFilter(organizationId, { _id: id })
    );
    if (!countDoc) {
      return NextResponse.json({ success: false, error: "Cycle count audit not found" }, { status: 404 });
    }

    if (action === "UPDATE_COUNT") {
      const binItem = countDoc.bins.find((b) => b.binCode === binCode);
      if (binItem) {
        binItem.countedQty = Number(countedQty);
        binItem.variance = binItem.countedQty - binItem.systemQty;
      }
      countDoc.status = "In-Progress";
      await countDoc.save();
    } else if (action === "RECONCILE") {
      for (const b of countDoc.bins) {
        if (b.countedQty !== undefined && !b.reconciled && b.variance !== 0) {
          const variance = b.variance || 0;

          const bin = await WarehouseBin.findOne(
            tenantFilter(organizationId, { binCode: b.binCode })
          );
          if (bin) {
            const item = bin.items.find((i) => i.sku === b.sku);
            if (item) {
              item.quantity = Math.max(0, item.quantity + variance);
            } else if (variance > 0) {
              bin.items.push({ sku: b.sku, name: b.productName, quantity: variance });
            }
            bin.currentCount = bin.items.reduce((acc, curr) => acc + curr.quantity, 0);
            await bin.save();
          }

          let invItem = await InventoryItem.findOne(
            tenantFilter(organizationId, { sku: b.sku })
          );
          if (invItem) {
            const prevQty = invItem.quantity;
            invItem.quantity = Math.max(0, invItem.quantity + variance);
            await invItem.save();

            await InventoryMovement.create({
              organizationId,
              inventoryItemId: invItem._id,
              sku: invItem.sku,
              productName: invItem.product,
              type: "ADJUSTMENT",
              quantityChange: variance,
              previousQuantity: prevQty,
              newQuantity: invItem.quantity,
              toShelf: b.binCode,
              reason: `Cycle Count Reconciled (${countDoc.countId})`,
              performedBy: performedBy || "Inventory Auditor",
            });
          }

          b.reconciled = true;
        }
      }

      countDoc.status = "Reconciled";
      await countDoc.save();
    }

    return NextResponse.json({
      success: true,
      data: { ...countDoc.toObject(), id: countDoc._id.toString() },
    });
  } catch (error: any) {
    console.error("Cycle Count PUT error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
