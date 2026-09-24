import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext.jsx";
import { handleImageError, getSafeImageUrl } from "../../utils/imageFallback.js";

export const CakeBuilder = () => {
  const { currentUser } = useAuth();

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
  const [orderConfirmation, setOrderConfirmation] = useState(null);

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

  const handleBookCake = async () => {
    if (!quote) return;
    try {
      const res = await fetch("http://localhost:5000/api/custom-cakes/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": "bakesphere_dev_key_2026"
        },
        body: JSON.stringify({
          customerName: currentUser ? currentUser.name : "Kavitha Anand",
          customerPhone: "+91 98841 55667",
          deliveryAddress,
          deliveryDate,
          cakeMessage,
          quote
        })
      });
      const data = await res.json();
      if (res.ok) {
        setOrderConfirmation(data);
      } else {
        alert(data.error || "Booking failed");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const toppingsList = [
    { id: "gold_foil", label: "24K Edible Gold Leaf (+₹300)", icon: "✨" },
    { id: "macarons", label: "Handcrafted Macarons (+₹250)", icon: "🍬" },
    { id: "fresh_berries", label: "Mountain Berries & Figs (+₹280)", icon: "🍓" },
    { id: "fondant_sculpting", label: "3D Fondant Sculpting (+₹500)", icon: "🧸" }
  ];

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
        {/* Layered Visualizer Preview */}
        <div className="glass-panel" style={{ padding: "1.5rem", position: "relative", overflow: "hidden" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.8rem" }}>
            <span className="badge badge-gold">Live 3D Preview Simulation</span>
            <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{shape} Architecture</span>
          </div>

          {/* Cake Image with Visual Overlays */}
          <div style={{
            position: "relative",
            width: "100%",
            height: "320px",
            borderRadius: "var(--radius-md)",
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
                className="btn-gold"
                style={{ marginTop: "1rem", width: "100%", justifyContent: "center", padding: "0.8rem", fontSize: "0.95rem" }}
              >
                🎂 Confirm & Book Order (Pay ₹{quote.advanceRequired.toFixed(2)} Advance)
              </button>
            </div>
          ) : null}
        </div>

        {/* Order Confirmation Banner */}
        {orderConfirmation && (
          <div className="glass-panel" style={{
            background: "#f0fdf4",
            border: "1px solid #86efac",
            padding: "1.2rem",
            borderRadius: "12px"
          }}>
            <div style={{ fontSize: "1.2rem", color: "#166534", fontWeight: 700, marginBottom: "0.4rem" }}>
              🎉 Order Confirmed! #{orderConfirmation.orderId}
            </div>
            <div style={{ fontSize: "0.85rem", color: "#1e293b" }}>
              Assigned to Chef Pierre Bouchard at OMR Cloud Kitchen. Advance payment of ₹{orderConfirmation.order.customDetails.advancePaid} recorded.
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
