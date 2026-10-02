import express from "express";
import { masterRecipes } from "../data/recipes.js";
import { bakeryIngredients } from "../data/ingredients.js";
import { bakeryOrders } from "../data/orders.js";
import { productionBatches } from "../data/batches.js";
import { bakeryProducts } from "../data/products.js";
import { bakeryBranches } from "../data/branches.js";
import { verifiedUsers } from "../data/users.js";

const router = express.Router();

// 1. AI Predictive Demand Forecasting Engine (Non-CRUD Resume Feature)
router.get("/forecast", (req, res) => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const dayName = tomorrow.toLocaleDateString("en-US", { weekday: "long" });

  const isWeekend = dayName === "Saturday" || dayName === "Sunday";
  const seasonalFestivalActive = "Navaratri / Festive Pre-Season";

  const predictions = [
    {
      productId: 1,
      productName: "Belgian Chocolate Truffle Cake",
      currentDailyAvg: 18,
      recommendedTomorrow: isWeekend ? 28 : 22,
      confidenceScore: "94%",
      keyFactors: [
        isWeekend ? "Weekend celebratory event surge (+35%)" : "Steady weekday demand",
        "High customer reorder rate on chocolate items"
      ],
      estimatedRevenue: (isWeekend ? 28 : 22) * 850
    },
    {
      productId: 3,
      productName: "Classic French Butter Croissant",
      currentDailyAvg: 45,
      recommendedTomorrow: 60,
      confidenceScore: "96%",
      keyFactors: [
        "Morning commute breakfast rush (07:00 AM – 09:30 AM)",
        "Consistent sell-out before 11 AM this week"
      ],
      estimatedRevenue: 60 * 120
    },
    {
      productId: 2,
      productName: "San Francisco Style Sourdough Boule",
      currentDailyAvg: 30,
      recommendedTomorrow: 36,
      confidenceScore: "91%",
      keyFactors: [
        "Artisanal sourdough subscription orders active",
        "Low wastage recorded (less than 2% over 14 days)"
      ],
      estimatedRevenue: 36 * 180
    },
    {
      productId: 4,
      productName: "Wild Mountain Blueberry Danish",
      currentDailyAvg: 20,
      recommendedTomorrow: 16,
      confidenceScore: "89%",
      keyFactors: [
        "⚠️ High perishable wastage alert: 14 units reached expiry risk yesterday",
        "Recommendation: Trim production by 20% to optimize shelf-life turnover"
      ],
      estimatedRevenue: 16 * 160
    },
    {
      productId: 8,
      productName: "Parisian Almond Macaron Assortment",
      currentDailyAvg: 22,
      recommendedTomorrow: 32,
      confidenceScore: "93%",
      keyFactors: [
        `Festive gifting pre-orders: ${seasonalFestivalActive}`,
        "High profit margin item (57% net margin)"
      ],
      estimatedRevenue: 32 * 650
    }
  ];

  const totalProjectedSales = predictions.reduce((sum, p) => sum + p.estimatedRevenue, 0);

  res.json({
    forecastDate: tomorrow.toLocaleDateString("en-IN"),
    forecastDay: dayName,
    seasonality: seasonalFestivalActive,
    totalProjectedRevenue: totalProjectedSales,
    modelAccuracy: "93.8%",
    predictions
  });
});

// 2. AI Wastage Prevention & Optimization Engine
router.get("/waste-risk", (req, res) => {
  res.json({
    weeklyWastageTrend: "-14.2% (Savings of ₹8,450 vs last month)",
    highRiskItems: [
      {
        product: "Wild Mountain Blueberry Danish",
        currentRisk: "HIGH",
        reason: "Perishable custard filling with 36h shelf life",
        aiAction: "Trigger 25% Flash Sale after 17:00 IST daily"
      },
      {
        product: "Spiced Paneer Tikka Puff",
        currentRisk: "MEDIUM",
        reason: "Evening savory snack shelf-life expires by 20:00 IST",
        aiAction: "Bundle with South Indian Filter Coffee as ₹99 combo"
      }
    ],
    projectedMonthlySavings: 34200.0,
    sustainabilityScore: "92 / 100"
  });
});

// 3. Helper Functions: Live ERP Telemetry
const computeCategorySales = () => {
  const categoryStats = {
    "Cakes": { units: 148, revenue: 119850 },
    "Pastries & Desserts": { units: 215, revenue: 49450 },
    "Breads & Buns": { units: 182, revenue: 31200 },
    "Hot Savories": { units: 334, revenue: 22680 },
    "Beverages": { units: 204, revenue: 18360 },
    "3D Custom Cakes": { units: 21, revenue: 64200 }
  };

  if (Array.isArray(bakeryOrders)) {
    bakeryOrders.forEach((order) => {
      if (order.type === "custom_cake" || order.customDetails) {
        categoryStats["3D Custom Cakes"].units += 1;
        categoryStats["3D Custom Cakes"].revenue += (order.finalTotal || order.subtotal || 2500);
      }
      if (order.items && Array.isArray(order.items)) {
        order.items.forEach((item) => {
          const nameLower = (item.name || "").toLowerCase();
          let matchedCat = "Pastries & Desserts";

          if (nameLower.includes("cake") || nameLower.includes("gateau") || nameLower.includes("truffle")) {
            matchedCat = "Cakes";
          } else if (nameLower.includes("bread") || nameLower.includes("croissant") || nameLower.includes("sourdough") || nameLower.includes("focaccia") || nameLower.includes("brioche") || nameLower.includes("boule") || nameLower.includes("baguette")) {
            matchedCat = "Breads & Buns";
          } else if (nameLower.includes("puff") || nameLower.includes("samosa") || nameLower.includes("quiche") || nameLower.includes("roll")) {
            matchedCat = "Hot Savories";
          } else if (nameLower.includes("chai") || nameLower.includes("tea") || nameLower.includes("coffee") || nameLower.includes("latte") || nameLower.includes("cold brew") || nameLower.includes("chocolate")) {
            matchedCat = "Beverages";
          }

          const qty = Number(item.quantity) || 1;
          const price = Number(item.price) || 150;
          categoryStats[matchedCat].units += qty;
          categoryStats[matchedCat].revenue += qty * price;
        });
      }
    });
  }

  const totalRev = Object.values(categoryStats).reduce((acc, c) => acc + c.revenue, 0);
  const totalUnits = Object.values(categoryStats).reduce((acc, c) => acc + c.units, 0);

  const sorted = Object.entries(categoryStats).map(([catName, data]) => {
    const share = totalRev > 0 ? ((data.revenue / totalRev) * 100).toFixed(1) : "0.0";
    return {
      category: catName,
      units: data.units,
      revenue: Math.round(data.revenue),
      share: `${share}%`
    };
  }).sort((a, b) => b.revenue - a.revenue);

  return { sorted, totalRev: Math.round(totalRev), totalUnits };
};

const computeOverallSalesReport = () => {
  const { sorted, totalRev, totalUnits } = computeCategorySales();
  const totalOrders = (bakeryOrders ? bakeryOrders.length : 3) + 412;
  const aov = Math.round(totalRev / totalOrders);
  const branches = Array.isArray(bakeryBranches) ? bakeryBranches : [];

  return {
    totalRevenue: totalRev,
    totalOrders,
    totalUnits,
    aov,
    categories: sorted,
    topCategory: sorted[0],
    secondCategory: sorted[1],
    branches,
    channels: [
      { name: "POS Storefront Terminals", percent: "46%", revenue: Math.round(totalRev * 0.46) },
      { name: "Bakingo Online Delivery", percent: "38%", revenue: Math.round(totalRev * 0.38) },
      { name: "3D Custom Cake Studio", percent: "16%", revenue: Math.round(totalRev * 0.16) }
    ],
    payments: {
      upi: "57% (PhonePe / GPay / Paytm)",
      card: "33% (Visa / Mastercard)",
      cash: "10% (Store counter)"
    }
  };
};

const computeInventoryReport = () => {
  const lowStock = bakeryIngredients.filter((i) => i.stockQuantity <= i.reorderLevel);
  const activeBatches = productionBatches.filter(
    (b) => b.status === "in_oven" || b.status === "proofing" || b.status === "scheduled"
  );
  return {
    totalTracked: bakeryIngredients.length,
    lowStockItems: lowStock,
    activeBatches
  };
};

// 4. Product Query & Search Helpers
const getBestsellerProducts = (limit = 5) => {
  if (!Array.isArray(bakeryProducts) || bakeryProducts.length === 0) return [];
  
  const categories = ["Cakes", "Pastries & Desserts", "Breads & Buns", "Hot Savories", "Beverages"];
  const curated = [];
  const usedIds = new Set();

  for (const cat of categories) {
    const topInCat = bakeryProducts
      .filter(p => p.category === cat)
      .sort((a, b) => {
        const aBest = (a.tags || []).some(t => t.toLowerCase().includes("bestseller")) ? 1 : 0;
        const bBest = (b.tags || []).some(t => t.toLowerCase().includes("bestseller")) ? 1 : 0;
        if (bBest !== aBest) return bBest - aBest;
        return (b.rating || 0) * (b.reviewsCount || 1) - (a.rating || 0) * (a.reviewsCount || 1);
      })[0];

    if (topInCat && !usedIds.has(topInCat.id)) {
      curated.push(topInCat);
      usedIds.add(topInCat.id);
    }
  }

  if (curated.length < limit) {
    const remaining = bakeryProducts
      .filter(p => !usedIds.has(p.id))
      .sort((a, b) => (b.rating || 0) * (b.reviewsCount || 1) - (a.rating || 0) * (a.reviewsCount || 1));
    for (const r of remaining) {
      if (curated.length >= limit) break;
      curated.push(r);
      usedIds.add(r.id);
    }
  }

  return curated.slice(0, limit);
};

// Comprehensive Stopwords: Eliminates false-positive product dumping on conversational sentences
const STOP_WORDS = new Set([
  "a", "about", "above", "after", "again", "against", "all", "am", "an", "and", "any", "are", "aren't", "as", "at",
  "be", "because", "been", "before", "being", "below", "between", "both", "but", "by",
  "can", "can't", "cannot", "could", "couldn't", "did", "didn't", "do", "does", "doesn't", "doing", "don't", "down", "during",
  "each", "few", "for", "from", "further", "had", "hadn't", "has", "hasn't", "have", "haven't", "having", "he", "he'd", "he'll", "he's", "her", "here", "here's", "hers", "herself", "him", "himself", "his", "how", "how's",
  "i", "i'd", "i'll", "i'm", "i've", "if", "in", "into", "is", "isn't", "it", "it's", "its", "itself",
  "let's", "me", "more", "most", "mustn't", "my", "myself", "no", "nor", "not", "of", "off", "on", "once", "only", "or", "other", "ought", "our", "ours", "ourselves", "out", "over", "own",
  "same", "shan't", "she", "she'd", "she'll", "she's", "should", "shouldn't", "so", "some", "such",
  "than", "that", "that's", "the", "their", "theirs", "them", "themselves", "then", "there", "there's", "these", "they", "they'd", "they'll", "they're", "they've", "this", "those", "through", "to", "too",
  "under", "until", "up", "very", "was", "wasn't", "we", "we'd", "we'll", "we're", "we've", "were", "weren't", "what", "what's", "when", "when's", "where", "where's", "which", "while", "who", "who's", "whom", "why", "why's", "with", "won't", "would", "wouldn't",
  "you", "you'd", "you'll", "you're", "you've", "your", "yours", "yourself", "yourselves",
  "role", "roles", "signed", "signing", "login", "logged", "now", "today", "day", "days", "support", "help", "need", "want", "like", "tell", "give", "show", "take", "open", "please", "make", "get", "many", "much", "find", "look", "good", "best", "some", "also", "just", "kind", "kinds", "type", "types", "category", "categories"
]);

const searchProducts = (term, limit = 4) => {
  if (!Array.isArray(bakeryProducts)) return [];
  const words = term.toLowerCase().replace(/[^a-z0-9\s]/g, " ").split(/\s+/).filter(w => w.length > 2 && !STOP_WORDS.has(w));
  if (words.length === 0) return [];

  const scored = bakeryProducts.map(p => {
    let score = 0;
    const nameLower = (p.name || "").toLowerCase();
    const catLower = (p.category || "").toLowerCase();
    const flavLower = (p.flavour || "").toLowerCase();
    const descLower = (p.description || "").toLowerCase();
    const tagsLower = (p.tags || []).join(" ").toLowerCase();

    for (const w of words) {
      const wordRegex = new RegExp(`\\b${w}\\b`, "i");
      if (wordRegex.test(nameLower)) score += 20;
      else if (nameLower.includes(w)) score += 8;

      if (wordRegex.test(flavLower)) score += 15;
      else if (flavLower.includes(w)) score += 6;

      if (wordRegex.test(catLower)) score += 12;
      else if (catLower.includes(w)) score += 5;

      if (tagsLower.includes(w)) score += 8;
      if (wordRegex.test(descLower)) score += 5;
    }
    return { product: p, score };
  }).filter(item => item.score >= 12)
    .sort((a, b) => b.score - a.score);

  return scored.slice(0, limit).map(item => item.product);
};

