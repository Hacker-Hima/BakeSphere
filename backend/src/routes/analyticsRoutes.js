import express from "express";
import { bakeryBranches } from "../data/branches.js";
import { bakeryOrders } from "../data/orders.js";
import { bakeryProducts } from "../data/products.js";
import { bakeryIngredients } from "../data/ingredients.js";
import { productionBatches } from "../data/batches.js";
import { customerReviews } from "../data/reviews.js";
import { stockReports } from "../data/stockReports.js";

const router = express.Router();

// Helper to compute branch ratings
const getBranchStats = () => {
  return bakeryBranches.map((branch, index) => {
    const branchRevs = customerReviews.filter((r) => r.branchId === branch.id);
    const avgRating = branchRevs.length > 0
      ? (branchRevs.reduce((acc, r) => acc + r.rating, 0) / branchRevs.length).toFixed(1)
      : branch.rating.toString();

    const targetPct = ((branch.currentMonthSales / branch.monthlyTarget) * 100).toFixed(1);
    
    // Top-selling items per branch
    const branchTopSellers = [
      index === 0 ? "Belgian Truffle Cake" : index === 1 ? "Butter Croissants" : index === 2 ? "Blueberry Danish" : "Red Velvet Gateau",
      index === 0 ? "Almond Macaron" : index === 1 ? "Lotus Biscoff Pastry" : index === 2 ? "Paneer Tikka Puff" : "Opera Cake"
    ];

    // Award badges
    const badges = [
      "🏆 Top Revenue Hub",
      "⭐ Highest Customer Satisfaction",
      "🌿 Zero-Waste Excellence (99.1%)",
      "⚡ Express Turnaround Leader"
    ];

    const fefoScores = [98.6, 97.4, 99.2, 96.8];
    const wastageRates = [2.2, 3.1, 1.8, 2.7];

    return {
      ...branch,
      calculatedRating: parseFloat(avgRating),
      reviewsCount: branchRevs.length + 24,
      targetProgressPercent: `${targetPct}%`,
      fefoComplianceScore: fefoScores[index % fefoScores.length],
      wastageRatePercent: wastageRates[index % wastageRates.length],
      topSellers: branchTopSellers,
      awardBadge: badges[index % badges.length]
    };
  });
};

