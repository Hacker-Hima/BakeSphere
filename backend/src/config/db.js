import dns from "dns";
import mongoose from "mongoose";
import { bakeryProducts } from "../data/products.js";
import { bakeryOrders } from "../data/orders.js";
import { auditLogs } from "../data/auditLogs.js";
import { verifiedUsers } from "../data/users.js";

import Product from "../models/Product.js";
import Order from "../models/Order.js";
import AuditLog from "../models/AuditLog.js";
import User from "../models/User.js";

// Windows Node.js DNS resolver enhancement for MongoDB Atlas SRV records
try {
  dns.setServers(["8.8.8.8", "1.1.1.1"]);
} catch (e) {
  // Ignore if not supported in current environment
}

const seedDatabaseIfEmpty = async () => {
  try {
    const productCount = await Product.countDocuments();
    if (productCount === 0 && Array.isArray(bakeryProducts) && bakeryProducts.length > 0) {
      await Product.insertMany(bakeryProducts);
      console.log(`🌱 [MongoDB Atlas] Initialized ${bakeryProducts.length} bakery products in database.`);
    }

    const orderCount = await Order.countDocuments();
    if (orderCount === 0 && Array.isArray(bakeryOrders) && bakeryOrders.length > 0) {
      await Order.insertMany(bakeryOrders);
      console.log(`🌱 [MongoDB Atlas] Initialized ${bakeryOrders.length} sample orders in database.`);
    }

    const userCount = await User.countDocuments();
    if (userCount === 0 && Array.isArray(verifiedUsers) && verifiedUsers.length > 0) {
      await User.insertMany(verifiedUsers);
      console.log(`🌱 [MongoDB Atlas] Initialized ${verifiedUsers.length} staff & customer accounts in database.`);
    }

    const logCount = await AuditLog.countDocuments();
    if (logCount === 0 && Array.isArray(auditLogs) && auditLogs.length > 0) {
      const formattedLogs = auditLogs.map((l) => ({
        logId: l.id || `LOG-${Date.now()}`,
        action: l.action || "SYSTEM_BOOT",
        performedBy: l.userName || "System",
        details: l.details,
        timestamp: l.timestamp ? new Date(l.timestamp) : new Date()
      }));
      await AuditLog.insertMany(formattedLogs);
      console.log(`🌱 [MongoDB Atlas] Initialized ${auditLogs.length} audit logs in database.`);
    }
  } catch (seedErr) {
    console.warn("⚠️ [MongoDB Atlas] Auto-seed warning:", seedErr.message);
  }
};

export const connectDB = async () => {
  const uri = process.env.MONGODB_URI;

  if (!uri || uri.includes("<username>") || uri.includes("<password>") || uri.includes("<cluster-url>")) {
    console.log("------------------------------------------------------------------");
    console.log("🍃 [MongoDB Atlas] Placeholder or missing connection string detected.");
    console.log("👉 To connect to MongoDB Atlas:");
    console.log("   1. Open 'backend/.env'");
    console.log("   2. Replace MONGODB_URI placeholder with your real Atlas connection string.");
    console.log("   3. Restart the backend server.");
    console.log("📦 In-memory data store is currently active as a fallback.");
    console.log("------------------------------------------------------------------");
    return null;
  }

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000,
    });
    console.log(`🍃 [MongoDB Atlas] Connected successfully to host: ${conn.connection.host}`);
    console.log(`📂 [MongoDB Atlas] Database Name: ${conn.connection.name}`);

    // Auto-seed initial catalog, orders, and users into database if empty
    await seedDatabaseIfEmpty();

    return conn;
  } catch (error) {
    console.error(`❌ [MongoDB Atlas] Connection Error: ${error.message}`);
    console.log("📦 Falling back to in-memory store so the server remains fully operational.");
    return null;
  }
};

export default connectDB;
