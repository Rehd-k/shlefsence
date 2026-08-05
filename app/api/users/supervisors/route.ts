import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/mongodb";
import User from "@/lib/models/User";

export async function GET() {
  try {
    await connectToDatabase();
    
    // Find all users who have Supervisor role and are Active
    const supervisors = await User.find({
      role: "Supervisor",
      status: "Active",
    })
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
    return NextResponse.json({ success: false, error: error.message }, { status: 550 });
  }
}
