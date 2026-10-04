import { useState } from "react";
import { useAuth } from "../../context/AuthContext.jsx";
import { useNotifications } from "../../context/NotificationContext.jsx";

const COLOR_PALETTES = [
  { id: "royal_gold", name: "Royal Gold & Ivory", colors: ["#f8fafc", "#d97706", "#fef3c7"] },
  { id: "crimson_romance", name: "Crimson Red Velvet", colors: ["#be123c", "#fbcfe8", "#ffffff"] },
  { id: "superhero_marvel", name: "Marvel Stark Armor", colors: ["#dc2626", "#eab308", "#1e3a8a"] },
  { id: "neon_cyber", name: "Cyberpunk Neon", colors: ["#06b6d4", "#a855f7", "#0f172a"] },
  { id: "pastel_unicorn", name: "Pastel Rainbow Fantasy", colors: ["#f472b6", "#c084fc", "#67e8f9"] }
];

const DEFAULT_BRANCHES = [
  { id: "BR-01", name: "Heritage Main Bakery", locality: "T. Nagar, Chennai" },
  { id: "BR-02", name: "Anna Nagar Flagship", locality: "Anna Nagar, Chennai" },
  { id: "BR-03", name: "Adyar Artisan Studio", locality: "Adyar, Chennai" },
  { id: "BR-04", name: "Velachery Central Hub", locality: "Velachery, Chennai" }
];

