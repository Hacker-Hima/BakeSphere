import { useState, useEffect } from "react";
import { useLanguage } from "../../context/LanguageContext.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { handleImageError, getSafeImageUrl } from "../../utils/imageFallback.js";

export const DashboardHome = ({ onNavigateTab }) => {
  const { t } = useLanguage();
  const { currentUser } = useAuth();

  const [selectedBranchId, setSelectedBranchId] = useState("ALL");
  const [dashboardData, setDashboardData] = useState(null);
  const [fefoAlerts, setFefoAlerts] = useState(null);
  const [auditLogs, setAuditLogs] = useState([]);
  const [activeSubTab, setActiveSubTab] = useState("overview"); // "overview" | "benchmarking" | "ai-kitchen"
  const [loading, setLoading] = useState(true);
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [exportData, setExportData] = useState(null);

  const fetchDashboard = async (branchId = selectedBranchId) => {
    setLoading(true);
    try {
      const url = branchId === "ALL" 
        ? "http://localhost:5000/api/analytics/dashboard" 
        : `http://localhost:5000/api/analytics/dashboard?branchId=${branchId}`;

      const [dashRes, fefoRes, auditRes] = await Promise.all([
        fetch(url),
        fetch("http://localhost:5000/api/inventory/fefo-alerts"),
        fetch("http://localhost:5000/api/audit")
      ]);

      const [dashJson, fefoJson, auditJson] = await Promise.all([
        dashRes.json(),
        fefoRes.json(),
        auditRes.json()
      ]);

      setDashboardData(dashJson);
      setFefoAlerts(fefoJson);
      setAuditLogs(auditJson.logs || []);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard(selectedBranchId);
  }, [selectedBranchId]);

  const handleBranchChange = (branchId) => {
    setSelectedBranchId(branchId);
  };

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
        alert(`25% Happy Hour Flash Markdown applied to batch ${batchId}!`);
        const fefoRes = await fetch("http://localhost:5000/api/inventory/fefo-alerts");
        const fefoJson = await fefoRes.json();
        setFefoAlerts(fefoJson);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleExportSummary = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/analytics/export-summary");
      const json = await res.json();
      setExportData(json);
      setExportModalOpen(true);
    } catch (err) {
      console.error(err);
      alert("Failed to generate executive report");
    }
  };

  const downloadJsonReport = () => {
    if (!exportData) return;
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `BakeSphere-Executive-PL-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading && !dashboardData) {
    return (
      <div style={{ padding: "3rem", textAlign: "center", color: "var(--gold-400)" }}>
        <div style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>🥐</div>
        <div style={{ fontWeight: 600 }}>Loading BakeSphere Executive Intelligence Dashboard...</div>
      </div>
    );
  }

  const kpis = dashboardData ? dashboardData.kpis : {
    todaySales: 178970,
    todayProfit: 93064.4,
    profitMarginPercent: "52%",
    activeOrdersCount: 22,
    todayWastageCost: 1450.0,
    lowStockIngredientsCount: 2,
    batchesExpiringTodayCount: 1,
    fefoComplianceScore: "98.2%",
    satisfactionRating: 4.88
  };

  const branches = dashboardData?.branches || [];
  const operational = dashboardData?.operationalRecommendations || {
    dailyBakingSchedule: [],
    morningPrepChecklist: [],
    aiWastageMitigationAdvice: []
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      {/* Top Header & Branch Scope Filter */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: "1rem",
        background: "rgba(255, 255, 255, 0.02)",
        border: "1px solid var(--border-subtle)",
        borderRadius: "var(--radius-lg)",
        padding: "1rem 1.5rem"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.8rem" }}>
          <span style={{ fontSize: "1.5rem" }}>🏢</span>
          <div>
            <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px" }}>
              Active Branch Telemetry Scope
            </div>
            <div style={{ fontWeight: 700, color: "var(--text-primary)", fontSize: "1.1rem" }}>
              {selectedBranchId === "ALL" ? "Chennai Consolidated (All 4 Hubs)" : dashboardData?.selectedBranch?.name || selectedBranchId}
            </div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "0.8rem", flexWrap: "wrap" }}>
          <select
            value={selectedBranchId}
            onChange={(e) => handleBranchChange(e.target.value)}
            style={{
              padding: "0.6rem 1.2rem",
              background: "#1c1917",
              border: "1px solid var(--gold-500)",
              borderRadius: "var(--radius-md)",
              color: "var(--gold-400)",
              fontWeight: 600,
              fontSize: "0.9rem",
              cursor: "pointer",
              outline: "none"
            }}
          >
            <option value="ALL">🌐 All Hubs (Consolidated Executive)</option>
            {branches.map((b) => (
              <option key={b.id} value={b.id}>
                📍 {b.name} ({b.locality})
              </option>
            ))}
          </select>

          <button
            onClick={handleExportSummary}
            className="btn-outline"
            style={{ display: "flex", alignItems: "center", gap: "0.4rem", padding: "0.6rem 1rem", fontSize: "0.88rem" }}
          >
            <span>📊</span> Export P&L Report
          </button>
        </div>
      </div>

      {/* Hero Welcome Banner */}
      <div style={{
        position: "relative",
        borderRadius: "var(--radius-lg)",
        overflow: "hidden",
        border: "1px solid var(--border-subtle)",
        boxShadow: "var(--shadow-card)",
        minHeight: "260px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: "1.5rem"
      }}>
        <img
          src={getSafeImageUrl("https://images.unsplash.com/photo-1509440159596-0249088772ff?w=1400&auto=format&fit=crop&q=80")}
          alt="BakeSphere Artisan Patisserie"
          style={{
            position: "absolute",
            width: "100%",
            height: "100%",
            objectFit: "cover",
            filter: "brightness(0.32)"
          }}
          onError={handleImageError}
        />
        <div style={{
          position: "relative",
          zIndex: 2,
          padding: "2rem 2.5rem",
          maxWidth: "760px",
          flex: "1 1 480px"
        }}>
          <div className="badge badge-gold" style={{ marginBottom: "0.75rem" }}>
            ✨ {currentUser ? `${currentUser.roleLabel} Portal` : "Executive Suite"} • Live Telemetry
          </div>
          <h1 style={{
            fontSize: "2.3rem",
            fontWeight: 800,
            lineHeight: 1.15,
            marginBottom: "0.6rem",
            color: "#fff"
          }}>
            {t("welcome")}, <span className="gold-text">{currentUser ? currentUser.name : "Manager"}</span>
          </h1>
          <p style={{ fontSize: "0.95rem", color: "var(--text-secondary)", marginBottom: "1.2rem", lineHeight: 1.6 }}>
            {selectedBranchId === "ALL"
              ? "Consolidated multi-branch bakery operations, cross-hub benchmarking, and AI culinary scheduling across 4 Chennai hubs."
              : `Real-time operational cockpit for ${dashboardData?.selectedBranch?.name || selectedBranchId}. Track shift baking, stock depletion, and customer ratings.`
            }
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.8rem" }}>
            <button onClick={() => onNavigateTab("pos")} className="btn-gold">
              <span>🛒</span> {t("newOrder")}
            </button>
            <button onClick={() => onNavigateTab("production")} className="btn-outline">
              <span>🧑‍🍳</span> {t("startBaking")}
            </button>
            <button onClick={() => onNavigateTab("custom-cake")} className="btn-outline">
              <span>🎂</span> {t("customOrder")}
            </button>
            <button onClick={() => onNavigateTab("ai-forecast")} className="btn-outline">
              <span>📈</span> AI Demand Forecaster
            </button>
          </div>
        </div>

        {/* Grand Big Master Logo Feature Inside Dashboard Hero */}
        <div className="bk-dashboard-hero-logo-showcase">
          <div className="bk-dashboard-logo-ambient-aura" />
          <img
            src="/artisan-glowing-logo-clean.png"
            alt="BakeSphere Master Brand Logo"
            className="bk-dashboard-grand-logo-img"
          />
        </div>
      </div>

      {/* Top KPI Cards Grid */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
        gap: "1.2rem"
      }}>
        {/* Revenue */}
        <div className="glass-panel" style={{ padding: "1.3rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", color: "var(--text-muted)", fontSize: "0.82rem", marginBottom: "0.4rem" }}>
            <span>{t("todaySales")}</span>
            <span style={{ color: "var(--gold-400)", fontSize: "1.1rem" }}>💰</span>
          </div>
          <div style={{ fontSize: "1.8rem", fontWeight: 700, color: "var(--text-primary)" }}>
            ₹{kpis.todaySales.toLocaleString("en-IN")}
          </div>
          <div style={{ fontSize: "0.75rem", color: "#34d399", marginTop: "0.4rem" }}>
            ▲ +18.4% vs benchmark run-rate
          </div>
        </div>

        {/* Profit */}
        <div className="glass-panel" style={{ padding: "1.3rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", color: "var(--text-muted)", fontSize: "0.82rem", marginBottom: "0.4rem" }}>
            <span>{t("todayProfit")}</span>
            <span style={{ color: "#34d399", fontSize: "1.1rem" }}>📈</span>
          </div>
          <div style={{ fontSize: "1.8rem", fontWeight: 700, color: "#34d399" }}>
            ₹{kpis.todayProfit.toLocaleString("en-IN")}
          </div>
          <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.4rem" }}>
            Margin: <span style={{ color: "var(--gold-400)", fontWeight: 600 }}>{kpis.profitMarginPercent}</span>
          </div>
        </div>

        {/* FEFO Compliance Score */}
        <div className="glass-panel" style={{ padding: "1.3rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", color: "var(--text-muted)", fontSize: "0.82rem", marginBottom: "0.4rem" }}>
            <span>FEFO Compliance</span>
            <span style={{ color: "#10b981", fontSize: "1.1rem" }}>🌿</span>
          </div>
          <div style={{ fontSize: "1.8rem", fontWeight: 700, color: "#10b981" }}>
            {kpis.fefoComplianceScore || "98.2%"}
          </div>
          <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginTop: "0.4rem" }}>
            Zero-waste batch depletion
          </div>
        </div>

        {/* Customer Rating Index */}
        <div
          className="glass-panel"
          style={{ padding: "1.3rem", cursor: "pointer" }}
          onClick={() => onNavigateTab("feedback")}
        >
          <div style={{ display: "flex", justifyContent: "space-between", color: "var(--text-muted)", fontSize: "0.82rem", marginBottom: "0.4rem" }}>
            <span>Customer Rating</span>
            <span style={{ color: "#fbbf24", fontSize: "1.1rem" }}>⭐</span>
          </div>
          <div style={{ fontSize: "1.8rem", fontWeight: 700, color: "#fbbf24" }}>
            {kpis.satisfactionRating} / 5.0
          </div>
          <div style={{ fontSize: "0.75rem", color: "var(--gold-400)", marginTop: "0.4rem" }}>
            Inspect guest reviews ➔
          </div>
        </div>

        {/* Wastage */}
        <div className="glass-panel" style={{ padding: "1.3rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", color: "var(--text-muted)", fontSize: "0.82rem", marginBottom: "0.4rem" }}>
            <span>{t("wastageCost")}</span>
            <span style={{ color: "#fb7185", fontSize: "1.1rem" }}>🗑️</span>
          </div>
          <div style={{ fontSize: "1.8rem", fontWeight: 700, color: "#fb7185" }}>
            ₹{kpis.todayWastageCost.toLocaleString("en-IN")}
          </div>
          <div style={{ fontSize: "0.75rem", color: "#34d399", marginTop: "0.4rem" }}>
            ▼ -14.2% with AI optimization
          </div>
        </div>

        {/* Expiring Batches */}
        <div
          className="glass-panel"
          style={{ padding: "1.3rem", cursor: "pointer", border: "1px solid rgba(244, 63, 94, 0.4)" }}
          onClick={() => onNavigateTab("inventory")}
        >
          <div style={{ display: "flex", justifyContent: "space-between", color: "var(--text-muted)", fontSize: "0.82rem", marginBottom: "0.4rem" }}>
            <span>{t("expiringBatches")}</span>
            <span style={{ color: "#fb7185", fontSize: "1.1rem" }}>⏳</span>
          </div>
          <div style={{ fontSize: "1.8rem", fontWeight: 700, color: "#fb7185" }}>
            {kpis.batchesExpiringTodayCount} Batch
          </div>
          <div style={{ fontSize: "0.75rem", color: "#fb7185", marginTop: "0.4rem" }}>
            Action: 25% Flash Sale
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div style={{
        display: "flex",
        gap: "0.6rem",
        borderBottom: "1px solid var(--border-subtle)",
        paddingBottom: "0.5rem",
        flexWrap: "wrap"
      }}>
        <button
          onClick={() => setActiveSubTab("overview")}
          className={activeSubTab === "overview" ? "btn-gold" : "btn-outline"}
          style={{ padding: "0.6rem 1.4rem", fontSize: "0.9rem" }}
        >
          📊 Overview & Velocity
        </button>
        <button
          onClick={() => setActiveSubTab("benchmarking")}
          className={activeSubTab === "benchmarking" ? "btn-gold" : "btn-outline"}
          style={{ padding: "0.6rem 1.4rem", fontSize: "0.9rem" }}
        >
          🏪 Multi-Branch Benchmarking Matrix
        </button>
        <button
          onClick={() => setActiveSubTab("ai-kitchen")}
          className={activeSubTab === "ai-kitchen" ? "btn-gold" : "btn-outline"}
          style={{ padding: "0.6rem 1.4rem", fontSize: "0.9rem" }}
        >
          🧑‍🍳 Operational AI & Shift Schedule
        </button>
      </div>

      {/* FEFO Near-Expiry Alert Banner (If Any) */}
      {fefoAlerts && fefoAlerts.expiringToday && fefoAlerts.expiringToday.length > 0 && (
        <div style={{
          background: "#fff1f2",
          border: "1px solid #fecdd3",
          borderRadius: "var(--radius-lg)",
          padding: "1.2rem 1.5rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "1rem",
          boxShadow: "var(--shadow-sm)"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <div style={{ fontSize: "2rem" }}>🚨</div>
            <div>
              <div style={{ fontWeight: 700, color: "#9f1239", fontSize: "1rem" }}>
                FEFO Expiry Alert: {fefoAlerts.expiringToday[0].productName} ({fefoAlerts.expiringToday[0].quantityRemaining} units)
              </div>
              <div style={{ fontSize: "0.84rem", color: "#4b5563" }}>
                Expires in {fefoAlerts.expiringToday[0].hoursRemaining} hours. Estimated loss if unsold: ₹{fefoAlerts.expiringToday[0].estimatedLossIfUnsold}.
              </div>
            </div>
          </div>
          <div style={{ display: "flex", gap: "0.6rem" }}>
            <button
              onClick={() => handleApplyMarkdown(fefoAlerts.expiringToday[0].batchId)}
              className="btn-gold"
              style={{ background: "var(--rose-gradient)", color: "#fff" }}
            >
              🏷️ Trigger 25% Flash Markdown
            </button>
            <button onClick={() => onNavigateTab("inventory")} className="btn-outline">
              Inspect Batches
            </button>
          </div>
        </div>
      )}

      {/* TAB 1: OVERVIEW & HOURLY VELOCITY */}
      {activeSubTab === "overview" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
          {/* Analytical Charts & Sales Velocity Grid */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))",
            gap: "1.5rem"
          }}>
            {/* Peak Hours Velocity Chart */}
            <div className="glass-panel" style={{ padding: "1.5rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.2rem" }}>
                <div>
                  <h3 style={{ fontSize: "1.15rem", fontWeight: 700, color: "var(--text-primary)" }}>
                    🕒 Daily Peak Sales Velocity
                  </h3>
                  <p style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
                    Hourly transaction volume across all POS counters
                  </p>
                </div>
                <span className="badge badge-gold">Evening Rush Peak</span>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "0.9rem" }}>
                {dashboardData && dashboardData.peakHours.map((slot, idx) => {
                  const maxSales = Math.max(...dashboardData.peakHours.map(p => p.sales), 1);
                  const widthPct = Math.min(100, Math.round((slot.sales / maxSales) * 100));
                  const isPeak = slot.hour.includes("17:00");
                  return (
                    <div key={idx}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.82rem", marginBottom: "0.25rem" }}>
                        <span style={{ color: isPeak ? "var(--gold-400)" : "var(--text-secondary)", fontWeight: isPeak ? 600 : 400 }}>
                          {slot.hour} ({slot.label})
                        </span>
                        <span style={{ fontWeight: 600, color: isPeak ? "var(--gold-400)" : "var(--text-primary)" }}>
                          ₹{slot.sales.toLocaleString("en-IN")} ({slot.orders} bills)
                        </span>
                      </div>
                      <div style={{
                        width: "100%",
                        height: "8px",
                        background: "rgba(255, 255, 255, 0.06)",
                        borderRadius: "4px",
                        overflow: "hidden"
                      }}>
                        <div style={{
                          width: `${widthPct}%`,
                          height: "100%",
                          background: isPeak ? "var(--gold-gradient)" : "rgba(245, 158, 11, 0.4)",
                          borderRadius: "4px",
                          transition: "width 0.6s ease"
                        }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Category Contribution Breakdown */}
            <div className="glass-panel" style={{ padding: "1.5rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.2rem" }}>
                <div>
                  <h3 style={{ fontSize: "1.15rem", fontWeight: 700, color: "var(--text-primary)" }}>
                    🍰 Revenue by Bakery Category
                  </h3>
                  <p style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
                    Category distribution of today's sales
                  </p>
                </div>
                <span className="badge badge-emerald">Cakes Dominant (38%)</span>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                {dashboardData && dashboardData.categoryBreakdown.map((cat, idx) => (
                  <div key={idx}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.84rem", marginBottom: "0.3rem" }}>
                      <span style={{ color: "var(--text-secondary)" }}>{cat.category}</span>
                      <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>
                        {cat.percentage}% • ₹{cat.sales.toLocaleString("en-IN")}
                      </span>
                    </div>
                    <div style={{
                      width: "100%",
                      height: "9px",
                      background: "rgba(255, 255, 255, 0.06)",
                      borderRadius: "6px",
                      overflow: "hidden"
                    }}>
                      <div style={{
                        width: `${cat.percentage}%`,
                        height: "100%",
                        background: idx === 0 ? "var(--gold-gradient)" : idx === 1 ? "var(--rose-gradient)" : "var(--emerald-gradient)",
                        borderRadius: "6px"
                      }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: MULTI-BRANCH BENCHMARKING MATRIX */}
      {activeSubTab === "benchmarking" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          {/* Branch Cards Grid */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "1.2rem"
          }}>
            {branches.map((b) => (
              <div
                key={b.id}
                className="glass-panel"
                style={{
                  padding: "1.4rem",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  border: selectedBranchId === b.id ? "2px solid var(--gold-500)" : "1px solid var(--border-subtle)",
                  position: "relative",
                  overflow: "hidden"
                }}
              >
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.6rem" }}>
                    <div>
                      <h4 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--text-primary)" }}>
                        {b.name}
                      </h4>
                      <p style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>📍 {b.locality}</p>
                    </div>
                    <span className="badge badge-gold" style={{ fontSize: "0.72rem" }}>
                      {b.awardBadge || "⭐ Active"}
                    </span>
                  </div>

                  {/* Financials & Target */}
                  <div style={{ margin: "1rem 0", padding: "0.8rem", background: "rgba(255,255,255,0.02)", borderRadius: "var(--radius-sm)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.82rem", marginBottom: "0.3rem" }}>
                      <span style={{ color: "var(--text-secondary)" }}>Today's Sales</span>
                      <strong style={{ color: "var(--gold-400)" }}>₹{b.todaySales.toLocaleString("en-IN")}</strong>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.82rem", marginBottom: "0.5rem" }}>
                      <span style={{ color: "var(--text-secondary)" }}>Monthly Target</span>
                      <span style={{ color: "var(--text-muted)" }}>{b.targetProgressPercent || "75%"}</span>
                    </div>
                    <div style={{ width: "100%", height: "6px", background: "rgba(255,255,255,0.06)", borderRadius: "3px", overflow: "hidden" }}>
                      <div style={{
                        width: b.targetProgressPercent || "75%",
                        height: "100%",
                        background: "var(--gold-gradient)"
                      }} />
                    </div>
                  </div>

                  {/* Operational Metrics */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.6rem", fontSize: "0.8rem", marginBottom: "1rem" }}>
                    <div>
                      <span style={{ color: "var(--text-muted)" }}>FEFO Score:</span>{" "}
                      <strong style={{ color: "#10b981" }}>{b.fefoComplianceScore}%</strong>
                    </div>
                    <div>
                      <span style={{ color: "var(--text-muted)" }}>Wastage:</span>{" "}
                      <strong style={{ color: "#f43f5e" }}>{b.wastageRatePercent}%</strong>
                    </div>
                    <div>
                      <span style={{ color: "var(--text-muted)" }}>Guest Rating:</span>{" "}
                      <strong style={{ color: "#fbbf24" }}>⭐ {b.calculatedRating || b.rating}</strong>
                    </div>
                    <div>
                      <span style={{ color: "var(--text-muted)" }}>Shift Staff:</span>{" "}
                      <strong style={{ color: "var(--text-primary)" }}>👥 {b.staffCount}</strong>
                    </div>
                  </div>

                  {/* Top Sellers */}
                  <div style={{ fontSize: "0.78rem", color: "var(--text-secondary)", marginBottom: "1rem" }}>
                    <span style={{ color: "var(--text-muted)" }}>Top Sellers: </span>
                    {(b.topSellers || ["Artisan Breads", "Truffle Cake"]).join(" • ")}
                  </div>
                </div>

                <button
                  onClick={() => setSelectedBranchId(b.id)}
                  className="btn-outline"
                  style={{ width: "100%", fontSize: "0.82rem", padding: "0.5rem" }}
                >
                  {selectedBranchId === b.id ? "✓ Currently Inspected" : "Filter to This Branch ➔"}
                </button>
              </div>
            ))}
          </div>

          {/* Full Comparison Table */}
          <div className="glass-panel" style={{ padding: "1.5rem" }}>
            <h3 style={{ fontSize: "1.2rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "1rem" }}>
              🏆 Chennai Branch Comparative League
            </h3>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--border-subtle)", color: "var(--text-muted)", textAlign: "left" }}>
                    <th style={{ padding: "0.75rem" }}>Branch Name</th>
                    <th style={{ padding: "0.75rem" }}>Manager</th>
                    <th style={{ padding: "0.75rem" }}>Today Sales</th>
                    <th style={{ padding: "0.75rem" }}>Monthly Run-Rate</th>
                    <th style={{ padding: "0.75rem" }}>FEFO Score</th>
                    <th style={{ padding: "0.75rem" }}>Rating</th>
                    <th style={{ padding: "0.75rem" }}>Award Distinction</th>
                  </tr>
                </thead>
                <tbody>
                  {branches.map((b) => (
                    <tr key={b.id} style={{ borderBottom: "1px solid rgba(245, 158, 11, 0.07)" }}>
                      <td style={{ padding: "0.85rem 0.75rem", fontWeight: 600, color: "var(--text-primary)" }}>
                        {b.name}
                      </td>
                      <td style={{ padding: "0.85rem 0.75rem", color: "var(--text-secondary)" }}>
                        {b.manager}
                      </td>
                      <td style={{ padding: "0.85rem 0.75rem", fontWeight: 700, color: "var(--gold-400)" }}>
                        ₹{b.todaySales.toLocaleString("en-IN")}
                      </td>
                      <td style={{ padding: "0.85rem 0.75rem", color: "var(--text-secondary)" }}>
                        ₹{b.currentMonthSales.toLocaleString("en-IN")} / ₹{b.monthlyTarget.toLocaleString("en-IN")}
                      </td>
                      <td style={{ padding: "0.85rem 0.75rem", color: "#10b981", fontWeight: 600 }}>
                        {b.fefoComplianceScore}%
                      </td>
                      <td style={{ padding: "0.85rem 0.75rem", color: "#fbbf24" }}>
                        ⭐ {b.calculatedRating || b.rating}
                      </td>
                      <td style={{ padding: "0.85rem 0.75rem" }}>
                        <span className="badge badge-gold">{b.awardBadge || "Active"}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: OPERATIONAL AI & SHIFT SCHEDULE */}
      {activeSubTab === "ai-kitchen" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          {/* Daily 4-Slot Baking Schedule */}
          <div className="glass-panel" style={{ padding: "1.5rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.2rem", flexWrap: "wrap", gap: "0.5rem" }}>
              <div>
                <h3 style={{ fontSize: "1.2rem", fontWeight: 700, color: "var(--text-primary)" }}>
                  🧑‍🍳 AI Predicted Daily Baking Schedule & Deck Assignment
                </h3>
                <p style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                  Synchronized hourly kitchen workflow balancing morning commute, teatime surge, and celebratory gateaux.
                </p>
              </div>
              <button onClick={() => onNavigateTab("production")} className="btn-outline">
                Open Recipe Scaler ➔
              </button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1rem" }}>
              {operational.dailyBakingSchedule.map((slot, idx) => (
                <div
                  key={idx}
                  style={{
                    background: "rgba(255, 255, 255, 0.02)",
                    border: "1px solid var(--border-subtle)",
                    borderRadius: "var(--radius-md)",
                    padding: "1.2rem"
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.4rem" }}>
                    <span style={{ fontSize: "0.82rem", color: "var(--gold-400)", fontWeight: 700 }}>
                      ⏱️ {slot.slot}
                    </span>
                    <span className="badge badge-blue" style={{ fontSize: "0.7rem" }}>
                      Shift {idx + 1}
                    </span>
                  </div>
                  <h4 style={{ fontSize: "0.95rem", fontWeight: 600, color: "var(--text-primary)", marginBottom: "0.8rem" }}>
                    {slot.label}
                  </h4>

                  <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                    {slot.items.map((item, itemIdx) => (
                      <div
                        key={itemIdx}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          fontSize: "0.8rem",
                          padding: "0.4rem 0.6rem",
                          background: "rgba(255,255,255,0.015)",
                          borderRadius: "4px"
                        }}
                      >
                        <div>
                          <div style={{ fontWeight: 500, color: "var(--text-primary)" }}>{item.name}</div>
                          <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>📍 {item.oven}</div>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <span style={{ fontWeight: 700, color: "var(--gold-400)" }}>{item.targetQty} pcs</span>
                          <div style={{ fontSize: "0.68rem", color: item.status.includes("Complete") ? "#10b981" : "#f59e0b" }}>
                            {item.status}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Morning Prep Checklist & Wastage Mitigation Advice */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))", gap: "1.5rem" }}>
            {/* Morning Checklist */}
            <div className="glass-panel" style={{ padding: "1.5rem" }}>
              <h3 style={{ fontSize: "1.15rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "0.4rem" }}>
                📋 Automated Morning Kitchen Readiness Checklist
              </h3>
              <p style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginBottom: "1rem" }}>
                Pre-flight hygiene and temperature verification logged by morning head baker
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: "0.8rem" }}>
                {operational.morningPrepChecklist.map((task, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      justifyContent: "space-between",
                      padding: "0.75rem",
                      background: "rgba(255,255,255,0.02)",
                      borderRadius: "var(--radius-sm)",
                      borderLeft: task.status === "verified" ? "3px solid #10b981" : "3px solid #f59e0b"
                    }}
                  >
                    <div style={{ display: "flex", gap: "0.6rem" }}>
                      <span style={{ fontSize: "1.2rem" }}>{task.icon}</span>
                      <div>
                        <div style={{ fontSize: "0.84rem", fontWeight: 600, color: "var(--text-primary)" }}>
                          {task.task}
                        </div>
                        {task.note && (
                          <div style={{ fontSize: "0.75rem", color: "#f59e0b" }}>
                            ⚠️ {task.note}
                          </div>
                        )}
                      </div>
                    </div>
                    <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", whiteSpace: "nowrap" }}>
                      {task.time}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Wastage Mitigation Advice */}
            <div className="glass-panel" style={{ padding: "1.5rem" }}>
              <h3 style={{ fontSize: "1.15rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "0.4rem" }}>
                🤖 AI Smart Wastage Mitigation Directives
              </h3>
              <p style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginBottom: "1rem" }}>
                Prescriptive actions derived from 2-hour periodic stock reports and sell-through curves
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: "0.9rem" }}>
                {operational.aiWastageMitigationAdvice.map((advice, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding: "1rem",
                      background: "rgba(245, 158, 11, 0.04)",
                      border: "1px solid rgba(245, 158, 11, 0.2)",
                      borderRadius: "var(--radius-sm)"
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.4rem" }}>
                      <strong style={{ color: "var(--gold-400)", fontSize: "0.85rem" }}>
                        📍 {advice.branchName}
                      </strong>
                      <span className="badge badge-emerald" style={{ fontSize: "0.7rem" }}>
                        {advice.impact}
                      </span>
                    </div>
                    <p style={{ fontSize: "0.82rem", color: "var(--text-secondary)", lineHeight: 1.5, margin: 0 }}>
                      {advice.advice}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Live Security & Production Audit Log */}
      <div className="glass-panel" style={{ padding: "1.5rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
          <div>
            <h3 style={{ fontSize: "1.15rem", fontWeight: 700, color: "var(--text-primary)" }}>
              🔐 Live Security & Production Audit Trail
            </h3>
            <p style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
              Immutable system activity log recording role-gated events
            </p>
          </div>
          <span className="badge badge-blue">Audit Compliant</span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
          {auditLogs.slice(0, 5).map((log) => (
            <div
              key={log.id}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "0.65rem 0.9rem",
                background: "rgba(255, 255, 255, 0.02)",
                borderRadius: "var(--radius-sm)",
                fontSize: "0.82rem",
                borderLeft: "3px solid var(--gold-500)"
              }}
            >
              <div>
                <span style={{ fontWeight: 600, color: "var(--gold-400)", marginRight: "0.6rem" }}>
                  [{log.action}]
                </span>
                <span style={{ color: "var(--text-primary)" }}>{log.details}</span>
              </div>
              <div style={{ color: "var(--text-muted)", fontSize: "0.74rem", whiteSpace: "nowrap", marginLeft: "1rem" }}>
                By <strong style={{ color: "var(--text-secondary)" }}>{log.userName}</strong> ({log.userRole}) • {new Date(log.timestamp).toLocaleTimeString("en-IN")}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Export P&L Modal */}
      {exportModalOpen && exportData && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0, 0, 0, 0.85)",
          backdropFilter: "blur(8px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000,
          padding: "1rem"
        }}>
          <div style={{
            background: "#1c1917",
            border: "1px solid var(--gold-500)",
            borderRadius: "var(--radius-lg)",
            padding: "2rem",
            maxWidth: "650px",
            width: "100%",
            maxHeight: "85vh",
            overflowY: "auto",
            boxShadow: "0 20px 50px rgba(0, 0, 0, 0.7)"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.2rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                <span style={{ fontSize: "1.5rem" }}>📄</span>
                <h3 style={{ fontSize: "1.2rem", fontWeight: 700, color: "var(--gold-400)", margin: 0 }}>
                  Executive Multi-Branch P&L Statement
                </h3>
              </div>
              <button
                onClick={() => setExportModalOpen(false)}
                style={{ background: "none", border: "none", color: "var(--text-muted)", fontSize: "1.4rem", cursor: "pointer" }}
              >
                ✕
              </button>
            </div>

            <div style={{ background: "rgba(255, 255, 255, 0.02)", padding: "1rem", borderRadius: "var(--radius-sm)", marginBottom: "1.2rem", fontSize: "0.85rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.4rem" }}>
                <span style={{ color: "var(--text-muted)" }}>Generated:</span>
                <span style={{ color: "var(--text-primary)" }}>{new Date(exportData.generatedAt).toLocaleString("en-IN")}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.4rem" }}>
                <span style={{ color: "var(--text-muted)" }}>Total Branches:</span>
                <span style={{ color: "var(--gold-400)", fontWeight: 600 }}>{exportData.totalBranches} Hubs</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.4rem" }}>
                <span style={{ color: "var(--text-muted)" }}>Today Gross Sales:</span>
                <span style={{ color: "var(--text-primary)", fontWeight: 700 }}>₹{exportData.consolidatedMetrics.todayGrossSales.toLocaleString("en-IN")}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.4rem" }}>
                <span style={{ color: "var(--text-muted)" }}>Estimated Net Profit:</span>
                <span style={{ color: "#10b981", fontWeight: 700 }}>₹{exportData.consolidatedMetrics.todayEstimatedNetProfit.toLocaleString("en-IN")}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--text-muted)" }}>Consolidated Monthly Revenue:</span>
                <span style={{ color: "var(--gold-400)", fontWeight: 700 }}>₹{exportData.consolidatedMetrics.monthlyConsolidatedRevenue.toLocaleString("en-IN")}</span>
              </div>
            </div>

            <div style={{ marginBottom: "1.5rem" }}>
              <h4 style={{ fontSize: "0.95rem", color: "var(--text-primary)", marginBottom: "0.6rem" }}>
                Branch Performance Breakdown
              </h4>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                {exportData.branchBreakdown.map((b) => (
                  <div
                    key={b.branchId}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      fontSize: "0.8rem",
                      padding: "0.5rem 0.8rem",
                      background: "rgba(255, 255, 255, 0.015)",
                      borderRadius: "4px"
                    }}
                  >
                    <div>
                      <strong style={{ color: "var(--text-primary)" }}>{b.name}</strong>
                      <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>{b.manager} • {b.award}</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontWeight: 600, color: "var(--gold-400)" }}>₹{b.todaySales.toLocaleString("en-IN")}</div>
                      <div style={{ fontSize: "0.72rem", color: "#10b981" }}>FEFO {b.fefoCompliance}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.8rem" }}>
              <button onClick={() => setExportModalOpen(false)} className="btn-outline">
                Close
              </button>
              <button onClick={downloadJsonReport} className="btn-gold">
                💾 Download JSON Statement
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
