const mongoose = require("mongoose");
require("dotenv/config");

async function testConnection() {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 30000,
      family: 4,
    });
    console.log("✅ Test connection successful");
    process.exit(0);
  } catch (error) {
    console.error("❌ Test connection failed:", error.message);
    process.exit(1);
  }
}

testConnection();
