import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext.jsx";
import { handleImageError, getSafeImageUrl } from "../../utils/imageFallback.js";

const BAKERY_HIGHLIGHTS = [
  {
    id: "croissant",
    category: "Viennoiserie",
    tabLabel: "🥐 Croissants",
    title: "Artisan Butter Croissants",
    tag: "🥐 Oven-Fresh Daily",
    badge: "100% French Normandy Butter • Baked 7:00 AM",
    desc: "Layered to 72 delicate golden honeycomb folds with an airy, flaky crust.",
    rating: "4.95",
    reviews: "1,420+",
    image: "/images/products/1555507036-ab1f4038808a.jpg",
    fallback: "/images/products/product-24.jpg"
  },
  {
    id: "truffle",
    category: "Chocolates",
    tabLabel: "🍫 Truffle",
    title: "Belgian Dark Truffle Cake",
    tag: "⭐ Bestseller",
    badge: "54% Callebaut Dark Ganache & Edible Gold",
    desc: "Rich velvet sponge soaked in espresso syrup with whipped Belgian mousse.",
    rating: "4.98",
    reviews: "2,840+",
    image: "/images/products/1578985545062-69928b1d9587.jpg",
    fallback: "/images/products/product-1.jpg"
  },
  {
    id: "macarons",
    category: "Pâtisserie",
    tabLabel: "✨ Macarons",
    title: "French Gourmet Macarons",
    tag: "✨ Handcrafted",
    badge: "Pistachio, Raspberry & Madagascar Vanilla",
    desc: "Almond meringue shells with Parisian fruit curd & velvety chocolate ganache.",
    rating: "4.91",
    reviews: "960+",
    image: "/images/products/1569864358642-9d1684040f43.jpg",
    fallback: "/images/products/product-16.jpg"
  },
  {
    id: "gateau",
    category: "Signature Cakes",
    tabLabel: "🍓 Gateau",
    title: "Fresh Berry Chiffon Gateau",
    tag: "🍓 Chef Signature",
    badge: "Wild Forest Berries & Light Chantilly",
    desc: "Featherlight Japanese sponge crown layered with fresh mountain berries.",
    rating: "4.94",
    reviews: "1,150+",
    image: "/images/products/1586788680434-30d324b2d46f.jpg",
    fallback: "/images/products/product-3.jpg"
  }
];

export const ROLE_PERKS = {
  customer: {
    icon: "🛍️",
    label: "Customer",
    desc: "Storefront shopping, custom 3D cake studio, delivery tracking & loyalty rewards"
  },
  chef: {
    icon: "🧁",
    label: "Pastry Chef",
    desc: "Kitchen production queue, dynamic recipe scaler, bake timers & FEFO batching"
  },
  head_baker: {
    icon: "👨‍🍳",
    label: "Head Chef / Master Baker",
    desc: "Master production planning, ingredient wastage logging & quality sign-off"
  },
  cashier: {
    icon: "💳",
    label: "POS Cashier",
    desc: "Rapid retail POS terminal, barcode scan, thermal invoice & payment ledger"
  },
  manager: {
    icon: "💼",
    label: "Branch Manager",
    desc: "Store shift rosters, stock reorder thresholds, inventory & daily registers"
  },
  bakery_owner: {
    icon: "🏢",
    label: "Main Manager / Owner",
    desc: "Executive P&L, multi-branch performance analytics & supplier contracts"
  },
  super_admin: {
    icon: "👑",
    label: "Super Admin",
    desc: "Full administrative control, staff credential provisioning & system audit"
  }
};

