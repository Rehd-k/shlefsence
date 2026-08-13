import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/mongodb";
import User from "@/lib/models/User";
import RolePermission from "@/lib/models/RolePermission";
import bcrypt from "bcrypt";
import { createSessionToken, setSessionCookie } from "@/lib/auth/session";
import { registerSchema } from "@/lib/validators/auth";
import { createOrganizationWithDefaults } from "@/lib/tenancy/bootstrapOrganization";
import { defaultPermissionsForRole } from "@/lib/tenancy/defaultPermissions";

export async function POST(req: Request) {
  try {
    await connectToDatabase();
    const body = await req.json();
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Invalid registration payload", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { name, email, password, businessName, businessPhone, businessAddress } = parsed.data;
    const phone = typeof body.phone === "string" ? body.phone : "";

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json(
        { success: false, error: "A user with this email already exists" },
        { status: 400 }
      );
    }

    const org = await createOrganizationWithDefaults({
      name: businessName,
      businessPhone: businessPhone || "",
      businessAddress: businessAddress || "",
    });

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      organizationId: org._id,
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: "Admin",
      assignedLocation: "Main Hub",
      phone,
      status: "Active",
    });

    const userObj = user.toObject();
    delete (userObj as { password?: string }).password;

    const permissionsData = await RolePermission.findOne({
      organizationId: org._id,
      role: user.role,
    }).lean();
    const fallback = defaultPermissionsForRole(user.role);
    const allowedPages = permissionsData?.allowedPages || fallback.allowedPages;
    const allowAllLocations = permissionsData?.allowAllLocations ?? fallback.allowAllLocations;

    const organizationId = org._id.toString();
    const data = {
      ...userObj,
      id: userObj._id.toString(),
      organizationId,
      permissions: {
        allowedPages,
        allowAllLocations,
      },
    };

    const token = await createSessionToken({
      id: data.id,
      email: data.email,
      name: data.name,
      role: data.role,
      assignedLocation: data.assignedLocation,
      organizationId,
    });

    const response = NextResponse.json({
      success: true,
      data,
    });
    setSessionCookie(response, token);
    return response;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Registration failed";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