// Executive Admin Dashboard Summary (supports ?branchId=BR-01 or ALL)
router.get("/dashboard", (req, res) => {
  const { branchId } = req.query;
  const branchList = getBranchStats();
  const selectedBranch = branchId && branchId !== "ALL" 
    ? branchList.find((b) => b.id === branchId) 
    : null;

  const totalTodaySales = selectedBranch 
    ? selectedBranch.todaySales 
    : branchList.reduce((sum, b) => sum + b.todaySales, 0);

  const totalMonthlySales = selectedBranch
    ? selectedBranch.currentMonthSales
    : branchList.reduce((sum, b) => sum + b.currentMonthSales, 0);

  const totalMonthlyTarget = selectedBranch
    ? selectedBranch.monthlyTarget
    : branchList.reduce((sum, b) => sum + b.monthlyTarget, 0);

  const lowStockCount = bakeryIngredients.filter((i) => i.stockQuantity <= i.reorderLevel).length;

  const now = new Date().getTime();
  const expiringTodayBatches = productionBatches.filter((b) => {
    const hours = (new Date(b.expiresAt).getTime() - now) / (1000 * 3600);
    return hours > 0 && hours <= 24;
  });

  const estimatedTodayCost = totalTodaySales * 0.48; // 48% ingredient + operational cost
  const estimatedTodayProfit = totalTodaySales - estimatedTodayCost;
  const todayWastageCost = selectedBranch ? Math.round(selectedBranch.todaySales * 0.024) : 1450.0;

  // Operational AI Recommendations
  const operationalRecommendations = {
    dailyBakingSchedule: [
      {
        slot: "06:00 AM – 08:00 AM",
        label: "Dawn Prep & Breakfast Viennoiserie",
        items: [
          { name: "French Butter Croissants", targetQty: 60, status: "Baking Complete", oven: "Deck 1 (220°C)" },
          { name: "San Francisco Sourdough Boules", targetQty: 35, status: "Baking Complete", oven: "Deck 2 (240°C)" },
          { name: "Pain au Chocolat", targetQty: 40, status: "Baking Complete", oven: "Deck 1 (220°C)" }
        ]
      },
      {
        slot: "11:30 AM – 01:30 PM",
        label: "Midday Fresh Savories & Sandwiches",
        items: [
          { name: "Spiced Paneer Tikka Puffs", targetQty: 50, status: "Proofing Complete", oven: "Deck 3 (200°C)" },
          { name: "Classic French Baguettes", targetQty: 30, status: "In Oven", oven: "Deck 2 (230°C)" },
          { name: "Smoked Chicken Keema Puffs", targetQty: 45, status: "Chilled Ready", oven: "Deck 3 (200°C)" }
        ]
      },
      {
        slot: "03:30 PM – 05:30 PM",
        label: "Afternoon Teatime & Pastry Restock",
        items: [
          { name: "Wild Mountain Blueberry Danish", targetQty: 25, status: "Ready to Bake", oven: "Deck 1 (210°C)" },
          { name: "Warm Belgian Fudge Brownies", targetQty: 30, status: "Scheduled", oven: "Deck 2 (180°C)" },
          { name: "Parisian Almond Macarons", targetQty: 40, status: "Chilled Resting", oven: "Display Only" }
        ]
      },
      {
        slot: "06:00 PM – 08:00 PM",
        label: "Evening Celebration Rush & Signature Cakes",
        items: [
          { name: "Belgian Chocolate Truffle Gateaux", targetQty: 18, status: "Decorating & Glazing", oven: "Cold Station" },
          { name: "Red Velvet Cream Cheese Cakes", targetQty: 12, status: "Chilled Ready", oven: "Cold Station" },
          { name: "Lotus Biscoff Cheesecakes", targetQty: 15, status: "Chilled Ready", oven: "Cold Station" }
        ]
      }
    ],
    morningPrepChecklist: [
      { task: "Deck Oven Thermal Calibration (230°C Hearth)", status: "verified", icon: "🔥", time: "05:45 AM" },
      { task: "Walk-in Blast Chiller Inspection (3.8°C / 82% RH)", status: "verified", icon: "❄️", time: "06:00 AM" },
      { task: "FEFO Batch Shelf-Life Surveillance & Auto-Markdown", status: "verified", icon: "⏳", time: "06:15 AM" },
      { task: "Heavy Cream & Mascarpone Reorder Verification", status: "warning", icon: "⚠️", time: "06:30 AM", note: "Stock below 4kg threshold" }
    ],
    aiWastageMitigationAdvice: [
      {
        branchName: "Velachery Express Hub",
        advice: "Danish pastry surplus of 18% observed post 14:00 over 3 consecutive weekdays. Recommend trimming morning Danish batch by 6 units and bundling with 4 PM Filter Coffee combo.",
        impact: "Saves ~₹1,200/day in spoilage"
      },
      {
        branchName: "Flagship T. Nagar Hub",
        advice: "Belgian Truffle Cakes have 100% sellout rate before 19:30 on Fridays & Saturdays. Recommend scaling 16:00 finishing batch by +4 units to capture unmet weekend celebration demand.",
        impact: "Projected +₹3,400 weekend revenue"
      }
    ]
  };

  res.json({
    selectedBranchId: branchId || "ALL",
    selectedBranch: selectedBranch || null,
    kpis: {
      todaySales: totalTodaySales,
      todayProfit: parseFloat(estimatedTodayProfit.toFixed(2)),
      profitMarginPercent: "52%",
      monthlySales: totalMonthlySales,
      monthlyTarget: totalMonthlyTarget,
      targetProgressPercent: ((totalMonthlySales / totalMonthlyTarget) * 100).toFixed(1) + "%",
      activeOrdersCount: selectedBranch ? 14 : bakeryOrders.filter((o) => o.status !== "completed").length + 18,
      lowStockIngredientsCount: lowStockCount,
      batchesExpiringTodayCount: expiringTodayBatches.length,
      todayWastageCost: todayWastageCost,
      fefoComplianceScore: selectedBranch ? `${selectedBranch.fefoComplianceScore}%` : "98.2%",
      satisfactionRating: selectedBranch ? selectedBranch.calculatedRating : 4.88
    },
    peakHours: [
      { hour: "07:00 - 09:00", sales: Math.round(totalTodaySales * 0.14), orders: 85, label: "Breakfast Commute" },
      { hour: "09:00 - 12:00", sales: Math.round(totalTodaySales * 0.10), orders: 42, label: "Morning Breads" },
      { hour: "12:00 - 15:00", sales: Math.round(totalTodaySales * 0.18), orders: 74, label: "Lunch & Sandwiches" },
      { hour: "15:00 - 17:00", sales: Math.round(totalTodaySales * 0.11), orders: 51, label: "Afternoon Teatime" },
      { hour: "17:00 - 20:00", sales: Math.round(totalTodaySales * 0.31), orders: 140, label: "Evening Rush (Peak)" },
      { hour: "20:00 - 22:30", sales: Math.round(totalTodaySales * 0.16), orders: 66, label: "Dinner & Desserts" }
    ],
    categoryBreakdown: [
      { category: "Cakes & Celebrations", percentage: 38, sales: Math.round(totalTodaySales * 0.38) },
      { category: "Pastries & Viennoiserie", percentage: 24, sales: Math.round(totalTodaySales * 0.24) },
      { category: "Artisan Bread", percentage: 16, sales: Math.round(totalTodaySales * 0.16) },
      { category: "Savory & Sandwiches", percentage: 12, sales: Math.round(totalTodaySales * 0.12) },
      { category: "Beverages & Coffee", percentage: 10, sales: Math.round(totalTodaySales * 0.10) }
    ],
    branches: branchList,
    operationalRecommendations
  });
});

