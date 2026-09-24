import express from "express";
import { masterRecipes } from "../data/recipes.js";
import { bakeryIngredients } from "../data/ingredients.js";

const router = express.Router();

// List all master recipes
router.get("/", (req, res) => {
  res.json({
    count: masterRecipes.length,
    recipes: masterRecipes
  });
});

// Get recipe by ID
router.get("/:id", (req, res) => {
  const recipe = masterRecipes.find((r) => r.id === req.params.id);
  if (!recipe) {
    return res.status(404).json({ error: "Recipe not found" });
  }
  res.json(recipe);
});

// Dynamic Recipe Scaler Engine (Non-CRUD Resume Feature)
// Calculates exact ingredient gram weights, cost, and inventory availability for any target batch volume
router.post("/scale", (req, res) => {
  const { recipeId, targetUnits } = req.body;

  if (!recipeId || !targetUnits || targetUnits <= 0) {
    return res.status(400).json({
      error: "Valid recipeId and targetUnits (> 0) are required."
    });
  }

  const recipe = masterRecipes.find((r) => r.id === recipeId);
  if (!recipe) {
    return res.status(404).json({ error: `Recipe '${recipeId}' not found.` });
  }

  const units = parseInt(targetUnits, 10);
  let totalEstimatedIngredientCost = 0;
  const shortages = [];

  const scaledIngredients = recipe.ingredients.map((ing) => {
    const rawMaterial = bakeryIngredients.find((m) => m.id === ing.ingredientId);
    const scaledAmount = ing.baseGrams * units;

    let displayAmount = `${scaledAmount} ${ing.unit}`;
    let stockStatus = "available";
    let currentStockDisplay = "N/A";

    if (rawMaterial) {
      // Calculate unit cost
      if (ing.unit === "g") {
        const kgNeeded = scaledAmount / 1000;
        const cost = kgNeeded * rawMaterial.unitCost;
        totalEstimatedIngredientCost += cost;
        currentStockDisplay = `${rawMaterial.stockQuantity} kg on hand`;

        if (rawMaterial.stockQuantity < kgNeeded) {
          stockStatus = "shortage";
          shortages.push({
            ingredient: rawMaterial.name,
            required: `${kgNeeded.toFixed(2)} kg`,
            available: `${rawMaterial.stockQuantity} kg`,
            deficit: `${(kgNeeded - rawMaterial.stockQuantity).toFixed(2)} kg`
          });
        }
      } else if (ing.unit === "ml") {
        const litersNeeded = scaledAmount / 1000;
        const cost = litersNeeded * rawMaterial.unitCost;
        totalEstimatedIngredientCost += cost;
        currentStockDisplay = `${rawMaterial.stockQuantity} L on hand`;

        if (rawMaterial.stockQuantity < litersNeeded) {
          stockStatus = "shortage";
          shortages.push({
            ingredient: rawMaterial.name,
            required: `${litersNeeded.toFixed(2)} L`,
            available: `${rawMaterial.stockQuantity} L`,
            deficit: `${(litersNeeded - rawMaterial.stockQuantity).toFixed(2)} L`
          });
        }
      } else if (ing.unit === "pcs") {
        const cost = scaledAmount * rawMaterial.unitCost;
        totalEstimatedIngredientCost += cost;
        currentStockDisplay = `${rawMaterial.stockQuantity} pcs on hand`;

        if (rawMaterial.stockQuantity < scaledAmount) {
          stockStatus = "shortage";
          shortages.push({
            ingredient: rawMaterial.name,
            required: `${scaledAmount} pcs`,
            available: `${rawMaterial.stockQuantity} pcs`,
            deficit: `${scaledAmount - rawMaterial.stockQuantity} pcs`
          });
        }
      }
    }

    return {
      ingredientId: ing.ingredientId,
      name: ing.name,
      basePerUnit: `${ing.baseGrams} ${ing.unit}`,
      scaledTotal: scaledAmount >= 1000 && ing.unit === "g" ? `${(scaledAmount / 1000).toFixed(2)} kg` : displayAmount,
      rawAmount: scaledAmount,
      unit: ing.unit,
      stockStatus,
      currentStock: currentStockDisplay
    };
  });

  res.json({
    recipeId: recipe.id,
    recipeName: recipe.name,
    targetUnits: units,
    yieldDescription: `${units} × ${recipe.baseBatchUnit}`,
    totalPreparationTimeMin: recipe.preparationTimeMin,
    bakingSpecs: {
      temperature: `${recipe.bakingTemperatureC}°C`,
      duration: `${recipe.bakingTimeMin} mins`
    },
    totalEstimatedIngredientCost: parseFloat(totalEstimatedIngredientCost.toFixed(2)),
    costPerUnit: parseFloat((totalEstimatedIngredientCost / units).toFixed(2)),
    canProduceImmediately: shortages.length === 0,
    shortages,
    scaledIngredients,
    procedure: recipe.procedure
  });
});

export default router;
