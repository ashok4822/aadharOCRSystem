import mongoose from "mongoose";
import { config } from "../../config/config";
import dns from "node:dns";

// Force Node.js to use Google DNS for resolving SRV records (fixes NVM/Windows DNS bug)
dns.setServers(["8.8.8.8", "8.8.4.4"]);

export const connectDB = async (): Promise<void> => {
  try {
    await mongoose.connect(config.mongoUri);
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
};
