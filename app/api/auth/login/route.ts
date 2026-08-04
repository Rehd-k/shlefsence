import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/mongodb";
import User from "@/lib/models/User";
import RolePermission from "@/lib/models/RolePermission";
import bcrypt from "bcrypt";

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
  const count = await User.countDocuments();
  if (count === 0) {
    for (const u of DEFAULT_USERS) {
      const hashedPassword = await bcrypt.hash(u.password, 10);
      await User.create({ ...u, password: hashedPassword });
    }
  }
}

export async function POST(req: Request) {
  try {
    await connectToDatabase();
    await seedDefaultUsers();

    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: "Email and password are required" },
        { status: 400 }
      );
    }

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

    const userData = {
      ...userObj,
      id: userObj._id.toString(),
      permissions: {
        allowedPages,
        allowAllLocations,
      },
    };

    return NextResponse.json({
      success: true,
      message: "Login successful",
      user: userData,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
