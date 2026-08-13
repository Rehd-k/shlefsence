import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/mongodb";
import InventoryItem from "@/lib/models/InventoryItem";
import InventoryMovement from "@/lib/models/InventoryMovement";
import { requireTenantSession, actorName } from "@/lib/auth/apiAuth";

export async function GET(request: Request) {
  try {
    const auth = await requireTenantSession(request);
    if ("error" in auth) return auth.error;
    const { organizationId } = auth;

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const warehouse = searchParams.get("warehouse") || "";
    const brand = searchParams.get("brand") || "";
    const supplier = searchParams.get("supplier") || "";
    const category = searchParams.get("category") || "";
    const quality = searchParams.get("quality") || "";
    const status = searchParams.get("status") || "";

    await connectToDatabase();
    const query: Record<string, unknown> = { organizationId };

    if (search) {
      query.$or = [
        { sku: { $regex: search, $options: "i" } },
        { product: { $regex: search, $options: "i" } },
        { phoneModel: { $regex: search, $options: "i" } },
        { barcode: { $regex: search, $options: "i" } },
      ];
    }
    if (warehouse && warehouse !== "All Warehouses" && warehouse !== "All Locations") {
      query.warehouse = warehouse;
    }
    if (brand) query.brand = brand;
    if (supplier) query.supplier = supplier;
    if (category) query.category = category;
    if (quality) query.quality = quality;
    if (status) query.status = status;

    const items = await InventoryItem.find(query).sort({ updatedAt: -1 }).lean();

    const formatted = items.map((doc: any) => ({
      ...doc,
      _id: doc._id.toString(),
      id: doc._id.toString(),
      available: Math.max(0, (doc.quantity || 0) - (doc.reserved || 0)),
      lastMovedAt: doc.lastMovedAt ? new Date(doc.lastMovedAt).toISOString() : new Date().toISOString(),
      createdAt: doc.createdAt ? new Date(doc.createdAt).toISOString() : new Date().toISOString(),
      updatedAt: doc.updatedAt ? new Date(doc.updatedAt).toISOString() : new Date().toISOString(),
    }));

    return NextResponse.json({ success: true, data: formatted });
  } catch (error: any) {
    console.error("GET /api/inventory error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const auth = await requireTenantSession(request);
    if ("error" in auth) return auth.error;
    const { organizationId, session } = auth;

    const body = await request.json();
    await connectToDatabase();
    const { parseBody } = await import("@/lib/validators/parse");
    const { inventoryCreateSchema } = await import("@/lib/validators/inventory");
    const parsed = parseBody(inventoryCreateSchema, body);
    if ("error" in parsed) return parsed.error;

    const newItem = await InventoryItem.create({ ...parsed.data, organizationId });

    await InventoryMovement.create({
      organizationId,
      inventoryItemId: newItem._id,
      sku: newItem.sku,
      productName: newItem.product,
      type: "INITIAL_IMPORT",
      quantityChange: newItem.quantity,
      previousQuantity: 0,
      newQuantity: newItem.quantity,
      toWarehouse: newItem.warehouse,
      toShelf: newItem.shelf,
      reason: "Initial item creation in ERP",
      performedBy: actorName(session),
    });

    return NextResponse.json({ success: true, data: newItem }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
