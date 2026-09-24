import { useState, useEffect } from "react";
import { useLanguage } from "../../context/LanguageContext.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { bakingoProducts } from "../../data/bakingoProducts.js";
import { handleImageError, getSafeImageUrl } from "../../utils/imageFallback.js";

export const PosTerminal = () => {
  const { t } = useLanguage();
  const { currentUser } = useAuth();

  const [products, setProducts] = useState(bakingoProducts);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [barcodeInput, setBarcodeInput] = useState("");
  const [cart, setCart] = useState([]);
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [loyaltyPoints, setLoyaltyPoints] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState("UPI");
  const [customerName, setCustomerName] = useState("Sneha Varadharajan");
  const [customerPhone, setCustomerPhone] = useState("+91 91760 33445");

  // Receipt Modal State
  const [thermalReceipt, setThermalReceipt] = useState(null);
  const [showReceiptModal, setShowReceiptModal] = useState(false);

  useEffect(() => {
    let active = true;
    const fetchRemoteProducts = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/products");
        if (res.ok) {
          const data = await res.json();
          if (active && data.products && data.products.length > 0) {
            setProducts(data.products);
          }
        }
      } catch (err) {
        console.error("Backend fetch error (using fallback products):", err);
      }
    };

    fetchRemoteProducts();
    return () => {
      active = false;
    };
  }, []);

  // Barcode Scanner Handler
  const handleBarcodeScan = async (e) => {
    e.preventDefault();
    if (!barcodeInput.trim()) return;

    try {
      const res = await fetch(`http://localhost:5000/api/products/scan/${barcodeInput.trim()}`);
      if (res.ok) {
        const product = await res.json();
        addToCart(product);
        setBarcodeInput("");
      } else {
        alert(`No product found with barcode: ${barcodeInput}`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const addToCart = (product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.productId === product.id);
      if (existing) {
        return prev.map((item) =>
          item.productId === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [
        ...prev,
        {
          productId: product.id,
          name: product.name,
          price: product.sellingPrice,
          quantity: 1,
          image: product.image,
          category: product.category
        }
      ];
    });
  };

  const updateQuantity = (productId, delta) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.productId === productId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean)
    );
  };

  // Verify Coupon
  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    try {
      const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
      const res = await fetch("http://localhost:5000/api/pos/verify-coupon", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ couponCode, subtotal })
      });
      const data = await res.json();
      if (res.ok && data.valid) {
        setAppliedCoupon(data);
      } else {
        alert(data.message || "Invalid coupon");
        setAppliedCoupon(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Calculations
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const couponDiscount = appliedCoupon ? appliedCoupon.discountAmount : 0;
  const loyaltyDiscount = Math.min(loyaltyPoints, Math.max(0, subtotal - couponDiscount));
  const totalDiscount = couponDiscount + loyaltyDiscount;

  const taxableAmount = Math.max(0, subtotal - totalDiscount);
  const cgst = parseFloat((taxableAmount * 0.025).toFixed(2));
  const sgst = parseFloat((taxableAmount * 0.025).toFixed(2));
  const grandTotal = parseFloat((taxableAmount + cgst + sgst).toFixed(2));

  // Checkout
  const handleCheckout = async () => {
    if (cart.length === 0) return alert("Cart is empty!");

    try {
      const res = await fetch("http://localhost:5000/api/pos/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": "bakesphere_dev_key_2026"
        },
        body: JSON.stringify({
          items: cart,
          customerName,
          customerPhone,
          couponCode: appliedCoupon ? appliedCoupon.code : "",
          loyaltyPointsRedeemed: loyaltyPoints,
          paymentMethod,
          branchId: "BR-01"
        })
      });

      const data = await res.json();
      if (res.ok && data.thermalReceipt) {
        setThermalReceipt(data.thermalReceipt);
        setShowReceiptModal(true);
        setCart([]);
        setAppliedCoupon(null);
        setLoyaltyPoints(0);
        // Refresh catalog quantities
        fetchProducts();
      } else {
        alert(data.error || "Checkout failed");
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Categories list
  const categories = [
    { id: "all", label: "All Items" },
    { id: "Cakes", label: "Cakes" },
    { id: "Pastries", label: "Pastries" },
    { id: "Bread", label: "Artisan Bread" },
    { id: "Cookies", label: "Cookies" },
    { id: "Puffs", label: "Puffs & Savory" },
    { id: "Beverages", label: "Beverages" }
  ];

  const filteredProducts = products.filter((p) => {
    const matchesCat = selectedCategory === "all" || p.category.toLowerCase() === selectedCategory.toLowerCase();
    const matchesSearch = !searchQuery || p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.barcode.includes(searchQuery);
    return matchesCat && matchesSearch;
  });

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: "1.5rem" }}>
      {/* Left Column: Product Search & Grid */}
      <div style={{ display: "flex", flexDirection: "column", gap: "1.2rem" }}>
        {/* Top Controls: Search & Barcode Scan */}
        <div className="glass-panel" style={{ padding: "1.2rem", display: "flex", gap: "1rem", flexWrap: "wrap", alignItems: "center" }}>
          {/* Live Search */}
          <div style={{ flex: 1, minWidth: "220px", position: "relative" }}>
            <span style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }}>🔍</span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products by name or SKU..."
              style={{
                width: "100%",
                background: "rgba(255, 255, 255, 0.04)",
                border: "1px solid var(--border-subtle)",
                borderRadius: "var(--radius-full)",
                padding: "0.6rem 1rem 0.6rem 2.4rem",
                color: "var(--text-primary)",
                fontSize: "0.88rem",
                outline: "none"
              }}
            />
          </div>

          {/* High-Speed Barcode Scanner Simulation */}
          <form onSubmit={handleBarcodeScan} style={{ display: "flex", gap: "0.4rem", minWidth: "240px" }}>
            <input
              type="text"
              value={barcodeInput}
              onChange={(e) => setBarcodeInput(e.target.value)}
              placeholder="Scan Barcode (e.g. 8901234560012)"
              style={{
                flex: 1,
                background: "rgba(245, 158, 11, 0.08)",
                border: "1px solid rgba(245, 158, 11, 0.3)",
                borderRadius: "var(--radius-full)",
                padding: "0.6rem 1rem",
                color: "var(--gold-400)",
                fontSize: "0.85rem",
                fontFamily: "var(--font-mono)",
                outline: "none"
              }}
            />
            <button type="submit" className="btn-gold" style={{ padding: "0.6rem 1rem" }}>
              Scan
            </button>
          </form>
        </div>

        {/* Category Pills */}
        <div style={{ display: "flex", gap: "0.5rem", overflowX: "auto", paddingBottom: "0.3rem" }}>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              style={{
                background: selectedCategory === cat.id ? "var(--gold-gradient)" : "rgba(255, 255, 255, 0.04)",
                color: selectedCategory === cat.id ? "#120904" : "var(--text-secondary)",
                fontWeight: selectedCategory === cat.id ? 700 : 500,
                border: selectedCategory === cat.id ? "none" : "1px solid var(--border-subtle)",
                padding: "0.45rem 1rem",
                borderRadius: "var(--radius-full)",
                cursor: "pointer",
                fontSize: "0.84rem",
                whiteSpace: "nowrap",
                transition: "all 0.2s ease"
              }}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Products Grid */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(210px, 1fr))",
          gap: "1.2rem"
        }}>
          {filteredProducts.map((p) => {
            const mrp = Math.round(p.sellingPrice * 1.25);
            const discountPercent = Math.round(((mrp - p.sellingPrice) / mrp) * 100);

            return (
              <div
                key={p.id}
                className="glass-panel"
                style={{
                  borderRadius: "16px",
                  overflow: "hidden",
                  display: "flex",
                  flexDirection: "column",
                  position: "relative",
                  transition: "transform 0.25s ease, box-shadow 0.25s ease"
                }}
              >
                {/* Product Image & Badges */}
                <div style={{ height: "155px", overflow: "hidden", position: "relative" }}>
                  <img
                    src={getSafeImageUrl(p.image)}
                    alt={p.name}
                    style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.35s ease" }}
                    onError={handleImageError}
                    onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.08)")}
                    onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
                  />

                  {/* 100% Veg / Eggless Mark (Bakingo Signature) */}
                  <div style={{ position: "absolute", top: "0.6rem", left: "0.6rem", zIndex: 2 }}>
                    <div className="bakingo-veg-mark" title="100% Eggless Baked Fresh">
                      <div className="bakingo-veg-mark-dot" />
                    </div>
                  </div>

                  {/* Express Delivery Badge */}
                  <div style={{ position: "absolute", top: "0.6rem", right: "0.6rem", zIndex: 2 }}>
                    <span className="bakingo-express-badge">
                      ⚡ 2-Hr Express
                    </span>
                  </div>

                  {/* Star Rating Pill */}
                  <div style={{ position: "absolute", bottom: "0.5rem", left: "0.6rem", zIndex: 2 }}>
                    <span className="bakingo-rating-pill">
                      ⭐ {p.rating || "4.9"} <span style={{ opacity: 0.75, fontSize: "0.65rem" }}>({Math.floor(((p.id * 149) % 700) + 380)})</span>
                    </span>
                  </div>
                </div>

                {/* Product Info */}
                <div style={{ padding: "0.95rem", display: "flex", flexDirection: "column", flex: 1, justifyContent: "space-between" }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: "0.95rem", color: "var(--text-primary)", marginBottom: "0.25rem", lineHeight: 1.3 }}>
                      {p.name}
                    </div>
                    <div style={{ fontSize: "0.74rem", color: "var(--text-muted)", marginBottom: "0.6rem", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                      <span>{p.weight || "500g"}</span>
                      <span>•</span>
                      <span style={{ color: "#10b981", fontWeight: 600 }}>Fresh Oven Batch</span>
                    </div>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "0.4rem", paddingTop: "0.4rem", borderTop: "1px dashed var(--border-subtle)" }}>
                    <div>
                      <div style={{ display: "flex", alignItems: "baseline" }}>
                        <span style={{ fontSize: "1.15rem", fontWeight: 800, color: "var(--gold-400)" }}>
                          ₹{p.sellingPrice}
                        </span>
                        <span className="bakingo-mrp">
                          ₹{mrp}
                        </span>
                      </div>
                      <div className="bakingo-discount-tag">
                        {discountPercent}% OFF
                      </div>
                    </div>

                    <button
                      onClick={() => addToCart(p)}
                      className="btn-gold"
                      style={{ padding: "0.42rem 0.95rem", fontSize: "0.82rem", fontWeight: 700 }}
                    >
                      + ADD
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right Column: Interactive Cart & Thermal Billing Panel */}
      <div className="glass-panel" style={{ padding: "1.4rem", display: "flex", flexDirection: "column", height: "fit-content", position: "sticky", top: "5.5rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border-subtle)", paddingBottom: "0.75rem", marginBottom: "1rem" }}>
          <div>
            <h3 style={{ fontSize: "1.15rem", fontWeight: 700, color: "var(--text-primary)" }}>
              🛒 {t("cartTitle")}
            </h3>
            <div style={{ fontSize: "0.74rem", color: "var(--text-muted)" }}>
              Cashier: {currentUser ? currentUser.name : "Priya N"}
            </div>
          </div>
          <span className="badge badge-gold">{cart.length} Items</span>
        </div>

        {/* Customer Information */}
        <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}>
          <input
            type="text"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            placeholder="Customer Name"
            style={{
              flex: 1,
              background: "rgba(255, 255, 255, 0.04)",
              border: "1px solid var(--border-subtle)",
              borderRadius: "6px",
              padding: "0.4rem 0.6rem",
              fontSize: "0.78rem",
              color: "#fff"
            }}
          />
          <input
            type="text"
            value={customerPhone}
            onChange={(e) => setCustomerPhone(e.target.value)}
            placeholder="Phone Number"
            style={{
              width: "120px",
              background: "rgba(255, 255, 255, 0.04)",
              border: "1px solid var(--border-subtle)",
              borderRadius: "6px",
              padding: "0.4rem 0.6rem",
              fontSize: "0.78rem",
              color: "#fff"
            }}
          />
        </div>

        {/* Cart Line Items */}
        <div style={{
          maxHeight: "260px",
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          gap: "0.6rem",
          marginBottom: "1rem",
          paddingRight: "0.2rem"
        }}>
          {cart.length === 0 ? (
            <div style={{ textAlign: "center", padding: "2rem 1rem", color: "var(--text-muted)", fontSize: "0.85rem" }}>
              Cart is empty. Scan barcode or tap products to add.
            </div>
          ) : (
            cart.map((item) => (
              <div
                key={item.productId}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "0.5rem",
                  background: "rgba(255, 255, 255, 0.02)",
                  borderRadius: "8px",
                  border: "1px solid rgba(245, 158, 11, 0.08)"
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: "0.84rem", color: "var(--text-primary)" }}>
                    {item.name}
                  </div>
                  <div style={{ fontSize: "0.74rem", color: "var(--gold-400)" }}>
                    ₹{item.price} each
                  </div>
                </div>

                {/* Quantity Controls */}
                <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                  <button
                    onClick={() => updateQuantity(item.productId, -1)}
                    style={{
                      width: "24px",
                      height: "24px",
                      borderRadius: "50%",
                      background: "rgba(255, 255, 255, 0.1)",
                      border: "none",
                      color: "#fff",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center"
                    }}
                  >
                    -
                  </button>
                  <span style={{ fontSize: "0.85rem", fontWeight: 600, minWidth: "18px", textAlign: "center" }}>
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(item.productId, 1)}
                    style={{
                      width: "24px",
                      height: "24px",
                      borderRadius: "50%",
                      background: "rgba(255, 255, 255, 0.1)",
                      border: "none",
                      color: "#fff",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center"
                    }}
                  >
                    +
                  </button>
                </div>

                <div style={{ fontWeight: 700, fontSize: "0.88rem", minWidth: "60px", textAlign: "right", color: "var(--text-primary)" }}>
                  ₹{(item.price * item.quantity).toFixed(2)}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Coupons & Loyalty Points */}
        <div style={{ borderTop: "1px solid var(--border-subtle)", paddingTop: "0.75rem", marginBottom: "0.8rem" }}>
          {/* Coupon Input */}
          <div style={{ display: "flex", gap: "0.4rem", marginBottom: "0.6rem" }}>
            <input
              type="text"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value)}
              placeholder="Coupon (e.g. FESTIVAL10)"
              style={{
                flex: 1,
                background: "rgba(255, 255, 255, 0.04)",
                border: "1px solid var(--border-subtle)",
                borderRadius: "6px",
                padding: "0.35rem 0.6rem",
                fontSize: "0.78rem",
                color: "var(--gold-400)",
                textTransform: "uppercase"
              }}
            />
            <button onClick={handleApplyCoupon} className="btn-outline" style={{ padding: "0.35rem 0.7rem", fontSize: "0.78rem" }}>
              Apply
            </button>
          </div>

          {appliedCoupon && (
            <div style={{ fontSize: "0.74rem", color: "#34d399", marginBottom: "0.5rem" }}>
              ✓ Applied {appliedCoupon.code} (-₹{appliedCoupon.discountAmount})
            </div>
          )}

          {/* Loyalty Points Redemption */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "0.78rem" }}>
            <span style={{ color: "var(--text-muted)" }}>⭐ Redeem Points (1 pt = ₹1):</span>
            <input
              type="number"
              value={loyaltyPoints}
              onChange={(e) => setLoyaltyPoints(Math.max(0, parseInt(e.target.value, 10) || 0))}
              min="0"
              max="340"
              style={{
                width: "70px",
                background: "rgba(255, 255, 255, 0.04)",
                border: "1px solid var(--border-subtle)",
                borderRadius: "4px",
                padding: "0.2rem 0.4rem",
                fontSize: "0.78rem",
                color: "var(--gold-400)",
                textAlign: "right"
              }}
            />
          </div>
        </div>

        {/* Totals Breakdown */}
        <div style={{
          borderTop: "1px solid var(--border-subtle)",
          paddingTop: "0.75rem",
          display: "flex",
          flexDirection: "column",
          gap: "0.35rem",
          fontSize: "0.82rem",
          marginBottom: "1rem"
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", color: "var(--text-muted)" }}>
            <span>{t("subtotal")}</span>
            <span>₹{subtotal.toFixed(2)}</span>
          </div>
          {totalDiscount > 0 && (
            <div style={{ display: "flex", justifyContent: "space-between", color: "#34d399" }}>
              <span>{t("discount")}</span>
              <span>-₹{totalDiscount.toFixed(2)}</span>
            </div>
          )}
          <div style={{ display: "flex", justifyContent: "space-between", color: "var(--text-muted)" }}>
            <span>CGST (2.5%) + SGST (2.5%)</span>
            <span>₹{(cgst + sgst).toFixed(2)}</span>
          </div>
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: "1.15rem",
            fontWeight: 800,
            color: "var(--gold-400)",
            marginTop: "0.3rem",
            paddingTop: "0.4rem",
            borderTop: "1px dashed var(--border-subtle)"
          }}>
            <span>{t("total")}</span>
            <span>₹{grandTotal.toFixed(2)}</span>
          </div>
        </div>

        {/* Payment Method Selector */}
        <div style={{ marginBottom: "1rem" }}>
          <div style={{ fontSize: "0.76rem", color: "var(--text-muted)", marginBottom: "0.4rem" }}>
            Payment Method:
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "0.35rem" }}>
            {["UPI", "Cash", "Card", "Split"].map((pm) => (
              <button
                key={pm}
                onClick={() => setPaymentMethod(pm)}
                style={{
                  background: paymentMethod === pm ? "var(--gold-gradient)" : "rgba(255, 255, 255, 0.04)",
                  color: paymentMethod === pm ? "#120904" : "var(--text-secondary)",
                  fontWeight: paymentMethod === pm ? 700 : 500,
                  border: paymentMethod === pm ? "none" : "1px solid var(--border-subtle)",
                  padding: "0.4rem 0.2rem",
                  borderRadius: "6px",
                  fontSize: "0.76rem",
                  cursor: "pointer"
                }}
              >
                {pm}
              </button>
            ))}
          </div>
        </div>

        {/* Checkout Button */}
        <button
          onClick={handleCheckout}
          disabled={cart.length === 0}
          className="btn-gold"
          style={{
            width: "100%",
            justifyContent: "center",
            padding: "0.8rem",
            fontSize: "0.95rem",
            opacity: cart.length === 0 ? 0.5 : 1
          }}
        >
          💳 {t("checkout")} (₹{grandTotal.toFixed(2)})
        </button>
      </div>

      {/* Thermal Invoice Printable Modal */}
      {showReceiptModal && thermalReceipt && (
        <div style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0, 0, 0, 0.8)",
          backdropFilter: "blur(8px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000,
          padding: "1rem"
        }}>
          <div className="glass-panel" style={{
            background: "#fff",
            color: "#000",
            width: "360px",
            maxHeight: "90vh",
            overflowY: "auto",
            padding: "1.5rem",
            borderRadius: "14px",
            fontFamily: "'Courier New', Courier, monospace"
          }}>
            {/* Thermal Receipt Content */}
            <div id="thermal-receipt-print" style={{ textAlign: "center" }}>
              <h2 style={{ fontSize: "1.2rem", fontWeight: 800, margin: 0, letterSpacing: "1px" }}>
                {thermalReceipt.storeName}
              </h2>
              <div style={{ fontSize: "0.75rem", margin: "2px 0" }}>{thermalReceipt.tagline}</div>
              <div style={{ fontSize: "0.7rem", color: "#444" }}>{thermalReceipt.branchAddress}</div>
              <div style={{ fontSize: "0.7rem", color: "#444" }}>Tel: {thermalReceipt.phone}</div>
              <div style={{ fontSize: "0.7rem", fontWeight: "bold", margin: "4px 0" }}>
                GSTIN: {thermalReceipt.gstin}
              </div>
              <div style={{ fontSize: "0.68rem", color: "#555" }}>FSSAI Lic: {thermalReceipt.fssaiLicense}</div>

              <div style={{ borderTop: "1px dashed #000", margin: "8px 0" }} />

              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.74rem", textAlign: "left" }}>
                <div>Inv: <strong>{thermalReceipt.invoiceNumber}</strong></div>
                <div>{thermalReceipt.date} {thermalReceipt.time}</div>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.74rem", textAlign: "left" }}>
                <div>Cashier: {thermalReceipt.cashier}</div>
                <div>Cust: {thermalReceipt.customer}</div>
              </div>

              <div style={{ borderTop: "1px dashed #000", margin: "8px 0" }} />

              {/* Items Table */}
              <table style={{ width: "100%", fontSize: "0.75rem", textAlign: "left", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid #ddd" }}>
                    <th>Item</th>
                    <th style={{ textAlign: "center" }}>Qty</th>
                    <th style={{ textAlign: "right" }}>Amt</th>
                  </tr>
                </thead>
                <tbody>
                  {thermalReceipt.items.map((it, idx) => (
                    <tr key={idx}>
                      <td style={{ padding: "3px 0" }}>{it.name}</td>
                      <td style={{ textAlign: "center" }}>{it.quantity}</td>
                      <td style={{ textAlign: "right" }}>₹{it.lineTotal.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div style={{ borderTop: "1px dashed #000", margin: "8px 0" }} />

              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem" }}>
                <span>Subtotal:</span>
                <span>₹{thermalReceipt.subtotal.toFixed(2)}</span>
              </div>
              {thermalReceipt.discount > 0 && (
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", color: "#b91c1c" }}>
                  <span>Discount:</span>
                  <span>-₹{thermalReceipt.discount.toFixed(2)}</span>
                </div>
              )}
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem" }}>
                <span>CGST (2.5%):</span>
                <span>₹{thermalReceipt.cgst.toFixed(2)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem" }}>
                <span>SGST (2.5%):</span>
                <span>₹{thermalReceipt.sgst.toFixed(2)}</span>
              </div>

              <div style={{ borderTop: "1px solid #000", margin: "6px 0" }} />

              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "1rem", fontWeight: "bold" }}>
                <span>GRAND TOTAL:</span>
                <span>₹{thermalReceipt.grandTotal.toFixed(2)}</span>
              </div>
              <div style={{ fontSize: "0.75rem", marginTop: "3px", textAlign: "left" }}>
                Paid via: <strong>{thermalReceipt.paymentMethod}</strong> (Status: SUCCESS)
              </div>

              {/* QR Code Verification Simulation */}
              <div style={{ margin: "14px auto 6px", width: "70px", height: "70px", background: "#000", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.8rem" }}>
                🏁
              </div>
              <div style={{ fontSize: "0.65rem", color: "#666" }}>Scan to verify digital invoice</div>
              <div style={{ fontSize: "0.7rem", marginTop: "8px", fontStyle: "italic" }}>
                {thermalReceipt.footerNote}
              </div>
            </div>

            {/* Modal Actions */}
            <div style={{ display: "flex", gap: "0.5rem", marginTop: "1.2rem", paddingTop: "0.8rem", borderTop: "1px solid #eee" }}>
              <button
                onClick={() => window.print()}
                style={{
                  flex: 1,
                  background: "#000",
                  color: "#fff",
                  border: "none",
                  padding: "0.6rem",
                  borderRadius: "6px",
                  fontWeight: "bold",
                  cursor: "pointer"
                }}
              >
                🖨️ {t("printReceipt")}
              </button>
              <button
                onClick={() => setShowReceiptModal(false)}
                style={{
                  background: "#eee",
                  color: "#333",
                  border: "none",
                  padding: "0.6rem 1rem",
                  borderRadius: "6px",
                  cursor: "pointer"
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
