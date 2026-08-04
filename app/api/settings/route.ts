import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/mongodb";
import StoreSettings from "@/lib/models/StoreSettings";

export async function GET() {
  try {
    await connectToDatabase();
    let settings = await StoreSettings.findOne({}).lean();
    if (!settings) {
      settings = await StoreSettings.create({
        businessName: "ShelfSense Lagos",
        businessPhone: "+234 (1) 555-0192",
        businessAddress: "14 Logistics Way, Ikeja, Lagos",
        currencyDefault: "₦",
      });
    }
    const formatted = {
      ...settings,
      id: (settings as any)._id?.toString() || "",
    };
    return NextResponse.json({ success: true, data: formatted });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await connectToDatabase();
    const body = await req.json();
    let settings = await StoreSettings.findOne({});
    if (settings) {
      settings.businessName = body.businessName ?? settings.businessName;
      settings.businessPhone = body.businessPhone ?? settings.businessPhone;
      settings.businessAddress = body.businessAddress ?? settings.businessAddress;
      settings.currencyDefault = body.currencyDefault ?? settings.currencyDefault;
      await settings.save();
    } else {
      settings = await StoreSettings.create(body);
    }
    const formatted = {
      ...settings.toObject(),
      id: settings._id.toString(),
    };
    return NextResponse.json({ success: true, data: formatted });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
