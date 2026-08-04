import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/mongodb";
import Customer from "@/lib/models/Customer";
import { INITIAL_CRM_CUSTOMERS } from "@/lib/seed/crmSeedData";

export async function GET(req: Request) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const customerType = searchParams.get("customerType") || "";
    const sortBy = searchParams.get("sortBy") || "newest";

    const query: any = {};

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

    let sortOptions: any = { createdAt: -1 };
    if (sortBy === "debt_desc") {
      sortOptions = { outstandingDebt: -1 };
    } else if (sortBy === "wallet_desc") {
      sortOptions = { walletBalance: -1 };
    } else if (sortBy === "spent_desc") {
      sortOptions = { totalSpent: -1 };
    } else if (sortBy === "name_asc") {
      sortOptions = { businessName: 1 };
    }

    let customers = await Customer.find(query).sort(sortOptions).lean();

    // Auto-seed if DB is empty and no specific search filter is set
    if (customers.length === 0 && !search && !customerType) {
      const seeded = await Customer.insertMany(
        INITIAL_CRM_CUSTOMERS.map((c) => {
          const { id, ...rest } = c;
          return rest;
        })
      );
      customers = seeded.map((s) => s.toObject());
    }

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
    await connectToDatabase();
    const body = await req.json();

    if (!body.businessName || !body.contactName || !body.email || !body.phone) {
      return NextResponse.json(
        { success: false, error: "Business Name, Contact Name, Email, and Phone are required." },
        { status: 400 }
      );
    }

    const avatarColors = [
      "bg-indigo-600",
      "bg-purple-600",
      "bg-emerald-600",
      "bg-blue-600",
      "bg-amber-600",
      "bg-teal-600",
    ];
    const randomAvatar = avatarColors[Math.floor(Math.random() * avatarColors.length)];

    const initialTimeline = [
      {
        id: `tl-${Date.now()}`,
        type: "communication",
        title: "Customer Account Created",
        description: `Customer profile initialized as ${body.customerType || "Repair Shop"}`,
        badge: "New Profile",
        date: new Date().toISOString(),
      },
    ];

    const newCustomer = await Customer.create({
      ...body,
      avatarColor: body.avatarColor || randomAvatar,
      outstandingDebt: Number(body.outstandingDebt) || 0,
      walletBalance: Number(body.walletBalance) || 0,
      creditLimit: Number(body.creditLimit) || 0,
      tags: body.tags || [body.customerType || "Repair Shop"],
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
