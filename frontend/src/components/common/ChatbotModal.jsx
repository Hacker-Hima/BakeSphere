import { useState, useRef, useEffect } from "react";

// Helper to format bold **text** and newlines cleanly without external deps
const formatBotMessage = (text) => {
  if (!text) return null;
  const lines = text.split("\n");
  return lines.map((line, lineIdx) => {
    // Process **bold** markers
    const parts = line.split(/(\*\*.*?\*\*)/g);
    const formattedLine = parts.map((part, partIdx) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return <strong key={partIdx}>{part.slice(2, -2)}</strong>;
      }
      return part;
    });

    return (
      <span key={lineIdx} style={{ display: "block", minHeight: line.trim() === "" ? "0.6rem" : "auto" }}>
        {formattedLine}
      </span>
    );
  });
};

// Client-side knowledge responder if API is unreachable
const getFallbackAnswer = (message) => {
  const query = message.trim().toLowerCase();

  // Math check
  const percentMatch = query.match(/(\d+(?:\.\d+)?)\s*%\s*(?:of)?\s*(\d+(?:\.\d+)?)/i);
  if (percentMatch) {
    const pct = parseFloat(percentMatch[1]);
    const base = parseFloat(percentMatch[2]);
    const ans = (pct / 100) * base;
    return {
      reply: `${pct}% of ${base} is **${ans.toFixed(2)}**! (For example, coupon SWEET15 saves ₹${ans.toFixed(0)} on this order!)`,
      quickActions: ["View Active Coupons", "View Bestseller Cakes", "Open POS Billing"]
    };
  }

  // Greetings
  if (query.match(/\b(hi|hello|hey|bonjour|greetings|who are you|introduce|namaste)\b/)) {
    return {
      reply: "Bonjour! 👨‍🍳 I am **Chef Pierre**, your Master Baker & AI Culinary Concierge at BakeSphere! I can answer **any question** you have—from our entire product catalog, prices, and secret coupon codes, to baking science, egg substitutes, unit conversions, and our ERP modules (POS, 3D Cake Studio, Inventory, Recipes). What's on your mind today?",
      quickActions: ["Show Active Coupons", "Explore Hot Savory Puffs", "Design a 3D Cake", "Staff Login Credentials"]
    };
  }

  // Substitutions
  if (query.includes("substitute") || query.includes("replac") || query.includes("eggless") || query.includes("vegan") || query.includes("egg replacer")) {
    return {
      reply: "🧑‍🍳 **Chef Pierre's Guide to Baking Substitutions**:\n\n" +
        "• **1 Egg in Cakes** = 60g unsweetened applesauce, OR 60g plain Greek yogurt, OR 3 tbsp aquafaba (chickpea brine!), OR 1 tbsp ground flaxseed + 3 tbsp warm water (flax egg).\n" +
        "• **Buttermilk** = 1 cup milk + 1 tbsp white vinegar or fresh lemon juice (rest for 5 minutes).\n" +
        "• **Cake Flour** = 1 cup all-purpose flour minus 2 tbsp, replaced with 2 tbsp cornstarch.\n" +
        "• **Heavy Cream** = 3/4 cup whole milk + 1/3 cup melted unsalted butter.",
      quickActions: ["Scale Master Recipe", "Filter Eggless Cakes", "View Sourdough Ingredients"]
    };
  }

  // Conversions
  if (query.includes("cup") || query.includes("gram") || query.includes("conversion") || query.includes("temperature") || query.includes("celsius") || query.includes("fahrenheit") || query.includes("how much is 1 cup") || query.includes("convert")) {
    return {
      reply: "⚖️ **Master Baker's Unit Conversions**:\n\n" +
        "• **All-Purpose / Cake Flour**: 1 cup = **120g – 125g**\n" +
        "• **Granulated White Sugar**: 1 cup = **200g**\n" +
        "• **Brown Sugar (Packed)**: 1 cup = **220g**\n" +
        "• **Butter**: 1 cup (2 sticks) = **227g** (1 tbsp = 14.2g)\n" +
        "• **Cocoa Powder**: 1 cup = **100g**\n" +
        "• **Oven Temperatures**: 160°C = 325°F (gentle bake/cheesecakes), 180°C = 350°F (standard cakes & cookies), 200°C = 400°F (crispy puffs & pastries), 220°C = 425°F (artisan sourdough).",
      quickActions: ["Scale Master Recipe", "Launch Recipe Scaler", "Check FEFO Inventory"]
    };
  }

  // Troubleshooting
  if (query.includes("sink") || query.includes("dense") || query.includes("crack") || query.includes("split") || query.includes("curdle") || query.includes("troubleshoot") || query.includes("dry") || query.includes("fail")) {
    return {
      reply: "🔍 **Chef Pierre's Troubleshooting Clinic**:\n\n" +
        "• **Cake Sunk in Middle?** Usually caused by opening the oven door too early, expired baking powder, or over-whipping batter incorporating excess air that collapses.\n" +
        "• **Dense or Gummy Crumb?** Over-mixing develops excess gluten! Fold flour gently just until combined.\n" +
        "• **Split Chocolate Ganache?** Fix it by whisking in 1-2 tsp of warm milk or immersion-blending vigorously!\n" +
        "• **Cracked Cheesecake Top?** Cool slowly in the oven with the door propped open for 1 hour.",
      quickActions: ["Scale Chocolate Cake Recipe", "View Master Recipes", "Open 3D Studio"]
    };
  }

  // Coupons
  if (query.includes("coupon") || query.includes("discount") || query.includes("offer") || query.includes("promo") || query.includes("code") || query.includes("sweet15") || query.includes("bake50") || query.includes("freeship")) {
    return {
      reply: "🎉 Here are our **active BakeSphere promotional coupons**:\n\n" +
        "• **SWEET15**: 15% OFF up to ₹150 on orders above ₹499 (Great for celebration cakes!)\n" +
        "• **BAKE50**: Flat ₹50 OFF on any order above ₹299 (Perfect for evening puffs & samosas!)\n" +
        "• **FREESHIP**: Free 2-Hour Express Delivery on cart values over ₹799.\n\n" +
        "You can apply these directly in the slide-out Cart Drawer or at the POS Billing Terminal!",
      quickActions: ["Apply SWEET15 in Cart", "View Bestseller Cakes", "Open POS Billing"]
    };
  }

  // Credentials
  if (query.includes("credential") || query.includes("password") || query.includes("login") || query.includes("role") || query.includes("admin") || query.includes("id pass") || query.includes("account")) {
    return {
      reply: "🔑 **BakeSphere Demo Login Directory** (All passwords are `Bakery@2026`):\n\n" +
        "• **Super Admin**: `admin@bakesphere.com` → All 9 Enterprise Modules\n" +
        "• **Bakery Owner**: `owner@bakesphere.com` → Financials, POS, Inventory, Forecasts\n" +
        "• **Branch Manager**: `manager@bakesphere.com` → Store Operations & Production\n" +
        "• **Head Baker**: `baker@bakesphere.com` → Recipe Scaler, FEFO Stock, 3D Studio\n" +
        "• **POS Cashier**: `cashier@bakesphere.com` → Storefront POS Billing & Custom Orders\n" +
        "• **Online Customer**: `customer@bakesphere.com` → Storefront Ordering & 3D Cake Studio\n\n" +
        "You can click **Staff & Role Portal 🔑** in the top navigation bar for 1-click instant login!",
      quickActions: ["Go to Staff Portal", "Log in as Super Admin", "Explore Storefront as Guest"]
    };
  }

  // Snacks & Puffs
  if (query.includes("puff") || query.includes("samosa") || query.includes("chai") || query.includes("tea") || query.includes("coffee") || query.includes("snack") || query.includes("savory") || query.includes("kathi") || query.includes("garlic bread")) {
    return {
      reply: "🥐 **Hot & Crispy Bakery Snacks Collection**:\n\n" +
        "• **Artisan Puffs (6 types)**: Flaky Golden Veg Curry Puff (₹45), Tandoori Paneer Tikka Puff (₹65), Smoked Chicken Keema Puff (₹85), Egg & Black Pepper Puff (₹55), Cheesy Mushroom Puff (₹75), Butter Corn Spinach Puff (₹60)\n" +
        "• **Crispy Samosas (5 types)**: Authentic Punjabi Aloo Samosa (₹35), Paneer Corn Samosa (₹55), Jalapeno Cheese Samosa (₹65), Onion Sweet Corn Samosa (₹45), Cocktail Party Samosas Box of 6 (₹99)\n" +
        "• **Hot Beverages (6 types)**: Kulhad Masala Cutting Chai (₹40), Ginger Cardamom Adrak Chai (₹45), Authentic South Indian Filter Coffee (₹50), Iced Lemon Mint Tea (₹65), Rich Dark Hot Chocolate (₹95), Hazelnut Cold Brew (₹110)\n" +
        "• **Savories & Rolls**: Tandoori Paneer Kathi Roll (₹95), Stuffed Cheese Garlic Bread (₹110), Spinach & Feta Quiche (₹125).",
      quickActions: ["Filter Hot Puffs", "Browse Samosas", "Order Masala Chai", "Open POS Billing"]
    };
  }

  // Generic fallback
  return {
    reply: `👨‍🍳 I'm glad you asked! Regarding **"${message.trim()}"**:\n\n` +
      `At BakeSphere, our goal is culinary excellence and seamless bakery operations. Whether you're curious about our freshly baked treats, calculating recipe ratios, checking live delivery status in your city, or exploring our 9 ERP tools, I am here to assist!\n\n` +
      `Feel free to ask me anything about ingredients, baking techniques, order pricing, or try one of the instant actions below:`,
    quickActions: [
      "View Active Coupons (SWEET15)",
      "Explore Hot Savory Puffs",
      "Design Custom 3D Cake",
      "Open POS Billing Terminal"
    ]
  };
};

