import express from "express";
import { bakeryIngredients } from "../data/ingredients.js";
import { productionBatches } from "../data/batches.js";
import { auditLogs } from "../data/auditLogs.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

// Get all raw material ingredients with stock levels
router.get("/ingredients", (req, res) => {
  const { category, lowStockOnly } = req.query;
  let items = [...bakeryIngredients];

  if (category) {
    items = items.filter((i) => i.category.toLowerCase() === category.toLowerCase());
  }

  if (lowStockOnly === "true") {
    items = items.filter((i) => i.stockQuantity <= i.reorderLevel);
  }

  res.json({
    totalCount: items.length,
    lowStockCount: bakeryIngredients.filter((i) => i.stockQuantity <= i.reorderLevel).length,
    ingredients: items
  });
});

// Get low stock alerts
router.get("/low-stock", (req, res) => {
  const lowStock = bakeryIngredients.filter((i) => i.stockQuantity <= i.reorderLevel);
  res.json({
    count: lowStock.length,
    alerts: lowStock.map((i) => ({
      id: i.id,
      name: i.name,
      category: i.category,
      currentStock: `${i.stockQuantity} ${i.unit}`,
      reorderThreshold: `${i.reorderLevel} ${i.unit}`,
      shortfall: `${(i.reorderLevel - i.stockQuantity).toFixed(2)} ${i.unit}`,
      supplierName: i.supplierName
    }))
  });
});

// FEFO Expiry Alerts & Flash Markdown Engine (Non-CRUD Resume Feature)
// Detects batches expiring within 24 hours, 48 hours, and expired
router.get("/fefo-alerts", (req, res) => {
  const now = new Date().getTime();

  const expiringToday = [];
  const expiringWithin48h = [];
  const expired = [];

  productionBatches.forEach((batch) => {
    const expiryTime = new Date(batch.expiresAt).getTime();
    const hoursRemaining = (expiryTime - now) / (1000 * 60 * 60);

    if (hoursRemaining <= 0) {
      expired.push({ ...batch, hoursRemaining: hoursRemaining.toFixed(1) });
    } else if (hoursRemaining <= 24) {
      expiringToday.push({
        ...batch,
        hoursRemaining: hoursRemaining.toFixed(1),
        suggestedDiscount: batch.discountApplied > 0 ? batch.discountApplied : 25,
        estimatedLossIfUnsold: batch.quantityRemaining * batch.costPricePerUnit
      });
    } else if (hoursRemaining <= 48) {
      expiringWithin48h.push({ ...batch, hoursRemaining: hoursRemaining.toFixed(1) });
    }
  });

  const totalAtRiskCost = expiringToday.reduce(
    (sum, b) => sum + b.quantityRemaining * b.costPricePerUnit,
    0
  );

  res.json({
    summary: {
      expiringTodayCount: expiringToday.length,
      expiringWithin48hCount: expiringWithin48h.length,
      expiredCount: expired.length,
      totalAtRiskCost: parseFloat(totalAtRiskCost.toFixed(2))
    },
    expiringToday,
    expiringWithin48h,
    expired
  });
});

// Apply Flash Markdown / Happy Hour Discount to save near-expiry batches
router.post("/apply-markdown", authenticateToken, (req, res) => {
  const { batchId, discountPercent } = req.body;
  const batch = productionBatches.find((b) => b.batchId === batchId);

  if (!batch) {
    return res.status(404).json({ error: "Batch not found" });
  }

  const discount = Math.min(60, Math.max(5, parseInt(discountPercent, 10) || 20));
  batch.discountApplied = discount;
  batch.discountedSellingPrice = parseFloat(
    (batch.sellingPrice * (1 - discount / 100)).toFixed(2)
  );
  batch.status = "flash_sale_active";

  auditLogs.unshift({
    id: `LOG-${Date.now().toString().slice(-4)}`,
    timestamp: new Date().toISOString(),
    userName: req.user ? req.user.name : "Manager",
    userRole: req.user ? req.user.role : "manager",
    action: "FLASH_MARKDOWN_APPLIED",
    details: `Applied ${discount}% flash markdown to ${batch.batchId} (${batch.productName}) to mitigate wastage.`
  });

  res.json({
    message: `Applied ${discount}% discount to batch ${batch.batchId}`,
    batch
  });
});

// Log Food Waste (burnt, damaged, expired)
router.post("/log-wastage", authenticateToken, (req, res) => {
  const { productId, quantity, reason, notes } = req.body;

  const costPerUnit = 60.0;
  const units = parseInt(quantity, 10) || 1;
  const wastageCost = units * costPerUnit;

  auditLogs.unshift({
    id: `LOG-${Date.now().toString().slice(-4)}`,
    timestamp: new Date().toISOString(),
    userName: req.user ? req.user.name : "Baker",
    userRole: req.user ? req.user.role : "head_baker",
    action: "FOOD_WASTAGE_LOGGED",
    details: `Discarded ${units} units (Reason: ${reason || "Expired"}). Cost Impact: ₹${wastageCost}`
  });

  res.status(201).json({
    message: "Wastage recorded successfully",
    quantity: units,
    reason: reason || "Expired",
    wastageCost: parseFloat(wastageCost.toFixed(2)),
    notes: notes || "Discarded per hygiene standards"
  });
});

export default router;