const FALLBACK_REGISTERED_USERS = [
  {
    id: 1,
    name: "Aaditya Raman",
    email: "admin@bakesphere.com",
    role: "super_admin",
    roleLabel: "Super Admin",
    branchName: "Heritage Main (T. Nagar)",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
  },
  {
    id: 4,
    name: "Chef Pierre Bouchard",
    email: "baker@bakesphere.com",
    role: "head_baker",
    roleLabel: "Head Chef / Master Baker",
    branchName: "Heritage Main (T. Nagar)",
    avatar: "https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=150&auto=format&fit=crop&q=80"
  },
  {
    id: 5,
    name: "Chef Marco Rossi",
    email: "chef@bakesphere.com",
    role: "chef",
    roleLabel: "Pastry Chef",
    branchName: "Heritage Main (T. Nagar)",
    avatar: "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=150&auto=format&fit=crop&q=80"
  },
  {
    id: 6,
    name: "Priya Natarajan",
    email: "cashier@bakesphere.com",
    role: "cashier",
    roleLabel: "POS Cashier",
    branchName: "Koyambedu Express",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80"
  },
  {
    id: 3,
    name: "Karthik Subramanian",
    email: "manager@bakesphere.com",
    role: "manager",
    roleLabel: "Branch Manager",
    branchName: "Anna Nagar Flagship",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80"
  },
  {
    id: 2,
    name: "Meenakshi Sundaram",
    email: "owner@bakesphere.com",
    role: "bakery_owner",
    roleLabel: "Main Manager / Owner",
    branchName: "Heritage Main (T. Nagar)",
    avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80"
  },
  {
    id: 7,
    name: "Sneha Varadharajan",
    email: "customer@bakesphere.com",
    role: "customer",
    roleLabel: "Customer",
    branchName: "Anna Nagar Flagship",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80"
  }
];

