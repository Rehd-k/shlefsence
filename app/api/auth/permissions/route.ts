import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/mongodb";
import RolePermission from "@/lib/models/RolePermission";

const DEFAULT_PERMISSIONS: Record<string, { allowedPages: string[]; allowAllLocations: boolean }> = {
  Admin: {
    allowedPages: ["dashboard", "crm", "products", "inventory", "sales", "purchase-orders", "suppliers", "warehouses", "warranty", "settings"],
    allowAllLocations: true,
  },
  Manager: {
    allowedPages: ["dashboard", "crm", "products", "inventory", "sales", "purchase-orders", "suppliers", "warehouses", "warranty"],
    allowAllLocations: true,
  },
  Supervisor: {
    allowedPages: ["dashboard", "products", "inventory", "sales", "purchase-orders", "warehouses", "warranty"],
    allowAllLocations: false,
  },
  Sales: {
    allowedPages: ["sales"],
    allowAllLocations: false,
  },
};

export async function GET(request: Request) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const role = searchParams.get("role");

    if (!role) {
      // If no role is requested, return all permissions docs (for admin settings page)
      const allPerms = await RolePermission.find({}).lean();
      return NextResponse.json({ success: true, data: allPerms });
    }

    let perms = await RolePermission.findOne({ role }).lean();

    // Fallback to hardcoded defaults if DB doesn't have it yet
    if (!perms && DEFAULT_PERMISSIONS[role]) {
      perms = {
        role,
        allowedPages: DEFAULT_PERMISSIONS[role].allowedPages,
        allowAllLocations: DEFAULT_PERMISSIONS[role].allowAllLocations,
      } as any;
    }

    return NextResponse.json({ success: true, data: perms });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await connectToDatabase();
    const body = await request.json();
    const { role, allowedPages, allowAllLocations } = body;

    if (!role) {
      return NextResponse.json({ success: false, error: "Role is required" }, { status: 400 });
    }

    const updated = await RolePermission.findOneAndUpdate(
      { role },
      { allowedPages, allowAllLocations },
      { new: true, upsert: true }
    );

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