export const ChatbotModal = ({ onNavigateTab }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: "bot",
      text: "Bonjour! 👨‍🍳 I am **Chef Pierre**, your Master Baker & AI Culinary Concierge. How can I help you today? Ask me about our custom cakes, active coupons, snack menu, baking science, or recipe scaling!",
      quickActions: ["Active Coupons & Codes", "Hot Savory Puffs & Samosas", "Design Custom 3D Cake", "Staff Login Credentials"]
    }
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping, isOpen]);

  const idCounter = useRef(100);

  const sendMessage = async (textToSend) => {
    const text = textToSend || inputMessage;
    if (!text.trim()) return;

    idCounter.current += 1;
    const userMsg = { id: `user-${idCounter.current}`, sender: "user", text };
    setMessages((prev) => [...prev, userMsg]);
    setInputMessage("");
    setIsTyping(true);

    try {
      const res = await fetch("http://localhost:5000/api/ai/chatbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text })
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
      const fallback = getFallbackAnswer(text);
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
    } else if (actionText.includes("Dashboard")) {
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
        title="Chef Pierre AI Bakery Assistant"
      >
        {isOpen ? "✕" : "👨‍🍳"}
        {!isOpen && (
          <span
            style={{
              position: "absolute",
              top: "-4px",
              right: "-4px",
              background: "#10b981",
              width: "14px",
              height: "14px",
              borderRadius: "50%",
              border: "2px solid #ffffff"
            }}
          />
        )}
      </button>

      {/* High-Contrast Bakingo Light Chat Window */}
      {isOpen && (
        <div
          style={{
            position: "fixed",
            bottom: "6.8rem",
            right: "2rem",
            width: "410px",
            maxHeight: "620px",
            height: "78vh",
            background: "#ffffff",
            border: "1px solid #e2e8f0",
            borderRadius: "20px",
            boxShadow: "0 20px 50px rgba(0, 0, 0, 0.18), 0 0 0 1px rgba(200, 16, 46, 0.1)",
            display: "flex",
            flexDirection: "column",
            zIndex: 900,
            overflow: "hidden",
            animation: "fadeIn 0.25s ease-out"
          }}
        >
          {/* Header */}
          <div
            style={{
              background: "linear-gradient(135deg, #c8102e 0%, #991b1b 100%)",
              padding: "1rem 1.25rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              color: "#ffffff",
              boxShadow: "0 2px 10px rgba(0,0,0,0.1)"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <div
                style={{
                  width: "44px",
                  height: "44px",
                  borderRadius: "50%",
                  background: "#ffffff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "1.5rem",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.15)"
                }}
              >
                👨‍🍳
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: "1.05rem", letterSpacing: "-0.01em" }}>
                  Chef Pierre AI
                </div>
                <div
                  style={{
                    fontSize: "0.75rem",
                    color: "#ffe4e6",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.35rem",
                    marginTop: "2px"
                  }}
                >
                  <span
                    style={{
                      width: "8px",
                      height: "8px",
                      borderRadius: "50%",
                      background: "#22c55e",
                      boxShadow: "0 0 8px #22c55e"
                    }}
                  />
                  Online • Master Baker & Culinary AI
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              style={{
                background: "rgba(255, 255, 255, 0.2)",
                border: "none",
                color: "#ffffff",
                cursor: "pointer",
                width: "32px",
                height: "32px",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1rem",
                transition: "background 0.2s"
              }}
              title="Close Chef Pierre Chat"
            >
              ✕
            </button>
          </div>

          {/* Messages Area */}
          <div
            style={{
              flex: 1,
              overflowY: "auto",
              padding: "1.2rem",
              display: "flex",
              flexDirection: "column",
              gap: "1rem",
              background: "#f8fafc"
            }}
          >
            {messages.map((m) => (
              <div
                key={m.id}
                style={{
                  alignSelf: m.sender === "user" ? "flex-end" : "flex-start",
                  maxWidth: "88%"
                }}
              >
                <div
                  style={{
                    background:
                      m.sender === "user"
                        ? "linear-gradient(135deg, #c8102e 0%, #b91c1c 100%)"
                        : "#ffffff",
                    color: m.sender === "user" ? "#ffffff" : "#1e293b",
                    fontWeight: m.sender === "user" ? 500 : 400,
                    fontSize: "0.88rem",
                    lineHeight: 1.55,
                    padding: "0.85rem 1.1rem",
                    borderRadius:
                      m.sender === "user"
                        ? "16px 16px 2px 16px"
                        : "16px 16px 16px 2px",
                    border: m.sender === "bot" ? "1px solid #e2e8f0" : "none",
                    boxShadow:
                      m.sender === "bot"
                        ? "0 3px 12px rgba(0, 0, 0, 0.04)"
                        : "0 4px 12px rgba(200, 16, 46, 0.25)"
                  }}
                >
                  {m.sender === "bot" ? formatBotMessage(m.text) : m.text}
                </div>

                {/* Quick Action Chips from Bot */}
                {m.quickActions && m.quickActions.length > 0 && (
                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: "0.4rem",
                      marginTop: "0.6rem"
                    }}
                  >
                    {m.quickActions.map((action, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleQuickAction(action)}
                        style={{
                          background: "#fff1f2",
                          color: "#991b1b",
                          border: "1px solid #fecdd3",
                          fontSize: "0.75rem",
                          fontWeight: 600,
                          padding: "0.35rem 0.75rem",
                          borderRadius: "9999px",
                          cursor: "pointer",
                          transition: "all 0.2s ease",
                          boxShadow: "0 1px 3px rgba(200, 16, 46, 0.08)",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "0.3rem"
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = "#ffe4e6";
                          e.currentTarget.style.borderColor = "#fda4af";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = "#fff1f2";
                          e.currentTarget.style.borderColor = "#fecdd3";
                        }}
                      >
                        ⚡ {action}
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
                  border: "1px solid #e2e8f0",
                  padding: "0.65rem 1rem",
                  borderRadius: "16px",
                  fontSize: "0.82rem",
                  color: "#c8102e",
                  fontWeight: 600,
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.04)"
                }}
              >
                <span>👨‍🍳</span>
                <span>Chef Pierre is composing recipe & answer...</span>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Input Footer */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage();
            }}
            style={{
              padding: "0.85rem 1rem",
              borderTop: "1px solid #e2e8f0",
              display: "flex",
              gap: "0.6rem",
              background: "#ffffff",
              alignItems: "center"
            }}
          >
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Ask anything: coupons, recipes, snacks, conversions..."
              style={{
                flex: 1,
                background: "#f8fafc",
                border: "1px solid #cbd5e1",
                borderRadius: "9999px",
                padding: "0.65rem 1.1rem",
                color: "#1e293b",
                fontSize: "0.88rem",
                outline: "none",
                transition: "border 0.2s, box-shadow 0.2s"
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "#c8102e";
                e.target.style.boxShadow = "0 0 0 3px rgba(200, 16, 46, 0.12)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "#cbd5e1";
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
                boxShadow: inputMessage.trim()
                  ? "0 4px 12px rgba(200, 16, 46, 0.3)"
                  : "none",
                transition: "all 0.2s ease",
                flexShrink: 0
              }}
            >
              ➤
            </button>
          </form>
        </div>
      )}
    </>
  );
};
