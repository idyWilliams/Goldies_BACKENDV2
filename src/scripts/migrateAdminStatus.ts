import mongoose from "mongoose";

import dotenv from "dotenv";
import AdminModel from "../models/Admin.model";

// Load environment variables
dotenv.config();

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI as string)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });

// Migration function
const migrateExistingAdmins = async () => {
  try {
    const admins = await AdminModel.find({ "statusChanges.0": { $exists: false } });
    console.log(`Found ${admins.length} admins without status history.`);

    let count = 0;
    for (let admin of admins) {
      admin.statusChanges.push({
        status: "created",
        timestamp: admin.createdAt, // Use their creation date
        reason: "Initial migration",
      });
      await admin.save();
      count++;
      if (count % 10 === 0) {
        console.log(`Processed ${count}/${admins.length} admins...`);
      }
    }

    console.log(`Successfully migrated ${count} admins.`);
  } catch (error) {
    console.error("Migration failed:", error);
  } finally {
    // Close the MongoDB connection
    mongoose.connection.close();
    console.log("MongoDB connection closed.");
  }
};

// Run the migration
migrateExistingAdmins();
