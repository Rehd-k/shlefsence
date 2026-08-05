import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/mongodb";
import User from "@/lib/models/User";
import bcrypt from "bcrypt";

export async function GET() {
  try {
    await connectToDatabase();
    const users = await User.find({}).sort({ name: 1 }).lean();
    
    // Format and exclude password
    const formatted = users.map((u: any) => {
      const { password, ...rest } = u;
      return {
        ...rest,
        id: u._id.toString(),
      };
    });

    return NextResponse.json({ success: true, data: formatted });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await connectToDatabase();
    const body = await req.json();
    const { name, email, password, role, assignedLocation, supervisedLocations, phone, status } = body;

    if (!name || !email || !password) {
      return NextResponse.json(
        { success: false, error: "Name, email and password are required" },
        { status: 400 }
      );
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json(
        { success: false, error: "A user with this email already exists" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: role || "Sales",
      assignedLocation: assignedLocation || "Main Hub - Lagos",
      supervisedLocations: supervisedLocations || [],
      phone: phone || "",
      status: status || "Active",
    });

    const userObj = user.toObject();
    delete (userObj as any).password;

    return NextResponse.json({
      success: true,
      data: {
        ...userObj,
        id: userObj._id.toString(),
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    await connectToDatabase();
    const body = await req.json();
    const { id, name, email, password, role, assignedLocation, supervisedLocations, phone, status } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: "User ID is required" }, { status: 400 });
    }

    const user = await User.findById(id);
    if (!user) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
    }

    // Check if email is updated and is unique
    if (email && email.toLowerCase() !== user.email) {
      const emailTaken = await User.findOne({ email: email.toLowerCase() });
      if (emailTaken) {
        return NextResponse.json({ success: false, error: "Email is already taken" }, { status: 400 });
      }
      user.email = email.toLowerCase();
    }

    if (name) user.name = name;
    if (role) user.role = role;
    if (assignedLocation) user.assignedLocation = assignedLocation;
    if (supervisedLocations !== undefined) user.supervisedLocations = supervisedLocations;
    if (phone !== undefined) user.phone = phone;
    if (status) user.status = status;

    // Hash password if a new one is provided
    if (password && password.trim() !== "") {
      user.password = await bcrypt.hash(password, 10);
    }

    await user.save();

    const userObj = user.toObject();
    delete (userObj as any).password;

    return NextResponse.json({
      success: true,
      data: {
        ...userObj,
        id: userObj._id.toString(),
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, error: "User ID is required" }, { status: 400 });
    }

    const deleted = await User.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "User deleted successfully" });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
