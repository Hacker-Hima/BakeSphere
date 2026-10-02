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

  // 13. Comprehensive User Role & Functionalities Query
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

    return {
      reply: `👤 **Account & Operational Role Identity**:\n\n` +
        `Bonjour ${nameDisplay}! You are currently signed in as:\n` +
        `• **Role**: ${profile.badge}\n` +
        `• **Official Designation**: **${profile.title}**\n` +
        `• **Primary Hub**: 📍 ${profile.branch}\n\n` +
        `📝 **Role Summary & Responsibilities**:\n${profile.description}\n\n` +
        `🔑 **Your System Capabilities & Modules**:\n` +
        profile.capabilities.map(c => `• ${c}`).join("\n") + "\n\n" +
        (isStaff 
          ? `💡 *Staff Tip*: Ask me for live **Category Sales reports**, **Stock audits**, or **Recipe scaling** anytime!`
          : `💡 *Guest Tip*: Try designing a cake in our **3D Custom Studio** or use code **SWEET15** for 15% off celebration cakes!`),
      quickActions: profile.quickActions
    };
  }

  // 14. Direct Navigation Commands
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
      return {
        reply: "🚀 **Navigating you to the 3D Custom Cake Studio now!**\n\n" +
          "Welcome to our real-time 3D Parametric Cake Builder! Here you can:\n" +
          "• 🎂 Select 1, 2, or 3 celebration tiers with live geometry\n" +
          "• 🍫 Choose gourmet sponges: Madagascar Vanilla, Belgian Dark Cocoa, Red Velvet, or Funfetti\n" +
          "• 🍦 Pair with Swiss Meringue, White Chocolate Cream Cheese, or Dark Ganache\n" +
          "• ✨ Add 24K Edible Gold drips, Belgian truffles, or wild berry coulis\n" +
          "• 👑 Place custom golden plaques, sparklers, and sugar flowers with live weight & price scaling!\n\n" +
          "Your 3D studio is ready right now on your screen!",
        quickActions: ["Bestseller Cakes", "Show Active Coupons", "Explore Hot Savories"],
        navigateTo: "custom-cake"
      };
    }
    if (query.includes("pos") || query.includes("billing") || query.includes("cashier") || query.includes("counter")) {
      if (!["super_admin", "bakery_owner", "manager", "cashier"].includes(userRole)) {
        return {
          reply: "🔒 **POS Billing Terminal Access Restricted**:\n\nThe Touchscreen POS Billing terminal is reserved for Cashiers, Store Managers, and Admins.\n\nAs a customer, you can order directly through our **Online Bakery Storefront** or **3D Custom Cake Studio** with instant digital payment!",
          quickActions: ["Open Online Storefront", "Design Custom 3D Cake", "Show Active Coupons"]
        };
      }
      return {
        reply: "🛒 **Navigating you to the POS Billing Terminal!**\n\nTouchscreen POS is ready for fast counter sales with thermal receipt printing and split payments.",
        quickActions: ["Apply SWEET15 Code", "Category Sales Report", "Check Kitchen Stock"],
        navigateTo: "pos"
      };
    }
    if (query.includes("inventory") || query.includes("stock") || query.includes("fefo") || query.includes("ingredient")) {
      if (!isStaff) {
        return {
          reply: "🔒 **Inventory & FEFO Module Access Restricted**:\n\nKitchen stock audits and FEFO batches are managed by kitchen staff and managers.",
          quickActions: ["View Bestseller Cakes", "Show Active Coupons", "Design Custom 3D Cake"]
        };
      }
      return {
        reply: "⏳ **Navigating you to the FEFO Inventory & Stock Manager!**\n\nTrack raw pantry ingredients with automated expiry lot tracking.",
        quickActions: ["Check Kitchen Stock Report", "Scale Chocolate Cake Recipe", "AI Demand Forecast"],
        navigateTo: "inventory"
      };
    }
    if (query.includes("production") || query.includes("recipe") || query.includes("scaler") || query.includes("batch")) {
      return {
        reply: "🧑‍🍳 **Navigating you to Production & Recipe Scaler!**\n\nScale artisanal baking formulas with mathematical precision.",
        quickActions: ["Scale Chocolate Cake Recipe", "Check Kitchen Stock Report", "Category Sales Report"],
        navigateTo: "production"
      };
    }
    if (query.includes("dashboard") || query.includes("analytics") || query.includes("sales report")) {
      return {
        reply: "📊 **Navigating you to Executive Dashboard & Analytics!**\n\nLive financial telemetry snapshot ready.",
        quickActions: ["Category Sales Breakdown", "Check Kitchen Stock Report", "AI Demand Forecast"],
        navigateTo: "dashboard"
      };
    }
    if (query.includes("shop") || query.includes("store") || query.includes("menu") || query.includes("bakery") || query.includes("catalog")) {
      return {
        reply: "🍰 **Navigating you to the Online Bakery Storefront!**\n\nBrowse our fresh celebration cakes, hot savory puffs, and jar cakes!",
        quickActions: ["View Bestseller Cakes", "Show Active Coupons", "Design Custom 3D Cake"],
        navigateTo: "shop"
      };
    }
  }

  // 15. Customer Care, Helpline, Store Timings & Same Support
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
    return {
      reply: "🛎️ **BakeSphere Customer Care & Master Baker Support**:\n\n" +
        "Yes, absolutely! Our full customer support and culinary concierge services are active today:\n\n" +
        "• ⏰ **Today's Operational Hours**: Cloud kitchens and customer support operate **7:00 AM – 11:00 PM daily** across all 7 cities.\n" +
        "• 🌐 **24/7 Digital Studio**: Online ordering, 3D Custom Cake Studio, and Chef Pierre AI are live **24 hours a day**.\n" +
        "• 📞 **Direct Concierge Hotline**: **+91 98401 23456** (Speak directly with our BakeSphere customer care desk).\n" +
        "• 📧 **Email Assistance**: **support@bakesphere.com** (Typical reply within 15 minutes).\n" +
        "• ⚡ **2-Hour Express Delivery**: Active today! Orders placed right now will be baked fresh, packed in insulated thermal boxes, and delivered within 2 hours.\n" +
        "• 🌙 **Midnight Surprise Deliveries**: Open for booking today for 12:00 AM midnight celebrations!\n\n" +
        "How may we assist your celebration or order today?",
      quickActions: ["Design Custom 3D Cake", "View Bestseller Cakes", "Show Active Coupons (SWEET15)", "Track Live Order"]
    };
  }

  // 16. Product Categories & Kids / Children Specialty Collections
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
    if (query.includes("kid") || query.includes("child") || query.includes("school party")) {
      return {
        reply: "🎈 **Kids Celebration & Children's Bakery Collections at BakeSphere**:\n\n" +
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
          "💡 *Parent Note*: All kids cakes are 100% vegetarian / eggless, made with natural fruit colorings and zero artificial trans fats!",
        quickActions: ["Order KitKat Carnival Cake", "Design Custom 3D Cake", "Sweet Corn Cheese Puff", "Show Active Coupons (SWEET15)"]
      };
    }

    return {
      reply: "🥐 **BakeSphere Artisanal Product Catalog (10 Core Categories)**:\n\n" +
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
        "Which category would you like to explore or order from today?",
      quickActions: ["View Bestseller Cakes", "Hot Savory Puffs & Samosas", "Design Custom 3D Cake", "Show Active Coupons"]
    };
  }

  // 17. Master Recipes & Baking Formulas
  const isRecipeQuery = query.includes("recipe") || query.includes("how to make") || query.includes("how to bake") || query.includes("how do i make") || query.includes("how do i bake") || query.includes("baking steps") || query.includes("ingredients for") || (query.includes("ingredients") && query.includes("cake"));

  if (isRecipeQuery) {
    if (query.includes("red velvet")) {
      return {
        reply: "🎂 **Master Chef Pierre's Crimson Red Velvet Cake Formula** (Yields 1 kg):\n\n" +
          "• **Ingredients**: 300g cake flour, 280g castor sugar, 15g Dutch cocoa powder, 120g European cultured butter, 240ml buttermilk, 2 eggs, 1 tsp vanilla bean paste, 1 tsp baking soda + 1 tsp white vinegar.\n" +
          "• **Frosting**: 300g cold cream cheese, 120g softened butter, 200g icing sugar, 10ml Madagascar vanilla.\n" +
          "• **Bake**: Pour into two 8-inch lined tins and bake at **175°C (350°F) for 30 minutes**.\n\n" +
          "💡 *Chef Pierre's Secret*: The reaction between vinegar and buttermilk creates that trademark tender, velvety crumb!",
        quickActions: ["Scale in Recipe Scaler", "Order Ready Red Velvet", "Show Active Coupons (SWEET15)"],
        navigateTo: "production"
      };
    } else if (query.includes("sourdough") || query.includes("bread") || query.includes("boule")) {
      return {
        reply: "🥖 **San Francisco Style Wild Sourdough Boule Formula** (Yields 1 Boule - 850g):\n\n" +
          "• **Ingredients**: 500g strong bread flour, 360ml spring water (72% hydration), 120g active mature levain starter, 10g sea salt.\n" +
          "• **Method**: 45 min autolyse, fold in starter & salt, 4 stretch-and-folds over 2 hours, shape into banneton, cold retard at 4°C for 14 hours. Bake inside Dutch oven at **230°C for 45 minutes**!",
        quickActions: ["Scale in Recipe Scaler", "Check Kitchen Stock Report", "Order Sourdough Boule"],
        navigateTo: "production"
      };
    } else {
      // Default: Belgian Chocolate Truffle Cake
      return {
        reply: "🎂 **Master Chef Pierre's Authentic Belgian Chocolate Truffle Cake Recipe** (Yields 1 kg):\n\n" +
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
          "• **Unsalted Butter**: 30g (whisked in at 40°C for mirror gloss)\n\n" +
          "🔥 **Step-by-Step Baking Method**:\n" +
          "1. **Preheat Oven**: Set to **175°C (350°F)** standard bake. Butter and line two 8-inch round cake tins.\n" +
          "2. **Melt Chocolate**: Gently melt Callebaut chocolate and butter over a warm water bath (bain-marie).\n" +
          "3. **Whip Ribbon**: Whisk eggs and castor sugar for 5 minutes until pale, doubled in volume, and forms a thick ribbon.\n" +
          "4. **Combine**: Fold melted chocolate into eggs. Sift dry flour, cocoa, and leavening in 3 additions, alternating with warm heavy cream.\n" +
          "5. **Bake**: Pour into tins and bake for **32–35 minutes** until a skewer inserted in the center comes out clean.\n" +
          "6. **Frosting**: Pour hot cream over dark chocolate, let stand 2 minutes, emulsify until glossy, chill, and frost your layered sponge!\n\n" +
          "💡 *Chef Pierre's Secret Pro Tip*: Bloom the cocoa powder in 30ml of hot espresso before adding to the batter to dramatically unlock deeper chocolate notes!",
        quickActions: ["Scale in Recipe Scaler", "Order Ready Belgian Cake", "Show Active Coupons (SWEET15)", "Baking Science Conversions"],
        navigateTo: "production"
      };
    }
  }

  // 18. Greetings & Conversational
  if (query.match(/\b(how are you|how r u|how are u|how do you do|how's it going|how is it going|whats up|what's up|how have you been)\b/)) {
    return {
      reply: "Magnifique! 👨‍🍳 The ovens are warm, the sweet aromas of 54% Callebaut dark chocolate, Madagascar vanilla, and French butter croissants are wafting through the BakeSphere bakery! I am delighted to be here with you. How are you doing today? Are you craving a decadent dessert, planning a special celebration cake, or looking for an artisan recipe?",
      quickActions: ["View Bestseller Cakes", "Recipe of Chocolate Cake", "Show Active Coupons (SWEET15)", "Design Custom 3D Cake"]
    };
  }

  if (query.match(/\b(hi|hello|hey|bonjour|greetings|who are you|namaste|morning|evening)\b/)) {
    return {
      reply: `Bonjour ${userName !== "Guest" ? `**${userName}**` : ""}! 👨‍🍳 I am **Chef Pierre**, your Master Baker & AI Culinary Concierge at BakeSphere!\n\n` +
        `I can help you explore our freshest bestsellers, check prices, design custom 3D cakes, apply active discount coupons like **SWEET15**, track live orders, or give expert baking troubleshooting tips. What can I bake or find for you today?`,
      quickActions: ["View Bestseller Cakes", "Show Active Coupons (SWEET15)", "Explore Hot Savory Puffs", "Design Custom 3D Cake"]
    };
  }

  // 18. Gratitude & Praise
  if (query.match(/\b(thank|thanks|awesome|great|cool|good job|nice|love it|perfect)\b/)) {
    return {
      reply: "Merci beaucoup! 👨‍🍳 It is always my absolute pleasure to serve culinary delight. Let me know if you'd like to check out today's top picks, design a cake, or grab a discount code!",
      quickActions: ["View Bestseller Cakes", "Show Active Coupons", "Design Custom 3D Cake", "Hot Savory Puffs"]
    };
  }

  // 19. Jokes & Humor
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

  // 20. Intelligent Non-Robotic Guidance (Zero-Spam Fallback)
  return {
    reply: `Bonjour! 👨‍🍳 I'm **Chef Pierre**, your Master Baker & AI Culinary Concierge.\n\n` +
      `I understand you're asking about "${message.trim()}". To ensure you get the exact help you need for your shop or bakery experience:\n\n` +
      `• 👤 **Your Role & Permissions**: Ask "What is my role?" to see your operational privileges\n` +
      `• 🎂 **Bestsellers & Custom Cakes**: Ask about our 3D Studio, Belgian Chocolate Truffle, or Red Velvet\n` +
      `• 🎈 **Kids Collections**: Ask about KitKat Carnival Cake, Pinata Smash cakes, or Sweet Corn Puffs\n` +
      `• 🛎️ **Customer Support**: We operate 7 AM – 11 PM daily with direct phone helpline (+91 98401 23456)\n` +
      `• 🎁 **Active Coupons**: Code **SWEET15** (15% off) & **BAKE50** (flat ₹50 off)\n` +
      `• 🚚 **Delivery & Cities**: 2-hour express delivery in 7 major city hubs & midnight deliveries\n` +
      `• 🔍 **Baking Science**: Ask me for substitutions (eggs/butter) or troubleshooting sinking cakes\n\n` +
      (isStaff ? `📊 As verified staff, you can also ask for **Live Sales Reports**, **Stock Levels**, or **Recipe Scalers**!\n\n` : "") +
      `How may I best guide you right now?`,
    quickActions: isStaff
      ? ["Check My Role & Permissions", "Category Sales Breakdown", "Check Kitchen Stock Report", "AI Demand Forecast"]
      : ["What is My Role?", "View Bestseller Cakes", "Show Active Coupons (SWEET15)", "Design Custom 3D Cake"]
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
  const [speakingMsgId, setSpeakingMsgId] = useState(null);
  const [autoNarrate, setAutoNarrate] = useState(false);

  const cleanTextForSpeech = (raw) => {
    if (!raw) return "";
    return raw
      .replace(/\*\*(.*?)\*\*/g, "$1")
      .replace(/#+\s*/g, "")
      .replace(/\|/g, " ")
      .replace(/•/g, " ")
      .replace(/[-*]\s+/g, " ")
      .replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, "") // strip emojis for crystal clear narration
      .replace(/\s+/g, " ")
      .trim();
  };

  const speakBotMessage = (msgId, text) => {
    if (typeof window === "undefined" || !window.speechSynthesis) {
      alert("Text-to-speech audio narration is not supported in this browser.");
      return;
    }

    if (speakingMsgId === msgId) {
      window.speechSynthesis.cancel();
      setSpeakingMsgId(null);
      return;
    }

    window.speechSynthesis.cancel();
    const clean = cleanTextForSpeech(text);
    if (!clean) return;

    const utterance = new SpeechSynthesisUtterance(clean);
    utterance.lang = "en-US";
    utterance.rate = 1.0;
    utterance.pitch = 1.02;

    utterance.onend = () => setSpeakingMsgId(null);
    utterance.onerror = () => setSpeakingMsgId(null);

    setSpeakingMsgId(msgId);
    window.speechSynthesis.speak(utterance);
  };

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

    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setSpeakingMsgId(null);
    }

    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }

    // Direct local tab navigation intent detection
    const queryLower = text.toLowerCase().trim();
    if (onNavigateTab) {
      if (queryLower.includes("3d") || queryLower.includes("custom cake") || queryLower.includes("cake studio")) {
        onNavigateTab("custom-cake");
      } else if (queryLower.includes("pos") || queryLower.includes("billing") || queryLower.includes("cashier")) {
        if (["super_admin", "bakery_owner", "manager", "cashier"].includes(userRole)) {
          onNavigateTab("pos");
        }
      } else if (queryLower.includes("inventory") || queryLower.includes("stock") || queryLower.includes("fefo")) {
        if (["super_admin", "bakery_owner", "manager", "head_baker", "chef"].includes(userRole)) {
          onNavigateTab("inventory");
        }
      } else if (queryLower.includes("production") || queryLower.includes("recipe scaler")) {
        if (["super_admin", "bakery_owner", "manager", "head_baker", "chef"].includes(userRole)) {
          onNavigateTab("production");
        }
      } else if (queryLower.includes("dashboard") || queryLower.includes("sales report")) {
        if (["super_admin", "bakery_owner", "manager"].includes(userRole)) {
          onNavigateTab("dashboard");
        }
      }
    }

    idCounter.current += 1;
    const userMsg = { id: `user-${idCounter.current}`, sender: "user", text };

    // Create streaming bot message placeholder
    idCounter.current += 1;
    const botMsgId = `bot-${idCounter.current}`;
    const botMsgPlaceholder = {
      id: botMsgId,
      sender: "bot",
      text: "",
      isStreaming: true,
      quickActions: []
    };

    setMessages((prev) => [...prev, userMsg, botMsgPlaceholder]);
    setInputMessage("");
    setIsTyping(true);

    try {
      const res = await fetch("http://localhost:5000/api/ai/chatbot/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          role: userRole,
          userName: userName,
          history: messages.slice(-6)
        })
      });

      if (!res.ok || !res.body) {
        throw new Error(`Server returned HTTP ${res.status}`);
      }

      setIsTyping(false);

      const reader = res.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let accumulatedText = "";
      let pendingQuickActions = [];
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
            break;
          }

          try {
            const parsed = JSON.parse(dataStr);
            if (parsed.metadata) {
              if (parsed.metadata.quickActions) {
                pendingQuickActions = parsed.metadata.quickActions;
              }
              if (parsed.metadata.navigateTo && onNavigateTab) {
                onNavigateTab(parsed.metadata.navigateTo);
              }
            }
            if (parsed.chunk) {
              accumulatedText += parsed.chunk;
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === botMsgId
                    ? { ...m, text: accumulatedText, isStreaming: true }
                    : m
                )
              );
            }
            if (parsed.done) {
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === botMsgId
                    ? {
                        ...m,
                        text: accumulatedText || "Bon appétit! How else may I assist you today?",
                        isStreaming: false,
                        quickActions: pendingQuickActions
                      }
                    : m
                )
              );
            }
          } catch (_err) {
            // Ignore partial parse
          }
        }
      }

      // Finalize streaming state
      const finalText = accumulatedText || "Bon appétit! How else may I assist you today?";
      setMessages((prev) =>
        prev.map((m) =>
          m.id === botMsgId
            ? {
                ...m,
                text: finalText,
                isStreaming: false,
                quickActions:
                  pendingQuickActions.length > 0
                    ? pendingQuickActions
                    : ["Active Coupons", "Bestseller Cakes", "Design 3D Cake"]
              }
            : m
        )
      );

      if (autoNarrate) {
        speakBotMessage(botMsgId, finalText);
      }
    } catch (_err) {
      console.warn("Real-time stream unavailable, activating instant local fallback:", _err);
      setIsTyping(false);
      const fallback = getFallbackAnswer(text, userRole, userName);

      if (fallback.navigateTo && onNavigateTab) {
        onNavigateTab(fallback.navigateTo);
      }

      setMessages((prev) =>
        prev.map((m) =>
          m.id === botMsgId
            ? {
                ...m,
                text: fallback.reply,
                isStreaming: false,
                quickActions: fallback.quickActions || []
              }
            : m
        )
      );

      if (autoNarrate) {
        speakBotMessage(botMsgId, fallback.reply);
      }
    }
  };

  const handleQuickAction = (actionText) => {
    if (onNavigateTab) {
      if (actionText.includes("Custom Cake") || actionText.includes("3D")) {
        onNavigateTab("custom-cake");
      } else if (actionText.includes("Stock") || actionText.includes("Inventory") || actionText.includes("FEFO")) {
        onNavigateTab("inventory");
      } else if (actionText.includes("Scale") || actionText.includes("Recipe") || actionText.includes("Production")) {
        onNavigateTab("production");
      } else if (actionText.includes("POS") || actionText.includes("Billing")) {
        onNavigateTab("pos");
      } else if (actionText.includes("Sales") || actionText.includes("Report") || actionText.includes("Forecast") || actionText.includes("Dashboard")) {
        onNavigateTab("dashboard");
      } else if (actionText.includes("Staff") || actionText.includes("Credential") || actionText.includes("Login")) {
        onNavigateTab("login");
      } else if (actionText.includes("Puff") || actionText.includes("Samosa") || actionText.includes("Cake") || actionText.includes("Storefront") || actionText.includes("Menu") || actionText.includes("Savories")) {
        onNavigateTab("shop");
      }
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
                      background: "rgba(255, 255, 255, 0.22)",
                      padding: "0.15rem 0.5rem",
                      borderRadius: "10px",
                      fontSize: "0.68rem",
                      fontWeight: 600,
                      letterSpacing: "0.2px"
                    }}
                  >
                    {userRole === "super_admin"
                      ? "👑 Super Admin"
                      : userRole === "head_baker"
                      ? "🧑‍🍳 Master Baker"
                      : userRole === "chef"
                      ? "👨‍🍳 Pastry Chef"
                      : userRole === "bakery_owner"
                      ? "💼 Bakery Owner"
                      : userRole === "manager"
                      ? "📋 Branch Manager"
                      : userRole === "cashier"
                      ? "🛒 POS Cashier"
                      : "🛍️ Valued Guest"}
                  </span>
                </div>
                <p style={{ margin: "0.15rem 0 0", fontSize: "0.74rem", opacity: 0.95 }}>
                  Signed in as: <strong>{userName}</strong>
                </p>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <button
                type="button"
                onClick={() => {
                  const nextState = !autoNarrate;
                  setAutoNarrate(nextState);
                  if (!nextState && typeof window !== "undefined" && window.speechSynthesis) {
                    window.speechSynthesis.cancel();
                    setSpeakingMsgId(null);
                  }
                }}
                style={{
                  background: autoNarrate ? "#ffffff" : "rgba(255, 255, 255, 0.2)",
                  color: autoNarrate ? "#c8102e" : "#ffffff",
                  border: "none",
                  borderRadius: "20px",
                  padding: "0.3rem 0.65rem",
                  fontSize: "0.72rem",
                  fontWeight: 700,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.3rem",
                  transition: "all 0.2s ease"
                }}
                title={autoNarrate ? "Auto-voice is ON (Chef Pierre reads answers aloud)" : "Auto-voice is OFF (Click to enable audio reading)"}
              >
                <span>{autoNarrate ? "🔊 Voice: ON" : "🔈 Voice: OFF"}</span>
              </button>

              <button
                onClick={() => {
                  if (typeof window !== "undefined" && window.speechSynthesis) {
                    window.speechSynthesis.cancel();
                    setSpeakingMsgId(null);
                  }
                  setIsOpen(false);
                }}
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
                  {m.sender === "bot" ? (
                    m.isStreaming && !m.text ? (
                      <span
                        style={{
                          color: "#64748b",
                          fontSize: "0.82rem",
                          fontStyle: "italic",
                          display: "flex",
                          alignItems: "center",
                          gap: "0.4rem"
                        }}
                      >
                        <span>👨‍🍳</span> Chef Pierre is preparing a response...
                      </span>
                    ) : (
                      <>
                        {formatBotMessage(m.text)}
                        {m.isStreaming && (
                          <span
                            style={{
                              display: "inline-block",
                              width: "7px",
                              height: "13px",
                              backgroundColor: "#c8102e",
                              marginLeft: "4px",
                              verticalAlign: "middle",
                              borderRadius: "2px"
                            }}
                          />
                        )}
                      </>
                    )
                  ) : (
                    m.text
                  )}
                </div>

                {/* Speaker Audio Listen Button for Bot Messages */}
                {m.sender === "bot" && m.text && !m.isStreaming && (
                  <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", marginTop: "0.35rem" }}>
                    <button
                      type="button"
                      onClick={() => speakBotMessage(m.id, m.text)}
                      style={{
                        background: speakingMsgId === m.id ? "#fee2e2" : "#f1f5f9",
                        color: speakingMsgId === m.id ? "#b91c1c" : "#475569",
                        border: speakingMsgId === m.id ? "1px solid #ef4444" : "1px solid #cbd5e1",
                        borderRadius: "12px",
                        padding: "0.22rem 0.55rem",
                        fontSize: "0.72rem",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "0.25rem",
                        cursor: "pointer",
                        fontWeight: 600,
                        transition: "all 0.15s ease"
                      }}
                      title={speakingMsgId === m.id ? "Click to stop voice audio" : "Listen to Chef Pierre read this answer"}
                    >
                      <span>{speakingMsgId === m.id ? "⏹️ Stop Voice" : "🔊 Listen (Audio AI)"}</span>
                    </button>
                    {speakingMsgId === m.id && (
                      <span style={{ fontSize: "0.7rem", color: "#ef4444", fontWeight: 600, display: "flex", alignItems: "center", gap: "0.2rem" }}>
                        <span style={{ animation: "pulse 1.2s infinite" }}>●</span> Playing Audio...
                      </span>
                    )}
                  </div>
                )}

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

            {isTyping && !messages.some((m) => m.isStreaming) && (
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
