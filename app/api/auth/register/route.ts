import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/mongodb";
import User from "@/lib/models/User";
import RolePermission from "@/lib/models/RolePermission";
import bcrypt from "bcrypt";
import { createSessionToken, setSessionCookie } from "@/lib/auth/session";
import { registerSchema } from "@/lib/validators/auth";

export async function POST(req: Request) {
  try {
    await connectToDatabase();
    const body = await req.json();
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Invalid registration payload", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { name, email, password, role, assignedLocation } = parsed.data;
    const phone = typeof body.phone === "string" ? body.phone : "";

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
      phone,
      status: "Active",
    });

    const userObj = user.toObject();
    delete (userObj as { password?: string }).password;

    const permissionsData = await RolePermission.findOne({ role: user.role }).lean();
    let allowedPages: string[] = [];
    let allowAllLocations = false;

    if (permissionsData) {
      allowedPages = permissionsData.allowedPages || [];
      allowAllLocations = permissionsData.allowAllLocations ?? false;
    } else {
      const defaults: Record<string, { allowedPages: string[]; allowAllLocations: boolean }> = {
        Admin: {
          allowedPages: [
            "dashboard",
            "crm",
            "products",
            "inventory",
            "sales",
            "purchase-orders",
            "suppliers",
            "warehouses",
            "warranty",
            "settings",
          ],
          allowAllLocations: true,
        },
        Manager: {
          allowedPages: [
            "dashboard",
            "crm",
            "products",
            "inventory",
            "sales",
            "purchase-orders",
            "suppliers",
            "warehouses",
            "warranty",
          ],
          allowAllLocations: true,
        },
        Supervisor: {
          allowedPages: [
            "dashboard",
            "products",
            "inventory",
            "sales",
            "purchase-orders",
            "warehouses",
            "warranty",
          ],
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

    const data = {
      ...userObj,
      id: userObj._id.toString(),
      permissions: {
        allowedPages,
        allowAllLocations,
      },
    };

    const token = await createSessionToken({
      id: data.id,
      email: data.email,
      name: data.name,
      role: data.role,
      assignedLocation: data.assignedLocation,
    });

    const response = NextResponse.json({
      success: true,
      data,
    });
    setSessionCookie(response, token);
    return response;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Registration failed";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