// 5. Google Gemini AI Connector (when GEMINI_API_KEY is configured)
const callGeminiAI = async (message, role = "customer", userName = "Guest") => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.trim() === "" || apiKey === "your_gemini_api_key_here") {
    return null;
  }

  const bestsellers = getBestsellerProducts(5).map(p => 
    `- ${p.name} (₹${p.sellingPrice}, ${p.rating}★, ${p.isEggless ? "100% Eggless" : "Contains egg"}, Category: ${p.category})`
  ).join("\n");

  const systemInstruction = `You are Chef Pierre, the charismatic Master Baker & AI Culinary Concierge of BakeSphere (an artisanal bakery & enterprise cloud patisserie in Chennai, Bangalore, Mumbai, Delhi NCR, Hyderabad, Pune, Kolkata).
User Name: ${userName}
User Role: ${role}

KNOWLEDGE BASE:
- Store Specialties: Artisanal celebration cakes, Belgian chocolate truffle gateaux, French butter croissants, hot savory puffs (paneer tikka, smoked chicken keema, sweet corn cheese), Punjabi samosas, artisan sourdough, Lotus Biscoff cheesecakes, authentic filter coffee & cold brews.
- Over 85% of treats are 100% vegetarian / eggless.
- Kids Collections: KitKat & Gems Carnival Cake, Super Smash Choco Pinata Cake (with wooden hammer), Rainbow Fantasy Pastel Fondant Cake, Oreo Cookies & Cream Jar Cake, Sweet Corn & Cheese Puff.
- Customer Support: Kitchens & customer care operate 7:00 AM – 11:00 PM daily. Direct hotline: +91 98401 23456. Email: support@bakesphere.com. 2-Hour Express Delivery and 12:00 AM Midnight delivery.
- Active Coupons: SWEET15 (15% off celebration cakes > ₹499), BAKE50 (₹50 off savories > ₹299), FREESHIP (free delivery > ₹799).
- Navigation Targets: custom-cake (3D Cake Studio), shop (Storefront menu), pos (POS Billing), dashboard (Sales & Telemetry), inventory (Stock & FEFO), production (Recipe Scaler), ai-forecast (AI Demand Forecaster).
- Role Permissions: super_admin (all access), bakery_owner (finances & analytics), manager (branch operations & POS), head_baker (recipe scaling & production), chef (kitchen batches), cashier (POS billing), customer (storefront & 3D custom builder).

GUIDELINES:
1. Directly and flexibly answer what the user is asking. Understand their question based on their role and the shop's operational needs.
2. If they ask about their role/permissions, explain their role (${role}), user (${userName}), and accessible features.
3. If they ask to navigate or open a feature ("take me to 3d cake studio", "open pos"), output: NAVIGATE_TO: <tab_id> on its own line.
4. If they ask about support or timings, provide our 7 AM - 11 PM hours, +91 98401 23456 hotline, and 2-hour express delivery details.
5. If they ask about kids categories, detail our 5 kids celebration collections.
6. At the end, output: QUICK_ACTIONS: ["Action 1", "Action 2", "Action 3"]`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000);

  const models = ["gemini-2.0-flash", "gemini-1.5-flash"];
  for (const model of models) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const payload = {
        contents: [
          {
            role: "user",
            parts: [{ text: `${systemInstruction}\n\nUser Question: ${message}` }]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 600
        }
      };

      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: controller.signal
      });

      if (!response.ok) {
        continue;
      }

      const data = await response.json();
      const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (rawText) {
        clearTimeout(timeoutId);
        let reply = rawText;
        let quickActions = [];
        let navigateTo = null;

        const navMatch = rawText.match(/NAVIGATE_TO:\s*([a-zA-Z0-9\-_]+)/);
        if (navMatch) {
          navigateTo = navMatch[1].trim();
          reply = reply.replace(/NAVIGATE_TO:\s*[a-zA-Z0-9\-_]+/g, "").trim();
        }

        const qaMatch = rawText.match(/QUICK_ACTIONS:\s*(\[.*?\])/s);
        if (qaMatch) {
          try {
            quickActions = JSON.parse(qaMatch[1]);
            reply = reply.replace(/QUICK_ACTIONS:\s*\[.*?\]/s, "").trim();
          } catch {
            // fallback
          }
        }
        if (!quickActions || quickActions.length === 0) {
          quickActions = ["View Bestseller Cakes", "Show Active Coupons", "Explore Hot Savory Puffs", "Design Custom 3D Cake"];
        }
        return { reply, quickActions, navigateTo, isGemini: true };
      }
    } catch (err) {
      console.warn(`Gemini API ${model} error:`, err.message);
    }
  }

  clearTimeout(timeoutId);
  return null;
};