export const CustomCakeRequestModal = ({ initialData = {}, onClose, onSuccess }) => {
  const { currentUser, activeBranchId } = useAuth();
  const { addNotification } = useNotifications();

  const [branchList, setBranchList] = useState(DEFAULT_BRANCHES);
  const [theme, setTheme] = useState(initialData.theme || "");
  const [category, setCategory] = useState(initialData.category || "Superhero & Comics");
  const [tiers, setTiers] = useState(initialData.tiers || 2);
  const [weightKg, setWeightKg] = useState(initialData.weightKg || 3);
  const [baseSponge, setBaseSponge] = useState(initialData.baseSponge || "Belgian Dark Chocolate");
  const [filling, setFilling] = useState(initialData.filling || "Belgian Dark Ganache");
  const [shape, setShape] = useState(initialData.shape || "Round");
  const [selectedPalette, setSelectedPalette] = useState(COLOR_PALETTES[0]);
  const [cakeMessage, setCakeMessage] = useState(initialData.cakeMessage || "");
  const [specialInstructions, setSpecialInstructions] = useState(initialData.specialInstructions || "");
  const [deliveryDate, setDeliveryDate] = useState(
    new Date(Date.now() + 72 * 3600 * 1000).toISOString().split("T")[0]
  );
  const [deliveryTimeSlot, setDeliveryTimeSlot] = useState("05:00 PM – 07:00 PM");
  const [customerPhone, setCustomerPhone] = useState(currentUser?.phone || "+91 98401 23456");
  const [customerName, setCustomerName] = useState(currentUser?.name || "Kavitha Anand");
  const [selectedBranchId, setSelectedBranchId] = useState(activeBranchId || "BR-01");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedRequest, setSubmittedRequest] = useState(null);

  // Fetch live branches
  useState(() => {
    fetch("http://localhost:5000/api/branches")
      .then((r) => r.json())
      .then((data) => {
        if (data && Array.isArray(data.branches) && data.branches.length > 0) {
          setBranchList(data.branches);
        }
      })
      .catch(() => {});
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!theme.trim()) {
      alert("Please provide a theme or occasion description.");
      return;
    }

    setIsSubmitting(true);
    const branchObj = branchList.find((b) => b.id === selectedBranchId) || branchList[0];

    try {
      const res = await fetch("http://localhost:5000/api/custom-cakes/custom-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName,
          customerPhone,
          customerEmail: currentUser?.email || "customer@bakesphere.com",
          branchId: selectedBranchId,
          branchName: branchObj ? branchObj.name : "Flagship T. Nagar Hub",
          theme,
          category,
          tiers,
          weightKg,
          baseSponge,
          filling,
          shape,
          colorPalette: selectedPalette.colors,
          cakeMessage,
          photoCakeUrl: initialData.photoUrl || null,
          photoCropShape: initialData.photoShape || "Round",
          specialInstructions,
          deliveryDate,
          deliveryTimeSlot
        })
      });

      const data = await res.json();
      if (res.ok) {
        setSubmittedRequest(data.request);
        addNotification({
          title: "Custom Cake Design Inquiry Submitted! 🎨",
          message: `Request #${data.request.id} for "${theme}" sent to ${branchObj.name}. Estimated starting quote: ₹${data.request.estimatedQuote}.`,
          type: "custom_cake"
        });
        if (onSuccess) onSuccess(data.request);
      } else {
        alert(data.error || "Failed to submit request.");
      }
      setIsSubmitting(false);
    } catch (err) {
      console.error(err);
      alert("Could not connect to server. Please check backend.");
      setIsSubmitting(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        backdropFilter: "blur(8px)",
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem"
      }}
      onClick={onClose}
    >
      <div
        className="glass-panel"
        style={{
          width: "100%",
          maxWidth: "680px",
          maxHeight: "90vh",
          overflowY: "auto",
          background: "#121622",
          border: "1px solid var(--border-color, #2a344d)",
          borderRadius: "16px",
          padding: "1.8rem",
          color: "#ffffff",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.7)"
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.2rem" }}>
          <div>
            <h3 style={{ margin: 0, fontSize: "1.4rem", color: "var(--gold-400)", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <span>🎂</span> Bespoke Custom Cake Inquiry
            </h3>
            <p style={{ margin: "0.2rem 0 0", fontSize: "0.8rem", color: "var(--text-muted)" }}>
              Share your dream celebration concept. Our master chefs sculpt custom cakes for any occasion.
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "rgba(255,255,255,0.08)",
              border: "none",
              color: "#cbd5e1",
              borderRadius: "50%",
              width: "32px",
              height: "32px",
              cursor: "pointer",
              fontSize: "1rem"
            }}
          >
            ✕
          </button>
        </div>

        {submittedRequest ? (
          <div style={{ textAlign: "center", padding: "2rem 1rem" }}>
            <div style={{ fontSize: "3.5rem", marginBottom: "0.8rem" }}>🎉</div>
            <h3 style={{ color: "var(--gold-400)", margin: "0 0 0.5rem" }}>Inquiry Submitted Successfully!</h3>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", maxWidth: "450px", margin: "0 auto 1.5rem" }}>
              Your design request <strong>#{submittedRequest.id}</strong> has been assigned to our master pastry chef team at{" "}
              <strong>{submittedRequest.branchName}</strong>.
            </p>
            <div
              style={{
                background: "rgba(255, 255, 255, 0.04)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                borderRadius: "10px",
                padding: "1rem",
                maxWidth: "400px",
                margin: "0 auto 1.5rem",
                textAlign: "left"
              }}
            >
              <div style={{ fontSize: "0.82rem", marginBottom: "0.3rem" }}>
                <span style={{ color: "var(--text-muted)" }}>Theme:</span> <strong>{submittedRequest.theme}</strong>
              </div>
              <div style={{ fontSize: "0.82rem", marginBottom: "0.3rem" }}>
                <span style={{ color: "var(--text-muted)" }}>Tiers & Weight:</span>{" "}
                <strong>
                  {submittedRequest.tiers} Tiers • {submittedRequest.weightKg} kg
                </strong>
              </div>
              <div style={{ fontSize: "0.82rem", marginBottom: "0.3rem" }}>
                <span style={{ color: "var(--text-muted)" }}>Estimated Starting Quote:</span>{" "}
                <strong style={{ color: "var(--gold-400)" }}>₹{submittedRequest.estimatedQuote}</strong>
              </div>
              <div style={{ fontSize: "0.82rem" }}>
                <span style={{ color: "var(--text-muted)" }}>Target Delivery:</span>{" "}
                <strong>
                  {submittedRequest.deliveryDate} ({submittedRequest.deliveryTimeSlot})
                </strong>
              </div>
            </div>
            <button
              onClick={onClose}
              style={{
                background: "var(--gold-500)",
                color: "#000000",
                border: "none",
                borderRadius: "8px",
                padding: "0.6rem 1.8rem",
                fontWeight: 700,
                cursor: "pointer"
              }}
            >
              Done & Return to Studio
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.1rem" }}>
            {/* Theme / Occasion */}
            <div>
              <label style={{ fontSize: "0.82rem", fontWeight: 700, color: "var(--text-secondary)", display: "block", marginBottom: "0.3rem" }}>
                CAKE THEME OR OCCASION CONCEPT *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Iron Man Arc Reactor Glow, 25th Silver Jubilee Hearts, PS5 Esports Arena..."
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
                style={{
                  width: "100%",
                  background: "rgba(0,0,0,0.3)",
                  border: "1px solid var(--border-color)",
                  borderRadius: "8px",
                  padding: "0.6rem 0.9rem",
                  color: "#ffffff",
                  fontSize: "0.88rem"
                }}
              />
            </div>

            {/* Category & Crafting Branch */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <div>
                <label style={{ fontSize: "0.82rem", fontWeight: 700, color: "var(--text-secondary)", display: "block", marginBottom: "0.3rem" }}>
                  OCCASION CATEGORY
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  style={{
                    width: "100%",
                    background: "rgba(0,0,0,0.3)",
                    border: "1px solid var(--border-color)",
                    borderRadius: "8px",
                    padding: "0.6rem 0.9rem",
                    color: "#ffffff",
                    fontSize: "0.85rem"
                  }}
                >
                  <option value="Superhero & Comics">Superhero & Comics</option>
                  <option value="Cartoon & Kids">Cartoon & Kids</option>
                  <option value="Royal Wedding">Royal Wedding</option>
                  <option value="Anniversary & Romance">Anniversary & Romance</option>
                  <option value="Gaming & Tech">Gaming & Tech</option>
                  <option value="Sports & Hobbies">Sports & Hobbies</option>
                  <option value="Custom Bespoke">Other Bespoke Idea</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: "0.82rem", fontWeight: 700, color: "var(--text-secondary)", display: "block", marginBottom: "0.3rem" }}>
                  CRAFTING BAKERY BRANCH
                </label>
                <select
                  value={selectedBranchId}
                  onChange={(e) => setSelectedBranchId(e.target.value)}
                  style={{
                    width: "100%",
                    background: "rgba(0,0,0,0.3)",
                    border: "1px solid var(--border-color)",
                    borderRadius: "8px",
                    padding: "0.6rem 0.9rem",
                    color: "#ffffff",
                    fontSize: "0.85rem"
                  }}
                >
                  {branchList.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name} ({b.locality || "Chennai"})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Architecture: Tiers, Weight, Shape */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "0.8rem" }}>
              <div>
                <label style={{ fontSize: "0.82rem", fontWeight: 700, color: "var(--text-secondary)", display: "block", marginBottom: "0.3rem" }}>
                  TIERS
                </label>
                <select
                  value={tiers}
                  onChange={(e) => setTiers(parseInt(e.target.value, 10))}
                  style={{
                    width: "100%",
                    background: "rgba(0,0,0,0.3)",
                    border: "1px solid var(--border-color)",
                    borderRadius: "8px",
                    padding: "0.6rem 0.8rem",
                    color: "#ffffff",
                    fontSize: "0.85rem"
                  }}
                >
                  <option value={1}>1 Tier (Single Base)</option>
                  <option value={2}>2 Tiers (Grand Tiered)</option>
                  <option value={3}>3 Tiers (Royal Imperial)</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: "0.82rem", fontWeight: 700, color: "var(--text-secondary)", display: "block", marginBottom: "0.3rem" }}>
                  WEIGHT (KG)
                </label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  step="0.5"
                  value={weightKg}
                  onChange={(e) => setWeightKg(parseFloat(e.target.value))}
                  style={{
                    width: "100%",
                    background: "rgba(0,0,0,0.3)",
                    border: "1px solid var(--border-color)",
                    borderRadius: "8px",
                    padding: "0.6rem 0.8rem",
                    color: "#ffffff",
                    fontSize: "0.85rem"
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: "0.82rem", fontWeight: 700, color: "var(--text-secondary)", display: "block", marginBottom: "0.3rem" }}>
                  SHAPE
                </label>
                <select
                  value={shape}
                  onChange={(e) => setShape(e.target.value)}
                  style={{
                    width: "100%",
                    background: "rgba(0,0,0,0.3)",
                    border: "1px solid var(--border-color)",
                    borderRadius: "8px",
                    padding: "0.6rem 0.8rem",
                    color: "#ffffff",
                    fontSize: "0.85rem"
                  }}
                >
                  <option value="Round">Round Classic</option>
                  <option value="Heart">Heart Romantic</option>
                  <option value="Hexagonal">Hexagonal Avant-Garde</option>
                </select>
              </div>
            </div>

            {/* Flavor Sponge & Filling */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <div>
                <label style={{ fontSize: "0.82rem", fontWeight: 700, color: "var(--text-secondary)", display: "block", marginBottom: "0.3rem" }}>
                  BASE SPONGE FLAVOR
                </label>
                <select
                  value={baseSponge}
                  onChange={(e) => setBaseSponge(e.target.value)}
                  style={{
                    width: "100%",
                    background: "rgba(0,0,0,0.3)",
                    border: "1px solid var(--border-color)",
                    borderRadius: "8px",
                    padding: "0.6rem 0.9rem",
                    color: "#ffffff",
                    fontSize: "0.85rem"
                  }}
                >
                  <option value="Belgian Dark Chocolate">Belgian Dark Chocolate (70% Callebaut)</option>
                  <option value="Crimson Red Velvet">Crimson Red Velvet</option>
                  <option value="Madagascar Bourbon Vanilla">Madagascar Bourbon Vanilla Bean</option>
                  <option value="Italian Almond & Pistachio">Italian Almond & Bronte Pistachio</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: "0.82rem", fontWeight: 700, color: "var(--text-secondary)", display: "block", marginBottom: "0.3rem" }}>
                  ARTISAN FILLING
                </label>
                <select
                  value={filling}
                  onChange={(e) => setFilling(e.target.value)}
                  style={{
                    width: "100%",
                    background: "rgba(0,0,0,0.3)",
                    border: "1px solid var(--border-color)",
                    borderRadius: "8px",
                    padding: "0.6rem 0.9rem",
                    color: "#ffffff",
                    fontSize: "0.85rem"
                  }}
                >
                  <option value="Belgian Dark Ganache">Belgian Dark Ganache</option>
                  <option value="Swiss Meringue Buttercream">Swiss Meringue Buttercream</option>
                  <option value="White Truffle & Raspberry">White Truffle & Wild Raspberry</option>
                  <option value="Salted Caramel Crunch">Salted Caramel Crunch</option>
                </select>
              </div>
            </div>

            {/* Color Palette Presets */}
            <div>
              <label style={{ fontSize: "0.82rem", fontWeight: 700, color: "var(--text-secondary)", display: "block", marginBottom: "0.3rem" }}>
                DESIRED COLOR PALETTE
              </label>
              <div style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap" }}>
                {COLOR_PALETTES.map((cp) => (
                  <button
                    key={cp.id}
                    type="button"
                    onClick={() => setSelectedPalette(cp)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.4rem",
                      background: selectedPalette.id === cp.id ? "rgba(245, 158, 11, 0.2)" : "rgba(255,255,255,0.04)",
                      border: selectedPalette.id === cp.id ? "1px solid var(--gold-500)" : "1px solid rgba(255,255,255,0.08)",
                      borderRadius: "8px",
                      padding: "0.4rem 0.7rem",
                      cursor: "pointer",
                      fontSize: "0.78rem",
                      color: "#ffffff"
                    }}
                  >
                    <div style={{ display: "flex", gap: "2px" }}>
                      {cp.colors.map((c, i) => (
                        <span key={i} style={{ width: "10px", height: "10px", borderRadius: "50%", background: c }} />
                      ))}
                    </div>
                    <span>{cp.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Inscription & Special Instructions */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <div>
                <label style={{ fontSize: "0.82rem", fontWeight: 700, color: "var(--text-secondary)", display: "block", marginBottom: "0.3rem" }}>
                  MESSAGE PIPED ON CAKE
                </label>
                <input
                  type="text"
                  placeholder="e.g. Happy 10th Birthday Aarav! 🎂"
                  value={cakeMessage}
                  onChange={(e) => setCakeMessage(e.target.value)}
                  style={{
                    width: "100%",
                    background: "rgba(0,0,0,0.3)",
                    border: "1px solid var(--border-color)",
                    borderRadius: "8px",
                    padding: "0.6rem 0.9rem",
                    color: "#ffffff",
                    fontSize: "0.85rem"
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: "0.82rem", fontWeight: 700, color: "var(--text-secondary)", display: "block", marginBottom: "0.3rem" }}>
                  CHEF SPECIAL INSTRUCTIONS
                </label>
                <input
                  type="text"
                  placeholder="e.g. Eggless mandatory, Arc reactor glow, gluten-free..."
                  value={specialInstructions}
                  onChange={(e) => setSpecialInstructions(e.target.value)}
                  style={{
                    width: "100%",
                    background: "rgba(0,0,0,0.3)",
                    border: "1px solid var(--border-color)",
                    borderRadius: "8px",
                    padding: "0.6rem 0.9rem",
                    color: "#ffffff",
                    fontSize: "0.85rem"
                  }}
                />
              </div>
            </div>

            {/* Delivery Date & Time + Contact Info */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.8rem" }}>
              <div>
                <label style={{ fontSize: "0.82rem", fontWeight: 700, color: "var(--text-secondary)", display: "block", marginBottom: "0.3rem" }}>
                  DELIVERY DATE
                </label>
                <input
                  type="date"
                  required
                  value={deliveryDate}
                  onChange={(e) => setDeliveryDate(e.target.value)}
                  style={{
                    width: "100%",
                    background: "rgba(0,0,0,0.3)",
                    border: "1px solid var(--border-color)",
                    borderRadius: "8px",
                    padding: "0.55rem 0.8rem",
                    color: "#ffffff",
                    fontSize: "0.82rem"
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: "0.82rem", fontWeight: 700, color: "var(--text-secondary)", display: "block", marginBottom: "0.3rem" }}>
                  TIME SLOT
                </label>
                <select
                  value={deliveryTimeSlot}
                  onChange={(e) => setDeliveryTimeSlot(e.target.value)}
                  style={{
                    width: "100%",
                    background: "rgba(0,0,0,0.3)",
                    border: "1px solid var(--border-color)",
                    borderRadius: "8px",
                    padding: "0.55rem 0.8rem",
                    color: "#ffffff",
                    fontSize: "0.82rem"
                  }}
                >
                  <option value="11:00 AM – 01:00 PM">11:00 AM – 01:00 PM</option>
                  <option value="02:00 PM – 04:00 PM">02:00 PM – 04:00 PM</option>
                  <option value="05:00 PM – 07:00 PM">05:00 PM – 07:00 PM</option>
                  <option value="07:00 PM – 09:00 PM">07:00 PM – 09:00 PM</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: "0.82rem", fontWeight: 700, color: "var(--text-secondary)", display: "block", marginBottom: "0.3rem" }}>
                  PHONE NUMBER
                </label>
                <input
                  type="tel"
                  required
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  style={{
                    width: "100%",
                    background: "rgba(0,0,0,0.3)",
                    border: "1px solid var(--border-color)",
                    borderRadius: "8px",
                    padding: "0.55rem 0.8rem",
                    color: "#ffffff",
                    fontSize: "0.82rem"
                  }}
                />
              </div>
            </div>

            {/* Estimated Quote Card & Submit */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                background: "rgba(245, 158, 11, 0.08)",
                border: "1px solid rgba(245, 158, 11, 0.25)",
                borderRadius: "10px",
                padding: "0.9rem 1.2rem",
                marginTop: "0.5rem"
              }}
            >
              <div>
                <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "block" }}>Estimated Starting Quote:</span>
                <strong style={{ fontSize: "1.3rem", color: "var(--gold-400)" }}>
                  ₹{Math.round(weightKg * 1100 + (tiers > 1 ? 500 : 0) + (initialData.photoUrl ? 350 : 0))}
                </strong>
                <span style={{ fontSize: "0.72rem", color: "var(--text-secondary)", marginLeft: "0.5rem" }}>
                  (+5% GST & Custom Toppers)
                </span>
              </div>

              <div style={{ display: "flex", gap: "0.6rem" }}>
                <button
                  type="button"
                  onClick={onClose}
                  style={{
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.15)",
                    color: "#cbd5e1",
                    padding: "0.6rem 1rem",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontSize: "0.85rem"
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{
                    background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
                    color: "#000000",
                    border: "none",
                    borderRadius: "8px",
                    padding: "0.6rem 1.4rem",
                    fontSize: "0.88rem",
                    fontWeight: 800,
                    cursor: "pointer",
                    boxShadow: "0 4px 15px rgba(245, 158, 11, 0.35)"
                  }}
                >
                  {isSubmitting ? "Submitting Inquiry..." : "🚀 Submit Design Inquiry"}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
