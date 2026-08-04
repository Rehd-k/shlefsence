import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/mongodb";
import Warehouse from "@/lib/models/Warehouse";

const INITIAL_WAREHOUSES = [
  { name: "Main Hub - New York", address: "142 Logistics Way, Queens NY", skusCount: 1420, capacity: "84% Full", manager: "Alex Rivers" },
  { name: "West Coast Depot - LA", address: "880 Port Commerce Blvd, Long Beach CA", skusCount: 890, capacity: "62% Full", manager: "Sarah Jenkins" },
  { name: "Central Hub - Texas", address: "304 Cargo Pkwy, Dallas TX", skusCount: 610, capacity: "48% Full", manager: "Marcus Vance" },
  { name: "EU Logistics - Rotterdam", address: "Port Haven 12, Rotterdam Netherlands", skusCount: 420, capacity: "35% Full", manager: "Dirk Bakker" },
];

export async function GET() {
  try {
    await connectToDatabase();

    let warehouses = await Warehouse.find({}).sort({ createdAt: -1 }).lean();

    if (warehouses.length === 0) {
      const seeded = await Warehouse.insertMany(INITIAL_WAREHOUSES);
      warehouses = seeded.map((s) => s.toObject());
    }

    const formatted = warehouses.map((wh: any) => ({
      ...wh,
      id: wh._id.toString(),
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

    const newWarehouse = await Warehouse.create(body);
    const obj = newWarehouse.toObject();

    return NextResponse.json({
      success: true,
      data: { ...obj, id: obj._id.toString() },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
