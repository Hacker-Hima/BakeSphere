import { createContext, useContext, useState, useEffect } from "react";

const ThemeSettingsContext = createContext();

const DEFAULT_SETTINGS = {
  theme: "bakingo", // "bakingo" | "amber" | "rose" | "emerald" | "espresso"
  mode: "light", // "light" | "dark"
  fontSize: "default", // "compact" | "default" | "large" | "xl"
  fontFamily: "normal", // "normal" | "times" | "arial" | "coral" | "playfair" | "inter" | "mono" | "georgia"
  soundEnabled: true,
  reducedMotion: false,
  density: "spacious", // "spacious" | "compact"
  currency: "INR" // "INR" | "USD" | "EUR" | "GBP"
};

export const FONT_MAP = {
  normal: "'Outfit', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  outfit: "'Outfit', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  times: "'Times New Roman', Times, 'Playfair Display', Georgia, serif",
  arial: "Arial, 'Helvetica Neue', Helvetica, sans-serif",
  coral: "'Comfortaa', 'Caveat', cursive, sans-serif",
  playfair: "'Playfair Display', Georgia, serif",
  inter: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  mono: "'JetBrains Mono', 'Courier New', Courier, monospace",
  georgia: "Georgia, 'Times New Roman', Times, serif"
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

  // Save settings to localStorage
  useEffect(() => {
    localStorage.setItem("bakesphere_settings", JSON.stringify(settings));
  }, [settings]);

  // Apply theme attributes and font styles to document.documentElement and body
  useEffect(() => {
    const root = document.documentElement;

    // Theme color palette
    root.setAttribute("data-theme", settings.theme);

    // Dark / Light Mode
    root.setAttribute("data-mode", settings.mode);

    // Font Family attribute
    root.setAttribute("data-font", settings.fontFamily);

    // Direct font family injection into CSS variables and body
    const activeFont = FONT_MAP[settings.fontFamily] || FONT_MAP.normal;
    root.style.setProperty("--font-sans", activeFont);
    root.style.setProperty("--font-current", activeFont);
    if (document.body) {
      document.body.style.fontFamily = activeFont;
    }

    // UI Density
    root.setAttribute("data-density", settings.density);

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

  // Web Audio Synthesizer for Interactive Sound Effects (Zero External Asset Dependencies)
  const playChime = (type = "click") => {
    if (!settings.soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();

      if (ctx.state === "suspended") {
        ctx.resume();
      }

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      const now = ctx.currentTime;

      if (type === "click") {
        osc.type = "sine";
        osc.frequency.setValueAtTime(480, now);
        osc.frequency.exponentialRampToValueAtTime(720, now + 0.05);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
        osc.start(now);
        osc.stop(now + 0.05);
      } else if (type === "success") {
        osc.type = "triangle";
        osc.frequency.setValueAtTime(523.25, now); // C5
        osc.frequency.setValueAtTime(659.25, now + 0.08); // E5
        osc.frequency.setValueAtTime(783.99, now + 0.16); // G5
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
        osc.start(now);
        osc.stop(now + 0.35);
      } else if (type === "toggle") {
        osc.type = "sine";
        osc.frequency.setValueAtTime(settings.mode === "dark" ? 600 : 400, now);
        osc.frequency.exponentialRampToValueAtTime(settings.mode === "dark" ? 750 : 550, now + 0.08);
        gain.gain.setValueAtTime(0.07, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
        osc.start(now);
        osc.stop(now + 0.08);
      } else {
        // Switch tab / navigate
        osc.type = "sine";
        osc.frequency.setValueAtTime(580, now);
        gain.gain.setValueAtTime(0.05, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
        osc.start(now);
        osc.stop(now + 0.06);
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

  const openSettings = () => {
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
