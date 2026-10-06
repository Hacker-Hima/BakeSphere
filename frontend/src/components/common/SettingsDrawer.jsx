import { useState, useEffect } from "react";
import { useThemeSettings, FONT_MAP } from "../../context/ThemeSettingsContext.jsx";
import { useLanguage } from "../../context/LanguageContext.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { handleImageError, getSafeImageUrl } from "../../utils/imageFallback.js";

export const SettingsDrawer = () => {
  const {
    settings,
    updateSetting,
    resetDefaults,
    isSettingsOpen,
    closeSettings,
    playChime,
    settingsActiveTab
  } = useThemeSettings();

  const { language, setLanguage, t } = useLanguage();
  const { currentUser, logout } = useAuth();
  const [activeTab, setActiveTab] = useState("appearance"); // "appearance" | "typography" | "sensory" | "ordering" | "operations" | "account"
  const [toastMessage, setToastMessage] = useState("");
  const [previewText, setPreviewText] = useState("Fresh Belgian Chocolate Truffle & Warm Butter Croissants");

  useEffect(() => {
    if (settingsActiveTab) {
      setActiveTab(settingsActiveTab);
    }
  }, [settingsActiveTab, isSettingsOpen]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 2800);
  };

  const handleLogout = () => {
    playChime("click");
    closeSettings();
    logout();
  };

  const handleClearCache = () => {
    try {
      localStorage.removeItem("bakesphere_recent");
      localStorage.removeItem("bakesphere_cart");
      showToast("✨ Local browsing & cart cache purged successfully!");
      playChime("success");
    } catch (_e) {
      showToast("Could not clear cache");
    }
  };

  const handleExportBackup = () => {
    try {
      const backupData = {
        app: "BakeSphere Master Patisserie ERP",
        version: "2.0.0",
        timestamp: new Date().toISOString(),
        settings,
        user: currentUser?.email || "guest",
        invoices: JSON.parse(localStorage.getItem("bakesphere_invoices") || "[]")
      };
      const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `bakesphere-settings-backup-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
      showToast("📦 Configuration & invoice backup downloaded!");
      playChime("success");
    } catch (_e) {
      showToast("Failed to export backup");
    }
  };

  if (!isSettingsOpen) return null;

  const themes = [
    {
      id: "bakingo",
      name: "Bakingo Ruby",
      desc: "Signature crimson berry, warm cream & 2-hr express delivery look",
      gradient: "linear-gradient(135deg, #e11d48, #881337)",
      accent: "#be123c",
      icon: "🎂"
    },
    {
      id: "amber",
      name: "Heritage Amber",
      desc: "Warm artisanal gold & rich honey",
      gradient: "linear-gradient(135deg, #fbbf24, #d97706)",
      accent: "#f59e0b",
      icon: "🥐"
    },
    {
      id: "rose",
      name: "Rose Velvet",
      desc: "French berry patisserie & blush glazes",
      gradient: "linear-gradient(135deg, #fb7185, #e11d48)",
      accent: "#f43f5e",
      icon: "🍓"
    },
    {
      id: "emerald",
      name: "Emerald Matcha",
      desc: "Organic pistachio & botanical matcha",
      gradient: "linear-gradient(135deg, #34d399, #059669)",
      accent: "#10b981",
      icon: "🍵"
    },
    {
      id: "espresso",
      name: "Royal Espresso",
      desc: "Roasted coffeehouse & dark chocolate",
      gradient: "linear-gradient(135deg, #f59e0b, #78350f)",
      accent: "#b45309",
      icon: "☕"
    },
    {
      id: "sapphire",
      name: "Midnight Sapphire",
      desc: "Deep Mediterranean indigo & Blue Curacao accents",
      gradient: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
      accent: "#2563eb",
      icon: "🌊"
    },
    {
      id: "amethyst",
      name: "Royal Amethyst",
      desc: "Imperial blackcurrant, lavender & violet macarons",
      gradient: "linear-gradient(135deg, #c084fc, #7e22ce)",
      accent: "#9333ea",
      icon: "🍇"
    },
    {
      id: "champagne",
      name: "24K Champagne",
      desc: "French Vanilla bean, golden brioche & gilded luxury",
      gradient: "linear-gradient(135deg, #fde047, #ca8a04)",
      accent: "#eab308",
      icon: "🥂"
    }
  ];

  const fontOptions = [
    {
      id: "normal",
      name: "Outfit (Modern Sans)",
      fontFamily: "'Outfit', sans-serif",
      badge: "Signature",
      desc: "Contemporary, friendly geometry for modern digital bakeries",
      sample: "The quick brown fox jumps over the lazy dog"
    },
    {
      id: "playfair",
      name: "Playfair Display",
      fontFamily: "'Playfair Display', Georgia, serif",
      badge: "Luxury Serif",
      desc: "Grand Parisian patisserie elegance with high-contrast serifs",
      sample: "The quick brown fox jumps over the lazy dog"
    },
    {
      id: "caveat",
      name: "Caveat Script",
      fontFamily: "'Caveat', cursive",
      badge: "Baker's Cursive",
      desc: "Warm handwritten bakery chalkboard lettering crafted with love",
      sample: "The quick brown fox jumps over the lazy dog"
    },
    {
      id: "cinzel",
      name: "Cinzel Royal Serif",
      fontFamily: "'Cinzel', serif",
      badge: "Imperial Grand",
      desc: "Majestic classical Roman stone-cut capitals for luxury tiers",
      sample: "THE QUICK BROWN FOX JUMPS OVER THE LAZY DOG"
    },
    {
      id: "pacifico",
      name: "Pacifico Confection",
      fontFamily: "'Pacifico', cursive",
      badge: "Sweet Dessert",
      desc: "Delightful brush cursive reminiscent of frosted birthday cakes",
      sample: "The quick brown fox jumps over the lazy dog"
    },
    {
      id: "inter",
      name: "Inter (UI Clean)",
      fontFamily: "'Inter', sans-serif",
      badge: "High Precision",
      desc: "Ultra-crisp engineered typography designed for legibility",
      sample: "The quick brown fox jumps over the lazy dog"
    },
    {
      id: "mono",
      name: "JetBrains Mono",
      fontFamily: "'JetBrains Mono', monospace",
      badge: "Receipts & POS",
      desc: "Technical monospaced receipt font for bakery kitchen logs",
      sample: "The quick brown fox jumps over the lazy dog"
    },
    {
      id: "times",
      name: "Times New Roman",
      fontFamily: "'Times New Roman', Times, serif",
      badge: "Heritage Serif",
      desc: "Time-tested heritage typography with formal literary distinction",
      sample: "The quick brown fox jumps over the lazy dog"
    },
    {
      id: "georgia",
      name: "Georgia Warm Book",
      fontFamily: "Georgia, serif",
      badge: "Editorial Classic",
      desc: "Warm humanist book face created specifically for display reading",
      sample: "The quick brown fox jumps over the lazy dog"
    },
    {
      id: "arial",
      name: "Arial Standard",
      fontFamily: "Arial, Helvetica, sans-serif",
      badge: "Neutral Sans",
      desc: "Clean, universally familiar utilitarian system sans-serif",
      sample: "The quick brown fox jumps over the lazy dog"
    }
  ];

  const soundProfiles = [
    { id: "chime", name: "Artisan Chimes", icon: "🎶", desc: "Harmonic musical bell sequence" },
    { id: "soft", name: "Modern Soft Felt", icon: "🔊", desc: "Gentle organic UI haptic tap" },
    { id: "cash_register", name: "Vintage POS Register", icon: "🪙", desc: "Crisp mechanical brass ding" },
    { id: "bubble", name: "Water Droplet", icon: "🫧", desc: "Playful ascending water bubble pop" }
  ];

  const dietaryOptions = [
    { id: "all", label: "All Confections", icon: "🍰", desc: "Display full artisanal bakery menu" },
    { id: "eggless", label: "100% Pure Eggless", icon: "🌱", desc: "Prioritize vegetarian eggless bakes" },
    { id: "vegan", label: "Vegan Patisserie", icon: "🥑", desc: "Dairy-free plant-based cakes & breads" },
    { id: "gluten_free", label: "Gluten-Sensitive", icon: "🌾", desc: "Almond & oat flour creations" },
    { id: "nut_free", label: "Nut-Free Safe", icon: "🛡️", desc: "Prepared in designated allergen zones" }
  ];

  const deliverySlots = [
    { id: "express", label: "2-Hour Express Rush", icon: "⚡", fee: "Fastest • Live Bike Track" },
    { id: "standard", label: "Standard Afternoon (2 PM - 5 PM)", icon: "🌤️", fee: "Free over ₹499" },
    { id: "evening", label: "Evening Gala (6 PM - 9 PM)", icon: "🌙", fee: "Party & Celebration Slot" }
  ];

  const packagingOptions = [
    { id: "luxury", label: "Grand Luxury Satin Box", icon: "🎁", desc: "Rigid gold-foil box with satin ribbon" },
    { id: "eco_kraft", label: "Eco-Friendly Kraft Pack", icon: "📦", desc: "100% biodegradable unbleached pulp" },
    { id: "insulated", label: "Insulated Thermal Caddy", icon: "❄️", desc: "Dry-ice icepack for mousse & gelato" }
  ];

  const currencies = [
    { code: "INR", symbol: "₹", name: "Indian Rupee (INR)", rate: "1.0x" },
    { code: "USD", symbol: "$", name: "US Dollar (USD)", rate: "0.012x" },
    { code: "EUR", symbol: "€", name: "Euro (EUR)", rate: "0.011x" },
    { code: "GBP", symbol: "£", name: "British Pound (GBP)", rate: "0.0095x" },
    { code: "AED", symbol: "د.إ", name: "UAE Dirham (AED)", rate: "0.044x" }
  ];

  const thermalWidths = [
    { id: "58mm", label: "58mm Slip", desc: "Pocket thermal Bluetooth printer" },
    { id: "80mm", label: "80mm Standard POS", desc: "High-speed front counter EPSON roll" },
    { id: "A4", label: "A4 Executive GST Sheet", desc: "Full-page archival legal tax invoice" }
  ];

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        background: "rgba(0, 0, 0, 0.72)",
        backdropFilter: "blur(10px)",
        display: "flex",
        justifyContent: "flex-end"
      }}
      onClick={closeSettings}
    >
      <div
        style={{
          width: "560px",
          maxWidth: "100vw",
          height: "100vh",
          background: "var(--bg-surface, #ffffff)",
          borderLeft: "1px solid var(--border-hover, #e2e8f0)",
          boxShadow: "-16px 0 50px rgba(0, 0, 0, 0.8)",
          display: "flex",
          flexDirection: "column",
          color: "var(--text-primary, #1e293b)",
          overflowY: "hidden",
          transition: "all 0.3s ease"
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ═══════════ HEADER ═══════════ */}
        <div
          style={{
            padding: "1.2rem 1.6rem",
            borderBottom: "1px solid var(--border-subtle, #e2e8f0)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            background: "linear-gradient(135deg, rgba(225, 29, 72, 0.08) 0%, rgba(245, 158, 11, 0.06) 100%)"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <div
              style={{
                width: "44px",
                height: "44px",
                borderRadius: "50%",
                background: "linear-gradient(135deg, #fef08a 0%, #f59e0b 50%, #e11d48 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1.3rem",
                boxShadow: "0 0 16px rgba(245, 158, 11, 0.45)",
                flexShrink: 0
              }}
            >
              ⚙️
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <h2 style={{ fontSize: "1.25rem", fontWeight: 800, margin: 0, color: "var(--crimson-500, #be123c)" }}>
                  Studio Settings
                </h2>
                <span
                  style={{
                    background: "rgba(245, 158, 11, 0.15)",
                    color: "var(--gold-500, #d97706)",
                    border: "1px solid rgba(245, 158, 11, 0.3)",
                    borderRadius: "12px",
                    padding: "0.15rem 0.5rem",
                    fontSize: "0.7rem",
                    fontWeight: 700
                  }}
                >
                  v2.0 Pro
                </span>
              </div>
              <p style={{ fontSize: "0.76rem", color: "var(--text-muted, #64748b)", margin: "2px 0 0" }}>
                Global appearance, typography, audio synthesizers, dietary presets & POS operations
              </p>
            </div>
          </div>

          <button
            onClick={closeSettings}
            style={{
              background: "rgba(0, 0, 0, 0.05)",
              border: "1px solid var(--border-subtle, #cbd5e1)",
              borderRadius: "50%",
              width: "34px",
              height: "34px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--text-secondary, #475569)",
              cursor: "pointer",
              fontSize: "1rem",
              fontWeight: 700,
              transition: "transform 0.15s ease"
            }}
            title="Close Settings"
          >
            ✕
          </button>
        </div>

        {/* ═══════════ USER BAR (If Authenticated) ═══════════ */}
        {currentUser && (
          <div
            style={{
              padding: "0.75rem 1.4rem",
              background: "rgba(0, 0, 0, 0.03)",
              borderBottom: "1px solid var(--border-subtle, #e2e8f0)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "0.8rem"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.7rem", minWidth: 0 }}>
              <img
                src={getSafeImageUrl(currentUser.avatar)}
                alt={currentUser.name}
                onError={handleImageError}
                style={{
                  width: "38px",
                  height: "38px",
                  borderRadius: "50%",
                  objectFit: "cover",
                  border: "2px solid var(--crimson-500, #be123c)",
                  flexShrink: 0
                }}
              />
              <div style={{ minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: "0.86rem", color: "var(--text-primary)" }}>
                  {currentUser.name}
                </div>
                <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>
                  <span style={{ color: "var(--gold-500)", fontWeight: 700 }}>
                    {currentUser.roleLabel || currentUser.role}
                  </span>
                  {" • "}
                  <span>{currentUser.email}</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              style={{
                background: "rgba(225, 29, 72, 0.1)",
                border: "1px solid rgba(225, 29, 72, 0.35)",
                color: "#e11d48",
                padding: "0.35rem 0.75rem",
                borderRadius: "8px",
                fontSize: "0.76rem",
                fontWeight: 700,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "0.3rem"
              }}
            >
              <span>🚪</span>
              <span>Sign Out</span>
            </button>
          </div>
        )}

        {/* ═══════════ 6-TAB NAVIGATION RIBBON ═══════════ */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(6, 1fr)",
            gap: "0.2rem",
            padding: "0.6rem 0.8rem",
            background: "rgba(0, 0, 0, 0.04)",
            borderBottom: "1px solid var(--border-subtle, #e2e8f0)",
            overflowX: "auto"
          }}
        >
          {[
            { id: "appearance", label: "Display", icon: "🎨" },
            { id: "typography", label: "Fonts", icon: "🔤" },
            { id: "sensory", label: "Sensory", icon: "⚡" },
            { id: "ordering", label: "Gourmet", icon: "🍰" },
            { id: "operations", label: "Kitchen", icon: "🍳" },
            { id: "account", label: "Account", icon: "👤" }
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setActiveTab(tab.id);
                  playChime("click");
                }}
                style={{
                  background: isActive ? "var(--crimson-500, #be123c)" : "transparent",
                  color: isActive ? "#ffffff" : "var(--text-secondary, #475569)",
                  border: "none",
                  padding: "0.45rem 0.2rem",
                  borderRadius: "8px",
                  fontWeight: 700,
                  fontSize: "0.72rem",
                  cursor: "pointer",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.15rem",
                  transition: "all 0.15s ease",
                  boxShadow: isActive ? "0 2px 8px rgba(190, 18, 60, 0.35)" : "none"
                }}
              >
                <span style={{ fontSize: "1.05rem" }}>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* ═══════════ DRAWER SCROLLABLE CONTENT ═══════════ */}
        <div style={{ flex: 1, padding: "1.4rem", overflowY: "auto", display: "flex", flexDirection: "column", gap: "1.4rem" }}>

          {/* ═══════════ TAB 1: DISPLAY & THEMES ═══════════ */}
          {activeTab === "appearance" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "1.3rem" }}>
              {/* Illumination: Dark vs Light */}
              <div>
                <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 800, color: "var(--text-muted)", textTransform: "uppercase", marginBottom: "0.5rem" }}>
                  1. Illumination & Ambient Mode
                </label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.7rem" }}>
                  <button
                    type="button"
                    onClick={() => updateSetting("mode", "light")}
                    style={{
                      background: settings.mode === "light" ? "rgba(245, 158, 11, 0.15)" : "rgba(0, 0, 0, 0.03)",
                      border: settings.mode === "light" ? "2px solid var(--gold-500, #d97706)" : "1px solid var(--border-subtle)",
                      borderRadius: "10px",
                      padding: "0.85rem",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.6rem",
                      color: settings.mode === "light" ? "var(--gold-600, #b45309)" : "var(--text-secondary)"
                    }}
                  >
                    <span style={{ fontSize: "1.4rem" }}>☀️</span>
                    <div style={{ textAlign: "left" }}>
                      <div style={{ fontSize: "0.86rem", fontWeight: 700 }}>Daylight Pure</div>
                      <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>Warm bakery daylight</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => updateSetting("mode", "dark")}
                    style={{
                      background: settings.mode === "dark" ? "rgba(225, 29, 72, 0.15)" : "rgba(0, 0, 0, 0.03)",
                      border: settings.mode === "dark" ? "2px solid var(--crimson-500, #be123c)" : "1px solid var(--border-subtle)",
                      borderRadius: "10px",
                      padding: "0.85rem",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.6rem",
                      color: settings.mode === "dark" ? "var(--crimson-500)" : "var(--text-secondary)"
                    }}
                  >
                    <span style={{ fontSize: "1.4rem" }}>🌙</span>
                    <div style={{ textAlign: "left" }}>
                      <div style={{ fontSize: "0.86rem", fontWeight: 700 }}>Midnight Noir</div>
                      <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>OLED deep blacks</div>
                    </div>
                  </button>
                </div>
              </div>

              {/* 8 Curated Color Palettes */}
              <div>
                <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 800, color: "var(--text-muted)", textTransform: "uppercase", marginBottom: "0.5rem" }}>
                  2. Signature Color Palettes ({themes.length} Master Editions)
                </label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.6rem" }}>
                  {themes.map((th) => {
                    const isSelected = (settings.theme || "bakingo") === th.id;
                    return (
                      <button
                        key={th.id}
                        type="button"
                        onClick={() => updateSetting("theme", th.id)}
                        style={{
                          background: isSelected ? "rgba(245, 158, 11, 0.12)" : "rgba(0,0,0,0.02)",
                          border: isSelected ? `2px solid ${th.accent}` : "1px solid var(--border-subtle)",
                          borderRadius: "10px",
                          padding: "0.65rem 0.8rem",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: "0.6rem",
                          textAlign: "left",
                          transition: "all 0.15s ease"
                        }}
                      >
                        <div
                          style={{
                            width: "28px",
                            height: "28px",
                            borderRadius: "50%",
                            background: th.gradient,
                            boxShadow: `0 2px 8px ${th.accent}55`,
                            flexShrink: 0,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "0.85rem"
                          }}
                        >
                          {th.icon}
                        </div>
                        <div style={{ minWidth: 0, flex: 1 }}>
                          <div style={{ fontSize: "0.82rem", fontWeight: 700, color: isSelected ? th.accent : "var(--text-primary)" }}>
                            {th.name}
                          </div>
                          <div style={{ fontSize: "0.66rem", color: "var(--text-muted)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                            {th.desc}
                          </div>
                        </div>
                        {isSelected && <span style={{ color: th.accent, fontWeight: 800, fontSize: "0.85rem" }}>✓</span>}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Display Enhancements: Contrast, Glass, Density, Radius */}
              <div style={{ background: "rgba(0,0,0,0.03)", padding: "1rem", borderRadius: "12px", border: "1px solid var(--border-subtle)" }}>
                <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 800, color: "var(--text-muted)", textTransform: "uppercase", marginBottom: "0.6rem" }}>
                  3. Display Architecture & Finish
                </label>

                <div style={{ display: "flex", flexDirection: "column", gap: "0.8rem" }}>
                  {/* High Contrast */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <div style={{ fontSize: "0.82rem", fontWeight: 700 }}>High Contrast Accessibility</div>
                      <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>Boost text borders & black/white clarity</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => updateSetting("contrast", settings.contrast === "high" ? "normal" : "high")}
                      style={{
                        background: settings.contrast === "high" ? "var(--crimson-500)" : "rgba(0,0,0,0.1)",
                        color: settings.contrast === "high" ? "#ffffff" : "var(--text-secondary)",
                        border: "none",
                        borderRadius: "20px",
                        padding: "0.3rem 0.75rem",
                        fontSize: "0.74rem",
                        fontWeight: 700,
                        cursor: "pointer"
                      }}
                    >
                      {settings.contrast === "high" ? "ON (High)" : "OFF"}
                    </button>
                  </div>

                  {/* Glassmorphism Blur */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <div style={{ fontSize: "0.82rem", fontWeight: 700 }}>Frosted Glassmorphism</div>
                      <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>Dynamic blur filters on cards & floating navigation</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => updateSetting("glassmorphism", !settings.glassmorphism)}
                      style={{
                        background: settings.glassmorphism !== false ? "var(--crimson-500)" : "rgba(0,0,0,0.1)",
                        color: settings.glassmorphism !== false ? "#ffffff" : "var(--text-secondary)",
                        border: "none",
                        borderRadius: "20px",
                        padding: "0.3rem 0.75rem",
                        fontSize: "0.74rem",
                        fontWeight: 700,
                        cursor: "pointer"
                      }}
                    >
                      {settings.glassmorphism !== false ? "ON (Blur)" : "OFF (Solid)"}
                    </button>
                  </div>

                  {/* Card Corner Radii */}
                  <div>
                    <div style={{ fontSize: "0.82rem", fontWeight: 700, marginBottom: "0.35rem" }}>Corner Styling</div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "0.4rem" }}>
                      {[
                        { id: "sharp", label: "Minimal Sharp (4px)" },
                        { id: "rounded", label: "Balanced (14px)" },
                        { id: "pill", label: "Soft Organic (24px)" }
                      ].map((rad) => (
                        <button
                          key={rad.id}
                          type="button"
                          onClick={() => updateSetting("cardRadius", rad.id)}
                          style={{
                            background: (settings.cardRadius || "rounded") === rad.id ? "var(--gold-500)" : "rgba(0,0,0,0.04)",
                            color: (settings.cardRadius || "rounded") === rad.id ? "#000000" : "var(--text-secondary)",
                            border: "none",
                            padding: "0.45rem 0.2rem",
                            borderRadius: "6px",
                            fontSize: "0.72rem",
                            fontWeight: 700,
                            cursor: "pointer"
                          }}
                        >
                          {rad.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* UI Density */}
                  <div>
                    <div style={{ fontSize: "0.82rem", fontWeight: 700, marginBottom: "0.35rem" }}>Layout Density</div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "0.4rem" }}>
                      {[
                        { id: "spacious", label: "Spacious Luxury" },
                        { id: "comfortable", label: "Comfortable" },
                        { id: "compact", label: "Compact POS" }
                      ].map((den) => (
                        <button
                          key={den.id}
                          type="button"
                          onClick={() => updateSetting("density", den.id)}
                          style={{
                            background: (settings.density || "spacious") === den.id ? "var(--gold-500)" : "rgba(0,0,0,0.04)",
                            color: (settings.density || "spacious") === den.id ? "#000000" : "var(--text-secondary)",
                            border: "none",
                            padding: "0.45rem 0.2rem",
                            borderRadius: "6px",
                            fontSize: "0.72rem",
                            fontWeight: 700,
                            cursor: "pointer"
                          }}
                        >
                          {den.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ═══════════ TAB 2: TYPOGRAPHY & SCALING ═══════════ */}
          {activeTab === "typography" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "1.3rem" }}>
              {/* Typeface Selector */}
              <div>
                <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 800, color: "var(--text-muted)", textTransform: "uppercase", marginBottom: "0.5rem" }}>
                  1. Artisan Typefaces ({fontOptions.length} Families)
                </label>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  {fontOptions.map((f) => {
                    const isSelected = (settings.fontFamily || "normal") === f.id;
                    return (
                      <div
                        key={f.id}
                        onClick={() => updateSetting("fontFamily", f.id)}
                        style={{
                          padding: "0.85rem 1rem",
                          borderRadius: "12px",
                          border: isSelected ? "2px solid var(--crimson-500, #c8102e)" : "1px solid var(--border-subtle, rgba(0,0,0,0.08))",
                          background: isSelected ? "rgba(200, 16, 46, 0.08)" : "var(--bg-card, #ffffff)",
                          cursor: "pointer",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          boxShadow: isSelected ? "0 4px 14px rgba(200, 16, 46, 0.15)" : "0 1px 3px rgba(0,0,0,0.03)",
                          transition: "all 0.18s ease"
                        }}
                      >
                        <div style={{ flex: 1, minWidth: 0, paddingRight: "0.75rem" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.25rem", flexWrap: "wrap" }}>
                            <span
                              className={`bk-font-specimen bk-font-specimen-${f.id}`}
                              style={{
                                fontFamily: f.fontFamily,
                                fontSize: f.id === "caveat" ? "1.25rem" : f.id === "pacifico" ? "1.08rem" : "1.02rem",
                                fontWeight: f.id === "pacifico" ? 400 : 700,
                                color: isSelected ? "var(--crimson-600, #a50d22)" : "var(--text-primary, #1f2937)",
                                letterSpacing: f.id === "cinzel" ? "0.05em" : "normal"
                              }}
                            >
                              {f.name}
                            </span>
                            <span
                              style={{
                                fontSize: "0.64rem",
                                background: isSelected ? "rgba(200, 16, 46, 0.12)" : "rgba(0,0,0,0.05)",
                                color: isSelected ? "var(--crimson-600, #a50d22)" : "var(--text-muted, #6b7280)",
                                padding: "0.15rem 0.45rem",
                                borderRadius: "4px",
                                fontWeight: 700
                              }}
                            >
                              {f.badge}
                            </span>
                          </div>
                          <div
                            className={`bk-font-specimen bk-font-specimen-${f.id}`}
                            style={{
                              fontFamily: f.fontFamily,
                              fontSize: f.id === "caveat" ? "1.02rem" : "0.82rem",
                              color: isSelected ? "var(--text-primary, #1f2937)" : "var(--text-secondary, #4b5563)",
                              lineHeight: 1.4,
                              letterSpacing: f.id === "cinzel" ? "0.03em" : "normal"
                            }}
                          >
                            {f.sample}
                          </div>
                        </div>

                        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "0.3rem", flexShrink: 0 }}>
                          {isSelected ? (
                            <span
                              style={{
                                background: "var(--crimson-500, #c8102e)",
                                color: "#ffffff",
                                fontSize: "0.72rem",
                                fontWeight: 800,
                                padding: "0.25rem 0.6rem",
                                borderRadius: "9999px",
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "0.25rem",
                                boxShadow: "0 2px 6px rgba(200, 16, 46, 0.3)"
                              }}
                            >
                              Active ✓
                            </span>
                          ) : (
                            <span
                              style={{
                                fontSize: "0.72rem",
                                color: "var(--text-muted, #9ca3af)",
                                fontWeight: 600,
                                padding: "0.2rem 0.5rem",
                                borderRadius: "6px",
                                background: "rgba(0,0,0,0.04)"
                              }}
                            >
                              Select
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Font Scaling & Letter Spacing */}
              <div style={{ background: "rgba(0,0,0,0.03)", padding: "1rem", borderRadius: "12px", border: "1px solid var(--border-subtle)" }}>
                <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 800, color: "var(--text-muted)", textTransform: "uppercase", marginBottom: "0.5rem" }}>
                  2. Scale & Letter Spacing
                </label>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "0.4rem", marginBottom: "0.8rem" }}>
                  {[
                    { id: "compact", label: "88%", desc: "Dense" },
                    { id: "default", label: "100%", desc: "Standard" },
                    { id: "large", label: "112%", desc: "Large" },
                    { id: "xl", label: "125%", desc: "Maximum" }
                  ].map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => updateSetting("fontSize", s.id)}
                      style={{
                        background: (settings.fontSize || "default") === s.id ? "var(--crimson-500)" : "rgba(0,0,0,0.04)",
                        color: (settings.fontSize || "default") === s.id ? "#ffffff" : "var(--text-secondary)",
                        border: "none",
                        padding: "0.5rem 0.2rem",
                        borderRadius: "8px",
                        cursor: "pointer",
                        fontWeight: 700,
                        fontSize: "0.75rem"
                      }}
                    >
                      <div>{s.label}</div>
                      <div style={{ fontSize: "0.62rem", opacity: 0.8 }}>{s.desc}</div>
                    </button>
                  ))}
                </div>

                <div style={{ fontSize: "0.8rem", fontWeight: 700, marginBottom: "0.3rem" }}>Letter Spacing</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "0.4rem" }}>
                  {[
                    { id: "tight", label: "Tight Condensed" },
                    { id: "normal", label: "Natural Normal" },
                    { id: "wide", label: "Airy Wide" }
                  ].map((ls) => (
                    <button
                      key={ls.id}
                      type="button"
                      onClick={() => updateSetting("letterSpacing", ls.id)}
                      style={{
                        background: (settings.letterSpacing || "normal") === ls.id ? "var(--gold-500)" : "rgba(0,0,0,0.04)",
                        color: (settings.letterSpacing || "normal") === ls.id ? "#000000" : "var(--text-secondary)",
                        border: "none",
                        padding: "0.4rem 0.2rem",
                        borderRadius: "6px",
                        fontSize: "0.72rem",
                        fontWeight: 700,
                        cursor: "pointer"
                      }}
                    >
                      {ls.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Live Interactive Specimen Preview Box */}
              <div>
                <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 800, color: "var(--text-muted)", textTransform: "uppercase", marginBottom: "0.4rem" }}>
                  3. Live Interactive Typing Specimen
                </label>
                <div
                  style={{
                    background: "rgba(0,0,0,0.03)",
                    border: "1px dashed var(--border-hover)",
                    borderRadius: "10px",
                    padding: "0.9rem"
                  }}
                >
                  <input
                    type="text"
                    value={previewText}
                    onChange={(e) => setPreviewText(e.target.value)}
                    className={`bk-font-specimen bk-font-specimen-${settings.fontFamily || "normal"}`}
                    style={{
                      width: "100%",
                      background: "transparent",
                      border: "none",
                      outline: "none",
                      fontSize: "1.25rem",
                      fontWeight: 700,
                      color: "var(--crimson-500, #c8102e)",
                      fontFamily: FONT_MAP[settings.fontFamily] || FONT_MAP.normal
                    }}
                  />
                  <div style={{ fontSize: "0.74rem", color: "var(--text-muted)", marginTop: "0.45rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span>
                      Active Typeface: <strong style={{ color: "var(--crimson-600, #a50d22)" }}>{fontOptions.find((f) => f.id === (settings.fontFamily || "normal"))?.name || "Outfit (Modern Sans)"}</strong>
                    </span>
                    <span>
                      Scale: <strong>{settings.fontSize || "default"}</strong> • Spacing: <strong>{settings.letterSpacing || "normal"}</strong>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ═══════════ TAB 3: SENSORY, AUDIO & FX ═══════════ */}
          {activeTab === "sensory" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "1.3rem" }}>
              {/* Master Audio Toggle */}
              <div
                style={{
                  background: "rgba(0,0,0,0.03)",
                  padding: "1rem",
                  borderRadius: "12px",
                  border: "1px solid var(--border-subtle)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center"
                }}
              >
                <div>
                  <div style={{ fontSize: "0.92rem", fontWeight: 800, color: "var(--text-primary)" }}>
                    Interactive Audio Synthesizer
                  </div>
                  <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>
                    Pure Web Audio API zero-latency acoustic feedback on clicks, toggles & bookings
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => updateSetting("soundEnabled", !settings.soundEnabled)}
                  style={{
                    background: settings.soundEnabled ? "var(--crimson-500)" : "rgba(0,0,0,0.15)",
                    color: settings.soundEnabled ? "#ffffff" : "var(--text-muted)",
                    border: "none",
                    borderRadius: "20px",
                    padding: "0.35rem 0.9rem",
                    fontWeight: 700,
                    fontSize: "0.78rem",
                    cursor: "pointer"
                  }}
                >
                  {settings.soundEnabled ? "🔊 ENABLED" : "🔇 MUTED"}
                </button>
              </div>

              {/* Sound Profiles */}
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                  <label style={{ fontSize: "0.78rem", fontWeight: 800, color: "var(--text-muted)", textTransform: "uppercase" }}>
                    Acoustic Sound Profile ({soundProfiles.length} Presets)
                  </label>
                  <button
                    type="button"
                    onClick={() => playChime("success")}
                    style={{
                      background: "rgba(245, 158, 11, 0.15)",
                      color: "var(--gold-600, #b45309)",
                      border: "1px solid var(--gold-500)",
                      borderRadius: "6px",
                      padding: "0.2rem 0.6rem",
                      fontSize: "0.72rem",
                      fontWeight: 700,
                      cursor: "pointer"
                    }}
                  >
                    ▶ Audition Profile
                  </button>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  {soundProfiles.map((p) => {
                    const isSelected = (settings.soundProfile || "chime") === p.id;
                    return (
                      <div
                        key={p.id}
                        onClick={() => {
                          updateSetting("soundProfile", p.id);
                          setTimeout(() => playChime("success"), 50);
                        }}
                        style={{
                          padding: "0.7rem 0.9rem",
                          borderRadius: "10px",
                          border: isSelected ? "2px solid var(--gold-500)" : "1px solid var(--border-subtle)",
                          background: isSelected ? "rgba(245, 158, 11, 0.1)" : "rgba(0,0,0,0.02)",
                          cursor: "pointer",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center"
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                          <span style={{ fontSize: "1.2rem" }}>{p.icon}</span>
                          <div>
                            <div style={{ fontSize: "0.85rem", fontWeight: 700, color: isSelected ? "var(--gold-600)" : "var(--text-primary)" }}>
                              {p.name}
                            </div>
                            <div style={{ fontSize: "0.68rem", color: "var(--text-muted)" }}>{p.desc}</div>
                          </div>
                        </div>
                        {isSelected && <span style={{ color: "var(--gold-500)", fontWeight: 800 }}>✓ Active</span>}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Sound Volume Slider */}
              <div style={{ background: "rgba(0,0,0,0.03)", padding: "1rem", borderRadius: "12px", border: "1px solid var(--border-subtle)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.4rem" }}>
                  <span style={{ fontSize: "0.82rem", fontWeight: 700 }}>Acoustic Master Gain</span>
                  <span style={{ fontSize: "0.82rem", fontWeight: 800, color: "var(--crimson-500)" }}>
                    {settings.soundVolume ?? 75}%
                  </span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="100"
                  step="5"
                  value={settings.soundVolume ?? 75}
                  onChange={(e) => updateSetting("soundVolume", Number(e.target.value))}
                  style={{ width: "100%", accentColor: "var(--crimson-500)", cursor: "pointer" }}
                />
              </div>

              {/* Motion & Confetti */}
              <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "0.75rem 0.9rem",
                    borderRadius: "10px",
                    background: "rgba(0,0,0,0.02)",
                    border: "1px solid var(--border-subtle)"
                  }}
                >
                  <div>
                    <div style={{ fontSize: "0.82rem", fontWeight: 700 }}>60fps Micro-Animations</div>
                    <div style={{ fontSize: "0.68rem", color: "var(--text-muted)" }}>Smooth modal slide-ins, orb spinning & card lifts</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => updateSetting("reducedMotion", !settings.reducedMotion)}
                    style={{
                      background: !settings.reducedMotion ? "var(--crimson-500)" : "rgba(0,0,0,0.12)",
                      color: !settings.reducedMotion ? "#ffffff" : "var(--text-secondary)",
                      border: "none",
                      borderRadius: "16px",
                      padding: "0.25rem 0.65rem",
                      fontSize: "0.72rem",
                      fontWeight: 700,
                      cursor: "pointer"
                    }}
                  >
                    {!settings.reducedMotion ? "Full 60fps" : "Reduced"}
                  </button>
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "0.75rem 0.9rem",
                    borderRadius: "10px",
                    background: "rgba(0,0,0,0.02)",
                    border: "1px solid var(--border-subtle)"
                  }}
                >
                  <div>
                    <div style={{ fontSize: "0.82rem", fontWeight: 700 }}>Celebration Confetti Blast</div>
                    <div style={{ fontSize: "0.68rem", color: "var(--text-muted)" }}>Burst gold confetti on custom cake booking & cart completion</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => updateSetting("celebrationConfetti", settings.celebrationConfetti === false ? true : false)}
                    style={{
                      background: settings.celebrationConfetti !== false ? "var(--gold-500)" : "rgba(0,0,0,0.12)",
                      color: settings.celebrationConfetti !== false ? "#000000" : "var(--text-secondary)",
                      border: "none",
                      borderRadius: "16px",
                      padding: "0.25rem 0.65rem",
                      fontSize: "0.72rem",
                      fontWeight: 700,
                      cursor: "pointer"
                    }}
                  >
                    {settings.celebrationConfetti !== false ? "🎉 ENABLED" : "OFF"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ═══════════ TAB 4: GOURMET ORDERING & DINING PRESETS ═══════════ */}
          {activeTab === "ordering" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "1.3rem" }}>
              {/* Dietary Preferences */}
              <div>
                <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 800, color: "var(--text-muted)", textTransform: "uppercase", marginBottom: "0.5rem" }}>
                  1. Gourmet Dietary Preference Filter
                </label>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.45rem" }}>
                  {dietaryOptions.map((opt) => {
                    const isSelected = (settings.dietaryPreference || "all") === opt.id;
                    return (
                      <div
                        key={opt.id}
                        onClick={() => updateSetting("dietaryPreference", opt.id)}
                        style={{
                          padding: "0.65rem 0.85rem",
                          borderRadius: "10px",
                          border: isSelected ? "2px solid var(--veg-green, #16a34a)" : "1px solid var(--border-subtle)",
                          background: isSelected ? "rgba(22, 163, 74, 0.08)" : "rgba(0,0,0,0.02)",
                          cursor: "pointer",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center"
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                          <span style={{ fontSize: "1.2rem" }}>{opt.icon}</span>
                          <div>
                            <div style={{ fontSize: "0.84rem", fontWeight: 700, color: isSelected ? "var(--veg-green)" : "var(--text-primary)" }}>
                              {opt.label}
                            </div>
                            <div style={{ fontSize: "0.68rem", color: "var(--text-muted)" }}>{opt.desc}</div>
                          </div>
                        </div>
                        {isSelected && <span style={{ color: "var(--veg-green)", fontWeight: 800 }}>✓</span>}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Express Delivery Slot */}
              <div>
                <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 800, color: "var(--text-muted)", textTransform: "uppercase", marginBottom: "0.5rem" }}>
                  2. Default Express Delivery Window
                </label>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.45rem" }}>
                  {deliverySlots.map((slot) => {
                    const isSelected = (settings.deliveryPreference || "express") === slot.id;
                    return (
                      <div
                        key={slot.id}
                        onClick={() => updateSetting("deliveryPreference", slot.id)}
                        style={{
                          padding: "0.65rem 0.85rem",
                          borderRadius: "10px",
                          border: isSelected ? "2px solid var(--crimson-500)" : "1px solid var(--border-subtle)",
                          background: isSelected ? "rgba(225, 29, 72, 0.08)" : "rgba(0,0,0,0.02)",
                          cursor: "pointer",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center"
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                          <span style={{ fontSize: "1.1rem" }}>{slot.icon}</span>
                          <div>
                            <div style={{ fontSize: "0.84rem", fontWeight: 700 }}>{slot.label}</div>
                            <div style={{ fontSize: "0.68rem", color: "var(--text-muted)" }}>{slot.fee}</div>
                          </div>
                        </div>
                        {isSelected && <span style={{ color: "var(--crimson-500)", fontWeight: 800 }}>✓</span>}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Packaging Selection */}
              <div>
                <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 800, color: "var(--text-muted)", textTransform: "uppercase", marginBottom: "0.5rem" }}>
                  3. Patisserie Box Presentation
                </label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "0.45rem" }}>
                  {packagingOptions.map((pkg) => {
                    const isSelected = (settings.packagingType || "luxury") === pkg.id;
                    return (
                      <div
                        key={pkg.id}
                        onClick={() => updateSetting("packagingType", pkg.id)}
                        style={{
                          padding: "0.65rem 0.85rem",
                          borderRadius: "10px",
                          border: isSelected ? "2px solid var(--gold-500)" : "1px solid var(--border-subtle)",
                          background: isSelected ? "rgba(245, 158, 11, 0.08)" : "rgba(0,0,0,0.02)",
                          cursor: "pointer",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center"
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                          <span style={{ fontSize: "1.2rem" }}>{pkg.icon}</span>
                          <div>
                            <div style={{ fontSize: "0.84rem", fontWeight: 700 }}>{pkg.label}</div>
                            <div style={{ fontSize: "0.68rem", color: "var(--text-muted)" }}>{pkg.desc}</div>
                          </div>
                        </div>
                        {isSelected && <span style={{ color: "var(--gold-500)", fontWeight: 800 }}>✓</span>}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Complimentary Toggles */}
              <div style={{ background: "rgba(0,0,0,0.03)", padding: "0.9rem", borderRadius: "10px", display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ fontSize: "0.82rem", fontWeight: 700 }}>Complimentary Celebration Kit</div>
                    <div style={{ fontSize: "0.68rem", color: "var(--text-muted)" }}>Include complimentary sparkling candles & cake knife</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => updateSetting("includeCandlesKnife", !settings.includeCandlesKnife)}
                    style={{
                      background: settings.includeCandlesKnife !== false ? "var(--crimson-500)" : "rgba(0,0,0,0.12)",
                      color: settings.includeCandlesKnife !== false ? "#ffffff" : "var(--text-secondary)",
                      border: "none",
                      borderRadius: "16px",
                      padding: "0.25rem 0.65rem",
                      fontSize: "0.72rem",
                      fontWeight: 700,
                      cursor: "pointer"
                    }}
                  >
                    {settings.includeCandlesKnife !== false ? "YES" : "NO"}
                  </button>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ fontSize: "0.82rem", fontWeight: 700 }}>Auto-Open GST Bill Modal</div>
                    <div style={{ fontSize: "0.68rem", color: "var(--text-muted)" }}>Immediately display thermal tax invoice after successful order</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => updateSetting("autoInvoiceDownload", !settings.autoInvoiceDownload)}
                    style={{
                      background: settings.autoInvoiceDownload !== false ? "var(--crimson-500)" : "rgba(0,0,0,0.12)",
                      color: settings.autoInvoiceDownload !== false ? "#ffffff" : "var(--text-secondary)",
                      border: "none",
                      borderRadius: "16px",
                      padding: "0.25rem 0.65rem",
                      fontSize: "0.72rem",
                      fontWeight: 700,
                      cursor: "pointer"
                    }}
                  >
                    {settings.autoInvoiceDownload !== false ? "ON" : "OFF"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ═══════════ TAB 5: KITCHEN, OPERATIONS & CURRENCY ═══════════ */}
          {activeTab === "operations" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "1.3rem" }}>
              {/* Currency Selector */}
              <div>
                <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 800, color: "var(--text-muted)", textTransform: "uppercase", marginBottom: "0.5rem" }}>
                  1. Storefront Currency & FX Engine
                </label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
                  {currencies.map((cur) => {
                    const isSelected = (settings.currency || "INR") === cur.code;
                    return (
                      <div
                        key={cur.code}
                        onClick={() => updateSetting("currency", cur.code)}
                        style={{
                          padding: "0.6rem 0.8rem",
                          borderRadius: "10px",
                          border: isSelected ? "2px solid var(--crimson-500)" : "1px solid var(--border-subtle)",
                          background: isSelected ? "rgba(225, 29, 72, 0.08)" : "rgba(0,0,0,0.02)",
                          cursor: "pointer",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center"
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                          <span style={{ fontSize: "1.2rem", fontWeight: 800, color: "var(--crimson-500)" }}>{cur.symbol}</span>
                          <div>
                            <div style={{ fontSize: "0.82rem", fontWeight: 700 }}>{cur.code}</div>
                            <div style={{ fontSize: "0.64rem", color: "var(--text-muted)" }}>{cur.rate} conversion</div>
                          </div>
                        </div>
                        {isSelected && <span style={{ color: "var(--crimson-500)", fontWeight: 800 }}>✓</span>}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Thermal Slip Width */}
              <div>
                <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 800, color: "var(--text-muted)", textTransform: "uppercase", marginBottom: "0.5rem" }}>
                  2. POS Thermal Receipt Width
                </label>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "0.4rem" }}>
                  {thermalWidths.map((tw) => {
                    const isSelected = (settings.thermalReceiptWidth || "80mm") === tw.id;
                    return (
                      <button
                        key={tw.id}
                        type="button"
                        onClick={() => updateSetting("thermalReceiptWidth", tw.id)}
                        style={{
                          background: isSelected ? "var(--crimson-500)" : "rgba(0,0,0,0.03)",
                          color: isSelected ? "#ffffff" : "var(--text-primary)",
                          border: isSelected ? "none" : "1px solid var(--border-subtle)",
                          borderRadius: "8px",
                          padding: "0.6rem 0.4rem",
                          cursor: "pointer",
                          textAlign: "center"
                        }}
                      >
                        <div style={{ fontWeight: 700, fontSize: "0.8rem" }}>{tw.label}</div>
                        <div style={{ fontSize: "0.64rem", opacity: 0.85 }}>{tw.desc}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Kitchen Polling Telemetry */}
              <div style={{ background: "rgba(0,0,0,0.03)", padding: "1rem", borderRadius: "12px", border: "1px solid var(--border-subtle)" }}>
                <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 800, color: "var(--text-muted)", textTransform: "uppercase", marginBottom: "0.4rem" }}>
                  3. Kitchen Live Polling Interval
                </label>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "0.4rem", marginBottom: "0.8rem" }}>
                  {[
                    { sec: 5, label: "5s Realtime" },
                    { sec: 15, label: "15s Balanced" },
                    { sec: 30, label: "30s Eco" },
                    { sec: 60, label: "60s Low Data" }
                  ].map((inv) => (
                    <button
                      key={inv.sec}
                      type="button"
                      onClick={() => updateSetting("kitchenRefreshInterval", inv.sec)}
                      style={{
                        background: (settings.kitchenRefreshInterval || 15) === inv.sec ? "var(--gold-500)" : "rgba(0,0,0,0.04)",
                        color: (settings.kitchenRefreshInterval || 15) === inv.sec ? "#000000" : "var(--text-secondary)",
                        border: "none",
                        padding: "0.45rem 0.2rem",
                        borderRadius: "6px",
                        fontSize: "0.72rem",
                        fontWeight: 700,
                        cursor: "pointer"
                      }}
                    >
                      {inv.label}
                    </button>
                  ))}
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ fontSize: "0.82rem", fontWeight: 700 }}>Fresh Oven Batch Alerts</div>
                    <div style={{ fontSize: "0.68rem", color: "var(--text-muted)" }}>Pop live toast when warm sourdough or croissants finish baking</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => updateSetting("freshBatchAlerts", !settings.freshBatchAlerts)}
                    style={{
                      background: settings.freshBatchAlerts !== false ? "var(--crimson-500)" : "rgba(0,0,0,0.12)",
                      color: settings.freshBatchAlerts !== false ? "#ffffff" : "var(--text-secondary)",
                      border: "none",
                      borderRadius: "16px",
                      padding: "0.25rem 0.65rem",
                      fontSize: "0.72rem",
                      fontWeight: 700,
                      cursor: "pointer"
                    }}
                  >
                    {settings.freshBatchAlerts !== false ? "ON" : "OFF"}
                  </button>
                </div>
              </div>

              {/* Measurement System */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.75rem 0.9rem", borderRadius: "10px", background: "rgba(0,0,0,0.02)", border: "1px solid var(--border-subtle)" }}>
                <div>
                  <div style={{ fontSize: "0.82rem", fontWeight: 700 }}>Ingredient Weights & Units</div>
                  <div style={{ fontSize: "0.68rem", color: "var(--text-muted)" }}>Display cake sizes in kilograms or pounds</div>
                </div>
                <div style={{ display: "flex", gap: "0.3rem" }}>
                  <button
                    type="button"
                    onClick={() => updateSetting("unitSystem", "metric")}
                    style={{
                      background: (settings.unitSystem || "metric") === "metric" ? "var(--crimson-500)" : "rgba(0,0,0,0.06)",
                      color: (settings.unitSystem || "metric") === "metric" ? "#ffffff" : "var(--text-secondary)",
                      border: "none",
                      padding: "0.3rem 0.6rem",
                      borderRadius: "6px",
                      fontSize: "0.72rem",
                      fontWeight: 700,
                      cursor: "pointer"
                    }}
                  >
                    Metric (kg)
                  </button>
                  <button
                    type="button"
                    onClick={() => updateSetting("unitSystem", "imperial")}
                    style={{
                      background: settings.unitSystem === "imperial" ? "var(--crimson-500)" : "rgba(0,0,0,0.06)",
                      color: settings.unitSystem === "imperial" ? "#ffffff" : "var(--text-secondary)",
                      border: "none",
                      padding: "0.3rem 0.6rem",
                      borderRadius: "6px",
                      fontSize: "0.72rem",
                      fontWeight: 700,
                      cursor: "pointer"
                    }}
                  >
                    Imperial (lbs)
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ═══════════ TAB 6: ACCOUNT, SECURITY & DATA ═══════════ */}
          {activeTab === "account" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "1.3rem" }}>
              {/* Maintenance & Data Management */}
              <div>
                <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 800, color: "var(--text-muted)", textTransform: "uppercase", marginBottom: "0.5rem" }}>
                  Cache, Backups & Maintenance
                </label>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  <button
                    type="button"
                    onClick={handleClearCache}
                    style={{
                      background: "rgba(0,0,0,0.03)",
                      border: "1px solid var(--border-subtle)",
                      borderRadius: "10px",
                      padding: "0.75rem 1rem",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      cursor: "pointer",
                      textAlign: "left"
                    }}
                  >
                    <div>
                      <div style={{ fontSize: "0.84rem", fontWeight: 700 }}>🧹 Purge Local Cache</div>
                      <div style={{ fontSize: "0.68rem", color: "var(--text-muted)" }}>Clear cart session and recently viewed cake history</div>
                    </div>
                    <span style={{ fontSize: "0.76rem", fontWeight: 700, color: "var(--crimson-500)" }}>Execute</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleExportBackup}
                    style={{
                      background: "rgba(0,0,0,0.03)",
                      border: "1px solid var(--border-subtle)",
                      borderRadius: "10px",
                      padding: "0.75rem 1rem",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      cursor: "pointer",
                      textAlign: "left"
                    }}
                  >
                    <div>
                      <div style={{ fontSize: "0.84rem", fontWeight: 700 }}>📦 Export Configuration & Invoices</div>
                      <div style={{ fontSize: "0.68rem", color: "var(--text-muted)" }}>Download complete JSON snapshot of settings and receipt archive</div>
                    </div>
                    <span style={{ fontSize: "0.76rem", fontWeight: 700, color: "var(--gold-600)" }}>Download</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm("Reset all customizations, sound levels, and appearance back to defaults?")) {
                        resetDefaults();
                        showToast("Settings reset to defaults");
                      }
                    }}
                    style={{
                      background: "rgba(225, 29, 72, 0.04)",
                      border: "1px solid rgba(225, 29, 72, 0.2)",
                      borderRadius: "10px",
                      padding: "0.75rem 1rem",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      cursor: "pointer",
                      textAlign: "left"
                    }}
                  >
                    <div>
                      <div style={{ fontSize: "0.84rem", fontWeight: 700, color: "var(--crimson-500)" }}>🔄 Restore Factory Defaults</div>
                      <div style={{ fontSize: "0.68rem", color: "var(--text-muted)" }}>Revert all theme, audio, and dietary presets to fresh install state</div>
                    </div>
                    <span style={{ fontSize: "0.76rem", fontWeight: 700, color: "var(--crimson-500)" }}>Reset</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ═══════════ TOAST BANNER NOTIFICATION ═══════════ */}
        {toastMessage && (
          <div
            style={{
              padding: "0.65rem 1rem",
              background: "var(--crimson-500, #be123c)",
              color: "#ffffff",
              fontSize: "0.8rem",
              fontWeight: 700,
              textAlign: "center",
              boxShadow: "0 -4px 16px rgba(0,0,0,0.3)"
            }}
          >
            {toastMessage}
          </div>
        )}

        {/* ═══════════ FOOTER ═══════════ */}
        <div
          style={{
            padding: "0.9rem 1.4rem",
            borderTop: "1px solid var(--border-subtle, #e2e8f0)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            background: "rgba(0,0,0,0.02)"
          }}
        >
          <div style={{ fontSize: "0.74rem", color: "var(--text-muted)" }}>
            Active: <strong>{settings.theme || "bakingo"}</strong> • <strong>{settings.mode || "light"}</strong>
          </div>
          <button
            type="button"
            onClick={closeSettings}
            style={{
              background: "var(--crimson-500, #be123c)",
              color: "#ffffff",
              border: "none",
              borderRadius: "8px",
              padding: "0.55rem 1.4rem",
              fontSize: "0.82rem",
              fontWeight: 700,
              cursor: "pointer",
              boxShadow: "0 2px 10px rgba(190, 18, 60, 0.35)"
            }}
          >
            Done & Save
          </button>
        </div>
      </div>
    </div>
  );
};
