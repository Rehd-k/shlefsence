import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/mongodb";
import StoreSettings from "@/lib/models/StoreSettings";
import { requireTenantSession } from "@/lib/auth/apiAuth";

export async function GET(req: Request) {
  try {
    const auth = await requireTenantSession(req);
    if ("error" in auth) return auth.error;

    await connectToDatabase();
    let settings = await StoreSettings.findOne({ organizationId: auth.organizationId }).lean();
    if (!settings) {
      settings = (
        await StoreSettings.create({
          organizationId: auth.organizationId,
          businessName: "My Business",
          businessPhone: "",
          businessAddress: "",
          currencyDefault: "₦",
        })
      ).toObject();
    }
    const formatted = {
      ...settings,
      id: (settings as { _id?: { toString(): string } })._id?.toString() || "",
    };
    return NextResponse.json({ success: true, data: formatted });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to load settings";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const auth = await requireTenantSession(req);
    if ("error" in auth) return auth.error;

    await connectToDatabase();
    const body = await req.json();
    let settings = await StoreSettings.findOne({ organizationId: auth.organizationId });
    if (settings) {
      settings.businessName = body.businessName ?? settings.businessName;
      settings.businessPhone = body.businessPhone ?? settings.businessPhone;
      settings.businessAddress = body.businessAddress ?? settings.businessAddress;
      settings.currencyDefault = body.currencyDefault ?? settings.currencyDefault;
      await settings.save();
    } else {
      settings = await StoreSettings.create({
        organizationId: auth.organizationId,
        businessName: body.businessName || "My Business",
        businessPhone: body.businessPhone || "",
        businessAddress: body.businessAddress || "",
        currencyDefault: body.currencyDefault || "₦",
      });
    }
    const formatted = {
      ...settings.toObject(),
      id: settings._id.toString(),
    };
    return NextResponse.json({ success: true, data: formatted });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to save settings";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
