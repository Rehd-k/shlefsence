import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/mongodb";
import Warehouse from "@/lib/models/Warehouse";
import { WarehouseZone, WarehouseRack, WarehouseShelf, WarehouseBin } from "@/lib/models/WarehouseLocation";

export async function GET(req: Request) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    let warehouseId = searchParams.get("warehouseId");

    let warehouse;
    if (warehouseId) {
      warehouse = await Warehouse.findById(warehouseId).lean();
    }
    if (!warehouse) {
      warehouse = await Warehouse.findOne({}).sort({ createdAt: 1 }).lean();
      if (!warehouse) {
        return NextResponse.json({ success: false, error: "No warehouse found. Please run seed." }, { status: 404 });
      }
    }

    const whId = (warehouse as any)._id;

    const zones = await WarehouseZone.find({ warehouseId: whId }).sort({ code: 1 }).lean();
    const racks = await WarehouseRack.find({ warehouseId: whId }).sort({ code: 1 }).lean();
    const shelves = await WarehouseShelf.find({ warehouseId: whId }).sort({ code: 1 }).lean();
    const bins = await WarehouseBin.find({ warehouseId: whId }).sort({ binCode: 1 }).lean();

    return NextResponse.json({
      success: true,
      data: {
        warehouse: { ...warehouse, id: (warehouse as any)._id.toString() },
        zones: zones.map((z: any) => ({ ...z, id: z._id.toString() })),
        racks: racks.map((r: any) => ({ ...r, id: r._id.toString() })),
        shelves: shelves.map((s: any) => ({ ...s, id: s._id.toString() })),
        bins: bins.map((b: any) => ({ ...b, id: b._id.toString() })),
      },
    });
  } catch (error: any) {
    console.error("Hierarchy fetch error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await connectToDatabase();
    const body = await req.json();
    const { type, payload } = body;

    if (type === "ZONE") {
      const zone = await WarehouseZone.create(payload);
      return NextResponse.json({ success: true, data: zone });
    } else if (type === "RACK") {
      const rack = await WarehouseRack.create(payload);
      return NextResponse.json({ success: true, data: rack });
    } else if (type === "SHELF") {
      const shelf = await WarehouseShelf.create(payload);
      return NextResponse.json({ success: true, data: shelf });
    } else if (type === "BIN") {
      const bin = await WarehouseBin.create(payload);
      return NextResponse.json({ success: true, data: bin });
    }

    return NextResponse.json({ success: false, error: "Invalid node type" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
