import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/mongodb";
import User from "@/lib/models/User";
import RolePermission from "@/lib/models/RolePermission";
import bcrypt from "bcrypt";
import { createSessionToken, setSessionCookie } from "@/lib/auth/session";
import { loginSchema } from "@/lib/validators/auth";

interface SeedUser {
  name: string;
  email: string;
  password: string;
  role: "Admin" | "Manager" | "Supervisor" | "Sales";
  assignedLocation: string;
  status: "Active" | "Inactive";
}

const DEFAULT_USERS: SeedUser[] = [
  {
    name: "System Admin",
    email: "admin@shelfsense.ng",
    password: "Password123!",
    role: "Admin",
    assignedLocation: "All Locations",
    status: "Active",
  },
  {
    name: "Operations Manager",
    email: "manager@shelfsense.ng",
    password: "Password123!",
    role: "Manager",
    assignedLocation: "Main Hub - Lagos",
    status: "Active",
  },
  {
    name: "Lagos Supervisor",
    email: "supervisor@shelfsense.ng",
    password: "Password123!",
    role: "Supervisor",
    assignedLocation: "Main Hub - Lagos",
    status: "Active",
  },
  {
    name: "Ikeja POS Staff",
    email: "sales@shelfsense.ng",
    password: "Password123!",
    role: "Sales",
    assignedLocation: "Ikeja Shop Counter",
    status: "Active",
  },
];

async function seedDefaultUsers() {
  // Never auto-seed demo users in production
  if (process.env.NODE_ENV === "production") return;

  const count = await User.countDocuments();
  if (count === 0) {
    for (const u of DEFAULT_USERS) {
      const hashedPassword = await bcrypt.hash(u.password, 10);
      await User.create({ ...u, password: hashedPassword });
    }
  }
}

function defaultPermissions(role: string) {
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
  return defaults[role] || { allowedPages: [], allowAllLocations: false };
}

export async function POST(req: Request) {
  try {
    await connectToDatabase();
    await seedDefaultUsers();

    const body = await req.json();
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Invalid credentials payload", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { email, password } = parsed.data;

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Invalid email or password" },
        { status: 401 }
      );
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return NextResponse.json(
        { success: false, error: "Invalid email or password" },
        { status: 401 }
      );
    }

    const userObj = user.toObject();
    delete (userObj as { password?: string }).password;

    const permissionsData = await RolePermission.findOne({ role: user.role }).lean();
    const fallback = defaultPermissions(user.role);
    const allowedPages = permissionsData?.allowedPages || fallback.allowedPages;
    const allowAllLocations = permissionsData?.allowAllLocations ?? fallback.allowAllLocations;

    const userData = {
      ...userObj,
      id: userObj._id.toString(),
      permissions: {
        allowedPages,
        allowAllLocations,
      },
    };

    const token = await createSessionToken({
      id: userData.id,
      email: userData.email,
      name: userData.name,
      role: userData.role,
      assignedLocation: userData.assignedLocation,
    });

    const response = NextResponse.json({
      success: true,
      message: "Login successful",
      user: userData,
    });
    setSessionCookie(response, token);
    return response;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Login failed";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
