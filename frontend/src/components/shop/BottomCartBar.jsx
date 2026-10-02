import React from "react";
import { useLanguage } from "../../context/LanguageContext";

/**
 * BottomCartBar
 * Ultra-sleek, compact floating cart pill anchored cleanly at the bottom center.
 */
export const BottomCartBar = ({
  cartCount = 0,
  cartTotal = 0,
  onOpenCart
}) => {
  const { t } = useLanguage();

  if (!cartCount || cartCount === 0) return null;

  return (
    <div
      className="bk-floating-cart-bar"
      onClick={onOpenCart}
      role="button"
      tabIndex={0}
      title="Click to view cart and checkout"
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpenCart();
        }
      }}
    >
      <div className="bk-floating-cart-inner">
        {/* Left: Cart icon + Count badge + Price summary */}
        <div className="bk-floating-cart-left">
          <div className="bk-floating-cart-icon-wrap">
            <span className="bk-floating-cart-icon">🛒</span>
            <span className="bk-floating-cart-count-badge">{cartCount}</span>
          </div>
          <div className="bk-floating-cart-info">
            <span className="bk-floating-cart-count-text">
              {cartCount} {cartCount === 1 ? "item" : "items"}
            </span>
            <span className="bk-floating-cart-dot">•</span>
            <strong className="bk-floating-cart-total-price">₹{cartTotal}</strong>
          </div>
        </div>

        {/* Right: View Cart Button */}
        <div className="bk-floating-cart-btn-cta">
          <span>{t("cart") || "View Cart"}</span>
          <span className="bk-floating-cart-arrow">→</span>
        </div>
      </div>
    </div>
  );
};
