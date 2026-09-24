import express from "express";
import mongoose from "mongoose";
import { bakeryOrders } from "../data/orders.js";
import { auditLogs } from "../data/auditLogs.js";
import { authenticateToken } from "../middleware/auth.js";
import Order from "../models/Order.js";
import AuditLog from "../models/AuditLog.js";

const router = express.Router();

// Dynamic Custom Cake Pricing Engine (Non-CRUD Resume Feature)
router.post("/quote", (req, res) => {
  const {
    tiers = 1,
    weightKg = 1.5,
    baseSponge = "Belgian Dark Chocolate",
    filling = "Belgian Dark Ganache",
    shape = "Round",
    theme = "Floral Elegance",
    toppings = [],
    turnaround = "standard" // standard (48h), rush (24h), express (same-day)
  } = req.body;

  const weight = Math.max(1, parseFloat(weightKg) || 1.5);
  const tierCount = parseInt(tiers, 10) || 1;

  // Base price per kg
  let ratePerKg = 950.0;
  if (baseSponge.toLowerCase().includes("belgian") || baseSponge.toLowerCase().includes("velvet")) {
    ratePerKg = 1100.0;
  }

  // Tier architectural complexity surcharge
  let tierComplexityFee = 0;
  if (tierCount === 2) tierComplexityFee = 450.0;
  if (tierCount >= 3) tierComplexityFee = 950.0;

  // Premium filling surcharge
  let fillingFee = 0;
  if (filling.toLowerCase().includes("ganache") || filling.toLowerCase().includes("diplomat")) {
    fillingFee = 250.0 * tierCount;
  } else if (filling.toLowerCase().includes("truffle") || filling.toLowerCase().includes("caramel")) {
    fillingFee = 350.0 * tierCount;
  }

  // Shape complexity
  let shapeFee = shape === "Heart" || shape === "Hexagonal" ? 200.0 : 0.0;

  // Toppings & embellishments
  let toppingsFee = 0;
  if (Array.isArray(toppings)) {
    if (toppings.includes("gold_foil")) toppingsFee += 300.0;
    if (toppings.includes("macarons")) toppingsFee += 250.0;
    if (toppings.includes("fresh_berries")) toppingsFee += 280.0;
    if (toppings.includes("fondant_sculpting")) toppingsFee += 500.0;
  }

  // Rush production turnaround surcharge
  let rushFee = 0;
  if (turnaround === "rush") rushFee = 350.0;
  if (turnaround === "express") rushFee = 650.0;

  const spongeAndStructureTotal = ratePerKg * weight;
  const subtotal = spongeAndStructureTotal + tierComplexityFee + fillingFee + shapeFee + toppingsFee + rushFee;
  const gstAmount = parseFloat((subtotal * 0.05).toFixed(2));
  const grandTotal = parseFloat((subtotal + gstAmount).toFixed(2));
  const advanceRequired = parseFloat((grandTotal * 0.5).toFixed(2));

  res.json({
    quote: {
      tiers: tierCount,
      weightKg: weight,
      baseSponge,
      filling,
      shape,
      theme,
      spongeAndStructureCost: parseFloat(spongeAndStructureTotal.toFixed(2)),
      tierComplexityFee,
      fillingFee,
      shapeFee,
      toppingsFee,
      rushFee,
      subtotal: parseFloat(subtotal.toFixed(2)),
      gstAmount,
      grandTotal,
      advanceRequired,
      balanceOnDelivery: parseFloat((grandTotal - advanceRequired).toFixed(2))
    }
  });
});

// Submit Custom Cake Order
router.post("/submit", authenticateToken, (req, res) => {
  const {
    customerName,
    customerPhone,
    deliveryAddress,
    deliveryDate,
    deliveryTimeSlot,
    cakeMessage,
    quote,
    referenceImageUrl
  } = req.body;

  if (!quote || !quote.grandTotal) {
    return res.status(400).json({ error: "Please calculate a valid quote first." });
  }

  const orderId = `BS-CK-${Date.now().toString().slice(-5)}`;
  const newOrder = {
    orderId,
    type: "custom_cake",
    branchId: "BR-04", // central production
    customerName: customerName || (req.user ? req.user.name : "Valued Customer"),
    customerPhone: customerPhone || (req.user ? req.user.phone : "+91 98400 00000"),
    deliveryAddress: deliveryAddress || "Pickup at Heritage Main (T. Nagar)",
    deliveryDate: deliveryDate || new Date(Date.now() + 48 * 3600 * 1000).toISOString().split("T")[0],
    deliveryTimeSlot: deliveryTimeSlot || "05:00 PM – 07:00 PM",
    customDetails: {
      tiers: quote.tiers,
      weightKg: quote.weightKg,
      baseFlavor: quote.baseSponge,
      filling: quote.filling,
      shape: quote.shape,
      theme: quote.theme,
      cakeMessage: cakeMessage || "Happy Celebration! 🎂",
      referenceImageUrl: referenceImageUrl || "https://images.unsplash.com/photo-1535141192574-5d4897c13136?w=600&auto=format&fit=crop&q=80",
      advancePaid: quote.advanceRequired,
      balanceDue: quote.balanceOnDelivery
    },
    items: [
      {
        productId: 16,
        name: `Custom ${quote.tiers}-Tier Cake (${quote.weightKg}kg - ${quote.baseSponge})`,
        quantity: 1,
        price: quote.grandTotal
      }
    ],
    subtotal: quote.subtotal,
    gstAmount: quote.gstAmount,
    finalTotal: quote.grandTotal,
    paymentMethod: "UPI Advance",
    status: "confirmed",
    assignedChef: "Chef Pierre Bouchard",
    createdAt: new Date().toISOString()
  };

  bakeryOrders.unshift(newOrder);

  const auditEntry = {
    id: `LOG-${Date.now().toString().slice(-4)}`,
    timestamp: new Date().toISOString(),
    userName: req.user ? req.user.name : "Customer",
    userRole: req.user ? req.user.role : "customer",
    action: "CUSTOM_CAKE_BOOKED",
    details: `Booked Custom Cake Order #${orderId} (${quote.weightKg}kg, ${quote.tiers} tier). Advance ₹${quote.advanceRequired} recorded.`
  };
  auditLogs.unshift(auditEntry);

  // Persist to MongoDB Atlas asynchronously if connected
  if (mongoose.connection.readyState === 1) {
    Order.create(newOrder).catch((err) => {
      console.error("🍃 [MongoDB Atlas] Error saving custom cake order to database:", err.message);
    });
    AuditLog.create({
      logId: auditEntry.id,
      action: auditEntry.action,
      performedBy: auditEntry.userName,
      target: orderId,
      details: auditEntry.details,
      timestamp: new Date()
    }).catch((err) => {
      console.error("🍃 [MongoDB Atlas] Error saving audit log to database:", err.message);
    });
  }

  res.status(201).json({
    message: "Custom cake order placed successfully!",
    orderId,
    order: newOrder
  });
});

export default router;
