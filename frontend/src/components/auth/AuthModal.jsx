import { useState } from "react";
import { useAuth } from "../../context/AuthContext.jsx";

export const AuthModal = ({ isOpen, onClose }) => {
  const { login, googleLogin, loading, authError, setAuthError, switchDemoRole } = useAuth();

  const [authMode, setAuthMode] = useState("jwt"); // "jwt" | "roles" | "google"
  const [email, setEmail] = useState("admin@bakesphere.com");
  const [password, setPassword] = useState("Bakery@2026");
  const [showPassword, setShowPassword] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await login(email, password);
    if (res.success) {
      onClose();
    }
  };

  const handleGoogleSignIn = async () => {
    const res = await googleLogin({
      email: "mentor.evaluator@gmail.com",
      name: "Mentor Evaluator",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80"
    });
    if (res.success) {
      onClose();
    }
  };

  const demoAccounts = [
    { role: "super_admin", label: "Super Admin", icon: "👑", email: "admin@bakesphere.com", pass: "Bakery@2026", desc: "All 9 Modules" },
    { role: "bakery_owner", label: "Bakery Owner", icon: "💼", email: "owner@bakesphere.com", pass: "Bakery@2026", desc: "Executive" },
    { role: "manager", label: "Branch Manager", icon: "📋", email: "manager@bakesphere.com", pass: "Bakery@2026", desc: "Operations" },
    { role: "head_baker", label: "Head Baker", icon: "🧑‍🍳", email: "baker@bakesphere.com", pass: "Bakery@2026", desc: "Recipes & Stock" },
    { role: "cashier", label: "POS Cashier", icon: "🛒", email: "cashier@bakesphere.com", pass: "Bakery@2026", desc: "POS Billing" },
    { role: "customer", label: "Customer", icon: "🛍️", email: "customer@bakesphere.com", pass: "Bakery@2026", desc: "Store & Studio" }
  ];

  return (
    <div className="bk-modal-backdrop" onClick={onClose}>
      <div
        className="bk-auth-modal-dialog"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bk-auth-modal-header">
          <div className="bk-auth-modal-title-group">
            <span className="bk-auth-modal-badge">✨ Dual Auth Engine</span>
            <h3 className="bk-auth-modal-title">Sign In to BakeSphere</h3>
            <p className="bk-auth-modal-subtitle">
              Verified ID & Password Credentials or 1-Click Role Login
            </p>
          </div>
          <button className="bk-modal-close-btn" onClick={onClose}>✕</button>
        </div>

        {/* Tab Buttons */}
        <div className="bk-auth-modal-tabs">
          <button
            type="button"
            className={`bk-modal-tab-btn ${authMode === "jwt" ? "bk-modal-tab-btn--active" : ""}`}
            onClick={() => { setAuthMode("jwt"); if (setAuthError) setAuthError(""); }}
          >
            🔑 Credentials Login
          </button>
          <button
            type="button"
            className={`bk-modal-tab-btn ${authMode === "roles" ? "bk-modal-tab-btn--active" : ""}`}
            onClick={() => { setAuthMode("roles"); if (setAuthError) setAuthError(""); }}
          >
            ⚡ 1-Click Roles ({demoAccounts.length})
          </button>
          <button
            type="button"
            className={`bk-modal-tab-btn ${authMode === "google" ? "bk-modal-tab-btn--active" : ""}`}
            onClick={() => { setAuthMode("google"); if (setAuthError) setAuthError(""); }}
          >
            🌐 Google OAuth
          </button>
        </div>

        {authError && (
          <div className="bk-auth-alert bk-auth-alert--error" style={{ margin: "0.8rem 1.4rem" }}>
            <span>⚠️ {authError}</span>
          </div>
        )}

        {/* Mode 1: Standard JWT Form */}
        {authMode === "jwt" && (
          <form onSubmit={handleSubmit} className="bk-modal-form-body">
            <div className="bk-modal-form-group">
              <label className="bk-modal-form-label">Email Address / User ID:</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bk-modal-form-input"
                placeholder="e.g. baker@bakesphere.com"
                required
              />
            </div>

            <div className="bk-modal-form-group">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <label className="bk-modal-form-label">Password:</label>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ background: "none", border: "none", color: "var(--crimson-500)", cursor: "pointer", fontSize: "0.75rem", fontWeight: 600 }}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bk-modal-form-input"
                placeholder="Enter password"
                required
              />
              <small style={{ fontSize: "0.72rem", color: "#666", marginTop: "0.2rem", display: "block" }}>
                Default demo password: <strong>Bakery@2026</strong>
              </small>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="bk-btn-modal-submit"
            >
              {loading ? "Authenticating JWT..." : "Sign In with ID & Password →"}
            </button>
          </form>
        )}

        {/* Mode 2: Quick Role Cards */}
        {authMode === "roles" && (
          <div className="bk-modal-roles-list">
            <p style={{ fontSize: "0.8rem", color: "#555", marginBottom: "0.8rem" }}>
              Click any role to autofill or immediately test role-based UI permissions:
            </p>
            <div className="bk-modal-roles-grid">
              {demoAccounts.map((d) => (
                <div key={d.role} className="bk-modal-role-pill-card">
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <span style={{ fontSize: "1.2rem" }}>{d.icon}</span>
                    <div>
                      <strong style={{ fontSize: "0.85rem", color: "#111", display: "block" }}>{d.label}</strong>
                      <span style={{ fontSize: "0.72rem", color: "#666" }}>{d.email}</span>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: "0.3rem" }}>
                    <button
                      type="button"
                      className="bk-btn-mini-use"
                      onClick={() => {
                        setEmail(d.email);
                        setPassword(d.pass);
                        setAuthMode("jwt");
                      }}
                      title="Autofill form"
                    >
                      Fill
                    </button>
                    <button
                      type="button"
                      className="bk-btn-mini-login"
                      onClick={async () => {
                        await switchDemoRole(d.role);
                        onClose();
                      }}
                      title="Instant login"
                    >
                      Login ⚡
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Mode 3: Google OAuth */}
        {authMode === "google" && (
          <div style={{ padding: "1.4rem", textAlign: "center" }}>
            <p style={{ fontSize: "0.85rem", color: "#555", marginBottom: "1.2rem" }}>
              Simulated Google OAuth 2.0 handshake with token verification and automated customer profile synchronization.
            </p>
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="bk-btn-google-auth"
              style={{ width: "100%", justifyContent: "center" }}
            >
              <span>🌐</span>
              <span>Continue with Google</span>
            </button>
          </div>
        )}

        {/* Footer info */}
        <div className="bk-auth-modal-footer">
          <span>Need full staff directory?</span>
          <span style={{ color: "var(--crimson-500)", fontWeight: 600 }}>ID: Bakery@2026</span>
        </div>
      </div>
    </div>
  );
};
