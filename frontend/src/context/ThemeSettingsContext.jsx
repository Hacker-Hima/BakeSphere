import { createContext, useContext, useState, useEffect } from "react";

const ThemeSettingsContext = createContext();

export const DEFAULT_SETTINGS = {
  // Theme & Appearance
  theme: "bakingo", // "bakingo" | "amber" | "rose" | "emerald" | "espresso" | "sapphire" | "amethyst" | "champagne"
  mode: "light", // "light" | "dark"
  contrast: "normal", // "normal" | "high"
  glassmorphism: true,
  cardRadius: "rounded", // "sharp" | "rounded" | "pill"
  density: "spacious", // "spacious" | "comfortable" | "compact"

  // Typography
  fontSize: "default", // "compact" | "default" | "large" | "xl"
  fontFamily: "normal", // "normal" | "times" | "arial" | "coral" | "playfair" | "inter" | "mono" | "georgia"
  letterSpacing: "normal", // "tight" | "normal" | "wide"

  // Sensory & Audio
  soundEnabled: true,
  soundProfile: "chime", // "chime" | "soft" | "cash_register" | "bubble"
  soundVolume: 75, // 0 - 100
  reducedMotion: false,
  celebrationConfetti: true,

  // Gourmet Ordering Presets
  dietaryPreference: "all", // "all" | "eggless" | "vegan" | "gluten_free" | "nut_free"
  deliveryPreference: "express", // "express" | "standard" | "evening"
  packagingType: "luxury", // "eco_kraft" | "luxury" | "insulated"
  includeCandlesKnife: true,
  autoInvoiceDownload: true,

  // Kitchen & POS Operations
  thermalReceiptWidth: "80mm", // "58mm" | "80mm" | "A4"
  currency: "INR", // "INR" | "USD" | "EUR" | "GBP" | "AED"
  unitSystem: "metric", // "metric" | "imperial"
  kitchenRefreshInterval: 15, // 5 | 15 | 30 | 60

  // Alerts & Notifications
  orderStatusAlerts: true,
  freshBatchAlerts: true,
  promotionalAlerts: false
};

export const FONT_MAP = {
  normal: "'Outfit', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  outfit: "'Outfit', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  playfair: "'Playfair Display', Georgia, 'Times New Roman', serif",
  caveat: "'Caveat', cursive, sans-serif",
  cinzel: "'Cinzel', 'Times New Roman', Georgia, serif",
  pacifico: "'Pacifico', cursive, sans-serif",
  inter: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  mono: "'JetBrains Mono', 'Courier New', Courier, monospace",
  times: "'Times New Roman', Times, 'Playfair Display', Georgia, serif",
  georgia: "Georgia, 'Times New Roman', Times, serif",
  arial: "Arial, 'Helvetica Neue', Helvetica, sans-serif",
  coral: "'Comfortaa', 'Caveat', cursive, sans-serif"
};

