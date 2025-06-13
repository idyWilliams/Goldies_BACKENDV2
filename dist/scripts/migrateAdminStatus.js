"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const Admin_model_1 = __importDefault(require("../models/Admin.model"));
// Load environment variables
dotenv_1.default.config();
// Connect to MongoDB
mongoose_1.default
    .connect(process.env.MONGO_URI)
    .then(() => console.log("Connected to MongoDB"))
    .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
});
// Migration function
const migrateExistingAdmins = async () => {
    try {
        const admins = await Admin_model_1.default.find({
            "statusChanges.0": { $exists: false },
        });
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
    }
    catch (error) {
        console.error("Migration failed:", error);
    }
    finally {
        // Close the MongoDB connection
        mongoose_1.default.connection.close();
        console.log("MongoDB connection closed.");
    }
};
// Run the migration
migrateExistingAdmins();
//# sourceMappingURL=migrateAdminStatus.js.map