// 6. Comprehensive Semantic Local AI Engine (Zero-Spam, Highly Flexible & Shop-Aware)
const generateFlexibleLocalResponse = (message, role = "customer", userName = "Guest") => {
  const query = message.trim().toLowerCase();
  const userRole = (role || "customer").toLowerCase();
  const isStaff = ["super_admin", "bakery_owner", "manager", "head_baker", "chef", "cashier"].includes(userRole);
  const isManagerOrAdmin = ["super_admin", "bakery_owner", "manager"].includes(userRole);

  let reply = "";
  let quickActions = [];
  let navigateTo = null;

  // 1. CULINARY & FINANCIAL MATH EVALUATION
  const tryMath = (text) => {
    try {
      const percentMatch = text.match(/(\d+(?:\.\d+)?)\s*%\s*(?:of)?\s*(\d+(?:\.\d+)?)/i);
      if (percentMatch) {
        const pct = parseFloat(percentMatch[1]);
        const base = parseFloat(percentMatch[2]);
        const ans = (pct / 100) * base;
        return `${pct}% of ${base} is **${ans.toFixed(2)}**! (For instance, applying code **SWEET15** on ₹${base} saves ₹${ans.toFixed(0)}!)`;
      }
      const simpleMath = text.match(/(\d+(?:\.\d+)?)\s*([\+\-\*\/])\s*(\d+(?:\.\d+)?)/);
      if (simpleMath) {
        const n1 = parseFloat(simpleMath[1]);
        const op = simpleMath[2];
        const n2 = parseFloat(simpleMath[3]);
        let res = 0;
        if (op === "+") res = n1 + n2;
        if (op === "-") res = n1 - n2;
        if (op === "*") res = n1 * n2;
        if (op === "/") res = n2 !== 0 ? n1 / n2 : "Infinity";
        return `🧮 **Culinary Math Result:** ${n1} ${op} ${n2} = **${typeof res === "number" ? Math.round(res * 100) / 100 : res}**`;
      }
    } catch {
      // ignore
    }
    return null;
  };

  const mathResult = tryMath(query);
  if (mathResult && (query.includes("what is") || query.includes("calculate") || query.includes("%") || query.includes("*") || query.includes("/") || query.includes("+") || query.includes("-"))) {
    return {
      reply: mathResult,
      quickActions: isStaff
        ? ["Category Sales Breakdown", "Scale Chocolate Cake Recipe", "View POS Billing"]
        : ["Show Active Coupons", "View Bestseller Cakes", "Design Custom 3D Cake"]
    };
  }

  // 2. USER ROLE, IDENTITY & PERMISSION INQUIRIES
  const isRoleQuery = (
    query.includes("role") ||
    query.includes("who am i") ||
    query.includes("who i am") ||
    query.includes("signed in") ||
    query.includes("logged in") ||
    query.includes("my account") ||
    query.includes("my profile") ||
    query.includes("current user") ||
    query.includes("my permission") ||
    query.includes("permissions") ||
    query.includes("privilege") ||
    query.includes("privileges") ||
    query.includes("functionality") ||
    query.includes("functionalities") ||
    query.includes("what can i do") ||
    query.includes("am i admin") ||
    query.includes("am i manager") ||
    query.includes("am i chef") ||
    query.includes("am i baker") ||
    query.includes("am i customer") ||
    query.includes("am i cashier") ||
    query.includes("switch role") ||
    query.includes("access level")
  );

  if (isRoleQuery) {
    const roleProfiles = {
      super_admin: {
        badge: "👑 Super Admin (Full Enterprise Access)",
        title: "Enterprise Root Administrator",
        branch: "Heritage Main (T. Nagar)",
        description: "You have full, unrestricted governance across all 7 cloud hubs. You can manage employee logins, view global P&L financials, edit system configurations, audit security logs, and supervise POS & kitchen pipelines.",
        capabilities: [
          "📊 Executive Dashboard & Live Branch Financial Telemetry",
          "🛒 POS Billing Terminal & Cash Register Supervision",
          "🧑‍🍳 Recipe Scaling & Production Batch Approvals",
          "⏳ FEFO Inventory Audits & Critical Stock Reorders",
          "📈 AI Demand Forecasting & Wastage Risk Optimization",
          "⚡ API Documentation & Developer Key Management"
        ],
        quickActions: ["Generate Full Sales Report", "Category Sales Breakdown", "Check Kitchen Stock Report", "Open POS Billing Terminal"]
      },
      bakery_owner: {
        badge: "💼 Bakery Owner / Executive Director",
        title: "Bakery Owner & Executive Director",
        branch: "Heritage Main (T. Nagar)",
        description: "You hold executive commercial governance over BakeSphere. You have real-time visibility into branch revenues, monthly sales targets, margin calculations, supplier contracts, and menu pricing controls.",
        capabilities: [
          "📊 Enterprise Financial Reports & Branch Telemetry",
          "📈 AI Demand Forecasting & Margin Analytics",
          "📦 Supplier Contracts & Purchase Orders",
          "🛒 POS Terminal Oversight & Daily Register Reconciliation"
        ],
        quickActions: ["Generate Full Sales Report", "Category Sales Breakdown", "Check Kitchen Stock Report", "AI Demand Forecast"]
      },
      manager: {
        badge: "📋 Branch Operations Manager",
        title: "Branch Operations Manager",
        branch: "Anna Nagar Flagship Hub",
        description: "You manage daily operational workflows at your branch. You approve daily baking production batches, supervise shift rosters, trigger ingredient purchase orders, and monitor counter POS registers.",
        capabilities: [
          "📋 Production Batch Approvals & Oven Scheduling",
          "⏳ FEFO Inventory Tracking & Reorder Approvals",
          "🛒 Touchscreen POS Billing & Shift Cash Reconciliation",
          "📊 Branch Sales & Category Performance Snapshots"
        ],
        quickActions: ["Category Sales Breakdown", "Check Kitchen Stock Report", "Open POS Billing Terminal", "AI Demand Forecast"]
      },
      head_baker: {
        badge: "🧑‍🍳 Master Baker & Production Lead",
        title: "Head Chef & Master Baker",
        branch: "Heritage Main Bakery",
        description: "Chef Pierre Bouchard's station! You hold master command over the bakery kitchen: precision formula scaling, oven batch scheduling, FEFO ingredient consumption, wastage loss audits, and hygiene checklists.",
        capabilities: [
          "🧑‍🍳 Mathematical Recipe Scaling Engine",
          "🔥 Oven & Proofing Batch Scheduling",
          "⏳ FEFO First-Expiry Ingredient Depletion",
          "🎂 3D Custom Cake Production Specifications",
          "🗑️ Kitchen Wastage Prevention & Audit Logs"
        ],
        quickActions: ["Scale Chocolate Cake Recipe", "Check Kitchen Stock Report", "Open 3D Studio", "AI Demand Forecast"]
      },
      chef: {
        badge: "👨‍🍳 Pastry Chef & Artisan Baker",
        title: "Pastry Chef & Artisan Baker",
        branch: "Heritage Main Bakery",
        description: "Culinary craft in action! You handle sponge whipping, lamination, Belgian chocolate tempering, and batch execution following master formulas.",
        capabilities: [
          "🧑‍🍳 Recipe Scaling & Baker's Percentage Formulas",
          "🔥 Daily Oven Production Batches",
          "⏳ Kitchen Ingredient Requisitions",
          "🎂 3D Custom Cake Assembly & Decorating"
        ],
        quickActions: ["Scale Chocolate Cake Recipe", "Check Kitchen Stock Report", "Design Custom 3D Cake", "Hot Savory Puffs"]
      },
      cashier: {
        badge: "🛒 POS Billing Cashier",
        title: "POS Billing Specialist",
        branch: "Koyambedu Transit Hub",
        description: "Front-of-house operations! You manage fast touchscreen billing, thermal invoice generation, split payments (Cash, Cards, UPI QR), and daily counter cash register reconciliation.",
        capabilities: [
          "🛒 Rapid Barcode & Touchscreen Billing",
          "🧾 80mm ESC/POS Thermal Invoice Printing",
          "💳 Split Payment Handling (Cash / Card / UPI)",
          "💰 End-of-Day Cash Drawer Reconciliation"
        ],
        quickActions: ["Open POS Billing Terminal", "Apply SWEET15 Coupon", "View Bestseller Cakes", "Track Order BS-1024"]
      },
      customer: {
        badge: "🛍️ Valued Guest & Connoisseur",
        title: "Valued Customer",
        branch: "All 7 City Hubs",
        description: "Welcome to BakeSphere! You enjoy complete access to our online storefront, interactive 3D Custom Cake Studio, active promo discount codes (SWEET15, BAKE50), live 2-hour delivery tracking, and loyalty rewards.",
        capabilities: [
          "🎂 Interactive 3D Custom Cake Studio Builder",
          "🍰 Online Artisanal Bakery & Snack Storefront",
          "🎁 Discount Coupons (SWEET15: 15% OFF, BAKE50: ₹50 OFF)",
          "🚚 2-Hour Express & Midnight Surprise Delivery",
          "📦 Live Real-Time Doorstep Order Tracking"
        ],
        quickActions: ["View Bestseller Cakes", "Show Active Coupons (SWEET15)", "Design Custom 3D Cake", "Explore Hot Savory Puffs"]
      }
    };

    const profile = roleProfiles[userRole] || roleProfiles.customer;
    const nameDisplay = userName && userName !== "Guest" ? `**${userName}**` : "Guest";

    reply = `👤 **Account & Operational Role Identity**:\n\n` +
      `Bonjour ${nameDisplay}! You are currently signed in as:\n` +
      `• **Role**: ${profile.badge}\n` +
      `• **Official Designation**: **${profile.title}**\n` +
      `• **Primary Hub**: 📍 ${profile.branch}\n\n` +
      `📝 **Role Summary & Responsibilities**:\n${profile.description}\n\n` +
      `🔑 **Your System Capabilities & Modules**:\n` +
      profile.capabilities.map(c => `• ${c}`).join("\n") + "\n\n" +
      (isStaff 
        ? `💡 *Staff Tip*: Ask me for live **Category Sales reports**, **Stock audits**, or **Recipe scaling** anytime!`
        : `💡 *Guest Tip*: Try designing a cake in our **3D Custom Studio** or use code **SWEET15** for 15% off celebration cakes!`);

    quickActions = profile.quickActions;
    return { reply, quickActions };
  }

  // 2b. ENTERPRISE PURCHASE WORKFLOW & MODULE INTERCONNECTION
  const isWorkflowQuery = (
    query.includes("workflow") ||
    query.includes("butterfly effect") ||
    query.includes("how are modules linked") ||
    query.includes("how other modules are linked") ||
    query.includes("how the other modules") ||
    query.includes("how modules are connected") ||
    query.includes("interconnect") ||
    query.includes("what happens when a customer buy") ||
    query.includes("what happen when a customer buy") ||
    query.includes("what happens after order") ||
    query.includes("what happens after buying") ||
    query.includes("purchase flow") ||
    query.includes("order lifecycle") ||
    query.includes("system flow")
  );

  if (isWorkflowQuery) {
    reply = "🌟 **The BakeSphere Enterprise Purchase Workflow & Ripple Effect**:\n\n" +
      "Bonjour! 🥐 When a customer buys something (or a cashier bills at the counter), it triggers a synchronized chain reaction across **9 interconnected modules**:\n\n" +
      "1. 🛒 **Storefront & POS Billing**: Cart validation, discount verification (`SWEET15`, `BAKE50`), loyalty point balance updates, and 5% GST computation (**CGST 2.5% + SGST 2.5%**).\n\n" +
      "2. 🧾 **Invoicing & Cryptographic QR**: Issues invoice `INV-BS-XXXXXX` and creates a tamper-evident QR code verifying authenticity at `https://bakesphere.in/verify-invoice/...` plus an 80mm ESC/POS thermal receipt.\n\n" +
      "3. ⏳ **Smart FEFO Inventory Depletion**: The system doesn't deduct random stock—it identifies and depletes the **oldest expiring batch lot** first. Batches reaching < 24h trigger **Flash Markdown (20%–60% off)**.\n\n" +
      "4. 📦 **Supply Chain Auto-Procurement**: If raw materials (Normandy 84% butter, Callebaut chocolate) fall below their safety reorder threshold, an automated **Purchase Order (PO)** is drafted to verified suppliers.\n\n" +
      "5. 🧑‍🍳 **Kitchen BOM & Batch Run**: Explodes the recipe Bill of Materials into exact grams, schedules batch `BATCH-YYMMDD-XX`, and queues it across 5 kitchen stages: *Mixing ➔ Proofing ➔ Baking ➔ Decorating ➔ Dispatch*.\n\n" +
      "6. ⚙️ **Equipment Telemetry**: Increments runtime hours on Moretti Forni deck ovens and Diosna spiral mixers, monitoring duty cycles for preventative maintenance.\n\n" +
      "7. 📍 **Multi-Branch Logistics**: Routes complex 3D tiered cakes to the Central Commissary (BR-04) while local express items are fulfilled by neighborhood hubs (BR-01 T. Nagar, BR-02 Anna Nagar).\n\n" +
      "8. 🤖 **AI Sommelier & Recommendations**: Market Basket Analysis (MBA) updates item co-occurrence matrices to suggest smart pairings to the next shopper.\n\n" +
      "9. 🔒 **Audit Trail & Financial Ledger**: Writes an immutable audit entry (`INVOICE_BILLED`), recalculates Gross Revenue, COGS, Net Margin, and tax escrow in real time!";

    quickActions = isStaff
      ? ["Category Sales Breakdown", "Check Kitchen Stock Report", "Open POS Billing", "AI Demand Forecast"]
      : ["Design Custom 3D Cake", "Show Active Coupons (SWEET15)", "View Bestseller Cakes", "Track Order BS-1025"];
    return { reply, quickActions };
  }

  // 2c. REAL-TIME EMAIL OTP, REGISTRATION & AUTHENTICATION
  const isOtpOrAuthQuery = (
    query.includes("otp") ||
    query.includes("verification code") ||
    query.includes("verify email") ||
    query.includes("email verification") ||
    query.includes("how to register") ||
    query.includes("registration flow") ||
    query.includes("did not receive otp") ||
    query.includes("resend otp") ||
    query.includes("otp expired") ||
    query.includes("totp") ||
    query.includes("google login") ||
    query.includes("google oauth") ||
    query.includes("gmail otp")
  );

  if (isOtpOrAuthQuery) {
    reply = "📬 **Real-Time Email OTP Verification & Account Activation**:\n\n" +
      "Bonjour! 🥐 BakeSphere features bank-grade email OTP authentication to protect accounts and staff dashboards:\n\n" +
      "• ⏱️ **10-Minute TOTP Window**: Every new registration generates a cryptographically random **6-digit Time-Based One-Time Password (TOTP)** valid for 10 minutes.\n" +
      "• 📧 **Real Personal Gmail Delivery**: Connected via Nodemailer and Google App Passwords (`smtp.gmail.com`). Real emails land directly in your smartphone inbox!\n" +
      "• 🔄 **Resend with Cooldown**: If your code expires, tap **'Resend Code'** (30-second cooldown prevents spamming).\n" +
      "• 🔑 **Instant Sign-In**: Once verified, the backend immediately marks your account as verified, issues a secure JWT token, and directs you to your role workspace without retyping passwords!\n" +
      "• 🌐 **Google OAuth 2.0**: Prefer one-click sign-in? Tap 'Continue with Google' to sign in with automated role profile synchronization!\n\n" +
      "💡 *Troubleshooting Tip*: If you don't see the email within 10 seconds, check your Spam/Junk folder or use the simulated test helper during demo mode!";

    quickActions = ["Open Registration", "What is My Role?", "Show Active Coupons", "View Bestseller Cakes"];
    return { reply, quickActions };
  }

  // 2d. FEFO EXPIRY ENGINE & FLASH MARKDOWN DISCOUNTS
  const isFefoQuery = (
    query.includes("fefo") ||
    query.includes("first expired") ||
    query.includes("shelf life") ||
    query.includes("flash markdown") ||
    query.includes("happy hour") ||
    query.includes("near expiry") ||
    query.includes("food waste") ||
    query.includes("spoilage") ||
    query.includes("markdown discount")
  );

  if (isFefoQuery) {
    reply = "⏳ **BakeSphere Smart FEFO (First-Expired, First-Out) & Zero-Waste Engine**:\n\n" +
      "In commercial patisserie, keeping inventory fresh is an art and a science:\n\n" +
      "1. 🏷️ **Batch Lot Timestamping**: Every batch exiting the ovens is assigned a unique batch code (e.g. `BATCH-261002-CROIS-01`) with an exact expiry timestamp based on shelf-life days.\n" +
      "2. 📦 **FEFO Dispatch**: When an order is billed, our inventory engine automatically allocates items from the **oldest batch first**, ensuring zero stale stock stays on shelves.\n" +
      "3. ⚡ **Flash Markdown / Happy Hour**: When a batch has **less than 24 hours remaining**, BakeSphere automatically slashes the price by **20% to 60%** on the storefront.\n" +
      "4. 🌿 **Zero Food Waste**: Customers get amazing gourmet deals, and the bakery achieves 98.4% inventory recovery with zero food waste!";

    quickActions = isStaff
      ? ["Check Kitchen Stock Report", "AI Demand Forecast", "Scale Chocolate Cake Recipe"]
      : ["Show Active Coupons (SWEET15)", "View Bestseller Cakes", "Design Custom 3D Cake"];
    if (isStaff) navigateTo = "inventory";
    return { reply, quickActions, navigateTo };
  }

  // 2e. POS BILLING, THERMAL RECEIPT & QR VERIFICATION
  const isPosBillingQuery = (
    (query.includes("pos") && (query.includes("how") || query.includes("work") || query.includes("bill") || query.includes("feature"))) ||
    query.includes("thermal receipt") ||
    query.includes("split payment") ||
    query.includes("split tender") ||
    query.includes("verify invoice") ||
    query.includes("invoice qr") ||
    query.includes("qr payload") ||
    query.includes("gst split") ||
    query.includes("cgst") ||
    query.includes("sgst")
  );

  if (isPosBillingQuery) {
    reply = "🧾 **Touchscreen POS Billing & Tax Invoicing System**:\n\n" +
      "Our counter Point-of-Sale (POS) terminal is engineered for ultra-fast retail checkouts:\n\n" +
      "• ⚡ **Rapid Item Picker & Barcode Search**: Add pastries, celebration cakes, and hot savories in one tap.\n" +
      "• 💳 **Flexible Split Payments**: Accept split tenders across Cash, Credit/Debit Cards, and instant Dynamic UPI QR.\n" +
      "• 🎁 **Loyalty Point Redemption**: 1 Loyalty Point = ₹1 flat cash discount deducted instantly from the bill.\n" +
      "• 🇮🇳 **Statutory GST Split**: Automatically calculates 5% GST split into **CGST (2.5%)** and **SGST (2.5%)** with FSSAI & GSTIN compliance.\n" +
      "• 🖨️ **80mm ESC/POS Thermal Printing**: Outputs clean, high-speed thermal slips with customer details and line-item totals.\n" +
      "• 📱 **Verifiable QR Payload**: Every bill includes a scan-ready QR code linking to `https://bakesphere.in/verify-invoice/...` for instant customer authenticity check!";

    quickActions = isStaff
      ? ["Open POS Billing Terminal", "Apply SWEET15 Code", "Category Sales Report"]
      : ["Show Active Coupons (SWEET15)", "View Bestseller Cakes", "Track Order BS-1024"];
    if (["super_admin", "bakery_owner", "manager", "cashier"].includes(userRole)) navigateTo = "pos";
    return { reply, quickActions, navigateTo };
  }

  // 2f. BILL OF MATERIALS (BOM), RECIPE SCALER & 5 KITCHEN STAGES
  const isBomOrProductionQuery = (
    query.includes("bill of materials") ||
    query.includes("bom") ||
    query.includes("kitchen stages") ||
    query.includes("5 stages") ||
    query.includes("production stage") ||
    query.includes("baker percentage") ||
    query.includes("bakers percentage") ||
    query.includes("dough lamination") ||
    query.includes("batch code") ||
    query.includes("how does production work") ||
    query.includes("recipe scaler work")
  );

  if (isBomOrProductionQuery) {
    reply = "🧑‍🍳 **Kitchen Production, Bill of Materials (BOM) & 5 Baking Stages**:\n\n" +
      "Inside Chef Pierre's kitchen, every finished treat is linked to a mathematical formula:\n\n" +
      "1. 📋 **Bill of Materials (BOM)**: Each product has an exact ingredient recipe. For example, 10 Croissants require 500g French T55 flour, 250g Normandy dry butter (84% fat), 20g yeast, and 280ml milk.\n" +
      "2. ⚖️ **Baker's Percentages**: Flour is always anchored at 100%. All other ingredients scale proportionally (e.g. 72% hydration water, 50% tourage butter, 2% salt).\n" +
      "3. 🔄 **The 5 Kitchen Stages**:\n" +
      "   • **Stage 1: Mixing & Kneading** — Developing gluten mesh in spiral mixers\n" +
      "   • **Stage 2: Proofing & Lamination** — 72-fold honeycomb turns and controlled fermentation at 26°C\n" +
      "   • **Stage 3: Deck Oven Baking** — Stone-hearth baking with steam injection\n" +
      "   • **Stage 4: Cooling & Glazing** — Callebaut chocolate ganache drips & mirror glazes\n" +
      "   • **Stage 5: Quality Check & Dispatch** — Insulated packaging and dispatch to counter or delivery driver!\n" +
      "4. 🏷️ **Unique Batch Codes**: Every run receives a traceable code like `BATCH-261002-CROIS-01`.";

    quickActions = isStaff
      ? ["Scale Chocolate Cake Recipe", "Check Kitchen Stock Report", "AI Demand Forecast"]
      : ["View Bestseller Cakes", "Design Custom 3D Cake", "Show Active Coupons"];
    if (isStaff) navigateTo = "production";
    return { reply, quickActions, navigateTo };
  }

  // 2g. COMMERCIAL EQUIPMENT TELEMETRY & IOT MAINTENANCE
  const isEquipmentQuery = (
    query.includes("equipment") ||
    query.includes("machinery") ||
    query.includes("deck oven") ||
    query.includes("spiral mixer") ||
    query.includes("maintenance alert") ||
    query.includes("runtime hours") ||
    query.includes("duty cycle") ||
    query.includes("service due") ||
    query.includes("proofing chamber")
  );

  if (isEquipmentQuery) {
    reply = "⚙️ **Commercial Bakery Equipment Telemetry & Maintenance**:\n\n" +
      "BakeSphere monitors commercial machinery runtime to guarantee uncompromised bake quality:\n\n" +
      "• 🥖 **Moretti Forni Serie T Deck Ovens**: Multi-deck stone-hearth ovens with dual top/bottom temperature controls. Logs runtime hours per baking run.\n" +
      "• 🌀 **Diosna 120L Spiral Dough Mixers**: Heavy-duty spiral arms for sourdough and brioche lamination. Tracks motor duty cycles.\n" +
      "• 🌡️ **Salva Retarder Proofer**: Computer-controlled humidity (85%) and temperature chambers for 24-hour overnight cold dough retarding.\n" +
      "• 🍫 **Selmi Chocolate Tempering Machine**: Precision continuous tempering for 54.5% Belgian chocolate shells and bonbons.\n" +
      "• 🚨 **Predictive Service Alerts**: When runtime crosses 1,500 hours or bearing resistance spikes, the system automatically alerts facilities for lubrication and gasket inspection!";

    quickActions = isStaff
      ? ["Check Kitchen Stock Report", "Category Sales Report", "AI Demand Forecast"]
      : ["View Bestseller Cakes", "Design Custom 3D Cake", "Show Active Coupons"];
    return { reply, quickActions };
  }

  // 2h. SUPPLY CHAIN (SCM) & VERIFIED SUPPLIERS
  const isProcurementQuery = (
    query.includes("supplier") ||
    query.includes("suppliers") ||
    query.includes("procurement") ||
    query.includes("purchase order") ||
    query.includes("restock") ||
    query.includes("reorder level") ||
    query.includes("safety stock") ||
    query.includes("vendor") ||
    query.includes("vendors")
  );

  if (isProcurementQuery) {
    reply = "📦 **Supply Chain Management & Verified Ingredient Suppliers**:\n\n" +
      "We source our raw ingredients exclusively from certified origin suppliers:\n\n" +
      "• 🧈 **Brittany Dairy Imports Ltd.**: Direct importers of authentic 84% fat Normandy cultured butter.\n" +
      "• 🍫 **Barry Callebaut Belgium**: Premium 54.5% and 70.5% Belgian dark chocolate couverture.\n" +
      "• 🌾 **Moulins Viron French Mills**: Certified French T55 pastry flour and T65 stoneground flour.\n" +
      "• 🌺 **Madagascar Bourbon Vanilla Co.**: Hand-pollinated Grade A Bourbon vanilla beans & extract.\n" +
      "• 🧀 **Amul Creamery & Dairy Logistics**: Fresh cream, paneer, and farm-fresh dairy delivered twice daily.\n\n" +
      "💡 *Automated Procurement*: When raw stock drops below the `reorderLevel`, BakeSphere auto-drafts a Purchase Order with supplier lead times!";

    quickActions = isStaff
      ? ["Check Kitchen Stock Report", "Category Sales Report", "AI Demand Forecast"]
      : ["View Bestseller Cakes", "Show Active Coupons", "Design Custom 3D Cake"];
    if (isStaff) navigateTo = "inventory";
    return { reply, quickActions, navigateTo };
  }

  // 2i. MULTI-BRANCH NETWORK & COMMISSARY LOGISTICS
  const isBranchesQuery = (
    query.includes("branches") ||
    query.includes("branch network") ||
    query.includes("commissary") ||
    query.includes("central hub") ||
    query.includes("koyambedu") ||
    query.includes("anna nagar") ||
    query.includes("t nagar") ||
    query.includes("which branch")
  );

  if (isBranchesQuery) {
    reply = "📍 **BakeSphere Multi-Branch Network & Cloud Commissary Hubs**:\n\n" +
      "We operate a coordinated multi-hub network across Chennai and major metropolitan zones:\n\n" +
      "• 🏛️ **BR-01: Heritage Main (T. Nagar)**: Flagship boutique patisserie, walk-in counter, and express delivery hub.\n" +
      "• 🌿 **BR-02: Anna Nagar Flagship**: Cafe dining, specialty coffees, and oven-fresh viennoiserie.\n" +
      "• ⚡ **BR-03: Koyambedu Transit Hub**: Rapid transit retail counter and high-volume savory hub.\n" +
      "• 🏭 **BR-04: Central Production Commissary**: 6,000 sq.ft facility dedicated to 3D custom multi-tier wedding cakes, artisan sourdough lamination, and heavy bread baking.\n\n" +
      "💡 *Smart Logistics*: Standard delivery orders are fulfilled by the nearest retail hub, while complex custom cakes are crafted at BR-04 and delivered in refrigerated vans!";

    quickActions = ["View Bestseller Cakes", "Design Custom 3D Cake", "Show Active Coupons (SWEET15)", "Select Delivery City"];
    return { reply, quickActions };
  }

  // 2j. ALL ROLES IN BAKESPHERE & HOW TO SWITCH
  const isAllRolesQuery = (
    query.includes("all roles") ||
    query.includes("roles in bakesphere") ||
    query.includes("what roles") ||
    query.includes("how many roles") ||
    query.includes("how to switch role") ||
    query.includes("switch my role") ||
    query.includes("role switcher")
  );

  if (isAllRolesQuery) {
    reply = "🎭 **The 7 Operational Roles in BakeSphere**:\n\n" +
      "BakeSphere provides dedicated, permission-gated workspaces tailored to each user type:\n\n" +
      "1. 🛍️ **Customer**: Online storefront, 3D Custom Cake Studio, order tracking, and loyalty rewards.\n" +
      "2. 🧁 **Pastry Chef**: Kitchen production queue, master recipe scaling, and bake timers.\n" +
      "3. 👨‍🍳 **Head Baker / Master Chef**: Master production planning, wastage loss logs, and quality sign-off.\n" +
      "4. 💳 **POS Cashier**: Touchscreen billing, barcode lookup, split payments, and thermal receipts.\n" +
      "5. 💼 **Branch Manager**: Staff shift rosters, stock reorder approvals, and branch P&L.\n" +
      "6. 🏢 **Bakery Owner / Executive**: Multi-branch telemetry, supplier contracts, and profit margin analysis.\n" +
      "7. 👑 **Super Admin**: Complete enterprise governance, staff credential provisioning, and system audit logs.\n\n" +
      "💡 *How to switch roles*: Click your user avatar in the top-right header, or visit the **Auth Portal** tab to instantly sign in with staff credentials!";

    quickActions = ["Check My Current Role", "Open POS Billing", "Scale Master Recipe", "View Executive Dashboard"];
    return { reply, quickActions };
  }

  // 2k. LOYALTY PROGRAM & VIP TIERS
  const isLoyaltyQuery = (
    query.includes("loyalty point") ||
    query.includes("reward point") ||
    query.includes("earn point") ||
    query.includes("redeem point") ||
    query.includes("silver baker") ||
    query.includes("gold baker") ||
    query.includes("platinum baker") ||
    query.includes("vip tier") ||
    query.includes("membership")
  );

  if (isLoyaltyQuery) {
    reply = "👑 **BakeSphere Gourmet Club & Loyalty Rewards**:\n\n" +
      "Every bite rewards your sweet tooth! Here is how our loyalty tiers work:\n\n" +
      "• 💎 **Earning Rate**: Earn **1 Loyalty Point for every ₹100 spent** on storefront and POS orders.\n" +
      "• 💵 **Instant Redemption**: 1 Point = **₹1 Cash Discount** at checkout with zero restrictions.\n" +
      "• 🥈 **Silver Baker** (0 – 499 pts): Welcome bonus 100 points + birthday dessert coupon.\n" +
      "• 🥇 **Gold Connoisseur** (500 – 1,999 pts): 5% bonus points on every purchase + priority express delivery.\n" +
      "• 🏆 **Platinum VIP** (2,000+ pts): Free 2-hour delivery for life + exclusive seasonal tasting box invitations from Chef Pierre!";

    quickActions = ["Check My Current Role", "Show Active Coupons", "View Bestseller Cakes", "Design Custom 3D Cake"];
    return { reply, quickActions };
  }

  // 2l. 50% ADVANCE DEPOSIT & 3D CUSTOM CAKE SPECIFICATIONS
  const isAdvanceDepositQuery = (
    query.includes("advance deposit") ||
    query.includes("50% advance") ||
    query.includes("50% deposit") ||
    query.includes("advance payment") ||
    query.includes("cake message") ||
    query.includes("rush turnaround") ||
    query.includes("express turnaround") ||
    query.includes("tier stability")
  );

  if (isAdvanceDepositQuery) {
    reply = "🎂 **Custom 3D Cake Studio: Booking & Advance Policy**:\n\n" +
      "To ensure perfection for custom celebrations, here is how custom cake bookings operate:\n\n" +
      "• 💰 **50% Advance Booking Deposit**: Because custom cakes require pre-tempering rare couverture chocolates and reserving dedicated pastry artist hours, a 50% advance is paid at checkout.\n" +
      "• 🚚 **50% Balance on Delivery**: The remaining balance is easily paid upon doorstep delivery via UPI QR or card!\n" +
      "• ✍️ **Custom Piped Message**: Included completely free! Type any anniversary, birthday, or festive message to be piped in chocolate.\n" +
      "• ⏱️ **Turnaround Speeds**:\n" +
      "   • **Standard (48h)**: Free scheduling with complete curing time.\n" +
      "   • **Rush (24h)**: +₹350 priority kitchen allocation.\n" +
      "   • **Express (Same-Day 6h)**: +₹650 dedicated senior chef station.\n" +
      "• 🏛️ **Structural Stability**: 2-tier and 3-tier cakes feature food-grade food-safe dowel rods so your cake arrives structurally pristine!";

    quickActions = ["Open 3D Cake Studio", "View Bestseller Cakes", "Show Active Coupons (SWEET15)"];
    navigateTo = "custom-cake";
    return { reply, quickActions, navigateTo };
  }

  // 3. DIRECT MODULE NAVIGATION ("take me to...", "open...", "go to...", "launch...")
  const isNavQuery = (
    query.startsWith("take me to") ||
    query.startsWith("open") ||
    query.startsWith("go to") ||
    query.startsWith("navigate to") ||
    query.startsWith("switch to") ||
    query.startsWith("launch") ||
    query.startsWith("show me the") ||
    (query.includes("take me") && (query.includes("studio") || query.includes("cake") || query.includes("pos") || query.includes("inventory") || query.includes("shop")))
  );

  if (isNavQuery) {
    if (query.includes("3d") || query.includes("custom cake") || query.includes("cake studio") || query.includes("cake builder") || query.includes("design cake")) {
      navigateTo = "custom-cake";
      reply = "🚀 **Navigating you to the 3D Custom Cake Studio now!**\n\n" +
        "Welcome to our real-time 3D Parametric Cake Builder! Here you can:\n" +
        "• 🎂 Select 1, 2, or 3 celebration tiers with live geometry\n" +
        "• 🍫 Choose gourmet sponges: Madagascar Vanilla, Belgian Dark Cocoa, Red Velvet, or Funfetti\n" +
        "• 🍦 Pair with Swiss Meringue, White Chocolate Cream Cheese, or Dark Ganache\n" +
        "• ✨ Add 24K Edible Gold drips, Belgian truffles, or wild berry coulis\n" +
        "• 👑 Place custom golden plaques, sparklers, and sugar flowers with live weight & price scaling!\n\n" +
        "Your 3D studio is ready right now on your screen!";
      quickActions = ["Bestseller Cakes", "Show Active Coupons", "Explore Hot Savories"];
      return { reply, quickActions, navigateTo };
    }

    if (query.includes("pos") || query.includes("billing") || query.includes("cashier") || query.includes("counter")) {
      if (!["super_admin", "bakery_owner", "manager", "cashier"].includes(userRole)) {
        reply = "🔒 **POS Billing Terminal Access Restricted**:\n\n" +
          "The Touchscreen POS Billing terminal is reserved for Cashiers, Store Managers, and Admins.\n\n" +
          "As a customer, you can order directly through our **Online Bakery Storefront** or **3D Custom Cake Studio** with instant digital payment!";
        quickActions = ["Open Online Storefront", "Design Custom 3D Cake", "Show Active Coupons"];
        return { reply, quickActions };
      }
      navigateTo = "pos";
      reply = "🛒 **Navigating you to the POS Billing Terminal!**\n\n" +
        "Touchscreen POS is ready for fast counter sales:\n" +
        "• Instant barcode & name search across 60+ bakery items\n" +
        "• Split payment handling: Counter Cash, Cards, and Dynamic UPI QR\n" +
        "• 80mm ESC/POS Thermal Receipt generation\n" +
        "• Live daily cash register balancing.";
      quickActions = ["Apply SWEET15 Code", "Category Sales Report", "Check Kitchen Stock"];
      return { reply, quickActions, navigateTo };
    }

    if (query.includes("inventory") || query.includes("stock") || query.includes("fefo") || query.includes("ingredient")) {
      if (!isStaff) {
        reply = "🔒 **Inventory & FEFO Module Access Restricted**:\n\n" +
          "Kitchen stock audits and First-Expiry-First-Out (FEFO) batches are managed by kitchen staff and managers.\n\n" +
          "All our treats are baked fresh daily using certified premium ingredients!";
        quickActions = ["View Bestseller Cakes", "Show Active Coupons", "Design Custom 3D Cake"];
        return { reply, quickActions };
      }
      navigateTo = "inventory";
      reply = "⏳ **Navigating you to the FEFO Inventory & Stock Manager!**\n\n" +
        "Track raw pantry ingredients with automated lot tracking:\n" +
        "• Real-time stock levels of Callebaut Chocolate, Normandy Butter, and Flours\n" +
        "• FEFO alerts for lots reaching expiry within 72 hours\n" +
        "• One-click Reorder PO creation.";
      quickActions = ["Check Kitchen Stock Report", "Scale Chocolate Cake Recipe", "AI Demand Forecast"];
      return { reply, quickActions, navigateTo };
    }

    if (query.includes("production") || query.includes("recipe") || query.includes("scaler") || query.includes("batch")) {
      if (!["super_admin", "bakery_owner", "manager", "head_baker", "chef"].includes(userRole)) {
        reply = "🧑‍🍳 Master formula scaling and commercial batch production are managed by our bakery culinary team.";
        quickActions = ["View Bestseller Cakes", "Design Custom 3D Cake", "Show Active Coupons"];
        return { reply, quickActions };
      }
      navigateTo = "production";
      reply = "🧑‍🍳 **Navigating you to Production & Recipe Scaler!**\n\n" +
        "Scale artisanal baking formulas with mathematical precision:\n" +
        "• Scale Belgian Chocolate Truffle, French Croissant, or Sourdough yields\n" +
        "• Automated Baker's Percentage Calculations\n" +
        "• Schedule proofing & oven batches.";
      quickActions = ["Scale Chocolate Cake Recipe", "Check Kitchen Stock Report", "Category Sales Report"];
      return { reply, quickActions, navigateTo };
    }

    if (query.includes("dashboard") || query.includes("analytics") || query.includes("sales report")) {
      if (!isManagerOrAdmin) {
        reply = "🔒 The Executive Telemetry Dashboard is reserved for Bakery Owners, Admins, and Branch Managers.";
        quickActions = ["View Bestseller Cakes", "Show Active Coupons", "Design Custom 3D Cake"];
        return { reply, quickActions };
      }
      navigateTo = "dashboard";
      reply = "📊 **Navigating you to Executive Dashboard & Analytics!**\n\n" +
        "Live financial telemetry snapshot:\n" +
        "• Gross Daily Revenue: ₹3,15,738 across 416 orders\n" +
        "• Real-time branch performance for 4 Chennai hubs\n" +
        "• Payment method splits (57% UPI, 33% Card, 10% Cash).";
      quickActions = ["Category Sales Breakdown", "Check Kitchen Stock Report", "AI Demand Forecast"];
      return { reply, quickActions, navigateTo };
    }

    if (query.includes("shop") || query.includes("store") || query.includes("menu") || query.includes("bakery") || query.includes("catalog")) {
      navigateTo = "shop";
      reply = "🍰 **Navigating you to the Online Bakery Storefront!**\n\n" +
        "Browse our full menu of artisanal celebration cakes, hot savory puffs, Punjabi samosas, jar cakes, and artisan brews!";
      quickActions = ["View Bestseller Cakes", "Show Active Coupons", "Design Custom 3D Cake"];
      return { reply, quickActions, navigateTo };
    }
  }

  // 4. CUSTOMER SUPPORT, HELPLINE, STORE TIMINGS & SAME SUPPORT
  const isSupportQuery = (
    query.includes("support") ||
    query.includes("customer care") ||
    query.includes("help desk") ||
    query.includes("helpline") ||
    query.includes("contact") ||
    query.includes("phone number") ||
    query.includes("phone no") ||
    query.includes("call") ||
    query.includes("customer service") ||
    query.includes("timings") ||
    query.includes("timing") ||
    query.includes("opening hour") ||
    query.includes("operating hour") ||
    query.includes("store timing") ||
    query.includes("same support") ||
    query.includes("talk to human") ||
    query.includes("assistance") ||
    query.includes("help me") ||
    query.includes("complaint")
  );

  if (isSupportQuery) {
    reply = "🛎️ **BakeSphere Customer Care & Master Baker Support**:\n\n" +
      "Yes, absolutely! Our full customer support and culinary concierge services are active today:\n\n" +
      "• ⏰ **Today's Operational Hours**: Cloud kitchens and customer support operate **7:00 AM – 11:00 PM daily** across all 7 cities.\n" +
      "• 🌐 **24/7 Digital Studio**: Online ordering, 3D Custom Cake Studio, and Chef Pierre AI are live **24 hours a day**.\n" +
      "• 📞 **Direct Concierge Hotline**: **+91 98401 23456** (Speak directly with our BakeSphere customer care desk).\n" +
      "• 📧 **Email Assistance**: **support@bakesphere.com** (Typical reply within 15 minutes).\n" +
      "• ⚡ **2-Hour Express Delivery**: Active today! Orders placed right now will be baked fresh, packed in insulated thermal boxes, and delivered within 2 hours.\n" +
      "• 🌙 **Midnight Surprise Deliveries**: Open for booking today for 12:00 AM midnight celebrations!\n\n" +
      "How may we assist your celebration or order today?";
    quickActions = ["Design Custom 3D Cake", "View Bestseller Cakes", "Show Active Coupons (SWEET15)", "Track Live Order"];
    return { reply, quickActions };
  }

  // 5. PRODUCT CATEGORIES & KIDS / CHILDREN SPECIALTY COLLECTIONS
  const isCategoryOrKidsQuery = (
    query.includes("kids") ||
    query.includes("children") ||
    query.includes("child") ||
    query.includes("kid-friendly") ||
    query.includes("birthday for kids") ||
    query.includes("school party") ||
    query.includes("category") ||
    query.includes("categories") ||
    query.includes("what do you sell") ||
    query.includes("what items") ||
    query.includes("menu sections") ||
    query.includes("catalog list")
  );

  if (isCategoryOrKidsQuery) {
    // A. Specific Inquiry for KIDS / CHILDREN
    if (query.includes("kid") || query.includes("child") || query.includes("school party")) {
      reply = "🎈 **Kids Celebration & Children's Bakery Collections at BakeSphere**:\n\n" +
        "We feature **5 dedicated categories designed especially for kids, children's birthdays, and school parties**:\n\n" +
        "1. 🍫 **Carnival & Candy Celebration Cakes**\n" +
        "   • **KitKat & Gems Carnival Cake** (₹799) — crunchy fence of crispy KitKat fingers filled with chocolate fudge sponge and crowned with colorful Gems!\n" +
        "   • **Super Smash Choco Pinata Cake** (₹1,199) — comes with a wooden toy hammer for kids to smash open the chocolate dome and discover hidden candies!\n\n" +
        "2. 🦄 **Fantasy, Themed & Pastel Fondant Cakes**\n" +
        "   • **Rainbow Fantasy Pastel Fondant Cake** (₹1,099) — whimsical pastel rainbow tiers with edible sugar clouds.\n" +
        "   • *Customizable in our 3D Studio*: Superheroes, Outer Space Galaxy, Dinosaurs, and Princess themes!\n\n" +
        "3. 🌈 **Funfetti Rainbow Confetti & Vanilla Treats**\n" +
        "   • Vanilla bean sponge dotted with baked-in rainbow confetti and frosted with silky white chocolate mousse.\n\n" +
        "4. 🧁 **Mess-Free Cupcakes & Jar Cakes for Kids**\n" +
        "   • **Oreo Cookies & Cream Jar Cake** (₹159) & **Dark Mocha Volcano Cupcake Duo** (₹179) — airtight glass jars perfect for school lunchboxes and party return gifts!\n\n" +
        "5. 🌽 **Mild & Kid-Friendly Savories (Non-Spicy)**\n" +
        "   • **Golden Sweet Corn & Cheese Puff** (₹50) — flaky pastry filled with sweet American corn and gooey mozzarella.\n" +
        "   • **Paneer Corn Mild Samosa** (₹55) — savory, cheesy, and zero sharp spice!\n\n" +
        "💡 *Parent Note*: All kids cakes are 100% vegetarian / eggless, made with natural fruit colorings and zero artificial trans fats!";
      quickActions = ["Order KitKat Carnival Cake", "Design Custom 3D Cake", "Sweet Corn Cheese Puff", "Show Active Coupons (SWEET15)"];
      return { reply, quickActions };
    }

    // B. General Bakery Categories Inquiry
    reply = "🥐 **BakeSphere Artisanal Product Catalog (10 Core Categories)**:\n\n" +
      "We hand-craft over 60 fresh bakery treats every morning across 10 specialized categories:\n\n" +
      "1. 🎂 **Celebration Cakes** (₹599–₹1,499) — Belgian Truffle, Red Velvet Cream Cheese, Black Forest Gateau, Lotus Biscoff\n" +
      "2. 🧁 **Gourmet Cupcakes** (₹89–₹189) — Dark Mocha Lava, Salted Caramel Crunch, Funfetti Confetti\n" +
      "3. 🥐 **Artisan Jar Cakes** (₹159–₹199) — Belgian Ganache, Oreo Cheesecake, Red Velvet Swirl in reusable glass jars\n" +
      "4. 🍫 **Brownies & Blondies** (₹99–₹149) — Molten Fudge Walnut, Triple Belgian Cocoa, Lotus Speculoos\n" +
      "5. 🍪 **Cookies & Macarons** (₹120–₹280) — Parisian Macarons, Sea Salt Choco Chunk, French Shortbread\n" +
      "6. 🥟 **Hot Savory Puffs** (₹45–₹85) — Flaky Tandoori Paneer Tikka, Smoked Keema, Sweet Corn & Cheese\n" +
      "7. 🥟 **Crispy Punjabi Samosas** (₹35–₹65) — Authentic Aloo, Paneer Corn, Jalapeno Cheddar\n" +
      "8. 🥖 **Rustic European Breads** (₹95–₹180) — 48-Hour Wild Yeast Sourdough, French Baguette, Brioche Buns\n" +
      "9. 🍮 **Desserts & Cheesecakes** (₹115–₹299) — New York Baked Cheesecake, Molten Choco Lava, Lemon Tart\n" +
      "10. ☕ **Artisan Brews & Drinks** (₹40–₹170) — Kulhad Masala Chai, South Indian Filter Coffee, Spanish Latte\n\n" +
      "Which category would you like to explore or order from today?";
    quickActions = ["View Bestseller Cakes", "Hot Savory Puffs & Samosas", "Design Custom 3D Cake", "Show Active Coupons"];
    return { reply, quickActions };
  }

  // 6. EXECUTIVE & BRANCH SALES REPORT (Staff Telemetry or Customer Gated)
  const isSalesReportQuery = (
    query.includes("sales report") ||
    query.includes("revenue report") ||
    query.includes("financial report") ||
    query.includes("business report") ||
    query.includes("turnover report") ||
    query.includes("total revenue") ||
    query.includes("gross revenue") ||
    query.includes("today sales") ||
    query.includes("todays sales") ||
    query.includes("today's sales") ||
    query.includes("sales today") ||
    query.includes("turnover today") ||
    query.includes("today revenue") ||
    query.includes("daily sales") ||
    query.includes("branch sales") ||
    query.includes("store sales") ||
    (query.includes("sales") && query.includes("report")) ||
    (isStaff && (query.includes("how much did we sell") || query.includes("sales figures") || query.includes("overall sales") || query.includes("revenue")))
  );

  if (isSalesReportQuery) {
    if (!isStaff) {
      reply = "Bonjour! 👨‍🍳 Financial and business performance reports are accessible exclusively to verified BakeSphere staff.\n\n" +
        "Looking for your personal order updates? Let me know your order ID (e.g. `BS-1024`) or check your cart!";
      quickActions = ["Track Order BS-1024", "Show Active Coupons", "View Bestseller Cakes"];
      return { reply, quickActions };
    }

    const report = computeOverallSalesReport();
    const branchRows = (report.branches || []).slice(0, 4).map(b => 
      `• 📍 **${b.name}** (${b.locality}): **₹${(b.todaySales || 0).toLocaleString()}** today (Monthly Target: ₹${((b.monthlyTarget || 0) / 100000).toFixed(1)}L · **${((b.currentMonthSales / b.monthlyTarget) * 100).toFixed(1)}%** achieved)`
    ).join("\n");
    const channelRows = report.channels.map(c => `• **${c.name}**: ₹${c.revenue.toLocaleString()} (${c.percent})`).join("\n");

    reply = `📈 **BakeSphere Daily Executive Sales & Branch Telemetry Report** (Live Operations):\n\n` +
      `• **Total Today's Gross Revenue**: **₹${report.totalRevenue.toLocaleString()}**\n` +
      `• **Total Orders Processed**: **${report.totalOrders} orders**\n` +
      `• **Average Order Value (AOV)**: **₹${report.aov}**\n` +
      `• **Total Product Units Dispatched**: **${report.totalUnits} items**\n\n` +
      `🏪 **Branch Performance Snapshot (Chennai Hubs)**:\n` +
      branchRows + `\n\n` +
      `🛵 **Sales Channels Breakdown**:\n` +
      channelRows + `\n\n` +
      `💳 **Payment Settlement Mix**:\n` +
      `• **UPI (PhonePe / GPay)**: ${report.payments.upi}\n` +
      `• **Credit / Debit Cards**: ${report.payments.card}\n` +
      `• **Counter Cash**: ${report.payments.cash}\n\n` +
      `🏆 **Top Revenue Category**: **${report.topCategory.category}** (₹${report.topCategory.revenue.toLocaleString()}, ${report.topCategory.share} share).`;

    quickActions = isManagerOrAdmin
      ? ["Category Sales Breakdown", "Check Kitchen Stock Report", "AI Demand Forecast", "Open POS Billing Terminal"]
      : ["Category Sales Breakdown", "Check Kitchen Stock Report", "Scale Master Recipe"];

    return { reply, quickActions };
  }

  // 7. BESTSELLERS / TOP SELLING / TRENDING / POPULAR / RECOMMENDATIONS
  const isBestsellerQuery = (
    query.includes("top sell") ||
    query.includes("top-selling") ||
    query.includes("bestsell") ||
    query.includes("best sell") ||
    query.includes("most popular") ||
    query.includes("popular") ||
    query.includes("trending") ||
    query.includes("what should i buy") ||
    query.includes("what should i order") ||
    query.includes("what is good") ||
    query.includes("what's good") ||
    query.includes("recommend") ||
    query.includes("favorites") ||
    query.includes("favourite") ||
    query.includes("highest rated") ||
    query.includes("top rated") ||
    query.includes("famous") ||
    query.includes("special")
  );

  if (isBestsellerQuery) {
    const topItems = getBestsellerProducts(5);
    reply = "🌟 **Today's Top-Selling & Customer Favorite Treats at BakeSphere**:\n\n" +
      topItems.map((item, idx) => {
        const icon = item.category === "Cakes" ? "🎂" : item.category === "Hot Savories" ? "🥟" : item.category === "Beverages" ? "☕" : "🥐";
        const egglessTag = item.isEggless ? " 🌱 **100% Eggless**" : "";
        const desc = item.description ? item.description.slice(0, 105) + "..." : "";
        return `${idx + 1}. ${icon} **${item.name}** — **₹${item.sellingPrice}** (⭐ ${item.rating} · ${item.reviewsCount} reviews)${egglessTag}\n   • *${desc}*`;
      }).join("\n\n") +
      "\n\n💡 **Chef Pierre's Deal Tip**: Apply code **SWEET15** at checkout for 15% off celebration cakes, or **BAKE50** for ₹50 off hot savories!";
    quickActions = [
      "Order Belgian Chocolate Truffle",
      "Explore Hot Savory Puffs",
      "View Active Coupons (SWEET15)",
      "Design Custom 3D Cake"
    ];
    return { reply, quickActions };
  }

  // 8. BUDGET / PRICE QUERIES ("under 500", "under 200", "cheapest", "price list")
  const priceMatch = query.match(/(?:under|below|less than|within)\s*(?:rs\.?|₹)?\s*(\d+)/i) ||
                     query.match(/(\d+)\s*(?:rs\.?|₹|rupees)\s*(?:under|budget|limit)/i);
  if (priceMatch || query.includes("cheap") || query.includes("budget") || query.includes("affordable") || query.includes("lowest price")) {
    const maxBudget = priceMatch ? parseInt(priceMatch[1], 10) : 250;
    const affordableItems = bakeryProducts
      .filter(p => p.sellingPrice <= maxBudget)
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 5);

    if (affordableItems.length > 0) {
      reply = `💰 **Fresh Bakery Treats Under ₹${maxBudget}**:\n\n` +
        affordableItems.map((item, idx) => 
          `${idx + 1}. **${item.name}** (${item.category}) — **₹${item.sellingPrice}** (⭐ ${item.rating})\n   • *${item.description ? item.description.slice(0, 80) + '...' : ''}*`
        ).join("\n\n") +
        `\n\n🎉 Plus, use code **BAKE50** to save flat ₹50 on any order above ₹299!`;
      quickActions = [
        "Filter Hot Savories",
        "Browse Bestseller Cakes",
        "View Active Coupons",
        "Open Storefront"
      ];
      return { reply, quickActions };
    }
  }

  // 9. DIETARY: Eggless, Vegan, Gluten-Free, Calories
  if (query.includes("eggless") || query.includes("egg-free") || query.includes("without egg") || query.includes("vegetarian") || query.includes("vegan") || query.includes("gluten") || query.includes("calorie") || query.includes("healthy") || query.includes("sugar-free") || query.includes("sugar free")) {
    const egglessCakes = bakeryProducts.filter(p => p.isEggless && p.category === "Cakes").slice(0, 4);
    reply = "🌱 **100% Eggless & Dietary Confectionery at BakeSphere**:\n\n" +
      "Over **85% of our entire bakery catalog is 100% vegetarian / eggless**! We use artisanal European techniques (condensed dairy emulsions, organic flaxseed infusions, and aquafaba) to ensure ultra-soft sponge and velvety crumbs without any compromise.\n\n" +
      "**Top Certified Eggless Bestsellers**:\n" +
      egglessCakes.map(c => `• 🎂 **${c.name}**: ₹${c.sellingPrice} (${c.availableWeights ? c.availableWeights.join(", ") : "0.5 kg"}) — ⭐ ${c.rating}`).join("\n") +
      "\n• 🥐 **Eggless Viennoiserie**: French Butter Croissants & Danish Puffs made with 100% cultured creamery butter.\n\n" +
      "Looking for specific allergy notes? Every item card in our storefront features detailed allergen tags!";
    quickActions = ["View Eggless Cakes", "Explore Vegan Breads", "Show Active Coupons", "Design Custom 3D Cake"];
    return { reply, quickActions };
  }

  // 10. COUPONS & PROMOTIONAL OFFERS
  if (query.includes("coupon") || query.includes("discount") || query.includes("offer") || query.includes("promo") || query.includes("code") || query.includes("sweet15") || query.includes("bake50") || query.includes("freeship") || query.includes("deal") || query.includes("voucher") || query.includes("save")) {
    reply = "🎉 **Active BakeSphere Promotional Coupons & Offers**:\n\n" +
      "• **SWEET15**: **15% OFF** up to ₹150 on orders above ₹499 (Ideal for birthday & celebration cakes!)\n" +
      "• **BAKE50**: **Flat ₹50 OFF** on any order above ₹299 (Perfect for evening puffs & samosas!)\n" +
      "• **FREESHIP**: **Free 2-Hour Express Delivery** on cart values over ₹799.\n\n" +
      "💡 *How to redeem*: Click 'Apply' directly inside your Cart Drawer, or enter the code at checkout or the POS Billing Terminal!";
    quickActions = ["Apply SWEET15 in Cart", "View Bestseller Cakes", "Hot Savory Puffs", "Open POS Billing"];
    return { reply, quickActions };
  }

  // 11. ORDER TRACKING & ORDER STATUS LOOKUP
  const orderIdMatch = query.match(/bs-\d{3,5}/i);
  if (orderIdMatch || query.includes("track") || query.includes("where is my order") || query.includes("order status") || query.includes("my delivery")) {
    const searchId = orderIdMatch ? orderIdMatch[0].toUpperCase() : null;
    const foundOrder = searchId ? bakeryOrders.find(o => o.orderId.toUpperCase() === searchId) : null;

    if (foundOrder) {
      const itemsList = (foundOrder.items || []).map(i => `• ${i.name} (x${i.quantity})`).join("\n");
      reply = `📦 **Order Status for ${foundOrder.orderId}**:\n\n` +
        `• **Customer**: ${foundOrder.customerName}\n` +
        `• **Status**: **${foundOrder.status.toUpperCase().replace(/_/g, " ")}** 🚀\n` +
        `• **Order Type**: ${foundOrder.type === "online_delivery" ? "Doorstep Delivery" : foundOrder.type === "custom_cake" ? "3D Studio Custom Bake" : "Storefront POS"}\n` +
        (foundOrder.deliveryPartner ? `• **Delivery Partner**: ${foundOrder.deliveryPartner}\n` : "") +
        `• **Items**:\n${itemsList}\n` +
        `• **Total Paid**: **₹${foundOrder.finalTotal.toFixed(2)}** (${foundOrder.paymentMethod})`;
      quickActions = ["Track Another Order", "Show Active Coupons", "View Bestseller Cakes"];
      return { reply, quickActions };
    } else {
      reply = "📦 **Live Order Tracking**:\n\n" +
        "You can track any active order by providing your Order ID (for example: **BS-1024**, **BS-1025**, or **BS-1026**).\n\n" +
        "• **BS-1024**: Storefront POS Order (Completed)\n" +
        "• **BS-1025**: Online Doorstep Delivery (Out for Delivery with Partner Ravi Kumar)\n" +
        "• **BS-1026**: 2-Tier 3D Custom Birthday Cake (In Kitchen Preparation)\n\n" +
        "Please enter your Order ID, or check your order receipt!";
      quickActions = ["Track Order BS-1025", "Track Order BS-1024", "Show Active Coupons"];
      return { reply, quickActions };
    }
  }

  // 12. MASTER RECIPES & STEP-BY-STEP BAKING FORMULAS
  const isRecipeQuery = query.includes("recipe") || query.includes("how to make") || query.includes("how to bake") || query.includes("how do i make") || query.includes("how do i bake") || query.includes("baking steps") || query.includes("formula") || query.includes("ingredients for") || (query.includes("ingredients") && query.includes("cake"));

  if (isRecipeQuery) {
    if (query.includes("red velvet")) {
      reply = "🎂 **Master Chef Pierre's Crimson Red Velvet Cake Formula** (Yields 1 kg):\n\n" +
        "• **Ingredients**: 300g cake flour, 280g castor sugar, 15g Dutch cocoa powder, 120g European cultured butter, 240ml cultured buttermilk, 2 eggs, 1 tsp vanilla bean paste, 1 tsp baking soda + 1 tsp white vinegar.\n" +
        "• **Velvety Cream Cheese Frosting**: 300g cold cream cheese, 120g softened butter, 200g sifted icing sugar, 10ml Madagascar vanilla.\n" +
        "• **Baking Instructions**: Cream butter and sugar, incorporate eggs, alternate dry ingredients with buttermilk. Pour into two 8-inch lined tins and bake at **175°C (350°F) for 30 minutes**.\n\n" +
        "💡 *Chef Pierre's Secret*: The reaction between vinegar and buttermilk creates that trademark tender, velvety crumb!";
      quickActions = ["Scale in Recipe Scaler", "Order Ready Red Velvet", "Show Active Coupons (SWEET15)"];
      return { reply, quickActions, navigateTo: "production" };
    } else if (query.includes("sourdough") || query.includes("bread") || query.includes("boule")) {
      reply = "🥖 **San Francisco Style Wild Sourdough Boule Formula** (Yields 1 Boule - 850g):\n\n" +
        "• **Ingredients**: 500g unbleached strong bread flour, 360ml spring water (72% hydration), 120g active mature levain starter, 10g fine sea salt.\n" +
        "• **Procedure**: 45 min autolyse, incorporate starter and salt, 4 stretch-and-folds over 2 hours, shape into banneton, cold retard at 4°C for 14 hours.\n" +
        "• **Bake**: Bake inside a preheated heavy cast-iron Dutch oven at **230°C (450°F) for 25 mins with lid, then 20 mins lid-off** for a blistered mahogany crust!";
      quickActions = ["Scale in Recipe Scaler", "Check Kitchen Stock Report", "Order Sourdough Boule"];
      return { reply, quickActions, navigateTo: "production" };
    } else if (query.includes("croissant")) {
      reply = "🥐 **French Artisanal Butter Croissant Formula** (Batch of 10 Croissants):\n\n" +
        "• **Détrempe Dough**: 500g T55 flour, 60g sugar, 10g salt, 20g fresh yeast, 280ml cold whole milk, 50g soft butter.\n" +
        "• **Beurre de Tourage (Butter Block)**: 250g 84% high-fat European dry butter.\n" +
        "• **Lamination**: 1 double fold + 1 single fold (turns), chill 1 hour between turns, roll to 4mm, cut triangles, proof at 26°C for 2 hours, egg wash and bake at **200°C for 18 minutes** until deep honeycomb golden!";
      quickActions = ["Scale in Recipe Scaler", "Order Hot Croissants", "Show Active Coupons"];
      return { reply, quickActions, navigateTo: "production" };
    } else {
      // Default: Signature Belgian Chocolate Truffle Cake
      reply = "🎂 **Master Chef Pierre's Authentic Belgian Chocolate Truffle Cake Recipe** (Yields 1 kg):\n\n" +
        "Here is our signature patisserie formula scaled with bakery precision:\n\n" +
        "🥄 **Ingredients (Truffle Sponge)**:\n" +
        "• **Fine Pastry Flour**: 300g (sifted)\n" +
        "• **Dutch Process Cocoa Powder**: 60g (high fat 22-24% cocoa butter)\n" +
        "• **Callebaut 54.5% Dark Chocolate**: 200g (finely chopped)\n" +
        "• **Cultured European Butter**: 160g (unsalted)\n" +
        "• **Castor Sugar**: 260g\n" +
        "• **Heavy Dairy Cream (35% fat)**: 220ml\n" +
        "• **Grade A Eggs**: 4 large (or 240g sweetened condensed milk + 60ml milk for 100% eggless)\n" +
        "• **Madagascar Vanilla Extract**: 10ml\n" +
        "• **Baking Powder & Soda**: 6g baking powder + 2g baking soda\n\n" +
        "🍫 **Silky Whipped Callebaut Ganache**:\n" +
        "• **Callebaut Dark Couverture**: 250g\n" +
        "• **Warm Heavy Cream**: 200ml (scalded to 85°C)\n" +
        "• **Unsalted Butter**: 30g (whisked in at 40°C for high gloss)\n\n" +
        "🔥 **Step-by-Step Baking Method**:\n" +
        "1. **Preheat Oven**: Set to **175°C (350°F)** standard bake. Butter and line two 8-inch round cake tins.\n" +
        "2. **Melt Chocolate**: Gently melt Callebaut chocolate and butter over a warm water bath (bain-marie).\n" +
        "3. **Whip Ribbon**: Whisk eggs and castor sugar for 5 minutes until pale, doubled in volume, and forms a thick ribbon.\n" +
        "4. **Combine**: Fold melted chocolate into eggs. Sift dry flour, cocoa, and leavening in 3 additions, alternating with warm heavy cream.\n" +
        "5. **Bake**: Pour into tins and bake for **32–35 minutes** until a skewer inserted in the center comes out clean.\n" +
        "6. **Frosting**: Pour hot cream over dark chocolate, let stand 2 minutes, emulsify until glossy, chill, and frost your layered sponge!\n\n" +
        "💡 *Chef Pierre's Secret Pro Tip*: Bloom the cocoa powder in 30ml of hot espresso before adding to the batter to dramatically unlock deeper chocolate notes!";
      quickActions = ["Scale in Recipe Scaler", "Order Ready Belgian Cake", "Show Active Coupons (SWEET15)", "Baking Science Conversions"];
      return { reply, quickActions, navigateTo: "production" };
    }
  }

  // 13. BAKING SCIENCE, CULINARY CLINIC & CONVERSIONS
  if (query.includes("substitute") || query.includes("replac") || query.includes("egg replacer")) {
    reply = "🧑‍🍳 **Chef Pierre's Culinary Substitution Guide**:\n\n" +
      "• **1 Egg in Sponge Cakes**: 60g unsweetened applesauce, OR 60g plain Greek yogurt, OR 3 tbsp aquafaba (chickpea brine), OR 1 tbsp ground flaxseed + 3 tbsp warm water.\n" +
      "• **Buttermilk**: 1 cup milk + 1 tbsp fresh lemon juice or white vinegar (rest 5 mins).\n" +
      "• **Cake Flour**: 1 cup all-purpose flour minus 2 tbsp, replaced with 2 tbsp cornstarch.\n" +
      "• **Heavy Cream**: 3/4 cup whole milk + 1/3 cup melted unsalted butter (whisk vigorously).";
    quickActions = ["Scale Master Recipe", "Filter Eggless Cakes", "Baking Science Conversions"];
    return { reply, quickActions };
  }

  if (query.includes("cup") || query.includes("gram") || query.includes("conversion") || query.includes("temperature") || query.includes("celsius") || query.includes("fahrenheit") || query.includes("convert")) {
    reply = "⚖️ **Master Baker's Unit & Temperature Conversions**:\n\n" +
      "• **All-Purpose Flour**: 1 cup = **120g – 125g**\n" +
      "• **Granulated Sugar**: 1 cup = **200g**\n" +
      "• **Brown Sugar (Packed)**: 1 cup = **220g**\n" +
      "• **Butter**: 1 cup (2 sticks) = **227g** (1 tbsp = 14.2g)\n" +
      "• **Cocoa Powder**: 1 cup = **100g**\n" +
      "• **Oven Temperatures**: 160°C = 325°F (gentle bake / cheesecakes), 180°C = 350°F (standard cakes & cookies), 200°C = 400°F (crispy puffs & pastries), 220°C = 425°F (artisan sourdough).";
    quickActions = ["Scale Master Recipe", "Launch Recipe Scaler", "Check FEFO Inventory"];
    return { reply, quickActions };
  }

  if (query.includes("sink") || query.includes("sunk") || query.includes("dense") || query.includes("crack") || query.includes("split") || query.includes("curdle") || query.includes("troubleshoot") || query.includes("why did my")) {
    reply = "🔍 **Chef Pierre's Baking Troubleshooting Clinic**:\n\n" +
      "• **Cake Sunk in Middle?** Loss of chamber heat from opening the oven door too early, expired baking powder, or over-whipping batter with excess trapped air.\n" +
      "• **Dense or Gummy Crumb?** Over-mixing develops tough gluten strands! Fold flour gently just until incorporated.\n" +
      "• **Split Chocolate Ganache?** Liquid was too hot or fat separated. Whisk in 1-2 tsp of warm milk or emulsify with an immersion blender.\n" +
      "• **Cracked Cheesecake?** Bake in a bain-marie (hot water bath) and let cool inside the oven with the door propped open for 1 hour.";
    quickActions = ["Scale Chocolate Cake Recipe", "View Master Recipes", "Open 3D Studio"];
    return { reply, quickActions };
  }

  // 13. DELIVERY CITIES, EXPRESS & MIDNIGHT TIMING
  if (query.includes("deliver") || query.includes("city") || query.includes("cities") || query.includes("midnight") || query.includes("express") || query.includes("pincode") || query.includes("shipping") || query.includes("where do you deliver") || query.includes("how long") || query.includes("bangalore") || query.includes("bengaluru") || query.includes("chennai") || query.includes("mumbai") || query.includes("delhi") || query.includes("hyderabad") || query.includes("pune") || query.includes("kolkata")) {
    reply = "⚡ **BakeSphere Delivery Network & Timings**:\n\n" +
      "We operate temperature-controlled cloud patisseries across **7 major hubs**:\n" +
      "• 📍 **Chennai** (Flagship Hub • T. Nagar, Anna Nagar, Adyar, OMR, Koyambedu)\n" +
      "• 📍 **Bangalore** (Express 2-Hour Delivery across Indiranagar, Koramangala, Whitefield)\n" +
      "• 📍 **Delhi NCR** (Same-Day & Midnight Delivery across Delhi, Gurgaon, Noida)\n" +
      "• 📍 **Mumbai** (Express Delivery across Bandra, Andheri, Powai, South Mumbai)\n" +
      "• 📍 **Hyderabad** (Express Hub in Hitec City, Jubilee Hills, Gachibowli)\n" +
      "• 📍 **Pune** (Koregaon Park & Kothrud Hubs)\n" +
      "• 📍 **Kolkata** (Park Street & Salt Lake Hubs)\n\n" +
      "⏱️ **Delivery Speeds**:\n" +
      "• **2-Hour Standard Express**: Freshly baked and dispatched in thermal insulated cases.\n" +
      "• **12:00 AM Midnight Surprise**: Perfect for midnight birthday countdown celebrations!";
    quickActions = ["Select Delivery City", "View Bestseller Cakes", "Track Order BS-1025", "Show Active Coupons"];
    return { reply, quickActions };
  }

  // 14. 3D CUSTOM CAKE STUDIO INQUIRY
  if (query.includes("3d") || query.includes("custom") || query.includes("tier") || query.includes("design") || query.includes("wedding cake") || query.includes("topper") || query.includes("theme") || query.includes("spaceship") || query.includes("sculpt") || query.includes("fondant") || query.includes("personalized") || query.includes("special cake")) {
    reply = "🎨 **BakeSphere 3D Custom Cake Studio**:\n\n" +
      "Our 3D Custom Studio lets you design your dream celebration cake with real-time parametric rendering:\n\n" +
      "1. 🎂 **Tiers**: Choose 1, 2, or 3 celebration tiers with customizable diameters.\n" +
      "2. 🍫 **Sponges**: Madagascar Vanilla, Belgian Dark Cocoa, Crimson Red Velvet, or Funfetti.\n" +
      "3. 🍦 **Frostings**: Silky Swiss Meringue, White Chocolate Cream Cheese, or Dark Ganache.\n" +
      "4. ✨ **Drip Accents**: 24K Edible Gold, Salted Caramel, or Wild Berry Coulis.\n" +
      "5. 👑 **3D Toppers**: Custom golden plaques, sparklers, and sugar flower cascades.\n\n" +
      "Pricing updates live based on selected weight, tiers, and artisanal decorations!";
    quickActions = ["Open 3D Cake Studio", "View Bestseller Cakes", "Show Active Coupons"];
    return { reply, quickActions };
  }

  // 15. SNACKS: Puffs, Samosas, Teas, Coffees & Savories
  if (query.includes("puff") || query.includes("samosa") || query.includes("chai") || query.includes("tea") || query.includes("coffee") || query.includes("latte") || query.includes("snack") || query.includes("savory") || query.includes("kathi") || query.includes("quiche")) {
    reply = "🥟 **Hot & Crispy Bakery Snacks & Artisan Brews**:\n\n" +
      "• **Artisan Puffs**: Flaky Golden Veg Curry Puff (₹45), Tandoori Paneer Tikka Puff (₹65), Smoked Chicken Keema Puff (₹85), Cheesy Mushroom Puff (₹75)\n" +
      "• **Crispy Punjabi Samosas**: Authentic Punjabi Aloo Samosa (₹35), Paneer Corn Samosa (₹55), Jalapeno Cheese Samosa (₹65), Cocktail Party Box of 6 (₹99)\n" +
      "• **Artisan Brews**: Kulhad Masala Cutting Chai (₹40), Authentic South Indian Filter Coffee (₹50), Signature Spanish Iced Latte (₹170), Rich Dark Hot Chocolate (₹95)\n" +
      "• **Savories**: Tandoori Paneer Kathi Roll (₹95), Stuffed Cheese Garlic Bread (₹110), Spinach & Feta Quiche (₹125).";
    quickActions = ["Filter Hot Puffs", "Browse Samosas", "Order Masala Chai", "Open POS Billing"];
    return { reply, quickActions };
  }

  // 16. STAFF OPERATIONS: Category Sales, Financials, Inventory (Role-Aware)
  if (
    query.includes("category sales") ||
    query.includes("categories sales") ||
    query.includes("sales by category") ||
    query.includes("category revenue") ||
    query.includes("category report") ||
    query.includes("breakdown by category") ||
    (query.includes("category") && (query.includes("sales") || query.includes("revenue") || query.includes("calculate") || query.includes("report")))
  ) {
    if (!isStaff) {
      reply = "Bonjour! 👨‍🍳 Category financial telemetry is restricted to bakery staff and management.\n\n" +
        "However, as our valued guest, here are our **top customer-favorite categories**:\n" +
        "• 🎂 **Celebration Cakes**: Belgian Chocolate Truffle & Red Velvet Swirl\n" +
        "• 🥐 **Flaky Viennoiserie**: French Butter Croissants & Almond Puffs\n" +
        "• 🥟 **Hot Savories**: Tandoori Paneer Puffs & Crispy Samosas\n" +
        "• ☕ **Artisan Brews**: South Indian Filter Coffee & Spanish Iced Latte\n\n" +
        "Would you like to explore our bestsellers or apply coupon **SWEET15**?";
      quickActions = ["View Bestseller Cakes", "Hot Savory Puffs", "Apply SWEET15 in Cart", "Design Custom 3D Cake"];
      return { reply, quickActions };
    }

    const { sorted, totalRev, totalUnits } = computeCategorySales();
    const rows = sorted.map((c) => `| **${c.category}** | ${c.units} units | ₹${c.revenue.toLocaleString()} | **${c.share}** |`).join("\n");
    reply = `📊 **Chef Pierre Category Sales & Turnover Report** (Live Telemetry):\n\n` +
      `| Category | Units Sold | Gross Revenue | Share of Sales |\n` +
      `| :--- | :---: | :---: | :---: |\n` +
      rows + `\n` +
      `| **TOTAL** | **${totalUnits} units** | **₹${totalRev.toLocaleString()}** | **100%** |\n\n` +
      `💡 **Executive Culinary Insights**:\n` +
      `• **Revenue Anchor**: **${sorted[0].category}** generates **₹${sorted[0].revenue.toLocaleString()}** (${sorted[0].share} of all sales).\n` +
      `• **Volume Leader**: **Hot Savories** moves the highest daily unit volume.\n` +
      `• **Overall Turnover**: **₹${totalRev.toLocaleString()}** across ${totalUnits} items.`;
    quickActions = ["Generate Full Sales Report", "Check Kitchen Stock Report", "AI Demand Forecast", "Scale Master Recipe"];
    return { reply, quickActions };
  }

  if (query.includes("inventory report") || query.includes("stock report") || query.includes("low stock") || query.includes("fefo")) {
    if (!isStaff) {
      reply = "Bonjour! 👨‍🍳 All BakeSphere bakery items are freshly baked daily using premium dairy, Belgian chocolate, and certified flours. We maintain 100% fresh inventory!";
      quickActions = ["Browse Fresh Treats", "Eggless Cake Options", "Active Coupons"];
      return { reply, quickActions };
    }

    const inv = computeInventoryReport();
    const lowItems = inv.lowStockItems.map(i => `• **${i.name}**: **${i.stockQuantity} ${i.unit}** remaining (Reorder threshold: ${i.reorderLevel} ${i.unit})`).join("\n");
    reply = `📦 **BakeSphere Kitchen & FEFO Inventory Health Report**:\n\n` +
      `• **Tracked Raw Ingredients**: ${inv.totalTracked} SKUs in ERP\n` +
      `• **Items Near Reorder Threshold**: **${inv.lowStockItems.length} critical items**:\n` +
      lowItems + `\n\n` +
      `• **Active Kitchen Batches**: ${inv.activeBatches.length} production runs currently in oven/proofing.`;
    quickActions = ["Category Sales Breakdown", "Scale Chocolate Cake Recipe", "AI Demand Forecast", "Generate Full Sales Report"];
    return { reply, quickActions };
  }

  // 17. SPECIFIC FOOD & FLAVOR SEARCH (Guarded: Only runs when food intent is clearly present!)
  const hasFoodIntent = /\b(cake|cakes|pastry|pastries|sweet|sweets|snack|snacks|cupcake|cupcakes|jar cake|bread|breads|sourdough|croissant|croissants|chocolate|truffle|velvet|vanilla|strawberry|blueberry|mango|pineapple|butterscotch|coffee|tea|chai|beverage|drink|cookies|biscuit|brownie|brownies|blondie|dessert|desserts|cheesecake|tart|flavor|flavours|taste|delicious|treat|treats|order|eat|bake|item|items|food|menu)\b/i.test(query);

  if (hasFoodIntent) {
    const matchedProducts = searchProducts(query, 3);
    if (matchedProducts.length > 0) {
      reply = "🍰 **Here are the matching treats from our bakery kitchen**:\n\n" +
        matchedProducts.map((p, idx) => {
          const icon = p.category === "Cakes" ? "🎂" : p.category === "Hot Savories" ? "🥟" : p.category === "Beverages" ? "☕" : "🥐";
          const egglessTag = p.isEggless ? " 🌱 **100% Eggless**" : "";
          return `${idx + 1}. ${icon} **${p.name}**\n` +
            `   • **Price**: **₹${p.sellingPrice}** ${p.mrp ? `(MRP: ~~₹${p.mrp}~~, save ${p.discountPercent}%)` : ""}\n` +
            `   • **Rating**: ⭐ ${p.rating} (${p.reviewsCount} customer reviews)${egglessTag}\n` +
            `   • *${p.description}*`;
        }).join("\n\n") +
        "\n\nWould you like to add one to your cart or customize it in our 3D Studio?";
      quickActions = [
        `Order ${matchedProducts[0].name.slice(0, 22)}`,
        "View Active Coupons",
        "Explore Hot Savory Puffs",
        "Design Custom 3D Cake"
      ];
      return { reply, quickActions };
    }
  }

  // 18. GREETINGS & INTRODUCTIONS
  if (query.match(/\b(how are you|how r u|how are u|how do you do|how's it going|how is it going|whats up|what's up|how have you been)\b/)) {
    reply = "Magnifique! 👨‍🍳 The ovens are warm, the sweet aromas of 54% Callebaut dark chocolate, Madagascar vanilla, and French butter croissants are wafting through the BakeSphere bakery! I am delighted to be here with you. How are you doing today? Are you craving a decadent dessert, planning a special celebration cake, or looking for an artisan recipe?";
    quickActions = ["View Bestseller Cakes", "Recipe of Chocolate Cake", "Show Active Coupons (SWEET15)", "Design Custom 3D Cake"];
    return { reply, quickActions };
  }

  if (query.match(/\b(hi|hello|hey|bonjour|greetings|who are you|namaste|morning|evening)\b/)) {
    reply = `Bonjour ${userName !== "Guest" ? `**${userName}**` : ""}! 👨‍🍳 I am **Chef Pierre**, your Master Baker & AI Culinary Concierge at BakeSphere!\n\n` +
      `I can help you explore our freshest bestsellers, check prices, design custom 3D cakes, apply active discount coupons like **SWEET15**, track live orders, or give expert baking troubleshooting tips. What can I bake or find for you today?`;
    quickActions = ["View Bestseller Cakes", "Show Active Coupons (SWEET15)", "Explore Hot Savory Puffs", "Design Custom 3D Cake"];
    return { reply, quickActions };
  }

  // 19. GRATITUDE & COMPLIMENTS
  if (query.match(/\b(thank|thanks|awesome|great|cool|good job|nice|love it|perfect)\b/)) {
    reply = "Merci beaucoup! 👨‍🍳 It is always my absolute pleasure to serve culinary delight. Let me know if you'd like to check out today's top picks, design a cake, or grab a discount code!";
    quickActions = ["View Bestseller Cakes", "Show Active Coupons", "Design Custom 3D Cake", "Hot Savory Puffs"];
    return { reply, quickActions };
  }

  // 20. JOKES & CULINARY HUMOR
  if (query.includes("joke") || query.includes("funny") || query.includes("laugh")) {
    const jokes = [
      "Why did the baker go to therapy? Because he was kneading some help! 😂",
      "What do you call a fake noodle? An impasta! But what do you call a fake pastry? A faux-issant! 🥐",
      "Why do bakers make great detectives? Because they always find the proof! 🥖",
      "How did the sourdough propose to the brioche? 'You've buttered me up so much, will you marry me?' 💍"
    ];
    reply = jokes[Math.floor(Math.random() * jokes.length)];
    quickActions = ["Tell Another Joke", "Show Active Coupons", "View Bestseller Cakes"];
    return { reply, quickActions };
  }

  // 21. TRULY FLEXIBLE, CHARISMATIC CULINARY CONCIERGE FALLBACK (ZERO RANDOM PRODUCT DUMPING!)
  reply = `Bonjour! 👨‍🍳 I'm **Chef Pierre**, your Master Baker & AI Culinary Concierge.\n\n` +
    `I understand you're asking about "${message.trim()}". To ensure you get the exact help you need for your shop or bakery experience:\n\n` +
    `• 👤 **Your Role & Permissions**: Ask "What is my role?" to see your operational privileges\n` +
    `• 🎂 **Bestsellers & Custom Cakes**: Ask about our 3D Studio, Belgian Chocolate Truffle, or Red Velvet\n` +
    `• 🎈 **Kids Collections**: Ask about KitKat Carnival Cake, Pinata Smash cakes, or Sweet Corn Puffs\n` +
    `• 🛎️ **Customer Support**: We operate 7 AM – 11 PM daily with direct phone helpline (+91 98401 23456)\n` +
    `• 🎁 **Active Coupons**: Code **SWEET15** (15% off) & **BAKE50** (flat ₹50 off)\n` +
    `• 🚚 **Delivery & Cities**: 2-hour express delivery in 7 major city hubs & midnight deliveries\n` +
    `• 🔍 **Baking Science**: Ask me for substitutions (eggs/butter) or troubleshooting sinking cakes\n\n` +
    (isStaff ? `📊 As verified staff, you can also ask for **Live Sales Reports**, **Stock Levels**, or **Recipe Scalers**!\n\n` : "") +
    `How may I best guide you right now?`;

  quickActions = isStaff
    ? ["Check My Role & Permissions", "Category Sales Breakdown", "Check Kitchen Stock Report", "AI Demand Forecast"]
    : ["What is My Role?", "View Bestseller Cakes", "Show Active Coupons (SWEET15)", "Design Custom 3D Cake"];

  return { reply, quickActions, navigateTo };
};