export const ThemeSettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState(() => {
    try {
      const saved = localStorage.getItem("bakesphere_settings");
      if (saved) return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
    } catch (e) {
      console.error(e);
    }
    return DEFAULT_SETTINGS;
  });

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settingsActiveTab, setSettingsActiveTab] = useState("appearance");

  // Save settings to localStorage
  useEffect(() => {
    localStorage.setItem("bakesphere_settings", JSON.stringify(settings));
  }, [settings]);

  // Apply theme attributes and font styles to document.documentElement and body
  useEffect(() => {
    const root = document.documentElement;

    // Theme color palette
    root.setAttribute("data-theme", settings.theme || "bakingo");

    // Dark / Light Mode
    root.setAttribute("data-mode", settings.mode || "light");

    // High Contrast Mode
    root.setAttribute("data-contrast", settings.contrast || "normal");

    // Glassmorphism Blur
    root.setAttribute("data-glass", settings.glassmorphism !== false ? "true" : "false");

    // Card Corner Radii
    root.setAttribute("data-radius", settings.cardRadius || "rounded");
    const radiusMap = {
      sharp: "4px",
      rounded: "14px",
      pill: "24px"
    };
    root.style.setProperty("--radius-card", radiusMap[settings.cardRadius] || "14px");

    // Font Family attribute
    root.setAttribute("data-font", settings.fontFamily || "normal");

    // Direct font family injection into CSS variables and body
    const activeFont = FONT_MAP[settings.fontFamily] || FONT_MAP.normal;
    root.style.setProperty("--font-sans", activeFont);
    root.style.setProperty("--font-current", activeFont);
    if (document.body) {
      document.body.style.fontFamily = activeFont;
    }

    // Letter Spacing
    const spacingMap = {
      tight: "-0.015em",
      normal: "0em",
      wide: "0.035em"
    };
    root.style.setProperty("--letter-spacing", spacingMap[settings.letterSpacing] || "0em");

    // UI Density
    root.setAttribute("data-density", settings.density || "spacious");

    // Reduced Motion
    root.setAttribute("data-reduced-motion", settings.reducedMotion ? "true" : "false");

    // Font Scale CSS Variable
    const fontScales = {
      compact: "0.88",
      default: "1.0",
      large: "1.12",
      xl: "1.25"
    };
    root.style.setProperty("--font-scale", fontScales[settings.fontSize] || "1.0");
  }, [settings]);

  // Web Audio Synthesizer for Interactive Sound Effects with profiles & volume
  const playChime = (type = "click") => {
    if (!settings.soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();

      if (ctx.state === "suspended") {
        ctx.resume();
      }

      const volume = Math.max(0.01, Math.min(1, (settings.soundVolume ?? 75) / 100)) * 0.12;
      const now = ctx.currentTime;
      const profile = settings.soundProfile || "chime";

      if (profile === "cash_register") {
        // Classic twin mechanical chime
        [987.77, 1318.51, 1975.53].forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = "sine";
          osc.frequency.setValueAtTime(freq, now + idx * 0.04);
          gain.gain.setValueAtTime(volume * 0.85, now + idx * 0.04);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.04 + 0.28);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + idx * 0.04);
          osc.stop(now + idx * 0.04 + 0.28);
        });
      } else if (profile === "bubble") {
        // Pitch-bend water drop pop
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(320, now);
        osc.frequency.exponentialRampToValueAtTime(980, now + 0.08);
        gain.gain.setValueAtTime(volume, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.1);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.1);
      } else if (profile === "soft") {
        // Soft felt triangle tap
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(380, now);
        gain.gain.setValueAtTime(volume * 0.7, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.04);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.04);
      } else {
        // Default musical chime
        if (type === "success") {
          [523.25, 659.25, 783.99, 1046.5].forEach((freq, idx) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = "sine";
            osc.frequency.setValueAtTime(freq, now + idx * 0.07);
            gain.gain.setValueAtTime(volume * 0.8, now + idx * 0.07);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.07 + 0.35);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(now + idx * 0.07);
            osc.stop(now + idx * 0.07 + 0.35);
          });
        } else {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = "sine";
          osc.frequency.setValueAtTime(520, now);
          osc.frequency.exponentialRampToValueAtTime(740, now + 0.05);
          gain.gain.setValueAtTime(volume, now);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.06);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now);
          osc.stop(now + 0.06);
        }
      }
    } catch (_e) {
      console.warn("Audio chime unavailable:", _e);
    }
  };

  const updateSetting = (key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
    playChime(key === "mode" ? "toggle" : "click");
  };

  const resetDefaults = () => {
    setSettings(DEFAULT_SETTINGS);
    playChime("success");
  };

  const openSettings = (targetTab = "appearance") => {
    if (typeof targetTab === "string") {
      setSettingsActiveTab(targetTab);
    }
    setIsSettingsOpen(true);
    playChime("click");
  };

  const closeSettings = () => {
    setIsSettingsOpen(false);
  };

  // Currency symbols & helper
  const currencySymbols = {
    INR: "₹",
    USD: "$",
    EUR: "€",
    GBP: "£"
  };

  const formatPrice = (amount) => {
    const symbol = currencySymbols[settings.currency] || "₹";
    let converted = amount;
    if (settings.currency === "USD") converted = (amount * 0.012).toFixed(2);
    else if (settings.currency === "EUR") converted = (amount * 0.011).toFixed(2);
    else if (settings.currency === "GBP") converted = (amount * 0.0095).toFixed(2);
    else converted = Number(amount).toLocaleString("en-IN");

    return `${symbol} ${converted}`;
  };

  return (
    <ThemeSettingsContext.Provider
      value={{
        settings,
        updateSetting,
        resetDefaults,
        isSettingsOpen,
        settingsActiveTab,
        setSettingsActiveTab,
        openSettings,
        closeSettings,
        playChime,
        formatPrice,
        currencySymbol: currencySymbols[settings.currency] || "₹"
      }}
    >
      {children}
    </ThemeSettingsContext.Provider>
  );
};

export const useThemeSettings = () => useContext(ThemeSettingsContext);
