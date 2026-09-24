import { useState, useEffect } from "react";
import { useLanguage } from "../../context/LanguageContext.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { handleImageError, getSafeImageUrl } from "../../utils/imageFallback.js";

export const DashboardHome = ({ onNavigateTab }) => {
  const { t } = useLanguage();
  const { currentUser } = useAuth();

  const [dashboardData, setDashboardData] = useState(null);
  const [fefoAlerts, setFefoAlerts] = useState(null);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [dashRes, fefoRes, auditRes] = await Promise.all([
          fetch("http://localhost:5000/api/analytics/dashboard"),
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

    fetchData();
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
        alert(`25% Happy Hour Flash Markdown applied to batch ${batchId}!`);
        // Refresh alerts
        const fefoRes = await fetch("http://localhost:5000/api/inventory/fefo-alerts");
        const fefoJson = await fefoRes.json();
        setFefoAlerts(fefoJson);
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: "3rem", textAlign: "center", color: "var(--gold-400)" }}>
        <div style={{ fontSize: "2rem", marginBottom: "1rem" }}>🥐</div>
        <div>Loading BakeSphere Executive Intelligence Dashboard...</div>
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
    batchesExpiringTodayCount: 1
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      {/* Hero Welcome Banner */}
      <div style={{
        position: "relative",
        borderRadius: "var(--radius-lg)",
        overflow: "hidden",
        border: "1px solid var(--border-subtle)",
        boxShadow: "var(--shadow-card)",
        minHeight: "260px",
        display: "flex",
        alignItems: "center"
      }}>
        <img
          src={getSafeImageUrl("https://images.unsplash.com/photo-1509440159596-0249088772ff?w=1400&auto=format&fit=crop&q=80")}
          alt="BakeSphere Artisan Patisserie"
          style={{
            position: "absolute",
            width: "100%",
            height: "100%",
            objectFit: "cover",
            filter: "brightness(0.38)"
          }}
          onError={handleImageError}
        />
        <div style={{
          position: "relative",
          zIndex: 2,
          padding: "2.5rem",
          maxWidth: "800px"
        }}>
          <div className="badge badge-gold" style={{ marginBottom: "0.75rem" }}>
            ✨ {currentUser ? `${currentUser.roleLabel} Portal` : "Executive Suite"}
          </div>
          <h1 style={{
            fontSize: "2.5rem",
            fontWeight: 800,
            lineHeight: 1.15,
            marginBottom: "0.6rem",
            color: "#fff"
          }}>
            {t("welcome")}, <span className="gold-text">{currentUser ? currentUser.name : "Manager"}</span>
          </h1>
          <p style={{ fontSize: "1rem", color: "var(--text-secondary)", marginBottom: "1.5rem", lineHeight: 1.6 }}>
            Real-time multi-branch bakery metrics, FEFO batch expiry surveillance, and AI demand forecasting across 4 Chennai patisseries.
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
            <button onClick={() => onNavigateTab("api-docs")} className="btn-outline">
              <span>⚡</span> {t("apiDocs")}
            </button>
          </div>
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
            ▲ +18.4% vs yesterday
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

        {/* Active Orders */}
        <div className="glass-panel" style={{ padding: "1.3rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", color: "var(--text-muted)", fontSize: "0.82rem", marginBottom: "0.4rem" }}>
            <span>{t("activeOrders")}</span>
            <span style={{ color: "#60a5fa", fontSize: "1.1rem" }}>📦</span>
          </div>
          <div style={{ fontSize: "1.8rem", fontWeight: 700, color: "var(--text-primary)" }}>
            {kpis.activeOrdersCount}
          </div>
          <div style={{ fontSize: "0.75rem", color: "#60a5fa", marginTop: "0.4rem" }}>
            6 in baking • 4 out for delivery
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

        {/* Low Stock Alerts */}
        <div
          className="glass-panel"
          style={{ padding: "1.3rem", cursor: "pointer" }}
          onClick={() => onNavigateTab("inventory")}
        >
          <div style={{ display: "flex", justifyContent: "space-between", color: "var(--text-muted)", fontSize: "0.82rem", marginBottom: "0.4rem" }}>
            <span>{t("lowStock")}</span>
            <span style={{ color: "#f59e0b", fontSize: "1.1rem" }}>⚠️</span>
          </div>
          <div style={{ fontSize: "1.8rem", fontWeight: 700, color: "#f59e0b" }}>
            {kpis.lowStockIngredientsCount} Items
          </div>
          <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.4rem" }}>
            Cream Cheese, Heavy Cream
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
              const maxSales = 60000;
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

      {/* Multi-Branch Performance Comparison Matrix */}
      <div className="glass-panel" style={{ padding: "1.5rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.2rem" }}>
          <div>
            <h3 style={{ fontSize: "1.2rem", fontWeight: 700, color: "var(--text-primary)" }}>
              🏪 Multi-Branch Operational Intelligence
            </h3>
            <p style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
              Branch-wise sales, staff deployment, and machinery status
            </p>
          </div>
          <button onClick={() => onNavigateTab("branches")} className="btn-outline">
            View Branch Details ➔
          </button>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border-subtle)", color: "var(--text-muted)", textAlign: "left" }}>
                <th style={{ padding: "0.75rem" }}>Branch Name</th>
                <th style={{ padding: "0.75rem" }}>Locality</th>
                <th style={{ padding: "0.75rem" }}>Today Sales</th>
                <th style={{ padding: "0.75rem" }}>Monthly Run-Rate</th>
                <th style={{ padding: "0.75rem" }}>Staff Count</th>
                <th style={{ padding: "0.75rem" }}>Rating</th>
                <th style={{ padding: "0.75rem" }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {dashboardData && dashboardData.branches.map((b) => (
                <tr key={b.id} style={{ borderBottom: "1px solid rgba(245, 158, 11, 0.07)" }}>
                  <td style={{ padding: "0.85rem 0.75rem", fontWeight: 600, color: "var(--text-primary)" }}>
                    {b.name}
                  </td>
                  <td style={{ padding: "0.85rem 0.75rem", color: "var(--text-secondary)" }}>
                    {b.locality}
                  </td>
                  <td style={{ padding: "0.85rem 0.75rem", fontWeight: 700, color: "var(--gold-400)" }}>
                    ₹{b.todaySales.toLocaleString("en-IN")}
                  </td>
                  <td style={{ padding: "0.85rem 0.75rem", color: "var(--text-secondary)" }}>
                    ₹{b.currentMonthSales.toLocaleString("en-IN")} / ₹{b.monthlyTarget.toLocaleString("en-IN")}
                  </td>
                  <td style={{ padding: "0.85rem 0.75rem", color: "var(--text-secondary)" }}>
                    👥 {b.staffCount}
                  </td>
                  <td style={{ padding: "0.85rem 0.75rem", color: "#fbbf24" }}>
                    ⭐ {b.rating}
                  </td>
                  <td style={{ padding: "0.85rem 0.75rem" }}>
                    <span className="badge badge-emerald">ACTIVE</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

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
    </div>
  );
};
