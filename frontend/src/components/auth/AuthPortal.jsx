import { useState, useEffect, useRef } from "react";
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
  const [rememberMe, setRememberMe] = useState(true);
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
  const particleCanvasRef = useRef(null);

  // Background Bakery Emoji Particles Animation
  useEffect(() => {
    const canvas = particleCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animationFrameId;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    // Bakery-themed emoji symbols — fewer, purposeful
    const BAKERY_EMOJIS = ["🥐", "🌾", "🎂", "🍪", "🧁", "🥖", "🍩", "☕", "🌟", "🍰", "🥨", "🍫"];
    const PARTICLE_COUNT = 18;

    const particles = Array.from({ length: PARTICLE_COUNT }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      emoji: BAKERY_EMOJIS[Math.floor(Math.random() * BAKERY_EMOJIS.length)],
      size: Math.random() * 14 + 14,        // 14–28px — readable but not huge
      alpha: Math.random() * 0.35 + 0.12,  // subtle transparency
      speedY: -(Math.random() * 0.35 + 0.1), // slow upward drift
      speedX: (Math.random() - 0.5) * 0.25,
      wobbleSpeed: Math.random() * 0.018 + 0.006,
      wobbleAngle: Math.random() * Math.PI * 2,
      wobbleRadius: Math.random() * 1.2 + 0.4,
      rotation: (Math.random() - 0.5) * 0.4, // slight tilt
      rotSpeed: (Math.random() - 0.5) * 0.003
    }));

    let mouseX = -1000;
    let mouseY = -1000;

    const handleMouseMove = (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };
    window.addEventListener("mousemove", handleMouseMove);

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((p) => {
        // Gentle drift & wobble
        p.wobbleAngle += p.wobbleSpeed;
        p.y += p.speedY;
        p.x += p.speedX + Math.sin(p.wobbleAngle) * p.wobbleRadius;
        p.rotation += p.rotSpeed;

        // Subtle mouse repulsion
        const dx = p.x - mouseX;
        const dy = p.y - mouseY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 100 && dist > 0) {
          const force = ((100 - dist) / 100) * 0.5;
          p.x += (dx / dist) * force;
          p.y += (dy / dist) * force;
        }

        // Wrap around screen
        if (p.y < -40) {
          p.y = canvas.height + 40;
          p.x = Math.random() * canvas.width;
        }
        if (p.x < -40) p.x = canvas.width + 40;
        if (p.x > canvas.width + 40) p.x = -40;

        // Gentle pulse alpha
        const pulseAlpha = p.alpha + Math.sin(p.wobbleAngle * 1.5) * 0.07;
        const alphaClamped = Math.max(0.08, Math.min(0.5, pulseAlpha));

        ctx.save();
        ctx.globalAlpha = alphaClamped;
        ctx.font = `${p.size}px serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.fillText(p.emoji, 0, 0);
        ctx.restore();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

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
      {/* ══════════ FLOATING GOLDEN AMBIENT PARTICLES CANVAS ══════════ */}
      <canvas ref={particleCanvasRef} className="bk-auth-particle-canvas" aria-hidden="true" />

      {/* ══════════ FLOATING BAKERY BACKGROUND ANIMATIONS ══════════ */}
      <div className="bk-auth-floating-bakery-stage" aria-hidden="true">
        <span className="bk-float-item bk-float-item-1" title="Croissant">🥐</span>
        <span className="bk-float-item bk-float-item-2" title="Wheat">🌾</span>
        <span className="bk-float-item bk-float-item-3" title="Chef Hat">🧑‍🍳</span>
        <span className="bk-float-item bk-float-item-4" title="Baguette">🥖</span>
        <span className="bk-float-item bk-float-item-5" title="Macaron">🍬</span>
        <span className="bk-float-item bk-float-item-6" title="Sparkle">✨</span>
        <span className="bk-float-item bk-float-item-7" title="Cupcake">🧁</span>
        <span className="bk-float-item bk-float-item-8" title="Berry">🍓</span>
        <span className="bk-float-item bk-float-item-9" title="Pretzel">🥨</span>
        <span className="bk-float-item bk-float-item-10" title="Star">✦</span>
        <span className="bk-float-item bk-float-item-11" title="Cake Slice">🍰</span>
        <span className="bk-float-item bk-float-item-12" title="Honey">🍯</span>
      </div>

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

      {/* ══════════ SLEEK ARTISAN AUTH CARD (MATCHING REFERENCE UI) ══════════ */}
      <div className="bk-auth-v2-card">
        {/* LEFT HERO - EXACT MATCH TO REFERENCE ARTISAN BAKERY DESIGN */}
        <div className="bk-auth-v2-hero bk-hero-artisan-backdrop">
          {/* Subtle dark gradient overlay to give rich contrast for text over cake photo */}
          <div className="bk-hero-photo-tint" />

          {/* Top Brand Pill & Live Status */}
          <div className="bk-auth-v2-hero-header">
            <div className="bk-hero-status-pill">
              <span className="bk-hero-status-icon">👨‍🍳</span>
              <span>Artisan Boulangerie & Pâtisserie</span>
            </div>
            <div className="bk-hero-status-pill bk-hero-branch-pill">
              <span className="bk-hero-branch-icon">🏪</span>
              <div className="bk-hero-branch-col">
                <span className="bk-hero-branch-title">3 Branches Live</span>
                <span className="bk-hero-branch-cities">Bangalore • Chennai • Coimbatore</span>
              </div>
            </div>
          </div>

          {/* Centralized Brand & Features Showcase */}
          <div className="bk-hero-artisan-center-content">
            {/* Center Master Logo as the Center of Attraction */}
            <div className="bk-hero-logo-stage-artisan">
              <img
                src="/artisan-glowing-logo-clean.png"
                alt="BakeSphere Artisan Bakery - More Than Just Bakes"
                className="bk-hero-master-logo-img"
              />
            </div>

            {/* 4-Pill Feature Capsule Glass Card */}
            <div className="bk-hero-features-capsule">
              <div className="bk-hero-capsule-item">
                <span className="bk-hero-capsule-icon">🍞</span>
                <span className="bk-hero-capsule-label">Fresh<br/>Batch Daily</span>
              </div>
              <div className="bk-hero-capsule-item">
                <span className="bk-hero-capsule-icon">🎂</span>
                <span className="bk-hero-capsule-label">3D Cake<br/>Studio</span>
              </div>
              <div className="bk-hero-capsule-item">
                <span className="bk-hero-capsule-icon">🧑‍🍳</span>
                <span className="bk-hero-capsule-label">Custom<br/>Creations</span>
              </div>
              <div className="bk-hero-capsule-item">
                <span className="bk-hero-capsule-icon">🍃</span>
                <span className="bk-hero-capsule-label">100%<br/>Pure Veg</span>
              </div>
            </div>

            {/* Whimsical Handwritten Tagline */}
            <div className="bk-hero-smile-script">
              <span>Bakes that make you smile ♡</span>
            </div>
          </div>

          {/* Bottom Category Bar */}
          <div className="bk-hero-bottom-pills-row">
            <button type="button" onClick={() => onNavigateTab && onNavigateTab("shop")} className="bk-hero-cat-tag">🎂 Cakes</button>
            <span className="bk-hero-cat-sep">|</span>
            <button type="button" onClick={() => onNavigateTab && onNavigateTab("shop")} className="bk-hero-cat-tag">☕ Breads</button>
            <span className="bk-hero-cat-sep">|</span>
            <button type="button" onClick={() => onNavigateTab && onNavigateTab("shop")} className="bk-hero-cat-tag">🥐 Pastries</button>
            <span className="bk-hero-cat-sep">|</span>
            <button type="button" onClick={() => onNavigateTab && onNavigateTab("shop")} className="bk-hero-cat-tag">🍪 Desserts</button>
            <span className="bk-hero-cat-sep">|</span>
            <span className="bk-hero-cat-tag">♡ Happiness</span>
          </div>
        </div>

        {/* RIGHT MINIMAL AUTH FORM */}
        <div className="bk-auth-v2-form-section">
          {/* Header */}
          <div className="bk-auth-v2-form-brand-header">
            <div className="bk-auth-handwritten-title-wrap">
              <span className="bk-auth-doodle-sparkle">彡</span>
              <h2 className="bk-auth-handwritten-title">
                {authMode === "login"
                  ? "Welcome Back!!"
                  : authMode === "verify"
                  ? "Verify Account"
                  : "Welcome New Baker!"}
              </h2>
              <span className="bk-auth-doodle-heart">♡</span>
            </div>
            <p className="bk-auth-v2-form-brand-sub">
              {authMode === "login"
                ? "Sign in to access your orders, bakery ERP & POS terminal"
                : authMode === "verify"
                ? "Enter the 6-digit OTP code sent to your email"
                : "Join BakeSphere for fresh bakes, custom 3D cakes & rewards"}
            </p>
          </div>

          {/* Segmented Switcher */}
          <div className="bk-auth-artisan-switcher">
            <button
              type="button"
              className={`bk-auth-artisan-switch-btn ${authMode === "login" ? "active" : ""}`}
              onClick={() => {
                setAuthMode("login");
                if (setAuthError) setAuthError("");
                setSuccessMsg("");
              }}
            >
              <span className="bk-auth-switch-icon">☕</span>
              <span>Sign In</span>
            </button>
            <button
              type="button"
              className={`bk-auth-artisan-switch-btn ${authMode === "register" ? "active" : ""}`}
              onClick={() => {
                setAuthMode("register");
                if (setAuthError) setAuthError("");
                setSuccessMsg("");
              }}
            >
              <span className="bk-auth-switch-icon">👤</span>
              <span>Register</span>
            </button>
            {verificationEmail && (
              <button
                type="button"
                className={`bk-auth-artisan-switch-btn ${authMode === "verify" ? "active" : ""}`}
                onClick={() => {
                  setAuthMode("verify");
                  if (setAuthError) setAuthError("");
                }}
              >
                <span className="bk-auth-switch-icon">✉️</span>
                <span>Verify</span>
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

          {/* ══════════ MODE 1: LOGIN (EXACT MATCH TO REFERENCE) ══════════ */}
          {authMode === "login" && (
            <form onSubmit={handleLoginSubmit} className="bk-auth-v2-form">
              <div className="bk-auth-field-group">
                <label className="bk-auth-field-label">Email or Staff ID</label>
                <div className="bk-auth-input-pill-wrap">
                  <span className="bk-auth-input-lead-icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect width="20" height="16" x="2" y="4" rx="2"/>
                      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                    </svg>
                  </span>
                  <input
                    type="email"
                    className="bk-auth-artisan-input"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@bakesphere.com"
                    required
                  />
                </div>
              </div>

              <div className="bk-auth-field-group">
                <div className="bk-auth-field-label-row">
                  <label className="bk-auth-field-label">Password</label>
                  <button
                    type="button"
                    className="bk-auth-toggle-pwd-btn"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
                <div className="bk-auth-input-pill-wrap">
                  <span className="bk-auth-input-lead-icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                    </svg>
                  </span>
                  <input
                    type={showPassword ? "text" : "password"}
                    className="bk-auth-artisan-input"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                  />
                </div>
              </div>

              <div className="bk-auth-utility-row">
                <label className="bk-auth-remember-check">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  <span>Remember me</span>
                </label>
                <button
                  type="button"
                  className="bk-auth-forgot-pwd-link"
                  onClick={() => {
                    setEmail("admin@bakesphere.com");
                    setPassword("Bakery@2026");
                    setSuccessMsg("Filled default administrative credentials.");
                  }}
                >
                  Forgot password?
                </button>
              </div>

              <button
                type="submit"
                className="bk-auth-burgundy-pill-btn"
                disabled={loading}
              >
                <span className="bk-auth-btn-text">
                  {loading ? "Signing In..." : "Sign In →"}
                </span>
                <span className="bk-auth-btn-chef-hat">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M6 13.8a4.5 4.5 0 1 1 2.6-6.6 4.5 4.5 0 0 1 6.8 0 4.5 4.5 0 1 1 2.6 6.6"/>
                    <path d="M6 17h12v4H6z"/>
                    <path d="M6 14h12"/>
                  </svg>
                </span>
              </button>

              <div className="bk-auth-divider-or">
                <span>OR</span>
              </div>

              {/* Continue with Google button */}
              <button
                type="button"
                className="bk-auth-google-pill-btn"
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

              <div className="bk-auth-bottom-hint">
                Don't have an account?{" "}
                <button
                  type="button"
                  onClick={() => setAuthMode("register")}
                  className="bk-auth-bottom-link"
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

      {/* ══════════ PATRON REVIEWS & TASTY EXPERIENCES ══════════ */}
      <div
        style={{
          position: "relative",
          zIndex: 10,
          maxWidth: "1020px",
          width: "100%",
          margin: "2.5rem auto 3rem",
          padding: "0 1.25rem"
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "1.4rem" }}>
          <span style={{ fontSize: "0.8rem", fontWeight: 700, letterSpacing: "0.08em", color: "var(--gold-400, #fbbf24)", textTransform: "uppercase" }}>
            ⭐ Loved By Patisserie Aficionados
          </span>
          <h4 style={{ margin: "0.2rem 0 0", fontSize: "1.15rem", color: "#ffffff", fontWeight: 700 }}>
            Real Patron Experiences
          </h4>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(290px, 1fr))",
            gap: "1.2rem"
          }}
        >
          {[
            {
              name: "Pooja Hegde",
              role: "Verified Connoisseur",
              avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=80",
              review: "The 3D Custom Hazelnut Truffle cake for our wedding anniversary was jaw-dropping! Perfectly balanced Belgian ganache.",
              treatImg: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=300&auto=format&fit=crop&q=80",
              treatName: "Royal Truffle Tier",
              rating: "⭐⭐⭐⭐⭐"
            },
            {
              name: "Vikram Malhotra",
              role: "Artisan Bread Enthusiast",
              avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
              review: "Heritage Sourdough is crispy, airy, and naturally fermented to perfection. BakeSphere is on another level.",
              treatImg: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=300&auto=format&fit=crop&q=80",
              treatName: "Wild Sourdough Boule",
              rating: "⭐⭐⭐⭐⭐"
            },
            {
              name: "Ananya Deshmukh",
              role: "Corporate Event Host",
              avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80",
              review: "Ordered 50 custom gift boxes with edible branded plaques. Arrived warm and fresh right on time!",
              treatImg: "https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=300&auto=format&fit=crop&q=80",
              treatName: "Artisan Macaron Box",
              rating: "⭐⭐⭐⭐⭐"
            }
          ].map((item, idx) => (
            <div
              key={idx}
              style={{
                background: "rgba(18, 22, 34, 0.75)",
                backdropFilter: "blur(12px)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                borderRadius: "14px",
                padding: "1rem",
                display: "flex",
                gap: "0.9rem",
                alignItems: "center",
                boxShadow: "0 10px 25px rgba(0, 0, 0, 0.35)"
              }}
            >
              <div style={{ position: "relative", flexShrink: 0 }}>
                <img
                  src={item.treatImg}
                  alt={item.treatName}
                  onError={handleImageError}
                  style={{
                    width: "68px",
                    height: "68px",
                    borderRadius: "10px",
                    objectFit: "cover",
                    border: "1.5px solid rgba(255, 255, 255, 0.15)"
                  }}
                />
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.2rem" }}>
                  <span style={{ fontSize: "0.72rem", color: "#fbbf24" }}>{item.rating}</span>
                  <span style={{ fontSize: "0.68rem", color: "#94a3b8" }}>{item.role}</span>
                </div>
                <p style={{ margin: "0 0 0.4rem", fontSize: "0.78rem", color: "#e2e8f0", lineHeight: 1.35, fontStyle: "italic" }}>
                  "{item.review}"
                </p>
                <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                  <img
                    src={item.avatar}
                    alt={item.name}
                    onError={handleImageError}
                    style={{ width: "18px", height: "18px", borderRadius: "50%", objectFit: "cover" }}
                  />
                  <strong style={{ fontSize: "0.74rem", color: "#ffffff" }}>{item.name}</strong>
                </div>
              </div>
            </div>
          ))}
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
