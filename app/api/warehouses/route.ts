import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/mongodb";
import Warehouse from "@/lib/models/Warehouse";
import User from "@/lib/models/User";

export async function GET() {
  try {
    await connectToDatabase();

    const warehouses = await Warehouse.find({}).sort({ createdAt: -1 }).lean();

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
    
    // Find selected supervisor User and associate this warehouse with them
    if (body.manager) {
      const supervisor = await User.findOne({ name: body.manager, role: "Supervisor" });
      if (supervisor) {
        if (!supervisor.supervisedLocations) {
          supervisor.supervisedLocations = [];
        }
        if (!supervisor.supervisedLocations.includes(body.name)) {
          supervisor.supervisedLocations.push(body.name);
          await supervisor.save();
        }
      }
    }

    const obj = newWarehouse.toObject();

    return NextResponse.json({
      success: true,
      data: { ...obj, id: obj._id.toString() },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
