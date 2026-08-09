import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/mongodb";
import Product from "@/lib/models/Product";
import Receipt from "@/lib/models/Receipt";
import StoreSettings from "@/lib/models/StoreSettings";
import { getSessionFromRequest } from "@/lib/auth/session";
import { posSaleSchema } from "@/lib/validators/sales";

export async function GET(req: Request) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const warehouse = searchParams.get("warehouse") || "";

    const query: Record<string, string> = {};
    if (warehouse && warehouse !== "All Locations" && warehouse !== "All Warehouses") {
      query.warehouse = warehouse;
    }

    const products = await Product.find(query).sort({ name: 1 }).lean();

    const posCatalog = products.map((p) => ({
      id: p._id.toString(),
      sku: p.sku,
      name: p.name,
      brand: p.brand,
      category: p.category,
      quality: p.quality,
      retailPrice: p.sellingPrice || 0,
      wholesalePrice: p.wholesalePrice || 0,
      stock: p.stock?.available ?? p.stock?.total ?? 0,
      image: p.image || "",
      barcode: p.barcode,
      shelf: p.shelf || "",
      warehouse: p.warehouse || "",
    }));

    return NextResponse.json({ success: true, data: posCatalog });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to load POS catalog";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await connectToDatabase();
    const session = await getSessionFromRequest(req);
    const body = await req.json();
    const parsed = posSaleSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Invalid POS payload", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const settings = await StoreSettings.findOne().lean();
    const invoiceNumber = `INV-${Date.now().toString().slice(-6)}`;
    const receiptNumber = `RCP-${Date.now().toString().slice(-6)}`;
    const nowStr = new Date().toISOString();
    const data = parsed.data;

    const customerType =
      data.customerType === "Wholesale" ||
      data.customerType === "Retail Repair" ||
      data.customerType === "Enterprise Tech" ||
      data.customerType === "POS Quick Sale"
        ? data.customerType
        : "POS Quick Sale";

    const paymentMethod =
      data.paymentMethod === "Cash" ||
      data.paymentMethod === "Credit Card" ||
      data.paymentMethod === "Bank Transfer" ||
      data.paymentMethod === "Stripe" ||
      data.paymentMethod === "Credit Line" ||
      data.paymentMethod === "Split Payment"
        ? data.paymentMethod
        : "Cash";

    const newReceipt = await Receipt.create({
      receiptNumber,
      invoiceNumber,
      customerName: data.customerName || "Walk-in Retail Customer",
      customerType,
      itemsCount: data.items?.length || 0,
      totalAmount: data.totalAmount || 0,
      paymentMethod,
      cashierName: data.cashierName || session?.name || "Cashier",
      timestamp: nowStr,
      itemsSummary: (data.items || [])
        .map((i) => `${i.quantity}x ${i.product?.name || "Item"}`)
        .join(", "),
      storeName: settings?.businessName || "ShelfSense",
      storeAddress: settings?.businessAddress || "",
    });

    const receiptObj = newReceipt.toObject();

    return NextResponse.json({
      success: true,
      data: { ...receiptObj, id: receiptObj._id.toString() },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "POS sale failed";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