// Profit & Loss Analysis by Product
router.get("/profit-loss", (req, res) => {
  const marginAnalysis = bakeryProducts.slice(0, 10).map((product) => {
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

// Branch Performance Comparison Benchmarking
router.get("/branch-comparison", (req, res) => {
  res.json(getBranchStats());
});

// Full Executive P&L and Multi-Branch Summary Export
router.get(["/export-summary", "/export/pl-report", "/pl-report"], (req, res) => {
  const branchList = getBranchStats();
  const totalSales = branchList.reduce((sum, b) => sum + b.todaySales, 0);
  const totalMonthlySales = branchList.reduce((sum, b) => sum + b.currentMonthSales, 0);

  const report = {
    reportTitle: "BakeSphere Executive Multi-Branch Intelligence & P&L Statement",
    generatedAt: new Date().toISOString(),
    currency: "INR",
    organization: "BakeSphere Patisserie Pvt. Ltd.",
    hq: "Chennai, Tamil Nadu, India",
    totalBranches: branchList.length,
    consolidatedMetrics: {
      todayGrossSales: totalSales,
      todayEstimatedNetProfit: Math.round(totalSales * 0.52),
      todayEstimatedCOGS: Math.round(totalSales * 0.48),
      monthlyConsolidatedRevenue: totalMonthlySales,
      averageFefoCompliance: "98.2%",
      averageCustomerSatisfaction: 4.88
    },
    branchBreakdown: branchList.map((b) => ({
      branchId: b.id,
      name: b.name,
      locality: b.locality,
      manager: b.manager,
      todaySales: b.todaySales,
      monthlyTarget: b.monthlyTarget,
      currentMonthSales: b.currentMonthSales,
      targetProgress: b.targetProgressPercent,
      rating: b.calculatedRating,
      reviewsCount: b.reviewsCount,
      fefoCompliance: `${b.fefoComplianceScore}%`,
      wastageRate: `${b.wastageRatePercent}%`,
      award: b.awardBadge
    }))
  };

  res.json(report);
});

export default router;

