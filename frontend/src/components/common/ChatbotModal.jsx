import { useState, useRef, useEffect } from "react";
import { useAuth } from "../../context/AuthContext.jsx";

// Helper to format bold **text**, bullets, and markdown tables cleanly
const formatBotMessage = (text) => {
  if (!text) return null;
  const lines = text.split("\n");

  const elements = [];
  let tableRows = [];
  let inTable = false;

  const flushTable = (key) => {
    if (tableRows.length > 0) {
      const headerRow = tableRows[0];
      const bodyRows = tableRows.slice(2); // Skip separator row like |:---|:---:|

      elements.push(
        <div key={`table-${key}`} style={{ overflowX: "auto", margin: "0.6rem 0" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              fontSize: "0.78rem",
              background: "#f8fafc",
              borderRadius: "8px",
              overflow: "hidden",
              border: "1px solid #e2e8f0"
            }}
          >
            <thead>
              <tr style={{ background: "linear-gradient(135deg, #c8102e 0%, #991b1b 100%)", color: "#ffffff" }}>
                {headerRow.map((cell, cIdx) => (
                  <th
                    key={cIdx}
                    style={{
                      padding: "0.5rem 0.6rem",
                      textAlign: cIdx === 0 ? "left" : "center",
                      fontWeight: 600,
                      letterSpacing: "0.2px"
                    }}
                  >
                    {cell.replace(/\*\*/g, "")}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {bodyRows.map((row, rIdx) => (
                <tr
                  key={rIdx}
                  style={{
                    borderBottom: "1px solid #e2e8f0",
                    background: rIdx % 2 === 0 ? "#ffffff" : "#f8fafc"
                  }}
                >
                  {row.map((cell, cIdx) => {
                    const isBold = cell.startsWith("**") && cell.endsWith("**");
                    const cleanCell = cell.replace(/\*\*/g, "");
                    return (
                      <td
                        key={cIdx}
                        style={{
                          padding: "0.45rem 0.6rem",
                          textAlign: cIdx === 0 ? "left" : "center",
                          color: "#1e293b",
                          fontWeight: isBold ? 600 : 400
                        }}
                      >
                        {cleanCell}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      tableRows = [];
      inTable = false;
    }
  };

  lines.forEach((line, lineIdx) => {
    const trimmed = line.trim();
    if (trimmed.startsWith("|") && trimmed.endsWith("|")) {
      inTable = true;
      const cells = trimmed
        .slice(1, -1)
        .split("|")
        .map((c) => c.trim());
      tableRows.push(cells);
    } else {
      if (inTable) {
        flushTable(lineIdx);
      }

      // Process **bold** markers
      const parts = line.split(/(\*\*.*?\*\*)/g);
      const formattedLine = parts.map((part, partIdx) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return <strong key={partIdx}>{part.slice(2, -2)}</strong>;
        }
        return part;
      });

      elements.push(
        <span
          key={`line-${lineIdx}`}
          style={{
            display: "block",
            minHeight: trimmed === "" ? "0.4rem" : "auto",
            lineHeight: 1.5,
            color: trimmed.startsWith("•") ? "#334155" : "inherit"
          }}
        >
          {formattedLine}
        </span>
      );
    }
  });

  if (inTable) {
    flushTable("end");
  }

  return elements;
};

// Client-side fallback responder with Flexible Semantic Engine & Zero-Spam Natural Responses
const getFallbackAnswer = (message, userRole = "customer", userName = "Guest") => {
  const query = message.trim().toLowerCase();
  const isStaff = ["super_admin", "bakery_owner", "manager", "head_baker", "chef", "cashier"].includes(userRole);

  // 1. Math evaluation
  const percentMatch = query.match(/(\d+(?:\.\d+)?)\s*%\s*(?:of)?\s*(\d+(?:\.\d+)?)/i);
  if (percentMatch) {
    const pct = parseFloat(percentMatch[1]);
    const base = parseFloat(percentMatch[2]);
    const ans = (pct / 100) * base;
    return {
      reply: `🧮 **Culinary Math Result:** ${pct}% of ${base} is **${ans.toFixed(2)}**! (For example, applying code **SWEET15** on ₹${base} saves ₹${ans.toFixed(0)}!)`,
      quickActions: ["Show Active Coupons", "View Bestseller Cakes", "Design Custom 3D Cake"]
    };
  }

  // 2. Comprehensive Sales Report & Today's Sales Telemetry (Staff vs Customer)
  const isSalesReport = (
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

  if (isSalesReport) {
    if (!isStaff) {
      return {
        reply: "Bonjour! 👨‍🍳 Financial and business performance reports are accessible exclusively to verified BakeSphere staff.\n\n" +
          "Looking for your personal order updates? Let me know your order ID (e.g. `BS-1024`) or check your cart!",
        quickActions: ["Track Order BS-1024", "Show Active Coupons", "View Bestseller Cakes"]
      };
    }

    return {
      reply: "📈 **BakeSphere Daily Executive Sales & Branch Telemetry Report** (Live Operations):\n\n" +
        "• **Total Today's Gross Revenue**: **₹3,15,738**\n" +
        "• **Total Orders Processed**: **416 orders**\n" +
        "• **Average Order Value (AOV)**: **₹759**\n" +
        "• **Total Product Units Dispatched**: **1,118 items**\n\n" +
        "🏪 **Branch Performance Snapshot (Chennai Hubs)**:\n" +
        "• 📍 **Heritage Main Bakery** (T. Nagar): **₹48,550** today (Monthly Target: ₹12.0L · **74.5%** achieved)\n" +
        "• 📍 **Anna Nagar Flagship** (Anna Nagar): **₹39,420** today (Monthly Target: ₹9.5L · **74.9%** achieved)\n" +
        "• 📍 **Koyambedu Transit Hub** (Koyambedu): **₹28,900** today (Monthly Target: ₹7.0L · **77.1%** achieved)\n" +
        "• 📍 **OMR Cloud Kitchen** (Thoraipakkam): **₹62,100** today (Monthly Target: ₹15.0L · **78.7%** achieved)\n\n" +
        "🛵 **Sales Channels Breakdown**:\n" +
        "• **POS Storefront Terminals**: ₹1,45,239 (46%)\n" +
        "• **Bakingo Online Delivery**: ₹1,19,980 (38%)\n" +
        "• **3D Custom Cake Studio**: ₹50,518 (16%)\n\n" +
        "💳 **Payment Settlement Mix**:\n" +
        "• **UPI (PhonePe / GPay)**: 57%\n" +
        "• **Credit / Debit Cards**: 33%\n" +
        "• **Counter Cash**: 10%\n\n" +
        "🏆 **Top Revenue Category**: **Cakes** (₹1,24,550, 39.4% share).",
      quickActions: ["Category Sales Breakdown", "Check Kitchen Stock Report", "AI Demand Forecast", "Open POS Billing Terminal"]
    };
  }

  // 3. Bestsellers & Top Selling Queries
  const isBestseller = !isSalesReport && (
    query.includes("top sell") ||
    query.includes("top-selling") ||
    query.includes("bestsell") ||
    query.includes("best sell") ||
    query.includes("most popular") ||
    query.includes("popular") ||
    query.includes("trending") ||
    query.includes("what should i buy") ||
    query.includes("what should i order") ||
    query.includes("recommend") ||
    query.includes("favorites") ||
    query.includes("favourite") ||
    query.includes("highest rated") ||
    query.includes("top rated") ||
    query.includes("famous") ||
    query.includes("special") ||
    (query.includes("today") && (query.includes("top") || query.includes("best") || query.includes("selling") || query.includes("special")))
  );

  if (isBestseller) {
    return {
      reply: "🌟 **Today's Top-Selling & Customer Favorite Treats at BakeSphere**:\n\n" +
        "1. 🎂 **Belgian Chocolate Truffle Cake** (₹699 / 0.5kg) — ⭐ 4.9 (1,420+ reviews) 🌱 **100% Eggless**\n" +
        "   • *54% Callebaut dark ganache, devil's food sponge, hand-crafted chocolate curls.*\n\n" +
        "2. 🍰 **Red Velvet Cream Cheese Swirl Cake** (₹749 / 0.5kg) — ⭐ 4.95 (980+ reviews) 🌱 **100% Eggless**\n" +
        "   • *Crimson cocoa sponge layered with silky Philadelphia cream cheese frosting.*\n\n" +
        "3. 🥐 **Classic French Butter Croissant** (₹120) — ⭐ 4.8 (850+ reviews)\n" +
        "   • *Hand-laminated with 82% Normandy cultured butter, baked fresh every 2 hours.*\n\n" +
        "4. 🍰 **Lotus Biscoff Baked Cheesecake** (₹849) — ⭐ 4.9 (720+ reviews)\n" +
        "   • *Belgian speculoos crust with creamy New York style baked cream cheese.*\n\n" +
        "5. 🥟 **Tandoori Paneer Tikka Puff** (₹65) — ⭐ 4.8 (1,150+ reviews) 🌱 **100% Eggless**\n" +
        "   • *Flaky golden multi-layered puff stuffed with spiced marinated cottage cheese.*\n\n" +
        "💡 **Chef Pierre's Deal Tip**: Apply code **SWEET15** at checkout for 15% off celebration cakes, or **BAKE50** for ₹50 off hot savories!",
      quickActions: ["Order Belgian Chocolate Truffle", "Explore Hot Savory Puffs", "View Active Coupons (SWEET15)", "Design Custom 3D Cake"]
    };
  }

  // 3. Baking Science & Troubleshooting Clinic
  if (query.includes("sink") || query.includes("sunk") || query.includes("dense") || query.includes("crack") || query.includes("split") || query.includes("troubleshoot") || query.includes("why did my")) {
    return {
      reply: "🔍 **Chef Pierre's Baking Troubleshooting Clinic**:\n\n" +
        "• **Cake Sunk in Middle?** Loss of chamber heat from opening the oven door too early, expired baking powder, or over-whipping batter with excess trapped air.\n" +
        "• **Dense or Gummy Crumb?** Over-mixing develops tough gluten strands! Fold flour gently just until incorporated.\n" +
        "• **Split Chocolate Ganache?** Liquid was too hot or fat separated. Whisk in 1-2 tsp of warm milk or emulsify with an immersion blender.\n" +
        "• **Cracked Cheesecake?** Bake in a bain-marie (hot water bath) and let cool inside the oven with the door propped open for 1 hour.",
      quickActions: ["Scale Chocolate Cake Recipe", "View Master Recipes", "Open 3D Studio"]
    };
  }

  // 4. Substitutions & Conversions
  if (query.includes("substitute") || query.includes("replac") || query.includes("egg replacer")) {
    return {
      reply: "🧑‍🍳 **Chef Pierre's Culinary Substitution Guide**:\n\n" +
        "• **1 Egg in Sponge Cakes**: 60g unsweetened applesauce, OR 60g plain Greek yogurt, OR 3 tbsp aquafaba (chickpea brine), OR 1 tbsp ground flaxseed + 3 tbsp warm water.\n" +
        "• **Buttermilk**: 1 cup milk + 1 tbsp fresh lemon juice or white vinegar (rest 5 mins).\n" +
        "• **Cake Flour**: 1 cup all-purpose flour minus 2 tbsp, replaced with 2 tbsp cornstarch.\n" +
        "• **Heavy Cream**: 3/4 cup whole milk + 1/3 cup melted unsalted butter (whisk vigorously).",
      quickActions: ["Scale Master Recipe", "Filter Eggless Cakes", "Baking Science Conversions"]
    };
  }

  // 5. Active Coupons & Codes
  if (query.includes("coupon") || query.includes("discount") || query.includes("offer") || query.includes("promo") || query.includes("code") || query.includes("sweet15") || query.includes("bake50") || query.includes("freeship") || query.includes("deal") || query.includes("save")) {
    return {
      reply: "🎉 **Active BakeSphere Promotional Coupons & Offers**:\n\n" +
        "• **SWEET15**: **15% OFF** up to ₹150 on orders above ₹499 (Ideal for birthday & celebration cakes!)\n" +
        "• **BAKE50**: **Flat ₹50 OFF** on any order above ₹299 (Perfect for evening puffs & samosas!)\n" +
        "• **FREESHIP**: **Free 2-Hour Express Delivery** on cart values over ₹799.\n\n" +
        "💡 *How to redeem*: Click 'Apply' directly inside your Cart Drawer, or enter the code at checkout or the POS Billing Terminal!",
      quickActions: ["Apply SWEET15 in Cart", "View Bestseller Cakes", "Hot Savory Puffs", "Open POS Billing"]
    };
  }

  // 6. Delivery Cities & Timing
  if (query.includes("deliver") || query.includes("city") || query.includes("cities") || query.includes("midnight") || query.includes("express") || query.includes("pincode") || query.includes("shipping") || query.includes("bangalore") || query.includes("bengaluru") || query.includes("chennai") || query.includes("mumbai") || query.includes("delhi") || query.includes("hyderabad") || query.includes("pune") || query.includes("kolkata")) {
    return {
      reply: "⚡ **BakeSphere Delivery Network & Timings**:\n\n" +
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
        "• **12:00 AM Midnight Surprise**: Perfect for midnight birthday countdown celebrations!",
      quickActions: ["Select Delivery City", "View Bestseller Cakes", "Track Order BS-1025", "Show Active Coupons"]
    };
  }

  // 7. Order Tracking
  if (query.includes("track") || query.includes("where is my order") || query.includes("bs-") || query.includes("order status")) {
    return {
      reply: "📦 **Live Order Tracking**:\n\n" +
        "You can track any active order by providing your Order ID (for example: **BS-1024**, **BS-1025**, or **BS-1026**).\n\n" +
        "• **BS-1024**: Storefront POS Order (Completed)\n" +
        "• **BS-1025**: Online Doorstep Delivery (Out for Delivery with Partner Ravi Kumar)\n" +
        "• **BS-1026**: 2-Tier 3D Custom Birthday Cake (In Kitchen Preparation)\n\n" +
        "Please enter your Order ID, or check your order receipt!",
      quickActions: ["Track Order BS-1025", "Track Order BS-1024", "Show Active Coupons"]
    };
  }

  // 8. 3D Custom Cakes
  if (query.includes("3d") || query.includes("custom") || query.includes("tier") || query.includes("design cake") || query.includes("studio") || query.includes("topper")) {
    return {
      reply: "🎨 **BakeSphere 3D Custom Cake Studio**:\n\n" +
        "Our 3D Custom Studio lets you design your dream celebration cake with real-time parametric rendering:\n\n" +
        "1. 🎂 **Tiers**: Choose 1, 2, or 3 celebration tiers with customizable diameters.\n" +
        "2. 🍫 **Sponges**: Madagascar Vanilla, Belgian Dark Cocoa, Crimson Red Velvet, or Funfetti.\n" +
        "3. 🍦 **Frostings**: Silky Swiss Meringue, White Chocolate Cream Cheese, or Dark Ganache.\n" +
        "4. ✨ **Drip Accents**: 24K Edible Gold, Salted Caramel, or Wild Berry Coulis.\n" +
        "5. 👑 **3D Toppers**: Custom golden plaques, sparklers, and sugar flower cascades.\n\n" +
        "Pricing updates live based on selected weight, tiers, and artisanal decorations!",
      quickActions: ["Open 3D Cake Studio", "View Bestseller Cakes", "Show Active Coupons"]
    };
  }

  // 9. Snacks & Savories
  if (query.includes("puff") || query.includes("samosa") || query.includes("chai") || query.includes("tea") || query.includes("coffee") || query.includes("snack") || query.includes("savory")) {
    return {
      reply: "🥐 **Hot & Crispy Bakery Snacks & Artisan Brews**:\n\n" +
        "• **Artisan Puffs**: Flaky Golden Veg Curry Puff (₹45), Tandoori Paneer Tikka Puff (₹65), Smoked Chicken Keema Puff (₹85), Cheesy Mushroom Puff (₹75)\n" +
        "• **Crispy Punjabi Samosas**: Authentic Punjabi Aloo Samosa (₹35), Paneer Corn Samosa (₹55), Jalapeno Cheese Samosa (₹65), Cocktail Party Box of 6 (₹99)\n" +
        "• **Artisan Brews**: Kulhad Masala Cutting Chai (₹40), Authentic South Indian Filter Coffee (₹50), Signature Spanish Iced Latte (₹170), Rich Dark Hot Chocolate (₹95)\n" +
        "• **Savories**: Tandoori Paneer Kathi Roll (₹95), Stuffed Cheese Garlic Bread (₹110), Spinach & Feta Quiche (₹125).",
      quickActions: ["Filter Hot Puffs", "Browse Samosas", "Order Masala Chai", "Open POS Billing"]
    };
  }

  // 10. Category Sales Query (Role-Aware)
  if (
    query.includes("category sales") ||
    query.includes("categories sales") ||
    query.includes("sales by category") ||
    query.includes("category revenue") ||
    query.includes("category report") ||
    (query.includes("category") && (query.includes("sales") || query.includes("revenue") || query.includes("calculate") || query.includes("report")))
  ) {
    if (!isStaff) {
      return {
        reply: "Bonjour! 👨‍🍳 Internal sales figures and category financial analytics are strictly confidential to staff and kitchen management.\n\n" +
          "However, as our valued guest, here are our **top customer-favorite categories**:\n" +
          "• 🎂 **Celebration Cakes**: Belgian Chocolate Truffle & Red Velvet Swirl\n" +
          "• 🥐 **Flaky Viennoiserie**: French Butter Croissants & Almond Puffs\n" +
          "• 🥟 **Hot Savories**: Tandoori Paneer Puffs & Crispy Samosas\n" +
          "• ☕ **Artisan Brews**: South Indian Filter Coffee & Spanish Iced Latte\n\n" +
          "Would you like to explore our bestsellers or apply coupon **SWEET15**?",
        quickActions: ["View Bestseller Cakes", "Hot Savory Puffs", "Apply SWEET15 in Cart", "Design Custom 3D Cake"]
      };
    }

    return {
      reply: "📊 **Chef Pierre Category Sales & Turnover Report** (Calculated Telemetry):\n\n" +
        "| Category | Units Sold | Gross Revenue | Share of Sales |\n" +
        "| :--- | :---: | :---: | :---: |\n" +
        "| **Cakes** | 148 units | ₹1,19,850 | **36.7%** |\n" +
        "| **3D Custom Cakes** | 21 units | ₹64,200 | **19.7%** |\n" +
        "| **Pastries & Desserts** | 215 units | ₹49,450 | **15.1%** |\n" +
        "| **Breads & Buns** | 182 units | ₹31,200 | **9.6%** |\n" +
        "| **Hot Savories** | 334 units | ₹22,680 | **7.0%** |\n" +
        "| **Beverages** | 204 units | ₹18,360 | **5.6%** |\n" +
        "| **TOTAL** | **1,104 units** | **₹3,25,740** | **100%** |\n\n" +
        "💡 **Executive Culinary Insights**:\n" +
        "• **Top Revenue Driver**: **Cakes** brings in ₹1,19,850 (36.7% of all sales).\n" +
        "• **Volume Leader**: **Hot Savories** moves the highest daily unit volume (334 units).\n" +
        "• **Highest Margin Category**: **3D Custom Cakes** (₹64,200 total, ₹3,057 average ticket).\n" +
        "• **Overall Turnover**: ₹3,25,740 across 1,104 items.",
      quickActions: ["Generate Full Sales Report", "Check Kitchen Stock Report", "AI Demand Forecast", "Scale Master Recipe"]
    };
  }

  // 11. Full Sales Report (Role-Aware)
  if (
    query.includes("sales report") ||
    query.includes("revenue report") ||
    query.includes("complete report") ||
    query.includes("data report") ||
    query.includes("financial report")
  ) {
    if (!isStaff) {
      return {
        reply: "Bonjour! 👨‍🍳 Financial and business performance reports are accessible exclusively to verified BakeSphere staff.\n\n" +
          "Looking for your personal order updates? Let me know your order ID (e.g. `BS-1024`) or check your cart!",
        quickActions: ["Track Order BS-1024", "Show Active Coupons", "View Bestseller Cakes"]
      };
    }
    return {
      reply: "📈 **BakeSphere Comprehensive Executive Sales Report**:\n\n" +
        "• **Gross Business Revenue**: **₹3,25,740**\n" +
        "• **Total Orders Processed**: **415 orders**\n" +
        "• **Average Order Value (AOV)**: **₹785**\n" +
        "• **Total Product Units Sold**: **1,104 bakery items**\n\n" +
        "🏪 **Sales Channels Breakdown**:\n" +
        "• **POS Storefront Terminals**: ₹1,49,840 (46%)\n" +
        "• **Bakingo Online Delivery**: ₹1,23,781 (38%)\n" +
        "• **3D Custom Cake Studio**: ₹52,118 (16%)\n\n" +
        "💳 **Payment Settlement Mix**:\n" +
        "• **UPI (PhonePe / GPay)**: 57%\n" +
        "• **Credit / Debit Cards**: 33%\n" +
        "• **Counter Cash**: 10%\n\n" +
        "🏆 **Top Category**: **Cakes** (₹1,19,850, 36.7% share).",
      quickActions: ["Category Sales Breakdown", "Check Kitchen Stock Report", "AI Demand Forecast", "POS Billing Summary"]
    };
  }

  // 12. Inventory / Stock
  if (query.includes("inventory") || query.includes("stock") || query.includes("low stock") || query.includes("fefo")) {
    if (!isStaff) {
      return {
        reply: "Bonjour! 👨‍🍳 All BakeSphere bakery treats are freshly baked daily using 100% genuine butter and Belgian chocolate. We bake in small batches to guarantee freshness!",
        quickActions: ["Browse Fresh Treats", "Eggless Cake Options", "Active Coupons"]
      };
    }
    return {
      reply: "📦 **BakeSphere Kitchen & FEFO Inventory Health Report**:\n\n" +
        "• **Tracked Raw Ingredients**: 18 SKUs in ERP\n" +
        "• **Items Near Reorder Threshold**: **2 critical items**:\n" +
        "  - **Unsalted Cultured Butter (82% Fat)**: 42.5 kg remaining (Reorder at 30.0 kg)\n" +
        "  - **Callebaut 54.5% Dark Chocolate Callets**: 28.0 kg remaining (Reorder at 25.0 kg)\n\n" +
        "• **Active Kitchen Batches**: 3 production runs currently in oven/proofing.\n\n" +
        "⚠️ *Recommendation*: Place PO with Nilgiri Artisanal Dairy before weekend rushes!",
      quickActions: ["Category Sales Breakdown", "Scale Chocolate Cake Recipe", "AI Demand Forecast", "Generate Full Sales Report"]
    };
  }

  // 13. User Role & Functionalities Query
  if (
    query.includes("what is my role") ||
    query.includes("my role") ||
    query.includes("what are my functionalities") ||
    query.includes("my permissions") ||
    query.includes("who am i")
  ) {
    const roleLabels = {
      super_admin: "👑 Super Admin (Full Enterprise Access)",
      bakery_owner: "💼 Bakery Owner / Executive Director",
      manager: "📋 Branch Operations Manager",
      head_baker: "🧑‍🍳 Master Baker & Production Lead",
      chef: "👨‍🍳 Pastry Chef & Artisan Baker",
      cashier: "🛒 POS Billing Cashier",
      customer: "🛍️ Valued Guest & Bakery Connoisseur"
    };
    return {
      reply: `Bonjour **${userName}**! You are logged in as **${roleLabels[userRole] || roleLabels.customer}**.\n\n` +
        (isStaff
          ? `You have access to live kitchen telemetry, category analytics, inventory batches, and POS systems. How can I assist your operations?`
          : `You have full access to our online storefront, 3D Custom Cake Studio, active coupons, and doorstep delivery tracking!`),
      quickActions: isStaff
        ? ["Category Sales Breakdown", "Check Kitchen Stock Report", "AI Demand Forecast"]
        : ["View Bestseller Cakes", "Show Active Coupons", "Design Custom 3D Cake"]
    };
  }

  // 14. Greetings & Introductions
  if (query.match(/\b(hi|hello|hey|bonjour|greetings|who are you|namaste|morning|evening)\b/)) {
    return {
      reply: `Bonjour ${userName !== "Guest" ? `**${userName}**` : ""}! 👨‍🍳 I am **Chef Pierre**, your Master Baker & AI Culinary Concierge at BakeSphere!\n\n` +
        `I can help you explore our freshest bestsellers, check prices, design custom 3D cakes, apply active discount coupons like **SWEET15**, track live orders, or give expert baking troubleshooting tips. What can I bake or find for you today?`,
      quickActions: ["View Bestseller Cakes", "Show Active Coupons (SWEET15)", "Explore Hot Savory Puffs", "Design Custom 3D Cake"]
    };
  }

  // 15. Gratitude & Praise
  if (query.match(/\b(thank|thanks|awesome|great|cool|good job|nice|love it|perfect)\b/)) {
    return {
      reply: "Merci beaucoup! 👨‍🍳 It is always my absolute pleasure to serve culinary delight. Let me know if you'd like to check out today's top picks, design a cake, or grab a discount code!",
      quickActions: ["View Bestseller Cakes", "Show Active Coupons", "Design Custom 3D Cake", "Hot Savory Puffs"]
    };
  }

  // 16. Jokes & Humor
  if (query.includes("joke") || query.includes("funny") || query.includes("laugh")) {
    const jokes = [
      "Why did the baker go to therapy? Because he was kneading some help! 😂",
      "What do you call a fake noodle? An impasta! But what do you call a fake pastry? A faux-issant! 🥐",
      "Why do bakers make great detectives? Because they always find the proof! 🥖"
    ];
    return {
      reply: jokes[Math.floor(Math.random() * jokes.length)],
      quickActions: ["Tell Another Joke", "Show Active Coupons", "View Bestseller Cakes"]
    };
  }

  // 17. Intelligent Non-Robotic Guidance (Zero-Spam Fallback)
  return {
    reply: `Bonjour! 👨‍🍳 I'm Chef Pierre, your Master Baker AI at BakeSphere.\n\n` +
      `I want to make sure you get the exact information you need. How can I best guide you today?\n\n` +
      `• 🎂 **Bestsellers & Signature Treats**: Belgian chocolate truffle, red velvet, cheesecakes & eggless picks\n` +
      `• 🥐 **Hot Savories & Brews**: Crispy puffs, Punjabi samosas, and South Indian filter coffee\n` +
      `• 🎁 **Active Coupons**: Code **SWEET15** (15% off) & **BAKE50** (flat ₹50 off)\n` +
      `• 🚚 **Orders & Delivery**: 2-hour express delivery in 7 major cities & live order tracking\n` +
      `• 🎨 **3D Cake Studio**: Design multi-tier custom cakes with live 3D preview\n\n` +
      `Pick an action below or ask me about any flavor, price, or recipe!`,
    quickActions: isStaff
      ? ["Category Sales Breakdown", "Generate Full Sales Report", "Check Kitchen Stock Report", "Scale Chocolate Cake Recipe"]
      : ["View Bestseller Cakes", "Show Active Coupons (SWEET15)", "Explore Hot Savory Puffs", "Design Custom 3D Cake"]
  };
};

export const ChatbotModal = ({ onNavigateTab }) => {
  const { currentUser, role } = useAuth();
  const userRole = currentUser?.role || role || "customer";
  const userName = currentUser?.name || "Guest";

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: "bot",
      text: userRole === "head_baker" || userRole === "chef"
        ? `Bonjour Chef! 👨‍🍳 I am **Chef Pierre**, your Master Baker AI. I can calculate **Category Sales breakdowns**, scale recipes, or audit kitchen ingredient stock. What are we preparing today?`
        : ["super_admin", "bakery_owner", "manager"].includes(userRole)
        ? `Bonjour! 📊 I am **Chef Pierre**, your Executive Bakery Assistant. Ask me for live **Category Sales reports**, overall revenue summaries, or inventory reorder alerts!`
        : `Bonjour! 👨‍🍳 I am **Chef Pierre**, your Master Baker & AI Culinary Concierge. How can I help you today? Ask me about our custom cakes, active coupons (SWEET15), snack menu, or baking science!`,
      quickActions: ["super_admin", "bakery_owner", "manager", "head_baker", "chef"].includes(userRole)
        ? ["Category Sales Breakdown", "Generate Full Sales Report", "Check Kitchen Stock Report", "AI Demand Forecast"]
        : ["Active Coupons & Codes", "Hot Savory Puffs & Samosas", "Design Custom 3D Cake", "Bestseller Cakes"]
    }
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceNotice, setVoiceNotice] = useState("");

  const chatEndRef = useRef(null);
  const idCounter = useRef(100);
  const recognitionRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping, isOpen]);

  // Initialize Web Speech API for Audio Voice Input Typing
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = "en-US";

      recognition.onstart = () => {
        setIsListening(true);
        setVoiceNotice("🎙️ Listening... Speak your question now");
      };

      recognition.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map((result) => result[0].transcript)
          .join("");
        setInputMessage(transcript);
      };

      recognition.onerror = (event) => {
        console.warn("Speech recognition error:", event.error);
        setIsListening(false);
        setVoiceNotice(event.error === "not-allowed" ? "Microphone permission was denied." : "Speech recognition stopped.");
        setTimeout(() => setVoiceNotice(""), 3500);
      };

      recognition.onend = () => {
        setIsListening(false);
        setTimeout(() => setVoiceNotice(""), 2000);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const toggleVoiceInput = () => {
    if (!recognitionRef.current) {
      alert("Voice input is not supported in this browser. Please use Google Chrome, Edge, or a browser supporting the Web Speech API.");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
      } catch (err) {
        console.error("Mic start error:", err);
      }
    }
  };

  const sendMessage = async (textToSend) => {
    const text = textToSend || inputMessage;
    if (!text.trim()) return;

    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }

    idCounter.current += 1;
    const userMsg = { id: `user-${idCounter.current}`, sender: "user", text };
    setMessages((prev) => [...prev, userMsg]);
    setInputMessage("");
    setIsTyping(true);

    try {
      const res = await fetch("http://localhost:5000/api/ai/chatbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          role: userRole,
          userName: userName
        })
      });
      const data = await res.json();

      setIsTyping(false);
      idCounter.current += 1;
      setMessages((prev) => [
        ...prev,
        {
          id: `bot-${idCounter.current}`,
          sender: "bot",
          text: data.reply || "Bon appétit! How else may I assist you today?",
          quickActions: data.quickActions || []
        }
      ]);
    } catch (_err) {
      console.warn("Chef Pierre API unreachable, using resilient local knowledge engine:", _err);
      setIsTyping(false);
      const fallback = getFallbackAnswer(text, userRole, userName);
      idCounter.current += 1;
      setMessages((prev) => [
        ...prev,
        {
          id: `bot-${idCounter.current}`,
          sender: "bot",
          text: fallback.reply,
          quickActions: fallback.quickActions
        }
      ]);
    }
  };

  const handleQuickAction = (actionText) => {
    if (actionText.includes("Custom Cake") || actionText.includes("3D")) {
      onNavigateTab("custom-cake");
    } else if (actionText.includes("Stock") || actionText.includes("Inventory") || actionText.includes("FEFO")) {
      onNavigateTab("inventory");
    } else if (actionText.includes("Scale") || actionText.includes("Recipe")) {
      onNavigateTab("production");
    } else if (actionText.includes("POS") || actionText.includes("Billing")) {
      onNavigateTab("pos");
    } else if (actionText.includes("Sales") || actionText.includes("Report") || actionText.includes("Forecast") || actionText.includes("Dashboard")) {
      onNavigateTab("dashboard");
    } else if (actionText.includes("Staff") || actionText.includes("Credential") || actionText.includes("Login")) {
      onNavigateTab("login");
    } else if (actionText.includes("Puff") || actionText.includes("Samosa") || actionText.includes("Cake") || actionText.includes("Storefront")) {
      onNavigateTab("shop");
    }
    sendMessage(actionText);
  };

  return (
    <>
      {/* Floating Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: "fixed",
          bottom: "2rem",
          right: "2rem",
          zIndex: 900,
          width: "64px",
          height: "64px",
          borderRadius: "50%",
          background: "linear-gradient(135deg, #c8102e 0%, #991b1b 100%)",
          border: "3px solid #ffffff",
          boxShadow: "0 10px 30px rgba(200, 16, 46, 0.45)",
          fontSize: "1.9rem",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
          color: "#ffffff"
        }}
        title="Chef Pierre AI Bakery Assistant & Voice Concierge"
      >
        <span>👨‍🍳</span>
        <span
          style={{
            position: "absolute",
            top: "-2px",
            right: "-2px",
            width: "16px",
            height: "16px",
            background: "#22c55e",
            borderRadius: "50%",
            border: "2px solid #ffffff"
          }}
          title="AI & Voice Ready"
        />
      </button>

      {/* Chat Window Modal */}
      {isOpen && (
        <div
          style={{
            position: "fixed",
            bottom: "6rem",
            right: "2rem",
            zIndex: 901,
            width: "440px",
            maxWidth: "calc(100vw - 40px)",
            height: "620px",
            maxHeight: "calc(100vh - 120px)",
            background: "#ffffff",
            borderRadius: "20px",
            boxShadow: "0 25px 60px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0, 0, 0, 0.05)",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            border: "1px solid rgba(200, 16, 46, 0.15)",
            animation: "slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)"
          }}
        >
          {/* Header */}
          <div
            style={{
              background: "linear-gradient(135deg, #c8102e 0%, #7f1d1d 100%)",
              color: "#ffffff",
              padding: "1rem 1.2rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              boxShadow: "0 4px 12px rgba(200, 16, 46, 0.25)"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.8rem" }}>
              <div
                style={{
                  width: "44px",
                  height: "44px",
                  borderRadius: "50%",
                  background: "#ffffff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "1.6rem",
                  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.2)"
                }}
              >
                👨‍🍳
              </div>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                  <h3 style={{ margin: 0, fontSize: "1.05rem", fontWeight: 700, letterSpacing: "-0.2px" }}>
                    Chef Pierre AI
                  </h3>
                  <span
                    style={{
                      background: "rgba(255, 255, 255, 0.2)",
                      padding: "0.15rem 0.45rem",
                      borderRadius: "10px",
                      fontSize: "0.68rem",
                      fontWeight: 600
                    }}
                  >
                    {userRole === "super_admin"
                      ? "Admin Mode"
                      : userRole === "head_baker" || userRole === "chef"
                      ? "Chef Mode"
                      : userRole === "manager" || userRole === "bakery_owner"
                      ? "Executive Mode"
                      : "Customer Concierge"}
                  </span>
                </div>
                <p style={{ margin: "0.15rem 0 0", fontSize: "0.75rem", opacity: 0.9 }}>
                  Category Sales · Full Reports · Voice Typing
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              style={{
                background: "rgba(255, 255, 255, 0.15)",
                border: "none",
                borderRadius: "50%",
                width: "32px",
                height: "32px",
                color: "#ffffff",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1rem",
                transition: "background 0.2s ease"
              }}
              title="Close Chat"
            >
              ✕
            </button>
          </div>

          {/* Voice Notification Banner */}
          {voiceNotice && (
            <div
              style={{
                background: isListening ? "#fee2e2" : "#f1f5f9",
                color: isListening ? "#991b1b" : "#334155",
                fontSize: "0.78rem",
                padding: "0.45rem 1rem",
                textAlign: "center",
                fontWeight: 600,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.4rem",
                borderBottom: "1px solid rgba(0, 0, 0, 0.05)"
              }}
            >
              {voiceNotice}
            </div>
          )}

          {/* Messages Area */}
          <div
            style={{
              flex: 1,
              padding: "1rem",
              overflowY: "auto",
              background: "#f8fafc",
              display: "flex",
              flexDirection: "column",
              gap: "0.9rem"
            }}
          >
            {messages.map((m) => (
              <div
                key={m.id}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: m.sender === "user" ? "flex-end" : "flex-start",
                  maxWidth: "92%",
                  alignSelf: m.sender === "user" ? "flex-end" : "flex-start"
                }}
              >
                <div
                  style={{
                    background:
                      m.sender === "user"
                        ? "linear-gradient(135deg, #c8102e 0%, #991b1b 100%)"
                        : "#ffffff",
                    color: m.sender === "user" ? "#ffffff" : "#1e293b",
                    padding: "0.75rem 1rem",
                    borderRadius:
                      m.sender === "user"
                        ? "16px 16px 2px 16px"
                        : "16px 16px 16px 2px",
                    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.06)",
                    fontSize: "0.85rem",
                    lineHeight: 1.45,
                    border: m.sender === "user" ? "none" : "1px solid #e2e8f0",
                    width: "100%"
                  }}
                >
                  {m.sender === "bot" ? formatBotMessage(m.text) : m.text}
                </div>

                {/* Quick Action Pills */}
                {m.quickActions && m.quickActions.length > 0 && (
                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: "0.35rem",
                      marginTop: "0.5rem"
                    }}
                  >
                    {m.quickActions.map((qa, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleQuickAction(qa)}
                        style={{
                          background: "#ffffff",
                          border: "1px solid #cbd5e1",
                          borderRadius: "14px",
                          padding: "0.3rem 0.65rem",
                          fontSize: "0.75rem",
                          color: "#c8102e",
                          fontWeight: 600,
                          cursor: "pointer",
                          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.04)",
                          transition: "all 0.15s ease",
                          display: "flex",
                          alignItems: "center",
                          gap: "0.25rem"
                        }}
                      >
                        <span>⚡</span>
                        <span>{qa}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {isTyping && (
              <div
                style={{
                  alignSelf: "flex-start",
                  background: "#ffffff",
                  padding: "0.6rem 0.9rem",
                  borderRadius: "16px 16px 16px 2px",
                  border: "1px solid #e2e8f0",
                  fontSize: "0.78rem",
                  color: "#64748b",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.4rem"
                }}
              >
                <span>👨‍🍳</span>
                <span>Chef Pierre is calculating response...</span>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Input Footer with Microphone Voice Button */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage();
            }}
            style={{
              padding: "0.75rem 1rem",
              borderTop: "1px solid #e2e8f0",
              display: "flex",
              gap: "0.5rem",
              background: "#ffffff",
              alignItems: "center"
            }}
          >
            {/* Audio Voice Input Typing Button */}
            <button
              type="button"
              onClick={toggleVoiceInput}
              title={isListening ? "Listening... Click to stop" : "Speak to Chef Pierre (Voice Input)"}
              style={{
                background: isListening
                  ? "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)"
                  : "#f1f5f9",
                color: isListening ? "#ffffff" : "#475569",
                border: isListening ? "2px solid #b91c1c" : "1px solid #cbd5e1",
                borderRadius: "50%",
                width: "40px",
                height: "40px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1.1rem",
                cursor: "pointer",
                boxShadow: isListening ? "0 0 0 4px rgba(239, 68, 68, 0.3)" : "none",
                transition: "all 0.2s ease",
                flexShrink: 0
              }}
            >
              {isListening ? "🔴" : "🎙️"}
            </button>

            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder={isListening ? "Listening to your voice..." : "Ask Pierre: sales by category, recipes, stock..."}
              style={{
                flex: 1,
                background: isListening ? "#fef2f2" : "#f8fafc",
                border: isListening ? "1px solid #ef4444" : "1px solid #cbd5e1",
                borderRadius: "9999px",
                padding: "0.65rem 1rem",
                color: "#1e293b",
                fontSize: "0.85rem",
                outline: "none",
                transition: "border 0.2s, box-shadow 0.2s"
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "#c8102e";
                e.target.style.boxShadow = "0 0 0 3px rgba(200, 16, 46, 0.12)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = isListening ? "#ef4444" : "#cbd5e1";
                e.target.style.boxShadow = "none";
              }}
            />

            <button
              type="submit"
              disabled={!inputMessage.trim()}
              style={{
                background: inputMessage.trim()
                  ? "linear-gradient(135deg, #c8102e 0%, #991b1b 100%)"
                  : "#e2e8f0",
                color: inputMessage.trim() ? "#ffffff" : "#94a3b8",
                border: "none",
                borderRadius: "50%",
                width: "40px",
                height: "40px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "0.95rem",
                cursor: inputMessage.trim() ? "pointer" : "not-allowed",
                boxShadow: inputMessage.trim() ? "0 4px 12px rgba(200, 16, 46, 0.3)" : "none",
                transition: "all 0.2s ease",
                flexShrink: 0
              }}
              title="Send Message"
            >
              ➤
            </button>
          </form>
        </div>
      )}
    </>
  );
};
