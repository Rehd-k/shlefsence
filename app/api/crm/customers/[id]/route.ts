import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/mongodb";
import Customer from "@/lib/models/Customer";
import Invoice from "@/lib/models/Invoice";
import WarrantyClaim from "@/lib/models/WarrantyClaim";
import StoreSettings from "@/lib/models/StoreSettings";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectToDatabase();
    const { id } = await params;

    const customerDoc = await Customer.findById(id).lean();
    if (!customerDoc) {
      return NextResponse.json({ success: false, error: "Customer not found" }, { status: 404 });
    }

    const customer: any = {
      ...customerDoc,
      id: customerDoc._id.toString(),
    };

    // Cross-query matching invoices and warranty claims by businessName or email
    const invoices = await Invoice.find({
      $or: [
        { customerName: customer.businessName },
        { customerEmail: customer.email },
      ],
    })
      .sort({ createdAt: -1 })
      .lean();

    const formattedInvoices = invoices.map((inv: any) => ({
      ...inv,
      id: inv._id.toString(),
    }));

    const claims = await WarrantyClaim.find({
      customer: { $regex: customer.businessName, $options: "i" },
    })
      .sort({ createdAt: -1 })
      .lean();

    const formattedClaims = claims.map((c: any) => ({
      ...c,
      id: c._id.toString(),
    }));

    return NextResponse.json({
      success: true,
      data: {
        customer,
        purchaseHistory: formattedInvoices,
        warrantyHistory: formattedClaims,
      },
    });
  } catch (error: any) {
    console.error("GET /api/crm/customers/[id] error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectToDatabase();
    const { id } = await params;
    const body = await req.json();

    const existing = await Customer.findById(id);
    if (!existing) {
      return NextResponse.json({ success: false, error: "Customer not found" }, { status: 404 });
    }

    let currencySymbol = "₦";
    const settings = await StoreSettings.findOne({});
    if (settings && settings.currencyDefault) {
      currencySymbol = settings.currencyDefault;
    }

    // Check if wallet, debt, or credit changed to generate timeline events
    const timelineAdditions = [];

    if (body.walletAdjustment !== undefined && body.walletAdjustment !== 0) {
      const adj = Number(body.walletAdjustment);
      const newBal = (existing.walletBalance || 0) + adj;
      existing.walletBalance = Math.max(0, newBal);

      timelineAdditions.push({
        id: `tl-${Date.now()}-w`,
        type: "wallet" as const,
        title: adj > 0 ? "Wallet Funds Deposited" : "Wallet Balance Deducted",
        description: `${adj > 0 ? "Added" : "Deducted"} ${currencySymbol}${Math.abs(adj).toFixed(
          2
        )} to store credit wallet balance`,
        amount: Math.abs(adj),
        badge: "Wallet Transaction",
        date: new Date().toISOString(),
      });
    }

    if (body.debtSettlement !== undefined && body.debtSettlement > 0) {
      const settlement = Number(body.debtSettlement);
      const newDebt = Math.max(0, (existing.outstandingDebt || 0) - settlement);
      existing.outstandingDebt = newDebt;

      timelineAdditions.push({
        id: `tl-${Date.now()}-d`,
        type: "payment" as const,
        title: "Outstanding Debt Settled",
        description: `Payment of ${currencySymbol}${settlement.toFixed(2)} applied to outstanding account balance`,
        amount: settlement,
        badge: "Debt Clearance",
        date: new Date().toISOString(),
      });
    }

    if (body.creditLimit !== undefined && body.creditLimit !== existing.creditLimit) {
      const oldLimit = existing.creditLimit;
      const newLimit = Number(body.creditLimit);
      existing.creditLimit = newLimit;

      timelineAdditions.push({
        id: `tl-${Date.now()}-c`,
        type: "credit" as const,
        title: "Credit Limit Adjusted",
        description: `Credit line limit changed from ${currencySymbol}${oldLimit.toFixed(2)} to ${currencySymbol}${newLimit.toFixed(
          2
        )}`,
        amount: newLimit,
        badge: "Credit Line",
        date: new Date().toISOString(),
      });
    }

    // Update standard fields
    if (body.businessName) existing.businessName = body.businessName;
    if (body.contactName) existing.contactName = body.contactName;
    if (body.customerType) existing.customerType = body.customerType;
    if (body.email) existing.email = body.email;
    if (body.phone) existing.phone = body.phone;
    if (body.address) existing.address = body.address;
    if (body.notes !== undefined) existing.notes = body.notes;
    if (body.status) existing.status = body.status;
    if (body.tags) existing.tags = body.tags;

    if (timelineAdditions.length > 0) {
      existing.timeline.unshift(...timelineAdditions);
    }

    await existing.save();

    const obj = existing.toObject();

    return NextResponse.json({
      success: true,
      data: { ...obj, id: obj._id.toString() },
    });
  } catch (error: any) {
    console.error("PUT /api/crm/customers/[id] error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectToDatabase();
    const { id } = await params;

    const deleted = await Customer.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json({ success: false, error: "Customer not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Customer successfully deleted." });
  } catch (error: any) {
    console.error("DELETE /api/crm/customers/[id] error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
