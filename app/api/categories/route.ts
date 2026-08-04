import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/mongodb";
import Category from "@/lib/models/Category";

const DEFAULT_CATEGORIES = [
  { name: "Screen & OLED Assembly", code: "SCR", description: "Display touch assemblies for smartphones" },
  { name: "High-Capacity Battery", code: "BAT", description: "OEM and aftermarket replacement batteries" },
  { name: "Charging Port Flex", code: "CHG", description: "Charging ports, mic, and ribbon flex cables" },
  { name: "Camera Module", code: "CAM", description: "Front & rear camera sensor modules" },
  { name: "Housing & Back Glass", code: "HSG", description: "Phone rear covers, mid-frames, chassis" },
  { name: "IC Chips & Motherboard Parts", code: "IC", description: "Micro-soldering chips and audio ICs" },
];

export async function GET() {
  try {
    await connectToDatabase();
    let categories = await Category.find({}).sort({ name: 1 });

    if (categories.length === 0) {
      categories = await Category.insertMany(DEFAULT_CATEGORIES);
    }

    return NextResponse.json({ success: true, data: categories });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await connectToDatabase();
    const body = await req.json();

    if (!body.name) {
      return NextResponse.json({ success: false, error: "Category name is required" }, { status: 400 });
    }

    const code = body.code || body.name.substring(0, 3).toUpperCase();
    const newCategory = await Category.create({
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
