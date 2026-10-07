import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext.jsx";
import { useNotifications } from "../../context/NotificationContext.jsx";

const FALLBACK_BRANCHES = [
  { id: "BR-01", name: "Heritage Main Bakery (T. Nagar)" },
  { id: "BR-02", name: "Anna Nagar Flagship" },
  { id: "BR-03", name: "Koyambedu Express Hub" },
  { id: "BR-04", name: "OMR Cloud Kitchen & Master Production" }
];

export const SmartClearanceManager = () => {
  const auth = useAuth() || {};
  const currentUser = auth.currentUser;
  const activeBranchId = auth.activeBranchId;
  const { addNotification } = useNotifications();

  const [branches, setBranches] = useState(() => (auth.branches && auth.branches.length ? auth.branches : FALLBACK_BRANCHES));
  const [clearanceItems, setClearanceItems] = useState([]);
  const [fefoSummary, setFefoSummary] = useState(null);
  const [selectedBranchId, setSelectedBranchId] = useState(activeBranchId || "BR-01");
  const [isLoading, setIsLoading] = useState(true);
  const [isAutoTriggering, setIsAutoTriggering] = useState(false);

  // Manual markdown modal
  const [customMarkdownBatch, setCustomMarkdownBatch] = useState(null);
  const [customDiscount, setCustomDiscount] = useState(30);

  // Waste modal
  const [wasteBatch, setWasteBatch] = useState(null);
  const [wasteQty, setWasteQty] = useState(1);
  const [wasteReason, setWasteReason] = useState("Shelf-life expired");

  const userRole = currentUser?.role || "";
  const isAdmin = userRole === "admin" || userRole === "super_admin" || userRole === "bakery_owner";
  const isManager = userRole === "manager" || userRole === "branch_manager" || userRole === "bakery_owner";

  useEffect(() => {
    if (auth.branches && auth.branches.length) {
      setBranches(auth.branches);
    } else {
      fetch("http://localhost:5000/api/branches")
        .then((res) => res.json())
        .then((data) => {
          if (data.branches && data.branches.length > 0) {
            setBranches(data.branches);
          }
        })
        .catch((e) => console.warn("Failed to load branches in SmartClearanceManager:", e));
    }
  }, [auth.branches]);

  useEffect(() => {
    fetchClearanceData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedBranchId]);

  const fetchClearanceData = async () => {
    setIsLoading(true);
    try {
      const url = new URL("http://localhost:5000/api/inventory/fefo-alerts");
      if (selectedBranchId && selectedBranchId !== "ALL") {
        url.searchParams.append("branchId", selectedBranchId);
      }
      const res = await fetch(url.toString());
      const data = await res.json();
      if (res.ok) {
        setFefoSummary(data.summary);
        // Combine batches
        const allBatches = [
          ...(data.expiringToday || []),
          ...(data.expiringWithin48h || []),
          ...(data.expired || [])
        ];
        setClearanceItems(allBatches);
      }
      setIsLoading(false);
    } catch (err) {
      console.error(err);
      setIsLoading(false);
    }
  };

  const handleRunAutoClearance = async () => {
    setIsAutoTriggering(true);
    try {
      const token = sessionStorage.getItem("bakesphere_jwt") || localStorage.getItem("bakesphere_jwt");
      const res = await fetch("http://localhost:5000/api/inventory/smart-clearance-auto", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": "bakesphere_dev_key_2026",
          ...(token ? { "Authorization": `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ branchId: selectedBranchId })
      });
      const data = await res.json();
      if (res.ok) {
        addNotification({
          title: "⚡ Smart Clearance Activated!",
          message: `${data.updatedCount} near-expiry batches have been discounted dynamically and published to the customer storefront Night Market.`,
          type: "success"
        });
        fetchClearanceData();
      }
      setIsAutoTriggering(false);
    } catch (err) {
      console.error(err);
      setIsAutoTriggering(false);
    }
  };

  const handleApplyCustomMarkdown = async () => {
    if (!customMarkdownBatch) return;
    try {
      const token = sessionStorage.getItem("bakesphere_jwt") || localStorage.getItem("bakesphere_jwt");
      const res = await fetch("http://localhost:5000/api/inventory/apply-markdown", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": "bakesphere_dev_key_2026",
          ...(token ? { "Authorization": `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          batchId: customMarkdownBatch.batchId,
          discountPercent: customDiscount
        })
      });
      if (res.ok) {
        addNotification({
          title: `Applied ${customDiscount}% Flash Sale! 🏷️`,
          message: `Discount applied to ${customMarkdownBatch.productName}.`,
          type: "info"
        });
        setCustomMarkdownBatch(null);
        fetchClearanceData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogWasteSubmit = async (e) => {
    e.preventDefault();
    if (!wasteBatch) return;
    try {
      const token = sessionStorage.getItem("bakesphere_jwt") || localStorage.getItem("bakesphere_jwt");
      const res = await fetch("http://localhost:5000/api/inventory/log-wastage", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": "bakesphere_dev_key_2026",
          ...(token ? { "Authorization": `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          productId: wasteBatch.productId,
          quantity: wasteQty,
          reason: wasteReason,
          notes: `Batch ${wasteBatch.batchId} reached end of safe consumption shelf life.`
        })
      });
      if (res.ok) {
        addNotification({
          title: "Food Waste Written Off 🗑️",
          message: `Discarded ${wasteQty} units of ${wasteBatch.productName}. Audit log recorded.`,
          type: "alert"
        });
        setWasteBatch(null);
        fetchClearanceData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      {/* Header Banner */}
      <div className="glass-panel" style={{ padding: "1.5rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <div className="badge badge-gold" style={{ marginBottom: "0.5rem" }}>
              ⏳ Smart Perishable Loss Mitigation
            </div>
            <h2 style={{ fontSize: "1.6rem", fontWeight: 800, color: "var(--text-primary)", margin: "0 0 0.4rem" }}>
              Near-Expiry Surveillance & Dynamic Clearance Engine
            </h2>
            <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", margin: 0 }}>
              Automated First-Expire, First-Out (FEFO) markdown discounts reduce food wastage by automatically offering 20% to 60% OFF on fresh goods before expiry.
            </p>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "0.8rem", flexWrap: "wrap" }}>
            {/* Branch selector */}
            <select
              value={selectedBranchId}
              onChange={(e) => setSelectedBranchId(e.target.value)}
              disabled={isManager && currentUser?.branchId}
              style={{
                background: "rgba(0,0,0,0.35)",
                color: "#ffffff",
                border: "1px solid var(--border-color)",
                borderRadius: "8px",
                padding: "0.55rem 0.8rem",
                fontSize: "0.85rem",
                fontWeight: 700
              }}
            >
              {isAdmin && <option value="ALL">All Branches</option>}
              {(branches || []).map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>

            {/* Smart clearance trigger */}
            <button
              type="button"
              onClick={handleRunAutoClearance}
              disabled={isAutoTriggering}
              style={{
                background: "linear-gradient(135deg, #e11d48 0%, #be123c 100%)",
                color: "#ffffff",
                border: "none",
                borderRadius: "8px",
                padding: "0.55rem 1.2rem",
                fontSize: "0.85rem",
                fontWeight: 800,
                cursor: "pointer",
                boxShadow: "0 4px 15px rgba(225, 29, 72, 0.4)",
                display: "flex",
                alignItems: "center",
                gap: "0.4rem"
              }}
            >
              <span>⚡</span>
              <span>{isAutoTriggering ? "Calculating..." : "Run Automated Smart Clearance"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Surveillance Summary KPI Cards */}
      {fefoSummary && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1rem" }}>
          <div className="glass-panel" style={{ padding: "1.2rem", borderLeft: "4px solid #f43f5e" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Expiring Today (&lt;24h)</span>
              <span className="badge badge-rose">{fefoSummary.expiringTodayCount} Lots</span>
            </div>
            <div style={{ fontSize: "1.6rem", fontWeight: 800, color: "#f43f5e", margin: "0.3rem 0" }}>
              ₹{fefoSummary.totalAtRiskCost}
            </div>
            <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>Capital value at risk of disposal</span>
          </div>

          <div className="glass-panel" style={{ padding: "1.2rem", borderLeft: "4px solid #f59e0b" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Approaching (&lt;48h)</span>
              <span className="badge badge-gold">{fefoSummary.expiringWithin48hCount} Lots</span>
            </div>
            <div style={{ fontSize: "1.6rem", fontWeight: 800, color: "var(--gold-400)", margin: "0.3rem 0" }}>
              Monitored
            </div>
            <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>Priority sales routing active in POS</span>
          </div>

          <div className="glass-panel" style={{ padding: "1.2rem", borderLeft: "4px solid #ef4444" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Expired / Quarantine</span>
              <span className="badge badge-rose">{fefoSummary.expiredCount} Lots</span>
            </div>
            <div style={{ fontSize: "1.6rem", fontWeight: 800, color: "#ef4444", margin: "0.3rem 0" }}>
              Immediate Action
            </div>
            <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>Write off per hygiene compliance</span>
          </div>

          <div className="glass-panel" style={{ padding: "1.2rem", borderLeft: "4px solid #10b981" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Mitigation Recovery Rate</span>
              <span className="badge badge-emerald">Active</span>
            </div>
            <div style={{ fontSize: "1.6rem", fontWeight: 800, color: "#10b981", margin: "0.3rem 0" }}>
              88.4% Saved
            </div>
            <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>Recovered via Night Market flash sales</span>
          </div>
        </div>
      )}

      {/* Perishable Batch Surveillance Table */}
      <div className="glass-panel" style={{ padding: "1.5rem" }}>
        <h3 style={{ fontSize: "1.2rem", fontWeight: 700, color: "var(--text-primary)", margin: "0 0 1rem" }}>
          📦 Live Batch Surveillance & Clearance Desk
        </h3>

        {isLoading ? (
          <div style={{ textAlign: "center", padding: "3rem", color: "var(--gold-400)" }}>Loading batch surveillance...</div>
        ) : clearanceItems.length === 0 ? (
          <div style={{ textAlign: "center", padding: "3rem", color: "var(--text-muted)" }}>
            <div style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>🌿</div>
            <h4>All inventory is fresh and within safe shelf life thresholds!</h4>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.84rem" }}>
              <thead>
                <tr style={{ background: "rgba(255,255,255,0.04)", borderBottom: "1px solid var(--border-color)" }}>
                  <th style={{ padding: "0.7rem", textAlign: "left", color: "var(--text-secondary)" }}>Batch ID & Product</th>
                  <th style={{ padding: "0.7rem", textAlign: "center", color: "var(--text-secondary)" }}>Remaining Stock</th>
                  <th style={{ padding: "0.7rem", textAlign: "center", color: "var(--text-secondary)" }}>Hours to Expiry</th>
                  <th style={{ padding: "0.7rem", textAlign: "center", color: "var(--text-secondary)" }}>Status & Urgency</th>
                  <th style={{ padding: "0.7rem", textAlign: "center", color: "var(--text-secondary)" }}>Active Discount</th>
                  <th style={{ padding: "0.7rem", textAlign: "right", color: "var(--text-secondary)" }}>Clearance Price</th>
                  <th style={{ padding: "0.7rem", textAlign: "center", color: "var(--text-secondary)" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {clearanceItems.map((b) => {
                  const hours = parseFloat(b.hoursRemaining);
                  const isExpired = hours <= 0;
                  const discount = b.discountApplied || 0;
                  const discountedPrice = discount > 0 ? (b.sellingPrice * (1 - discount / 100)).toFixed(2) : b.sellingPrice;

                  return (
                    <tr key={b.batchId} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                      <td style={{ padding: "0.7rem" }}>
                        <div style={{ fontWeight: 700, color: "#ffffff" }}>{b.productName}</div>
                        <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>{b.batchId} • {b.baker}</div>
                      </td>

                      <td style={{ padding: "0.7rem", textAlign: "center" }}>
                        <strong style={{ fontSize: "0.95rem", color: "#ffffff" }}>{b.quantityRemaining}</strong>
                        <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", display: "block" }}>
                          of {b.quantityProduced} units
                        </span>
                      </td>

                      <td style={{ padding: "0.7rem", textAlign: "center" }}>
                        <span
                          style={{
                            fontWeight: 800,
                            color: isExpired ? "#ef4444" : hours <= 6 ? "#f43f5e" : hours <= 12 ? "#f59e0b" : "#10b981",
                            background: "rgba(0,0,0,0.3)",
                            padding: "0.25rem 0.6rem",
                            borderRadius: "6px"
                          }}
                        >
                          {isExpired ? "EXPIRED" : `${hours}h remaining`}
                        </span>
                      </td>

                      <td style={{ padding: "0.7rem", textAlign: "center" }}>
                        {isExpired ? (
                          <span className="badge badge-rose">⛔ Expired (Quarantine)</span>
                        ) : hours <= 3 ? (
                          <span className="badge badge-rose">⚡ Critical Flash (&lt;3h)</span>
                        ) : hours <= 6 ? (
                          <span className="badge badge-gold">🌙 Night Market Priority</span>
                        ) : hours <= 12 ? (
                          <span className="badge badge-gold">🏷️ Approaching Expiry</span>
                        ) : (
                          <span className="badge badge-emerald">🌿 Fresh Batch</span>
                        )}
                      </td>

                      <td style={{ padding: "0.7rem", textAlign: "center" }}>
                        {discount > 0 ? (
                          <span
                            style={{
                              background: "rgba(234, 179, 8, 0.2)",
                              color: "var(--gold-400)",
                              fontWeight: 800,
                              padding: "0.25rem 0.6rem",
                              borderRadius: "6px",
                              border: "1px solid var(--gold-500)"
                            }}
                          >
                            {discount}% OFF
                          </span>
                        ) : (
                          <span style={{ color: "var(--text-muted)", fontSize: "0.78rem" }}>Full Price</span>
                        )}
                      </td>

                      <td style={{ padding: "0.7rem", textAlign: "right" }}>
                        {discount > 0 ? (
                          <div>
                            <span style={{ textDecoration: "line-through", color: "var(--text-muted)", fontSize: "0.75rem", marginRight: "0.3rem" }}>
                              ₹{b.sellingPrice}
                            </span>
                            <strong style={{ color: "#34d399", fontSize: "0.95rem" }}>₹{discountedPrice}</strong>
                          </div>
                        ) : (
                          <strong>₹{b.sellingPrice}</strong>
                        )}
                      </td>

                      <td style={{ padding: "0.7rem", textAlign: "center" }}>
                        <div style={{ display: "flex", gap: "0.4rem", justifyContent: "center" }}>
                          {!isExpired && (
                            <button
                              type="button"
                              onClick={() => {
                                setCustomMarkdownBatch(b);
                                setCustomDiscount(b.discountApplied || (hours <= 6 ? 40 : 25));
                              }}
                              style={{
                                background: "rgba(245, 158, 11, 0.15)",
                                border: "1px solid var(--gold-500)",
                                color: "var(--gold-400)",
                                borderRadius: "6px",
                                padding: "0.3rem 0.6rem",
                                fontSize: "0.72rem",
                                fontWeight: 700,
                                cursor: "pointer"
                              }}
                            >
                              🏷️ Flash Sale
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => {
                              setWasteBatch(b);
                              setWasteQty(Math.min(b.quantityRemaining, 5));
                            }}
                            style={{
                              background: "rgba(239, 68, 68, 0.12)",
                              border: "1px solid rgba(239, 68, 68, 0.3)",
                              color: "#f87171",
                              borderRadius: "6px",
                              padding: "0.3rem 0.6rem",
                              fontSize: "0.72rem",
                              fontWeight: 600,
                              cursor: "pointer"
                            }}
                            title="Discard and log food waste"
                          >
                            🗑️ Log Waste
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Custom Flash Markdown Modal */}
      {customMarkdownBatch && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.8)",
            backdropFilter: "blur(6px)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "1rem"
          }}
          onClick={() => setCustomMarkdownBatch(null)}
        >
          <div
            className="glass-panel"
            style={{
              width: "100%",
              maxWidth: "460px",
              background: "#131722",
              padding: "1.8rem",
              borderRadius: "16px",
              border: "1px solid var(--border-color)",
              color: "#ffffff"
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ margin: "0 0 0.4rem", color: "var(--gold-400)", fontSize: "1.2rem" }}>
              ⚡ Trigger Flash Markdown Discount
            </h3>
            <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", margin: "0 0 1.2rem" }}>
              {customMarkdownBatch.productName} ({customMarkdownBatch.batchId})
            </p>

            <div style={{ marginBottom: "1.2rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", marginBottom: "0.4rem" }}>
                <span>Target Discount:</span>
                <strong style={{ color: "var(--gold-400)" }}>{customDiscount}% OFF</strong>
              </div>
              <input
                type="range"
                min="10"
                max="70"
                step="5"
                value={customDiscount}
                onChange={(e) => setCustomDiscount(parseInt(e.target.value, 10))}
                style={{ width: "100%", accentColor: "var(--gold-500)" }}
              />
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.72rem", color: "var(--text-muted)", marginTop: "0.3rem" }}>
                <span>10% (Gentle)</span>
                <span>35% (Night Market)</span>
                <span>70% (Clearance)</span>
              </div>
            </div>

            <div
              style={{
                background: "rgba(255,255,255,0.04)",
                padding: "0.8rem",
                borderRadius: "8px",
                marginBottom: "1.2rem",
                fontSize: "0.82rem"
              }}
            >
              <div>
                Original Price: <span style={{ textDecoration: "line-through" }}>₹{customMarkdownBatch.sellingPrice}</span>
              </div>
              <div style={{ marginTop: "0.2rem" }}>
                New Clearance Price:{" "}
                <strong style={{ color: "#34d399", fontSize: "1.1rem" }}>
                  ₹{(customMarkdownBatch.sellingPrice * (1 - customDiscount / 100)).toFixed(2)}
                </strong>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.6rem" }}>
              <button
                type="button"
                onClick={() => setCustomMarkdownBatch(null)}
                style={{
                  background: "rgba(255,255,255,0.06)",
                  border: "none",
                  color: "#cbd5e1",
                  borderRadius: "6px",
                  padding: "0.5rem 1rem",
                  cursor: "pointer"
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleApplyCustomMarkdown}
                style={{
                  background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
                  color: "#000000",
                  border: "none",
                  borderRadius: "6px",
                  padding: "0.5rem 1.4rem",
                  fontWeight: 800,
                  cursor: "pointer"
                }}
              >
                Publish Flash Sale
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Food Wastage Logging Modal */}
      {wasteBatch && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.8)",
            backdropFilter: "blur(6px)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "1rem"
          }}
          onClick={() => setWasteBatch(null)}
        >
          <div
            className="glass-panel"
            style={{
              width: "100%",
              maxWidth: "460px",
              background: "#131722",
              padding: "1.8rem",
              borderRadius: "16px",
              border: "1px solid var(--border-color)",
              color: "#ffffff"
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ margin: "0 0 0.4rem", color: "#f87171", fontSize: "1.2rem" }}>
              🗑️ Discard & Log Food Waste
            </h3>
            <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", margin: "0 0 1.2rem" }}>
              {wasteBatch.productName} ({wasteBatch.batchId})
            </p>

            <form onSubmit={handleLogWasteSubmit}>
              <div style={{ marginBottom: "1rem" }}>
                <label style={{ fontSize: "0.8rem", color: "var(--text-secondary)", display: "block", marginBottom: "0.3rem" }}>
                  DISCARD QUANTITY (UNITS):
                </label>
                <input
                  type="number"
                  min="1"
                  max={wasteBatch.quantityRemaining}
                  value={wasteQty}
                  onChange={(e) => setWasteQty(parseInt(e.target.value, 10))}
                  style={{
                    width: "100%",
                    background: "rgba(0,0,0,0.35)",
                    border: "1px solid var(--border-color)",
                    borderRadius: "8px",
                    padding: "0.55rem",
                    color: "#ffffff",
                    fontSize: "0.85rem"
                  }}
                />
              </div>

              <div style={{ marginBottom: "1.2rem" }}>
                <label style={{ fontSize: "0.8rem", color: "var(--text-secondary)", display: "block", marginBottom: "0.3rem" }}>
                  REASON FOR DISPOSAL:
                </label>
                <select
                  value={wasteReason}
                  onChange={(e) => setWasteReason(e.target.value)}
                  style={{
                    width: "100%",
                    background: "rgba(0,0,0,0.35)",
                    border: "1px solid var(--border-color)",
                    borderRadius: "8px",
                    padding: "0.55rem",
                    color: "#ffffff",
                    fontSize: "0.85rem"
                  }}
                >
                  <option value="Shelf-life expired">Shelf-life expired</option>
                  <option value="Burnt / over-baked">Burnt / over-baked</option>
                  <option value="Dropped / damaged handling">Dropped / transit damage</option>
                  <option value="Quality flaw">Texture flaw / collapsed sponge</option>
                </select>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.6rem" }}>
                <button
                  type="button"
                  onClick={() => setWasteBatch(null)}
                  style={{
                    background: "rgba(255,255,255,0.06)",
                    border: "none",
                    color: "#cbd5e1",
                    borderRadius: "6px",
                    padding: "0.5rem 1rem",
                    cursor: "pointer"
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
                    color: "#ffffff",
                    border: "none",
                    borderRadius: "6px",
                    padding: "0.5rem 1.4rem",
                    fontWeight: 700,
                    cursor: "pointer"
                  }}
                >
                  Confirm Disposal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
