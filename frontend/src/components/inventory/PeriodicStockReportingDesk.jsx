import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext.jsx";
import { useNotifications } from "../../context/NotificationContext.jsx";

const DEFAULT_ITEMS = [
  { productName: "Belgian Chocolate Truffle Cake", openingStock: 10, bakedPrepared: 8, soldConsumed: 12, wasteQty: 0, wasteReason: "", reorderThreshold: 5 },
  { productName: "French Butter Croissant", openingStock: 30, bakedPrepared: 24, soldConsumed: 35, wasteQty: 1, wasteReason: "Over-baked crust", reorderThreshold: 15 },
  { productName: "Wild Blueberry Danish", openingStock: 18, bakedPrepared: 12, soldConsumed: 16, wasteQty: 0, wasteReason: "", reorderThreshold: 8 },
  { productName: "Artisan Sourdough Boule", openingStock: 25, bakedPrepared: 10, soldConsumed: 14, wasteQty: 0, wasteReason: "", reorderThreshold: 10 }
];

const FALLBACK_BRANCHES = [
  { id: "BR-01", name: "Heritage Main Bakery (T. Nagar)" },
  { id: "BR-02", name: "Anna Nagar Flagship" },
  { id: "BR-03", name: "Koyambedu Express Hub" },
  { id: "BR-04", name: "OMR Cloud Kitchen & Master Production" }
];

const DEFAULT_TIME_SLOTS = [
  "08:00 AM – 10:00 AM (Morning Opening)",
  "10:00 AM – 12:00 PM (Mid-Morning Rush)",
  "12:00 PM – 02:00 PM (Lunch & Confectionery Peak)",
  "02:00 PM – 04:00 PM (Midday Replenishment)",
  "04:00 PM – 06:00 PM (Evening Tea Rush)",
  "06:00 PM – 08:00 PM (Celebration Cake Rush)",
  "08:00 PM – 10:00 PM (Store Closing & Reconciliation)"
];

