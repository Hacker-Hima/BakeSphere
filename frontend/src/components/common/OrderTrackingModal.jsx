import { useState, useEffect } from "react";
import { useNotifications } from "../../context/NotificationContext.jsx";

export const OrderTrackingModal = ({ isOpen, onClose, activeOrder = null }) => {
  const { openBill } = useNotifications();

  // Simulated 5-stage kitchen & delivery lifecycle
  const [currentStage, setCurrentStage] = useState(3); // 1 to 5
  const [carrierTemp, setCarrierTemp] = useState(3.8); // °C
  const [countdownMinutes, setCountdownMinutes] = useState(32);
  const [isSimulating, setIsSimulating] = useState(false);

  // Default fallback order if none passed
  const order = activeOrder || {
    orderId: "BS-89421",
    invoiceNumber: "INV-89421",
    type: "storefront",
    customerName: "Aaditya Raman",
    customerPhone: "+91 98401 23456",
    deliveryAddress: "42 Venkatnarayana Rd, T. Nagar, Chennai 600017",
    deliverySlot: "Express 2-Hour Delivery",
    items: [
      { name: "Belgian Dark Truffle Cake (1.0 kg)", quantity: 1, lineTotal: 849 },
      { name: "French Butter Croissant (Set of 2)", quantity: 1, lineTotal: 299 }
    ],
    grandTotal: 1198.0
  };

  // Temperature micro-fluctuation simulation (IoT cold-chain telemetry)
  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => {
      setCarrierTemp((prev) => {
        const delta = (Math.random() - 0.5) * 0.2;
        return parseFloat(Math.max(2.8, Math.min(4.4, prev + delta)).toFixed(1));
      });
    }, 3500);
    return () => clearInterval(interval);
  }, [isOpen]);

  // Countdown timer
  useEffect(() => {
    if (!isOpen) return;
    const timer = setInterval(() => {
      setCountdownMinutes((prev) => (prev > 1 ? prev - 1 : 1));
    }, 60000);
    return () => clearInterval(timer);
  }, [isOpen]);

  if (!isOpen) return null;

  const stages = [
    {
      step: 1,
      title: "Order Placed & Tax Invoiced",
      desc: "Electronic GST bill generated & payment verified.",
      time: "10 mins ago",
      icon: "🧾"
    },
    {
      step: 2,
      title: "Chef Assigned & Recipe Scaled",
      desc: "Master Chef Pierre Bouchard prepping Normandy butter batter.",
      time: "8 mins ago",
      icon: "🧑‍🍳"
    },
    {
      step: 3,
      title: "Baking in Artisan Deck Oven",
      desc: "Baking at 185°C with precision steam injection.",
      time: "Active Now",
      icon: "🔥"
    },
    {
      step: 4,
      title: "Quality Check & Cold-Chain Packing",
      desc: "Blast-chilled to 4°C with insulated tamper-evident seal.",
      time: "Next in 8 mins",
      icon: "❄️"
    },
    {
      step: 5,
      title: "Dispatched via Refrigerated EV",
      desc: "Courier Murugan S. en-route to your delivery address.",
      time: "Final Handover",
      icon: "🛵"
    }
  ];

  const handleNextStage = () => {
    setIsSimulating(true);
    setCurrentStage((prev) => {
      const next = prev < 5 ? prev + 1 : 1;
      if (next === 5) setCountdownMinutes(12);
      if (next === 4) setCountdownMinutes(20);
      if (next === 3) setCountdownMinutes(32);
      if (next === 1) setCountdownMinutes(45);
      return next;
    });
    setTimeout(() => setIsSimulating(false), 300);
  };

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
        className="bk-tracker-card"
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "var(--bg-card, #ffffff)",
          color: "var(--text-primary, #1e293b)",
          width: "100%",
          maxWidth: "680px",
          borderRadius: "20px",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.55), 0 0 0 1px var(--border-color, rgba(0,0,0,0.1))",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          maxHeight: "92vh",
          animation: "bkBillScale 0.25s cubic-bezier(0.16, 1, 0.3, 1)"
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "1.1rem 1.5rem",
            background: "linear-gradient(135deg, #e11d48 0%, #9f1239 100%)",
            color: "#ffffff",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexShrink: 0
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <span style={{ fontSize: "1.6rem" }}>🛵</span>
            <div>
              <div style={{ fontWeight: 800, fontSize: "1.05rem", letterSpacing: "0.01em" }}>
                Live Kitchen & Delivery Radar
              </div>
              <div style={{ fontSize: "0.74rem", opacity: 0.9 }}>
                Order #{order.orderId} • {order.deliverySlot || "Express Delivery"}
              </div>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
            <button
              type="button"
              onClick={handleNextStage}
              className="bk-btn-tracker-sim"
              style={{
                background: "rgba(255, 255, 255, 0.2)",
                border: "1px solid rgba(255, 255, 255, 0.35)",
                color: "#ffffff",
                padding: "0.35rem 0.75rem",
                borderRadius: "8px",
                fontSize: "0.74rem",
                fontWeight: 700,
                cursor: "pointer",
                transition: "all 0.15s ease"
              }}
              title="Demo action: Simulate progression through kitchen stages"
            >
              <span>⚡ Sim Stage ({currentStage}/5)</span>
            </button>

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
        </div>

        {/* Modal Scrollable Body */}
        <div style={{ padding: "1.5rem", overflowY: "auto", flex: 1, display: "flex", flexDirection: "column", gap: "1.2rem" }}>
          
          {/* Top Live ETA & Cold-Chain Telemetry Pill */}
          <div
            style={{
              background: "linear-gradient(135deg, rgba(225, 29, 72, 0.08) 0%, rgba(20, 24, 33, 0.04) 100%)",
              border: "1.5px solid var(--border-color, #e2e8f0)",
              borderRadius: "14px",
              padding: "1rem 1.25rem",
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "1rem"
            }}
          >
            <div>
              <div style={{ fontSize: "0.72rem", color: "var(--text-muted, #64748b)", textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.05em" }}>
                Estimated Handover
              </div>
              <div style={{ fontSize: "1.6rem", fontWeight: 900, color: "var(--crimson-500, #e11d48)", display: "flex", alignItems: "baseline", gap: "0.3rem", marginTop: "2px" }}>
                <span>{countdownMinutes}</span>
                <span style={{ fontSize: "0.9rem", fontWeight: 600, color: "var(--text-secondary)" }}>minutes</span>
              </div>
              <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "2px" }}>
                📍 Delivering to: <strong style={{ color: "var(--text-primary)" }}>{order.deliveryAddress?.split(",")[0] || "Chennai"}</strong>
              </div>
            </div>

            {/* IoT Temperature Telemetry */}
            <div style={{ borderLeft: "1px solid var(--border-color, #e2e8f0)", paddingLeft: "1rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "0.72rem", color: "var(--text-muted, #64748b)", textTransform: "uppercase", fontWeight: 700 }}>
                  Cold-Chain Telemetry
                </span>
                <span style={{
                  background: "#dcfce7",
                  color: "#15803d",
                  fontSize: "0.65rem",
                  fontWeight: 800,
                  padding: "0.1rem 0.4rem",
                  borderRadius: "999px"
                }}>
                  LIVE SENSOR
                </span>
              </div>
              <div style={{ fontSize: "1.4rem", fontWeight: 800, color: "#059669", display: "flex", alignItems: "baseline", gap: "0.2rem", marginTop: "2px" }}>
                <span>❄️ {carrierTemp}°C</span>
                <span style={{ fontSize: "0.75rem", color: "#10b981", fontWeight: 700 }}>Optimal Range</span>
              </div>
              <div style={{ fontSize: "0.74rem", color: "var(--text-muted)", marginTop: "2px" }}>
                Monitored via IoT Refrigerated Carrier Box
              </div>
            </div>
          </div>

          {/* 5-Stage Visual Progress Timeline */}
          <div>
            <div style={{ fontSize: "0.82rem", fontWeight: 800, color: "var(--text-primary)", marginBottom: "0.8rem", textTransform: "uppercase", letterSpacing: "0.04em" }}>
              Kitchen & Handover Progress
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.8rem", position: "relative" }}>
              {stages.map((st) => {
                const isPassed = st.step < currentStage;
                const isCurrent = st.step === currentStage;
                const isUpcoming = st.step > currentStage;

                return (
                  <div
                    key={st.step}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: "0.9rem",
                      padding: "0.75rem 1rem",
                      borderRadius: "12px",
                      background: isCurrent
                        ? "linear-gradient(90deg, rgba(225, 29, 72, 0.12) 0%, rgba(225, 29, 72, 0.02) 100%)"
                        : isPassed
                        ? "var(--bg-surface, #f8fafc)"
                        : "transparent",
                      border: isCurrent
                        ? "1.5px solid var(--crimson-500, #e11d48)"
                        : isPassed
                        ? "1px solid var(--border-color, #e2e8f0)"
                        : "1px dashed var(--border-color, #cbd5e1)",
                      opacity: isUpcoming ? 0.6 : 1,
                      transition: "all 0.25s ease"
                    }}
                  >
                    {/* Step Icon Badge */}
                    <div
                      style={{
                        width: "36px",
                        height: "36px",
                        borderRadius: "50%",
                        background: isCurrent
                          ? "var(--crimson-500, #e11d48)"
                          : isPassed
                          ? "#10b981"
                          : "var(--border-color, #e2e8f0)",
                        color: isCurrent || isPassed ? "#ffffff" : "var(--text-muted)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "1rem",
                        fontWeight: 800,
                        flexShrink: 0,
                        boxShadow: isCurrent ? "0 4px 12px rgba(225, 29, 72, 0.35)" : "none"
                      }}
                    >
                      {isPassed ? "✓" : st.icon}
                    </div>

                    {/* Step Details */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div style={{
                          fontWeight: 700,
                          fontSize: "0.88rem",
                          color: isCurrent ? "var(--crimson-500, #e11d48)" : "var(--text-primary)"
                        }}>
                          {st.title}
                        </div>
                        <span style={{
                          fontSize: "0.72rem",
                          fontWeight: 700,
                          color: isCurrent ? "var(--crimson-500)" : isPassed ? "#059669" : "var(--text-muted)"
                        }}>
                          {st.time}
                        </span>
                      </div>
                      <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginTop: "2px" }}>
                        {st.desc}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Assigned Courier / Rider Card */}
          <div
            style={{
              background: "var(--bg-surface, #f8fafc)",
              border: "1px solid var(--border-color, #e2e8f0)",
              borderRadius: "14px",
              padding: "0.9rem 1.2rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "1rem"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.8rem" }}>
              <div
                style={{
                  width: "44px",
                  height: "44px",
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #be123c 0%, #881337 100%)",
                  color: "#ffffff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "1.3rem",
                  flexShrink: 0
                }}
              >
                🛵
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: "0.88rem", color: "var(--text-primary)" }}>
                  Murugan Shanmugam
                </div>
                <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                  Artisan Express Courier • <span style={{ color: "#f59e0b", fontWeight: 700 }}>4.95 ★</span> (1,420 Deliveries)
                </div>
                <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>
                  EV Refrigerated Pod: <strong style={{ color: "var(--text-primary)" }}>TN-01-BK-8842</strong>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => alert("Calling courier: +91 98402 77819 (Simulated)")}
              style={{
                background: "var(--crimson-500)",
                color: "#ffffff",
                border: "none",
                borderRadius: "10px",
                padding: "0.5rem 0.9rem",
                fontSize: "0.78rem",
                fontWeight: 700,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "0.4rem"
              }}
            >
              <span>📞</span>
              <span>Call Rider</span>
            </button>
          </div>

          {/* Items Summary & Direct Invoice Trigger */}
          <div
            style={{
              borderTop: "1px solid var(--border-color, #e2e8f0)",
              paddingTop: "1rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: "0.8rem"
            }}
          >
            <div>
              <div style={{ fontSize: "0.74rem", color: "var(--text-muted)" }}>Order Contents:</div>
              <div style={{ fontSize: "0.84rem", fontWeight: 700, color: "var(--text-primary)" }}>
                {order.items?.map((it) => `${it.quantity}x ${it.name}`).join(", ") || "Artisanal Bakery Selection"}
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
              <button
                type="button"
                onClick={() => {
                  if (order.invoice) {
                    openBill(order.invoice);
                  } else {
                    openBill(order);
                  }
                }}
                className="btn-gold"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.4rem",
                  padding: "0.55rem 1rem",
                  fontSize: "0.82rem",
                  borderRadius: "8px"
                }}
              >
                <span>🧾</span>
                <span>View Tax Invoice</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                style={{
                  background: "var(--bg-surface, #f1f5f9)",
                  color: "var(--text-primary)",
                  border: "1px solid var(--border-color, #cbd5e1)",
                  borderRadius: "8px",
                  padding: "0.55rem 0.9rem",
                  fontSize: "0.82rem",
                  fontWeight: 600,
                  cursor: "pointer"
                }}
              >
                Done
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
