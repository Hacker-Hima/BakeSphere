import { useState, useEffect } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext.jsx";
import { LanguageProvider } from "./context/LanguageContext.jsx";
import { RecentlyAccessedProvider, useRecentlyAccessed } from "./context/RecentlyAccessedContext.jsx";
import { ThemeSettingsProvider, useThemeSettings } from "./context/ThemeSettingsContext.jsx";

import { Navbar } from "./components/common/Navbar.jsx";
import { ChatbotModal } from "./components/common/ChatbotModal.jsx";
import { AuthModal } from "./components/auth/AuthModal.jsx";
import { AuthPortal } from "./components/auth/AuthPortal.jsx";
import { SettingsDrawer } from "./components/common/SettingsDrawer.jsx";
import { DashboardHome } from "./components/analytics/DashboardHome.jsx";
import { PosTerminal } from "./components/pos/PosTerminal.jsx";
import { CakeBuilder } from "./components/customCake/CakeBuilder.jsx";
import { RecipeScaler } from "./components/production/RecipeScaler.jsx";
import { StockManager } from "./components/inventory/StockManager.jsx";
import { AiForecastStudio } from "./components/analytics/AiForecastStudio.jsx";
import { ApiPlayground } from "./components/apiExplorer/ApiPlayground.jsx";
import { BranchManager } from "./components/branches/BranchManager.jsx";

import { BakingoStorefront } from "./components/shop/BakingoStorefront.jsx";
import { CartDrawer } from "./components/shop/CartDrawer.jsx";
import { QuickViewModal } from "./components/shop/QuickViewModal.jsx";
import { CitySelectorModal } from "./components/shop/CitySelectorModal.jsx";

