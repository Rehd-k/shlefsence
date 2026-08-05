import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/mongodb";
import QualityGrade from "@/lib/models/QualityGrade";

export async function GET() {
  try {
    await connectToDatabase();
    const grades = await QualityGrade.find({}).sort({ name: 1 }).lean();
    
    const formatted = grades.map((g: any) => ({
      id: g._id.toString(),
      name: g.name,
      label: g.label,
      value: g.name,
    }));

    return NextResponse.json({ success: true, data: formatted });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 550 });
  }
}

export async function POST(req: Request) {
  try {
    await connectToDatabase();
    const body = await req.json();

    if (!body.name || !body.label) {
      return NextResponse.json({ success: false, error: "Name and Label are required" }, { status: 400 });
    }

    const newGrade = await QualityGrade.create({
      name: body.name,
      label: body.label,
    });
    const obj = newGrade.toObject();

    return NextResponse.json({
      success: true,
      data: {
        ...obj,
        id: obj._id.toString(),
        value: obj.name,
        label: obj.label,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 550 });
  }
}
