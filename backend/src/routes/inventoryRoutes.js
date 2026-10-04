import express from "express";
import { bakeryIngredients } from "../data/ingredients.js";
import { productionBatches } from "../data/batches.js";
import { auditLogs } from "../data/auditLogs.js";
import { stockReports, REPORT_TIME_SLOTS } from "../data/stockReports.js";
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
  const { branchId } = req.query;
  const now = new Date().getTime();

  let batches = [...productionBatches];
  if (branchId && branchId !== "ALL") {
    batches = batches.filter((b) => b.branchId === branchId);
  }

  const expiringToday = [];
  const expiringWithin48h = [];
  const expired = [];

  batches.forEach((batch) => {
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

// ═══════════ PERIODIC 2-HOUR STOCK REPORTING ENDPOINTS ═══════════

// GET /api/inventory/stock-reports
router.get("/stock-reports", (req, res) => {
  const { branchId, date, status } = req.query;
  let reports = [...stockReports];

  if (branchId && branchId !== "ALL") {
    reports = reports.filter((r) => r.branchId === branchId);
  }

  if (date) {
    reports = reports.filter((r) => r.reportDate === date);
  }

  if (status && status !== "ALL") {
    reports = reports.filter((r) => r.status === status);
  }

  res.json({
    timeSlots: REPORT_TIME_SLOTS,
    count: reports.length,
    reports
  });
});

// POST /api/inventory/stock-reports (Chef / Staff submits 2-hour periodic report)
router.post("/stock-reports", authenticateToken, (req, res) => {
  const {
    branchId = "BR-01",
    branchName = "Flagship T. Nagar Hub",
    slot,
    reportDate,
    items = [],
    chefNotes = ""
  } = req.body;

  if (!slot || !items.length) {
    return res.status(400).json({ error: "Please provide the reporting time slot and at least one item." });
  }

  const id = `SR-${Date.now().toString().slice(-6)}`;
  const reportNumber = `REP-${branchId.replace("BR-", "")}-${Date.now().toString().slice(-4)}`;

  const totalBaked = items.reduce((sum, it) => sum + (parseInt(it.bakedPrepared, 10) || 0), 0);
  const totalSold = items.reduce((sum, it) => sum + (parseInt(it.soldConsumed, 10) || 0), 0);
  const totalWastage = items.reduce((sum, it) => sum + (parseInt(it.wasteQty, 10) || 0), 0);
  const lowStockItemCount = items.filter((it) => it.isLowStock || (it.closingStock <= it.reorderThreshold)).length;

  const newReport = {
    id,
    reportNumber,
    branchId,
    branchName,
    slot,
    reportDate: reportDate || new Date().toISOString().split("T")[0],
    reportedBy: req.user ? req.user.name : "Chef Pierre Bouchard",
    reporterRole: req.user ? req.user.role : "chef",
    items: items.map((it) => ({
      productName: it.productName,
      openingStock: parseInt(it.openingStock, 10) || 0,
      bakedPrepared: parseInt(it.bakedPrepared, 10) || 0,
      soldConsumed: parseInt(it.soldConsumed, 10) || 0,
      closingStock: parseInt(it.closingStock, 10) || 0,
      wasteQty: parseInt(it.wasteQty, 10) || 0,
      wasteReason: it.wasteReason || "",
      reorderThreshold: parseInt(it.reorderThreshold, 10) || 5,
      isLowStock: it.closingStock <= (parseInt(it.reorderThreshold, 10) || 5)
    })),
    totalBaked,
    totalSold,
    totalWastage,
    lowStockItemCount,
    chefNotes,
    status: "submitted_by_chef",
    managerName: null,
    managerNotes: null,
    managerReviewedAt: null,
    adminReviewedAt: null,
    createdAt: new Date().toISOString()
  };

  stockReports.unshift(newReport);

  auditLogs.unshift({
    id: `LOG-${Date.now().toString().slice(-4)}`,
    timestamp: new Date().toISOString(),
    userName: req.user ? req.user.name : "Chef",
    userRole: req.user ? req.user.role : "chef",
    action: "STOCK_REPORT_SUBMITTED",
    details: `Chef submitted 2-hour stock report ${reportNumber} for ${branchName} (${slot}). Total Baked: ${totalBaked}, Sold: ${totalSold}, Wastage: ${totalWastage}.`
  });

  res.status(201).json({
    message: "Periodic stock report submitted successfully for Manager review!",
    report: newReport
  });
});

// PATCH /api/inventory/stock-reports/:id/review (Manager / Admin Approves or Rejects)
router.patch("/stock-reports/:id/review", authenticateToken, (req, res) => {
  const { id } = req.params;
  const { status, managerNotes } = req.body;

  const report = stockReports.find((r) => r.id === id);
  if (!report) {
    return res.status(404).json({ error: "Stock report not found." });
  }

  const role = req.user ? req.user.role : "manager";
  const reviewerName = req.user ? req.user.name : "Branch Manager";

  if (role === "admin") {
    report.status = status || "reviewed_by_admin";
    report.adminReviewedAt = new Date().toISOString();
  } else {
    report.status = status || "approved_by_manager";
    report.managerName = reviewerName;
    report.managerNotes = managerNotes || "Physical counts verified.";
    report.managerReviewedAt = new Date().toISOString();
  }

  auditLogs.unshift({
    id: `LOG-${Date.now().toString().slice(-4)}`,
    timestamp: new Date().toISOString(),
    userName: reviewerName,
    userRole: role,
    action: "STOCK_REPORT_REVIEWED",
    details: `${role === "admin" ? "Admin" : "Manager"} reviewed stock report ${report.reportNumber} status set to "${report.status}".`
  });

  res.json({
    message: `Stock report ${report.reportNumber} updated to ${report.status}`,
    report
  });
});

// ═══════════ SMART CLEARANCE DISCOUNT & STOREFRONT ENDPOINTS ═══════════

// GET /api/inventory/clearance-items (Storefront Night Market / Flash Sale items)
router.get("/clearance-items", (req, res) => {
  const { branchId } = req.query;
  const now = new Date().getTime();

  let batches = [...productionBatches];
  if (branchId && branchId !== "ALL") {
    batches = batches.filter((b) => b.branchId === branchId);
  }

  // Filter for batches with active discount or expiring within 24h
  const clearanceList = batches
    .filter((b) => b.quantityRemaining > 0)
    .map((b) => {
      const expiryTime = new Date(b.expiresAt).getTime();
      const hoursRemaining = parseFloat(((expiryTime - now) / (1000 * 60 * 60)).toFixed(1));

      // Calculate dynamic discount suggestion if not explicitly applied
      let discount = b.discountApplied || 0;
      if (discount === 0) {
        if (hoursRemaining <= 3 && hoursRemaining > 0) discount = 50;
        else if (hoursRemaining <= 6 && hoursRemaining > 0) discount = 35;
        else if (hoursRemaining <= 12 && hoursRemaining > 0) discount = 20;
      }

      const originalPrice = b.sellingPrice;
      const finalPrice = discount > 0 ? parseFloat((originalPrice * (1 - discount / 100)).toFixed(2)) : originalPrice;

      return {
        batchId: b.batchId,
        productId: b.productId,
        productName: b.productName,
        branchId: b.branchId,
        quantityRemaining: b.quantityRemaining,
        hoursRemaining,
        expiresAt: b.expiresAt,
        discountApplied: discount,
        originalPrice,
        discountedPrice: finalPrice,
        isExpired: hoursRemaining <= 0,
        urgencyBadge:
          hoursRemaining <= 0
            ? "Expired (Quarantine)"
            : hoursRemaining <= 3
            ? "Flash Clearance 50% OFF ⚡"
            : hoursRemaining <= 6
            ? "Night Market 35% OFF 🌙"
            : hoursRemaining <= 12
            ? "Fresh Clearance 20% OFF 🏷️"
            : "Fresh Batch 🌿"
      };
    })
    .filter((b) => b.discountApplied > 0 && !b.isExpired);

  res.json({
    count: clearanceList.length,
    items: clearanceList
  });
});

// POST /api/inventory/smart-clearance-auto (One-click Smart Clearance Automated Engine)
router.post("/smart-clearance-auto", authenticateToken, (req, res) => {
  const { branchId } = req.body;
  const now = new Date().getTime();
  let updatedCount = 0;

  productionBatches.forEach((batch) => {
    if (branchId && branchId !== "ALL" && batch.branchId !== branchId) return;
    if (batch.quantityRemaining <= 0) return;

    const expiryTime = new Date(batch.expiresAt).getTime();
    const hoursRemaining = (expiryTime - now) / (1000 * 60 * 60);

    if (hoursRemaining > 0 && hoursRemaining <= 12) {
      let discount = 20;
      if (hoursRemaining <= 3) discount = 60;
      else if (hoursRemaining <= 6) discount = 40;

      batch.discountApplied = discount;
      batch.discountedSellingPrice = parseFloat((batch.sellingPrice * (1 - discount / 100)).toFixed(2));
      batch.status = "flash_clearance_active";
      updatedCount++;
    }
  });

  auditLogs.unshift({
    id: `LOG-${Date.now().toString().slice(-4)}`,
    timestamp: new Date().toISOString(),
    userName: req.user ? req.user.name : "Manager",
    userRole: req.user ? req.user.role : "manager",
    action: "SMART_CLEARANCE_ACTIVATED",
    details: `Automated dynamic FEFO smart clearance activated across near-expiry inventory. ${updatedCount} batches discounted.`
  });

  res.json({
    message: `Smart Clearance discount triggered for ${updatedCount} near-expiry batches!`,
    updatedCount
  });
});

export default router;

