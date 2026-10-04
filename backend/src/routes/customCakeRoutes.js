import express from "express";
import mongoose from "mongoose";
import { bakeryOrders } from "../data/orders.js";
import { auditLogs } from "../data/auditLogs.js";
import { CAKE_INSPIRATIONS, INSPIRATION_CATEGORIES } from "../data/cakeInspirations.js";
import { customCakeRequests } from "../data/customCakeRequests.js";
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
    if (toppings.includes("photo_sheet")) toppingsFee += 350.0;
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

// GET /api/custom-cakes/inspirations
router.get("/inspirations", (req, res) => {
  const { category, search } = req.query;
  let items = [...CAKE_INSPIRATIONS];

  if (category && category !== "All Themes") {
    items = items.filter(
      (item) => item.category.toLowerCase() === category.toLowerCase()
    );
  }

  if (search && search.trim()) {
    const q = search.toLowerCase().trim();
    items = items.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.theme.toLowerCase().includes(q) ||
        (item.tags && item.tags.some((t) => t.toLowerCase().includes(q)))
    );
  }

  res.json({
    categories: INSPIRATION_CATEGORIES,
    count: items.length,
    inspirations: items
  });
});

// GET /api/custom-cakes/inspirations/:id
router.get("/inspirations/:id", (req, res) => {
  const item = CAKE_INSPIRATIONS.find((i) => i.id === req.params.id);
  if (!item) {
    return res.status(404).json({ error: "Cake inspiration theme not found." });
  }
  res.json({ inspiration: item });
});

// POST /api/custom-cakes/custom-request (Customer submits custom design / photo cake inquiry)
router.post("/custom-request", (req, res) => {
  const {
    customerName,
    customerPhone,
    customerEmail,
    branchId = "BR-01",
    branchName = "Flagship T. Nagar Hub",
    theme,
    category = "Custom Design",
    tiers = 1,
    weightKg = 2,
    baseSponge = "Belgian Dark Chocolate",
    filling = "Belgian Dark Ganache",
    shape = "Round",
    colorPalette = [],
    cakeMessage,
    photoCakeUrl,
    photoCropShape = "Round",
    specialInstructions,
    deliveryDate,
    deliveryTimeSlot,
    deliveryAddress
  } = req.body;

  if (!theme || !theme.trim()) {
    return res.status(400).json({ error: "Please provide a theme or idea description for your custom cake." });
  }

  const requestId = `CCR-${Date.now().toString().slice(-4)}`;
  const estimatedQuote = Math.round((parseFloat(weightKg) || 2) * 1100 + (parseInt(tiers, 10) > 1 ? 500 : 0) + (photoCakeUrl ? 350 : 0));

  const newRequest = {
    id: requestId,
    customerName: customerName || "Valued Customer",
    customerPhone: customerPhone || "+91 98400 00000",
    customerEmail: customerEmail || "customer@bakesphere.com",
    branchId,
    branchName,
    theme,
    category,
    tiers: parseInt(tiers, 10) || 1,
    weightKg: parseFloat(weightKg) || 2,
    baseSponge,
    filling,
    shape,
    colorPalette,
    cakeMessage: cakeMessage || "Happy Celebration! 🎂",
    photoCakeUrl: photoCakeUrl || null,
    photoCropShape,
    specialInstructions: specialInstructions || "",
    deliveryDate: deliveryDate || new Date(Date.now() + 72 * 3600 * 1000).toISOString().split("T")[0],
    deliveryTimeSlot: deliveryTimeSlot || "05:00 PM – 07:00 PM",
    deliveryAddress: deliveryAddress || "Pickup at Branch",
    status: "quoted",
    estimatedQuote,
    assignedChef: "Chef Pierre Bouchard",
    createdAt: new Date().toISOString()
  };

  customCakeRequests.unshift(newRequest);

  res.status(201).json({
    message: "Custom cake design inquiry received! A master pastry chef will review your design.",
    request: newRequest
  });
});

// GET /api/custom-cakes/custom-requests (For Manager / Admin Review)
router.get("/custom-requests", (req, res) => {
  const { branchId, status } = req.query;
  let requests = [...customCakeRequests];

  if (branchId && branchId !== "ALL") {
    requests = requests.filter((r) => r.branchId === branchId);
  }

  if (status && status !== "ALL") {
    requests = requests.filter((r) => r.status === status);
  }

  res.json({
    count: requests.length,
    requests
  });
});

// PATCH /api/custom-cakes/custom-requests/:id/status
router.patch("/custom-requests/:id/status", (req, res) => {
  const { id } = req.params;
  const { status, estimatedQuote, chefNotes, assignedChef } = req.body;

  const reqItem = customCakeRequests.find((r) => r.id === id);
  if (!reqItem) {
    return res.status(404).json({ error: "Custom cake request not found." });
  }

  if (status) reqItem.status = status;
  if (estimatedQuote) reqItem.estimatedQuote = Number(estimatedQuote);
  if (chefNotes) reqItem.chefNotes = chefNotes;
  if (assignedChef) reqItem.assignedChef = assignedChef;

  res.json({
    message: "Custom cake request updated.",
    request: reqItem
  });
});

export default router;