const AppContent = () => {
  const { currentUser, allowedTabs, hasPermission, role } = useAuth();
  const { playChime } = useThemeSettings();
  const [activeTab, setActiveTab] = useState("login");
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [cityModalOpen, setCityModalOpen] = useState(false);
  const [cartDrawerOpen, setCartDrawerOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const [deliveryCity, setDeliveryCity] = useState(() => {
    try {
      const saved = localStorage.getItem("bakesphere_city");
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return { name: "Chennai", pincode: "600017", state: "Tamil Nadu", tag: "Primary Hub" };
  });

  // Persistent shopping cart
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem("bakesphere_cart");
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return [];
  });

  useEffect(() => {
    try {
      localStorage.setItem("bakesphere_cart", JSON.stringify(cart));
    } catch {
      // ignore
    }
  }, [cart]);

  useEffect(() => {
    try {
      localStorage.setItem("bakesphere_city", JSON.stringify(deliveryCity));
    } catch {
      // ignore
    }
  }, [deliveryCity]);

  const { addRecentItem } = useRecentlyAccessed();

  // If role changes, ensure activeTab is valid for current role
  useEffect(() => {
    if (currentUser && allowedTabs && allowedTabs.length > 0) {
      const defaultTabsByRole = {
        super_admin: "dashboard",
        bakery_owner: "dashboard",
        manager: "dashboard",
        head_baker: "production",
        chef: "production",
        cashier: "pos",
        customer: "shop"
      };
      const preferred = defaultTabsByRole[currentUser.role];
      if (activeTab === "login" || !allowedTabs.includes(activeTab)) {
        setActiveTab(preferred && allowedTabs.includes(preferred) ? preferred : allowedTabs[0]);
      }
    }
  }, [currentUser, allowedTabs, activeTab]);

  const handleTabChange = (tabId) => {
    if (!hasPermission(tabId)) {
      return;
    }
    playChime("click");
    setActiveTab(tabId);

    const tabMeta = {
      shop: { label: "Online Bakery", icon: "🍰" },
      dashboard: { label: "Executive Dashboard", icon: "📊" },
      pos: { label: "POS Billing", icon: "🛒" },
      "custom-cake": { label: "3D Cake Studio", icon: "🎂" },
      production: { label: "Production & Scaler", icon: "🧑‍🍳" },
      inventory: { label: "FEFO Inventory", icon: "⏳" },
      "ai-forecast": { label: "AI Forecaster", icon: "📈" },
      "api-docs": { label: "API Explorer", icon: "⚡" },
      branches: { label: "Branches & Assets", icon: "🏪" }
    };
    if (tabMeta[tabId]) {
      addRecentItem({
        id: tabId,
        label: tabMeta[tabId].label,
        type: "module",
        tab: tabId,
        icon: tabMeta[tabId].icon
      });
    }
  };

  // Cart operations
  const handleAddToCart = (productWithOpts) => {
    playChime("success");
    setCart((prev) => {
      const weightKey = productWithOpts.selectedWeight || productWithOpts.weight;
      const existingIndex = prev.findIndex(
        (item) => item.id === productWithOpts.id && (item.selectedWeight || item.weight) === weightKey
      );

      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + 1
        };
        return updated;
      }

      return [
        ...prev,
        {
          ...productWithOpts,
          quantity: 1,
          selectedWeight: weightKey
        }
      ];
    });
  };

  const handleUpdateQuantity = (productId, delta, weightKey) => {
    setCart((prev) =>
      prev
        .map((item) => {
          const itemWeight = item.selectedWeight || item.weight;
          if (item.id === productId && (!weightKey || itemWeight === weightKey)) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean)
    );
  };

  const handleRemoveItem = (productId, weightKey) => {
    setCart((prev) =>
      prev.filter(
        (item) => !(item.id === productId && (item.selectedWeight || item.weight) === weightKey)
      )
    );
  };

  const handleClearCart = () => {
    setCart([]);
  };

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cart.reduce((sum, item) => sum + (item.sellingPrice || item.price) * item.quantity, 0);

  // When the site loads first without an active session, show ONLY the sign-in page and nothing else
  if (!currentUser) {
    return (
      <div className="bk-app-root">
        <AuthPortal onNavigateTab={(tabId) => setActiveTab(tabId)} />
      </div>
    );
  }

  return (
    <div className="bk-app-root">
      {/* Bakingo-Style Modern Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={handleTabChange}
        onOpenAuth={() => setAuthModalOpen(true)}
        cartCount={cartCount}
        cartTotal={cartTotal}
        onOpenCart={() => setCartDrawerOpen(true)}
        deliveryCity={deliveryCity}
        onOpenCityModal={() => setCityModalOpen(true)}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      {/* Main View Container */}
      <main className="bk-main-viewport">
        {/* Bakingo Online Storefront */}
        {hasPermission("shop") && activeTab === "shop" && (
          <BakingoStorefront
            onOpenQuickView={(p) => setQuickViewProduct(p)}
            onAddToCart={handleAddToCart}
            cart={cart}
            onUpdateQuantity={handleUpdateQuantity}
            onOpenCart={() => setCartDrawerOpen(true)}
            onNavigateTab={handleTabChange}
            searchQuery={searchQuery}
            deliveryCity={deliveryCity}
          />
        )}

        {/* Existing ERP Modules with Consistent Bakingo Polish */}
        {hasPermission("dashboard") && activeTab === "dashboard" && (
          <div className="bk-erp-container">
            <DashboardHome onNavigateTab={handleTabChange} />
          </div>
        )}

        {hasPermission("pos") && activeTab === "pos" && (
          <div className="bk-erp-container">
            <PosTerminal />
          </div>
        )}

        {hasPermission("custom-cake") && activeTab === "custom-cake" && (
          <div className="bk-erp-container">
            <CakeBuilder />
          </div>
        )}

        {hasPermission("production") && activeTab === "production" && (
          <div className="bk-erp-container">
            <RecipeScaler />
          </div>
        )}

        {hasPermission("inventory") && activeTab === "inventory" && (
          <div className="bk-erp-container">
            <StockManager />
          </div>
        )}

        {hasPermission("ai-forecast") && activeTab === "ai-forecast" && (
          <div className="bk-erp-container">
            <AiForecastStudio />
          </div>
        )}

        {hasPermission("api-docs") && activeTab === "api-docs" && (
          <div className="bk-erp-container">
            <ApiPlayground />
          </div>
        )}

        {hasPermission("branches") && activeTab === "branches" && (
          <div className="bk-erp-container">
            <BranchManager />
          </div>
        )}

        {/* Staff & Role Login Portal */}
        {activeTab === "login" && (
          <AuthPortal onNavigateTab={handleTabChange} />
        )}

        {/* Fallback Access Denied Screen */}
        {!hasPermission(activeTab) && activeTab !== "login" && (
          <div className="bk-access-denied-card">
            <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🚫</div>
            <h2 style={{ fontSize: "1.8rem", color: "var(--crimson-500)", marginBottom: "0.5rem" }}>
              Access Restricted
            </h2>
            <p style={{ color: "var(--text-secondary)", marginBottom: "1.5rem" }}>
              Your current role (<strong>{currentUser?.roleLabel || role}</strong>) does not have authorization to view this module.
            </p>
            <button
              onClick={() => setActiveTab("shop")}
              className="bk-btn-hero-primary"
            >
              Return to Bakingo Online Store
            </button>
          </div>
        )}
      </main>

      {/* Quick View Product Modal */}
      <QuickViewModal
        product={quickViewProduct}
        isOpen={Boolean(quickViewProduct)}
        onClose={() => setQuickViewProduct(null)}
        onAddToCart={handleAddToCart}
        onOpenCart={() => setCartDrawerOpen(true)}
      />

      {/* Slide-out Cart Drawer */}
      <CartDrawer
        isOpen={cartDrawerOpen}
        onClose={() => setCartDrawerOpen(false)}
        cart={cart}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onClearCart={handleClearCart}
        deliveryCity={deliveryCity?.name}
      />

      {/* Delivery City Selector Modal */}
      <CitySelectorModal
        isOpen={cityModalOpen}
        onClose={() => setCityModalOpen(false)}
        currentCity={deliveryCity}
        onSelectCity={(city) => setDeliveryCity(city)}
      />

      {/* Global AI Chatbot: Chef Pierre */}
      <ChatbotModal onNavigateTab={handleTabChange} />

      {/* Dual OAuth & JWT Login Modal */}
      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />

      {/* Customization Settings Drawer */}
      <SettingsDrawer />
    </div>
  );
};

export default function App() {
  return (
    <LanguageProvider>
      <ThemeSettingsProvider>
        <RecentlyAccessedProvider>
          <AuthProvider>
            <AppContent />
          </AuthProvider>
        </RecentlyAccessedProvider>
      </ThemeSettingsProvider>
    </LanguageProvider>
  );
}
