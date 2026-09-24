import { useState, useEffect } from "react";

export const AiForecastStudio = () => {
  const [forecastData, setForecastData] = useState(null);
  const [wasteRiskData, setWasteRiskData] = useState(null);
  const [profitLossData, setProfitLossData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const loadData = async () => {
      try {
        const [foreRes, wasteRes, plRes] = await Promise.all([
          fetch("http://localhost:5000/api/ai/forecast"),
          fetch("http://localhost:5000/api/ai/waste-risk"),
          fetch("http://localhost:5000/api/analytics/profit-loss")
        ]);

        const [foreJson, wasteJson, plJson] = await Promise.all([
          foreRes.json(),
          wasteRes.json(),
          plRes.json()
        ]);

        if (mounted) {
          setForecastData(foreJson);
          setWasteRiskData(wasteJson);
          setProfitLossData(plJson.data || []);
          setLoading(false);
        }
      } catch (err) {
        console.error(err);
        if (mounted) setLoading(false);
      }
    };

    loadData();
    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    return <div style={{ padding: "3rem", textAlign: "center", color: "var(--gold-400)" }}>Loading AI Demand Forecasting Models...</div>;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      {/* Header */}
      <div className="glass-panel" style={{ padding: "1.5rem" }}>
        <div className="badge badge-emerald" style={{ marginBottom: "0.5rem" }}>
          🧠 Machine Learning & Production Analytics
        </div>
        <h2 style={{ fontSize: "1.6rem", fontWeight: 800, color: "var(--text-primary)", marginBottom: "0.4rem" }}>
          AI Demand Forecasting & Waste Prevention Engine
        </h2>
        <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", lineHeight: 1.5 }}>
          Predicts tomorrow's expected unit velocity using historical consumption patterns, day-of-week surges, and festival multipliers, recommending precise production quantities to balance customer fulfillment with zero food waste.
        </p>
      </div>

      {/* Model Overview Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1.2rem" }}>
        <div className="glass-panel" style={{ padding: "1.3rem" }}>
          <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginBottom: "0.3rem" }}>Target Prediction Date</div>
          <div style={{ fontSize: "1.4rem", fontWeight: 700, color: "var(--gold-400)" }}>
            {forecastData ? `${forecastData.forecastDay} (${forecastData.forecastDate})` : "Tomorrow"}
          </div>
          <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginTop: "0.3rem" }}>
            Season: {forecastData?.seasonality}
          </div>
        </div>

        <div className="glass-panel" style={{ padding: "1.3rem" }}>
          <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginBottom: "0.3rem" }}>Forecasted Daily Revenue</div>
          <div style={{ fontSize: "1.4rem", fontWeight: 700, color: "#34d399" }}>
            ₹{forecastData?.totalProjectedRevenue.toLocaleString("en-IN")}
          </div>
          <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginTop: "0.3rem" }}>
            Estimated Net Yield: ₹{(forecastData?.totalProjectedRevenue * 0.52).toFixed(0)}
          </div>
        </div>

        <div className="glass-panel" style={{ padding: "1.3rem" }}>
          <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginBottom: "0.3rem" }}>AI Model Confidence</div>
          <div style={{ fontSize: "1.4rem", fontWeight: 700, color: "#60a5fa" }}>
            {forecastData?.modelAccuracy}
          </div>
          <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginTop: "0.3rem" }}>
            Trained on 18,400+ POS sales records
          </div>
        </div>

        <div className="glass-panel" style={{ padding: "1.3rem" }}>
          <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginBottom: "0.3rem" }}>Projected Wastage Savings</div>
          <div style={{ fontSize: "1.4rem", fontWeight: 700, color: "#fb7185" }}>
            ₹{wasteRiskData?.projectedMonthlySavings.toLocaleString("en-IN")} / mo
          </div>
          <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginTop: "0.3rem" }}>
            {wasteRiskData?.weeklyWastageTrend}
          </div>
        </div>
      </div>

      {/* Tomorrow's Production Demand Forecast Table */}
      <div className="glass-panel" style={{ padding: "1.5rem" }}>
        <h3 style={{ fontSize: "1.2rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "1rem" }}>
          📊 Tomorrow's AI Production Recommendations
        </h3>

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border-subtle)", color: "var(--text-muted)", textAlign: "left" }}>
                <th style={{ padding: "0.75rem" }}>Product Name</th>
                <th style={{ padding: "0.75rem" }}>Historical Daily Avg</th>
                <th style={{ padding: "0.75rem" }}>AI Recommended Units</th>
                <th style={{ padding: "0.75rem" }}>Confidence</th>
                <th style={{ padding: "0.75rem" }}>Projected Revenue</th>
                <th style={{ padding: "0.75rem" }}>Driving Factor</th>
              </tr>
            </thead>
            <tbody>
              {forecastData && forecastData.predictions.map((p) => (
                <tr key={p.productId} style={{ borderBottom: "1px solid rgba(245, 158, 11, 0.06)" }}>
                  <td style={{ padding: "0.85rem 0.75rem", fontWeight: 600, color: "var(--text-primary)" }}>
                    {p.productName}
                  </td>
                  <td style={{ padding: "0.85rem 0.75rem", color: "var(--text-secondary)" }}>
                    {p.currentDailyAvg} units
                  </td>
                  <td style={{ padding: "0.85rem 0.75rem", fontWeight: 700, color: "var(--gold-400)", fontSize: "1rem" }}>
                    {p.recommendedTomorrow} units
                  </td>
                  <td style={{ padding: "0.85rem 0.75rem", color: "#60a5fa" }}>
                    {p.confidenceScore}
                  </td>
                  <td style={{ padding: "0.85rem 0.75rem", fontWeight: 700, color: "#34d399" }}>
                    ₹{p.estimatedRevenue.toLocaleString("en-IN")}
                  </td>
                  <td style={{ padding: "0.85rem 0.75rem", color: "var(--text-secondary)", fontSize: "0.78rem" }}>
                    {p.keyFactors.join(" • ")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Product Margin & Profit/Loss Sensitivity Analyzer */}
      <div className="glass-panel" style={{ padding: "1.5rem" }}>
        <h3 style={{ fontSize: "1.2rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "0.4rem" }}>
          💰 Product Profitability & Cost Architecture
        </h3>
        <p style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginBottom: "1.2rem" }}>
          Calculates gross profit margin per unit to help the bakery owner identify top-tier and slow-moving items.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1rem" }}>
          {profitLossData.map((item) => (
            <div
              key={item.id}
              style={{
                background: "rgba(255, 255, 255, 0.02)",
                border: "1px solid var(--border-subtle)",
                borderRadius: "var(--radius-md)",
                padding: "1rem"
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.4rem" }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: "0.92rem", color: "var(--text-primary)" }}>{item.name}</div>
                  <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>{item.category}</div>
                </div>
                <span className="badge badge-gold">{item.marginPercent} Margin</span>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.82rem", marginTop: "0.8rem", color: "var(--text-secondary)" }}>
                <span>Selling Price: <strong>₹{item.sellingPrice}</strong></span>
                <span>Raw Ingredient Cost: <strong style={{ color: "#fb7185" }}>₹{item.costPrice}</strong></span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.88rem", marginTop: "0.4rem", fontWeight: 700, color: "#34d399" }}>
                <span>Net Estimated Profit:</span>
                <span>+₹{item.profitPerUnit}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
