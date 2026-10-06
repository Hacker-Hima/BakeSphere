import { useState } from "react";
import confetti from "canvas-confetti";
import { handleImageError, getSafeImageUrl } from "../../utils/imageFallback.js";
import { useLanguage } from "../../context/LanguageContext.jsx";
import { useNotifications } from "../../context/NotificationContext.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { RazorpayPaymentModal } from "./RazorpayPaymentModal.jsx";

export const CartDrawer = ({
  isOpen,
  onClose,
  cart = [],
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  deliveryCity,
  onTrackOrder
}) => {
  const { t } = useLanguage();
  const { currentUser } = useAuth();
  const { addNotification, openBill } = useNotifications();

  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState("");
  const [deliverySlot, setDeliverySlot] = useState("express-2hr");
  const [deliveryPincode, setDeliveryPincode] = useState("600017");
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [placedOrderId, setPlacedOrderId] = useState("");
  const [lastInvoice, setLastInvoice] = useState(null);

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

  const [isRazorpayOpen, setIsRazorpayOpen] = useState(false);
  const [pendingInvoice, setPendingInvoice] = useState(null);
  const [paymentMode, setPaymentMode] = useState("razorpay"); // "razorpay" | "cod"

  const finalizeOrder = (invoiceData, razorpayDetails = null) => {
    // Trigger celebration confetti
    try {
      confetti({
        particleCount: 140,
        spread: 80,
        origin: { y: 0.6 }
      });
    } catch {
      // safe fallback
    }

    // Save to local invoices list
    try {
      const savedInvoices = JSON.parse(localStorage.getItem("bakesphere_invoices") || "[]");
      localStorage.setItem("bakesphere_invoices", JSON.stringify([invoiceData, ...savedInvoices]));
    } catch (e) {
      console.error(e);
    }

    // Inform backend asynchronously
    fetch("http://localhost:5000/api/pos/online-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(invoiceData)
    }).catch(() => {
      // offline safe
    });

    // Add to user notifications
    addNotification({
      title: razorpayDetails ? "Razorpay Payment Verified! 🛡️" : "Order Placed & Invoiced! 🧾",
      message: razorpayDetails
        ? `Invoice #${invoiceData.invoiceNumber} paid via Razorpay (${razorpayDetails.paymentId})`
        : `Tax Invoice #${invoiceData.invoiceNumber} for ₹${invoiceData.grandTotal} generated.`,
      type: "bill",
      invoice: invoiceData
    });

    setPlacedOrderId(invoiceData.orderId);
    setLastInvoice(invoiceData);
    setOrderPlaced(true);
    setIsRazorpayOpen(false);
    onClearCart();

    // Immediately pop open the Tax Invoice Bill Modal!
    openBill(invoiceData);
  };

  const handleCheckout = () => {
    if (cart.length === 0) return;

    const newOrderId = `BS-${Date.now().toString().slice(-6)}`;
    const invoiceNumber = `INV-${newOrderId}`;
    const now = new Date();
    const deliveryFee = subtotal >= 500 ? 0 : 50;
    const cgst = parseFloat((taxable * 0.025).toFixed(2));
    const sgst = parseFloat((taxable * 0.025).toFixed(2));
    const totalGst = parseFloat((cgst + sgst).toFixed(2));
    const grandTotal = parseFloat((taxable + totalGst + deliveryFee).toFixed(2));

    const invoiceData = {
      orderId: newOrderId,
      invoiceNumber,
      type: "online_delivery",
      storeName: "BAKESPHERE PATISSERIE",
      tagline: "Online Patisserie, Artisanal Viennoiserie & Custom Cakes",
      gstin: "33AABCB1234E1Z0",
      fssaiLicense: "12423008000451",
      branchAddress: "Heritage Main Hub, 42 Venkatnarayana Rd, T. Nagar, Chennai 600017",
      phone: "+91 44 2434 8890",
      customerName: currentUser?.name || "Guest Gourmet",
      customerPhone: currentUser?.phone || "+91 98402 11990",
      customerEmail: currentUser?.email || "guest@bakesphere.com",
      deliveryAddress: `Flat 4B, Heritage Enclave, T. Nagar`,
      deliveryCity: deliveryCity || "Chennai",
      deliveryPincode: deliveryPincode || "600017",
      deliverySlot: deliverySlot === "express-2hr" ? "Express within 2 Hours" : "Standard Scheduled Slot",
      items: cart.map((item) => ({
        productId: item.id,
        name: item.name,
        weight: item.selectedWeight || item.weight || "Regular",
        quantity: item.quantity,
        unitPrice: item.sellingPrice || item.price,
        lineTotal: (item.sellingPrice || item.price) * item.quantity
      })),
      subtotal: parseFloat(subtotal.toFixed(2)),
      discountAmount: parseFloat(discountAmount.toFixed(2)),
      couponCode: appliedCoupon?.code || null,
      deliveryFee,
      taxableAmount: parseFloat(taxable.toFixed(2)),
      cgst,
      sgst,
      totalGst,
      grandTotal,
      paymentMethod: paymentMode === "razorpay" ? "Razorpay (UPI / NetBanking / Cards)" : "Cash on Delivery",
      paymentStatus: paymentMode === "razorpay" ? "PENDING_VERIFICATION" : "PENDING (COD)",
      transactionRef: `TXN-${paymentMode.toUpperCase()}-${Date.now().toString().slice(-8)}`,
      status: "confirmed",
      orderDate: now.toLocaleDateString("en-IN"),
      orderTime: now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
      createdAt: now.toISOString()
    };

    if (paymentMode === "razorpay") {
      setPendingInvoice(invoiceData);
      setIsRazorpayOpen(true);
    } else {
      finalizeOrder(invoiceData);
    }
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
            <h3 className="bk-success-title">Order Confirmed & Billed!</h3>
            <p className="bk-success-subtitle">
              Thank you for ordering with BakeSphere. Your tax invoice has been generated and notified in your notifications.
            </p>
            <div className="bk-success-order-box">
              <span>Order Tracking ID:</span>
              <strong>{placedOrderId}</strong>
            </div>
            <div className="bk-success-pills">
              <span>⚡ Slot: {deliverySlot === "express-2hr" ? "Express within 2 Hours" : "Selected Slot"}</span>
              <span>📍 Delivering to: {deliveryCity || "Chennai"} - {deliveryPincode}</span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem", marginTop: "1rem" }}>
              {lastInvoice && (
                <button
                  type="button"
                  className="bk-btn-checkout"
                  style={{ width: "100%", justifyContent: "center" }}
                  onClick={() => openBill(lastInvoice)}
                >
                  <span>🧾</span>
                  <span>View Tax Invoice & Bill</span>
                </button>
              )}

              {lastInvoice && onTrackOrder && (
                <button
                  type="button"
                  className="bk-btn-checkout"
                  style={{
                    width: "100%",
                    justifyContent: "center",
                    background: "linear-gradient(135deg, #059669 0%, #047857 100%)",
                    boxShadow: "0 4px 14px rgba(5, 150, 105, 0.35)"
                  }}
                  onClick={() => {
                    onTrackOrder(lastInvoice);
                    onClose();
                  }}
                >
                  <span>🛵</span>
                  <span>Track Real-Time Order & Cold-Chain</span>
                </button>
              )}

              <button
                type="button"
                className="bk-btn-continue-shopping"
                onClick={() => {
                  setOrderPlaced(false);
                  onClose();
                }}
              >
                Explore More Cakes 🍰
              </button>
            </div>
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

                {/* Payment Gateway Selector */}
                <div style={{ margin: "0.8rem 0 0.5rem" }}>
                  <label style={{ display: "block", fontSize: "0.74rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", marginBottom: "0.4rem" }}>
                    Select Payment Method:
                  </label>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.45rem" }}>
                    <div
                      onClick={() => setPaymentMode("razorpay")}
                      style={{
                        padding: "0.65rem 0.85rem",
                        borderRadius: "10px",
                        border: paymentMode === "razorpay" ? "2px solid #2563eb" : "1px solid var(--border-subtle)",
                        background: paymentMode === "razorpay" ? "rgba(37, 99, 235, 0.08)" : "rgba(0,0,0,0.02)",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between"
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                        <span style={{ fontSize: "1.2rem" }}>🛡️</span>
                        <div>
                          <div style={{ fontSize: "0.84rem", fontWeight: 800, color: paymentMode === "razorpay" ? "#1e40af" : "var(--text-primary)" }}>
                            Razorpay Verified Gateway
                          </div>
                          <div style={{ fontSize: "0.68rem", color: "var(--text-muted)" }}>
                            UPI (GPay / PhonePe), Cards & NetBanking
                          </div>
                        </div>
                      </div>
                      <span style={{
                        fontSize: "0.68rem",
                        background: paymentMode === "razorpay" ? "#2563eb" : "#cbd5e1",
                        color: "#ffffff",
                        padding: "0.15rem 0.45rem",
                        borderRadius: "999px",
                        fontWeight: 700
                      }}>
                        {paymentMode === "razorpay" ? "● RECOMMENDED" : "SELECT"}
                      </span>
                    </div>

                    <div
                      onClick={() => setPaymentMode("cod")}
                      style={{
                        padding: "0.65rem 0.85rem",
                        borderRadius: "10px",
                        border: paymentMode === "cod" ? "2px solid var(--crimson-500)" : "1px solid var(--border-subtle)",
                        background: paymentMode === "cod" ? "rgba(225, 29, 72, 0.08)" : "rgba(0,0,0,0.02)",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between"
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                        <span style={{ fontSize: "1.2rem" }}>💵</span>
                        <div>
                          <div style={{ fontSize: "0.84rem", fontWeight: 700, color: paymentMode === "cod" ? "var(--crimson-500)" : "var(--text-primary)" }}>
                            Cash on Delivery (COD)
                          </div>
                          <div style={{ fontSize: "0.68rem", color: "var(--text-muted)" }}>
                            Pay at doorstep upon delivery
                          </div>
                        </div>
                      </div>
                      <span style={{
                        fontSize: "0.68rem",
                        background: paymentMode === "cod" ? "var(--crimson-500)" : "#cbd5e1",
                        color: "#ffffff",
                        padding: "0.15rem 0.45rem",
                        borderRadius: "999px",
                        fontWeight: 700
                      }}>
                        {paymentMode === "cod" ? "● SELECTED" : "SELECT"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Checkout Button */}
                <div className="bk-drawer-footer">
                  <button
                    type="button"
                    className="bk-btn-checkout"
                    onClick={handleCheckout}
                    style={{
                      background: paymentMode === "razorpay"
                        ? "linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)"
                        : "linear-gradient(135deg, #be123c 0%, #e11d48 100%)"
                    }}
                  >
                    <span>
                      {paymentMode === "razorpay" ? "🛡️ Pay with Razorpay" : t("proceedToCheckout")}
                    </span>
                    <strong>₹{grandTotal} →</strong>
                  </button>
                  <div className="bk-security-note">
                    🔒 Razorpay 256-Bit SSL Encrypted • FSSAI Certified Kitchens
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* Razorpay Cryptographic Verification Modal */}
        <RazorpayPaymentModal
          isOpen={isRazorpayOpen}
          onClose={() => setIsRazorpayOpen(false)}
          amount={grandTotal}
          orderDetails={pendingInvoice}
          onPaymentSuccess={(verifiedInvoice, razorpayDetails) => {
            finalizeOrder(verifiedInvoice, razorpayDetails);
          }}
          onPaymentFailure={(err) => {
            alert(`Razorpay Payment Verification Failed: ${err}`);
          }}
        />
      </div>
    </div>
  );
};
