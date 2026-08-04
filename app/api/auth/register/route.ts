import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/mongodb";
import User from "@/lib/models/User";
import RolePermission from "@/lib/models/RolePermission";
import bcrypt from "bcrypt";

export async function POST(req: Request) {
  try {
    await connectToDatabase();
    const body = await req.json();
    const { name, email, password, role, assignedLocation, phone } = body;

    if (!name || !email || !password) {
      return NextResponse.json(
        { success: false, error: "Name, email and password are required" },
        { status: 400 }
      );
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json(
        { success: false, error: "A user with this email already exists" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: role || "Sales",
      assignedLocation: assignedLocation || "Main Hub - Lagos",
      phone: phone || "",
      status: "Active",
    });

    const userObj = user.toObject();
    delete (userObj as any).password;

    const permissionsData = await RolePermission.findOne({ role: user.role }).lean();
    let allowedPages: string[] = [];
    let allowAllLocations = false;

    if (permissionsData) {
      allowedPages = permissionsData.allowedPages || [];
      allowAllLocations = permissionsData.allowAllLocations ?? false;
    } else {
      const defaults: Record<string, { allowedPages: string[]; allowAllLocations: boolean }> = {
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
      const d = defaults[user.role] || { allowedPages: [], allowAllLocations: false };
      allowedPages = d.allowedPages;
      allowAllLocations = d.allowAllLocations;
    }

    return NextResponse.json({
      success: true,
      data: {
        ...userObj,
        id: userObj._id.toString(),
        permissions: {
          allowedPages,
          allowAllLocations,
        },
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
