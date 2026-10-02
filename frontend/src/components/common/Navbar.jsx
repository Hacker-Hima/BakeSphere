import { useState } from "react";
import { useAuth } from "../../context/AuthContext.jsx";
import { useLanguage } from "../../context/LanguageContext.jsx";
import { useThemeSettings } from "../../context/ThemeSettingsContext.jsx";
import { useRecentlyAccessed } from "../../context/RecentlyAccessedContext.jsx";
import { handleImageError, getSafeImageUrl } from "../../utils/imageFallback.js";
import { NotificationBell } from "./NotificationBell.jsx";

export const Navbar = ({
  activeTab,
  setActiveTab,
  onOpenAuth,
  cartCount = 0,
  cartTotal = 0,
  onOpenCart,
  deliveryCity,
  onOpenCityModal,
  onOpenTracking,
  onOpenHistory
}) => {
  const { currentUser, role, allowedTabs } = useAuth();
  const { t } = useLanguage();
  const { openSettings } = useThemeSettings();
  const { recentItems, clearRecent } = useRecentlyAccessed();

  const allNavLinks = [
    { id: "shop", label: t("navOnlineBakery"), icon: "🍰" },
    { id: "billing", label: t("navBilling"), icon: "🧾" },
    { id: "pos", label: t("navPosBilling"), icon: "🛒" },
    { id: "custom-cake", label: t("nav3dCakeStudio"), icon: "🎂" },
    { id: "production", label: t("navRecipeScaler"), icon: "🧑‍🍳" },
    { id: "inventory", label: t("navFefoInventory"), icon: "⏳" },
    { id: "ai-forecast", label: t("navAiForecaster"), icon: "📈" },
    { id: "dashboard", label: t("navExecutiveDashboard"), icon: "📊" },
    { id: "branches", label: t("navBranches"), icon: "🏪" }
  ];

  // RBAC: Filter navigation tabs based on logged-in user's role
  const navLinks = allNavLinks.filter((link) =>
    allowedTabs && allowedTabs.includes(link.id)
  );

  return (
    <header className="bk-header">
      {/* ═══════════════ MAIN WHITE / BRAND NAVBAR ═══════════════ */}
      <div className="bk-main-nav">
        <div className="bk-main-nav-inner">
          {/* Left: Brand Logo & Location Pill */}
          <div className="bk-header-left">
            <div
              className="bk-brand-logo"
              onClick={() => setActiveTab("shop")}
            >
              <div className="bk-logo-badge-frame">
                <img
                  src="/logo.png"
                  alt="BakeSphere Artisan Bakery"
                  className="bk-logo-img"
                />
              </div>
              <div className="bk-logo-text-group">
                <span className="bk-logo-main">BakeSphere</span>
                <span className="bk-logo-tagline">{t("tagline")}</span>
              </div>
            </div>

            {/* Delivery Location & Pincode Pill */}
            <div
              className="bk-location-selector-btn"
              onClick={onOpenCityModal}
              title="Click to switch delivery city or pincode"
            >
              <span className="bk-location-pin-icon">📍</span>
              <div className="bk-location-details">
                <span className="bk-location-micro">{t("deliverTo")}</span>
                <span className="bk-location-current">
                  <strong>{deliveryCity?.name || "Chennai"}</strong>
                  {deliveryCity?.pincode ? ` - ${deliveryCity.pincode}` : ""}
                  <span className="bk-location-chevron">▾</span>
                </span>
              </div>
            </div>
          </div>

          {/* Right Action Icons & Tools */}
          <div className="bk-header-actions">
            {/* Live Visual Kitchen Order Tracker Button */}
            <button
              type="button"
              className="bk-nav-action-pill-btn"
              onClick={onOpenTracking}
              title="Track Active Bakery Order & Cold-Chain Live"
              id="bk-nav-track-order-btn"
            >
              <span className="bk-nav-action-icon">🛵</span>
              <span className="bk-nav-action-label">Track</span>
            </button>

            {/* My Orders & Receipts Archive Button */}
            <button
              type="button"
              className="bk-nav-action-pill-btn"
              onClick={onOpenHistory}
              title="Order History & Tax Invoice Archive"
              id="bk-nav-order-history-btn"
            >
              <span className="bk-nav-action-icon">📦</span>
              <span className="bk-nav-action-label">Orders</span>
            </button>

            {/* Real-Time Notification Bell & Invoices */}
            <NotificationBell />

            {/* User Profile Mini Badge (Opens Settings) */}
            {currentUser ? (
              <div
                className="bk-user-profile-btn"
                onClick={() => openSettings("account")}
                title="Account Settings & Profile"
              >
                <img
                  src={getSafeImageUrl(currentUser.avatar)}
                  alt={currentUser.name}
                  className="bk-profile-avatar"
                  onError={handleImageError}
                />
                <div className="bk-profile-info">
                  <span className="bk-profile-name">{currentUser.name?.split(" ")[0]}</span>
                  <span className="bk-profile-role-pill">{currentUser.roleLabel || role}</span>
                </div>
              </div>
            ) : (
              <button
                type="button"
                className="bk-btn-login-nav"
                onClick={onOpenAuth || (() => setActiveTab("login"))}
              >
                🔑 {t("signIn")}
              </button>
            )}

            {/* TOP-RIGHT CORNER SETTINGS & MENU BUTTON (PROFESSIONAL 3-LINE HAMBURGER) */}
            <button
              type="button"
              className="bk-nav-hamburger-btn bk-settings-corner-btn"
              onClick={openSettings}
              title="Settings & Menu (Theme, Language, Roles, Fonts)"
              id="bk-settings-top-corner-btn"
              aria-label="Settings and Menu"
            >
              <span className="bk-hamburger-line"></span>
              <span className="bk-hamburger-line"></span>
              <span className="bk-hamburger-line"></span>
            </button>
          </div>
        </div>
      </div>

      {/* ═══════════════ CATEGORY STRIP / NAVIGATION BAR ═══════════════ */}
      <div className="bk-nav-strip">
        <div className="bk-nav-strip-inner">
          <nav className="bk-nav-links">
            {navLinks.map((link) => {
              const isActive = activeTab === link.id;
              return (
                <button
                  key={link.id}
                  className={`bk-nav-link ${isActive ? "bk-nav-link--active" : ""}`}
                  onClick={() => setActiveTab(link.id)}
                >
                  <span className="bk-nav-icon">{link.icon}</span>
                  <span className="bk-nav-title">{link.label}</span>
                  {link.id === "shop" && <span className="bk-hot-badge">{t("popular")}</span>}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* ═══════════════ RECENTLY ACCESSED QUICK BAR ═══════════════ */}
      {recentItems && recentItems.length > 0 && (
        <div className="bk-recently-accessed-bar">
          <span className="bk-recent-label">⏱️ {t("recentItems") || "Recently Accessed:"}</span>
          <div className="bk-recent-pills">
            {recentItems.slice(0, 5).map((item) => (
              <button
                key={item.id}
                type="button"
                className="bk-recent-pill"
                onClick={() => setActiveTab(item.tab || item.id)}
                title={`Quick jump to ${item.label}`}
              >
                <span>{item.icon || "📌"}</span>
                <span>{item.label}</span>
              </button>
            ))}
            <button
              type="button"
              className="bk-recent-clear-btn"
              onClick={clearRecent}
              title="Clear recently accessed history"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
