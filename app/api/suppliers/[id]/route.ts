import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/mongodb";
import Supplier from "@/lib/models/Supplier";
import PurchaseOrder from "@/lib/models/PurchaseOrder";
import WarrantyClaim from "@/lib/models/WarrantyClaim";
import { requireTenantSession, tenantFilter } from "@/lib/auth/apiAuth";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireTenantSession(req);
    if ("error" in auth) return auth.error;
    const { organizationId } = auth;

    await connectToDatabase();
    const { id } = await params;

    const supplier = await Supplier.findOne(tenantFilter(organizationId, { _id: id })).lean();

    if (!supplier) {
      return NextResponse.json(
        { success: false, error: "Supplier profile not found" },
        { status: 404 }
      );
    }

    const pos = await PurchaseOrder.find(
      tenantFilter(organizationId, {
        supplier: { $regex: supplier.name, $options: "i" },
      })
    )
      .sort({ createdAt: -1 })
      .lean();

    const warrantyClaims = await WarrantyClaim.find({ organizationId })
      .sort({ createdAt: -1 })
      .lean();

    const formattedSupplier = {
      ...supplier,
      id: supplier._id.toString(),
      purchaseOrders: pos.map((p: any) => ({
        ...p,
        id: p._id.toString(),
      })),
      warrantyClaims: warrantyClaims.map((w: any) => ({
        ...w,
        id: w._id.toString(),
      })),
    };

    return NextResponse.json({ success: true, data: formattedSupplier });
  } catch (error: any) {
    console.error("GET /api/suppliers/[id] error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireTenantSession(req);
    if ("error" in auth) return auth.error;
    const { organizationId } = auth;

    await connectToDatabase();
    const { id } = await params;
    const body = await req.json();

    const existing = await Supplier.findOne(tenantFilter(organizationId, { _id: id }));

    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Supplier not found" },
        { status: 404 }
      );
    }

    if (body.action === "ADD_COMMUNICATION") {
      const newComm = {
        id: `comm-${Date.now()}`,
        type: body.communication.type || "Note",
        subject: body.communication.subject,
        summary: body.communication.summary,
        author: body.communication.author || "System",
        date: body.communication.date || new Date().toISOString().split("T")[0],
      };
      existing.communications.unshift(newComm as any);
      await existing.save();
      return NextResponse.json({ success: true, data: existing });
    }

    if (body.action === "ATTACH_DOCUMENT") {
      const newDoc = {
        id: `doc-${Date.now()}`,
        title: body.document.title,
        type: body.document.type || "Contract",
        fileUrl: body.document.fileUrl || "https://shelfsense.internal/docs/sample.pdf",
        fileSize: body.document.fileSize || "1.5 MB",
        uploadedAt: new Date().toISOString().split("T")[0],
      };
      existing.documents.unshift(newDoc as any);
      await existing.save();
      return NextResponse.json({ success: true, data: existing });
    }

    if (body.action === "ADD_CONTACT") {
      const newContact = {
        id: `cnt-${Date.now()}`,
        name: body.contact.name,
        role: body.contact.role,
        email: body.contact.email,
        phone: body.contact.phone,
        isPrimary: body.contact.isPrimary || false,
      };
      if (newContact.isPrimary) {
        existing.contacts.forEach((c: any) => (c.isPrimary = false));
      }
      existing.contacts.push(newContact as any);
      await existing.save();
      return NextResponse.json({ success: true, data: existing });
    }

    const { organizationId: _ignore, ...safeBody } = body;
    const updated = await Supplier.findOneAndUpdate(
      tenantFilter(organizationId, { _id: id }),
      { $set: safeBody },
      { new: true }
    ).lean();

    return NextResponse.json({
      success: true,
      data: { ...updated, id: updated!._id.toString() },
    });
  } catch (error: any) {
    console.error("PUT /api/suppliers/[id] error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireTenantSession(req);
    if ("error" in auth) return auth.error;
    const { organizationId } = auth;

    await connectToDatabase();
    const { id } = await params;

    const deleted = await Supplier.findOneAndDelete(tenantFilter(organizationId, { _id: id }));

    if (!deleted) {
      return NextResponse.json(
        { success: false, error: "Supplier not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Supplier profile successfully deleted",
    });
  } catch (error: any) {
    console.error("DELETE /api/suppliers/[id] error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
