import { useState } from "react";
import { useThemeSettings } from "../../context/ThemeSettingsContext.jsx";
import { useLanguage } from "../../context/LanguageContext.jsx";

export const SettingsDrawer = () => {
  const {
    settings,
    updateSetting,
    resetDefaults,
    isSettingsOpen,
    closeSettings,
    playChime
  } = useThemeSettings();

  const { language, setLanguage, t } = useLanguage();
  const [activeTab, setActiveTab] = useState("appearance"); // "appearance" | "typography" | "localization" | "sensory"

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
    }
  ];

  const fontOptions = [
    {
      id: "normal",
      name: "Normal (Outfit)",
      fontFamily: "'Outfit', sans-serif",
      badge: "Default",
      sample: "The quick brown fox jumps over the lazy dog"
    },
    {
      id: "times",
      name: "Times New Roman",
      fontFamily: "'Times New Roman', Times, serif",
      badge: "Editorial Serif",
      sample: "The quick brown fox jumps over the lazy dog"
    },
    {
      id: "arial",
      name: "Arial",
      fontFamily: "Arial, Helvetica, sans-serif",
      badge: "Clean Sans",
      sample: "The quick brown fox jumps over the lazy dog"
    },
    {
      id: "coral",
      name: "Coral (Comfortaa Script)",
      fontFamily: "'Comfortaa', 'Caveat', cursive, sans-serif",
      badge: "Artisanal Rounded",
      sample: "The quick brown fox jumps over the lazy dog"
    },
    {
      id: "playfair",
      name: "Playfair Display",
      fontFamily: "'Playfair Display', Georgia, serif",
      badge: "Luxury Serif",
      sample: "The quick brown fox jumps over the lazy dog"
    },
    {
      id: "inter",
      name: "Inter",
      fontFamily: "'Inter', sans-serif",
      badge: "Modern UI",
      sample: "The quick brown fox jumps over the lazy dog"
    },
    {
      id: "mono",
      name: "JetBrains Mono",
      fontFamily: "'JetBrains Mono', monospace",
      badge: "Code & Receipts",
      sample: "The quick brown fox jumps over the lazy dog"
    },
    {
      id: "georgia",
      name: "Georgia",
      fontFamily: "Georgia, serif",
      badge: "Warm Book Serif",
      sample: "The quick brown fox jumps over the lazy dog"
    }
  ];

  const fontSizes = [
    { id: "compact", label: "Compact", scale: "88%", desc: "Dense ERP data" },
    { id: "default", label: "Default", scale: "100%", desc: "Balanced reading" },
    { id: "large", label: "Large", scale: "112%", desc: "Comfortable text" },
    { id: "xl", label: "Extra Large", scale: "125%", desc: "High accessibility" }
  ];

  const currencies = [
    { code: "INR", symbol: "₹", name: "Indian Rupee (INR)" },
    { code: "USD", symbol: "$", name: "US Dollar (USD)" },
    { code: "EUR", symbol: "€", name: "Euro (EUR)" },
    { code: "GBP", symbol: "£", name: "British Pound (GBP)" }
  ];

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        background: "rgba(0, 0, 0, 0.65)",
        backdropFilter: "blur(8px)",
        display: "flex",
        justifyContent: "flex-end"
      }}
      onClick={closeSettings}
    >
      <div
        style={{
          width: "500px",
          maxWidth: "100vw",
          height: "100vh",
          background: "var(--bg-surface)",
          borderLeft: "1px solid var(--border-hover)",
          boxShadow: "-10px 0 40px rgba(0, 0, 0, 0.7)",
          display: "flex",
          flexDirection: "column",
          color: "var(--text-primary)",
          overflowY: "auto"
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          padding: "1.4rem 1.5rem",
          borderBottom: "1px solid var(--border-subtle)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          background: "rgba(0,0,0,0.15)"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
            <span style={{ fontSize: "1.4rem" }}>⚙️</span>
            <div>
              <h2 style={{ fontSize: "1.2rem", fontWeight: 700, margin: 0, color: "var(--gold-400)" }}>
                {t("customizationStudio")}
              </h2>
              <p style={{ fontSize: "0.74rem", color: "var(--text-muted)", margin: 0 }}>
                {t("customizationSub")}
              </p>
            </div>
          </div>
          <button
            onClick={closeSettings}
            style={{
              background: "rgba(255,255,255,0.06)",
              border: "1px solid var(--border-subtle)",
              borderRadius: "50%",
              width: "32px",
              height: "32px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--text-secondary)",
              cursor: "pointer",
              fontSize: "0.9rem"
            }}
          >
            ✕
          </button>
        </div>

        {/* Tab Navigation */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: "0.3rem",
          padding: "0.8rem 1.5rem",
          background: "rgba(0,0,0,0.2)",
          borderBottom: "1px solid var(--border-subtle)"
        }}>
          {[
            { id: "appearance", label: t("themesTab"), icon: "🎨" },
            { id: "typography", label: t("typeTab"), icon: "🔤" },
            { id: "localization", label: t("localeTab"), icon: "🌐" },
            { id: "sensory", label: t("sensoryTab"), icon: "⚡" }
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  playChime("click");
                }}
                style={{
                  background: isActive ? "var(--crimson-500)" : "transparent",
                  color: isActive ? "#ffffff" : "var(--text-secondary)",
                  border: "none",
                  padding: "0.45rem 0.2rem",
                  borderRadius: "8px",
                  fontWeight: 700,
                  fontSize: "0.78rem",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.3rem",
                  transition: "all 0.15s ease"
                }}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Drawer Content */}
        <div style={{ flex: 1, padding: "1.5rem", overflowY: "auto" }}>

          {/* TAB 1: APPEARANCE & THEMES */}
          {activeTab === "appearance" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
              {/* Dark vs Light Mode Toggle */}
              <div>
                <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", marginBottom: "0.6rem" }}>
                  {t("modeAndIllumination")}
                </label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.6rem" }}>
                  <button
                    onClick={() => updateSetting("mode", "dark")}
                    style={{
                      background: settings.mode === "dark" ? "var(--crimson-light)" : "rgba(255, 255, 255, 0.03)",
                      border: settings.mode === "dark" ? "2px solid var(--crimson-500)" : "1px solid var(--border-subtle)",
                      borderRadius: "10px",
                      padding: "0.8rem",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.6rem",
                      color: settings.mode === "dark" ? "var(--crimson-500)" : "var(--text-secondary)"
                    }}
                  >
                    <span style={{ fontSize: "1.3rem" }}>🌙</span>
                    <div style={{ textAlign: "left" }}>
                      <div style={{ fontSize: "0.88rem", fontWeight: 700 }}>{t("midnightDark")}</div>
                      <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>{t("midnightDarkSub")}</div>
                    </div>
                  </button>

                  <button
                    onClick={() => updateSetting("mode", "light")}
                    style={{
                      background: settings.mode === "light" ? "var(--crimson-light)" : "rgba(255, 255, 255, 0.03)",
                      border: settings.mode === "light" ? "2px solid var(--crimson-500)" : "1px solid var(--border-subtle)",
                      borderRadius: "10px",
                      padding: "0.8rem",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.6rem",
                      color: settings.mode === "light" ? "var(--crimson-500)" : "var(--text-secondary)"
                    }}
                  >
                    <span style={{ fontSize: "1.3rem" }}>☀️</span>
                    <div style={{ textAlign: "left" }}>
                      <div style={{ fontSize: "0.88rem", fontWeight: 700 }}>{t("artisanCream")}</div>
                      <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>{t("artisanCreamSub")}</div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Theme Palettes */}
              <div>
                <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", marginBottom: "0.6rem" }}>
                  {t("colorPalettes")}
                </label>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                  {themes.map((th) => {
                    const isSelected = settings.theme === th.id;
                    return (
                      <div
                        key={th.id}
                        onClick={() => updateSetting("theme", th.id)}
                        style={{
                          background: isSelected ? "var(--crimson-light)" : "rgba(255, 255, 255, 0.03)",
                          border: isSelected ? "2px solid var(--crimson-500)" : "1px solid var(--border-subtle)",
                          borderRadius: "12px",
                          padding: "0.85rem 1rem",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          transition: "all 0.2s"
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: "0.8rem" }}>
                          <div style={{
                            width: "36px",
                            height: "36px",
                            borderRadius: "10px",
                            background: th.gradient,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "1.2rem",
                            boxShadow: "0 4px 10px rgba(0,0,0,0.3)"
                          }}>
                            {th.icon}
                          </div>
                          <div>
                            <div style={{ fontSize: "0.9rem", fontWeight: 700, color: isSelected ? "var(--crimson-500)" : "var(--text-primary)" }}>
                              {th.name}
                            </div>
                            <div style={{ fontSize: "0.74rem", color: "var(--text-muted)" }}>
                              {th.desc}
                            </div>
                          </div>
                        </div>

                        <div style={{
                          width: "20px",
                          height: "20px",
                          borderRadius: "50%",
                          border: isSelected ? "5px solid var(--crimson-500)" : "2px solid var(--border-subtle)",
                          background: isSelected ? "#fff" : "transparent"
                        }} />
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: TYPOGRAPHY (Times New Roman, Arial, Coral, Normal, etc.) */}
          {activeTab === "typography" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
              {/* Font Family Selection */}
              <div>
                <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", marginBottom: "0.6rem" }}>
                  {t("primaryFontFamily")}
                </label>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.55rem" }}>
                  {fontOptions.map((f) => {
                    const isSelected = settings.fontFamily === f.id || (settings.fontFamily === "outfit" && f.id === "normal");
                    return (
                      <div
                        key={f.id}
                        onClick={() => updateSetting("fontFamily", f.id)}
                        style={{
                          background: isSelected ? "var(--crimson-light)" : "rgba(255, 255, 255, 0.03)",
                          border: isSelected ? "2px solid var(--crimson-500)" : "1px solid var(--border-subtle)",
                          borderRadius: "10px",
                          padding: "0.8rem 1rem",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          transition: "all 0.15s ease"
                        }}
                      >
                        <div style={{ flex: 1 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.2rem" }}>
                            <span style={{ fontFamily: f.fontFamily, fontSize: "1.05rem", fontWeight: 700, color: isSelected ? "var(--crimson-500)" : "var(--text-primary)" }}>
                              {f.name}
                            </span>
                            <span style={{ fontSize: "0.68rem", padding: "0.15rem 0.45rem", borderRadius: "6px", background: isSelected ? "var(--crimson-500)" : "rgba(128,128,128,0.15)", color: isSelected ? "#fff" : "var(--text-muted)", fontWeight: 600 }}>
                              {f.badge}
                            </span>
                          </div>
                          <div style={{ fontFamily: f.fontFamily, fontSize: "0.8rem", color: "var(--text-muted)" }}>
                            {f.sample}
                          </div>
                        </div>
                        {isSelected && (
                          <span style={{ color: "var(--crimson-500)", fontWeight: 800, fontSize: "1.2rem", marginLeft: "0.5rem" }}>
                            ✓
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Font Size Scaling */}
              <div>
                <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", marginBottom: "0.6rem" }}>
                  {t("displayScale")}
                </label>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "0.4rem", marginBottom: "1rem" }}>
                  {fontSizes.map((s) => {
                    const isSelected = settings.fontSize === s.id;
                    return (
                      <button
                        key={s.id}
                        onClick={() => updateSetting("fontSize", s.id)}
                        style={{
                          background: isSelected ? "var(--crimson-500)" : "rgba(255, 255, 255, 0.04)",
                          color: isSelected ? "#ffffff" : "var(--text-secondary)",
                          border: isSelected ? "none" : "1px solid var(--border-subtle)",
                          borderRadius: "8px",
                          padding: "0.6rem 0.2rem",
                          cursor: "pointer",
                          textAlign: "center"
                        }}
                      >
                        <div style={{ fontSize: "0.82rem", fontWeight: 700 }}>{s.label}</div>
                        <div style={{ fontSize: "0.68rem", opacity: 0.8 }}>{s.scale}</div>
                      </button>
                    );
                  })}
                </div>

                {/* Live Typography Preview Box */}
                <div style={{
                  background: "rgba(0, 0, 0, 0.1)",
                  border: "1px dashed var(--border-hover)",
                  borderRadius: "10px",
                  padding: "1rem",
                  textAlign: "center"
                }}>
                  <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", textTransform: "uppercase", marginBottom: "0.3rem" }}>
                    {t("livePreview")}
                  </div>
                  <p style={{ margin: 0, fontWeight: 500, lineHeight: 1.5, fontSize: "0.95rem" }}>
                    {t("livePreviewSample")}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: LOCALIZATION & CURRENCY */}
          {activeTab === "localization" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
              {/* Language Selector */}
              <div>
                <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", marginBottom: "0.6rem" }}>
                  {t("languageSection")}
                </label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.6rem" }}>
                  {[
                    { code: "en", label: "English (EN)", flag: "🇬🇧" },
                    { code: "ta", label: "தமிழ் (Tamil)", flag: "🇮🇳" },
                    { code: "hi", label: "हिन्दी (Hindi)", flag: "🇮🇳" },
                    { code: "fr", label: "Français (FR)", flag: "🇫🇷" }
                  ].map((l) => {
                    const isSelected = language === l.code;
                    return (
                      <button
                        key={l.code}
                        onClick={() => {
                          setLanguage(l.code);
                          playChime("click");
                        }}
                        style={{
                          background: isSelected ? "var(--crimson-light)" : "rgba(255, 255, 255, 0.03)",
                          border: isSelected ? "2px solid var(--crimson-500)" : "1px solid var(--border-subtle)",
                          borderRadius: "10px",
                          padding: "0.75rem",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: "0.6rem",
                          color: isSelected ? "var(--crimson-500)" : "var(--text-secondary)"
                        }}
                      >
                        <span style={{ fontSize: "1.2rem" }}>{l.flag}</span>
                        <span style={{ fontSize: "0.84rem", fontWeight: 600 }}>{l.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Currency Format */}
              <div>
                <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", marginBottom: "0.6rem" }}>
                  {t("currencyDisplay")}
                </label>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  {currencies.map((c) => {
                    const isSelected = settings.currency === c.code;
                    return (
                      <div
                        key={c.code}
                        onClick={() => updateSetting("currency", c.code)}
                        style={{
                          background: isSelected ? "var(--crimson-light)" : "rgba(255, 255, 255, 0.03)",
                          border: isSelected ? "2px solid var(--crimson-500)" : "1px solid var(--border-subtle)",
                          borderRadius: "10px",
                          padding: "0.7rem 1rem",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between"
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                          <span style={{ fontSize: "1.2rem", fontWeight: 800, color: "var(--crimson-500)", width: "24px" }}>
                            {c.symbol}
                          </span>
                          <span style={{ fontSize: "0.88rem", fontWeight: 600 }}>
                            {c.name}
                          </span>
                        </div>
                        {isSelected && <span style={{ color: "var(--crimson-500)", fontWeight: 800 }}>✓</span>}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: SENSORY & ACCESSIBILITY */}
          {activeTab === "sensory" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
              {/* Sound Effects */}
              <div style={{
                background: "rgba(255, 255, 255, 0.03)",
                border: "1px solid var(--border-subtle)",
                borderRadius: "12px",
                padding: "1rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between"
              }}>
                <div>
                  <div style={{ fontSize: "0.92rem", fontWeight: 700, color: "var(--crimson-500)" }}>
                    {t("audioChimes")}
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", maxWidth: "260px" }}>
                    {t("audioChimesSub")}
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                  <button
                    onClick={() => playChime("success")}
                    className="btn-outline"
                    style={{ fontSize: "0.72rem", padding: "0.25rem 0.6rem", border: "1px solid var(--border-hover)", borderRadius: "6px" }}
                  >
                    {t("testSound")}
                  </button>
                  <input
                    type="checkbox"
                    checked={settings.soundEnabled}
                    onChange={(e) => updateSetting("soundEnabled", e.target.checked)}
                    style={{ width: "20px", height: "20px", cursor: "pointer", accentColor: "var(--crimson-500)" }}
                  />
                </div>
              </div>

              {/* Reduced Motion */}
              <div style={{
                background: "rgba(255, 255, 255, 0.03)",
                border: "1px solid var(--border-subtle)",
                borderRadius: "12px",
                padding: "1rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between"
              }}>
                <div>
                  <div style={{ fontSize: "0.92rem", fontWeight: 700 }}>
                    {t("reducedMotion")}
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", maxWidth: "260px" }}>
                    {t("reducedMotionSub")}
                  </div>
                </div>

                <input
                  type="checkbox"
                  checked={settings.reducedMotion}
                  onChange={(e) => updateSetting("reducedMotion", e.target.checked)}
                  style={{ width: "20px", height: "20px", cursor: "pointer", accentColor: "var(--crimson-500)" }}
                />
              </div>

              {/* UI Density */}
              <div>
                <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", marginBottom: "0.6rem" }}>
                  {t("layoutDensity")}
                </label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.6rem" }}>
                  <button
                    onClick={() => updateSetting("density", "spacious")}
                    style={{
                      background: settings.density === "spacious" ? "var(--crimson-light)" : "rgba(255, 255, 255, 0.03)",
                      border: settings.density === "spacious" ? "2px solid var(--crimson-500)" : "1px solid var(--border-subtle)",
                      borderRadius: "10px",
                      padding: "0.75rem",
                      cursor: "pointer",
                      textAlign: "left",
                      color: settings.density === "spacious" ? "var(--crimson-500)" : "var(--text-secondary)"
                    }}
                  >
                    <div style={{ fontSize: "0.88rem", fontWeight: 700 }}>{t("spacious")}</div>
                    <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>{t("spaciousSub")}</div>
                  </button>

                  <button
                    onClick={() => updateSetting("density", "compact")}
                    style={{
                      background: settings.density === "compact" ? "var(--crimson-light)" : "rgba(255, 255, 255, 0.03)",
                      border: settings.density === "compact" ? "2px solid var(--crimson-500)" : "1px solid var(--border-subtle)",
                      borderRadius: "10px",
                      padding: "0.75rem",
                      cursor: "pointer",
                      textAlign: "left",
                      color: settings.density === "compact" ? "var(--crimson-500)" : "var(--text-secondary)"
                    }}
                  >
                    <div style={{ fontSize: "0.88rem", fontWeight: 700 }}>{t("compact")}</div>
                    <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>{t("compactSub")}</div>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div style={{
          padding: "1.2rem 1.5rem",
          borderTop: "1px solid var(--border-subtle)",
          background: "rgba(0,0,0,0.15)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        }}>
          <button
            onClick={resetDefaults}
            style={{
              background: "transparent",
              border: "none",
              color: "var(--text-muted)",
              cursor: "pointer",
              fontSize: "0.78rem",
              textDecoration: "underline"
            }}
          >
            {t("resetDefaults")}
          </button>

          <button
            onClick={closeSettings}
            style={{
              background: "var(--berry-gradient)",
              color: "#ffffff",
              border: "none",
              borderRadius: "8px",
              padding: "0.55rem 1.4rem",
              fontSize: "0.86rem",
              fontWeight: 700,
              cursor: "pointer"
            }}
          >
            {t("applyClose")}
          </button>
        </div>
      </div>
    </div>
  );
};
