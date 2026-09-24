import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import authRoutes from "./routes/authRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import recipeRoutes from "./routes/recipeRoutes.js";
import productionRoutes from "./routes/productionRoutes.js";
import inventoryRoutes from "./routes/inventoryRoutes.js";
import posRoutes from "./routes/posRoutes.js";
import customCakeRoutes from "./routes/customCakeRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";
import analyticsRoutes from "./routes/analyticsRoutes.js";
import apiDocRoutes from "./routes/apiDocRoutes.js";
import equipmentRoutes from "./routes/equipmentRoutes.js";
import supplierRoutes from "./routes/supplierRoutes.js";
import auditRoutes from "./routes/auditRoutes.js";

import connectDB from "./config/db.js";
import mongoose from "mongoose";

dotenv.config();

// Connect to MongoDB Atlas (or fallback gracefully to in-memory store)
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

// Global Middleware
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "x-api-key"]
}));
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// Root route
app.get("/", (req, res) => {
  res.json({
    name: "🥐 BakeSphere Master API Server",
    version: "2.0.0",
    status: "online",
    modules: [
      "OAuth & JWT Authentication (/api/auth)",
      "Product Catalog (/api/products)",
      "Dynamic Recipe Scaler (/api/recipes)",
      "FEFO Production Pipeline (/api/production)",
      "Perishable Inventory & Expiry Alerts (/api/inventory)",
      "POS Billing & Thermal Invoicing (/api/pos)",
      "Custom 3D Cake Studio (/api/custom-cakes)",
      "AI Demand Forecasting & Chef Pierre Chatbot (/api/ai)",
      "Executive Analytics & P&L (/api/analytics)",
      "Live API Playground Catalog (/api/docs)",
      "Equipment Maintenance (/api/equipment)",
      "Supplier Management (/api/suppliers)",
      "Security Audit Logs (/api/audit)"
    ],
    timestamp: new Date().toISOString()
  });
});

// Health check endpoint
app.get("/api/health", (req, res) => {
  const dbStates = { 0: "disconnected", 1: "connected", 2: "connecting", 3: "disconnecting" };
  const dbStateCode = mongoose.connection.readyState;
  res.json({
    status: "ok",
    system: "BakeSphere ERP & POS Core",
    version: "2.0.0",
    database: {
      status: dbStates[dbStateCode] || "unknown",
      connected: dbStateCode === 1,
      host: mongoose.connection.host || null,
      name: mongoose.connection.name || null
    },
    timestamp: new Date().toISOString()
  });
});

// Mount All Specialized API Submodules
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/recipes", recipeRoutes);
app.use("/api/production", productionRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/pos", posRoutes);
app.use("/api/custom-cakes", customCakeRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/docs", apiDocRoutes);
app.use("/api/equipment", equipmentRoutes);
app.use("/api/suppliers", supplierRoutes);
app.use("/api/audit", auditRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    error: "Endpoint not found",
    requestedPath: req.originalUrl
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("Internal Server Error:", err);
  res.status(500).json({
    error: "Internal Server Error",
    message: err.message
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`🍰 BakeSphere Master API running on http://localhost:${PORT}`);
});

export default app;
