import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext.jsx";
import { useNotifications } from "../../context/NotificationContext.jsx";
import { handleImageError, getSafeImageUrl } from "../../utils/imageFallback.js";

export const CakeBuilder = ({ onTrackOrder }) => {
  const { currentUser, token } = useAuth();
  const { openBill, addNotification } = useNotifications();

  const [tiers, setTiers] = useState(2);
  const [weightKg, setWeightKg] = useState(3.5);
  const [baseSponge, setBaseSponge] = useState("Belgian Dark Chocolate");
  const [filling, setFilling] = useState("Belgian Dark Ganache");
  const [shape, setShape] = useState("Round");
  const [theme] = useState("Floral Elegance & Gold Leaf");
  const [selectedToppings, setSelectedToppings] = useState(["gold_foil", "macarons"]);
  const [cakeMessage, setCakeMessage] = useState("Happy 25th Anniversary! ✨");
  const [turnaround, setTurnaround] = useState("standard");
  const [deliveryDate] = useState("");
  const [deliveryAddress] = useState("42 Venkatnarayana Rd, T. Nagar, Chennai");

  const [quote, setQuote] = useState(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [isBooking, setIsBooking] = useState(false);
  const [orderConfirmation, setOrderConfirmation] = useState(null);
  const [lastInvoice, setLastInvoice] = useState(null);
  const [viewMode, setViewMode] = useState("3d"); // "3d" | "photo"
  const [rotationY, setRotationY] = useState(0);
  const [isAutoSpin, setIsAutoSpin] = useState(false);

  // Auto-spin 3D cake podium
  useEffect(() => {
    if (!isAutoSpin) return;
    const interval = setInterval(() => {
      setRotationY((prev) => (prev + 1.2) % 360);
    }, 40);
    return () => clearInterval(interval);
  }, [isAutoSpin]);

  // Dynamic Sponge Gradient & Flavor Color
  const getSpongeStyle = () => {
    switch (baseSponge) {
      case "Belgian Dark Chocolate":
        return {
          top: "#382017",
          body: "linear-gradient(180deg, #452417 0%, #25120a 100%)",
          frosting: "#2b170e",
          labelColor: "#fed7aa"
        };
      case "Crimson Red Velvet":
        return {
          top: "#881337",
          body: "linear-gradient(180deg, #9f1239 0%, #4c0519 100%)",
          frosting: "#fffbf5",
          labelColor: "#fecdd3"
        };
      case "Madagascar Bourbon Vanilla":
        return {
          top: "#fef08a",
          body: "linear-gradient(180deg, #fef08a 0%, #eab308 100%)",
          frosting: "#ffffff",
          labelColor: "#78350f"
        };
      case "Italian Almond & Pistachio":
        return {
          top: "#86efac",
          body: "linear-gradient(180deg, #6ee7b7 0%, #059669 100%)",
          frosting: "#f0fdf4",
          labelColor: "#064e3b"
        };
      default:
        return {
          top: "#382017",
          body: "linear-gradient(180deg, #452417 0%, #25120a 100%)",
          frosting: "#2b170e",
          labelColor: "#fed7aa"
        };
    }
  };

  const getFillingColor = () => {
    switch (filling) {
      case "Swiss Meringue Buttercream":
        return "#fffbf5";
      case "White Truffle & Raspberry":
        return "#fb7185";
      case "Salted Caramel Crunch":
        return "#d97706";
      default:
        return "#231109"; // Belgian Ganache
    }
  };

  const fetchQuote = async () => {
    setIsCalculating(true);
    try {
      const res = await fetch("http://localhost:5000/api/custom-cakes/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tiers,
          weightKg,
          baseSponge,
          filling,
          shape,
          theme,
          toppings: selectedToppings,
          turnaround
        })
      });
      const data = await res.json();
      if (res.ok) {
        setQuote(data.quote);
      }
      setIsCalculating(false);
    } catch (err) {
      console.error(err);
      setIsCalculating(false);
    }
  };

  useEffect(() => {
    fetchQuote();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tiers, weightKg, baseSponge, filling, shape, theme, selectedToppings, turnaround]);

  const handleToggleTopping = (toppingId) => {
    setSelectedToppings((prev) =>
      prev.includes(toppingId) ? prev.filter((id) => id !== toppingId) : [...prev, toppingId]
    );
  };

  const toppingsList = [
    { id: "gold_foil", label: "24K Edible Gold Leaf (+₹300)", icon: "✨", price: 300 },
    { id: "macarons", label: "Handcrafted Macarons (+₹250)", icon: "🍬", price: 250 },
    { id: "fresh_berries", label: "Mountain Berries & Figs (+₹280)", icon: "🍓", price: 280 },
    { id: "fondant_sculpting", label: "3D Fondant Sculpting (+₹500)", icon: "🧸", price: 500 }
  ];

  const handleBookCake = async () => {
    if (!quote || isBooking) return;
    setIsBooking(true);
    try {
      const authToken = token || sessionStorage.getItem("bakesphere_jwt") || localStorage.getItem("bakesphere_jwt");
      const res = await fetch("http://localhost:5000/api/custom-cakes/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": "bakesphere_dev_key_2026",
          ...(authToken ? { "Authorization": `Bearer ${authToken}` } : {})
        },
        body: JSON.stringify({
          customerName: currentUser ? currentUser.name : "Kavitha Anand",
          customerPhone: currentUser?.phone || "+91 98841 55667",
          deliveryAddress,
          deliveryDate,
          cakeMessage,
          quote
        })
      });
      const data = await res.json();
      if (res.ok) {
        const now = new Date();
        const orderId = data.orderId || `BS-CK-${Date.now().toString().slice(-5)}`;
        const invoiceNumber = orderId.replace("BS-CK-", "INV-CK-");

        // Construct itemized bill lines reflecting the 3D studio architecture & ingredients
        const billItems = [
          {
            name: `Custom ${tiers}-Tier ${shape} Celebration Cake (${weightKg} kg)`,
            weight: `${tiers} Tiers • ${baseSponge} Sponge`,
            quantity: 1,
            unitPrice: quote.spongeAndStructureCost,
            lineTotal: quote.spongeAndStructureCost
          }
        ];

        if (quote.tierComplexityFee > 0) {
          billItems.push({
            name: `Tier Architectural Engineering (${tiers} Tiers)`,
            weight: "Internal Dowels & Support System",
            quantity: 1,
            unitPrice: quote.tierComplexityFee,
            lineTotal: quote.tierComplexityFee
          });
        }

        if (quote.fillingFee > 0) {
          billItems.push({
            name: `Artisan Filling & Torte Layering (${filling})`,
            weight: "Gourmet Filling",
            quantity: 1,
            unitPrice: quote.fillingFee,
            lineTotal: quote.fillingFee
          });
        }

        if (quote.shapeFee > 0) {
          billItems.push({
            name: `Specialty Architectural Carving (${shape} Form)`,
            weight: "Sculpted Shape",
            quantity: 1,
            unitPrice: quote.shapeFee,
            lineTotal: quote.shapeFee
          });
        }

        selectedToppings.forEach((topId) => {
          const topObj = toppingsList.find((t) => t.id === topId);
          if (topObj) {
            billItems.push({
              name: `${topObj.icon} Embellishment: ${topObj.label.split(" (")[0]}`,
              weight: "Artisan Topping",
              quantity: 1,
              unitPrice: topObj.price,
              lineTotal: topObj.price
            });
          }
        });

        if (quote.rushFee > 0) {
          billItems.push({
            name: `Priority Turnaround Production (${turnaround === "express" ? "Same-Day Express" : "24h Rush"})`,
            weight: "Accelerated Crafting",
            quantity: 1,
            unitPrice: quote.rushFee,
            lineTotal: quote.rushFee
          });
        }

        const toppingsSummary = toppingsList
          .filter((t) => selectedToppings.includes(t.id))
          .map((t) => `${t.icon} ${t.label.split(" (")[0]}`)
          .join(", ") || "None";

        const invoiceData = {
          orderId,
          invoiceNumber,
          type: "custom_cake",
          customerName: currentUser?.name || "Kavitha Anand",
          customerPhone: currentUser?.phone || "+91 98841 55667",
          customerEmail: currentUser?.email || "customer@bakesphere.com",
          deliveryAddress: deliveryAddress || "42 Venkatnarayana Rd, T. Nagar, Chennai",
          deliveryCity: "Chennai",
          deliveryPincode: "600017",
          deliverySlot: turnaround === "express" ? "Same-Day Express (Within 6 Hours)" : turnaround === "rush" ? "Priority 24-Hour Production" : "Standard 48-Hour Artisanal Crafting",
          items: billItems,
          subtotal: quote.subtotal,
          discountAmount: 0,
          deliveryFee: 0,
          taxableAmount: quote.subtotal,
          cgst: parseFloat((quote.subtotal * 0.025).toFixed(2)),
          sgst: parseFloat((quote.subtotal * 0.025).toFixed(2)),
          totalGst: quote.gstAmount,
          grandTotal: quote.grandTotal,
          paymentMethod: "UPI Advance (50%)",
          paymentStatus: "ADVANCE RECEIVED (50%)",
          transactionRef: `TXN-CK-${Date.now().toString().slice(-8)}`,
          status: "confirmed",
          orderDate: now.toLocaleDateString("en-IN"),
          orderTime: now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
          createdAt: now.toISOString(),
          customDetails: {
            tiers,
            weightKg,
            baseFlavor: baseSponge,
            baseSponge,
            filling,
            shape,
            theme,
            toppingsText: toppingsSummary,
            cakeMessage: cakeMessage || "Happy Celebration! 🎂",
            advancePaid: quote.advanceRequired,
            balanceDue: quote.balanceOnDelivery,
            assignedChef: "Chef Pierre Bouchard (Master Patissier)"
          }
        };

        // 1. Save to localStorage for Billing & Invoices tab
        try {
          const savedInvoices = JSON.parse(localStorage.getItem("bakesphere_invoices") || "[]");
          localStorage.setItem("bakesphere_invoices", JSON.stringify([invoiceData, ...savedInvoices]));
        } catch (e) {
          console.error(e);
        }

        // 2. Add to user notifications & float toast
        addNotification({
          title: "Custom Cake Billed & Booked! 🧾",
          message: `Tax Invoice #${invoiceNumber} for ₹${quote.grandTotal} (Advance ₹${quote.advanceRequired}) generated.`,
          type: "bill",
          invoice: invoiceData
        });

        // 3. Immediately display the Tax Invoice Bill Modal!
        openBill(invoiceData);

        // 4. Update component confirmation state with last invoice
        setLastInvoice(invoiceData);
        setOrderConfirmation({ ...data, invoice: invoiceData });
      } else {
        alert(data.error || "Booking failed");
      }
      setIsBooking(false);
    } catch (err) {
      console.error(err);
      setIsBooking(false);
    }
  };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1.1fr 0.9fr", gap: "2rem" }}>
      {/* Left Column: Interactive Customization Form */}
      <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
        <div className="glass-panel" style={{ padding: "1.5rem" }}>
          <div className="badge badge-gold" style={{ marginBottom: "0.5rem" }}>
            🎂 Interactive Artisan Studio
          </div>
          <h2 style={{ fontSize: "1.6rem", fontWeight: 800, color: "var(--text-primary)", marginBottom: "0.4rem" }}>
            Design Your Custom Celebration Cake
          </h2>
          <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", lineHeight: 1.5 }}>
            Configure tiers, hand-piped fillings, gourmet sponges, and artisanal toppings with real-time architectural price calculation.
          </p>
        </div>

        {/* Step 1: Tiers & Weight */}
        <div className="glass-panel" style={{ padding: "1.5rem" }}>
          <h3 style={{ fontSize: "1.05rem", fontWeight: 700, color: "var(--gold-400)", marginBottom: "1rem" }}>
            1. Tiers & Weight Architecture
          </h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "0.8rem", marginBottom: "1rem" }}>
            {[
              { t: 1, w: 1.5, label: "1 Tier (Classic)", desc: "1.5 kg • Serves 10-14" },
              { t: 2, w: 3.5, label: "2 Tiers (Celebration)", desc: "3.5 kg • Serves 25-30" },
              { t: 3, w: 6.0, label: "3 Tiers (Grand Gala)", desc: "6.0 kg • Serves 50+" }
            ].map((tierOpt) => (
              <button
                key={tierOpt.t}
                onClick={() => {
                  setTiers(tierOpt.t);
                  setWeightKg(tierOpt.w);
                }}
                style={{
                  background: tiers === tierOpt.t ? "var(--gold-gradient)" : "#ffffff",
                  color: tiers === tierOpt.t ? "#ffffff" : "var(--text-primary)",
                  border: tiers === tierOpt.t ? "none" : "1px solid var(--border-subtle)",
                  padding: "0.9rem",
                  borderRadius: "var(--radius-md)",
                  cursor: "pointer",
                  textAlign: "left",
                  boxShadow: "var(--shadow-sm)"
                }}
              >
                <div style={{ fontWeight: 700, fontSize: "0.92rem" }}>{tierOpt.label}</div>
                <div style={{ fontSize: "0.74rem", opacity: tiers === tierOpt.t ? 0.9 : 0.75 }}>{tierOpt.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Step 2: Sponge & Fillings */}
        <div className="glass-panel" style={{ padding: "1.5rem" }}>
          <h3 style={{ fontSize: "1.05rem", fontWeight: 700, color: "var(--gold-400)", marginBottom: "1rem" }}>
            2. Gourmet Sponge & Filling Pairing
          </h3>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div>
              <label style={{ fontSize: "0.8rem", color: "var(--text-muted)", display: "block", marginBottom: "0.4rem" }}>
                Base Sponge:
              </label>
              <select
                value={baseSponge}
                onChange={(e) => setBaseSponge(e.target.value)}
                style={{
                  width: "100%",
                  background: "#ffffff",
                  color: "#1f2937",
                  border: "1px solid #cbd5e1",
                  borderRadius: "8px",
                  padding: "0.6rem",
                  fontSize: "0.86rem",
                  outline: "none",
                  boxShadow: "0 1px 2px rgba(0,0,0,0.05)"
                }}
              >
                <option value="Belgian Dark Chocolate">Belgian Dark Chocolate (54% Cocoa)</option>
                <option value="Madagascar Bourbon Vanilla">Madagascar Bourbon Vanilla Bean</option>
                <option value="Crimson Red Velvet">Crimson Red Velvet Cocoa</option>
                <option value="Italian Almond & Pistachio">Italian Almond & Roasted Pistachio</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: "0.8rem", color: "var(--text-muted)", display: "block", marginBottom: "0.4rem" }}>
                Cream & Filling:
              </label>
              <select
                value={filling}
                onChange={(e) => setFilling(e.target.value)}
                style={{
                  width: "100%",
                  background: "#ffffff",
                  color: "#1f2937",
                  border: "1px solid #cbd5e1",
                  borderRadius: "8px",
                  padding: "0.6rem",
                  fontSize: "0.86rem",
                  outline: "none",
                  boxShadow: "0 1px 2px rgba(0,0,0,0.05)"
                }}
              >
                <option value="Belgian Dark Ganache">Belgian Dark Ganache (+₹250/tier)</option>
                <option value="Swiss Meringue Buttercream">Swiss Meringue Buttercream</option>
                <option value="White Truffle & Raspberry">White Truffle & Wild Raspberry (+₹350/tier)</option>
                <option value="Salted Caramel Crunch">Fleur de Sel Salted Caramel Crunch (+₹350/tier)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Step 3: Shape & Embellishments */}
        <div className="glass-panel" style={{ padding: "1.5rem" }}>
          <h3 style={{ fontSize: "1.05rem", fontWeight: 700, color: "var(--gold-400)", marginBottom: "1rem" }}>
            3. Shape & Artisanal Embellishments
          </h3>

          <div style={{ display: "flex", gap: "0.6rem", marginBottom: "1.2rem", flexWrap: "wrap" }}>
            {["Round", "Heart", "Hexagonal", "Square"].map((sh) => (
              <button
                key={sh}
                onClick={() => setShape(sh)}
                style={{
                  background: shape === sh ? "var(--gold-gradient)" : "#ffffff",
                  color: shape === sh ? "#ffffff" : "var(--text-secondary)",
                  fontWeight: shape === sh ? 700 : 500,
                  border: shape === sh ? "none" : "1px solid var(--border-subtle)",
                  padding: "0.45rem 1rem",
                  borderRadius: "var(--radius-full)",
                  cursor: "pointer",
                  fontSize: "0.84rem",
                  boxShadow: shape === sh ? "0 4px 12px rgba(200, 16, 46, 0.25)" : "none"
                }}
              >
                {sh === "Heart" ? "❤️ Heart" : sh === "Hexagonal" ? "🔷 Hexagonal" : sh}
              </button>
            ))}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.8rem" }}>
            {toppingsList.map((top) => {
              const isSelected = selectedToppings.includes(top.id);
              return (
                <div
                  key={top.id}
                  onClick={() => handleToggleTopping(top.id)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.6rem",
                    padding: "0.6rem 0.8rem",
                    borderRadius: "8px",
                    background: isSelected ? "#fff1f2" : "#ffffff",
                    border: isSelected ? "1.5px solid var(--crimson-500)" : "1px solid #e2e8f0",
                    cursor: "pointer",
                    fontSize: "0.84rem",
                    transition: "all 0.15s ease"
                  }}
                >
                  <span style={{ fontSize: "1.1rem" }}>{top.icon}</span>
                  <span style={{ color: isSelected ? "var(--crimson-500)" : "var(--text-primary)", fontWeight: isSelected ? 700 : 500 }}>
                    {top.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Step 4: Custom Message & Turnaround */}
        <div className="glass-panel" style={{ padding: "1.5rem" }}>
          <h3 style={{ fontSize: "1.05rem", fontWeight: 700, color: "var(--gold-400)", marginBottom: "1rem" }}>
            4. Inscription & Delivery Schedule
          </h3>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.8rem" }}>
            <div>
              <label style={{ fontSize: "0.8rem", color: "var(--text-muted)", display: "block", marginBottom: "0.3rem" }}>
                Piped Cake Message:
              </label>
              <input
                type="text"
                value={cakeMessage}
                onChange={(e) => setCakeMessage(e.target.value)}
                placeholder="e.g. Happy 1st Birthday, Aarav! 🧸"
                style={{
                  width: "100%",
                  background: "#ffffff",
                  border: "1px solid #cbd5e1",
                  borderRadius: "8px",
                  padding: "0.6rem 0.9rem",
                  color: "#1f2937",
                  fontSize: "0.88rem",
                  boxShadow: "0 1px 2px rgba(0,0,0,0.05)"
                }}
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "0.6rem" }}>
              {[
                { id: "standard", label: "Standard (48h)", fee: "No fee" },
                { id: "rush", label: "Rush (24h)", fee: "+₹350" },
                { id: "express", label: "Same-Day", fee: "+₹650" }
              ].map((tOpt) => (
                <button
                  key={tOpt.id}
                  onClick={() => setTurnaround(tOpt.id)}
                  style={{
                    background: turnaround === tOpt.id ? "rgba(245, 158, 11, 0.2)" : "rgba(255, 255, 255, 0.03)",
                    color: turnaround === tOpt.id ? "var(--gold-400)" : "var(--text-secondary)",
                    border: turnaround === tOpt.id ? "1px solid var(--gold-500)" : "1px solid var(--border-subtle)",
                    padding: "0.5rem",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontSize: "0.78rem"
                  }}
                >
                  <div style={{ fontWeight: 600 }}>{tOpt.label}</div>
                  <div style={{ fontSize: "0.7rem", opacity: 0.8 }}>{tOpt.fee}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Right Column: Visualizer Preview & Dynamic Price Quote */}
      <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
        {/* Dynamic 3D Multi-Tier Cake Visualizer Stage */}
        <div className="glass-panel" style={{ padding: "1.2rem", position: "relative", overflow: "hidden" }}>
          {/* Header Controls: Mode Toggle & Rotation */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.8rem", flexWrap: "wrap", gap: "0.5rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <span className="badge badge-gold">
                {viewMode === "3d" ? "🎨 Live 3D Architectural Canvas" : "📸 Studio Photography View"}
              </span>
              <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{shape} Shape • {tiers} Tiers</span>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
              <button
                type="button"
                onClick={() => setViewMode(viewMode === "3d" ? "photo" : "3d")}
                style={{
                  background: "var(--bg-surface, #f1f5f9)",
                  border: "1px solid var(--border-color, #cbd5e1)",
                  borderRadius: "6px",
                  padding: "0.25rem 0.6rem",
                  fontSize: "0.72rem",
                  fontWeight: 700,
                  cursor: "pointer",
                  color: "var(--text-primary)"
                }}
              >
                {viewMode === "3d" ? "📸 Switch to Photo" : "🎨 Switch to 3D Canvas"}
              </button>
            </div>
          </div>

          {viewMode === "3d" ? (
            /* ═══════════ INTERACTIVE 3D TIER CAKE STAGE ═══════════ */
            <div
              style={{
                position: "relative",
                width: "100%",
                height: "360px",
                borderRadius: "14px",
                overflow: "hidden",
                background: "radial-gradient(ellipse at 50% 30%, #1e2433 0%, #0c0e14 100%)",
                border: "1px solid var(--border-color, #333d52)",
                boxShadow: "inset 0 0 40px rgba(0, 0, 0, 0.7), 0 10px 30px rgba(0, 0, 0, 0.4)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                perspective: "900px"
              }}
            >
              {/* Top 3D Control Ribbon */}
              <div
                style={{
                  position: "absolute",
                  top: "0.75rem",
                  left: "0.75rem",
                  right: "0.75rem",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  zIndex: 10,
                  pointerEvents: "auto"
                }}
              >
                <div style={{ fontSize: "0.72rem", color: "#94a3b8", display: "flex", alignItems: "center", gap: "0.3rem" }}>
                  <span>Orbit:</span>
                  <strong style={{ color: "#ffffff" }}>{Math.round(rotationY)}°</strong>
                </div>

                <div style={{ display: "flex", gap: "0.35rem" }}>
                  <button
                    type="button"
                    onClick={() => setRotationY((prev) => (prev - 25 + 360) % 360)}
                    style={{
                      background: "rgba(255, 255, 255, 0.12)",
                      border: "1px solid rgba(255, 255, 255, 0.25)",
                      color: "#ffffff",
                      borderRadius: "6px",
                      padding: "0.2rem 0.5rem",
                      fontSize: "0.72rem",
                      cursor: "pointer"
                    }}
                    title="Rotate 3D Stage Left"
                  >
                    ↶
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsAutoSpin(!isAutoSpin)}
                    style={{
                      background: isAutoSpin ? "var(--crimson-500, #e11d48)" : "rgba(255, 255, 255, 0.12)",
                      border: "1px solid rgba(255, 255, 255, 0.25)",
                      color: "#ffffff",
                      borderRadius: "6px",
                      padding: "0.2rem 0.55rem",
                      fontSize: "0.72rem",
                      fontWeight: 700,
                      cursor: "pointer"
                    }}
                    title="Toggle continuous turntable spin"
                  >
                    {isAutoSpin ? "⏸ Pause Spin" : "▶ Auto-Orbit"}
                  </button>

                  <button
                    type="button"
                    onClick={() => setRotationY((prev) => (prev + 25) % 360)}
                    style={{
                      background: "rgba(255, 255, 255, 0.12)",
                      border: "1px solid rgba(255, 255, 255, 0.25)",
                      color: "#ffffff",
                      borderRadius: "6px",
                      padding: "0.2rem 0.5rem",
                      fontSize: "0.72rem",
                      cursor: "pointer"
                    }}
                    title="Rotate 3D Stage Right"
                  >
                    ↷
                  </button>
                </div>
              </div>

              {/* 3D Cake Rotatable Assembly */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "flex-end",
                  height: "260px",
                  position: "relative",
                  transformStyle: "preserve-3d",
                  transform: `rotateY(${rotationY}deg) rotateX(10deg)`,
                  transition: isAutoSpin ? "none" : "transform 0.25s ease-out",
                  marginTop: "1.5rem"
                }}
              >
                {/* 3D Top Embellishment / Topper */}
                {selectedToppings.includes("fondant_sculpting") && (
                  <div
                    style={{
                      fontSize: "2rem",
                      filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.5))",
                      marginBottom: "-6px",
                      zIndex: 8,
                      animation: "pulse 2s infinite"
                    }}
                    title="Handcrafted 3D Fondant Topper"
                  >
                    🧸
                  </div>
                )}

                {/* TIER 3 (Top Tier, rendered only if 3 tiers) */}
                {tiers === 3 && (
                  <div
                    style={{
                      position: "relative",
                      width: "120px",
                      height: "46px",
                      borderRadius: shape === "Hexagonal" ? "4px" : "12px",
                      background: getSpongeStyle().body,
                      border: `1px solid ${getSpongeStyle().top}`,
                      boxShadow: "0 6px 14px rgba(0, 0, 0, 0.6), inset 0 2px 4px rgba(255,255,255,0.25)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      marginBottom: "-4px",
                      zIndex: 6
                    }}
                  >
                    {/* Top Tier Filling Ribbon */}
                    <div
                      style={{
                        position: "absolute",
                        top: "50%",
                        left: 0,
                        right: 0,
                        height: "4px",
                        background: getFillingColor(),
                        opacity: 0.9,
                        boxShadow: "0 0 6px rgba(0,0,0,0.4)"
                      }}
                    />

                    {/* Top Tier Sparkles if Gold Leaf */}
                    {selectedToppings.includes("gold_foil") && (
                      <span style={{ position: "absolute", top: "-8px", right: "8px", fontSize: "0.9rem" }}>✨</span>
                    )}
                    {selectedToppings.includes("fresh_berries") && (
                      <span style={{ position: "absolute", top: "-10px", left: "10px", fontSize: "0.95rem" }}>🍓</span>
                    )}

                    <span style={{ fontSize: "0.62rem", fontWeight: 800, color: "#ffffff", textShadow: "0 1px 3px rgba(0,0,0,0.8)", zIndex: 2 }}>
                      Tier 3
                    </span>
                  </div>
                )}

                {/* TIER 2 (Middle Tier, rendered if 2 or 3 tiers) */}
                {tiers >= 2 && (
                  <div
                    style={{
                      position: "relative",
                      width: "175px",
                      height: "54px",
                      borderRadius: shape === "Hexagonal" ? "6px" : "16px",
                      background: getSpongeStyle().body,
                      border: `1.5px solid ${getSpongeStyle().top}`,
                      boxShadow: "0 8px 18px rgba(0, 0, 0, 0.65), inset 0 2px 5px rgba(255,255,255,0.22)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      marginBottom: "-4px",
                      zIndex: 4
                    }}
                  >
                    {/* Middle Filling Ribbon */}
                    <div
                      style={{
                        position: "absolute",
                        top: "50%",
                        left: 0,
                        right: 0,
                        height: "5px",
                        background: getFillingColor(),
                        opacity: 0.9,
                        boxShadow: "0 0 8px rgba(0,0,0,0.4)"
                      }}
                    />

                    {/* Macarons on Ledge */}
                    {selectedToppings.includes("macarons") && (
                      <>
                        <span style={{ position: "absolute", top: "-8px", left: "4px", fontSize: "0.85rem" }}>🍬</span>
                        <span style={{ position: "absolute", top: "-8px", right: "4px", fontSize: "0.85rem" }}>🍬</span>
                      </>
                    )}
                    {selectedToppings.includes("gold_foil") && (
                      <span style={{ position: "absolute", bottom: "4px", left: "14px", fontSize: "0.75rem" }}>✨</span>
                    )}

                    <span style={{ fontSize: "0.68rem", fontWeight: 800, color: "#ffffff", textShadow: "0 1px 3px rgba(0,0,0,0.8)", zIndex: 2 }}>
                      Tier 2 • {filling}
                    </span>
                  </div>
                )}

                {/* TIER 1 (Base Tier - Always Rendered) */}
                <div
                  style={{
                    position: "relative",
                    width: "235px",
                    height: "64px",
                    borderRadius: shape === "Hexagonal" ? "8px" : "18px",
                    background: getSpongeStyle().body,
                    border: `1.5px solid ${getSpongeStyle().top}`,
                    boxShadow: "0 12px 28px rgba(0, 0, 0, 0.75), inset 0 3px 6px rgba(255,255,255,0.2)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    zIndex: 2
                  }}
                >
                  {/* Base Tier Filling Ribbon */}
                  <div
                    style={{
                      position: "absolute",
                      top: "50%",
                      left: 0,
                      right: 0,
                      height: "6px",
                      background: getFillingColor(),
                      opacity: 0.95,
                      boxShadow: "0 0 10px rgba(0,0,0,0.5)"
                    }}
                  />

                  {/* Toppings on Base Tier */}
                  {selectedToppings.includes("fresh_berries") && (
                    <span style={{ position: "absolute", top: "-9px", right: "12px", fontSize: "0.85rem" }}>🍓</span>
                  )}
                  {selectedToppings.includes("gold_foil") && (
                    <span style={{ position: "absolute", top: "-7px", left: "16px", fontSize: "0.8rem" }}>✨</span>
                  )}

                  {/* Dynamic Custom Cake Piped Message Banner */}
                  <div
                    style={{
                      position: "absolute",
                      bottom: "7px",
                      background: "rgba(15, 12, 10, 0.85)",
                      backdropFilter: "blur(6px)",
                      border: "1px solid #d4af37",
                      borderRadius: "6px",
                      padding: "0.2rem 0.7rem",
                      maxWidth: "215px",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      zIndex: 3,
                      boxShadow: "0 2px 8px rgba(0,0,0,0.5)"
                    }}
                  >
                    <span style={{ color: "#fde047", fontSize: "0.72rem", fontWeight: 800, fontStyle: "italic" }}>
                      "{cakeMessage || "Artisan Celebration"}"
                    </span>
                  </div>
                </div>

                {/* Metallic Rotating Pedestal / Turntable Stand */}
                <div
                  style={{
                    width: "270px",
                    height: "14px",
                    borderRadius: "50%",
                    background: "linear-gradient(90deg, #64748b 0%, #cbd5e1 50%, #475569 100%)",
                    boxShadow: "0 10px 24px rgba(0, 0, 0, 0.8), 0 0 0 2px rgba(255,255,255,0.15)",
                    marginTop: "-4px",
                    zIndex: 1
                  }}
                />
              </div>

              {/* Bottom Quick Specs Pill */}
              <div
                style={{
                  position: "absolute",
                  bottom: "0.75rem",
                  left: "0.75rem",
                  right: "0.75rem",
                  background: "rgba(15, 23, 42, 0.85)",
                  backdropFilter: "blur(8px)",
                  padding: "0.45rem 0.85rem",
                  borderRadius: "10px",
                  border: "1px solid rgba(255, 255, 255, 0.15)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  fontSize: "0.74rem",
                  color: "#cbd5e1"
                }}
              >
                <span>🎂 {tiers} Tiers • {weightKg} kg</span>
                <span style={{ color: "#fde047", fontWeight: 700 }}>{baseSponge}</span>
                <span>{selectedToppings.length} Embellishments</span>
              </div>
            </div>
          ) : (
            /* ═══════════ STUDIO PHOTOGRAPHY VIEW ═══════════ */
            <div style={{
              position: "relative",
              width: "100%",
              height: "360px",
              borderRadius: "14px",
              overflow: "hidden",
              boxShadow: "0 10px 30px rgba(0,0,0,0.6)"
            }}>
              <img
                src={getSafeImageUrl("https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=700&auto=format&fit=crop&q=80")}
                alt="Custom Designer Cake"
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                onError={handleImageError}
              />
              {/* Overlay Badges */}
              <div style={{
                position: "absolute",
                bottom: "1rem",
                left: "1rem",
                right: "1rem",
                background: "rgba(255, 255, 255, 0.95)",
                backdropFilter: "blur(10px)",
                padding: "0.8rem 1rem",
                borderRadius: "10px",
                border: "1px solid #e2e8f0",
                boxShadow: "0 4px 12px rgba(0,0,0,0.12)"
              }}>
                <div style={{ fontWeight: 700, fontSize: "0.95rem", color: "var(--crimson-500)", marginBottom: "0.2rem" }}>
                  "{cakeMessage}"
                </div>
                <div style={{ fontSize: "0.78rem", color: "#475569" }}>
                  {tiers} Tiers • {weightKg} kg • {baseSponge} with {filling}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Dynamic Architectural Price Quote */}
        <div className="glass-panel" style={{ padding: "1.5rem" }}>
          <h3 style={{ fontSize: "1.15rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "1rem" }}>
            📐 Cost Breakdown & Advance Quote
          </h3>

          {isCalculating ? (
            <div style={{ color: "var(--gold-400)", fontSize: "0.85rem" }}>Recalculating quote...</div>
          ) : quote ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", fontSize: "0.84rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", color: "var(--text-muted)" }}>
                <span>Base Sponge & Structure ({quote.weightKg} kg):</span>
                <span>₹{quote.spongeAndStructureCost.toFixed(2)}</span>
              </div>
              {quote.tierComplexityFee > 0 && (
                <div style={{ display: "flex", justifyContent: "space-between", color: "var(--text-muted)" }}>
                  <span>Tier Engineering Surcharge ({quote.tiers} Tiers):</span>
                  <span>+₹{quote.tierComplexityFee.toFixed(2)}</span>
                </div>
              )}
              {quote.fillingFee > 0 && (
                <div style={{ display: "flex", justifyContent: "space-between", color: "var(--text-muted)" }}>
                  <span>Gourmet Filling ({quote.filling}):</span>
                  <span>+₹{quote.fillingFee.toFixed(2)}</span>
                </div>
              )}
              {quote.toppingsFee > 0 && (
                <div style={{ display: "flex", justifyContent: "space-between", color: "var(--text-muted)" }}>
                  <span>Artisanal Toppings:</span>
                  <span>+₹{quote.toppingsFee.toFixed(2)}</span>
                </div>
              )}
              {quote.rushFee > 0 && (
                <div style={{ display: "flex", justifyContent: "space-between", color: "#fb7185" }}>
                  <span>Express Rush Fee:</span>
                  <span>+₹{quote.rushFee.toFixed(2)}</span>
                </div>
              )}
              <div style={{ display: "flex", justifyContent: "space-between", color: "var(--text-muted)" }}>
                <span>GST (5%):</span>
                <span>₹{quote.gstAmount.toFixed(2)}</span>
              </div>

              <div style={{
                borderTop: "1px solid var(--border-subtle)",
                paddingTop: "0.6rem",
                marginTop: "0.4rem",
                display: "flex",
                justifyContent: "space-between",
                fontSize: "1.2rem",
                fontWeight: 800,
                color: "var(--gold-400)"
              }}>
                <span>Total Quote:</span>
                <span>₹{quote.grandTotal.toFixed(2)}</span>
              </div>

              <div style={{
                background: "rgba(245, 158, 11, 0.08)",
                padding: "0.7rem",
                borderRadius: "8px",
                border: "1px solid rgba(245, 158, 11, 0.2)",
                marginTop: "0.5rem"
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 600, color: "#34d399" }}>
                  <span>50% Advance Required:</span>
                  <span>₹{quote.advanceRequired.toFixed(2)}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", color: "var(--text-muted)", fontSize: "0.75rem", marginTop: "2px" }}>
                  <span>Balance Due on Delivery:</span>
                  <span>₹{quote.balanceOnDelivery.toFixed(2)}</span>
                </div>
              </div>

              <button
                onClick={handleBookCake}
                disabled={isBooking}
                className="btn-gold"
                style={{
                  marginTop: "1rem",
                  width: "100%",
                  justifyContent: "center",
                  padding: "0.85rem",
                  fontSize: "0.95rem",
                  opacity: isBooking ? 0.75 : 1
                }}
              >
                {isBooking ? (
                  <span>⏳ Processing Booking & Generating Bill...</span>
                ) : (
                  <span>🎂 Confirm & Book Order (Pay ₹{quote.advanceRequired.toFixed(2)} Advance)</span>
                )}
              </button>
            </div>
          ) : null}
        </div>

        {/* Order Confirmation Banner with View Bill Action */}
        {orderConfirmation && (
          <div className="glass-panel" style={{
            background: "linear-gradient(135deg, rgba(22, 101, 52, 0.16) 0%, rgba(20, 83, 45, 0.08) 100%)",
            border: "1.5px solid #22c55e",
            padding: "1.4rem",
            borderRadius: "16px",
            boxShadow: "0 8px 24px rgba(34, 197, 94, 0.15)",
            marginTop: "1rem"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem" }}>
              <div style={{ flex: 1, minWidth: "240px" }}>
                <div style={{ fontSize: "1.25rem", color: "#22c55e", fontWeight: 800, marginBottom: "0.3rem" }}>
                  🎉 Order Confirmed & Billed! #{orderConfirmation.orderId}
                </div>
                <div style={{ fontSize: "0.86rem", color: "var(--text-primary)", fontWeight: 600 }}>
                  Assigned to <span style={{ color: "#fbbf24" }}>Chef Pierre Bouchard</span> at OMR Cloud Patisserie Studio.
                </div>
                <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginTop: "4px" }}>
                  Advance payment of <strong style={{ color: "#34d399" }}>₹{orderConfirmation.order?.customDetails?.advancePaid || quote?.advanceRequired}</strong> recorded • Balance of ₹{orderConfirmation.order?.customDetails?.balanceDue || quote?.balanceOnDelivery} due on delivery.
                </div>
              </div>

              <div style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap" }}>
                {lastInvoice && (
                  <button
                    type="button"
                    onClick={() => openBill(lastInvoice)}
                    className="btn-gold"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      padding: "0.65rem 1.2rem",
                      fontSize: "0.88rem",
                      borderRadius: "10px"
                    }}
                    id="bk-view-cake-bill-btn"
                  >
                    <span>🧾</span>
                    <span>View & Print Bill</span>
                  </button>
                )}

                {lastInvoice && onTrackOrder && (
                  <button
                    type="button"
                    onClick={() => onTrackOrder(lastInvoice)}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      padding: "0.65rem 1.2rem",
                      fontSize: "0.88rem",
                      borderRadius: "10px",
                      background: "linear-gradient(135deg, #059669 0%, #047857 100%)",
                      color: "#ffffff",
                      border: "none",
                      fontWeight: 700,
                      cursor: "pointer",
                      boxShadow: "0 4px 12px rgba(5, 150, 105, 0.3)"
                    }}
                    id="bk-track-cake-order-btn"
                  >
                    <span>🛵</span>
                    <span>Track Kitchen Progress</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
