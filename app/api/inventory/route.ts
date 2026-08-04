import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/mongodb";
import InventoryItem from "@/lib/models/InventoryItem";
import InventoryMovement from "@/lib/models/InventoryMovement";
import { INITIAL_INVENTORY_ITEMS, INITIAL_MOVEMENTS } from "@/lib/seed/inventorySeedData";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const warehouse = searchParams.get("warehouse") || "";
    const brand = searchParams.get("brand") || "";
    const supplier = searchParams.get("supplier") || "";
    const category = searchParams.get("category") || "";
    const quality = searchParams.get("quality") || "";
    const status = searchParams.get("status") || "";

    try {
      await connectToDatabase();
      const query: any = {};

      if (search) {
        query.$or = [
          { sku: { $regex: search, $options: "i" } },
          { product: { $regex: search, $options: "i" } },
          { phoneModel: { $regex: search, $options: "i" } },
          { barcode: { $regex: search, $options: "i" } },
        ];
      }
      if (warehouse && warehouse !== "All Warehouses") query.warehouse = warehouse;
      if (brand) query.brand = brand;
      if (supplier) query.supplier = supplier;
      if (category) query.category = category;
      if (quality) query.quality = quality;
      if (status) query.status = status;

      let items = await InventoryItem.find(query).sort({ updatedAt: -1 }).lean();

      // If DB is empty, auto-seed with initial items
      if (items.length === 0 && !search && !warehouse && !brand && !supplier && !category && !quality && !status) {
        const created = await InventoryItem.insertMany(INITIAL_INVENTORY_ITEMS);
        items = created.map((doc) => doc.toObject());
      }

      const formatted = items.map((doc: any) => ({
        ...doc,
        _id: doc._id.toString(),
        available: Math.max(0, (doc.quantity || 0) - (doc.reserved || 0)),
        lastMovedAt: doc.lastMovedAt ? new Date(doc.lastMovedAt).toISOString() : new Date().toISOString(),
        createdAt: doc.createdAt ? new Date(doc.createdAt).toISOString() : new Date().toISOString(),
        updatedAt: doc.updatedAt ? new Date(doc.updatedAt).toISOString() : new Date().toISOString(),
      }));

      return NextResponse.json({ success: true, data: formatted });
    } catch (dbError) {
      console.warn("MongoDB offline or uninitialized, returning in-memory initial dataset:", dbError);
      
      // Memory filter fallback
      let fallback = INITIAL_INVENTORY_ITEMS.map((item, idx) => ({
        ...item,
        _id: `item-${idx + 1}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }));

      if (search) {
        const queryLower = search.toLowerCase();
        fallback = fallback.filter(
          (i) =>
            i.sku.toLowerCase().includes(queryLower) ||
            i.product.toLowerCase().includes(queryLower) ||
            i.phoneModel.toLowerCase().includes(queryLower) ||
            i.barcode.includes(queryLower)
        );
      }
      if (warehouse && warehouse !== "All Warehouses") {
        fallback = fallback.filter((i) => i.warehouse === warehouse);
      }
      if (brand) fallback = fallback.filter((i) => i.brand === brand);
      if (supplier) fallback = fallback.filter((i) => i.supplier === supplier);
      if (category) fallback = fallback.filter((i) => i.category === category);
      if (quality) fallback = fallback.filter((i) => i.quality === quality);
      if (status) fallback = fallback.filter((i) => i.status === status);

      return NextResponse.json({ success: true, data: fallback, fallback: true });
    }
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    await connectToDatabase();
    const newItem = await InventoryItem.create(body);

    // Create movement entry for initial import
    await InventoryMovement.create({
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
      performedBy: "Alex Rivers",
    });

    return NextResponse.json({ success: true, data: newItem }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
