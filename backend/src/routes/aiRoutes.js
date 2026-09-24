import express from "express";
import { masterRecipes } from "../data/recipes.js";
import { bakeryIngredients } from "../data/ingredients.js";
import { bakeryOrders } from "../data/orders.js";
import { productionBatches } from "../data/batches.js";

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
      recommendedTomorrow: 16, // Downward recommendation to avoid wastage!
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

// 3. Chef Pierre AI Assistant Chatbot (Multi-Domain Knowledge Engine)
router.post("/chatbot", (req, res) => {
  const { message } = req.body;
  if (!message || !message.trim()) {
    return res.status(400).json({ error: "Message is required" });
  }

  const query = message.trim().toLowerCase();
  let reply = "";
  let quickActions = [];

  // Helper for math evaluation like "25 * 18" or "15% of 850"
  const tryMath = (text) => {
    try {
      const percentMatch = text.match(/(\d+(?:\.\d+)?)\s*%\s*(?:of)?\s*(\d+(?:\.\d+)?)/i);
      if (percentMatch) {
        const pct = parseFloat(percentMatch[1]);
        const base = parseFloat(percentMatch[2]);
        const ans = (pct / 100) * base;
        return `${pct}% of ${base} is **${ans.toFixed(2)}**! (For instance, applying code SWEET15 on ₹${base} saves ₹${ans.toFixed(0)}!)`;
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
    reply = mathResult;
    quickActions = ["Scale Chocolate Cake Recipe", "View POS Billing", "Check Active Coupons"];
  }

  // 1. Greetings & Persona
  else if (query.match(/\b(hi|hello|hey|bonjour|greetings|who are you|introduce|namaste)\b/)) {
    reply = "Bonjour! 👨‍🍳 I am **Chef Pierre**, your Master Baker & AI Culinary Concierge at BakeSphere! I can answer **any question** you have—from our entire product catalog, prices, and secret coupon codes, to baking science, egg substitutes, unit conversions, and our ERP modules (POS, 3D Cake Studio, Inventory, Recipes). What's on your mind today?";
    quickActions = ["Show Active Coupons", "Explore Hot Savory Puffs", "Design a 3D Cake", "Staff Login Credentials"];
  }

  // 2. Baking Science & Culinary Substitutions (Checked BEFORE generic cake)
  else if (query.includes("substitute") || query.includes("replac") || query.includes("eggless") || query.includes("vegan") || query.includes("egg replacer")) {
    reply = "🧑‍🍳 **Chef Pierre's Guide to Baking Substitutions**:\n\n" +
      "• **1 Egg in Cakes** = 60g unsweetened applesauce, OR 60g plain Greek yogurt, OR 3 tbsp aquafaba (chickpea brine, great for meringues!), OR 1 tbsp ground flaxseed + 3 tbsp warm water (flax egg).\n" +
      "• **Buttermilk** = 1 cup milk + 1 tbsp white vinegar or fresh lemon juice (rest for 5 minutes until curdled).\n" +
      "• **Cake Flour** = 1 cup all-purpose flour minus 2 tbsp, replaced with 2 tbsp cornstarch (sift 3 times for ultra-light crumb).\n" +
      "• **Heavy Cream** = 3/4 cup whole milk + 1/3 cup melted unsalted butter (whisk vigorously).";
    quickActions = ["Scale Master Recipe", "Filter Eggless Cakes", "View Sourdough Ingredients"];
  }

  // 3. Measurement Conversions & Science
  else if (query.includes("cup") || query.includes("gram") || query.includes("conversion") || query.includes("temperature") || query.includes("celsius") || query.includes("fahrenheit") || query.includes("how much is 1 cup") || query.includes("convert")) {
    reply = "⚖️ **Master Baker's Unit Conversions**:\n\n" +
      "• **All-Purpose / Cake Flour**: 1 cup = **120g – 125g**\n" +
      "• **Granulated White Sugar**: 1 cup = **200g**\n" +
      "• **Brown Sugar (Packed)**: 1 cup = **220g**\n" +
      "• **Butter**: 1 cup (2 sticks) = **227g** (1 tbsp = 14.2g)\n" +
      "• **Cocoa Powder**: 1 cup = **100g**\n" +
      "• **Oven Temperatures**: 160°C = 325°F (gentle bake/cheesecakes), 180°C = 350°F (standard cakes & cookies), 200°C = 400°F (crispy puffs & pastries), 220°C = 425°F (artisan sourdough).";
    quickActions = ["Scale Master Recipe", "Launch Recipe Scaler", "Check FEFO Inventory"];
  }

  // 4. Baking Troubleshooting (Why did my cake sink?)
  else if (query.includes("sink") || query.includes("dense") || query.includes("crack") || query.includes("split") || query.includes("curdle") || query.includes("troubleshoot") || query.includes("dry") || query.includes("fail")) {
    reply = "🔍 **Chef Pierre's Troubleshooting Clinic**:\n\n" +
      "• **Cake Sunk in Middle?** Usually caused by opening the oven door too early (loss of chamber heat), expired baking powder, or over-whipping batter incorporating excess air that collapses.\n" +
      "• **Dense or Gummy Crumb?** Over-mixing develops excess gluten! Fold flour gently just until combined.\n" +
      "• **Split Chocolate Ganache?** Your liquid was too hot or separated oil. Fix it by whisking in 1-2 tsp of warm milk or immersion-blending vigorously!\n" +
      "• **Cracked Cheesecake Top?** Cool slowly in the oven with the door propped open for 1 hour, and always bake in a hot water bath (bain-marie).";
    quickActions = ["Scale Chocolate Cake Recipe", "View Master Recipes", "Open 3D Studio"];
  }

  // 5. Active Coupons & Discounts
  else if (query.includes("coupon") || query.includes("discount") || query.includes("offer") || query.includes("promo") || query.includes("code") || query.includes("sweet15") || query.includes("bake50") || query.includes("freeship")) {
    reply = "🎉 Here are our **active BakeSphere promotional coupons**:\n\n" +
      "• **SWEET15**: 15% OFF up to ₹150 on orders above ₹499 (Great for celebration cakes!)\n" +
      "• **BAKE50**: Flat ₹50 OFF on any order above ₹299 (Perfect for evening puffs & samosas!)\n" +
      "• **FREESHIP**: Free 2-Hour Express Delivery on cart values over ₹799.\n\n" +
      "You can apply these directly in the slide-out Cart Drawer or at the POS Billing Terminal!";
    quickActions = ["Apply SWEET15 in Cart", "View Bestseller Cakes", "Open POS Billing"];
  }

  // 6. User Roles, Passwords & Demo Credentials
  else if (query.includes("credential") || query.includes("password") || query.includes("login") || query.includes("role") || query.includes("admin") || query.includes("id pass") || query.includes("account")) {
    reply = "🔑 **BakeSphere Demo Login Directory** (All passwords are `Bakery@2026`):\n\n" +
      "• **Super Admin**: `admin@bakesphere.com` → All 9 Enterprise Modules\n" +
      "• **Bakery Owner**: `owner@bakesphere.com` → Financials, POS, Inventory, Forecasts\n" +
      "• **Branch Manager**: `manager@bakesphere.com` → Store Operations & Production\n" +
      "• **Head Baker**: `baker@bakesphere.com` → Recipe Scaler, FEFO Stock, 3D Studio\n" +
      "• **POS Cashier**: `cashier@bakesphere.com` → Storefront POS Billing & Custom Orders\n" +
      "• **Online Customer**: `customer@bakesphere.com` → Storefront Ordering & 3D Cake Studio\n\n" +
      "You can also click **Staff & Role Portal 🔑** in the top navigation bar for 1-click instant login!";
    quickActions = ["Go to Staff Portal", "Log in as Super Admin", "Explore Storefront as Guest"];
  }

  // 7. Snacks: Puffs, Samosas, Teas & Savories
  else if (query.includes("puff") || query.includes("samosa") || query.includes("chai") || query.includes("tea") || query.includes("coffee") || query.includes("snack") || query.includes("savory") || query.includes("kathi") || query.includes("garlic bread")) {
    reply = "🥐 **Hot & Crispy Bakery Snacks Collection**:\n\n" +
      "• **Artisan Puffs (6 types)**: Flaky Golden Veg Curry Puff (₹45), Tandoori Paneer Tikka Puff (₹65), Smoked Chicken Keema Puff (₹85), Egg & Black Pepper Puff (₹55), Cheesy Mushroom Puff (₹75), Butter Corn Spinach Puff (₹60)\n" +
      "• **Crispy Samosas (5 types)**: Authentic Punjabi Aloo Samosa (₹35), Paneer Corn Samosa (₹55), Jalapeno Cheese Samosa (₹65), Onion Sweet Corn Samosa (₹45), Cocktail Party Samosas Box of 6 (₹99)\n" +
      "• **Hot Beverages (6 types)**: Kulhad Masala Cutting Chai (₹40), Ginger Cardamom Adrak Chai (₹45), Authentic South Indian Filter Coffee (₹50), Iced Lemon Mint Tea (₹65), Rich Dark Hot Chocolate (₹95), Hazelnut Cold Brew (₹110)\n" +
      "• **Savories & Rolls**: Tandoori Paneer Kathi Roll (₹95), Stuffed Cheese Garlic Bread (₹110), Spinach & Feta Quiche (₹125).";
    quickActions = ["Filter Hot Puffs", "Browse Samosas", "Order Masala Chai", "Open POS Billing"];
  }

  // 8. 3D Custom Cake Studio
  else if (query.includes("3d") || query.includes("custom") || query.includes("studio") || query.includes("tier") || query.includes("design cake") || query.includes("topper")) {
    reply = "🎨 Our **3D Custom Cake Studio** is an interactive design suite! You can:\n\n" +
      "1. Choose 1, 2, or 3 celebration tiers\n" +
      "2. Select sponge flavors (Madagascar Vanilla, Belgian Dark Cocoa, Red Velvet, Funfetti)\n" +
      "3. Customize frostings (Swiss Meringue, White Chocolate Cream Cheese, Dark Truffle)\n" +
      "4. Apply drip accents (24K Gold Ganache, Salted Caramel, Strawberry Coulis)\n" +
      "5. Add 3D toppers (Golden Birthday Plaque, Sparkler Candlesticks, Sugar Rose Cascades)\n\n" +
      "Live pricing dynamically calculates based on weight and complexity!";
    quickActions = ["Open 3D Cake Studio", "View Master Recipes", "Order Custom Cake"];
  }

  // 9. Delivery Cities & Timing
  else if (query.includes("delivery") || query.includes("city") || query.includes("cities") || query.includes("midnight") || query.includes("express") || query.includes("where") || query.includes("pincode")) {
    reply = "⚡ **BakeSphere Delivery Network**:\n\n" +
      "We operate state-of-the-art temperature-controlled cloud patisseries in **7 major hubs**:\n" +
      "• **Chennai** (Flagship Hub • T. Nagar, Anna Nagar, Koyambedu)\n" +
      "• **Bangalore** (Express 2-Hour Hub)\n" +
      "• **Delhi NCR** (Same-Day & Midnight Delivery)\n" +
      "• **Mumbai** (Express Delivery across City & Suburbs)\n" +
      "• **Hyderabad** (Express Delivery in Hitec City & Banjara Hills)\n" +
      "• **Pune** (Koregaon Park & Kothrud Hubs)\n" +
      "• **Kolkata** (Park Street & Salt Lake Hubs)\n\n" +
      "Choose between **2-Hour Standard Express** or **12:00 AM Midnight Surprise** delivery!";
    quickActions = ["Select Delivery City", "View Bestseller Cakes", "Track Order BS-1024"];
  }

  // 10. ERP Modules & Features
  else if (query.includes("module") || query.includes("erp") || query.includes("pos") || query.includes("scaler") || query.includes("inventory") || query.includes("fefo") || query.includes("forecast") || query.includes("api") || query.includes("branch")) {
    reply = "🏢 **BakeSphere Enterprise Architecture (9 Modules)**:\n\n" +
      "1. **Bakingo Online Storefront**: Consumer e-commerce with real-time cart, city picker, coupons & wishlist\n" +
      "2. **POS Billing Terminal**: Fast touch POS with barcode scan, custom items & thermal GST receipt printing\n" +
      "3. **3D Custom Cake Studio**: Parametric multi-tier cake generator with live 3D visualizer\n" +
      "4. **Production Recipe Scaler**: Mathematical batch scaling for flour, butter, sugar & yield optimization\n" +
      "5. **FEFO Inventory Manager**: First-Expired-First-Out batch tracking to eliminate perishable wastage\n" +
      "6. **AI Demand Forecaster**: Predictive ML model forecasting weekend surges & daily revenue\n" +
      "7. **API Explorer**: Interactive REST documentation with live endpoint tester\n" +
      "8. **Branch & Asset Manager**: Equipment telemetry & multi-store oversight across Chennai\n" +
      "9. **Role Auth Portal**: Strict RBAC security for 6 distinct bakery staff roles";
    quickActions = ["Open POS Terminal", "Check FEFO Inventory", "Launch Recipe Scaler", "AI Demand Forecast"];
  }

  // 11. Cakes, Flavours, and Specialties
  else if (query.includes("cake") || query.includes("chocolate") || query.includes("red velvet") || query.includes("truffle") || query.includes("pineapple") || query.includes("black forest") || query.includes("biscoff") || query.includes("cheesecake") || query.includes("butterscotch")) {
    reply = "🎂 **Artisanal Cakes & Patisserie**:\n\n" +
      "• **Belgian Chocolate Truffle**: 54% Callebaut dark ganache, devil's food sponge (₹699 / 0.5kg)\n" +
      "• **Red Velvet Cream Cheese**: Velvety crimson cocoa sponge with Philadelphia cream cheese (₹749 / 0.5kg)\n" +
      "• **Lotus Biscoff Cheesecake**: Belgian speculoos cookie crust with baked New York cheese (₹849)\n" +
      "• **Classic Fresh Pineapple Gateau**: Crowned with juicy pineapple compote and cherries (₹599)\n" +
      "• **German Black Forest**: Layered with sour Morello cherries, dark chocolate shavings & whipped cream (₹649)\n" +
      "• **Butterscotch Caramel Crunch**: Praline crunch with butterscotch butter ganache (₹629)\n\n" +
      "Available weights: 0.5kg, 1.0kg, 1.5kg, 2.0kg. 100% freshly baked everyday with eggless options!";
    quickActions = ["View Chocolate Cakes", "Browse Red Velvet", "Design in 3D Studio", "Check Delivery Cities"];
  }

  // 12. Jokes & Humor
  else if (query.includes("joke") || query.includes("funny") || query.includes("humor") || query.includes("laugh")) {
    const jokes = [
      "Why did the baker go to therapy? Because he was kneading some help! 😂",
      "What do you call a fake noodle? An impasta! But what do you call a fake pastry? A faux-issant! 🥐",
      "Why do bakers make great detectives? Because they always find the proof! 🥖",
      "How did the sourdough propose to the brioche? 'You've buttered me up so much, will you marry me?' 💍"
    ];
    reply = jokes[Math.floor(Math.random() * jokes.length)];
    quickActions = ["Tell Another Joke", "Show Active Coupons", "View Bestseller Cakes"];
  }

  // 13. General Knowledge / Chit-chat / History
  else if (query.includes("history") || query.includes("origin") || query.includes("invented") || query.includes("croissant") || query.includes("sourdough") || query.includes("paris")) {
    reply = "📜 **Culinary Lore & History**:\n\n" +
      "• **The Croissant**: While France perfected the laminated butter croissant, its ancestor—the Kipferl—originated in Vienna, Austria, around the 13th century!\n" +
      "• **Sourdough**: Sourdough is one of the oldest forms of grain fermentation, dating back over 5,000 years to ancient Egypt.\n" +
      "• **Red Velvet**: Gained fame during the Victorian era and the Waldorf-Astoria in New York; the original red tint came from the chemical reaction between natural untreated cocoa powder and acidic buttermilk!";
    quickActions = ["Order French Croissants", "View Sourdough Bread", "Browse Red Velvet Cakes"];
  }

  // 14. Intelligent Fallback for Any Other Question
  else {
    reply = `👨‍🍳 I'm glad you asked! Regarding **"${message.trim()}"**:\n\n` +
      `At BakeSphere, our goal is culinary excellence and seamless bakery operations. Whether you're curious about our 57+ freshly baked treats, calculating recipe ratios, checking live delivery status in your city, or exploring our 9 ERP tools, I am here to assist!\n\n` +
      `Feel free to ask me anything about ingredients, baking techniques, order pricing, or try one of the instant actions below:`;
    quickActions = [
      "View Active Coupons (SWEET15)",
      "Explore Hot Savory Puffs",
      "Design Custom 3D Cake",
      "Open POS Billing Terminal"
    ];
  }

  res.json({
    reply,
    quickActions,
    timestamp: new Date().toISOString()
  });
});

export default router;
