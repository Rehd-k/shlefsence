import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/mongodb";
import User from "@/lib/models/User";
import RolePermission from "@/lib/models/RolePermission";
import { unauthorizedResponse } from "@/lib/auth/session";
import { getSessionFromCookies } from "@/lib/auth/getSession";

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

    const permissionsData = await RolePermission.findOne({ role: user.role }).lean();

    return NextResponse.json({
      success: true,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        assignedLocation: user.assignedLocation,
        supervisedLocations: user.supervisedLocations || [],
        permissions: permissionsData
          ? {
              allowedPages: permissionsData.allowedPages || [],
              allowAllLocations: permissionsData.allowAllLocations ?? false,
            }
          : undefined,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to load session";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
