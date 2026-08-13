import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/mongodb";
import User from "@/lib/models/User";
import RolePermission from "@/lib/models/RolePermission";
import { unauthorizedResponse } from "@/lib/auth/session";
import { getSessionFromCookies } from "@/lib/auth/getSession";
import { defaultPermissionsForRole } from "@/lib/tenancy/defaultPermissions";

export async function GET() {
  try {
    const session = await getSessionFromCookies();
    if (!session) {
      return unauthorizedResponse();
    }

    await connectToDatabase();
    const user = await User.findById(session.sub).lean();
    if (!user || user.status === "Inactive") {
      return unauthorizedResponse("User not found or inactive");
    }

    const organizationId = (user.organizationId || session.organizationId)?.toString();
    if (!organizationId) {
      return unauthorizedResponse("Organization context missing");
    }

    const permissionsData = await RolePermission.findOne({
      organizationId: user.organizationId || organizationId,
      role: user.role,
    }).lean();
    const fallback = defaultPermissionsForRole(user.role);

    return NextResponse.json({
      success: true,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        assignedLocation: user.assignedLocation,
        organizationId,
        supervisedLocations: user.supervisedLocations || [],
        permissions: {
          allowedPages: permissionsData?.allowedPages || fallback.allowedPages,
          allowAllLocations: permissionsData?.allowAllLocations ?? fallback.allowAllLocations,
        },
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to load session";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
