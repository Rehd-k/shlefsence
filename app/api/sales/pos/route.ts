import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/mongodb";
import Product from "@/lib/models/Product";
import Receipt from "@/lib/models/Receipt";
import Invoice from "@/lib/models/Invoice";
import { SEED_POS_CATALOG } from "@/lib/seed/salesSeedData";

export async function GET() {
  try {
    await connectToDatabase();

    const products = await Product.find({}).sort({ name: 1 }).lean();

    if (products.length === 0) {
      return NextResponse.json({ success: true, data: SEED_POS_CATALOG });
    }

    const posCatalog = products.map((p: any) => ({
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
      shelf: p.shelf || "A1-S1-B1",
      warehouse: p.warehouse || "Main Hub - New York",
    }));

    return NextResponse.json({ success: true, data: posCatalog });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await connectToDatabase();
    const body = await req.json();

    // Body: { customerName, customerType, items, totalAmount, paymentMethod, cashierName }
    const invoiceNumber = `INV-${Date.now().toString().slice(-6)}`;
    const receiptNumber = `RCP-${Date.now().toString().slice(-6)}`;
    const nowStr = new Date().toISOString();

    const newReceipt = await Receipt.create({
      receiptNumber,
      invoiceNumber,
      customerName: body.customerName || "Walk-in Retail Customer",
      customerType: body.customerType || "POS Quick Sale",
      itemsCount: body.items?.length || 0,
      totalAmount: body.totalAmount || 0,
      paymentMethod: body.paymentMethod || "Cash",
      cashierName: body.cashierName || "Main Register Cashier",
      timestamp: nowStr,
      itemsSummary: (body.items || []).map((i: any) => `${i.quantity}x ${i.product.name}`).join(", "),
      storeName: "ShelfSense Main Store",
      storeAddress: "142 Logistics Way, Queens NY",
    });

    const receiptObj = newReceipt.toObject();

    return NextResponse.json({
      success: true,
      data: { ...receiptObj, id: receiptObj._id.toString() },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
