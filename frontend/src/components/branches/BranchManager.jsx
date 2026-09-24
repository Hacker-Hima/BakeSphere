import { useState, useEffect } from "react";

export const BranchManager = () => {
  const [branches, setBranches] = useState([]);
  const [equipment, setEquipment] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const [bRes, eRes] = await Promise.all([
          fetch("http://localhost:5000/api/analytics/branch-comparison"),
          fetch("http://localhost:5000/api/equipment")
        ]);
        const bJson = await bRes.json();
        const eJson = await eRes.json();
        if (mounted) {
          setBranches(bJson || []);
          setEquipment(eJson.equipment || []);
          setLoading(false);
        }
      } catch (err) {
        console.error(err);
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    return <div style={{ padding: "3rem", textAlign: "center", color: "var(--gold-400)" }}>Loading Branches & Asset Machinery...</div>;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      {/* Header */}
      <div className="glass-panel" style={{ padding: "1.5rem" }}>
        <div className="badge badge-gold" style={{ marginBottom: "0.5rem" }}>
          🏪 Multi-Location Architecture
        </div>
        <h2 style={{ fontSize: "1.6rem", fontWeight: 800, color: "var(--text-primary)", marginBottom: "0.4rem" }}>
          Branches & Bakery Equipment Asset Governance
        </h2>
        <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", lineHeight: 1.5 }}>
          Unified control center for 4 Chennai locations (Heritage T. Nagar, Anna Nagar Flagship, Koyambedu Express, OMR Central Hub), tracking branch revenue targets, staff allocations, and commercial deck oven service intervals.
        </p>
      </div>

      {/* Branches Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "1.5rem" }}>
        {branches.map((b) => (
          <div key={b.id} className="glass-panel" style={{ padding: "1.5rem", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.6rem" }}>
                <div>
                  <h3 style={{ fontSize: "1.15rem", fontWeight: 700, color: "var(--text-primary)" }}>{b.name}</h3>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{b.locality}</div>
                </div>
                <span className="badge badge-emerald">Active</span>
              </div>

              <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.8rem", lineHeight: 1.45 }}>
                {b.address}
              </p>

              <div style={{ fontSize: "0.78rem", color: "var(--gold-400)", marginBottom: "0.8rem" }}>
                Specialty: <strong>{b.specialty}</strong>
              </div>

              <div style={{
                background: "rgba(255, 255, 255, 0.02)",
                padding: "0.8rem",
                borderRadius: "8px",
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "0.6rem",
                fontSize: "0.78rem",
                marginBottom: "1rem"
              }}>
                <div>Manager: <strong>{b.manager}</strong></div>
                <div>Hours: <strong>{b.workingHours}</strong></div>
                <div>Staff: <strong>{b.staffCount} Employees</strong></div>
                <div>Equipment: <strong>{b.equipmentCount} Units</strong></div>
              </div>
            </div>

            <div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", marginBottom: "0.3rem" }}>
                <span style={{ color: "var(--text-muted)" }}>Today's Sales:</span>
                <strong style={{ color: "var(--gold-400)", fontSize: "1.05rem" }}>₹{b.todaySales.toLocaleString("en-IN")}</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.76rem", color: "var(--text-muted)" }}>
                <span>Month Progress:</span>
                <span>₹{b.currentMonthSales.toLocaleString("en-IN")} / ₹{b.monthlyTarget.toLocaleString("en-IN")}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Bakery Equipment Asset Management */}
      <div className="glass-panel" style={{ padding: "1.5rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.2rem" }}>
          <div>
            <h3 style={{ fontSize: "1.2rem", fontWeight: 700, color: "var(--text-primary)" }}>
              🔧 Industrial Machinery & Preventive Maintenance Logs
            </h3>
            <p style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
              Monitors commercial ovens, blast chillers, and dough mixers with automated service countdown alerts
            </p>
          </div>
          <span className="badge badge-gold">{equipment.length} Commercial Assets</span>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.84rem" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border-subtle)", color: "var(--text-muted)", textAlign: "left" }}>
                <th style={{ padding: "0.75rem" }}>Equipment Name</th>
                <th style={{ padding: "0.75rem" }}>Category</th>
                <th style={{ padding: "0.75rem" }}>Branch Location</th>
                <th style={{ padding: "0.75rem" }}>Last Service</th>
                <th style={{ padding: "0.75rem" }}>Next Due</th>
                <th style={{ padding: "0.75rem" }}>Warranty</th>
                <th style={{ padding: "0.75rem" }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {equipment.map((eq) => {
                const isDueSoon = eq.status === "service_due_soon";
                return (
                  <tr key={eq.id} style={{ borderBottom: "1px solid rgba(245, 158, 11, 0.06)" }}>
                    <td style={{ padding: "0.85rem 0.75rem" }}>
                      <div style={{ fontWeight: 600, color: "var(--text-primary)" }}>{eq.name}</div>
                      <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
                        S/N: {eq.serialNumber}
                      </div>
                    </td>
                    <td style={{ padding: "0.85rem 0.75rem", color: "var(--text-secondary)" }}>{eq.category}</td>
                    <td style={{ padding: "0.85rem 0.75rem", color: "var(--text-secondary)" }}>{eq.branchName}</td>
                    <td style={{ padding: "0.85rem 0.75rem", color: "var(--text-muted)" }}>{eq.lastServiceDate}</td>
                    <td style={{ padding: "0.85rem 0.75rem", fontWeight: 600, color: isDueSoon ? "#fb7185" : "var(--gold-400)" }}>
                      {eq.nextServiceDue} {isDueSoon ? "⚠️ Due in 4 days" : ""}
                    </td>
                    <td style={{ padding: "0.85rem 0.75rem", color: "var(--text-secondary)" }}>{eq.warrantyValidUntil}</td>
                    <td style={{ padding: "0.85rem 0.75rem" }}>
                      <span className={`badge ${isDueSoon ? "badge-rose" : "badge-emerald"}`}>
                        {isDueSoon ? "Service Due" : "Operational"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