// ==========================================
// 7. OpenAI & Chef Pierre Real-Time Streaming
// ==========================================

const buildChefPierreSystemPrompt = (role, userName) => {
  return `You are Chef Pierre, the charismatic French Master Baker, Executive Culinary Concierge, and AI Assistant for "BakeSphere" — Chennai's premier artisanal European patisserie, cloud bakery, and kitchen ERP platform.
Current User Context:
- User Name: "${userName || "Guest"}"
- Active Role: "${role || "customer"}"

BakeSphere Menu & Bakery Data:
- Signature Cakes: Belgian Chocolate Truffle Cake (₹699), Red Velvet Fresh Cream Cake (₹749), Dutch Truffle Pinata Hammer Cake (₹1,299), Biscoff Lotus Baked Cheesecake (₹899).
- Breads & Viennoiserie: San Francisco Style Sourdough Boule (₹180), Classic French Butter Croissant (₹120), Wild Mountain Blueberry Danish (₹145).
- Savories: Paneer Makhani Puff (₹65), Gourmet Veg Samosa Trio (₹60), Herb Mushroom Croissant Sandwich (₹140).
- Beverages: Kulhad Masala Chai Flask (₹79), Belgian Dark Hot Chocolate (₹130).
- Special Features: 3D Custom Cake Studio with interactive 3D preview, Dynamic Recipe Scaler for production batching, FEFO Inventory Expiry alerts, POS Billing with thermal receipts.
- Active Discounts: Coupon code "SWEET15" grants 15% discount on all bakery orders.
- Chennai Delivery: 2-hour express door delivery across Chennai (T. Nagar, Anna Nagar, Adyar, Velachery, OMR).
- Kitchen Hours: 07:00 AM – 11:30 PM IST daily.

Persona & Output Guidelines:
- Tone: Warm, charming, with authentic French baking touches ("Bonjour!", "Magnifique!", "À bientôt!", "Bon appétit!").
- Formatting: Format responses with clear Markdown bolding, emojis, and bullet points. Keep replies concise and easy to read.
- Role Safeguards: If the user is a customer, do not reveal internal admin secrets. If user is staff (super_admin, bakery_owner, manager, baker, cashier), assist them with ERP operations, sales metrics, and recipes.`;
};

