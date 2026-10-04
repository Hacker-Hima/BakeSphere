export const BranchContactCard = ({ branch, isOpen, onClose }) => {
  if (!isOpen || !branch) return null;

  const phone = branch.contact?.phone || "+91 44 2434 8890";
  const rawWa = (branch.contact?.whatsapp || "919444243488").replace(/\D/g, "");
  const email = branch.contact?.email || "contact@bakesphere.com";
  const emergency = branch.contact?.emergencyContact || "+91 98840 12345";
  const bLat = branch.coordinates?.lat || 13.0418;
  const bLng = branch.coordinates?.lng || 80.2341;
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${bLat},${bLng}`;

  const waMessage = encodeURIComponent(
    `Hello BakeSphere (${branch.name})! I would like to inquire about fresh bakery items & orders.`
  );

  return (
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: "rgba(0,0,0,0.82)",
      backdropFilter: "blur(6px)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 10005,
      padding: "1rem"
    }}>
      <div className="glass-panel" style={{
        maxWidth: "480px",
        width: "100%",
        padding: "2rem",
        border: "1px solid rgba(245, 158, 11, 0.35)",
        boxShadow: "0 20px 50px rgba(0,0,0,0.6)"
      }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.2rem" }}>
          <div>
            <span className="badge badge-gold" style={{ marginBottom: "0.3rem" }}>
              Direct Branch Hotline
            </span>
            <h3 style={{ fontSize: "1.35rem", fontWeight: 800, color: "var(--text-primary)" }}>
              {branch.name}
            </h3>
            <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
              📍 {branch.locality}
            </div>
          </div>
          <button
            onClick={onClose}
            style={{ background: "transparent", border: "none", color: "var(--text-muted)", fontSize: "1.5rem", cursor: "pointer" }}
          >
            ✕
          </button>
        </div>

        {/* Address & Hours */}
        <div style={{
          background: "rgba(255, 255, 255, 0.03)",
          padding: "1rem",
          borderRadius: "8px",
          marginBottom: "1.5rem",
          fontSize: "0.82rem",
          lineHeight: 1.5,
          color: "var(--text-secondary)"
        }}>
          <div><strong>Address:</strong> {branch.address}</div>
          <div style={{ marginTop: "0.4rem" }}>
            <strong>Operating Hours:</strong>{" "}
            <span style={{ color: "var(--gold-400)" }}>
              {branch.workingHours?.display || "06:00 AM – 10:30 PM"}
            </span>
          </div>
          {branch.manager && (
            <div style={{ marginTop: "0.3rem", fontSize: "0.78rem", color: "var(--text-muted)" }}>
              Store Manager: {branch.manager}
            </div>
          )}
        </div>

        {/* Contact Action Buttons */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.9rem", marginBottom: "1.2rem" }}>
          {/* Call Now */}
          <a
            href={`tel:${phone}`}
            className="bk-btn-hero-primary"
            style={{
              textDecoration: "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.5rem",
              padding: "0.75rem",
              fontSize: "0.86rem",
              textAlign: "center"
            }}
          >
            <span>📞</span> Call Now
          </a>

          {/* WhatsApp */}
          <a
            href={`https://wa.me/${rawWa}?text=${waMessage}`}
            target="_blank"
            rel="noreferrer"
            style={{
              textDecoration: "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.5rem",
              padding: "0.75rem",
              fontSize: "0.86rem",
              background: "#25D366",
              color: "#fff",
              borderRadius: "8px",
              fontWeight: 700,
              textAlign: "center"
            }}
          >
            <span>💬</span> WhatsApp
          </a>

          {/* Email */}
          <a
            href={`mailto:${email}?subject=Inquiry for ${encodeURIComponent(branch.name)}`}
            className="bk-btn-secondary"
            style={{
              textDecoration: "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.5rem",
              padding: "0.75rem",
              fontSize: "0.86rem",
              textAlign: "center"
            }}
          >
            <span>✉️</span> Send Email
          </a>

          {/* SMS */}
          <a
            href={`sms:${phone}?body=Hello%20BakeSphere%20${encodeURIComponent(branch.name)}`}
            className="bk-btn-secondary"
            style={{
              textDecoration: "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.5rem",
              padding: "0.75rem",
              fontSize: "0.86rem",
              textAlign: "center"
            }}
          >
            <span>📱</span> Send SMS
          </a>
        </div>

        {/* Directions & Emergency */}
        <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
          <a
            href={directionsUrl}
            target="_blank"
            rel="noreferrer"
            style={{
              textDecoration: "none",
              background: "rgba(56, 189, 248, 0.15)",
              border: "1px solid #38bdf8",
              color: "#38bdf8",
              padding: "0.7rem",
              borderRadius: "8px",
              fontWeight: 700,
              fontSize: "0.85rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.5rem"
            }}
          >
            <span>🗺️</span> Get Live GPS Driving Directions
          </a>

          {emergency && (
            <div style={{ textAlign: "center", fontSize: "0.72rem", color: "var(--text-muted)", marginTop: "0.4rem" }}>
              Emergency / Escalation Hotline: <a href={`tel:${emergency}`} style={{ color: "var(--gold-400)" }}>{emergency}</a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
