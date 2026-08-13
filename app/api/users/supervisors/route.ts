import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/mongodb";
import User from "@/lib/models/User";
import { requireTenantSession, tenantFilter } from "@/lib/auth/apiAuth";

export async function GET(req: Request) {
  try {
    const auth = await requireTenantSession(req);
    if ("error" in auth) return auth.error;
    const { organizationId } = auth;

    await connectToDatabase();

    const supervisors = await User.find(
      tenantFilter(organizationId, {
        role: "Supervisor",
        status: "Active",
      })
    )
      .select("_id name email")
      .sort({ name: 1 })
      .lean();

    const formatted = supervisors.map((s: any) => ({
      id: s._id.toString(),
      name: s.name,
      email: s.email,
    }));

    return NextResponse.json({ success: true, data: formatted });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
