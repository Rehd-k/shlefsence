import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/mongodb";
import Customer from "@/lib/models/Customer";
import { requireTenantSession } from "@/lib/auth/apiAuth";

export async function GET(req: Request) {
  try {
    const auth = await requireTenantSession(req);
    if ("error" in auth) return auth.error;
    const { organizationId } = auth;

    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const customerType = searchParams.get("customerType") || "";
    const sortBy = searchParams.get("sortBy") || "newest";
    const warehouse = searchParams.get("warehouse") || "";

    const query: Record<string, unknown> = { organizationId };

    if (warehouse && warehouse !== "All Locations" && warehouse !== "All Warehouses") {
      query.warehouse = warehouse;
    }

    if (search) {
      query.$or = [
        { businessName: { $regex: search, $options: "i" } },
        { contactName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
        { "address.city": { $regex: search, $options: "i" } },
        { tags: { $regex: search, $options: "i" } },
      ];
    }

    if (customerType && customerType !== "All") {
      query.customerType = customerType;
    }

    let sortOptions: Record<string, 1 | -1> = { createdAt: -1 };
    if (sortBy === "debt_desc") {
      sortOptions = { outstandingDebt: -1 };
    } else if (sortBy === "wallet_desc") {
      sortOptions = { walletBalance: -1 };
    } else if (sortBy === "spent_desc") {
      sortOptions = { totalSpent: -1 };
    } else if (sortBy === "name_asc") {
      sortOptions = { businessName: 1 };
    }

    const customers = await Customer.find(query).sort(sortOptions).lean();

    const formatted = customers.map((c: any) => ({
      ...c,
      id: c._id.toString(),
    }));

    return NextResponse.json({ success: true, data: formatted });
  } catch (error: any) {
    console.error("GET /api/crm/customers error:", error);
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
    const { parseBody } = await import("@/lib/validators/parse");
    const { customerCreateSchema } = await import("@/lib/validators/crm");
    const parsed = parseBody(customerCreateSchema, body);
    if ("error" in parsed) return parsed.error;
    const bodyData = parsed.data as Record<string, unknown>;

    const avatarColors = [
      "bg-indigo-600",
      "bg-purple-600",
      "bg-emerald-600",
      "bg-blue-600",
      "bg-amber-600",
      "bg-teal-600",
    ];
    const randomAvatar = avatarColors[Math.floor(Math.random() * avatarColors.length)];
    const customerType = String(bodyData.customerType || "Repair Shop");

    const initialTimeline = [
      {
        id: `tl-${Date.now()}`,
        type: "communication" as const,
        title: "Customer Account Created",
        description: `Customer profile initialized as ${customerType}`,
        badge: "New Profile",
        date: new Date().toISOString(),
      },
    ];

    const newCustomer = await Customer.create({
      ...bodyData,
      organizationId,
      avatarColor: (bodyData.avatarColor as string) || randomAvatar,
      outstandingDebt: Number(bodyData.outstandingDebt) || 0,
      walletBalance: Number(bodyData.walletBalance) || 0,
      creditLimit: Number(bodyData.creditLimit) || 0,
      tags: (bodyData.tags as string[]) || [customerType],
      timeline: initialTimeline,
      communications: [],
      returnsHistory: [],
    });

    const obj = newCustomer.toObject();

    return NextResponse.json({
      success: true,
      data: { ...obj, id: obj._id.toString() },
    });
  } catch (error: any) {
    console.error("POST /api/crm/customers error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
