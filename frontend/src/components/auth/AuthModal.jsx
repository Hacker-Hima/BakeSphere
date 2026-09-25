import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext.jsx";

export const AuthModal = ({ isOpen, onClose }) => {
  const { login, register, verifyEmail, resendOtp, googleLogin, loading, authError, setAuthError } = useAuth();

  const [authMode, setAuthMode] = useState("jwt"); // "jwt" | "register" | "verify" | "google"
  const [email, setEmail] = useState("admin@bakesphere.com");
  const [password, setPassword] = useState("Bakery@2026");
  const [showPassword, setShowPassword] = useState(false);

  // Registration state
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regRole, setRegRole] = useState("customer");
  const [regBranch, setRegBranch] = useState("Heritage Main (T. Nagar)");

  // Verification state
  const [verifyEmailAddr, setVerifyEmailAddr] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [simulatedOtp, setSimulatedOtp] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    let timer;
    if (resendCooldown > 0) {
      timer = setInterval(() => setResendCooldown((prev) => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [resendCooldown]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (setAuthError) setAuthError("");
    const res = await login(email, password);

    if (res.requiresVerification) {
      setVerifyEmailAddr(res.email || email);
      if (res.verificationCode) setSimulatedOtp(res.verificationCode);
      setAuthMode("verify");
      if (setAuthError) setAuthError("Please verify your email address to sign in.");
      return;
    }

    if (res.success) {
      onClose();
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (setAuthError) setAuthError("");
    const res = await register({
      name: regName,
      email: regEmail,
      password: regPassword,
      role: regRole,
      branchName: regBranch,
      branchId: regBranch.includes("Anna Nagar") ? "BR-02" : regBranch.includes("Koyambedu") ? "BR-03" : "BR-01"
    });

    if (res.requiresVerification) {
      setVerifyEmailAddr(res.email || regEmail);
      if (res.verificationCode) setSimulatedOtp(res.verificationCode);
      setOtpCode("");
      setResendCooldown(30);
      setAuthMode("verify");
    } else if (res.success) {
      onClose();
    }
  };

  const handleVerifySubmit = async (e) => {
    e.preventDefault();
    if (!otpCode.trim()) return;
    const res = await verifyEmail(verifyEmailAddr, otpCode.trim());
    if (res.success) {
      onClose();
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    const res = await resendOtp(verifyEmailAddr);
    if (res.success) {
      if (res.verificationCode) setSimulatedOtp(res.verificationCode);
      setResendCooldown(45);
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



  return (
    <div className="bk-modal-backdrop" onClick={onClose}>
      <div
        className="bk-auth-modal-dialog"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: "520px" }}
      >
        {/* Header */}
        <div className="bk-auth-modal-header">
          <div className="bk-auth-modal-title-group">
            <span className="bk-auth-modal-badge">✨ Auto-Role Identity Engine</span>
            <h3 className="bk-auth-modal-title">Sign In to BakeSphere</h3>
            <p className="bk-auth-modal-subtitle">
              Credentials automatically detect your role: Customer, Chef, Head Chef, Manager, or Admin.
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
            🔑 Sign In
          </button>
          <button
            type="button"
            className={`bk-modal-tab-btn ${authMode === "register" ? "bk-modal-tab-btn--active" : ""}`}
            onClick={() => { setAuthMode("register"); if (setAuthError) setAuthError(""); }}
          >
            📝 Register Role
          </button>
          {verifyEmailAddr && (
            <button
              type="button"
              className={`bk-modal-tab-btn ${authMode === "verify" ? "bk-modal-tab-btn--active" : ""}`}
              onClick={() => { setAuthMode("verify"); if (setAuthError) setAuthError(""); }}
            >
              📬 Verify Email
            </button>
          )}
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

        {/* Mode 1: Automated Login */}
        {authMode === "jwt" && (
          <form onSubmit={handleSubmit} className="bk-modal-form-body">
            <div className="bk-modal-form-group">
              <label className="bk-modal-form-label">Email Address / Staff ID:</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bk-modal-form-input"
                placeholder="e.g. chef@bakesphere.com"
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
                Demo password: <strong>Bakery@2026</strong>
              </small>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="bk-btn-modal-submit"
            >
              {loading ? "Authenticating..." : "Sign In & Auto-Detect Role →"}
            </button>


          </form>
        )}

        {/* Mode 2: Register with Role Selection */}
        {authMode === "register" && (
          <form onSubmit={handleRegisterSubmit} className="bk-modal-form-body">
            <div className="bk-modal-form-group">
              <label className="bk-modal-form-label">Full Name:</label>
              <input
                type="text"
                value={regName}
                onChange={(e) => setRegName(e.target.value)}
                className="bk-modal-form-input"
                placeholder="e.g. Master Chef Danielle"
                required
              />
            </div>

            <div className="bk-modal-form-group">
              <label className="bk-modal-form-label">Email Address (Requires Verification):</label>
              <input
                type="email"
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
                className="bk-modal-form-input"
                placeholder="danielle@bakesphere.com"
                required
              />
            </div>

            <div className="bk-modal-form-group">
              <label className="bk-modal-form-label">Password:</label>
              <input
                type="password"
                value={regPassword}
                onChange={(e) => setRegPassword(e.target.value)}
                className="bk-modal-form-input"
                placeholder="Min 6 characters"
                required
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.8rem" }}>
              <div className="bk-modal-form-group">
                <label className="bk-modal-form-label">Desired Role:</label>
                <select
                  value={regRole}
                  onChange={(e) => setRegRole(e.target.value)}
                  className="bk-modal-form-input"
                  style={{ height: "42px" }}
                >
                  <option value="customer">🛍️ Customer</option>
                  <option value="chef">👨‍🍳 Pastry Chef</option>
                  <option value="head_baker">🧑‍🍳 Head Chef</option>
                  <option value="manager">📋 Branch Manager</option>
                  <option value="bakery_owner">💼 Main Manager</option>
                  <option value="cashier">🛒 Cashier</option>
                  <option value="super_admin">👑 Super Admin</option>
                </select>
              </div>

              <div className="bk-modal-form-group">
                <label className="bk-modal-form-label">Branch Hub:</label>
                <select
                  value={regBranch}
                  onChange={(e) => setRegBranch(e.target.value)}
                  className="bk-modal-form-input"
                  style={{ height: "42px" }}
                >
                  <option value="Heritage Main (T. Nagar)">Heritage Main</option>
                  <option value="Anna Nagar Flagship">Anna Nagar</option>
                  <option value="Koyambedu Express">Koyambedu</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="bk-btn-modal-submit"
            >
              {loading ? "Registering..." : "Register & Send Verification Code →"}
            </button>
          </form>
        )}

        {/* Mode 3: Email OTP Verification */}
        {authMode === "verify" && (
          <form onSubmit={handleVerifySubmit} className="bk-modal-form-body">
            <div style={{ textAlign: "center", marginBottom: "0.8rem" }}>
              <div style={{ fontSize: "2rem" }}>📬</div>
              <h4 style={{ margin: "0.2rem 0", color: "#1e293b", fontSize: "1.1rem" }}>
                Verify Your Email Address
              </h4>
              <p style={{ margin: 0, fontSize: "0.8rem", color: "#64748b" }}>
                Enter the 6-digit OTP code sent to: <br />
                <strong style={{ color: "var(--crimson-500)" }}>{verifyEmailAddr}</strong>
              </p>
            </div>

            {simulatedOtp && (
              <div
                style={{
                  background: "#fef3c7",
                  border: "1px solid #fde68a",
                  borderRadius: "8px",
                  padding: "0.6rem 0.8rem",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "0.8rem"
                }}
              >
                <div>
                  <span style={{ fontSize: "0.7rem", color: "#92400e", display: "block", fontWeight: 600 }}>
                    📬 Simulated Inbox OTP:
                  </span>
                  <strong style={{ fontSize: "1rem", letterSpacing: "2px", color: "#78350f" }}>
                    {simulatedOtp}
                  </strong>
                </div>
                <button
                  type="button"
                  onClick={() => setOtpCode(simulatedOtp)}
                  style={{
                    background: "#b45309",
                    color: "#ffffff",
                    border: "none",
                    borderRadius: "4px",
                    padding: "0.3rem 0.6rem",
                    fontSize: "0.72rem",
                    fontWeight: 600,
                    cursor: "pointer"
                  }}
                >
                  Auto-fill
                </button>
              </div>
            )}

            <div className="bk-modal-form-group">
              <label className="bk-modal-form-label">6-Digit Code:</label>
              <input
                type="text"
                maxLength={6}
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                className="bk-modal-form-input"
                placeholder="123456"
                style={{ textAlign: "center", fontSize: "1.2rem", letterSpacing: "4px", fontWeight: 700 }}
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading || otpCode.length < 6}
              className="bk-btn-modal-submit"
            >
              {loading ? "Verifying..." : "Verify & Sign In →"}
            </button>

            <div style={{ display: "flex", justifyContent: "space-between", marginTop: "0.6rem" }}>
              <button
                type="button"
                onClick={handleResend}
                disabled={resendCooldown > 0 || loading}
                style={{
                  background: "none",
                  border: "none",
                  color: resendCooldown > 0 ? "#94a3b8" : "var(--crimson-500)",
                  fontSize: "0.75rem",
                  cursor: resendCooldown > 0 ? "not-allowed" : "pointer",
                  fontWeight: 600
                }}
              >
                {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "🔄 Resend Code"}
              </button>
              <button
                type="button"
                onClick={() => setAuthMode("jwt")}
                style={{ background: "none", border: "none", color: "#64748b", fontSize: "0.75rem", cursor: "pointer" }}
              >
                ← Back to Sign In
              </button>
            </div>
          </form>
        )}

        {/* Mode 4: Google OAuth */}
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
          <span>Need staff credentials?</span>
          <span style={{ color: "var(--crimson-500)", fontWeight: 600 }}>Default: Bakery@2026</span>
        </div>
      </div>
    </div>
  );
};
