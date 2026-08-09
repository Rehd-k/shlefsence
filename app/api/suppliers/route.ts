import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/mongodb";
import Supplier from "@/lib/models/Supplier";
export async function GET(req: Request) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";
    const industry = searchParams.get("industry") || "";

    let query: any = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { companyName: { $regex: search, $options: "i" } },
        { code: { $regex: search, $options: "i" } },
        { contact: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    if (status && status !== "ALL") {
      query.status = status;
    }

    if (industry && industry !== "ALL") {
      query.industry = { $regex: industry, $options: "i" };
    }

    const suppliers = await Supplier.find(query).sort({ createdAt: -1 }).lean();

    // Calculate aggregated KPIs across all suppliers
    const allSuppliers = await Supplier.find({}).lean();
    
    let totalPurchases = 0;
    let outstandingBalance = 0;
    let totalDeliveryDays = 0;
    let totalDefectRates = 0;
    let validDeliveryCount = 0;
    let activeSuppliersCount = 0;

    allSuppliers.forEach((sup: any) => {
      totalPurchases += sup.totalPurchasesValue || 0;
      outstandingBalance += sup.outstandingBalance || 0;

      if (sup.status === "Active" || sup.status === "Preferred") {
        activeSuppliersCount++;
      }

      if (sup.performance) {
        if (sup.performance.avgDeliveryDays) {
          totalDeliveryDays += sup.performance.avgDeliveryDays;
          validDeliveryCount++;
        }
        if (sup.performance.defectiveRate !== undefined) {
          totalDefectRates += sup.performance.defectiveRate;
        }
      }
    });

    const avgDeliveryTime = validDeliveryCount > 0 ? totalDeliveryDays / validDeliveryCount : 0;
    const avgDefectiveRate = allSuppliers.length > 0 ? totalDefectRates / allSuppliers.length : 0;

    const formattedSuppliers = suppliers.map((sup: any) => ({
      ...sup,
      id: sup._id.toString(),
    }));

    return NextResponse.json({
      success: true,
      data: formattedSuppliers,
      kpis: {
        totalPurchases,
        outstandingBalance,
        averageDeliveryTime: Number(avgDeliveryTime.toFixed(1)),
        defectiveRate: Number(avgDefectiveRate.toFixed(2)),
        activeSuppliersCount,
        totalSuppliersCount: allSuppliers.length,
      },
    });
  } catch (error: any) {
    console.error("GET /api/suppliers error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await connectToDatabase();
    const raw = await req.json();
    const { parseBody } = await import("@/lib/validators/parse");
    const { supplierCreateSchema } = await import("@/lib/validators/supplier");
    const parsed = parseBody(supplierCreateSchema, raw);
    if ("error" in parsed) return parsed.error;
    const body = { ...parsed.data } as Record<string, unknown>;

    // Generate unique code if not provided
    if (!body.code) {
      const count = await Supplier.countDocuments();
      body.code = `SUP-${1000 + count + 1}`;
    }

    if (!body.companyName) {
      body.companyName = body.name;
    }

    if (!body.rating) {
      body.rating = "98.0% Quality";
    }

    const newSupplier = await Supplier.create(body);
    const obj = newSupplier.toObject();

    return NextResponse.json({
      success: true,
      data: { ...obj, id: obj._id.toString() },
    });
  } catch (error: any) {
    console.error("POST /api/suppliers error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