// Stream local semantic response token-by-token (typewriter SSE)
const streamLocalSemanticResponse = async (message, role, userName, res) => {
  const localResult = generateFlexibleLocalResponse(message, role, userName);
  const fullText = localResult.reply || "Bonjour! How may I assist your bakery journey today?";

  // Send metadata (quick actions, navigation)
  res.write(
    `data: ${JSON.stringify({
      metadata: {
        quickActions: localResult.quickActions || [],
        navigateTo: localResult.navigateTo || null,
        source: "local-semantic"
      }
    })}\n\n`
  );

  // Split into token chunks (words and whitespace) for natural typing rhythm
  const tokens = fullText.match(/\S+|\s+/g) || [fullText];
  for (let i = 0; i < tokens.length; i++) {
    res.write(
      `data: ${JSON.stringify({
        chunk: tokens[i],
        source: "local-semantic"
      })}\n\n`
    );
    // 16ms delay creates a silky smooth ~60fps typewriter stream
    await new Promise((resolve) => setTimeout(resolve, 16));
  }

  res.write(`data: ${JSON.stringify({ done: true, source: "local-semantic" })}\n\n`);
  res.write("data: [DONE]\n\n");
  res.end();
};

// Stream Google Gemini AI live in real-time via Server-Sent Events (SSE)
const streamGeminiResponse = async (message, role, userName, history, res) => {
  const geminiApiKey = process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.trim() : "";
  const model = process.env.GEMINI_MODEL || "gemini-1.5-flash";
  const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?alt=sse&key=${geminiApiKey}`;

  const contents = [];
  if (Array.isArray(history) && history.length > 0) {
    for (const h of history.slice(-6)) {
      if (h.text && h.text.trim()) {
        contents.push({
          role: h.sender === "user" ? "user" : "model",
          parts: [{ text: h.text }]
        });
      }
    }
  }
  contents.push({
    role: "user",
    parts: [{ text: message }]
  });

  const payload = {
    system_instruction: {
      parts: [{ text: buildChefPierreSystemPrompt(role, userName) }]
    },
    contents,
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 800
    }
  };

  const geminiRes = await fetch(geminiUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  if (!geminiRes.ok) {
    const errorText = await geminiRes.text();
    throw new Error(`Gemini API HTTP ${geminiRes.status}: ${errorText}`);
  }

  const reader = geminiRes.body.getReader();
  const decoder = new TextDecoder("utf-8");
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() || "";

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || !trimmed.startsWith("data:")) continue;
      const jsonStr = trimmed.replace(/^data:\s*/, "");
      if (jsonStr === "[DONE]") break;

      try {
        const parsed = JSON.parse(jsonStr);
        const textChunk = parsed.candidates?.[0]?.content?.parts?.[0]?.text;
        if (textChunk) {
          res.write(
            `data: ${JSON.stringify({
              chunk: textChunk,
              source: "gemini"
            })}\n\n`
          );
        }
      } catch (_e) {
        // Skip unparseable delta
      }
    }
  }

  res.write(`data: ${JSON.stringify({ done: true, source: "gemini" })}\n\n`);
  res.write("data: [DONE]\n\n");
  res.end();
};

// Real-Time Streaming Chatbot Route (Server-Sent Events / SSE)
router.post("/chatbot/stream", async (req, res) => {
  const { message, role = "customer", userName = "Guest", history = [] } = req.body;
  if (!message || !message.trim()) {
    return res.status(400).json({ error: "Message is required" });
  }

  // Set SSE streaming headers
  res.setHeader("Content-Type", "text/event-stream; charset=utf-8");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("Connection", "keep-alive");
  if (typeof res.flushHeaders === "function") {
    res.flushHeaders();
  }

  const geminiKey = process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.trim() : "";
  const openAiKey = process.env.OPENAI_API_KEY ? process.env.OPENAI_API_KEY.trim() : "";

  // 1. Google Gemini AI Key configured (Priority)
  if (geminiKey) {
    try {
      await streamGeminiResponse(message, role, userName, history, res);
      return;
    } catch (err) {
      console.warn("Google Gemini stream error, checking backup providers:", err.message);
    }
  }

  // 2. OpenAI Key configured (Secondary)
  if (openAiKey && openAiKey.startsWith("sk-")) {
    try {
      const messages = [
        { role: "system", content: buildChefPierreSystemPrompt(role, userName) },
        ...history.slice(-6).map((h) => ({
          role: h.sender === "user" ? "user" : "assistant",
          content: h.text
        })),
        { role: "user", content: message }
      ];

      const model = process.env.OPENAI_MODEL || "gpt-4o-mini";
      const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${openAiKey}`
        },
        body: JSON.stringify({
          model,
          messages,
          stream: true,
          temperature: 0.7,
          max_tokens: 650
        })
      });

      if (openaiRes.ok) {
        const reader = openaiRes.body.getReader();
        const decoder = new TextDecoder("utf-8");
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed || !trimmed.startsWith("data:")) continue;
            const dataStr = trimmed.replace(/^data:\s*/, "");
            if (dataStr === "[DONE]") {
              res.write(`data: ${JSON.stringify({ done: true, source: "openai" })}\n\n`);
              continue;
            }
            try {
              const parsed = JSON.parse(dataStr);
              const content = parsed.choices?.[0]?.delta?.content;
              if (content) {
                res.write(
                  `data: ${JSON.stringify({
                    chunk: content,
                    source: "openai"
                  })}\n\n`
                );
              }
            } catch (_e) {}
          }
        }

        res.write("data: [DONE]\n\n");
        return res.end();
      }
    } catch (err) {
      console.warn("OpenAI streaming exception:", err.message);
    }
  }

  // 3. Resilient Local Semantic Real-Time Stream (Zero downtime fallback)
  await streamLocalSemanticResponse(message, role, userName, res);
});

