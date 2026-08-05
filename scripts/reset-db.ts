import fs from "fs";
import path from "path";
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import User from "../lib/models/User";

// 1. Manually parse .env file to load MONGODB_URI
const envPath = path.resolve(process.cwd(), ".env");
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf-8");
  for (const line of envContent.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const firstEq = trimmed.indexOf("=");
    if (firstEq !== -1) {
      const key = trimmed.substring(0, firstEq).trim();
      const val = trimmed.substring(firstEq + 1).trim();
      process.env[key] = val;
    }
  }
}

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://root:hJaJzbIv49UtuGLOqcLnerXCePc1wd6IG2wCsF6SLx9IZ5tFXvD2Xs264fpKAnk7@aeqbrsl90y35d145z9sw5cbq:27017/ijemoa?directConnection=true";

async function main() {
  console.log("Connecting to MongoDB at:", MONGODB_URI);
  await mongoose.connect(MONGODB_URI);
  console.log("Connected to MongoDB successfully.");

  // Drop the database
  console.log("Dropping database 'shelfsense' to empty out all collections...");
  if (mongoose.connection.db) {
    await mongoose.connection.db.dropDatabase();
    console.log("Database dropped successfully.");
  } else {
    throw new Error("Could not access DB instance from Mongoose connection.");
  }

  // Define Admin details
  const adminEmail = "admin@shelfsense.ng";
  const adminPassword = "Password123!";

  console.log("Hashing password for admin user...");
  const hashedPassword = await bcrypt.hash(adminPassword, 10);

  console.log("Creating System Admin user...");
  const adminUser = await User.create({
    name: "System Admin",
    email: adminEmail.toLowerCase(),
    password: hashedPassword,
    role: "Admin",
    assignedLocation: "All Locations",
    status: "Active",
  });

  console.log("==================================================");
  console.log("DATABASE RESET COMPLETE SUCCESSFUL!");
  console.log("--------------------------------------------------");
  console.log("Default Admin User Details:");
  console.log("  Name:     ", adminUser.name);
  console.log("  Email:    ", adminUser.email);
  console.log("  Password: ", adminPassword);
  console.log("  Role:     ", adminUser.role);
  console.log("==================================================");

  await mongoose.disconnect();
  console.log("Disconnected from MongoDB.");
}

main().catch((err) => {
  console.error("An error occurred during DB reset:", err);
  process.exit(1);
});
