import { useState, useEffect } from "react";

export const StockManager = () => {
  const [ingredients, setIngredients] = useState([]);
  const [fefoAlerts, setFefoAlerts] = useState(null);
  const [loading, setLoading] = useState(true);

  // Waste Form State
  const [wasteQty, setWasteQty] = useState(2);
  const [wasteReason, setWasteReason] = useState("Expired");
  const [wasteNotes, setWasteNotes] = useState("Reached 36h shelf life turnover");
  const [wasteSuccess, setWasteSuccess] = useState("");

  useEffect(() => {
    let mounted = true;
    const loadInv = async () => {
      try {
        const [ingRes, fefoRes] = await Promise.all([
          fetch("http://localhost:5000/api/inventory/ingredients"),
          fetch("http://localhost:5000/api/inventory/fefo-alerts")
        ]);
        const ingJson = await ingRes.json();
        const fefoJson = await fefoRes.json();
        if (mounted) {
          setIngredients(ingJson.ingredients || []);
          setFefoAlerts(fefoJson);
          setLoading(false);
        }
      } catch (err) {
        console.error(err);
        if (mounted) setLoading(false);
      }
    };
    loadInv();
    return () => {
      mounted = false;
    };
  }, []);

  const handleApplyMarkdown = async (batchId) => {
    try {
      const res = await fetch("http://localhost:5000/api/inventory/apply-markdown", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": "bakesphere_dev_key_2026"
        },
        body: JSON.stringify({ batchId, discountPercent: 25 })
      });
      if (res.ok) {
        alert(`25% Flash Markdown triggered on batch ${batchId}!`);
        fetchInventory();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogWaste = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:5000/api/inventory/log-wastage", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": "bakesphere_dev_key_2026"
        },
        body: JSON.stringify({
          productId: 4,
          quantity: parseInt(wasteQty, 10),
          reason: wasteReason,
          notes: wasteNotes
        })
      });
      const data = await res.json();
      if (res.ok) {
        setWasteSuccess(`Discarded ${data.quantity} units (Cost Impact: ₹${data.wastageCost}). Audit log updated.`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return <div style={{ padding: "3rem", textAlign: "center", color: "var(--gold-400)" }}>Loading Inventory & FEFO Batches...</div>;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      {/* Header */}
      <div className="glass-panel" style={{ padding: "1.5rem" }}>
        <div className="badge badge-gold" style={{ marginBottom: "0.5rem" }}>
          🧂 Warehouse & Quality Control
        </div>
        <h2 style={{ fontSize: "1.6rem", fontWeight: 800, color: "var(--text-primary)", marginBottom: "0.4rem" }}>
          FEFO Perishable Inventory & Batch Surveillance
        </h2>
        <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", lineHeight: 1.5 }}>
          First-Expire, First-Out (FEFO) automated lot prioritization prevents perishable losses by tracking hourly shelf-life countdowns, supplier GSTIN batches, and automated flash sale price reductions.
        </p>
      </div>

      {/* FEFO Alerts Cards */}
      {fefoAlerts && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.2rem" }}>
          <div className="glass-panel" style={{ padding: "1.3rem", borderLeft: "4px solid #fb7185" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
              <span style={{ fontWeight: 700, color: "#fb7185", fontSize: "0.95rem" }}>⏳ Expiring Today (Immediate Risk)</span>
              <span className="badge badge-rose">{fefoAlerts.summary.expiringTodayCount} Batches</span>
            </div>
            <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--text-primary)", marginBottom: "0.3rem" }}>
              ₹{fefoAlerts.summary.totalAtRiskCost}
            </div>
            <p style={{ fontSize: "0.76rem", color: "var(--text-muted)" }}>
              Potential loss without flash markdown intervention.
            </p>
            {fefoAlerts.expiringToday.map((b) => (
              <div key={b.batchId} style={{ marginTop: "0.8rem", paddingTop: "0.8rem", borderTop: "1px dashed rgba(244, 63, 94, 0.3)" }}>
                <div style={{ fontWeight: 600, fontSize: "0.84rem", color: "var(--text-primary)" }}>{b.productName}</div>
                <div style={{ fontSize: "0.74rem", color: "var(--text-muted)", marginBottom: "0.5rem" }}>
                  {b.quantityRemaining} units • Expires in {b.hoursRemaining}h
                </div>
                <button
                  onClick={() => handleApplyMarkdown(b.batchId)}
                  className="btn-gold"
                  style={{ background: "var(--rose-gradient)", color: "#fff", fontSize: "0.75rem", padding: "0.35rem 0.8rem" }}
                >
                  ⚡ Apply 25% Flash Markdown
                </button>
              </div>
            ))}
          </div>

          <div className="glass-panel" style={{ padding: "1.3rem", borderLeft: "4px solid #fbbf24" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
              <span style={{ fontWeight: 700, color: "#fbbf24", fontSize: "0.95rem" }}>⚠️ Expiring Within 48 Hours</span>
              <span className="badge badge-gold">{fefoAlerts.summary.expiringWithin48hCount} Batches</span>
            </div>
            <p style={{ fontSize: "0.82rem", color: "var(--text-secondary)", lineHeight: 1.5, marginTop: "0.5rem" }}>
              Monitored by Chef Pierre for upcoming breakfast rushes and banquet reservations. Priority queue active in POS.
            </p>
          </div>

          <div className="glass-panel" style={{ padding: "1.3rem", borderLeft: "4px solid #34d399" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
              <span style={{ fontWeight: 700, color: "#34d399", fontSize: "0.95rem" }}>🌿 FEFO Efficiency Index</span>
              <span className="badge badge-emerald">94.2% Safe</span>
            </div>
            <p style={{ fontSize: "0.82rem", color: "var(--text-secondary)", lineHeight: 1.5, marginTop: "0.5rem" }}>
              Average shelf-life utilization is 94.2% across Anna Nagar, T. Nagar, and Koyambedu branches.
            </p>
          </div>
        </div>
      )}

      {/* Raw Material Inventory Table */}
      <div className="glass-panel" style={{ padding: "1.5rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
          <div>
            <h3 style={{ fontSize: "1.2rem", fontWeight: 700, color: "var(--text-primary)" }}>
              📦 Raw Materials & Ingredient Stock Levels
            </h3>
            <p style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
              Central warehouse stock with automated reorder levels and supplier contacts
            </p>
          </div>
          <span className="badge badge-gold">{ingredients.length} Ingredients</span>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border-subtle)", color: "var(--text-muted)", textAlign: "left" }}>
                <th style={{ padding: "0.75rem" }}>Ingredient Name</th>
                <th style={{ padding: "0.75rem" }}>Category</th>
                <th style={{ padding: "0.75rem" }}>Stock on Hand</th>
                <th style={{ padding: "0.75rem" }}>Reorder Level</th>
                <th style={{ padding: "0.75rem" }}>Unit Cost</th>
                <th style={{ padding: "0.75rem" }}>Certified Supplier</th>
                <th style={{ padding: "0.75rem" }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {ingredients.map((ing) => {
                const isLow = ing.stockQuantity <= ing.reorderLevel;
                return (
                  <tr key={ing.id} style={{ borderBottom: "1px solid rgba(245, 158, 11, 0.06)" }}>
                    <td style={{ padding: "0.8rem 0.75rem", fontWeight: 600, color: "var(--text-primary)" }}>
                      {ing.name}
                    </td>
                    <td style={{ padding: "0.8rem 0.75rem", color: "var(--text-secondary)" }}>
                      {ing.category}
                    </td>
                    <td style={{ padding: "0.8rem 0.75rem", fontWeight: 700, color: isLow ? "#fb7185" : "var(--gold-400)" }}>
                      {ing.stockQuantity} {ing.unit}
                    </td>
                    <td style={{ padding: "0.8rem 0.75rem", color: "var(--text-muted)" }}>
                      {ing.reorderLevel} {ing.unit}
                    </td>
                    <td style={{ padding: "0.8rem 0.75rem", color: "var(--text-secondary)" }}>
                      ₹{ing.unitCost} / {ing.unit}
                    </td>
                    <td style={{ padding: "0.8rem 0.75rem", color: "var(--text-secondary)" }}>
                      {ing.supplierName}
                    </td>
                    <td style={{ padding: "0.8rem 0.75rem" }}>
                      <span className={`badge ${isLow ? "badge-rose" : "badge-emerald"}`}>
                        {isLow ? "⚠️ Low Stock" : "In Stock"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Food Waste Logging Form */}
      <div className="glass-panel" style={{ padding: "1.5rem" }}>
        <h3 style={{ fontSize: "1.15rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "0.4rem" }}>
          🗑️ Food Waste & Scrap Recording Engine
        </h3>
        <p style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginBottom: "1.2rem" }}>
          Logs kitchen waste (burnt, expired, damaged) to accurately calculate monetary loss and train the AI waste prediction algorithm.
        </p>

        <form onSubmit={handleLogWaste} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr)) 160px", gap: "1rem", alignItems: "flex-end" }}>
          <div>
            <label style={{ fontSize: "0.78rem", color: "var(--text-muted)", display: "block", marginBottom: "0.3rem" }}>
              Disposal Reason:
            </label>
            <select
              value={wasteReason}
              onChange={(e) => setWasteReason(e.target.value)}
              style={{
                width: "100%",
                background: "#ffffff",
                color: "#1f2937",
                border: "1px solid #cbd5e1",
                borderRadius: "8px",
                padding: "0.6rem",
                fontSize: "0.85rem",
                outline: "none"
              }}
            >
              <option value="Expired">Perishable Shelf-Life Expired</option>
              <option value="Burnt">Over-baked / Burnt during bake</option>
              <option value="Damaged">Dropped / Packaging Damaged</option>
              <option value="QC_Rejected">QC Texture / Shape Rejection</option>
            </select>
          </div>

          <div>
            <label style={{ fontSize: "0.78rem", color: "var(--text-muted)", display: "block", marginBottom: "0.3rem" }}>
              Quantity Discarded:
            </label>
            <input
              type="number"
              value={wasteQty}
              onChange={(e) => setWasteQty(e.target.value)}
              min="1"
              style={{
                width: "100%",
                background: "#ffffff",
                border: "1px solid #cbd5e1",
                borderRadius: "8px",
                padding: "0.6rem",
                color: "#1f2937",
                fontSize: "0.85rem",
                outline: "none"
              }}
            />
          </div>

          <div>
            <label style={{ fontSize: "0.78rem", color: "var(--text-muted)", display: "block", marginBottom: "0.3rem" }}>
              Kitchen Notes:
            </label>
            <input
              type="text"
              value={wasteNotes}
              onChange={(e) => setWasteNotes(e.target.value)}
              placeholder="e.g. Deck oven heat spike"
              style={{
                width: "100%",
                background: "#ffffff",
                border: "1px solid #cbd5e1",
                borderRadius: "8px",
                padding: "0.6rem",
                color: "#1f2937",
                fontSize: "0.85rem",
                outline: "none"
              }}
            />
          </div>

          <button type="submit" className="btn-gold" style={{ background: "var(--rose-gradient)", color: "#fff", padding: "0.65rem 1rem" }}>
            Log Wastage
          </button>
        </form>

        {wasteSuccess && (
          <div style={{ marginTop: "1rem", fontSize: "0.82rem", color: "#fb7185", fontWeight: 600 }}>
            ✓ {wasteSuccess}
          </div>
        )}
      </div>
    </div>
  );
};
