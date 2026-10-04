import { useState, useEffect } from "react";
import confetti from "canvas-confetti";
import { useAuth } from "../../context/AuthContext.jsx";
import { bakingoProducts } from "../../data/bakingoProducts.js";
import { handleImageError, getSafeImageUrl } from "../../utils/imageFallback.js";

const EVENT_TYPES = [
  "Birthday Party",
  "Wedding / Sangeet",
  "Corporate Event",
  "College Fest",
  "Anniversary Gala",
  "Large Gathering",
  "Bulk Office Catering",
  "Other Celebration"
];

export const BulkOrderPortal = () => {
  const { currentUser, role, isManager, isAdmin, isOwner, activeBranchId, activeBranchName } = useAuth();
  const canManageQuotes = isManager || isAdmin || isOwner;

  // Tabs: "request" (Customer builder) vs "manage" (Manager/Admin review desk)
  const [activeTab, setActiveTab] = useState(canManageQuotes ? "manage" : "request");

  // Branches list
  const [branches, setBranches] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [selectedBranchFilter, setSelectedBranchFilter] = useState("all");
  const [selectedStatusFilter, setSelectedStatusFilter] = useState("all");

  // Quotation review modal
  const [editingOrder, setEditingOrder] = useState(null);
  const [quoteDiscount, setQuoteDiscount] = useState(10);
  const [managerNotes, setManagerNotes] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("pending");
  const [quoteStatus, setQuoteStatus] = useState("quoted");

  // Toast
  const [toastMessage, setToastMessage] = useState("");
  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3500);
  };

  // Customer Form State
  const [customerName, setCustomerName] = useState(currentUser?.name || "");
  const [customerPhone, setCustomerPhone] = useState(currentUser?.phone || "+91 ");
  const [customerEmail, setCustomerEmail] = useState(currentUser?.email || "");
  const [eventType, setEventType] = useState("Birthday Party");
  const [eventDate, setEventDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 3);
    return d.toISOString().split("T")[0];
  });
  const [eventTime, setEventTime] = useState("04:30 PM");
  const [headCount, setHeadCount] = useState(50);
  const [selectedBranch, setSelectedBranch] = useState(activeBranchId || "BR-01");
  const [deliveryOption, setDeliveryOption] = useState("delivery");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [customizationRequirements, setCustomizationRequirements] = useState("");
  const [additionalInstructions, setAdditionalInstructions] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submittedOrder, setSubmittedOrder] = useState(null);

  // Products suitable for bulk ordering
  const bulkProducts = bakingoProducts.filter(
    (p) => p.suitableForBulk || ["Combos", "Puffs", "Cookies", "Breads", "Pastries"].includes(p.category) || p.sellingPrice >= 600
  );

  // Selected Bulk Items: { [productId]: quantity }
  const [selectedItems, setSelectedItems] = useState({
    77: 4, // Grand Party Celebration Combo Box
    75: 10 // Belgian Triple Choc Chunk Cookies
  });

  // Fetch branches
  useEffect(() => {
    fetch("http://localhost:5000/api/branches")
      .then((res) => res.json())
      .then((data) => setBranches(data.branches || []))
      .catch((e) => console.warn(e));
  }, []);

  // Fetch bulk orders for management
  const loadOrders = async () => {
    setLoadingOrders(true);
    try {
      let url = "http://localhost:5000/api/bulk-orders";
      const params = [];
      if (selectedBranchFilter !== "all") params.push(`branchId=${selectedBranchFilter}`);
      if (selectedStatusFilter !== "all") params.push(`status=${selectedStatusFilter}`);
      if (params.length > 0) url += `?${params.join("&")}`;

      const res = await fetch(url);
      const data = await res.json();
      setOrders(data.orders || []);
      setLoadingOrders(false);
    } catch (err) {
      console.error(err);
      setLoadingOrders(false);
    }
  };

  useEffect(() => {
    if (activeTab === "manage") {
      loadOrders();
    }
  }, [activeTab, selectedBranchFilter, selectedStatusFilter]);

  // Compute live customer subtotal
  const computedItemsList = Object.entries(selectedItems)
    .map(([pId, qty]) => {
      const prod = bakingoProducts.find((p) => p.id === parseInt(pId, 10));
      if (!prod || qty <= 0) return null;
      return {
        productId: prod.id,
        name: prod.name,
        quantity: qty,
        unitPrice: prod.sellingPrice,
        lineTotal: prod.sellingPrice * qty,
        weight: prod.weight || "Standard"
      };
    })
    .filter(Boolean);

  const rawSubtotal = computedItemsList.reduce((sum, item) => sum + item.lineTotal, 0);
  const autoDiscountPercent = headCount >= 100 ? 15 : headCount >= 50 ? 10 : 5;
  const estimatedDiscount = Math.round((rawSubtotal * autoDiscountPercent) / 100);
  const estimatedFinalTotal = rawSubtotal - estimatedDiscount;

  const handleItemQtyChange = (productId, delta) => {
    setSelectedItems((prev) => {
      const curr = prev[productId] || 0;
      const next = curr + delta;
      if (next <= 0) {
        const copy = { ...prev };
        delete copy[productId];
        return copy;
      }
      return { ...prev, [productId]: next };
    });
  };

  // Submit bulk order request
  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    if (computedItemsList.length === 0) {
      alert("Please select at least one bakery product for your bulk order.");
      return;
    }

    setSubmitting(true);
    const branchObj = branches.find((b) => b.id === selectedBranch);

    const payload = {
      customerName,
      customerPhone,
      customerEmail,
      eventType,
      eventDate,
      eventTime,
      headCount: parseInt(headCount, 10),
      branchId: selectedBranch,
      branchName: branchObj?.name || "Heritage Main Bakery",
      items: computedItemsList,
      customizationRequirements,
      deliveryOption,
      deliveryAddress,
      additionalInstructions
    };

    try {
      const res = await fetch("http://localhost:5000/api/bulk-orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to submit request");

      setSubmitting(false);
      setSubmittedOrder(data.order);
      confetti({ particleCount: 90, spread: 70, origin: { y: 0.6 } });
      showToast("Bulk catering request submitted successfully!");
    } catch (err) {
      setSubmitting(false);
      alert(`Submission error: ${err.message}`);
    }
  };

  // Manager quote action
  const handleOpenQuoteModal = (order) => {
    setEditingOrder(order);
    setQuoteDiscount(order.discountPercent || 10);
    setManagerNotes(order.managerNotes || "");
    setPaymentStatus(order.paymentStatus || "pending");
    setQuoteStatus(order.status || "quoted");
  };

  const handleSaveQuotation = async () => {
    if (!editingOrder) return;
    const finalAmount = Math.round(editingOrder.estimatedCost * (1 - quoteDiscount / 100));

    try {
      const res = await fetch(`http://localhost:5000/api/bulk-orders/${editingOrder.orderId}/quote`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          discountPercent: quoteDiscount,
          finalQuotationAmount: finalAmount,
          managerNotes
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update quotation");

      showToast(`Quotation sent to ${editingOrder.customerName} for ${editingOrder.orderId}!`);
      setEditingOrder(null);
      loadOrders();
    } catch (err) {
      alert(`Error updating quotation: ${err.message}`);
    }
  };

  const handleUpdateOrderStatus = async (orderId, nextStatus) => {
    try {
      const res = await fetch(`http://localhost:5000/api/bulk-orders/${orderId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update status");

      showToast(`Order ${orderId} marked as ${nextStatus.toUpperCase()}`);
      loadOrders();
    } catch (err) {
      alert(`Failed to update status: ${err.message}`);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      {toastMessage && (
        <div style={{
          position: "fixed",
          bottom: "2rem",
          right: "2rem",
          background: "linear-gradient(135deg, #10b981, #059669)",
          color: "#fff",
          padding: "0.9rem 1.5rem",
          borderRadius: "8px",
          boxShadow: "0 10px 25px rgba(0,0,0,0.5)",
          zIndex: 9999,
          fontWeight: 600
        }}>
          ✨ {toastMessage}
        </div>
      )}

      {/* Top Header & Tab Switcher */}
      <div className="glass-panel" style={{ padding: "1.8rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <div className="badge badge-gold" style={{ marginBottom: "0.5rem" }}>
              📦 Enterprise Catering & Large Gatherings
            </div>
            <h2 style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--text-primary)", marginBottom: "0.4rem" }}>
              Bulk Ordering & Event Catering Studio
            </h2>
            <p style={{ fontSize: "0.86rem", color: "var(--text-secondary)", maxWidth: "800px", lineHeight: 1.5 }}>
              Dedicated catering solutions for weddings, corporate celebrations, college fests, and family banquets. Request custom volume quantities of signature cakes, hot puffs, dessert jars, and party combos with manager-approved wholesale discounts.
            </p>
          </div>

          {/* Mode Switcher */}
          <div style={{ display: "flex", gap: "0.5rem", background: "rgba(255,255,255,0.06)", padding: "4px", borderRadius: "8px" }}>
            <button
              onClick={() => setActiveTab("request")}
              style={{
                padding: "0.6rem 1.2rem",
                borderRadius: "6px",
                border: "none",
                background: activeTab === "request" ? "var(--gold-400)" : "transparent",
                color: activeTab === "request" ? "#000" : "var(--text-secondary)",
                fontWeight: 700,
                fontSize: "0.85rem",
                cursor: "pointer"
              }}
            >
              🎉 Create Event Request
            </button>
            <button
              onClick={() => setActiveTab("manage")}
              style={{
                padding: "0.6rem 1.2rem",
                borderRadius: "6px",
                border: "none",
                background: activeTab === "manage" ? "var(--gold-400)" : "transparent",
                color: activeTab === "manage" ? "#000" : "var(--text-secondary)",
                fontWeight: 700,
                fontSize: "0.85rem",
                cursor: "pointer"
              }}
            >
              📋 Manager Quotation Desk
            </button>
          </div>
        </div>
      </div>

      {/* TAB 1: CUSTOMER EVENT REQUEST BUILDER */}
      {activeTab === "request" && (
        <div>
          {submittedOrder ? (
            /* Success confirmation card */
            <div className="glass-panel" style={{ padding: "3rem", textAlign: "center", maxWidth: "720px", margin: "0 auto", border: "1.5px solid var(--emerald-500)" }}>
              <div style={{ fontSize: "3.5rem", marginBottom: "1rem" }}>🎊</div>
              <h3 style={{ fontSize: "1.8rem", fontWeight: 800, color: "var(--text-primary)", marginBottom: "0.5rem" }}>
                Event Catering Request Received!
              </h3>
              <p style={{ color: "var(--text-secondary)", marginBottom: "1.5rem", lineHeight: 1.6 }}>
                Thank you, <strong>{submittedOrder.customerName}</strong>! Your inquiry for <strong>{submittedOrder.eventType}</strong> ({submittedOrder.headCount} guests) on <strong>{submittedOrder.eventDate}</strong> has been forwarded to our Catering Desk at <strong>{submittedOrder.branchName}</strong>.
              </p>

              <div style={{
                background: "rgba(255,255,255,0.04)",
                padding: "1.2rem",
                borderRadius: "10px",
                maxWidth: "400px",
                margin: "0 auto 1.8rem auto",
                textAlign: "left",
                fontSize: "0.85rem"
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.4rem" }}>
                  <span style={{ color: "var(--text-muted)" }}>Order Reference:</span>
                  <strong style={{ fontFamily: "var(--font-mono)", color: "var(--gold-400)" }}>{submittedOrder.orderId}</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.4rem" }}>
                  <span style={{ color: "var(--text-muted)" }}>Total Selected Items:</span>
                  <strong>{submittedOrder.items?.reduce((s, i) => s + i.quantity, 0)} units</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.4rem" }}>
                  <span style={{ color: "var(--text-muted)" }}>Volume Discount Tier:</span>
                  <strong style={{ color: "#34d399" }}>{submittedOrder.discountPercent}% Volume OFF</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: "0.4rem" }}>
                  <span style={{ color: "var(--text-muted)" }}>Estimated Quote:</span>
                  <strong style={{ fontSize: "1.1rem", color: "var(--gold-400)" }}>₹{submittedOrder.finalQuotationAmount?.toLocaleString("en-IN")}</strong>
                </div>
              </div>

              <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
                <a
                  href={`https://wa.me/919444243488?text=${encodeURIComponent(`Hello BakeSphere! I just submitted event catering order ${submittedOrder.orderId} for ${submittedOrder.eventType}. Please confirm quote.`)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="bk-btn-hero-primary"
                  style={{ textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "0.5rem", padding: "0.75rem 1.5rem" }}
                >
                  <span>💬</span> Instant WhatsApp Confirmation
                </a>
                <button
                  onClick={() => {
                    setSubmittedOrder(null);
                    setSelectedItems({ 77: 2 });
                  }}
                  className="bk-btn-secondary"
                  style={{ padding: "0.75rem 1.5rem" }}
                >
                  Create Another Event Request
                </button>
              </div>
            </div>
          ) : (
            /* Builder Form */
            <form onSubmit={handleSubmitOrder} style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: "1.5rem" }}>
              {/* Left Column: Event & Product Configurator */}
              <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                {/* Section 1: Event Details */}
                <div className="glass-panel" style={{ padding: "1.5rem" }}>
                  <h3 style={{ fontSize: "1.2rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "1rem" }}>
                    1. Event Information & Date
                  </h3>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
                    <div>
                      <label style={{ fontSize: "0.76rem", color: "var(--text-secondary)", display: "block", marginBottom: "0.3rem" }}>
                        Event Occasion
                      </label>
                      <select
                        value={eventType}
                        onChange={(e) => setEventType(e.target.value)}
                        style={{ width: "100%", padding: "0.65rem", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "6px", color: "#fff" }}
                      >
                        {EVENT_TYPES.map((t) => (
                          <option key={t} value={t} style={{ background: "#1e1e24" }}>{t}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label style={{ fontSize: "0.76rem", color: "var(--text-secondary)", display: "block", marginBottom: "0.3rem" }}>
                        Expected Headcount (Guests)
                      </label>
                      <input
                        type="number"
                        min="10"
                        max="2000"
                        value={headCount}
                        onChange={(e) => setHeadCount(e.target.value)}
                        required
                        style={{ width: "100%", padding: "0.65rem", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "6px", color: "#fff" }}
                      />
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem" }}>
                    <div>
                      <label style={{ fontSize: "0.76rem", color: "var(--text-secondary)", display: "block", marginBottom: "0.3rem" }}>
                        Event Date
                      </label>
                      <input
                        type="date"
                        value={eventDate}
                        onChange={(e) => setEventDate(e.target.value)}
                        required
                        style={{ width: "100%", padding: "0.65rem", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "6px", color: "#fff" }}
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: "0.76rem", color: "var(--text-secondary)", display: "block", marginBottom: "0.3rem" }}>
                        Delivery / Serving Time
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 05:00 PM"
                        value={eventTime}
                        onChange={(e) => setEventTime(e.target.value)}
                        required
                        style={{ width: "100%", padding: "0.65rem", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "6px", color: "#fff" }}
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: "0.76rem", color: "var(--text-secondary)", display: "block", marginBottom: "0.3rem" }}>
                        Selected Fulfillment Hub
                      </label>
                      <select
                        value={selectedBranch}
                        onChange={(e) => setSelectedBranch(e.target.value)}
                        style={{ width: "100%", padding: "0.65rem", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "6px", color: "#fff" }}
                      >
                        {branches.map((b) => (
                          <option key={b.id} value={b.id} style={{ background: "#1e1e24" }}>
                            {b.name} ({b.locality.split(",")[0]})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Section 2: Product Catalog for Bulk Selection */}
                <div className="glass-panel" style={{ padding: "1.5rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                    <div>
                      <h3 style={{ fontSize: "1.2rem", fontWeight: 700, color: "var(--text-primary)" }}>
                        2. Select High-Volume Products & Party Packs
                      </h3>
                      <p style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
                        Party Combos, Puff Assortments, Cookie Tins, Pastry Boxes, and Celebration Cakes
                      </p>
                    </div>
                    <span className="badge badge-gold">
                      {Object.keys(selectedItems).length} Products Selected
                    </span>
                  </div>

                  <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                    gap: "1rem",
                    maxHeight: "420px",
                    overflowY: "auto",
                    paddingRight: "0.4rem"
                  }}>
                    {bulkProducts.map((p) => {
                      const qty = selectedItems[p.id] || 0;
                      return (
                        <div
                          key={p.id}
                          style={{
                            background: qty > 0 ? "rgba(245, 158, 11, 0.08)" : "rgba(255,255,255,0.02)",
                            border: qty > 0 ? "1.5px solid var(--gold-400)" : "1px solid rgba(255,255,255,0.06)",
                            borderRadius: "10px",
                            padding: "0.9rem",
                            display: "flex",
                            gap: "0.8rem",
                            alignItems: "center"
                          }}
                        >
                          <img
                            src={getSafeImageUrl(p.image)}
                            alt={p.name}
                            style={{ width: "60px", height: "60px", borderRadius: "8px", objectFit: "cover" }}
                            onError={handleImageError}
                          />

                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--text-primary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                              {p.name}
                            </div>
                            <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", margin: "0.15rem 0" }}>
                              {p.category} • {p.weight || "Standard"}
                            </div>
                            <div style={{ fontSize: "0.84rem", fontWeight: 700, color: "var(--gold-400)" }}>
                              ₹{p.sellingPrice}
                            </div>
                          </div>

                          {/* Stepper */}
                          <div style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
                            <button
                              type="button"
                              onClick={() => handleItemQtyChange(p.id, -10)}
                              style={{ width: "24px", height: "24px", borderRadius: "4px", border: "none", background: "rgba(255,255,255,0.1)", color: "#fff", cursor: "pointer", fontWeight: 700 }}
                            >
                              −
                            </button>
                            <span style={{ fontSize: "0.85rem", fontWeight: 700, minWidth: "28px", textAlign: "center", color: "#fff" }}>
                              {qty}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleItemQtyChange(p.id, 10)}
                              style={{ width: "24px", height: "24px", borderRadius: "4px", border: "none", background: "var(--gold-400)", color: "#000", cursor: "pointer", fontWeight: 700 }}
                            >
                              +
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Section 3: Customization & Instructions */}
                <div className="glass-panel" style={{ padding: "1.5rem" }}>
                  <h3 style={{ fontSize: "1.2rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "1rem" }}>
                    3. Custom Branding & Dietary Specifications
                  </h3>

                  <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                    <div>
                      <label style={{ fontSize: "0.76rem", color: "var(--text-secondary)", display: "block", marginBottom: "0.3rem" }}>
                        Custom Message, Logo, or Theme Inscriptions
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Happy 50th Birthday Dad! / Company Logo branded on cupcakes"
                        value={customizationRequirements}
                        onChange={(e) => setCustomizationRequirements(e.target.value)}
                        style={{ width: "100%", padding: "0.65rem", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "6px", color: "#fff" }}
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: "0.76rem", color: "var(--text-secondary)", display: "block", marginBottom: "0.3rem" }}>
                        Special Dietary / Packing Instructions
                      </label>
                      <textarea
                        rows="2"
                        placeholder="e.g. Ensure 40 puffs are 100% Jain/Veg; deliver in insulated food warmers; provide 100 compostable plates"
                        value={additionalInstructions}
                        onChange={(e) => setAdditionalInstructions(e.target.value)}
                        style={{ width: "100%", padding: "0.65rem", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "6px", color: "#fff" }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Customer Details & Quote Estimation Panel */}
              <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                {/* Contact Info Card */}
                <div className="glass-panel" style={{ padding: "1.5rem" }}>
                  <h3 style={{ fontSize: "1.15rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "1rem" }}>
                    Host & Contact Details
                  </h3>

                  <div style={{ display: "flex", flexDirection: "column", gap: "0.9rem" }}>
                    <div>
                      <label style={{ fontSize: "0.75rem", color: "var(--text-secondary)", display: "block", marginBottom: "0.3rem" }}>
                        Full Name / Event Organizer
                      </label>
                      <input
                        type="text"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        required
                        style={{ width: "100%", padding: "0.6rem", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "6px", color: "#fff" }}
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: "0.75rem", color: "var(--text-secondary)", display: "block", marginBottom: "0.3rem" }}>
                        Contact Phone / WhatsApp
                      </label>
                      <input
                        type="text"
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        required
                        style={{ width: "100%", padding: "0.6rem", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "6px", color: "#fff" }}
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: "0.75rem", color: "var(--text-secondary)", display: "block", marginBottom: "0.3rem" }}>
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={customerEmail}
                        onChange={(e) => setCustomerEmail(e.target.value)}
                        required
                        style={{ width: "100%", padding: "0.6rem", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "6px", color: "#fff" }}
                      />
                    </div>

                    {/* Delivery vs Pickup */}
                    <div>
                      <label style={{ fontSize: "0.75rem", color: "var(--text-secondary)", display: "block", marginBottom: "0.3rem" }}>
                        Fulfillment Option
                      </label>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
                        <button
                          type="button"
                          onClick={() => setDeliveryOption("delivery")}
                          style={{
                            padding: "0.6rem",
                            borderRadius: "6px",
                            border: "none",
                            background: deliveryOption === "delivery" ? "var(--gold-400)" : "rgba(255,255,255,0.06)",
                            color: deliveryOption === "delivery" ? "#000" : "var(--text-secondary)",
                            fontWeight: 700,
                            fontSize: "0.78rem",
                            cursor: "pointer"
                          }}
                        >
                          🚚 Doorstep Delivery
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeliveryOption("pickup")}
                          style={{
                            padding: "0.6rem",
                            borderRadius: "6px",
                            border: "none",
                            background: deliveryOption === "pickup" ? "var(--gold-400)" : "rgba(255,255,255,0.06)",
                            color: deliveryOption === "pickup" ? "#000" : "var(--text-secondary)",
                            fontWeight: 700,
                            fontSize: "0.78rem",
                            cursor: "pointer"
                          }}
                        >
                          🏪 Store Pickup
                        </button>
                      </div>
                    </div>

                    {deliveryOption === "delivery" && (
                      <div>
                        <label style={{ fontSize: "0.75rem", color: "var(--text-secondary)", display: "block", marginBottom: "0.3rem" }}>
                          Event Venue / Delivery Address
                        </label>
                        <textarea
                          rows="2"
                          placeholder="Full banquet address, landmark, floor, gate number"
                          value={deliveryAddress}
                          onChange={(e) => setDeliveryAddress(e.target.value)}
                          required
                          style={{ width: "100%", padding: "0.6rem", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "6px", color: "#fff" }}
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Live Quotation Summary Card */}
                <div className="glass-panel" style={{ padding: "1.5rem", border: "1.5px solid var(--gold-400)" }}>
                  <h3 style={{ fontSize: "1.15rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "0.8rem" }}>
                    Estimated Catering Quotation
                  </h3>

                  {computedItemsList.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "1.5rem", color: "var(--text-muted)", fontSize: "0.82rem" }}>
                      Select items above to view volume quote estimation.
                    </div>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem", fontSize: "0.82rem" }}>
                      <div style={{ maxHeight: "160px", overflowY: "auto", paddingRight: "0.2rem" }}>
                        {computedItemsList.map((item) => (
                          <div key={item.productId} style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.35rem" }}>
                            <span style={{ color: "var(--text-secondary)" }}>
                              {item.name} × {item.quantity}
                            </span>
                            <strong>₹{item.lineTotal.toLocaleString("en-IN")}</strong>
                          </div>
                        ))}
                      </div>

                      <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: "0.6rem", display: "flex", justifyContent: "space-between" }}>
                        <span style={{ color: "var(--text-muted)" }}>Raw Catalog Total:</span>
                        <span>₹{rawSubtotal.toLocaleString("en-IN")}</span>
                      </div>

                      <div style={{ display: "flex", justifyContent: "space-between", color: "#34d399" }}>
                        <span>Volume Discount ({autoDiscountPercent}%):</span>
                        <span>− ₹{estimatedDiscount.toLocaleString("en-IN")}</span>
                      </div>

                      <div style={{
                        borderTop: "1px solid rgba(255,255,255,0.1)",
                        paddingTop: "0.6rem",
                        display: "flex",
                        justifyContent: "space-between",
                        fontSize: "1.1rem"
                      }}>
                        <strong style={{ color: "var(--text-primary)" }}>Estimated Quote:</strong>
                        <strong style={{ color: "var(--gold-400)" }}>₹{estimatedFinalTotal.toLocaleString("en-IN")}</strong>
                      </div>

                      <button
                        type="submit"
                        disabled={submitting}
                        className="bk-btn-hero-primary"
                        style={{ marginTop: "1rem", padding: "0.8rem", width: "100%", fontSize: "0.95rem" }}
                      >
                        {submitting ? "Submitting Inquiry..." : "🚀 Request Official Event Quote"}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </form>
          )}
        </div>
      )}

      {/* TAB 2: MANAGER / ADMIN QUOTATION REVIEW DESK */}
      {activeTab === "manage" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          {/* Filter Bar */}
          <div className="glass-panel" style={{ padding: "1.2rem", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.8rem", flexWrap: "wrap" }}>
              <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Filter Branch:</span>
              <select
                value={selectedBranchFilter}
                onChange={(e) => setSelectedBranchFilter(e.target.value)}
                style={{ padding: "0.45rem 0.8rem", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "6px", color: "#fff", fontSize: "0.82rem" }}
              >
                <option value="all" style={{ background: "#1e1e24" }}>All Branches</option>
                {branches.map((b) => (
                  <option key={b.id} value={b.id} style={{ background: "#1e1e24" }}>{b.name}</option>
                ))}
              </select>

              <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Status:</span>
              <select
                value={selectedStatusFilter}
                onChange={(e) => setSelectedStatusFilter(e.target.value)}
                style={{ padding: "0.45rem 0.8rem", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "6px", color: "#fff", fontSize: "0.82rem" }}
              >
                <option value="all" style={{ background: "#1e1e24" }}>All Statuses</option>
                <option value="submitted" style={{ background: "#1e1e24" }}>Submitted (New)</option>
                <option value="quoted" style={{ background: "#1e1e24" }}>Quoted</option>
                <option value="approved" style={{ background: "#1e1e24" }}>Approved</option>
                <option value="in_preparation" style={{ background: "#1e1e24" }}>In Preparation</option>
                <option value="ready" style={{ background: "#1e1e24" }}>Ready for Dispatch</option>
                <option value="delivered" style={{ background: "#1e1e24" }}>Delivered</option>
                <option value="rejected" style={{ background: "#1e1e24" }}>Rejected</option>
              </select>
            </div>

            <button
              onClick={loadOrders}
              className="bk-btn-secondary"
              style={{ padding: "0.45rem 0.9rem", fontSize: "0.8rem" }}
            >
              🔄 Refresh Orders
            </button>
          </div>

          {/* Orders Grid */}
          {loadingOrders ? (
            <div style={{ padding: "3rem", textAlign: "center", color: "var(--gold-400)" }}>
              Loading event catering ledger...
            </div>
          ) : orders.length === 0 ? (
            <div className="glass-panel" style={{ padding: "3rem", textAlign: "center", color: "var(--text-muted)" }}>
              No bulk event inquiries found for the selected filters.
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))", gap: "1.5rem" }}>
              {orders.map((o) => {
                const totalUnits = o.items?.reduce((s, i) => s + (i.quantity || 0), 0) || 0;
                const statusColors = {
                  submitted: "badge-gold",
                  quoted: "badge-emerald",
                  approved: "badge-emerald",
                  in_preparation: "badge-gold",
                  ready: "badge-emerald",
                  delivered: "badge-emerald",
                  rejected: "badge-rose"
                };

                return (
                  <div key={o.orderId} className="glass-panel" style={{ padding: "1.5rem", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                    <div>
                      {/* Card Header */}
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.6rem" }}>
                        <div>
                          <span style={{ fontSize: "0.72rem", background: "rgba(255,255,255,0.08)", padding: "0.15rem 0.4rem", borderRadius: "4px", fontFamily: "var(--font-mono)" }}>
                            {o.orderId}
                          </span>
                          <h4 style={{ fontSize: "1.15rem", fontWeight: 700, color: "var(--text-primary)", marginTop: "0.3rem" }}>
                            {o.eventType}
                          </h4>
                          <div style={{ fontSize: "0.76rem", color: "var(--text-muted)" }}>
                            Organizer: <strong>{o.customerName}</strong> • {o.headCount} Guests
                          </div>
                        </div>

                        <span className={`badge ${statusColors[o.status] || "badge-gold"}`}>
                          {o.status.toUpperCase()}
                        </span>
                      </div>

                      {/* Event Date & Branch */}
                      <div style={{ background: "rgba(255,255,255,0.02)", padding: "0.7rem", borderRadius: "6px", fontSize: "0.78rem", marginBottom: "0.8rem" }}>
                        <div>📅 Date: <strong>{o.eventDate} at {o.eventTime}</strong></div>
                        <div style={{ marginTop: "0.2rem" }}>🏪 Branch: <strong>{o.branchName}</strong></div>
                        <div style={{ marginTop: "0.2rem" }}>🚚 Mode: <strong>{o.deliveryOption === "delivery" ? "Doorstep Catering" : "Store Pickup"}</strong></div>
                      </div>

                      {/* Items Preview */}
                      <div style={{ marginBottom: "0.8rem", fontSize: "0.78rem" }}>
                        <div style={{ color: "var(--text-muted)", marginBottom: "0.3rem" }}>
                          Products ({totalUnits} total items):
                        </div>
                        <ul style={{ margin: 0, paddingLeft: "1.2rem", color: "var(--text-secondary)" }}>
                          {o.items?.map((item, idx) => (
                            <li key={idx} style={{ marginBottom: "0.2rem" }}>
                              {item.name} × <strong>{item.quantity}</strong>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Custom instructions snippet */}
                      {o.customizationRequirements && (
                        <div style={{ fontSize: "0.74rem", color: "var(--gold-400)", marginBottom: "0.8rem" }}>
                          ✨ Customization: <em>{o.customizationRequirements}</em>
                        </div>
                      )}
                    </div>

                    <div>
                      {/* Financials */}
                      <div style={{
                        borderTop: "1px solid rgba(255,255,255,0.06)",
                        paddingTop: "0.6rem",
                        marginBottom: "1rem",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center"
                      }}>
                        <div>
                          <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>Estimated Cost</div>
                          <div style={{ fontSize: "0.9rem", color: "var(--text-secondary)", textDecoration: "line-through" }}>
                            ₹{(o.estimatedCost || 0).toLocaleString("en-IN")}
                          </div>
                        </div>

                        <div style={{ textAlign: "right" }}>
                          <div style={{ fontSize: "0.7rem", color: "#34d399" }}>
                            Final Quoted ({o.discountPercent || 10}% OFF)
                          </div>
                          <strong style={{ fontSize: "1.2rem", color: "var(--gold-400)" }}>
                            ₹{(o.finalQuotationAmount || o.estimatedCost || 0).toLocaleString("en-IN")}
                          </strong>
                        </div>
                      </div>

                      {/* Actions */}
                      <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                        <button
                          onClick={() => handleOpenQuoteModal(o)}
                          className="bk-btn-hero-primary"
                          style={{ flex: 1, padding: "0.5rem", fontSize: "0.78rem", textAlign: "center" }}
                        >
                          ✏️ Provide Quote & Review
                        </button>

                        {/* Quick Status Progression */}
                        {o.status === "quoted" && (
                          <button
                            onClick={() => handleUpdateOrderStatus(o.orderId, "approved")}
                            style={{ padding: "0.5rem 0.8rem", fontSize: "0.78rem", background: "rgba(16, 185, 129, 0.15)", border: "1px solid #10b981", color: "#34d399", borderRadius: "6px", cursor: "pointer" }}
                            title="Approve Order"
                          >
                            ✓ Approve
                          </button>
                        )}

                        {o.status === "approved" && (
                          <button
                            onClick={() => handleUpdateOrderStatus(o.orderId, "in_preparation")}
                            style={{ padding: "0.5rem 0.8rem", fontSize: "0.78rem", background: "rgba(245, 158, 11, 0.15)", border: "1px solid #f59e0b", color: "var(--gold-400)", borderRadius: "6px", cursor: "pointer" }}
                            title="Start Kitchen Preparation"
                          >
                            🧑‍🍳 In Prep
                          </button>
                        )}

                        {o.status === "in_preparation" && (
                          <button
                            onClick={() => handleUpdateOrderStatus(o.orderId, "ready")}
                            style={{ padding: "0.5rem 0.8rem", fontSize: "0.78rem", background: "rgba(56, 189, 248, 0.15)", border: "1px solid #38bdf8", color: "#38bdf8", borderRadius: "6px", cursor: "pointer" }}
                            title="Mark Ready for Pickup/Dispatch"
                          >
                            📦 Ready
                          </button>
                        )}

                        {/* WhatsApp Host Button */}
                        <a
                          href={`https://wa.me/${o.customerPhone.replace(/\D/g, "")}?text=${encodeURIComponent(`Hello ${o.customerName}! We have reviewed your bulk order ${o.orderId} for ${o.eventType}. Our final quote is ₹${o.finalQuotationAmount}.`)}`}
                          target="_blank"
                          rel="noreferrer"
                          style={{
                            padding: "0.5rem 0.75rem",
                            fontSize: "0.78rem",
                            textDecoration: "none",
                            background: "rgba(37, 211, 102, 0.15)",
                            border: "1px solid #25D366",
                            color: "#34d399",
                            borderRadius: "6px"
                          }}
                          title="Contact Customer on WhatsApp"
                        >
                          💬
                        </a>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Quote Review Modal */}
      {editingOrder && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0,0,0,0.85)",
          backdropFilter: "blur(6px)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 10000,
          padding: "1rem"
        }}>
          <div className="glass-panel" style={{
            maxWidth: "550px",
            width: "100%",
            padding: "2rem",
            border: "1px solid rgba(245, 158, 11, 0.35)"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.2rem" }}>
              <div>
                <span className="badge badge-gold" style={{ marginBottom: "0.2rem" }}>Quotation Desk</span>
                <h3 style={{ fontSize: "1.3rem", fontWeight: 800, color: "var(--text-primary)" }}>
                  Review {editingOrder.orderId}
                </h3>
                <div style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
                  Host: {editingOrder.customerName} ({editingOrder.eventType})
                </div>
              </div>
              <button
                onClick={() => setEditingOrder(null)}
                style={{ background: "transparent", border: "none", color: "var(--text-muted)", fontSize: "1.5rem", cursor: "pointer" }}
              >
                ✕
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "1rem", fontSize: "0.85rem" }}>
              <div>
                <label style={{ fontSize: "0.75rem", color: "var(--text-secondary)", display: "block", marginBottom: "0.3rem" }}>
                  Estimated Raw Product Cost:
                </label>
                <div style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--text-primary)" }}>
                  ₹{editingOrder.estimatedCost?.toLocaleString("en-IN")}
                </div>
              </div>

              <div>
                <label style={{ fontSize: "0.75rem", color: "var(--text-secondary)", display: "block", marginBottom: "0.3rem" }}>
                  Volume Discount Percentage (%):
                </label>
                <input
                  type="number"
                  min="0"
                  max="40"
                  value={quoteDiscount}
                  onChange={(e) => setQuoteDiscount(Number(e.target.value))}
                  style={{ width: "100%", padding: "0.6rem", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "6px", color: "#fff" }}
                />
              </div>

              <div>
                <label style={{ fontSize: "0.75rem", color: "var(--text-secondary)", display: "block", marginBottom: "0.3rem" }}>
                  Final Quoted Amount (Post-Discount):
                </label>
                <div style={{ fontSize: "1.4rem", fontWeight: 800, color: "var(--gold-400)" }}>
                  ₹{Math.round(editingOrder.estimatedCost * (1 - quoteDiscount / 100)).toLocaleString("en-IN")}
                </div>
              </div>

              <div>
                <label style={{ fontSize: "0.75rem", color: "var(--text-secondary)", display: "block", marginBottom: "0.3rem" }}>
                  Catering Manager Notes:
                </label>
                <textarea
                  rows="3"
                  value={managerNotes}
                  onChange={(e) => setManagerNotes(e.target.value)}
                  placeholder="e.g. Approved 15% corporate discount. Custom packaging requested."
                  style={{ width: "100%", padding: "0.6rem", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "6px", color: "#fff" }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.8rem", marginTop: "0.5rem" }}>
                <button
                  type="button"
                  onClick={() => setEditingOrder(null)}
                  className="bk-btn-secondary"
                  style={{ padding: "0.6rem 1.2rem" }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveQuotation}
                  className="bk-btn-hero-primary"
                  style={{ padding: "0.6rem 1.5rem" }}
                >
                  Save & Dispatch Quotation
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
