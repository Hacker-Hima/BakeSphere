import { useState } from "react";
import { useAuth } from "../../context/AuthContext.jsx";
import { handleImageError, getSafeImageUrl } from "../../utils/imageFallback.js";

export const AuthPortal = ({ onNavigateTab }) => {
  const {
    currentUser,
    role,
    login,
    register,
    googleLogin,
    switchDemoRole,
    loginAsGuest,
    logout,
    loading,
    authError,
    setAuthError,
    allowedTabs
  } = useAuth();

  const [authMode, setAuthMode] = useState("login"); // "login" | "register" | "roles"
  const [selectedRole, setSelectedRole] = useState("super_admin");
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

  const roles = [
    {
      role: "super_admin",
      label: "Super Admin",
      icon: "👑",
      email: "admin@bakesphere.com",
      password: "Bakery@2026",
      branch: "Heritage Main",
      badge: "Full System",
      primaryTab: "dashboard"
    },
    {
      role: "bakery_owner",
      label: "Bakery Owner",
      icon: "💼",
      email: "owner@bakesphere.com",
      password: "Bakery@2026",
      branch: "Heritage Main",
      badge: "Executive",
      primaryTab: "dashboard"
    },
    {
      role: "manager",
      label: "Manager",
      icon: "📋",
      email: "manager@bakesphere.com",
      password: "Bakery@2026",
      branch: "Anna Nagar",
      badge: "Operations",
      primaryTab: "dashboard"
    },
    {
      role: "head_baker",
      label: "Head Baker",
      icon: "🧑‍🍳",
      email: "baker@bakesphere.com",
      password: "Bakery@2026",
      branch: "Heritage Main",
      badge: "Kitchen",
      primaryTab: "production"
    },
    {
      role: "cashier",
      label: "Cashier",
      icon: "🛒",
      email: "cashier@bakesphere.com",
      password: "Bakery@2026",
      branch: "Koyambedu",
      badge: "POS Retail",
      primaryTab: "pos"
    },
    {
      role: "customer",
      label: "Customer",
      icon: "🛍️",
      email: "customer@bakesphere.com",
      password: "Bakery@2026",
      branch: "Online",
      badge: "Storefront",
      primaryTab: "shop"
    }
  ];

  const handleSelectRole = (r) => {
    setSelectedRole(r.role);
    setEmail(r.email);
    setPassword(r.password);
    if (setAuthError) setAuthError("");
  };

  const handle1ClickRoleLogin = async (r) => {
    handleSelectRole(r);
    setSuccessMsg(`Signing in as ${r.label}...`);
    const res = await switchDemoRole(r.role);
    if (res.success) {
      setSuccessMsg(`Welcome back, ${r.label}!`);
      setTimeout(() => {
        if (onNavigateTab) onNavigateTab(r.primaryTab);
      }, 350);
    }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return;
    const res = await login(email, password);
    if (res.success) {
      setSuccessMsg(`Welcome, ${res.user.name}`);
      const matched = roles.find((c) => c.role === res.user.role);
      const targetTab = matched ? matched.primaryTab : "shop";
      setTimeout(() => {
        if (onNavigateTab) onNavigateTab(targetTab);
      }, 500);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (!regName.trim() || !regEmail.trim() || !regPassword.trim()) {
      if (setAuthError) setAuthError("Please fill in all registration fields.");
      return;
    }
    const res = await register({
      name: regName,
      email: regEmail,
      password: regPassword,
      role: regRole,
      branchName: regBranch,
      branchId: regBranch.includes("Anna Nagar") ? "BR-02" : regBranch.includes("Koyambedu") ? "BR-03" : "BR-01"
    });
    if (res.success) {
      setSuccessMsg(`Welcome, ${regName}!`);
      setTimeout(() => {
        if (onNavigateTab) onNavigateTab(regRole === "customer" ? "shop" : "dashboard");
      }, 500);
    }
  };

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
      }, 500);
    }
  };

  const currentRoleObj = roles.find((r) => r.role === selectedRole) || roles[0];

  return (
    <div className="bk-auth-v2-container">
      {/* ══════════ ACTIVE SESSION BANNER (WHEN LOGGED IN) ══════════ */}
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

      {/* ══════════ MAIN LUXURY SPLIT AUTH CARD ══════════ */}
      <div className="bk-auth-v2-card">
        {/* LEFT SHOWCASE HERO */}
        <div className="bk-auth-v2-hero">
          <div className="bk-auth-v2-hero-content">
            <div className="bk-auth-v2-brand-badge">
              <span className="bk-auth-v2-logo-icon">🧁</span>
              <span className="bk-auth-v2-logo-text">BakeSphere</span>
            </div>

            <h1 className="bk-auth-v2-hero-title">
              Artisan Bakery &<br />Kitchen ERP
            </h1>

            <p className="bk-auth-v2-hero-sub">
              Streamlined management for multi-branch baking, POS checkout, and online storefront delivery.
            </p>

            <div className="bk-auth-v2-perks">
              <div className="bk-auth-v2-perk-item">
                <span className="bk-auth-v2-perk-icon">⚡</span>
                <span><strong>1-Click Testing</strong> with pre-built staff roles</span>
              </div>
              <div className="bk-auth-v2-perk-item">
                <span className="bk-auth-v2-perk-icon">🛡️</span>
                <span><strong>Strict RBAC</strong> tailored to each bakery role</span>
              </div>
              <div className="bk-auth-v2-perk-item">
                <span className="bk-auth-v2-perk-icon">🎂</span>
                <span><strong>72 Unique Items</strong> ready for storefront & orders</span>
              </div>
            </div>

            <div className="bk-auth-v2-hero-actions">
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

          <div className="bk-auth-v2-hero-footer">
            <span>📍 Heritage Main · Anna Nagar · Koyambedu</span>
          </div>
        </div>

        {/* RIGHT INTERACTIVE AUTH FORM */}
        <div className="bk-auth-v2-form-section">
          {/* Top Segmented Mode Switcher */}
          <div className="bk-auth-v2-switcher">
            <button
              type="button"
              className={`bk-auth-v2-switch-btn ${authMode === "login" ? "active" : ""}`}
              onClick={() => {
                setAuthMode("login");
                if (setAuthError) setAuthError("");
              }}
            >
              Sign In
            </button>
            <button
              type="button"
              className={`bk-auth-v2-switch-btn ${authMode === "roles" ? "active" : ""}`}
              onClick={() => {
                setAuthMode("roles");
                if (setAuthError) setAuthError("");
              }}
            >
              ⚡ Instant Roles
            </button>
            <button
              type="button"
              className={`bk-auth-v2-switch-btn ${authMode === "register" ? "active" : ""}`}
              onClick={() => {
                setAuthMode("register");
                if (setAuthError) setAuthError("");
              }}
            >
              Register
            </button>
          </div>

          {/* Feedback Alerts */}
          {authError && (
            <div className="bk-auth-v2-alert error">
              <span>⚠️ {authError}</span>
            </div>
          )}
          {successMsg && (
            <div className="bk-auth-v2-alert success">
              <span>✓ {successMsg}</span>
            </div>
          )}

          {/* QUICK ROLE SELECTOR DOCK (VISIBLE ON LOGIN OR ROLES MODE) */}
          {authMode !== "register" && (
            <div className="bk-auth-v2-roles-dock">
              <div className="bk-auth-v2-dock-header">
                <span className="bk-auth-v2-dock-label">Select Demo Profile:</span>
                <span className="bk-auth-v2-dock-tip">Click any role to autofill or 1-click launch</span>
              </div>
              <div className="bk-auth-v2-dock-pills">
                {roles.map((r) => {
                  const isSelected = selectedRole === r.role;
                  return (
                    <button
                      key={r.role}
                      type="button"
                      className={`bk-auth-v2-role-pill ${isSelected ? "selected" : ""}`}
                      onClick={() => handleSelectRole(r)}
                      title={`${r.label} (${r.badge})`}
                    >
                      <span className="bk-auth-v2-pill-icon">{r.icon}</span>
                      <span className="bk-auth-v2-pill-name">{r.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Quick 1-Click Launch Button for the selected role */}
              <div className="bk-auth-v2-role-preview-card">
                <div className="bk-auth-v2-role-preview-info">
                  <span className="bk-auth-v2-preview-badge">{currentRoleObj.badge}</span>
                  <strong>{currentRoleObj.label}</strong>
                  <span className="bk-auth-v2-preview-email">{currentRoleObj.email}</span>
                </div>
                <button
                  type="button"
                  className="bk-auth-v2-quick-login-btn"
                  onClick={() => handle1ClickRoleLogin(currentRoleObj)}
                  disabled={loading}
                >
                  ⚡ Launch as {currentRoleObj.label}
                </button>
              </div>
            </div>
          )}

          {/* MODE 1 & 2: SIGN IN FORM */}
          {(authMode === "login" || authMode === "roles") && (
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
                    placeholder="Enter email"
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
                    placeholder="Enter password"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="bk-auth-v2-submit-btn"
                disabled={loading}
              >
                {loading ? "Signing In..." : "Sign In to BakeSphere →"}
              </button>

              <div className="bk-auth-v2-divider">
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
            </form>
          )}

          {/* MODE 3: REGISTRATION FORM */}
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
                    placeholder="e.g. Anita Nair"
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
                    <option value="customer">Customer (Store)</option>
                    <option value="cashier">Cashier (POS)</option>
                    <option value="head_baker">Head Baker (Kitchen)</option>
                    <option value="manager">Manager (Branch)</option>
                    <option value="bakery_owner">Bakery Owner</option>
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
              >
                {loading ? "Creating..." : "Create Account →"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
