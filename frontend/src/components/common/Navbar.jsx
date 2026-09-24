import { useState } from "react";
import { useAuth } from "../../context/AuthContext.jsx";
import { useLanguage } from "../../context/LanguageContext.jsx";
import { useThemeSettings } from "../../context/ThemeSettingsContext.jsx";
import { handleImageError, getSafeImageUrl } from "../../utils/imageFallback.js";

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
  setSearchQuery
}) => {
  const { currentUser, role, switchDemoRole, logout, allowedTabs } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const { openSettings } = useThemeSettings();
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);

  const demoRoles = [
    { role: "customer", label: "Customer (Bakingo Store)", icon: "🛍️", email: "customer@bakesphere.com" },
    { role: "super_admin", label: "Super Admin (All Access)", icon: "👑", email: "admin@bakesphere.com" },
    { role: "bakery_owner", label: "Bakery Owner", icon: "💼", email: "owner@bakesphere.com" },
    { role: "manager", label: "Branch Manager", icon: "📋", email: "manager@bakesphere.com" },
    { role: "head_baker", label: "Head Baker", icon: "🧑‍🍳", email: "baker@bakesphere.com" },
    { role: "cashier", label: "POS Cashier", icon: "🛒", email: "cashier@bakesphere.com" }
  ];

  const allNavLinks = [
    { id: "shop", label: t("navOnlineBakery"), icon: "🍰" },
    { id: "pos", label: t("navPosBilling"), icon: "🛒" },
    { id: "custom-cake", label: t("nav3dCakeStudio"), icon: "🎂" },
    { id: "production", label: t("navRecipeScaler"), icon: "🧑‍🍳" },
    { id: "inventory", label: t("navFefoInventory"), icon: "⏳" },
    { id: "ai-forecast", label: t("navAiForecaster"), icon: "📈" },
    { id: "dashboard", label: t("navExecutiveDashboard"), icon: "📊" },
    { id: "branches", label: t("navBranches"), icon: "🏪" },
    { id: "api-docs", label: t("navApiDocs"), icon: "⚡" }
  ];

  // RBAC: Filter navigation tabs based on logged-in user's role
  const navLinks = allNavLinks.filter((link) =>
    allowedTabs && allowedTabs.includes(link.id)
  );

  const handleRoleSelect = (r) => {
    switchDemoRole(r);
    setRoleMenuOpen(false);
  };

  const quickSearchTags = ["Chocolate Truffle", "Red Velvet", "Jar Cakes", "Cupcakes", "Cheesecake", "Pinata"];

  return (
    <header className="bk-header">
      {/* ═══════════════ MAIN WHITE / BRAND NAVBAR ═══════════════ */}
      <div className="bk-main-nav">
        <div className="bk-main-nav-inner">
          {/* Brand Logo with Bakingo aesthetic */}
          <div
            className="bk-brand-logo"
            onClick={() => setActiveTab("shop")}
          >
            <span className="bk-logo-mark">🥐</span>
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

          {/* Live Search Bar */}
          <div className="bk-search-box-wrapper">
            <div className={`bk-search-box ${searchFocused ? "bk-search-box--focused" : ""}`}>
              <span className="bk-search-icon">🔍</span>
              <input
                type="text"
                className="bk-search-field"
                placeholder={t("searchPlaceholderNav")}
                value={searchQuery || ""}
                onChange={(e) => setSearchQuery && setSearchQuery(e.target.value)}
                onFocus={() => {
                  setSearchFocused(true);
                  if (activeTab !== "shop") setActiveTab("shop");
                }}
                onBlur={() => setTimeout(() => setSearchFocused(false), 200)}
              />
              {searchQuery && (
                <button
                  type="button"
                  className="bk-search-clear"
                  onClick={() => setSearchQuery && setSearchQuery("")}
                >
                  ✕
                </button>
              )}
            </div>

            {/* Quick Search Tag Suggestions Dropdown on Focus */}
            {searchFocused && (
              <div className="bk-search-suggestions">
                <span className="bk-suggestions-label">{t("trendingSearches")}</span>
                <div className="bk-suggestions-chips">
                  {quickSearchTags.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      className="bk-suggestion-chip"
                      onMouseDown={() => {
                        if (setSearchQuery) setSearchQuery(tag);
                        if (activeTab !== "shop") setActiveTab("shop");
                      }}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Action Icons & Tools */}
          <div className="bk-header-actions">
            {/* Express Delivery Badge */}
            <div className="bk-express-tag">
              <span className="bk-lightning">⚡</span>
              <span>{t("twoHourDelivery")}</span>
            </div>

            {/* Cart Button with Count & Subtotal */}
            <button
              type="button"
              className="bk-cart-trigger-btn"
              onClick={onOpenCart}
            >
              <span className="bk-cart-icon">🛒</span>
              <div className="bk-cart-btn-text">
                <span className="bk-cart-label">{t("cart")}</span>
                <span className="bk-cart-price">₹{cartTotal}</span>
              </div>
              {cartCount > 0 && (
                <span className="bk-cart-counter-badge">{cartCount}</span>
              )}
            </button>

            {/* 1-Click Role Switcher */}
            <div
              className="bk-action-tool"
              onClick={() => setRoleMenuOpen(!roleMenuOpen)}
              title="1-Click Role Switcher for Mentor Testing"
            >
              <span className="bk-tool-icon">🔄</span>
              <span className="bk-tool-label">{t("roles")}</span>
            </div>

            {/* Settings */}
            <div
              className="bk-action-tool"
              onClick={openSettings}
              title="Theme Settings & Preferences"
            >
              <span className="bk-tool-icon">⚙️</span>
              <span className="bk-tool-label">{t("settings")}</span>
            </div>

            {/* Language Selector */}
            <div className="bk-lang-wrapper">
              <select
                className="bk-lang-dropdown"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
              >
                <option value="en">EN</option>
                <option value="ta">தமிழ்</option>
                <option value="hi">हिन्दी</option>
                <option value="fr">FR</option>
              </select>
            </div>

            {/* User Profile / Auth */}
            {currentUser ? (
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <div
                  className="bk-user-profile-btn"
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  title="Click to view profile options"
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
                <button
                  type="button"
                  onClick={logout}
                  className="bk-btn-signout-nav"
                  title="Sign Out to Standalone Login Portal"
                  style={{
                    background: "#fee2e2",
                    color: "#b91c1c",
                    border: "1px solid #fca5a5",
                    borderRadius: "8px",
                    padding: "0.45rem 0.8rem",
                    fontSize: "0.82rem",
                    fontWeight: 700,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.35rem",
                    transition: "all 0.15s ease",
                    whiteSpace: "nowrap"
                  }}
                >
                  <span>🚪</span>
                  <span>{t("signOut")}</span>
                </button>
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

      {/* ═══════════════ ROLE SWITCHER DROPDOWN ═══════════════ */}
      {roleMenuOpen && (
        <div className="bk-dropdown-overlay" onClick={() => setRoleMenuOpen(false)}>
          <div className="bk-dropdown bk-dropdown-role" onClick={(e) => e.stopPropagation()}>
            <div className="bk-dropdown-header">
              <span>⚡ 1-Click Role Switcher</span>
              <button className="bk-dropdown-close" onClick={() => setRoleMenuOpen(false)}>✕</button>
            </div>
            <div className="bk-dropdown-body">
              {demoRoles.map((item) => (
                <div
                  key={item.role}
                  className={`bk-dropdown-item ${currentUser && currentUser.role === item.role ? "bk-dropdown-item--active" : ""}`}
                  onClick={() => handleRoleSelect(item.role)}
                >
                  <span className="bk-dropdown-item-icon">{item.icon}</span>
                  <div className="bk-dropdown-item-info">
                    <div className="bk-dropdown-item-label">{item.label}</div>
                    <div className="bk-dropdown-item-email">{item.email}</div>
                  </div>
                  {currentUser && currentUser.role === item.role && (
                    <span className="bk-dropdown-item-check">✓</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════ USER MENU DROPDOWN ═══════════════ */}
      {userMenuOpen && currentUser && (
        <div className="bk-dropdown-overlay" onClick={() => setUserMenuOpen(false)}>
          <div className="bk-dropdown bk-dropdown-user" onClick={(e) => e.stopPropagation()}>
            <div className="bk-dropdown-header">
              <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                <img
                  src={getSafeImageUrl(currentUser.avatar)}
                  alt=""
                  className="bk-profile-avatar"
                  onError={handleImageError}
                />
                <div>
                  <div style={{ fontWeight: 700, fontSize: "0.9rem" }}>{currentUser.name}</div>
                  <div style={{ fontSize: "0.72rem", color: "#666" }}>{currentUser.email}</div>
                </div>
              </div>
              <button className="bk-dropdown-close" onClick={() => setUserMenuOpen(false)}>✕</button>
            </div>
            <div className="bk-dropdown-body">
              <div className="bk-dropdown-item" style={{ color: "var(--crimson-500)", background: "#fff5f5" }}>
                <span style={{ fontSize: "0.9rem" }}>🏷️</span>
                <div className="bk-dropdown-item-info">
                  <div className="bk-dropdown-item-label" style={{ color: "var(--crimson-600)", fontWeight: 700 }}>
                    Active: {currentUser.roleLabel || role}
                  </div>
                  <div style={{ fontSize: "0.7rem", color: "#666" }}>Permitted: {allowedTabs?.join(", ")}</div>
                </div>
              </div>
              <div
                className="bk-dropdown-item"
                onClick={() => { setActiveTab("login"); setUserMenuOpen(false); }}
                style={{ background: "#fdf2f4" }}
              >
                <span style={{ fontSize: "0.9rem" }}>🔑</span>
                <div className="bk-dropdown-item-info">
                  <div className="bk-dropdown-item-label" style={{ fontWeight: 700, color: "var(--crimson-600)" }}>
                    Staff & Role Login Portal
                  </div>
                  <div style={{ fontSize: "0.7rem", color: "#666" }}>Switch IDs & Passwords</div>
                </div>
              </div>
              <div className="bk-dropdown-item" onClick={() => { setActiveTab("shop"); setUserMenuOpen(false); }}>
                <span style={{ fontSize: "0.9rem" }}>🍰</span>
                <div className="bk-dropdown-item-info">
                  <div className="bk-dropdown-item-label">Bakingo Online Store</div>
                </div>
              </div>
              <div className="bk-dropdown-item" onClick={() => { setActiveTab("pos"); setUserMenuOpen(false); }}>
                <span style={{ fontSize: "0.9rem" }}>🛒</span>
                <div className="bk-dropdown-item-info">
                  <div className="bk-dropdown-item-label">POS Cashier Terminal</div>
                </div>
              </div>
              <div className="bk-dropdown-item" onClick={openSettings}>
                <span style={{ fontSize: "0.9rem" }}>⚙️</span>
                <div className="bk-dropdown-item-info">
                  <div className="bk-dropdown-item-label">Customization Settings</div>
                </div>
              </div>
              <div
                className="bk-dropdown-item bk-dropdown-item--danger"
                onClick={() => { logout(); setUserMenuOpen(false); }}
              >
                <span style={{ fontSize: "0.9rem" }}>🚪</span>
                <div className="bk-dropdown-item-info">
                  <div className="bk-dropdown-item-label">Sign Out</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
