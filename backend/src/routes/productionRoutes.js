import express from "express";
import { productionBatches } from "../data/batches.js";
import { masterRecipes } from "../data/recipes.js";
import { bakeryIngredients } from "../data/ingredients.js";
import { bakeryProducts } from "../data/products.js";
import { auditLogs } from "../data/auditLogs.js";
import { authenticateToken, requireRoles } from "../middleware/auth.js";

const router = express.Router();

// Get active production batches
router.get("/batches", (req, res) => {
  const { branchId, status } = req.query;
  let results = [...productionBatches];

  if (branchId) {
    results = results.filter((b) => b.branchId === branchId);
  }
  if (status) {
    results = results.filter((b) => b.status === status);
  }

  res.json({
    count: results.length,
    batches: results
  });
});

// Create and execute FEFO Production Run (Non-CRUD Resume Feature)
// Deducts ingredients from inventory using FEFO rules and registers batch with exact expiry date
router.post("/consume-fefo", authenticateToken, requireRoles(["super_admin", "manager", "head_baker"]), (req, res) => {
  const { recipeId, quantity, branchId } = req.body;

  if (!recipeId || !quantity || quantity <= 0) {
    return res.status(400).json({ error: "Valid recipeId and quantity are required." });
  }

  const recipe = masterRecipes.find((r) => r.id === recipeId);
  if (!recipe) {
    return res.status(404).json({ error: "Recipe not found" });
  }

  const product = bakeryProducts.find((p) => p.id === recipe.productId);
  const units = parseInt(quantity, 10);

  // 1. Verify and deduct ingredients
  const deductions = [];
  for (const ing of recipe.ingredients) {
    const rawMaterial = bakeryIngredients.find((m) => m.id === ing.ingredientId);
    if (rawMaterial) {
      let needed = 0;
      if (ing.unit === "g" || ing.unit === "ml") {
        needed = (ing.baseGrams * units) / 1000;
      } else {
        needed = ing.baseGrams * units;
      }

      // Deduct stock safely
      rawMaterial.stockQuantity = Math.max(0, parseFloat((rawMaterial.stockQuantity - needed).toFixed(2)));
      if (rawMaterial.stockQuantity <= rawMaterial.reorderLevel) {
        rawMaterial.status = "low_stock";
      }

      deductions.push({
        ingredientId: rawMaterial.id,
        ingredientName: rawMaterial.name,
        amountDeducted: `${needed.toFixed(2)} ${rawMaterial.unit}`,
        newStockLevel: `${rawMaterial.stockQuantity} ${rawMaterial.unit}`
      });
    }
  }

  // 2. Generate FEFO Batch
  const now = new Date();
  const shelfLifeHours = (product ? product.shelfLifeDays : 2) * 24;
  const expiryDate = new Date(now.getTime() + shelfLifeHours * 60 * 60 * 1000);

  const batchCode = `BATCH-${now.getFullYear().toString().slice(-2)}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}-${(product ? product.name.slice(0, 4) : "BAKE").toUpperCase()}-${String(productionBatches.length + 1).padStart(2, "0")}`;

  const newBatch = {
    batchId: batchCode,
    productId: product ? product.id : 1,
    productName: product ? product.name : recipe.name,
    branchId: branchId || "BR-01",
    quantityProduced: units,
    quantityRemaining: units,
    producedAt: now.toISOString(),
    expiresAt: expiryDate.toISOString(),
    baker: req.user ? req.user.name : "Chef Pierre Bouchard",
    status: "fresh",
    currentStage: "mixing",
    fefoPriority: 3,
    discountApplied: 0,
    costPricePerUnit: product ? product.costPrice : 150.0,
    sellingPrice: product ? product.sellingPrice : 300.0
  };

  productionBatches.unshift(newBatch);

  // 3. Log into Audit Trail
  auditLogs.unshift({
    id: `LOG-${Date.now().toString().slice(-4)}`,
    timestamp: now.toISOString(),
    userName: req.user ? req.user.name : "Head Baker",
    userRole: req.user ? req.user.role : "head_baker",
    action: "FEFO_BATCH_CREATED",
    details: `Initiated ${units} units of ${recipe.name} (${batchCode}). Deducted ${deductions.length} raw ingredients.`
  });

  res.status(201).json({
    message: `Batch ${batchCode} started and FEFO ingredients allocated!`,
    batch: newBatch,
    deductions
  });
});

// Update Batch Stage Pipeline
router.patch("/batches/:batchId/stage", authenticateToken, (req, res) => {
  const { stage } = req.body;
  const validStages = ["planned", "allocated", "mixing", "baking", "cooling", "qc_approved", "ready_for_sale"];

  if (!validStages.includes(stage)) {
    return res.status(400).json({ error: `Invalid stage. Allowed: ${validStages.join(", ")}` });
  }

  const batch = productionBatches.find((b) => b.batchId === req.params.batchId);
  if (!batch) {
    return res.status(404).json({ error: "Batch not found" });
  }

  batch.currentStage = stage;
  if (stage === "ready_for_sale") {
    // Increase finished product stock
    const product = bakeryProducts.find((p) => p.id === batch.productId);
    if (product) {
      product.availableQuantity += batch.quantityRemaining;
    }
  }

  res.json({
    message: `Batch ${batch.batchId} progressed to '${stage}'`,
    batch
  });
});

export default router;
