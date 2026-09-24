import express from "express";
import { bakeryBranches } from "../data/branches.js";
import { bakeryOrders } from "../data/orders.js";
import { bakeryProducts } from "../data/products.js";
import { bakeryIngredients } from "../data/ingredients.js";
import { productionBatches } from "../data/batches.js";

const router = express.Router();

// Executive Admin Dashboard Summary
router.get("/dashboard", (req, res) => {
  const totalTodaySales = bakeryBranches.reduce((sum, b) => sum + b.todaySales, 0);
  const totalMonthlySales = bakeryBranches.reduce((sum, b) => sum + b.currentMonthSales, 0);
  const totalMonthlyTarget = bakeryBranches.reduce((sum, b) => sum + b.monthlyTarget, 0);

  const lowStockCount = bakeryIngredients.filter((i) => i.stockQuantity <= i.reorderLevel).length;

  const now = new Date().getTime();
  const expiringTodayBatches = productionBatches.filter((b) => {
    const hours = (new Date(b.expiresAt).getTime() - now) / (1000 * 3600);
    return hours > 0 && hours <= 24;
  });

  const estimatedTodayCost = totalTodaySales * 0.48; // 48% ingredient + operational cost
  const estimatedTodayProfit = totalTodaySales - estimatedTodayCost;
  const todayWastageCost = 1450.0; // ₹1,450 recorded wastage

  res.json({
    kpis: {
      todaySales: totalTodaySales,
      todayProfit: parseFloat(estimatedTodayProfit.toFixed(2)),
      profitMarginPercent: "52%",
      monthlySales: totalMonthlySales,
      targetProgressPercent: ((totalMonthlySales / totalMonthlyTarget) * 100).toFixed(1) + "%",
      activeOrdersCount: bakeryOrders.filter((o) => o.status !== "completed").length + 18,
      lowStockIngredientsCount: lowStockCount,
      batchesExpiringTodayCount: expiringTodayBatches.length,
      todayWastageCost: todayWastageCost
    },
    peakHours: [
      { hour: "07:00 - 09:00", sales: 24500, orders: 85, label: "Breakfast Commute" },
      { hour: "09:00 - 12:00", sales: 18200, orders: 42, label: "Morning Breads" },
      { hour: "12:00 - 15:00", sales: 31000, orders: 74, label: "Lunch & Sandwiches" },
      { hour: "15:00 - 17:00", sales: 19800, orders: 51, label: "Afternoon Teatime" },
      { hour: "17:00 - 20:00", sales: 54600, orders: 140, label: "Evening Rush (Peak)" },
      { hour: "20:00 - 22:30", sales: 30870, orders: 66, label: "Dinner & Desserts" }
    ],
    categoryBreakdown: [
      { category: "Cakes & Celebrations", percentage: 38, sales: 68000 },
      { category: "Pastries & Viennoiserie", percentage: 24, sales: 43000 },
      { category: "Artisan Bread", percentage: 16, sales: 28600 },
      { category: "Savory & Sandwiches", percentage: 12, sales: 21500 },
      { category: "Beverages & Coffee", percentage: 10, sales: 17870 }
    ],
    branches: bakeryBranches
  });
});

// Profit & Loss Analysis by Product
router.get("/profit-loss", (req, res) => {
  const marginAnalysis = bakeryProducts.slice(0, 8).map((product) => {
    const profitPerUnit = product.sellingPrice - product.costPrice;
    const marginPercent = ((profitPerUnit / product.sellingPrice) * 100).toFixed(1);

    return {
      id: product.id,
      name: product.name,
      category: product.category,
      sellingPrice: product.sellingPrice,
      costPrice: product.costPrice,
      profitPerUnit: parseFloat(profitPerUnit.toFixed(2)),
      marginPercent: `${marginPercent}%`,
      status: parseFloat(marginPercent) >= 50 ? "High Margin" : "Standard"
    };
  });

  res.json(marginAnalysis);
});

// Branch Performance Comparison
router.get("/branch-comparison", (req, res) => {
  res.json(bakeryBranches);
});

export default router;
