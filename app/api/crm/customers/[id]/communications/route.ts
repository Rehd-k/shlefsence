import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/mongodb";
import Customer from "@/lib/models/Customer";
import { CommunicationType } from "@/lib/types/crm";
import { requireTenantSession, tenantFilter } from "@/lib/auth/apiAuth";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireTenantSession(req);
    if ("error" in auth) return auth.error;
    const { organizationId } = auth;

    await connectToDatabase();
    const { id } = await params;
    const body = await req.json();

    const { type, subject, content, loggedBy } = body;

    if (!type || !subject || !content) {
      return NextResponse.json(
        { success: false, error: "Communication type, subject, and content are required." },
        { status: 400 }
      );
    }

    const customer = await Customer.findOne(tenantFilter(organizationId, { _id: id }));
    if (!customer) {
      return NextResponse.json({ success: false, error: "Customer not found" }, { status: 404 });
    }

    const commId = `comm-${Date.now()}`;
    const dateStr = new Date().toISOString();

    const newComm = {
      id: commId,
      type: type as CommunicationType,
      subject,
      content,
      loggedBy: loggedBy || "System",
      date: dateStr,
    };

    const newTimelineEvent = {
      id: `tl-${Date.now()}`,
      type: "communication" as const,
      title: `${type} Logged: ${subject}`,
      description: content.length > 120 ? content.substring(0, 117) + "..." : content,
      badge: type,
      date: dateStr,
    };

    customer.communications.unshift(newComm);
    customer.timeline.unshift(newTimelineEvent);

    await customer.save();

    const obj = customer.toObject();

    return NextResponse.json({
      success: true,
      data: { ...obj, id: obj._id.toString() },
      message: "Communication successfully logged.",
    });
  } catch (error: any) {
    console.error("POST /api/crm/customers/[id]/communications error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
