import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/mongodb";
import RolePermission from "@/lib/models/RolePermission";
import { requireTenantSession } from "@/lib/auth/apiAuth";
import { DEFAULT_ROLE_PERMISSIONS } from "@/lib/tenancy/defaultPermissions";

type PermissionView = {
  organizationId: string;
  role: string;
  allowedPages: string[];
  allowAllLocations: boolean;
};

export async function GET(request: Request) {
  try {
    const auth = await requireTenantSession(request);
    if ("error" in auth) return auth.error;

    await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const role = searchParams.get("role");
    const { organizationId } = auth;

    if (!role) {
      const allPerms = await RolePermission.find({ organizationId }).lean();
      return NextResponse.json({ success: true, data: allPerms });
    }

    const permsDoc = await RolePermission.findOne({ organizationId, role }).lean();

    let data: PermissionView | null = permsDoc
      ? {
          organizationId: String(permsDoc.organizationId),
          role: permsDoc.role,
          allowedPages: permsDoc.allowedPages || [],
          allowAllLocations: permsDoc.allowAllLocations ?? false,
        }
      : null;

    if (!data && DEFAULT_ROLE_PERMISSIONS[role]) {
      data = {
        organizationId,
        role,
        allowedPages: DEFAULT_ROLE_PERMISSIONS[role].allowedPages,
        allowAllLocations: DEFAULT_ROLE_PERMISSIONS[role].allowAllLocations,
      };
    }

    return NextResponse.json({ success: true, data });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to load permissions";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const auth = await requireTenantSession(request);
    if ("error" in auth) return auth.error;

    await connectToDatabase();
    const body = await request.json();
    const { role, allowedPages, allowAllLocations } = body;

    if (!role) {
      return NextResponse.json({ success: false, error: "Role is required" }, { status: 400 });
    }

    const updated = await RolePermission.findOneAndUpdate(
      { organizationId: auth.organizationId, role },
      {
        organizationId: auth.organizationId,
        role,
        allowedPages,
        allowAllLocations,
      },
      { new: true, upsert: true }
    );

    return NextResponse.json({ success: true, data: updated });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to save permissions";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
