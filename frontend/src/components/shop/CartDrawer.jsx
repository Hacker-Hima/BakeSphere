import { useState } from "react";
import confetti from "canvas-confetti";
import { handleImageError, getSafeImageUrl } from "../../utils/imageFallback.js";
import { useLanguage } from "../../context/LanguageContext.jsx";

export const CartDrawer = ({
  isOpen,
  onClose,
  cart = [],
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  deliveryCity
}) => {
  const { t } = useLanguage();
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState("");
  const [deliverySlot, setDeliverySlot] = useState("express-2hr");
  const [deliveryPincode, setDeliveryPincode] = useState("600017");
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [placedOrderId, setPlacedOrderId] = useState("");

  if (!isOpen) return null;

  // Subtotal calculation
  const subtotal = cart.reduce((sum, item) => sum + (item.sellingPrice || item.price) * item.quantity, 0);

  // Apply discount
  let discountAmount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.type === "percent") {
      discountAmount = Math.round((subtotal * appliedCoupon.value) / 100);
    } else if (appliedCoupon.type === "flat") {
      discountAmount = Math.min(appliedCoupon.value, subtotal);
    }
  }

  const taxable = Math.max(0, subtotal - discountAmount);
  const gst = Math.round(taxable * 0.05);
  const deliveryFee = subtotal > 499 || subtotal === 0 ? 0 : 49;
  const grandTotal = taxable + gst + deliveryFee;

  const handleApplyCoupon = (codeToApply) => {
    const code = (codeToApply || couponCode).trim().toUpperCase();
    setCouponError("");

    if (code === "SWEET15") {
      setAppliedCoupon({ code: "SWEET15", label: "15% Welcome Discount", type: "percent", value: 15 });
      setCouponCode("SWEET15");
    } else if (code === "BAKE50") {
      setAppliedCoupon({ code: "BAKE50", label: "Flat ₹50 OFF", type: "flat", value: 50 });
      setCouponCode("BAKE50");
    } else {
      setCouponError("Invalid coupon code. Try SWEET15 or BAKE50.");
    }
  };

  const handleCheckout = () => {
    if (cart.length === 0) return;

    // Trigger celebration confetti
    try {
      confetti({
        particleCount: 120,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch {
      // safe fallback
    }

    const newOrderId = `BK-${Date.now().toString().slice(-6)}`;
    setPlacedOrderId(newOrderId);
    setOrderPlaced(true);
    onClearCart();
  };

  return (
    <div className="bk-drawer-backdrop" onClick={onClose}>
      <div className="bk-cart-drawer" onClick={(e) => e.stopPropagation()}>
        {/* Drawer Header */}
        <div className="bk-drawer-header">
          <div className="bk-drawer-title-group">
            <span className="bk-drawer-icon">🛒</span>
            <h3 className="bk-drawer-title">{t("yourCart")}</h3>
            <span className="bk-drawer-count">({cart.reduce((sum, item) => sum + item.quantity, 0)} items)</span>
          </div>
          <button className="bk-drawer-close" onClick={onClose}>✕</button>
        </div>

        {/* Free Delivery Goal Bar */}
        {subtotal > 0 && subtotal < 500 && (
          <div className="bk-delivery-goal-bar">
            <span>Add ₹{500 - subtotal} more for <strong>FREE Express Delivery</strong>!</span>
            <div className="bk-delivery-progress-track">
              <div
                className="bk-delivery-progress-fill"
                style={{ width: `${Math.min(100, (subtotal / 500) * 100)}%` }}
              />
            </div>
          </div>
        )}

        {/* If Order Just Placed Confirmation Screen */}
        {orderPlaced ? (
          <div className="bk-order-success-card">
            <div className="bk-success-icon">🎉</div>
            <h3 className="bk-success-title">Order Confirmed!</h3>
            <p className="bk-success-subtitle">
              Thank you for ordering with BakeSphere. Your freshly baked delights are now in preparation at our {deliveryCity || "Chennai"} patisserie!
            </p>
            <div className="bk-success-order-box">
              <span>Order Tracking ID:</span>
              <strong>{placedOrderId}</strong>
            </div>
            <div className="bk-success-pills">
              <span>⚡ Slot: {deliverySlot === "express-2hr" ? "Express within 2 Hours" : "Selected Slot"}</span>
              <span>📍 Delivering to: {deliveryCity || "Chennai"} - {deliveryPincode}</span>
            </div>
            <button
              className="bk-btn-continue-shopping"
              onClick={() => {
                setOrderPlaced(false);
                onClose();
              }}
            >
              Explore More Cakes 🍰
            </button>
          </div>
        ) : (
          <div className="bk-drawer-body">
            {/* Empty State */}
            {cart.length === 0 ? (
              <div className="bk-cart-empty">
                <div className="bk-cart-empty-emoji">🎂</div>
                <h4>Your cart is hungry!</h4>
                <p>Explore our handcrafted artisanal cakes, jar cakes, and gourmet brownies.</p>
                <button className="bk-btn-empty-shop" onClick={onClose}>
                  Browse Bestsellers
                </button>
              </div>
            ) : (
              <>
                {/* Cart Items List */}
                <div className="bk-cart-items-list">
                  {cart.map((item) => {
                    const price = item.sellingPrice || item.price;
                    return (
                      <div key={`${item.id}-${item.selectedWeight || 'def'}`} className="bk-cart-item-row">
                        <img
                          src={getSafeImageUrl(item.image)}
                          alt={item.name}
                          className="bk-cart-item-img"
                          onError={handleImageError}
                        />
                        <div className="bk-cart-item-info">
                          <div className="bk-cart-item-name">{item.name}</div>
                          {item.selectedWeight && (
                            <div className="bk-cart-item-weight">Weight: {item.selectedWeight}</div>
                          )}
                          {item.cakeMessage && (
                            <div className="bk-cart-item-msg">
                              <span>✍️ "{item.cakeMessage}"</span>
                            </div>
                          )}
                          <div className="bk-cart-item-price">
                            ₹{price * item.quantity}
                            {item.quantity > 1 && (
                              <span className="bk-unit-price"> (₹{price} each)</span>
                            )}
                          </div>
                        </div>

                        {/* Quantity Controls & Remove */}
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "0.3rem" }}>
                          <div className="bk-cart-item-qty">
                            <button
                              type="button"
                              className="bk-qty-btn"
                              onClick={() => onUpdateQuantity(item.id, -1, item.selectedWeight)}
                            >
                              -
                            </button>
                            <span className="bk-qty-num">{item.quantity}</span>
                            <button
                              type="button"
                              className="bk-qty-btn"
                              onClick={() => onUpdateQuantity(item.id, 1, item.selectedWeight)}
                            >
                              +
                            </button>
                          </div>
                          {onRemoveItem && (
                            <button
                              type="button"
                              onClick={() => onRemoveItem(item.id, item.selectedWeight)}
                              style={{ fontSize: "0.7rem", color: "var(--crimson-500)", fontWeight: 600 }}
                            >
                              Remove
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Delivery Slot Selector */}
                <div className="bk-drawer-section">
                  <div className="bk-section-header">
                    <span>📍 Delivery Destination & Slot</span>
                  </div>
                  <div className="bk-pincode-input-group">
                    <input
                      type="text"
                      className="bk-pincode-input"
                      value={deliveryPincode}
                      onChange={(e) => setDeliveryPincode(e.target.value)}
                      placeholder="Enter Delivery Pincode"
                    />
                    <span className="bk-pincode-status">✓ Serviceable</span>
                  </div>

                  <div className="bk-slot-pill-group">
                    <button
                      type="button"
                      className={`bk-slot-pill ${deliverySlot === "express-2hr" ? "bk-slot-pill--active" : ""}`}
                      onClick={() => setDeliverySlot("express-2hr")}
                    >
                      ⚡ 2-Hour Express
                    </button>
                    <button
                      type="button"
                      className={`bk-slot-pill ${deliverySlot === "evening" ? "bk-slot-pill--active" : ""}`}
                      onClick={() => setDeliverySlot("evening")}
                    >
                      🌅 Evening (5-7 PM)
                    </button>
                    <button
                      type="button"
                      className={`bk-slot-pill ${deliverySlot === "midnight" ? "bk-slot-pill--active" : ""}`}
                      onClick={() => setDeliverySlot("midnight")}
                    >
                      🌙 Midnight (11-12 AM)
                    </button>
                  </div>
                </div>

                {/* Promo Code Section */}
                <div className="bk-drawer-section">
                  <div className="bk-section-header">
                    <span>🏷️ Apply Discount Coupon</span>
                  </div>
                  <div className="bk-coupon-input-group">
                    <input
                      type="text"
                      className="bk-coupon-input"
                      placeholder="Enter Coupon Code"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    />
                    <button
                      type="button"
                      className="bk-btn-apply-coupon"
                      onClick={() => handleApplyCoupon()}
                    >
                      Apply
                    </button>
                  </div>

                  {couponError && (
                    <div className="bk-coupon-err">{couponError}</div>
                  )}

                  {appliedCoupon && (
                    <div className="bk-coupon-applied">
                      <span>✓ Applied <strong>{appliedCoupon.code}</strong> (-₹{discountAmount})</span>
                      <button
                        type="button"
                        className="bk-btn-remove-coupon"
                        onClick={() => setAppliedCoupon(null)}
                      >
                        Remove
                      </button>
                    </div>
                  )}

                  {/* Suggestion Chips */}
                  <div className="bk-coupon-chips">
                    <button
                      type="button"
                      className="bk-coupon-chip"
                      onClick={() => handleApplyCoupon("SWEET15")}
                    >
                      🏷️ SWEET15 (15% OFF)
                    </button>
                    <button
                      type="button"
                      className="bk-coupon-chip"
                      onClick={() => handleApplyCoupon("BAKE50")}
                    >
                      🏷️ BAKE50 (₹50 OFF)
                    </button>
                  </div>
                </div>

                {/* Bill Breakdown */}
                <div className="bk-bill-card">
                  <div className="bk-bill-row">
                    <span>{t("subtotal")}</span>
                    <span>₹{subtotal}</span>
                  </div>
                  {discountAmount > 0 && (
                    <div className="bk-bill-row bk-bill-savings">
                      <span>Coupon Discount ({appliedCoupon.code})</span>
                      <span>- ₹{discountAmount}</span>
                    </div>
                  )}
                  <div className="bk-bill-row">
                    <span>GST (5%)</span>
                    <span>₹{gst}</span>
                  </div>
                  <div className="bk-bill-row">
                    <span>{t("deliveryFee")}</span>
                    <span>{deliveryFee === 0 ? <strong className="bk-free-text">{t("free")}</strong> : `₹${deliveryFee}`}</span>
                  </div>
                  <div className="bk-bill-divider" />
                  <div className="bk-bill-row bk-bill-grand-total">
                    <span>{t("totalPayable")}</span>
                    <span>₹{grandTotal}</span>
                  </div>
                  {discountAmount > 0 && (
                    <div className="bk-total-saved-pill">
                      🎉 You are saving ₹{discountAmount} on this order!
                    </div>
                  )}
                </div>

                {/* Checkout Button */}
                <div className="bk-drawer-footer">
                  <button
                    type="button"
                    className="bk-btn-checkout"
                    onClick={handleCheckout}
                  >
                    <span>{t("proceedToCheckout")}</span>
                    <strong>₹{grandTotal} →</strong>
                  </button>
                  <div className="bk-security-note">
                    🔒 256-Bit SSL Encrypted • FSSAI Certified Kitchens
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
