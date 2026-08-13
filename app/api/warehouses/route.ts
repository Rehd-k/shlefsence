import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/mongodb";
import Warehouse from "@/lib/models/Warehouse";
import User from "@/lib/models/User";
import { requireTenantSession, tenantFilter } from "@/lib/auth/apiAuth";

export async function GET(req: Request) {
  try {
    const auth = await requireTenantSession(req);
    if ("error" in auth) return auth.error;
    const { organizationId } = auth;

    await connectToDatabase();

    const warehouses = await Warehouse.find({ organizationId }).sort({ createdAt: -1 }).lean();

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
    const auth = await requireTenantSession(req);
    if ("error" in auth) return auth.error;
    const { organizationId } = auth;

    await connectToDatabase();
    const body = await req.json();

    const newWarehouse = await Warehouse.create({ ...body, organizationId });

    if (body.manager) {
      const supervisor = await User.findOne(
        tenantFilter(organizationId, { name: body.manager, role: "Supervisor" })
      );
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
