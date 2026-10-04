import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext.jsx";

export const BranchManager = () => {
  const { currentUser, role, isOwner, isAdmin, activeBranchId, switchBranch, token } = useAuth();
  const [branches, setBranches] = useState([]);
  const [equipment, setEquipment] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState(null);
  const [performanceModalBranch, setPerformanceModalBranch] = useState(null);
  const [performanceData, setPerformanceData] = useState(null);
  const [perfLoading, setPerfLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3500);
  };

  const loadData = async () => {
    try {
      const [bRes, eRes] = await Promise.all([
        fetch("http://localhost:5000/api/branches"),
        fetch("http://localhost:5000/api/equipment")
      ]);
      const bJson = await bRes.json();
      const eJson = await eRes.json();
      setBranches(bJson.branches || []);
      setEquipment(eJson.equipment || []);
      setLoading(false);
    } catch (err) {
      console.error("Failed to load branches:", err);
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Form State for Create/Edit Modal
  const [formData, setFormData] = useState({
    id: "",
    name: "",
    locality: "",
    address: "",
    lat: 13.0418,
    lng: 80.2341,
    phone: "",
    whatsapp: "",
    email: "",
    emergencyContact: "",
    openHour: "06:00 AM",
    closeHour: "10:30 PM",
    manager: "",
    staffCount: 10,
    seatingCapacity: 24,
    monthlyTarget: 1000000,
    specialty: "Artisan Pastries & Cakes"
  });

  const handleOpenAddModal = () => {
    setEditingBranch(null);
    setFormData({
      id: `BR-0${branches.length + 1}`,
      name: "",
      locality: "",
      address: "",
      lat: 13.0418,
      lng: 80.2341,
      phone: "+91 44 ",
      whatsapp: "+91",
      email: "",
      emergencyContact: "+91 ",
      openHour: "06:00 AM",
      closeHour: "10:30 PM",
      manager: "",
      staffCount: 10,
      seatingCapacity: 24,
      monthlyTarget: 1000000,
      specialty: "Artisan Pastries & Designer Cakes"
    });
    setModalOpen(true);
  };

  const handleOpenEditModal = (b) => {
    setEditingBranch(b);
    setFormData({
      id: b.id,
      name: b.name,
      locality: b.locality,
      address: b.address,
      lat: b.coordinates?.lat || 13.0418,
      lng: b.coordinates?.lng || 80.2341,
      phone: b.contact?.phone || "",
      whatsapp: b.contact?.whatsapp || "",
      email: b.contact?.email || "",
      emergencyContact: b.contact?.emergencyContact || "",
      openHour: b.workingHours?.open || "06:00 AM",
      closeHour: b.workingHours?.close || "10:30 PM",
      manager: b.manager || "",
      staffCount: b.staffCount || 10,
      seatingCapacity: b.seatingCapacity || 20,
      monthlyTarget: b.monthlyTarget || 1000000,
      specialty: b.specialty || ""
    });
    setModalOpen(true);
  };

  const handleSaveBranch = async (e) => {
    e.preventDefault();
    const payload = {
      id: formData.id,
      name: formData.name,
      locality: formData.locality,
      address: formData.address,
      coordinates: {
        lat: parseFloat(formData.lat) || 13.0418,
        lng: parseFloat(formData.lng) || 80.2341
      },
      contact: {
        phone: formData.phone,
        whatsapp: formData.whatsapp,
        email: formData.email,
        emergencyContact: formData.emergencyContact
      },
      workingHours: {
        open: formData.openHour,
        close: formData.closeHour,
        display: `${formData.openHour} – ${formData.closeHour}`
      },
      manager: formData.manager,
      staffCount: parseInt(formData.staffCount, 10) || 8,
      seatingCapacity: parseInt(formData.seatingCapacity, 10) || 0,
      monthlyTarget: parseFloat(formData.monthlyTarget) || 1000000,
      specialty: formData.specialty
    };

    try {
      const url = editingBranch
        ? `http://localhost:5000/api/branches/${editingBranch.id}`
        : "http://localhost:5000/api/branches";
      const method = editingBranch ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const resData = await res.json();
      if (!res.ok) throw new Error(resData.error || "Operation failed");

      showToast(editingBranch ? "Branch details updated successfully!" : "New branch added to network!");
      setModalOpen(false);
      loadData();
    } catch (err) {
      alert(`Error saving branch: ${err.message}`);
    }
  };

  const handleToggleStatus = async (branchId, currentStatus) => {
    const nextStatus = currentStatus === "active" ? "disabled" : "active";
    try {
      const res = await fetch(`http://localhost:5000/api/branches/${branchId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: nextStatus })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update status");
      showToast(`Branch ${branchId} status changed to ${nextStatus.toUpperCase()}`);
      loadData();
    } catch (err) {
      alert(`Failed to change status: ${err.message}`);
    }
  };

  const handleViewPerformance = async (branch) => {
    setPerformanceModalBranch(branch);
    setPerfLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/api/branches/${branch.id}/performance`);
      const data = await res.json();
      setPerformanceData(data);
      setPerfLoading(false);
    } catch (err) {
      console.error("Perf fetch error:", err);
      setPerfLoading(false);
    }
  };

  if (loading) {
    return <div style={{ padding: "3rem", textAlign: "center", color: "var(--gold-400)" }}>Loading Branches & Asset Machinery...</div>;
  }

  const canEditAny = isAdmin || isOwner;
  const totalSalesAll = branches.reduce((sum, b) => sum + (b.todaySales || 0), 0);
  const totalTargetAll = branches.reduce((sum, b) => sum + (b.monthlyTarget || 0), 0);
  const activeCount = branches.filter((b) => b.status === "active").length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      {toastMessage && (
        <div style={{
          position: "fixed",
          bottom: "2rem",
          right: "2rem",
          background: "linear-gradient(135deg, #10b981, #059669)",
          color: "#fff",
          padding: "0.9rem 1.5rem",
          borderRadius: "8px",
          boxShadow: "0 10px 25px rgba(0,0,0,0.5)",
          zIndex: 9999,
          fontWeight: 600
        }}>
          ✨ {toastMessage}
        </div>
      )}

      {/* Header & KPI Summary */}
      <div className="glass-panel" style={{ padding: "1.8rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <div className="badge badge-gold" style={{ marginBottom: "0.5rem" }}>
              🏪 Enterprise Multi-Branch Governance
            </div>
            <h2 style={{ fontSize: "1.7rem", fontWeight: 800, color: "var(--text-primary)", marginBottom: "0.4rem" }}>
              Branch Network & Physical Bakery Assets
            </h2>
            <p style={{ fontSize: "0.86rem", color: "var(--text-secondary)", maxWidth: "750px", lineHeight: 1.5 }}>
              Centralized command center for Chennai branch locations. Configure branch operating hours, emergency WhatsApp/phone channels, staff assignments, and track sales progress against monthly targets.
            </p>
          </div>

          <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
            {canEditAny && (
              <button
                onClick={handleOpenAddModal}
                className="bk-btn-hero-primary"
                style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.65rem 1.2rem", fontSize: "0.85rem" }}
              >
                <span>➕</span> Add New Branch
              </button>
            )}
          </div>
        </div>

        {/* Global Network Metrics */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: "1rem",
          marginTop: "1.5rem",
          paddingTop: "1.2rem",
          borderTop: "1px solid rgba(255, 255, 255, 0.08)"
        }}>
          <div style={{ background: "rgba(255, 255, 255, 0.03)", padding: "1rem", borderRadius: "10px" }}>
            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Total Branches</div>
            <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--text-primary)" }}>{branches.length} Locations</div>
            <div style={{ fontSize: "0.72rem", color: "#10b981", marginTop: "0.2rem" }}>● {activeCount} Live & Active</div>
          </div>
          <div style={{ background: "rgba(255, 255, 255, 0.03)", padding: "1rem", borderRadius: "10px" }}>
            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Network Sales Today</div>
            <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--gold-400)" }}>₹{totalSalesAll.toLocaleString("en-IN")}</div>
            <div style={{ fontSize: "0.72rem", color: "var(--text-secondary)", marginTop: "0.2rem" }}>Across all terminals</div>
          </div>
          <div style={{ background: "rgba(255, 255, 255, 0.03)", padding: "1rem", borderRadius: "10px" }}>
            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Monthly Target</div>
            <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--text-primary)" }}>₹{(totalTargetAll / 100000).toFixed(1)} Lakhs</div>
            <div style={{ fontSize: "0.72rem", color: "var(--text-secondary)", marginTop: "0.2rem" }}>Consolidated revenue quota</div>
          </div>
          <div style={{ background: "rgba(255, 255, 255, 0.03)", padding: "1rem", borderRadius: "10px" }}>
            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Active Working Scope</div>
            <div style={{ fontSize: "1.1rem", fontWeight: 700, color: "#38bdf8" }}>
              {branches.find((b) => b.id === activeBranchId)?.name || "Central View"}
            </div>
            <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginTop: "0.2rem" }}>
              ID: {activeBranchId} ({currentUser?.roleLabel || role})
            </div>
          </div>
        </div>
      </div>

      {/* Branches Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))", gap: "1.5rem" }}>
        {branches.map((b) => {
          const isCurrentActive = b.id === activeBranchId;
          const canEditThis = canEditAny || (role === "manager" && currentUser?.branchId === b.id);
          const isBranchActive = b.status === "active";

          return (
            <div
              key={b.id}
              className="glass-panel"
              style={{
                padding: "1.5rem",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                border: isCurrentActive ? "1.5px solid var(--gold-400)" : "1px solid rgba(255,255,255,0.08)",
                position: "relative"
              }}
            >
              {isCurrentActive && (
                <div style={{
                  position: "absolute",
                  top: "-10px",
                  right: "20px",
                  background: "var(--gold-400)",
                  color: "#000",
                  fontSize: "0.68rem",
                  fontWeight: 800,
                  padding: "0.2rem 0.6rem",
                  borderRadius: "20px",
                  letterSpacing: "0.5px"
                }}>
                  ACTIVE WORKING CONTEXT
                </div>
              )}

              <div>
                {/* Branch Header */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.6rem" }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <span style={{ fontSize: "0.72rem", background: "rgba(255,255,255,0.1)", padding: "0.15rem 0.4rem", borderRadius: "4px", fontFamily: "var(--font-mono)" }}>
                        {b.id}
                      </span>
                      <h3 style={{ fontSize: "1.2rem", fontWeight: 700, color: "var(--text-primary)" }}>{b.name}</h3>
                    </div>
                    <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginTop: "0.2rem" }}>📍 {b.locality}</div>
                  </div>
                  <span className={`badge ${isBranchActive ? "badge-emerald" : "badge-rose"}`}>
                    {b.status?.toUpperCase() || "ACTIVE"}
                  </span>
                </div>

                <p style={{ fontSize: "0.82rem", color: "var(--text-secondary)", marginBottom: "0.8rem", lineHeight: 1.45 }}>
                  {b.address}
                </p>

                {/* Contact Channels */}
                <div style={{
                  background: "rgba(0, 0, 0, 0.25)",
                  padding: "0.75rem",
                  borderRadius: "8px",
                  fontSize: "0.78rem",
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.4rem",
                  marginBottom: "1rem",
                  border: "1px solid rgba(255,255,255,0.05)"
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "var(--text-muted)" }}>📞 Phone:</span>
                    <a href={`tel:${b.contact?.phone || "+914424348890"}`} style={{ color: "#38bdf8", textDecoration: "none" }}>
                      {b.contact?.phone || "+91 44 2434 8890"}
                    </a>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "var(--text-muted)" }}>💬 WhatsApp:</span>
                    <a
                      href={`https://wa.me/${(b.contact?.whatsapp || "919444243488").replace(/\D/g, "")}`}
                      target="_blank"
                      rel="noreferrer"
                      style={{ color: "#34d399", textDecoration: "none" }}
                    >
                      {b.contact?.whatsapp || "+91 94442 43488"}
                    </a>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "var(--text-muted)" }}>✉️ Email:</span>
                    <a href={`mailto:${b.contact?.email || "contact@bakesphere.com"}`} style={{ color: "var(--text-secondary)", textDecoration: "none" }}>
                      {b.contact?.email || "branch@bakesphere.com"}
                    </a>
                  </div>
                </div>

                {/* Operations Info */}
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
                  <div>Hours: <strong>{b.workingHours?.display || b.workingHours?.open || "06:00 AM – 10:30 PM"}</strong></div>
                  <div>Staff: <strong>{b.staffCount} Team</strong></div>
                  <div>Equipment: <strong>{b.equipmentCount} Units</strong></div>
                  <div>Seating: <strong>{b.seatingCapacity > 0 ? `${b.seatingCapacity} Chairs` : "Cloud Kitchen"}</strong></div>
                  <div>Specialty: <strong style={{ color: "var(--gold-400)" }}>{b.specialty?.split("&")[0]}</strong></div>
                </div>
              </div>

              <div>
                {/* Financial Progress */}
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", marginBottom: "0.3rem" }}>
                  <span style={{ color: "var(--text-muted)" }}>Today's Sales:</span>
                  <strong style={{ color: "var(--gold-400)", fontSize: "1.05rem" }}>₹{(b.todaySales || 0).toLocaleString("en-IN")}</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.76rem", color: "var(--text-muted)", marginBottom: "1rem" }}>
                  <span>Month Sales:</span>
                  <span>₹{(b.currentMonthSales || 0).toLocaleString("en-IN")} / ₹{(b.monthlyTarget || 1000000).toLocaleString("en-IN")}</span>
                </div>

                {/* Action Controls */}
                <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                  {/* Select as active context for testing / POS / inventory */}
                  <button
                    onClick={() => {
                      switchBranch(b.id, b.name);
                      showToast(`Switched active branch to ${b.name}`);
                    }}
                    disabled={isCurrentActive}
                    className="bk-btn-secondary"
                    style={{ flex: 1, padding: "0.45rem", fontSize: "0.76rem", textAlign: "center" }}
                  >
                    {isCurrentActive ? "✓ Active Context" : "Switch Scope"}
                  </button>

                  {/* Performance Detail Drawer */}
                  <button
                    onClick={() => handleViewPerformance(b)}
                    className="bk-btn-secondary"
                    style={{ padding: "0.45rem 0.75rem", fontSize: "0.76rem" }}
                    title="View Performance Analytics"
                  >
                    📊 Stats
                  </button>

                  {/* Edit button */}
                  {canEditThis && (
                    <button
                      onClick={() => handleOpenEditModal(b)}
                      className="bk-btn-secondary"
                      style={{ padding: "0.45rem 0.75rem", fontSize: "0.76rem" }}
                      title="Edit Branch Information"
                    >
                      ✏️ Edit
                    </button>
                  )}

                  {/* Admin Status Toggle */}
                  {canEditAny && (
                    <button
                      onClick={() => handleToggleStatus(b.id, b.status)}
                      style={{
                        padding: "0.45rem 0.65rem",
                        fontSize: "0.76rem",
                        background: isBranchActive ? "rgba(239, 68, 68, 0.15)" : "rgba(16, 185, 129, 0.15)",
                        border: isBranchActive ? "1px solid #ef4444" : "1px solid #10b981",
                        color: isBranchActive ? "#f87171" : "#34d399",
                        borderRadius: "6px",
                        cursor: "pointer"
                      }}
                      title={isBranchActive ? "Disable Branch" : "Activate Branch"}
                    >
                      {isBranchActive ? "Disable" : "Enable"}
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Machinery Assets Governance */}
      <div className="glass-panel" style={{ padding: "1.5rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.2rem", flexWrap: "wrap", gap: "0.8rem" }}>
          <div>
            <h3 style={{ fontSize: "1.2rem", fontWeight: 700, color: "var(--text-primary)" }}>
              🔧 Industrial Machinery & Preventive Maintenance Logs
            </h3>
            <p style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
              Monitors commercial deck ovens, blast chillers, and spiral dough mixers with automated calibration countdowns
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

      {/* Add / Edit Branch Modal */}
      {modalOpen && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0,0,0,0.8)",
          backdropFilter: "blur(6px)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 10000,
          padding: "1rem"
        }}>
          <div className="glass-panel" style={{
            maxWidth: "680px",
            width: "100%",
            maxHeight: "90vh",
            overflowY: "auto",
            padding: "2rem",
            border: "1px solid rgba(245, 158, 11, 0.3)"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
              <div>
                <h3 style={{ fontSize: "1.4rem", fontWeight: 800, color: "var(--text-primary)" }}>
                  {editingBranch ? `✏️ Configure ${editingBranch.name}` : "➕ Register New Bakery Branch"}
                </h3>
                <p style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                  Configure address coordinates, customer contact channels, working shifts, and quotas
                </p>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                style={{ background: "transparent", border: "none", color: "var(--text-muted)", fontSize: "1.5rem", cursor: "pointer" }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveBranch} style={{ display: "flex", flexDirection: "column", gap: "1.2rem" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "1rem" }}>
                <div>
                  <label style={{ fontSize: "0.75rem", color: "var(--text-secondary)", display: "block", marginBottom: "0.3rem" }}>
                    Branch Code / ID
                  </label>
                  <input
                    type="text"
                    value={formData.id}
                    onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                    disabled={Boolean(editingBranch)}
                    required
                    style={{ width: "100%", padding: "0.6rem", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "6px", color: "#fff" }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: "0.75rem", color: "var(--text-secondary)", display: "block", marginBottom: "0.3rem" }}>
                    Branch Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Velachery Artisan Store"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    style={{ width: "100%", padding: "0.6rem", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "6px", color: "#fff" }}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "1rem" }}>
                <div>
                  <label style={{ fontSize: "0.75rem", color: "var(--text-secondary)", display: "block", marginBottom: "0.3rem" }}>
                    Locality (Area, City)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Velachery, Chennai"
                    value={formData.locality}
                    onChange={(e) => setFormData({ ...formData, locality: e.target.value })}
                    required
                    style={{ width: "100%", padding: "0.6rem", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "6px", color: "#fff" }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: "0.75rem", color: "var(--text-secondary)", display: "block", marginBottom: "0.3rem" }}>
                    Full Postal Address
                  </label>
                  <input
                    type="text"
                    placeholder="Shop No, Street, Landmark, Pincode"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    required
                    style={{ width: "100%", padding: "0.6rem", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "6px", color: "#fff" }}
                  />
                </div>
              </div>

              {/* Coordinates */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div>
                  <label style={{ fontSize: "0.75rem", color: "var(--text-secondary)", display: "block", marginBottom: "0.3rem" }}>
                    Latitude (for Branch Map Finder)
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={formData.lat}
                    onChange={(e) => setFormData({ ...formData, lat: e.target.value })}
                    required
                    style={{ width: "100%", padding: "0.6rem", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "6px", color: "#fff" }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: "0.75rem", color: "var(--text-secondary)", display: "block", marginBottom: "0.3rem" }}>
                    Longitude
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={formData.lng}
                    onChange={(e) => setFormData({ ...formData, lng: e.target.value })}
                    required
                    style={{ width: "100%", padding: "0.6rem", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "6px", color: "#fff" }}
                  />
                </div>
              </div>

              {/* Contacts */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div>
                  <label style={{ fontSize: "0.75rem", color: "var(--text-secondary)", display: "block", marginBottom: "0.3rem" }}>
                    Branch Phone
                  </label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    required
                    style={{ width: "100%", padding: "0.6rem", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "6px", color: "#fff" }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: "0.75rem", color: "var(--text-secondary)", display: "block", marginBottom: "0.3rem" }}>
                    WhatsApp Orders Number
                  </label>
                  <input
                    type="text"
                    value={formData.whatsapp}
                    onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                    required
                    style={{ width: "100%", padding: "0.6rem", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "6px", color: "#fff" }}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div>
                  <label style={{ fontSize: "0.75rem", color: "var(--text-secondary)", display: "block", marginBottom: "0.3rem" }}>
                    Branch Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    style={{ width: "100%", padding: "0.6rem", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "6px", color: "#fff" }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: "0.75rem", color: "var(--text-secondary)", display: "block", marginBottom: "0.3rem" }}>
                    Emergency Escalation Phone
                  </label>
                  <input
                    type="text"
                    value={formData.emergencyContact}
                    onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
                    style={{ width: "100%", padding: "0.6rem", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "6px", color: "#fff" }}
                  />
                </div>
              </div>

              {/* Working Hours */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div>
                  <label style={{ fontSize: "0.75rem", color: "var(--text-secondary)", display: "block", marginBottom: "0.3rem" }}>
                    Opening Time
                  </label>
                  <input
                    type="text"
                    value={formData.openHour}
                    onChange={(e) => setFormData({ ...formData, openHour: e.target.value })}
                    placeholder="06:00 AM"
                    style={{ width: "100%", padding: "0.6rem", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "6px", color: "#fff" }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: "0.75rem", color: "var(--text-secondary)", display: "block", marginBottom: "0.3rem" }}>
                    Closing Time
                  </label>
                  <input
                    type="text"
                    value={formData.closeHour}
                    onChange={(e) => setFormData({ ...formData, closeHour: e.target.value })}
                    placeholder="10:30 PM"
                    style={{ width: "100%", padding: "0.6rem", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "6px", color: "#fff" }}
                  />
                </div>
              </div>

              {/* Manager & Staff */}
              <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: "1rem" }}>
                <div>
                  <label style={{ fontSize: "0.75rem", color: "var(--text-secondary)", display: "block", marginBottom: "0.3rem" }}>
                    Branch Manager Name
                  </label>
                  <input
                    type="text"
                    value={formData.manager}
                    onChange={(e) => setFormData({ ...formData, manager: e.target.value })}
                    required
                    style={{ width: "100%", padding: "0.6rem", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "6px", color: "#fff" }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: "0.75rem", color: "var(--text-secondary)", display: "block", marginBottom: "0.3rem" }}>
                    Staff Headcount
                  </label>
                  <input
                    type="number"
                    value={formData.staffCount}
                    onChange={(e) => setFormData({ ...formData, staffCount: e.target.value })}
                    style={{ width: "100%", padding: "0.6rem", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "6px", color: "#fff" }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: "0.75rem", color: "var(--text-secondary)", display: "block", marginBottom: "0.3rem" }}>
                    Seating Seats
                  </label>
                  <input
                    type="number"
                    value={formData.seatingCapacity}
                    onChange={(e) => setFormData({ ...formData, seatingCapacity: e.target.value })}
                    style={{ width: "100%", padding: "0.6rem", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "6px", color: "#fff" }}
                  />
                </div>
              </div>

              {/* Target & Specialty */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div>
                  <label style={{ fontSize: "0.75rem", color: "var(--text-secondary)", display: "block", marginBottom: "0.3rem" }}>
                    Monthly Target (₹)
                  </label>
                  <input
                    type="number"
                    value={formData.monthlyTarget}
                    onChange={(e) => setFormData({ ...formData, monthlyTarget: e.target.value })}
                    style={{ width: "100%", padding: "0.6rem", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "6px", color: "#fff" }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: "0.75rem", color: "var(--text-secondary)", display: "block", marginBottom: "0.3rem" }}>
                    Signature Specialty
                  </label>
                  <input
                    type="text"
                    value={formData.specialty}
                    onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                    style={{ width: "100%", padding: "0.6rem", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "6px", color: "#fff" }}
                  />
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "1rem", marginTop: "1rem" }}>
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="bk-btn-secondary"
                  style={{ padding: "0.7rem 1.5rem" }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bk-btn-hero-primary"
                  style={{ padding: "0.7rem 1.8rem" }}
                >
                  {editingBranch ? "Save Changes" : "Create Branch"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Performance Analytics Modal */}
      {performanceModalBranch && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0,0,0,0.8)",
          backdropFilter: "blur(6px)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 10000,
          padding: "1rem"
        }}>
          <div className="glass-panel" style={{
            maxWidth: "540px",
            width: "100%",
            padding: "2rem",
            border: "1px solid rgba(245, 158, 11, 0.3)"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.2rem" }}>
              <div>
                <span className="badge badge-gold" style={{ marginBottom: "0.3rem" }}>Branch Analytics</span>
                <h3 style={{ fontSize: "1.4rem", fontWeight: 800, color: "var(--text-primary)" }}>
                  {performanceModalBranch.name}
                </h3>
                <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{performanceModalBranch.locality}</div>
              </div>
              <button
                onClick={() => setPerformanceModalBranch(null)}
                style={{ background: "transparent", border: "none", color: "var(--text-muted)", fontSize: "1.5rem", cursor: "pointer" }}
              >
                ✕
              </button>
            </div>

            {perfLoading ? (
              <div style={{ padding: "2rem", textAlign: "center", color: "var(--gold-400)" }}>
                Computing branch performance & sales ledger...
              </div>
            ) : performanceData ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <div style={{
                  background: "rgba(255,255,255,0.03)",
                  padding: "1rem",
                  borderRadius: "10px",
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "1rem"
                }}>
                  <div>
                    <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>Today's Sales</div>
                    <div style={{ fontSize: "1.3rem", fontWeight: 800, color: "var(--gold-400)" }}>
                      ₹{(performanceData.todaySales || 0).toLocaleString("en-IN")}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>Month to Date</div>
                    <div style={{ fontSize: "1.3rem", fontWeight: 800, color: "var(--text-primary)" }}>
                      ₹{(performanceData.currentMonthSales || 0).toLocaleString("en-IN")}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>Quota Target</div>
                    <div style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--text-secondary)" }}>
                      ₹{(performanceData.monthlyTarget || 0).toLocaleString("en-IN")}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>Target Achievement</div>
                    <div style={{ fontSize: "1.1rem", fontWeight: 700, color: "#10b981" }}>
                      {performanceData.targetAchievementPercent}% Achieved
                    </div>
                  </div>
                </div>

                <div style={{
                  background: "rgba(0,0,0,0.25)",
                  padding: "1rem",
                  borderRadius: "8px",
                  fontSize: "0.82rem",
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.5rem"
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "var(--text-muted)" }}>Branch Manager:</span>
                    <strong>{performanceData.manager}</strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "var(--text-muted)" }}>Active Staff:</span>
                    <strong>{performanceData.staffCount} Professionals</strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "var(--text-muted)" }}>Asset Machinery:</span>
                    <strong>{performanceData.equipmentCount} Commercial Units</strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "var(--text-muted)" }}>Customer Rating:</span>
                    <strong style={{ color: "#fbbf24" }}>★ {performanceData.rating} / 5.0</strong>
                  </div>
                </div>

                <button
                  onClick={() => setPerformanceModalBranch(null)}
                  className="bk-btn-hero-primary"
                  style={{ padding: "0.65rem", marginTop: "0.5rem", width: "100%" }}
                >
                  Close Performance Inspector
                </button>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
};
