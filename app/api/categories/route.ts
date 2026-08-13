import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/mongodb";
import Category from "@/lib/models/Category";
import { requireTenantSession } from "@/lib/auth/apiAuth";

export async function GET(req: Request) {
  try {
    const auth = await requireTenantSession(req);
    if ("error" in auth) return auth.error;
    const { organizationId } = auth;

    await connectToDatabase();
    const categories = await Category.find({ organizationId }).sort({ name: 1 });

    return NextResponse.json({ success: true, data: categories });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const auth = await requireTenantSession(req);
    if ("error" in auth) return auth.error;
    const { organizationId } = auth;

    await connectToDatabase();
    const body = await req.json();

    if (!body.name) {
      return NextResponse.json({ success: false, error: "Category name is required" }, { status: 400 });
    }

    const code = body.code || body.name.substring(0, 3).toUpperCase();
    const newCategory = await Category.create({
      organizationId,
      name: body.name,
      code,
      description: body.description || "",
      itemCount: 0,
    });

    return NextResponse.json({ success: true, data: newCategory }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