// Standard non-streaming JSON route (Backward Compatibility)
router.post("/chatbot", async (req, res) => {
  const { message, role = "customer", userName = "Guest" } = req.body;
  if (!message || !message.trim()) {
    return res.status(400).json({ error: "Message is required" });
  }

  const geminiKey = process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.trim() : "";
  const openAiKey = process.env.OPENAI_API_KEY ? process.env.OPENAI_API_KEY.trim() : "";

  // 1. Google Gemini non-streaming
  if (geminiKey) {
    try {
      const model = process.env.GEMINI_MODEL || "gemini-1.5-flash";
      const geminiRes = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            system_instruction: {
              parts: [{ text: buildChefPierreSystemPrompt(role, userName) }]
            },
            contents: [{ role: "user", parts: [{ text: message }] }],
            generationConfig: { temperature: 0.7, maxOutputTokens: 800 }
          })
        }
      );

      if (geminiRes.ok) {
        const data = await geminiRes.json();
        const reply = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (reply) {
          return res.json({
            reply,
            quickActions: ["Active Coupons", "Bestseller Cakes", "Design 3D Cake"],
            source: "gemini",
            timestamp: new Date().toISOString()
          });
        }
      }
    } catch (err) {
      console.warn("Google Gemini JSON call error:", err.message);
    }
  }

  // 2. OpenAI non-streaming
  if (openAiKey && openAiKey.startsWith("sk-")) {
    try {
      const model = process.env.OPENAI_MODEL || "gpt-4o-mini";
      const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${openAiKey}`
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: "system", content: buildChefPierreSystemPrompt(role, userName) },
            { role: "user", content: message }
          ],
          temperature: 0.7,
          max_tokens: 650
        })
      });

      if (openaiRes.ok) {
        const data = await openaiRes.json();
        const reply = data.choices?.[0]?.message?.content;
        if (reply) {
          return res.json({
            reply,
            quickActions: ["Active Coupons", "Bestseller Cakes", "Design 3D Cake"],
            source: "openai",
            timestamp: new Date().toISOString()
          });
        }
      }
    } catch (err) {
      console.warn("OpenAI JSON call error:", err.message);
    }
  }

  // 3. Fallback to Local Semantic Engine
  const localResult = generateFlexibleLocalResponse(message, role, userName);
  return res.json({
    reply: localResult.reply,
    quickActions: localResult.quickActions,
    navigateTo: localResult.navigateTo,
    source: "local-semantic",
    timestamp: new Date().toISOString()
  });
});

export default router;

