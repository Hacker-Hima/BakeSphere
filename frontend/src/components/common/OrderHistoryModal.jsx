import { useState, useEffect } from "react";
import { useNotifications } from "../../context/NotificationContext.jsx";

export const OrderHistoryModal = ({ isOpen, onClose, onTrackOrder, onReorder }) => {
  const { openBill } = useNotifications();
  const [filterType, setFilterType] = useState("all"); // "all" | "storefront" | "custom_cake"
  const [orders, setOrders] = useState([]);

  // Load orders from localStorage and default history
  useEffect(() => {
    if (!isOpen) return;

    try {
      const storedInvoices = JSON.parse(localStorage.getItem("bakesphere_invoices") || "[]");
      
      // Default sample authentic past orders if none yet
      const defaultHistory = [
        {
          orderId: "BS-89421",
          invoiceNumber: "INV-89421",
          type: "storefront",
          orderDate: "02/10/2026",
          orderTime: "11:30 AM",
          grandTotal: 1198.0,
          status: "Baking in Oven",
          deliverySlot: "Express within 2 Hours",
          items: [
            { name: "Belgian Dark Truffle Cake", weight: "1.0 kg", quantity: 1, unitPrice: 849, lineTotal: 849 },
            { name: "French Butter Croissant", weight: "Pack of 2", quantity: 1, unitPrice: 299, lineTotal: 299 }
          ]
        },
        {
          orderId: "BS-CK-89504",
          invoiceNumber: "INV-CK-89504",
          type: "custom_cake",
          orderDate: "01/10/2026",
          orderTime: "04:15 PM",
          grandTotal: 4987.5,
          status: "Confirmed & Invoiced",
          deliverySlot: "Standard 48-Hour Artisanal Crafting",
          customDetails: {
            tiers: 3,
            weightKg: 6,
            shape: "Round",
            baseFlavor: "Belgian Dark Chocolate",
            filling: "Belgian Dark Ganache",
            theme: "Floral Elegance & Gold Leaf",
            cakeMessage: "Happy 25th Anniversary! ✨",
            advancePaid: 2493.75,
            balanceDue: 2493.75
          },
          items: [
            { name: "Custom 3-Tier Celebration Cake (6 kg)", weight: "3 Tiers • Belgian Dark Chocolate", quantity: 1, unitPrice: 3850, lineTotal: 3850 },
            { name: "Tier Architectural Engineering", weight: "Structural Support", quantity: 1, unitPrice: 450, lineTotal: 450 },
            { name: "24K Edible Gold Leaf Embellishment", weight: "Artisan Topping", quantity: 1, unitPrice: 300, lineTotal: 300 }
          ]
        },
        {
          orderId: "BS-87310",
          invoiceNumber: "INV-87310",
          type: "storefront",
          orderDate: "28/09/2026",
          orderTime: "02:40 PM",
          grandTotal: 589.0,
          status: "Delivered",
          deliverySlot: "Same-Day Delivery",
          items: [
            { name: "Lotus Biscoff Cheesecake Jar", weight: "200 ml", quantity: 2, unitPrice: 199, lineTotal: 398 },
            { name: "Filter Coffee Tiramisu Cup", weight: "Regular", quantity: 1, unitPrice: 169, lineTotal: 169 }
          ]
        }
      ];

      // Merge stored invoices with defaults, avoiding duplicates by orderId
      const allOrders = [...storedInvoices];
      defaultHistory.forEach((def) => {
        if (!allOrders.some((o) => o.orderId === def.orderId)) {
          allOrders.push(def);
        }
      });

      setOrders(allOrders);
    } catch (e) {
      console.error(e);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const filteredOrders = orders.filter((o) => {
    if (filterType === "all") return true;
    if (filterType === "custom_cake") return o.type === "custom_cake" || o.orderId?.includes("-CK-");
    if (filterType === "storefront") return o.type !== "custom_cake" && !o.orderId?.includes("-CK-");
    return true;
  });

  return (
    <div
      className="bk-bill-modal-overlay"
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: "rgba(10, 12, 18, 0.78)",
        backdropFilter: "blur(8px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem"
      }}
    >
      <div
        className="bk-history-card"
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "var(--bg-card, #ffffff)",
          color: "var(--text-primary, #1e293b)",
          width: "100%",
          maxWidth: "760px",
          borderRadius: "20px",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.55), 0 0 0 1px var(--border-color, rgba(0,0,0,0.1))",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          maxHeight: "90vh",
          animation: "bkBillScale 0.25s cubic-bezier(0.16, 1, 0.3, 1)"
        }}
      >
        {/* Header Bar */}
        <div
          style={{
            padding: "1.2rem 1.6rem",
            background: "linear-gradient(135deg, #be123c 0%, #881337 100%)",
            color: "#ffffff",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexShrink: 0
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <span style={{ fontSize: "1.6rem" }}>📦</span>
            <div>
              <div style={{ fontWeight: 800, fontSize: "1.1rem" }}>
                My Past Orders & Tax Invoices
              </div>
              <div style={{ fontSize: "0.74rem", opacity: 0.9 }}>
                BakeSphere Customer Order Archive & Live Kitchen Trackers
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{
              background: "rgba(255, 255, 255, 0.18)",
              border: "none",
              color: "#ffffff",
              width: "32px",
              height: "32px",
              borderRadius: "50%",
              fontSize: "1rem",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            ✕
          </button>
        </div>

        {/* Filter Tabs */}
        <div
          style={{
            padding: "0.8rem 1.6rem",
            background: "var(--bg-surface, #f8fafc)",
            borderBottom: "1px solid var(--border-color, #e2e8f0)",
            display: "flex",
            gap: "0.6rem"
          }}
        >
          {[
            { id: "all", label: `All Orders (${orders.length})` },
            { id: "storefront", label: "Bakery Orders" },
            { id: "custom_cake", label: "🎂 3D Custom Cakes" }
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilterType(tab.id)}
              style={{
                padding: "0.4rem 0.9rem",
                borderRadius: "999px",
                fontSize: "0.8rem",
                fontWeight: filterType === tab.id ? 700 : 500,
                background: filterType === tab.id ? "var(--crimson-500, #e11d48)" : "transparent",
                color: filterType === tab.id ? "#ffffff" : "var(--text-secondary)",
                border: filterType === tab.id ? "none" : "1px solid var(--border-color, #cbd5e1)",
                cursor: "pointer",
                transition: "all 0.15s ease"
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Orders Scrollable List */}
        <div style={{ padding: "1.4rem 1.6rem", overflowY: "auto", flex: 1, display: "flex", flexDirection: "column", gap: "1rem" }}>
          {filteredOrders.length === 0 ? (
            <div style={{ textAlign: "center", padding: "3rem 1rem", color: "var(--text-muted)" }}>
              <div style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>📭</div>
              <div style={{ fontWeight: 700, fontSize: "1rem", color: "var(--text-primary)" }}>No orders found in this category</div>
              <div style={{ fontSize: "0.82rem", marginTop: "4px" }}>Place an order from the bakery or 3D Cake Studio to view invoices here.</div>
            </div>
          ) : (
            filteredOrders.map((ord) => {
              const isCustomCake = ord.type === "custom_cake" || ord.orderId?.includes("-CK-");
              return (
                <div
                  key={ord.orderId}
                  style={{
                    background: "var(--bg-surface, #f8fafc)",
                    border: "1px solid var(--border-color, #e2e8f0)",
                    borderRadius: "14px",
                    padding: "1.2rem",
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.8rem",
                    transition: "transform 0.15s, box-shadow 0.15s"
                  }}
                >
                  {/* Top Row: Order ID, Type Badge, Date */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.5rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                      <span style={{ fontWeight: 800, fontSize: "0.95rem", color: "var(--crimson-500, #e11d48)" }}>
                        #{ord.orderId}
                      </span>
                      <span style={{
                        background: isCustomCake ? "#fdf2f8" : "#f0fdf4",
                        color: isCustomCake ? "#9d174d" : "#166534",
                        border: isCustomCake ? "1px solid #fbcfe8" : "1px solid #bbf7d0",
                        fontSize: "0.7rem",
                        fontWeight: 700,
                        padding: "0.15rem 0.5rem",
                        borderRadius: "999px"
                      }}>
                        {isCustomCake ? "🎂 3D Custom Cake" : "🥐 Bakery Storefront"}
                      </span>
                    </div>

                    <div style={{ fontSize: "0.76rem", color: "var(--text-muted)" }}>
                      📅 {ord.orderDate || "Recent"} • {ord.orderTime || ""}
                    </div>
                  </div>

                  {/* Items summary */}
                  <div style={{ fontSize: "0.84rem", color: "var(--text-primary)" }}>
                    {ord.items && ord.items.length > 0 ? (
                      ord.items.map((it, idx) => (
                        <div key={idx} style={{ display: "flex", justifyContent: "space-between", color: "var(--text-secondary)", fontSize: "0.82rem", marginBottom: "2px" }}>
                          <span>• {it.quantity || 1}x {it.name} {it.weight ? `(${it.weight})` : ""}</span>
                          <span style={{ fontWeight: 600 }}>₹{(it.lineTotal || it.unitPrice || 0).toFixed(2)}</span>
                        </div>
                      ))
                    ) : (
                      <div>Artisanal Bakery Selection</div>
                    )}
                  </div>

                  {/* Custom Cake Special Message if any */}
                  {ord.customDetails?.cakeMessage && (
                    <div style={{
                      fontSize: "0.76rem",
                      background: "#fff1f2",
                      border: "1px dashed #fecdd3",
                      color: "#9f1239",
                      padding: "0.35rem 0.65rem",
                      borderRadius: "6px",
                      fontStyle: "italic"
                    }}>
                      "{ord.customDetails.cakeMessage}"
                    </div>
                  )}

                  {/* Bottom Row: Total, Status, Action Buttons */}
                  <div style={{
                    borderTop: "1px solid var(--border-color, #e2e8f0)",
                    paddingTop: "0.75rem",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: "0.8rem"
                  }}>
                    <div>
                      <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", textTransform: "uppercase" }}>Total Billed</div>
                      <div style={{ fontSize: "1.15rem", fontWeight: 900, color: "var(--crimson-500, #e11d48)" }}>
                        ₹{Number(ord.grandTotal || ord.finalTotal || 0).toFixed(2)}
                      </div>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      {/* View Tax Invoice Button */}
                      <button
                        type="button"
                        onClick={() => openBill(ord)}
                        style={{
                          background: "var(--bg-card, #ffffff)",
                          border: "1px solid var(--border-color, #cbd5e1)",
                          color: "var(--text-primary)",
                          padding: "0.45rem 0.85rem",
                          borderRadius: "8px",
                          fontSize: "0.78rem",
                          fontWeight: 700,
                          cursor: "pointer",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "0.35rem"
                        }}
                        title="View Official GST Tax Invoice"
                      >
                        <span>🧾</span>
                        <span>View Invoice</span>
                      </button>

                      {/* Track Live Order Button */}
                      <button
                        type="button"
                        onClick={() => {
                          if (onTrackOrder) onTrackOrder(ord);
                          onClose();
                        }}
                        style={{
                          background: "linear-gradient(135deg, #e11d48 0%, #be123c 100%)",
                          border: "none",
                          color: "#ffffff",
                          padding: "0.45rem 0.85rem",
                          borderRadius: "8px",
                          fontSize: "0.78rem",
                          fontWeight: 700,
                          cursor: "pointer",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "0.35rem"
                        }}
                        title="Track Live Kitchen & Delivery Status"
                      >
                        <span>🛵</span>
                        <span>Track Live</span>
                      </button>

                      {/* Reorder Button */}
                      {onReorder && ord.items && ord.items.length > 0 && !isCustomCake && (
                        <button
                          type="button"
                          onClick={() => {
                            onReorder(ord.items);
                            onClose();
                          }}
                          style={{
                            background: "var(--crimson-light, rgba(225, 29, 72, 0.1))",
                            border: "1px solid var(--crimson-border, rgba(225, 29, 72, 0.3))",
                            color: "var(--crimson-500)",
                            padding: "0.45rem 0.75rem",
                            borderRadius: "8px",
                            fontSize: "0.78rem",
                            fontWeight: 700,
                            cursor: "pointer"
                          }}
                          title="Add items to cart again"
                        >
                          🔁 Reorder
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
