import { useState } from "react";
import { useAuth } from "../../context/AuthContext.jsx";
import { useLanguage } from "../../context/LanguageContext.jsx";
import { useThemeSettings } from "../../context/ThemeSettingsContext.jsx";
import { useRecentlyAccessed } from "../../context/RecentlyAccessedContext.jsx";
import { handleImageError, getSafeImageUrl } from "../../utils/imageFallback.js";
import { NotificationBell } from "./NotificationBell.jsx";
import { ArtisanLogo } from "./ArtisanLogo.jsx";

export const Navbar = ({
  activeTab,
  setActiveTab,
  onOpenAuth,
  cartCount = 0,
  cartTotal = 0,
  onOpenCart,
  deliveryCity,
  onOpenCityModal,
  searchQuery,
  setSearchQuery,
  onOpenTracking,
  onOpenHistory,
  onOpenBranchFinder
}) => {
  const { currentUser, role, allowedTabs, activeBranchName } = useAuth();
  const { t } = useLanguage();
  const { openSettings, settings } = useThemeSettings();
  const { recentItems, clearRecent } = useRecentlyAccessed();

  const allNavLinks = [
    { id: "shop", label: t("navOnlineBakery"), icon: "🍰" },
    { id: "billing", label: t("navBilling"), icon: "🧾" },
    { id: "bulk-order", label: "Bulk Catering", icon: "📦" },
    { id: "pos", label: t("navPosBilling"), icon: "🛒" },
    { id: "custom-cake", label: t("nav3dCakeStudio"), icon: "🎂" },
    { id: "feedback", label: "Reviews & Ratings", icon: "⭐" },
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
      {/* ═══════════════ MAIN 3-COLUMN NAVBAR: LEFT | CENTER LOGO | RIGHT ═══════════════ */}
      <div className="bk-main-nav">
        <div className="bk-main-nav-inner">

          {/* ── LEFT: Heritage pill + Location ── */}
          <div className="bk-header-left">
            {/* Heritage / Branches pill */}
            <button
              type="button"
              className="bk-nav-action-pill-btn bk-heritage-pill"
              onClick={onOpenBranchFinder}
              title="Find Nearest Bakery Branch & Live Oven Hub on Map"
              id="bk-nav-branch-finder-btn"
            >
              <span className="bk-nav-action-icon">🏛️</span>
              <span className="bk-nav-action-label">Heritage</span>
            </button>

            {/* Delivery Location & Pincode Pill */}
            <div
              className="bk-location-selector-btn"
              onClick={onOpenCityModal}
              title="Click to switch delivery city or pincode"
            >
              <span className="bk-location-pin-icon">📍</span>
              <div className="bk-location-details">
                <span className="bk-location-micro">{t("deliverTo") || "Deliver to"}</span>
                <span className="bk-location-current">
                  <strong>{deliveryCity?.name || "Bangalore"}</strong>
                  {deliveryCity?.pincode ? ` - ${deliveryCity.pincode}` : " - 560001"}
                  <span className="bk-location-chevron">▾</span>
                </span>
              </div>
            </div>
          </div>

          {/* ── CENTER: Brand Logo (perfectly centered) ── */}
          <div className="bk-header-center">
            <div
              className="bk-brand-logo"
              onClick={() => setActiveTab("shop")}
              title="BakeSphere Artisan Bakery - Return to Home"
            >
              <div className="bk-logo-artisan-plaque">
                <img
                  src="/logo-artisan.png"
                  alt="BakeSphere Artisan Bakery"
                  className="bk-logo-artisan-img"
                />
              </div>
            </div>
          </div>

          {/* ── RIGHT: Track, Orders, Bell, Profile, Menu ── */}
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

            {/* Real-Time Notification Bell & Live Alert Center */}
            <NotificationBell onNavigateTab={setActiveTab} />

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

            {/* Settings / Hamburger */}
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
