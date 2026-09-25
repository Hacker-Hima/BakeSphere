import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext.jsx";
import { handleImageError, getSafeImageUrl } from "../../utils/imageFallback.js";

export const AuthPortal = ({ onNavigateTab }) => {
  const {
    currentUser,
    role,
    login,
    register,
    verifyEmail,
    resendOtp,
    googleLogin,
    loginAsGuest,
    logout,
    loading,
    authError,
    setAuthError,
    allowedTabs
  } = useAuth();

  const [authMode, setAuthMode] = useState("login"); // "login" | "register" | "verify"
  const [email, setEmail] = useState("admin@bakesphere.com");
  const [password, setPassword] = useState("Bakery@2026");
  const [showPassword, setShowPassword] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  // Registration state
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regRole, setRegRole] = useState("customer");
  const [regBranch, setRegBranch] = useState("Heritage Main (T. Nagar)");

  // Email Verification state
  const [verificationEmail, setVerificationEmail] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [simulatedOtp, setSimulatedOtp] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);

  // Helper to determine destination workspace from role
  const getDestinationTab = (userRole) => {
    switch (userRole) {
      case "head_baker":
      case "chef":
        return "production";
      case "cashier":
        return "pos";
      case "manager":
      case "bakery_owner":
      case "super_admin":
        return "dashboard";
      case "customer":
      default:
        return "shop";
    }
  };

  // Resend cooldown timer
  useEffect(() => {
    let timer;
    if (resendCooldown > 0) {
      timer = setInterval(() => setResendCooldown((prev) => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [resendCooldown]);

  // Automated Login Handler: System auto-resolves role based on credentials alone
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;

    if (setAuthError) setAuthError("");
    setSuccessMsg("");

    const res = await login(email.trim(), password);

    if (res.requiresVerification) {
      setVerificationEmail(res.email || email);
      if (res.verificationCode) setSimulatedOtp(res.verificationCode);
      setAuthMode("verify");
      if (setAuthError) setAuthError("Please complete email verification before signing in.");
      return;
    }

    if (res.success && res.user) {
      setSuccessMsg(`Welcome, ${res.user.name}!`);
      const targetTab = getDestinationTab(res.user.role);
      setTimeout(() => {
        if (onNavigateTab) onNavigateTab(targetTab);
      }, 400);
    }
  };

  // Registration Handler
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (!regName.trim() || !regEmail.trim() || !regPassword.trim()) {
      if (setAuthError) setAuthError("Please fill in all fields.");
      return;
    }

    if (regPassword.length < 6) {
      if (setAuthError) setAuthError("Password must be at least 6 characters.");
      return;
    }

    if (setAuthError) setAuthError("");
    setSuccessMsg("");

    const res = await register({
      name: regName.trim(),
      email: regEmail.trim(),
      password: regPassword,
      role: regRole,
      branchName: regBranch,
      branchId: regBranch.includes("Anna Nagar") ? "BR-02" : regBranch.includes("Koyambedu") ? "BR-03" : "BR-01"
    });

    if (res.requiresVerification) {
      setVerificationEmail(res.email || regEmail.trim());
      if (res.verificationCode) setSimulatedOtp(res.verificationCode);
      setOtpCode("");
      setResendCooldown(30);
      setAuthMode("verify");
      setSuccessMsg("Verification code sent to your email!");
    } else if (res.success && res.user) {
      setSuccessMsg(`Welcome, ${res.user.name}!`);
      const targetTab = getDestinationTab(res.user.role);
      setTimeout(() => {
        if (onNavigateTab) onNavigateTab(targetTab);
      }, 400);
    }
  };

  // Email Verification Handler
  const handleVerifySubmit = async (e) => {
    e.preventDefault();
    if (!otpCode.trim()) {
      if (setAuthError) setAuthError("Please enter the verification code.");
      return;
    }

    if (setAuthError) setAuthError("");
    const res = await verifyEmail(verificationEmail, otpCode.trim());

    if (res.success && res.user) {
      setSuccessMsg(`Email verified! Welcome, ${res.user.name}.`);
      const targetTab = getDestinationTab(res.user.role);
      setTimeout(() => {
        if (onNavigateTab) onNavigateTab(targetTab);
      }, 400);
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    if (resendCooldown > 0) return;
    const res = await resendOtp(verificationEmail);
    if (res.success) {
      if (res.verificationCode) setSimulatedOtp(res.verificationCode);
      setResendCooldown(45);
      setSuccessMsg("A new verification code has been dispatched!");
    }
  };

  // Google OAuth Handshake
  const handleGoogleAuth = async () => {
    const res = await googleLogin({
      email: "evaluator.mentor@gmail.com",
      name: "Evaluator / Mentor",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80"
    });
    if (res.success) {
      setSuccessMsg("Google Authentication successful!");
      setTimeout(() => {
        if (onNavigateTab) onNavigateTab("shop");
      }, 400);
    }
  };

  return (
    <div className="bk-auth-v2-container">
      {/* ══════════ ACTIVE SESSION BANNER ══════════ */}
      {currentUser && (
        <div className="bk-auth-v2-session-bar">
          <div className="bk-auth-v2-session-left">
            <img
              src={getSafeImageUrl(currentUser.avatar)}
              alt={currentUser.name}
              className="bk-auth-v2-avatar"
              onError={handleImageError}
            />
            <div>
              <div className="bk-auth-v2-session-name-row">
                <span className="bk-auth-v2-session-name">{currentUser.name}</span>
                <span className="bk-auth-v2-role-tag">{currentUser.roleLabel || role}</span>
                <span className="bk-auth-v2-branch-tag">📍 {currentUser.branchName || "Heritage Main"}</span>
              </div>
              <div className="bk-auth-v2-modules-row">
                {allowedTabs?.map((t) => (
                  <button
                    key={t}
                    type="button"
                    className="bk-auth-v2-tab-pill"
                    onClick={() => onNavigateTab && onNavigateTab(t)}
                  >
                    {t.toUpperCase()} →
                  </button>
                ))}
              </div>
            </div>
          </div>
          <button
            type="button"
            className="bk-auth-v2-btn-signout"
            onClick={logout}
          >
            🚪 Sign Out
          </button>
        </div>
      )}

      {/* ══════════ SLEEK MINIMAL AUTH CARD ══════════ */}
      <div className="bk-auth-v2-card" style={{ maxWidth: "860px", margin: "1.5rem auto" }}>
        {/* LEFT CLEAN HERO */}
        <div className="bk-auth-v2-hero" style={{ padding: "2.5rem 2rem", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div>
            <div className="bk-auth-v2-brand-badge" style={{ marginBottom: "1.2rem" }}>
              <span className="bk-auth-v2-logo-icon">🧁</span>
              <span className="bk-auth-v2-logo-text">BakeSphere</span>
            </div>

            <h1 className="bk-auth-v2-hero-title" style={{ fontSize: "2rem", marginBottom: "0.8rem", lineHeight: 1.2 }}>
              Artisan Bakery &<br />Kitchen ERP
            </h1>

            <p className="bk-auth-v2-hero-sub" style={{ fontSize: "0.95rem", opacity: 0.9 }}>
              Multi-branch bakery management, storefront delivery, POS billing, and AI culinary assistant.
            </p>
          </div>

          <div style={{ marginTop: "2rem" }}>
            <button
              type="button"
              className="bk-auth-v2-guest-btn"
              onClick={() => {
                loginAsGuest();
                if (onNavigateTab) onNavigateTab("shop");
              }}
            >
              <span>🛍️ Explore Store as Guest</span>
              <span className="bk-auth-v2-arrow">→</span>
            </button>
          </div>
        </div>

        {/* RIGHT MINIMAL AUTH FORM */}
        <div className="bk-auth-v2-form-section" style={{ padding: "2.5rem 2.2rem" }}>
          {/* Minimal Mode Switcher */}
          <div className="bk-auth-v2-switcher" style={{ marginBottom: "1.5rem" }}>
            <button
              type="button"
              className={`bk-auth-v2-switch-btn ${authMode === "login" ? "active" : ""}`}
              onClick={() => {
                setAuthMode("login");
                if (setAuthError) setAuthError("");
                setSuccessMsg("");
              }}
            >
              Sign In
            </button>
            <button
              type="button"
              className={`bk-auth-v2-switch-btn ${authMode === "register" ? "active" : ""}`}
              onClick={() => {
                setAuthMode("register");
                if (setAuthError) setAuthError("");
                setSuccessMsg("");
              }}
            >
              Register
            </button>
            {verificationEmail && (
              <button
                type="button"
                className={`bk-auth-v2-switch-btn ${authMode === "verify" ? "active" : ""}`}
                onClick={() => {
                  setAuthMode("verify");
                  if (setAuthError) setAuthError("");
                }}
              >
                Verify Email
              </button>
            )}
          </div>

          {/* Feedback Alerts */}
          {authError && (
            <div className="bk-auth-v2-alert error" style={{ marginBottom: "1rem" }}>
              <span>⚠️ {authError}</span>
            </div>
          )}
          {successMsg && (
            <div className="bk-auth-v2-alert success" style={{ marginBottom: "1rem" }}>
              <span>✓ {successMsg}</span>
            </div>
          )}

          {/* ══════════ MODE 1: MINIMAL CREDENTIAL LOGIN ══════════ */}
          {authMode === "login" && (
            <form onSubmit={handleLoginSubmit} className="bk-auth-v2-form">
              <div className="bk-auth-v2-input-group">
                <label className="bk-auth-v2-label">Email or Staff ID</label>
                <div className="bk-auth-v2-input-wrapper">
                  <span className="bk-auth-v2-input-icon">✉️</span>
                  <input
                    type="email"
                    className="bk-auth-v2-input"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@bakesphere.com"
                    required
                  />
                </div>
              </div>

              <div className="bk-auth-v2-input-group">
                <div className="bk-auth-v2-label-row">
                  <label className="bk-auth-v2-label">Password</label>
                  <button
                    type="button"
                    className="bk-auth-v2-toggle-pwd"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
                <div className="bk-auth-v2-input-wrapper">
                  <span className="bk-auth-v2-input-icon">🔒</span>
                  <input
                    type={showPassword ? "text" : "password"}
                    className="bk-auth-v2-input"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="bk-auth-v2-submit-btn"
                disabled={loading}
                style={{ marginTop: "0.5rem" }}
              >
                {loading ? "Signing In..." : "Sign In →"}
              </button>

              <div className="bk-auth-v2-divider" style={{ margin: "1.2rem 0" }}>
                <span>or</span>
              </div>

              <button
                type="button"
                className="bk-auth-v2-google-btn"
                onClick={handleGoogleAuth}
                disabled={loading}
              >
                <svg width="18" height="18" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span>Continue with Google</span>
              </button>

              <div style={{ textAlign: "center", marginTop: "1.2rem", fontSize: "0.85rem", color: "#6b7280" }}>
                Don't have an account?{" "}
                <button
                  type="button"
                  onClick={() => setAuthMode("register")}
                  style={{ background: "none", border: "none", color: "#c8102e", fontWeight: 600, cursor: "pointer" }}
                >
                  Create one
                </button>
              </div>
            </form>
          )}

          {/* ══════════ MODE 2: REGISTRATION ══════════ */}
          {authMode === "register" && (
            <form onSubmit={handleRegisterSubmit} className="bk-auth-v2-form">
              <div className="bk-auth-v2-input-group">
                <label className="bk-auth-v2-label">Full Name</label>
                <div className="bk-auth-v2-input-wrapper">
                  <span className="bk-auth-v2-input-icon">👤</span>
                  <input
                    type="text"
                    className="bk-auth-v2-input"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="Enter your name"
                    required
                  />
                </div>
              </div>

              <div className="bk-auth-v2-input-group">
                <label className="bk-auth-v2-label">Email Address</label>
                <div className="bk-auth-v2-input-wrapper">
                  <span className="bk-auth-v2-input-icon">✉️</span>
                  <input
                    type="email"
                    className="bk-auth-v2-input"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="name@bakesphere.com"
                    required
                  />
                </div>
              </div>

              <div className="bk-auth-v2-input-group">
                <label className="bk-auth-v2-label">Password</label>
                <div className="bk-auth-v2-input-wrapper">
                  <span className="bk-auth-v2-input-icon">🔒</span>
                  <input
                    type="password"
                    className="bk-auth-v2-input"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="Min 6 characters"
                    required
                  />
                </div>
              </div>

              <div className="bk-auth-v2-row-two">
                <div className="bk-auth-v2-input-group">
                  <label className="bk-auth-v2-label">Role</label>
                  <select
                    className="bk-auth-v2-select"
                    value={regRole}
                    onChange={(e) => setRegRole(e.target.value)}
                  >
                    <option value="customer">Customer</option>
                    <option value="chef">Pastry Chef</option>
                    <option value="head_baker">Head Chef</option>
                    <option value="manager">Branch Manager</option>
                    <option value="bakery_owner">Main Manager / Owner</option>
                    <option value="cashier">POS Cashier</option>
                    <option value="super_admin">Super Admin</option>
                  </select>
                </div>

                <div className="bk-auth-v2-input-group">
                  <label className="bk-auth-v2-label">Branch</label>
                  <select
                    className="bk-auth-v2-select"
                    value={regBranch}
                    onChange={(e) => setRegBranch(e.target.value)}
                  >
                    <option value="Heritage Main (T. Nagar)">Heritage Main</option>
                    <option value="Anna Nagar Flagship">Anna Nagar</option>
                    <option value="Koyambedu Express">Koyambedu</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="bk-auth-v2-submit-btn"
                disabled={loading}
                style={{ marginTop: "0.5rem" }}
              >
                {loading ? "Registering..." : "Create Account & Verify Email →"}
              </button>

              <div style={{ textAlign: "center", marginTop: "1rem", fontSize: "0.85rem", color: "#6b7280" }}>
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => setAuthMode("login")}
                  style={{ background: "none", border: "none", color: "#c8102e", fontWeight: 600, cursor: "pointer" }}
                >
                  Sign In
                </button>
              </div>
            </form>
          )}

          {/* ══════════ MODE 3: EMAIL VERIFICATION ══════════ */}
          {authMode === "verify" && (
            <form onSubmit={handleVerifySubmit} className="bk-auth-v2-form">
              <div style={{ textAlign: "center", padding: "0.5rem 0 1rem" }}>
                <div style={{ fontSize: "2rem", marginBottom: "0.3rem" }}>📬</div>
                <h3 style={{ fontSize: "1.15rem", fontWeight: 700, color: "#111827", margin: "0 0 0.2rem" }}>
                  Verify Email Address
                </h3>
                <p style={{ fontSize: "0.82rem", color: "#6b7280", margin: 0 }}>
                  Enter the 6-digit OTP code sent to: <br />
                  <strong style={{ color: "#c8102e" }}>{verificationEmail}</strong>
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
                      Code Preview:
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
                      borderRadius: "6px",
                      padding: "0.3rem 0.65rem",
                      fontSize: "0.72rem",
                      fontWeight: 600,
                      cursor: "pointer"
                    }}
                  >
                    Auto-fill
                  </button>
                </div>
              )}

              <div className="bk-auth-v2-input-group">
                <label className="bk-auth-v2-label">Verification Code</label>
                <div className="bk-auth-v2-input-wrapper">
                  <span className="bk-auth-v2-input-icon">🔑</span>
                  <input
                    type="text"
                    maxLength={6}
                    className="bk-auth-v2-input"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                    placeholder="123456"
                    style={{ fontSize: "1.2rem", letterSpacing: "4px", fontWeight: 700, textAlign: "center" }}
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="bk-auth-v2-submit-btn"
                disabled={loading || otpCode.length < 6}
                style={{ marginTop: "0.5rem" }}
              >
                {loading ? "Verifying..." : "Verify & Sign In →"}
              </button>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "1rem" }}>
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={resendCooldown > 0 || loading}
                  style={{
                    background: "none",
                    border: "none",
                    color: resendCooldown > 0 ? "#9ca3af" : "#c8102e",
                    fontSize: "0.8rem",
                    cursor: resendCooldown > 0 ? "not-allowed" : "pointer",
                    fontWeight: 600
                  }}
                >
                  {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "🔄 Resend Code"}
                </button>

                <button
                  type="button"
                  onClick={() => setAuthMode("login")}
                  style={{ background: "none", border: "none", color: "#4b5563", fontSize: "0.8rem", cursor: "pointer" }}
                >
                  ← Sign In
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