export const isValidEmail = (emailStr) => {
  return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(emailStr.trim());
};

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
  const [regEmailTouched, setRegEmailTouched] = useState(false);
  const [regPassword, setRegPassword] = useState("");
  const [regRole, setRegRole] = useState("customer");
  const [regBranch, setRegBranch] = useState("Heritage Main (T. Nagar)");

  // Real-time Email Verification & TOTP state
  const [verificationEmail, setVerificationEmail] = useState("");
  const [targetRole, setTargetRole] = useState("customer");
  const [otpCode, setOtpCode] = useState("");
  const [simulatedOtp, setSimulatedOtp] = useState("");
  const [emailSentReal, setEmailSentReal] = useState(false);
  const [emailPreviewUrl, setEmailPreviewUrl] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);
  const [totpRemainingSec, setTotpRemainingSec] = useState(600); // 10 minutes TOTP
  const [totpTotalSec, setTotpTotalSec] = useState(600);

  // Left Hero Visual Showcase state
  const [activeHighlightIndex, setActiveHighlightIndex] = useState(0);

  // Google OAuth Chooser Modal state
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [googleAccounts, setGoogleAccounts] = useState(FALLBACK_REGISTERED_USERS);
  const [loadingGoogleAccounts, setLoadingGoogleAccounts] = useState(false);
  const [googleActionLoading, setGoogleActionLoading] = useState(false);
  const [customGoogleMode, setCustomGoogleMode] = useState(false);
  const [customGoogleEmail, setCustomGoogleEmail] = useState("");
  const [customGoogleName, setCustomGoogleName] = useState("");

  // Auto-rotate visual showcase every 4 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveHighlightIndex((prev) => (prev + 1) % BAKERY_HIGHLIGHTS.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

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

  // Real-time TOTP countdown timer
  useEffect(() => {
    let timer;
    if (authMode === "verify" && totpRemainingSec > 0) {
      timer = setInterval(() => {
        setTotpRemainingSec((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [authMode, totpRemainingSec]);

  // Format seconds to mm:ss
  const formatTimer = (sec) => {
    const mins = Math.floor(sec / 60);
    const s = sec % 60;
    return `${mins.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  // Open Google Account Chooser Modal & fetch live registered users
  const openGoogleModal = async () => {
    setShowGoogleModal(true);
    setCustomGoogleMode(false);
    setLoadingGoogleAccounts(true);
    try {
      const res = await fetch("http://localhost:5000/api/auth/demo-users");
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          // Merge to ensure no duplicates while having full profile data
          const merged = [...data];
          FALLBACK_REGISTERED_USERS.forEach((f) => {
            if (!merged.find((m) => m.email.toLowerCase() === f.email.toLowerCase())) {
              merged.push(f);
            }
          });
          setGoogleAccounts(merged);
        }
      }
    } catch (err) {
      console.warn("Could not fetch remote accounts, using cached verified list:", err.message);
    } finally {
      setLoadingGoogleAccounts(false);
    }
  };

  // Select a registered user in Google OAuth Chooser
  const handleSelectGoogleAccount = async (account) => {
    setGoogleActionLoading(true);
    if (setAuthError) setAuthError("");
    setSuccessMsg("");

    const res = await googleLogin({
      email: account.email,
      name: account.name,
      avatar: account.avatar
    });

    setGoogleActionLoading(false);

    if (res.success && res.user) {
      setShowGoogleModal(false);
      const userRole = res.user.role || account.role;
      const roleLabel = res.user.roleLabel || account.roleLabel || userRole;
      setSuccessMsg(`Google Authentication successful! Welcome, ${res.user.name} (${roleLabel}).`);
      const targetTab = getDestinationTab(userRole);
      setTimeout(() => {
        if (onNavigateTab) onNavigateTab(targetTab);
      }, 350);
    }
  };

  // Custom Google User Sign In
  const handleCustomGoogleSubmit = async (e) => {
    e.preventDefault();
    if (!customGoogleEmail.trim() || !isValidEmail(customGoogleEmail.trim())) {
      if (setAuthError) setAuthError("Please enter a valid Google email address.");
      return;
    }

    setGoogleActionLoading(true);
    const res = await googleLogin({
      email: customGoogleEmail.trim(),
      name: customGoogleName.trim() || "Google Verified User",
      avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(customGoogleEmail.trim())}`
    });

    setGoogleActionLoading(false);

    if (res.success && res.user) {
      setShowGoogleModal(false);
      setSuccessMsg(`Google Authentication successful! Welcome, ${res.user.name}.`);
      const targetTab = getDestinationTab(res.user.role || "customer");
      setTimeout(() => {
        if (onNavigateTab) onNavigateTab(targetTab);
      }, 350);
    }
  };

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
      setTotpRemainingSec(600);
      setTotpTotalSec(600);
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

  // Registration Handler with Real-time Email Validation & Desired Role Verification
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setRegEmailTouched(true);

    if (!regName.trim() || !regEmail.trim() || !regPassword.trim()) {
      if (setAuthError) setAuthError("Please fill in all fields.");
      return;
    }

    if (!isValidEmail(regEmail.trim())) {
      if (setAuthError) setAuthError("Please enter a valid email address (e.g., name@domain.com).");
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
      setTargetRole(regRole);
      if (res.verificationCode) setSimulatedOtp(res.verificationCode);
      if (res.previewUrl) setEmailPreviewUrl(res.previewUrl);
      setEmailSentReal(Boolean(res.emailSent));
      setOtpCode("");
      setTotpRemainingSec(600);
      setTotpTotalSec(600);
      setResendCooldown(30);
      setAuthMode("verify");
      setSuccessMsg(res.message || `Verification code sent to ${res.email || regEmail.trim()}!`);
    } else if (res.success && res.user) {
      setSuccessMsg(`Welcome, ${res.user.name}!`);
      const targetTab = getDestinationTab(res.user.role);
      setTimeout(() => {
        if (onNavigateTab) onNavigateTab(targetTab);
      }, 400);
    }
  };

  // Real-time Email Verification Handler with Desired Role Routing
  const handleVerifySubmit = async (e) => {
    e.preventDefault();
    if (!otpCode.trim()) {
      if (setAuthError) setAuthError("Please enter the 6-digit verification code.");
      return;
    }

    if (totpRemainingSec <= 0) {
      if (setAuthError) setAuthError("Verification code has expired. Please click 'Resend Code'.");
      return;
    }

    if (setAuthError) setAuthError("");
    const res = await verifyEmail(verificationEmail, otpCode.trim());

    if (res.success && res.user) {
      const userRole = res.user.role || targetRole;
      const roleLabel = res.user.roleLabel || ROLE_PERKS[userRole]?.label || userRole;
      setSuccessMsg(`Email verified! Welcome to BakeSphere, ${res.user.name} (${roleLabel}).`);
      const targetTab = getDestinationTab(userRole);
      setTimeout(() => {
        if (onNavigateTab) onNavigateTab(targetTab);
      }, 400);
    }
  };

  // Resend OTP with refreshed real-time timer
  const handleResendOtp = async () => {
    if (resendCooldown > 0) return;
    const res = await resendOtp(verificationEmail);
    if (res.success) {
      if (res.verificationCode) setSimulatedOtp(res.verificationCode);
      if (res.previewUrl) setEmailPreviewUrl(res.previewUrl);
      setEmailSentReal(Boolean(res.emailSent));
      setTotpRemainingSec(600);
      setTotpTotalSec(600);
      setResendCooldown(45);
      setSuccessMsg(res.message || "A fresh 6-digit verification code has been dispatched to your email!");
    }
  };

  return (
    <div className="bk-auth-v2-container">
      {/* Cinematic Artisan Bakery Backdrop & Glassmorphic Ambient Orbs */}
      <div className="bk-auth-v2-bg-artwork" />
      <div className="bk-auth-v2-bg-vignette" />
      <div className="bk-auth-v2-floating-orb bk-auth-v2-orb-1" />
      <div className="bk-auth-v2-floating-orb bk-auth-v2-orb-2" />
      <div className="bk-auth-v2-floating-orb bk-auth-v2-orb-3" />

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

      {/* ══════════ SLEEK ARTISAN AUTH CARD ══════════ */}
      <div className="bk-auth-v2-card">
        {/* LEFT HERO - MINIMAL ARTISAN LOGO SHOWCASE & ANIMATIONS */}
        <div className="bk-auth-v2-hero bk-hero-minimal-artisan">
          {/* Top Brand Pill & Live Status */}
          <div className="bk-auth-v2-hero-header" style={{ width: "100%" }}>
            <div className="bk-hero-status-pill">
              <span className="bk-hero-status-sparkle">✦</span>
              <span>Artisan Boulangerie & Pâtisserie</span>
            </div>
            <div className="bk-auth-v2-live-indicator">
              <span className="bk-auth-v2-pulse-dot" />
              <span>3 Branches Live</span>
            </div>
          </div>

          {/* Central Logo & Orbital Animations Stage */}
          <div className="bk-hero-logo-stage">
            {/* Ambient Radial Aura Glow */}
            <div className="bk-hero-aura-ambient" />

            {/* Slow Outer Orbit with Orbiting Star and Pearl */}
            <div className="bk-hero-orbit-ring bk-hero-orbit-outer">
              <span className="bk-hero-satellite bk-hero-satellite-star">✦</span>
              <span className="bk-hero-satellite bk-hero-satellite-pearl" />
            </div>

            {/* Counter-Rotating Dashed Gold Middle Ring */}
            <div className="bk-hero-orbit-ring bk-hero-orbit-inner">
              <span className="bk-hero-satellite bk-hero-satellite-sparkle">✨</span>
            </div>

            {/* Master Logo Medallion with Levitation Animation */}
            <div className="bk-hero-master-emblem">
              <div className="bk-hero-emblem-bezel">
                <img
                  src="/logo.png"
                  alt="BakeSphere Master Artisan Seal"
                  className="bk-hero-emblem-image"
                />
              </div>
            </div>
          </div>

          {/* Brand Identity & Typography */}
          <div className="bk-hero-brand-block">
            <h1 className="bk-hero-brand-title">BakeSphere</h1>
            <p className="bk-hero-brand-subtitle">Artisan Viennoiserie & Kitchen Cloud</p>
            <div className="bk-hero-divider-flourish">
              <span className="bk-hero-divider-line" />
              <span className="bk-hero-divider-symbol">✦</span>
              <span className="bk-hero-divider-line" />
            </div>
            <p className="bk-hero-brand-desc">
              Classical French baking craftsmanship meets intelligent cloud production, 3D custom cakes, and real-time multi-branch ERP.
            </p>
          </div>

          {/* Minimal 3-Badge Highlight Ribbon */}
          <div className="bk-hero-features-ribbon">
            <div className="bk-hero-feature-chip">
              <span className="bk-hero-chip-icon">🥐</span>
              <span>Fresh Batch Daily</span>
            </div>
            <div className="bk-hero-feature-chip">
              <span className="bk-hero-chip-icon">🎂</span>
              <span>3D Cake Studio</span>
            </div>
            <div className="bk-hero-feature-chip">
              <span className="bk-hero-chip-icon">⚡</span>
              <span>Smart POS & FEFO</span>
            </div>
          </div>

          {/* Symmetrical Artisan Hallmark Footer */}
          <div className="bk-hero-footer-hallmark">
            <span className="bk-hero-hallmark-sparkle">✦</span>
            <span>Master Patisserie • Cloud Kitchen ERP</span>
            <span className="bk-hero-hallmark-sparkle">✦</span>
          </div>
        </div>

        {/* RIGHT MINIMAL AUTH FORM */}
        <div className="bk-auth-v2-form-section">
          {/* Header */}
          <div className="bk-auth-v2-form-brand-header">
            <div className="bk-auth-form-badge">
              <span className="bk-auth-form-badge-sparkle">✦</span>
              <span>Identity & Access Portal</span>
            </div>
            <h2 className="bk-auth-v2-form-brand-name">
              {authMode === "login"
                ? "Welcome Back"
                : authMode === "verify"
                ? "Verify Account"
                : "Create Account"}
            </h2>
            <p className="bk-auth-v2-form-brand-sub">
              {authMode === "login"
                ? "Sign in to access your orders, bakery ERP & POS terminal"
                : authMode === "verify"
                ? "Enter the 6-digit OTP code sent to your email"
                : "Join BakeSphere for fresh bakes, custom 3D cakes & rewards"}
            </p>
          </div>

          {/* Symmetrical Segmented Switcher */}
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
          {successMsg && authMode !== "verify" && (
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

              {/* Continue with Google button (triggers interactive account chooser) */}
              <button
                type="button"
                className="bk-auth-v2-google-btn"
                onClick={openGoogleModal}
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

              <div className="bk-auth-v2-footer-hint">
                Don't have an account?{" "}
                <button
                  type="button"
                  onClick={() => setAuthMode("register")}
                  className="bk-auth-v2-link-btn"
                >
                  Create one
                </button>
              </div>
            </form>
          )}

          {/* ══════════ MODE 2: REGISTRATION WITH REALTIME VALIDATION & DESIRED ROLES ══════════ */}
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
                    placeholder="e.g., Pierre Bouchard"
                    required
                  />
                </div>
              </div>

              {/* Email with real-time format validation */}
              <div className="bk-auth-v2-input-group">
                <div className="bk-auth-v2-label-row">
                  <label className="bk-auth-v2-label">Email Address (For TOTP)</label>
                  {regEmail && (
                    <span className={`bk-email-status-hint ${isValidEmail(regEmail) ? "valid" : "invalid"}`}>
                      {isValidEmail(regEmail) ? "✓ Valid email format" : "⚠️ Invalid format"}
                    </span>
                  )}
                </div>
                <div className="bk-auth-v2-input-wrapper">
                  <span className="bk-auth-v2-input-icon">✉️</span>
                  <input
                    type="email"
                    className="bk-auth-v2-input"
                    value={regEmail}
                    onChange={(e) => {
                      setRegEmail(e.target.value);
                      if (!regEmailTouched) setRegEmailTouched(true);
                    }}
                    onBlur={() => setRegEmailTouched(true)}
                    placeholder="name@bakesphere.com"
                    required
                  />
                </div>
                {regEmailTouched && regEmail && !isValidEmail(regEmail) && (
                  <span style={{ fontSize: "0.72rem", color: "#dc2626", marginTop: "3px", display: "block", fontWeight: 600 }}>
                    Please enter a complete, valid email address (e.g., baker@bakesphere.com).
                  </span>
                )}
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
                  <label className="bk-auth-v2-label">Desired Role</label>
                  <select
                    className="bk-auth-v2-select"
                    value={regRole}
                    onChange={(e) => setRegRole(e.target.value)}
                  >
                    <option value="customer">Customer (Storefront)</option>
                    <option value="chef">Pastry Chef (Kitchen)</option>
                    <option value="head_baker">Head Chef / Master Baker</option>
                    <option value="cashier">POS Cashier (Billing)</option>
                    <option value="manager">Branch Manager</option>
                    <option value="bakery_owner">Main Manager / Owner</option>
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

              {/* Real-time Role Permissions Preview */}
              {ROLE_PERKS[regRole] && (
                <div className="bk-auth-role-preview-card">
                  <span>{ROLE_PERKS[regRole].icon}</span>
                  <div>
                    <strong>{ROLE_PERKS[regRole].label}: </strong>
                    <span>{ROLE_PERKS[regRole].desc}</span>
                  </div>
                </div>
              )}

              <button
                type="submit"
                className="bk-auth-v2-submit-btn"
                disabled={loading || (regEmail && !isValidEmail(regEmail))}
                style={{ marginTop: "0.8rem" }}
              >
                {loading ? "Registering & Dispatching TOTP..." : `Register as ${ROLE_PERKS[regRole]?.label || regRole} & Verify →`}
              </button>

              <div className="bk-auth-v2-divider" style={{ margin: "1rem 0" }}>
                <span>or</span>
              </div>

              <button
                type="button"
                className="bk-auth-v2-google-btn"
                onClick={openGoogleModal}
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

              <div className="bk-auth-v2-footer-hint">
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => setAuthMode("login")}
                  className="bk-auth-v2-link-btn"
                >
                  Sign In
                </button>
              </div>
            </form>
          )}

          {/* ══════════ MODE 3: MINIMAL EMAIL OTP VERIFICATION ══════════ */}
          {authMode === "verify" && (
            <form onSubmit={handleVerifySubmit} className="bk-auth-v2-form" style={{ padding: "0.5rem 0" }}>
              <div style={{ textAlign: "center", marginBottom: "1.4rem" }}>
                <div style={{ fontSize: "2.4rem", marginBottom: "0.4rem" }}>✉️</div>
                <h3 style={{ fontSize: "1.25rem", fontWeight: 700, color: "#111827", margin: "0 0 0.35rem" }}>
                  Verify Your Email
                </h3>
                <p style={{ fontSize: "0.85rem", color: "#6b7280", margin: 0, lineHeight: 1.5 }}>
                  Please enter the 6-digit verification code sent to:<br />
                  <strong style={{ color: "#c8102e" }}>{verificationEmail}</strong>
                </p>
              </div>

              <div className="bk-auth-v2-input-group" style={{ marginBottom: "1.2rem" }}>
                <label className="bk-auth-v2-label" style={{ textAlign: "center", display: "block" }}>
                  6-Digit Verification Code
                </label>
                <div className="bk-auth-v2-input-wrapper">
                  <input
                    type="text"
                    maxLength={6}
                    className="bk-auth-v2-input"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                    placeholder="••••••"
                    autoFocus
                    style={{
                      fontSize: "1.8rem",
                      letterSpacing: "12px",
                      fontWeight: 800,
                      textAlign: "center",
                      color: "#c8102e",
                      padding: "0.75rem 0.5rem",
                      background: "#ffffff"
                    }}
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="bk-auth-v2-submit-btn"
                disabled={loading || otpCode.length < 6}
                style={{ width: "100%", padding: "0.75rem", fontSize: "0.95rem" }}
              >
                {loading ? "Verifying..." : "Verify & Continue →"}
              </button>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "1.2rem" }}>
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={resendCooldown > 0 || loading}
                  style={{
                    background: "none",
                    border: "none",
                    color: resendCooldown > 0 ? "#9ca3af" : "#c8102e",
                    fontSize: "0.82rem",
                    cursor: resendCooldown > 0 ? "not-allowed" : "pointer",
                    fontWeight: 600
                  }}
                >
                  {resendCooldown > 0 ? `Resend code in ${resendCooldown}s` : "Didn't receive code? Resend"}
                </button>

                <button
                  type="button"
                  onClick={() => setAuthMode("login")}
                  style={{ background: "none", border: "none", color: "#6b7280", fontSize: "0.82rem", cursor: "pointer", fontWeight: 500 }}
                >
                  ← Back to Sign In
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* ══════════ GOOGLE ACCOUNT CHOOSER MODAL ══════════ */}
      {showGoogleModal && (
        <div className="bk-google-modal-overlay" onClick={() => setShowGoogleModal(false)}>
          <div className="bk-google-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="bk-google-modal-header">
              <button
                type="button"
                className="bk-google-modal-close"
                onClick={() => setShowGoogleModal(false)}
                title="Close"
              >
                ✕
              </button>
              <div className="bk-google-logo-wrap">
                <svg width="28" height="28" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
              </div>
              <h2 className="bk-google-modal-title">Sign in with Google</h2>
              <p className="bk-google-modal-subtitle">Choose an existing registered account to continue</p>
            </div>

            {/* List of Registered Accounts */}
            <div className="bk-google-accounts-list">
              {loadingGoogleAccounts ? (
                <div style={{ textAlign: "center", padding: "2rem", color: "#64748b" }}>
                  <span>Loading registered accounts...</span>
                </div>
              ) : (
                googleAccounts.map((acc) => (
                  <button
                    key={acc.email}
                    type="button"
                    className="bk-google-account-btn"
                    onClick={() => handleSelectGoogleAccount(acc)}
                    disabled={googleActionLoading}
                  >
                    <div className="bk-google-account-left">
                      <img
                        src={getSafeImageUrl(acc.avatar)}
                        alt={acc.name}
                        className="bk-google-avatar"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                        }}
                      />
                      <div className="bk-google-user-info">
                        <span className="bk-google-user-name">{acc.name}</span>
                        <span className="bk-google-user-email">{acc.email}</span>
                      </div>
                    </div>
                    <span className="bk-google-role-badge">
                      {ROLE_PERKS[acc.role]?.icon || "👤"} {acc.roleLabel || acc.role}
                    </span>
                  </button>
                ))
              )}
            </div>

            {/* Use Another Account Button / Form */}
            <div className="bk-google-custom-section">
              {!customGoogleMode ? (
                <button
                  type="button"
                  onClick={() => setCustomGoogleMode(true)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    width: "100%",
                    background: "none",
                    border: "none",
                    padding: "0.5rem 0",
                    color: "#2563eb",
                    fontWeight: 700,
                    fontSize: "0.85rem",
                    cursor: "pointer",
                    textAlign: "left"
                  }}
                >
                  <span>➕</span>
                  <span>Use another Google account</span>
                </button>
              ) : (
                <form onSubmit={handleCustomGoogleSubmit}>
                  <div style={{ marginBottom: "0.6rem" }}>
                    <label style={{ fontSize: "0.75rem", fontWeight: 700, color: "#334155", display: "block", marginBottom: "4px" }}>
                      Google Name
                    </label>
                    <input
                      type="text"
                      value={customGoogleName}
                      onChange={(e) => setCustomGoogleName(e.target.value)}
                      placeholder="e.g. Mentor Evaluator"
                      style={{ width: "100%", padding: "0.5rem", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "0.85rem" }}
                    />
                  </div>
                  <div style={{ marginBottom: "0.8rem" }}>
                    <label style={{ fontSize: "0.75rem", fontWeight: 700, color: "#334155", display: "block", marginBottom: "4px" }}>
                      Google Email Address
                    </label>
                    <input
                      type="email"
                      value={customGoogleEmail}
                      onChange={(e) => setCustomGoogleEmail(e.target.value)}
                      placeholder="evaluator@gmail.com"
                      required
                      style={{ width: "100%", padding: "0.5rem", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "0.85rem" }}
                    />
                  </div>
                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    <button
                      type="submit"
                      disabled={googleActionLoading}
                      style={{
                        flex: 1,
                        background: "#1d4ed8",
                        color: "#fff",
                        border: "none",
                        padding: "0.55rem",
                        borderRadius: "8px",
                        fontSize: "0.82rem",
                        fontWeight: 700,
                        cursor: "pointer"
                      }}
                    >
                      {googleActionLoading ? "Signing in..." : "Continue with this Account →"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setCustomGoogleMode(false)}
                      style={{
                        background: "#e2e8f0",
                        color: "#475569",
                        border: "none",
                        padding: "0.55rem 0.8rem",
                        borderRadius: "8px",
                        fontSize: "0.82rem",
                        fontWeight: 600,
                        cursor: "pointer"
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>

            <div className="bk-google-modal-footer">
              <span>To continue, Google will share your name, email address, language preference, and profile picture with BakeSphere.</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
