import mongoose from "mongoose";

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
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`🍃 [MongoDB Atlas] Connected successfully to host: ${conn.connection.host}`);
    console.log(`📂 [MongoDB Atlas] Database Name: ${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.error(`❌ [MongoDB Atlas] Connection Error: ${error.message}`);
    console.log("📦 Falling back to in-memory store so the server remains fully operational.");
    return null;
  }
};

export default connectDB;