export const PeriodicStockReportingDesk = () => {
  const auth = useAuth() || {};
  const currentUser = auth.currentUser;
  const activeBranchId = auth.activeBranchId;
  const { addNotification } = useNotifications();

  const [branches, setBranches] = useState(() => (auth.branches && auth.branches.length ? auth.branches : FALLBACK_BRANCHES));
  const [reports, setReports] = useState([]);
  const [timeSlots, setTimeSlots] = useState(DEFAULT_TIME_SLOTS);
  const [selectedSlot, setSelectedSlot] = useState(DEFAULT_TIME_SLOTS[2]);
  const [selectedBranchId, setSelectedBranchId] = useState(activeBranchId || "BR-01");
  const [items, setItems] = useState(DEFAULT_ITEMS);
  const [chefNotes, setChefNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [reviewModalReport, setReviewModalReport] = useState(null);
  const [managerReviewNotes, setManagerReviewNotes] = useState("");

  const userRole = currentUser?.role || "";
  const isChef = userRole === "chef" || userRole === "staff" || userRole === "head_baker";
  const isManager = userRole === "manager" || userRole === "branch_manager" || userRole === "bakery_owner";
  const isAdmin = userRole === "admin" || userRole === "super_admin" || userRole === "bakery_owner";

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
        .catch((e) => console.warn("Failed to load branches in PeriodicStockReportingDesk:", e));
    }
  }, [auth.branches]);

  useEffect(() => {
    fetchStockReports();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedBranchId, filterStatus]);

  const fetchStockReports = async () => {
    try {
      const url = new URL("http://localhost:5000/api/inventory/stock-reports");
      if (selectedBranchId && selectedBranchId !== "ALL") {
        url.searchParams.append("branchId", selectedBranchId);
      }
      if (filterStatus && filterStatus !== "ALL") {
        url.searchParams.append("status", filterStatus);
      }
      const res = await fetch(url.toString());
      const data = await res.json();
      if (res.ok) {
        setReports(data.reports || []);
        if (data.timeSlots) {
          setTimeSlots(data.timeSlots);
          if (!selectedSlot && data.timeSlots.length) {
            setSelectedSlot(data.timeSlots[2]); // default midday
          }
        }
      }
    } catch (err) {
      console.error("Error loading stock reports:", err);
    }
  };

  const handleItemChange = (index, field, value) => {
    setItems((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleAddItemRow = () => {
    setItems((prev) => [
      ...prev,
      {
        productName: "New Fresh Baked Item",
        openingStock: 10,
        bakedPrepared: 10,
        soldConsumed: 5,
        wasteQty: 0,
        wasteReason: "",
        reorderThreshold: 5
      }
    ]);
  };

  const handleRemoveItemRow = (index) => {
    setItems((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleSubmitReport = async (e) => {
    e.preventDefault();
    if (!items.length) {
      alert("Please include at least one product in your periodic stock count.");
      return;
    }

    setIsSubmitting(true);
    const branchObj = (branches || []).find((b) => b.id === selectedBranchId) || (branches && branches[0]) || { name: "Flagship T. Nagar Hub" };

    try {
      const token = sessionStorage.getItem("bakesphere_jwt") || localStorage.getItem("bakesphere_jwt");
      const res = await fetch("http://localhost:5000/api/inventory/stock-reports", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": "bakesphere_dev_key_2026",
          ...(token ? { "Authorization": `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          branchId: selectedBranchId,
          branchName: branchObj ? branchObj.name : "Flagship T. Nagar Hub",
          slot: selectedSlot,
          items: items.map((it) => {
            const closing = Math.max(
              0,
              (parseInt(it.openingStock, 10) || 0) +
                (parseInt(it.bakedPrepared, 10) || 0) -
                (parseInt(it.soldConsumed, 10) || 0) -
                (parseInt(it.wasteQty, 10) || 0)
            );
            return {
              ...it,
              closingStock: closing,
              isLowStock: closing <= (parseInt(it.reorderThreshold, 10) || 5)
            };
          }),
          chefNotes
        })
      });

      const data = await res.json();
      if (res.ok) {
        addNotification({
          title: "Periodic Stock Report Logged! 📋",
          message: `Report ${data.report.reportNumber} for ${selectedSlot} submitted. Forwarded to Manager for verification.`,
          type: "success"
        });
        setChefNotes("");
        fetchStockReports();
      } else {
        alert(data.error || "Failed to submit stock report.");
      }
      setIsSubmitting(false);
    } catch (err) {
      console.error(err);
      alert("Error submitting stock report.");
      setIsSubmitting(false);
    }
  };

  const handleReviewStatus = async (reportId, newStatus) => {
    try {
      const token = sessionStorage.getItem("bakesphere_jwt") || localStorage.getItem("bakesphere_jwt");
      const res = await fetch(`http://localhost:5000/api/inventory/stock-reports/${reportId}/review`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": "bakesphere_dev_key_2026",
          ...(token ? { "Authorization": `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          status: newStatus,
          managerNotes: managerReviewNotes
        })
      });

      if (res.ok) {
        addNotification({
          title: "Stock Report Reviewed! ✅",
          message: `Report status updated to ${newStatus.replace(/_/g, " ")}.`,
          type: "info"
        });
        setReviewModalReport(null);
        setManagerReviewNotes("");
        fetchStockReports();
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
              ⏱️ Chef ➔ Manager ➔ Admin Periodic Workflow
            </div>
            <h2 style={{ fontSize: "1.6rem", fontWeight: 800, color: "var(--text-primary)", margin: "0 0 0.4rem" }}>
              2-Hour Interval Stock & Wastage Reporting Desk
            </h2>
            <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", margin: 0 }}>
              Live shift accountability: Track opening stock, newly baked oven output, counter sales, and defect wastage every 2 hours.
            </p>
          </div>

          {/* Branch Scoping Pill */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>Branch Scope:</span>
            <select
              value={selectedBranchId}
              onChange={(e) => setSelectedBranchId(e.target.value)}
              disabled={isManager && currentUser?.branchId}
              style={{
                background: "rgba(0,0,0,0.35)",
                color: "#ffffff",
                border: "1px solid var(--border-color)",
                borderRadius: "8px",
                padding: "0.5rem 0.8rem",
                fontSize: "0.85rem",
                fontWeight: 700
              }}
            >
              {isAdmin && <option value="ALL">All Flagship Branches</option>}
              {(branches || []).map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Chef Entry Desk (Rendered for Chef, Staff, or Admin) */}
      {(isChef || isAdmin || isManager) && (
        <div className="glass-panel" style={{ padding: "1.5rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem", flexWrap: "wrap", gap: "0.5rem" }}>
            <div>
              <h3 style={{ fontSize: "1.2rem", fontWeight: 700, color: "var(--gold-400)", margin: "0 0 0.2rem" }}>
                👨‍🍳 Log 2-Hour Shift Stock Count
              </h3>
              <p style={{ fontSize: "0.78rem", color: "var(--text-muted)", margin: 0 }}>
                Logged by: <strong>{currentUser?.name || "Chef Pierre Bouchard"}</strong> ({currentUser?.role || "head_baker"})
              </p>
            </div>

            {/* Time slot picker */}
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <span style={{ fontSize: "0.82rem", color: "var(--text-secondary)" }}>Reporting Slot:</span>
              <select
                value={selectedSlot}
                onChange={(e) => setSelectedSlot(e.target.value)}
                style={{
                  background: "rgba(0,0,0,0.4)",
                  color: "var(--gold-400)",
                  border: "1px solid var(--gold-500)",
                  borderRadius: "8px",
                  padding: "0.45rem 0.8rem",
                  fontSize: "0.82rem",
                  fontWeight: 700
                }}
              >
                {(timeSlots || []).map((slot) => (
                  <option key={slot} value={slot}>
                    {slot}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <form onSubmit={handleSubmitReport}>
            {/* Table of items */}
            <div style={{ overflowX: "auto", marginBottom: "1rem" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.84rem" }}>
                <thead>
                  <tr style={{ background: "rgba(255,255,255,0.04)", borderBottom: "1px solid var(--border-color)" }}>
                    <th style={{ padding: "0.6rem", textAlign: "left", color: "var(--text-secondary)" }}>Product Item</th>
                    <th style={{ padding: "0.6rem", textAlign: "center", color: "var(--text-secondary)" }}>Opening</th>
                    <th style={{ padding: "0.6rem", textAlign: "center", color: "#34d399" }}>+ Baked / Prepped</th>
                    <th style={{ padding: "0.6rem", textAlign: "center", color: "var(--gold-400)" }}>- Sold / Consumed</th>
                    <th style={{ padding: "0.6rem", textAlign: "center", color: "#f87171" }}>- Wastage</th>
                    <th style={{ padding: "0.6rem", textAlign: "left", color: "var(--text-secondary)" }}>Wastage Reason</th>
                    <th style={{ padding: "0.6rem", textAlign: "center", color: "var(--text-secondary)" }}>Closing Stock</th>
                    <th style={{ padding: "0.6rem", textAlign: "center", color: "var(--text-secondary)" }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((row, idx) => {
                    const closing = Math.max(
                      0,
                      (parseInt(row.openingStock, 10) || 0) +
                        (parseInt(row.bakedPrepared, 10) || 0) -
                        (parseInt(row.soldConsumed, 10) || 0) -
                        (parseInt(row.wasteQty, 10) || 0)
                    );
                    const isLow = closing <= (parseInt(row.reorderThreshold, 10) || 5);

                    return (
                      <tr key={idx} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                        <td style={{ padding: "0.5rem" }}>
                          <input
                            type="text"
                            value={row.productName}
                            onChange={(e) => handleItemChange(idx, "productName", e.target.value)}
                            style={{
                              width: "100%",
                              background: "rgba(0,0,0,0.25)",
                              border: "1px solid rgba(255,255,255,0.1)",
                              borderRadius: "6px",
                              padding: "0.4rem 0.6rem",
                              color: "#ffffff",
                              fontSize: "0.82rem"
                            }}
                          />
                        </td>
                        <td style={{ padding: "0.5rem", textAlign: "center" }}>
                          <input
                            type="number"
                            min="0"
                            value={row.openingStock}
                            onChange={(e) => handleItemChange(idx, "openingStock", e.target.value)}
                            style={{
                              width: "60px",
                              textAlign: "center",
                              background: "rgba(0,0,0,0.25)",
                              border: "1px solid rgba(255,255,255,0.1)",
                              borderRadius: "6px",
                              padding: "0.4rem",
                              color: "#ffffff"
                            }}
                          />
                        </td>
                        <td style={{ padding: "0.5rem", textAlign: "center" }}>
                          <input
                            type="number"
                            min="0"
                            value={row.bakedPrepared}
                            onChange={(e) => handleItemChange(idx, "bakedPrepared", e.target.value)}
                            style={{
                              width: "60px",
                              textAlign: "center",
                              background: "rgba(16, 185, 129, 0.1)",
                              border: "1px solid rgba(16, 185, 129, 0.3)",
                              borderRadius: "6px",
                              padding: "0.4rem",
                              color: "#34d399",
                              fontWeight: 700
                            }}
                          />
                        </td>
                        <td style={{ padding: "0.5rem", textAlign: "center" }}>
                          <input
                            type="number"
                            min="0"
                            value={row.soldConsumed}
                            onChange={(e) => handleItemChange(idx, "soldConsumed", e.target.value)}
                            style={{
                              width: "60px",
                              textAlign: "center",
                              background: "rgba(245, 158, 11, 0.1)",
                              border: "1px solid rgba(245, 158, 11, 0.3)",
                              borderRadius: "6px",
                              padding: "0.4rem",
                              color: "var(--gold-400)",
                              fontWeight: 700
                            }}
                          />
                        </td>
                        <td style={{ padding: "0.5rem", textAlign: "center" }}>
                          <input
                            type="number"
                            min="0"
                            value={row.wasteQty}
                            onChange={(e) => handleItemChange(idx, "wasteQty", e.target.value)}
                            style={{
                              width: "60px",
                              textAlign: "center",
                              background: "rgba(239, 68, 68, 0.1)",
                              border: "1px solid rgba(239, 68, 68, 0.3)",
                              borderRadius: "6px",
                              padding: "0.4rem",
                              color: "#f87171",
                              fontWeight: 700
                            }}
                          />
                        </td>
                        <td style={{ padding: "0.5rem" }}>
                          <select
                            value={row.wasteReason}
                            onChange={(e) => handleItemChange(idx, "wasteReason", e.target.value)}
                            style={{
                              width: "100%",
                              background: "rgba(0,0,0,0.25)",
                              border: "1px solid rgba(255,255,255,0.1)",
                              borderRadius: "6px",
                              padding: "0.4rem",
                              color: row.wasteQty > 0 ? "#f87171" : "#94a3b8",
                              fontSize: "0.78rem"
                            }}
                          >
                            <option value="">None (Good batch)</option>
                            <option value="Over-baked crust">Over-baked / burnt crust</option>
                            <option value="Imperfect lamination fold">Imperfect lamination / puff fold</option>
                            <option value="Dropped / damaged handling">Dropped / transport damage</option>
                            <option value="Shelf-life expired">Shelf-life expired</option>
                            <option value="Texture flaw">Under-proofed / collapsed</option>
                          </select>
                        </td>
                        <td style={{ padding: "0.5rem", textAlign: "center" }}>
                          <span
                            style={{
                              fontWeight: 800,
                              color: isLow ? "#fb7185" : "#ffffff",
                              background: isLow ? "rgba(244, 63, 94, 0.15)" : "transparent",
                              padding: "0.2rem 0.5rem",
                              borderRadius: "4px"
                            }}
                          >
                            {closing} {isLow && "⚠️ Low"}
                          </span>
                        </td>
                        <td style={{ padding: "0.5rem", textAlign: "center" }}>
                          <button
                            type="button"
                            onClick={() => handleRemoveItemRow(idx)}
                            style={{
                              background: "transparent",
                              border: "none",
                              color: "#f87171",
                              cursor: "pointer",
                              fontSize: "0.9rem"
                            }}
                            title="Remove item"
                          >
                            ✕
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Row actions & notes */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem", flexWrap: "wrap", gap: "0.8rem" }}>
              <button
                type="button"
                onClick={handleAddItemRow}
                style={{
                  background: "rgba(255,255,255,0.06)",
                  border: "1px dashed rgba(255,255,255,0.2)",
                  color: "#cbd5e1",
                  padding: "0.45rem 1rem",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontSize: "0.8rem",
                  fontWeight: 600
                }}
              >
                + Add Another Product Row
              </button>

              <div style={{ flex: 1, minWidth: "260px", maxWidth: "500px" }}>
                <input
                  type="text"
                  placeholder="Chef notes (e.g. Next croissant oven batch ready at 11:30 AM)..."
                  value={chefNotes}
                  onChange={(e) => setChefNotes(e.target.value)}
                  style={{
                    width: "100%",
                    background: "rgba(0,0,0,0.3)",
                    border: "1px solid var(--border-color)",
                    borderRadius: "8px",
                    padding: "0.5rem 0.8rem",
                    color: "#ffffff",
                    fontSize: "0.82rem"
                  }}
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                style={{
                  background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
                  color: "#000000",
                  border: "none",
                  borderRadius: "8px",
                  padding: "0.6rem 1.4rem",
                  fontSize: "0.85rem",
                  fontWeight: 800,
                  cursor: "pointer",
                  boxShadow: "0 4px 12px rgba(245, 158, 11, 0.35)"
                }}
              >
                {isSubmitting ? "Submitting Report..." : "📋 Submit 2-Hour Report to Manager"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Historical Stock Reports & Manager Approval Queue */}
      <div className="glass-panel" style={{ padding: "1.5rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.2rem", flexWrap: "wrap", gap: "0.8rem" }}>
          <div>
            <h3 style={{ fontSize: "1.2rem", fontWeight: 700, color: "var(--text-primary)", margin: "0 0 0.2rem" }}>
              📑 Periodic Stock Reports Audit Log
            </h3>
            <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", margin: 0 }}>
              Chef submissions requiring Manager verification and Admin central aggregation.
            </p>
          </div>

          {/* Filter Pills */}
          <div style={{ display: "flex", gap: "0.4rem" }}>
            {[
              { id: "ALL", label: "All Statuses" },
              { id: "submitted_by_chef", label: "⏳ Pending Manager" },
              { id: "approved_by_manager", label: "✅ Manager Approved" },
              { id: "reviewed_by_admin", label: "👑 Admin Reviewed" }
            ].map((st) => (
              <button
                key={st.id}
                type="button"
                onClick={() => setFilterStatus(st.id)}
                style={{
                  background: filterStatus === st.id ? "var(--gold-500)" : "rgba(255,255,255,0.05)",
                  color: filterStatus === st.id ? "#000000" : "#cbd5e1",
                  border: "none",
                  borderRadius: "6px",
                  padding: "0.35rem 0.75rem",
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  cursor: "pointer"
                }}
              >
                {st.label}
              </button>
            ))}
          </div>
        </div>

        {reports.length === 0 ? (
          <div style={{ textAlign: "center", padding: "2.5rem", color: "var(--text-muted)" }}>
            <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>📋</div>
            <p>No periodic stock reports match the selected filters.</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {reports.map((rep) => (
              <div
                key={rep.id}
                style={{
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: "12px",
                  padding: "1.2rem",
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.8rem"
                }}
              >
                {/* Header row */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.5rem" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                    <span style={{ fontWeight: 800, color: "var(--gold-400)", fontSize: "0.95rem" }}>
                      {rep.reportNumber}
                    </span>
                    <span style={{ fontSize: "0.8rem", color: "#cbd5e1" }}>• {rep.branchName}</span>
                    <span
                      style={{
                        background: "rgba(255,255,255,0.06)",
                        padding: "0.2rem 0.5rem",
                        borderRadius: "4px",
                        fontSize: "0.75rem",
                        color: "var(--text-secondary)"
                      }}
                    >
                      🕒 {rep.slot}
                    </span>
                  </div>

                  {/* Status Badge */}
                  <div>
                    {rep.status === "approved_by_manager" ? (
                      <span className="badge badge-emerald">✅ Approved by Manager ({rep.managerName})</span>
                    ) : rep.status === "reviewed_by_admin" ? (
                      <span className="badge badge-gold">👑 Central Admin Verified</span>
                    ) : (
                      <span className="badge badge-rose">⏳ Pending Manager Review</span>
                    )}
                  </div>
                </div>

                {/* KPI Metrics summary */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: "0.8rem" }}>
                  <div style={{ background: "rgba(0,0,0,0.2)", padding: "0.6rem", borderRadius: "8px" }}>
                    <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>Total Baked</div>
                    <div style={{ fontSize: "1.1rem", fontWeight: 800, color: "#34d399" }}>+{rep.totalBaked} units</div>
                  </div>
                  <div style={{ background: "rgba(0,0,0,0.2)", padding: "0.6rem", borderRadius: "8px" }}>
                    <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>Total Sold</div>
                    <div style={{ fontSize: "1.1rem", fontWeight: 800, color: "var(--gold-400)" }}>{rep.totalSold} units</div>
                  </div>
                  <div style={{ background: "rgba(0,0,0,0.2)", padding: "0.6rem", borderRadius: "8px" }}>
                    <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>Food Wastage</div>
                    <div style={{ fontSize: "1.1rem", fontWeight: 800, color: rep.totalWastage > 0 ? "#f87171" : "#94a3b8" }}>
                      {rep.totalWastage} units
                    </div>
                  </div>
                  <div style={{ background: "rgba(0,0,0,0.2)", padding: "0.6rem", borderRadius: "8px" }}>
                    <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>Reported By</div>
                    <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "#ffffff" }}>{rep.reportedBy}</div>
                  </div>
                </div>

                {/* Chef Notes & Manager Review notes */}
                {rep.chefNotes && (
                  <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)", background: "rgba(0,0,0,0.15)", padding: "0.5rem 0.8rem", borderRadius: "6px" }}>
                    💬 <em>Chef Note: "{rep.chefNotes}"</em>
                  </div>
                )}
                {rep.managerNotes && (
                  <div style={{ fontSize: "0.8rem", color: "#34d399", background: "rgba(16, 185, 129, 0.08)", padding: "0.5rem 0.8rem", borderRadius: "6px" }}>
                    🛡️ <em>Manager Verification: "{rep.managerNotes}"</em>
                  </div>
                )}

                {/* Action button for manager/admin */}
                {(isManager || isAdmin) && rep.status === "submitted_by_chef" && (
                  <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.6rem", paddingTop: "0.4rem" }}>
                    <button
                      type="button"
                      onClick={() => setReviewModalReport(rep)}
                      style={{
                        background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                        color: "#ffffff",
                        border: "none",
                        borderRadius: "6px",
                        padding: "0.45rem 1rem",
                        fontSize: "0.8rem",
                        fontWeight: 700,
                        cursor: "pointer"
                      }}
                    >
                      🔍 Verify & Approve Report
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Manager Review Modal */}
      {reviewModalReport && (
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
          onClick={() => setReviewModalReport(null)}
        >
          <div
            className="glass-panel"
            style={{
              width: "100%",
              maxWidth: "540px",
              background: "#131722",
              padding: "1.8rem",
              borderRadius: "16px",
              border: "1px solid var(--border-color)",
              color: "#ffffff"
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ margin: "0 0 0.5rem", color: "var(--gold-400)", fontSize: "1.25rem" }}>
              Manager Verification: {reviewModalReport.reportNumber}
            </h3>
            <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", margin: "0 0 1rem" }}>
              {reviewModalReport.branchName} • {reviewModalReport.slot}
            </p>

            <div style={{ marginBottom: "1.2rem" }}>
              <label style={{ fontSize: "0.8rem", color: "var(--text-secondary)", display: "block", marginBottom: "0.4rem" }}>
                MANAGER VERIFICATION NOTES:
              </label>
              <textarea
                rows={3}
                placeholder="Physical tray counts match. Shift inventory accepted..."
                value={managerReviewNotes}
                onChange={(e) => setManagerReviewNotes(e.target.value)}
                style={{
                  width: "100%",
                  background: "rgba(0,0,0,0.35)",
                  border: "1px solid var(--border-color)",
                  borderRadius: "8px",
                  padding: "0.6rem",
                  color: "#ffffff",
                  fontSize: "0.85rem"
                }}
              />
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.6rem" }}>
              <button
                type="button"
                onClick={() => setReviewModalReport(null)}
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
                onClick={() => handleReviewStatus(reviewModalReport.id, "approved_by_manager")}
                style={{
                  background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: "6px",
                  padding: "0.5rem 1.2rem",
                  fontWeight: 700,
                  cursor: "pointer"
                }}
              >
                ✅ Confirm & Approve
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
