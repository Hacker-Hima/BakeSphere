import { useState, useRef, useEffect } from "react";
import { useNotifications } from "../../context/NotificationContext.jsx";

export const NotificationBell = ({ onNavigateTab }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filterType, setFilterType] = useState("ALL");
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    clearNotifications,
    openBill
  } = useNotifications();

  const menuRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  const handleViewBill = (invoice, notifId) => {
    markAsRead(notifId);
    setIsOpen(false);
    openBill(invoice);
  };

  const handleQuickAction = (item) => {
    markAsRead(item.id);
    setIsOpen(false);
    if (item.invoice) {
      openBill(item.invoice);
    } else if (item.targetTab && onNavigateTab) {
      onNavigateTab(item.targetTab);
    } else if (item.type === "clearance" && onNavigateTab) {
      onNavigateTab("storefront");
    } else if (item.type === "stock" && onNavigateTab) {
      onNavigateTab("inventory");
    } else if (item.type === "quote" && onNavigateTab) {
      onNavigateTab("bulk-order");
    }
  };

  const filteredNotifs = notifications.filter((n) => {
    if (filterType === "ALL") return true;
    if (filterType === "clearance") return n.type === "clearance";
    if (filterType === "orders") return n.type === "bill" || n.type === "order" || n.type === "quote";
    if (filterType === "stock") return n.type === "stock";
    return true;
  });

  return (
    <div style={{ position: "relative" }} ref={menuRef}>
      {/* Bell Trigger Button */}
      <button
        type="button"
        className="bk-notification-trigger"
        onClick={handleToggle}
        title="View Notifications & Live Alerts"
        style={{
          background: isOpen ? "#fff7ed" : "#ffffff",
          border: isOpen ? "1.5px solid #d97706" : "1.5px solid rgba(225, 205, 185, 0.65)",
          borderRadius: "50%",
          width: "40px",
          height: "40px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "1.15rem",
          cursor: "pointer",
          position: "relative",
          boxShadow: "0 2px 6px rgba(0, 0, 0, 0.04)",
          transition: "all 0.2s ease"
        }}
      >
        <span>🔔</span>
        {unreadCount > 0 && (
          <span
            style={{
              position: "absolute",
              top: "-2px",
              right: "-2px",
              background: "#e11d48",
              color: "#ffffff",
              fontSize: "0.68rem",
              fontWeight: 800,
              minWidth: "18px",
              height: "18px",
              borderRadius: "999px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "0 4px",
              boxShadow: "0 0 10px rgba(225, 29, 72, 0.6)",
              animation: "pulse 2s infinite"
            }}
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Notifications Dropdown Card */}
      {isOpen && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 10px)",
            right: 0,
            width: "390px",
            maxWidth: "92vw",
            background: "#121622",
            border: "1px solid var(--border-color, #2a344d)",
            borderRadius: "16px",
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(255,255,255,0.06)",
            zIndex: 1050,
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            animation: "bkNotifFade 0.2s cubic-bezier(0.16, 1, 0.3, 1)"
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: "0.9rem 1.1rem",
              borderBottom: "1px solid rgba(255,255,255,0.08)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              background: "rgba(0,0,0,0.3)"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
              <span style={{ fontWeight: 800, fontSize: "0.95rem", color: "var(--gold-400, #fbbf24)" }}>
                Central Alert Center
              </span>
              {unreadCount > 0 && (
                <span
                  style={{
                    background: "rgba(225, 29, 72, 0.2)",
                    color: "#fb7185",
                    fontSize: "0.7rem",
                    fontWeight: 800,
                    padding: "0.1rem 0.45rem",
                    borderRadius: "999px"
                  }}
                >
                  {unreadCount} new
                </span>
              )}
            </div>

            <div style={{ display: "flex", gap: "0.6rem" }}>
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={markAllAsRead}
                  style={{
                    background: "none",
                    border: "none",
                    color: "var(--gold-400)",
                    fontSize: "0.72rem",
                    fontWeight: 700,
                    cursor: "pointer",
                    padding: 0
                  }}
                >
                  Mark all read
                </button>
              )}
              {notifications.length > 0 && (
                <button
                  type="button"
                  onClick={clearNotifications}
                  style={{
                    background: "none",
                    border: "none",
                    color: "var(--text-muted)",
                    fontSize: "0.72rem",
                    cursor: "pointer",
                    padding: 0
                  }}
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Filter Pills */}
          <div
            style={{
              display: "flex",
              gap: "0.4rem",
              padding: "0.6rem 0.9rem",
              background: "rgba(0,0,0,0.25)",
              borderBottom: "1px solid rgba(255,255,255,0.06)",
              flexWrap: "wrap"
            }}
          >
            {[
              { id: "ALL", label: "All" },
              { id: "clearance", label: "🔥 Clearance Deals" },
              { id: "orders", label: "🧾 Orders & Quotes" },
              { id: "stock", label: "⏱️ Stock & Kitchen" }
            ].map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setFilterType(f.id)}
                style={{
                  background: filterType === f.id ? "var(--gold-500, #f59e0b)" : "rgba(255,255,255,0.06)",
                  color: filterType === f.id ? "#000000" : "#cbd5e1",
                  border: filterType === f.id ? "none" : "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "14px",
                  padding: "0.3rem 0.65rem",
                  fontSize: "0.72rem",
                  fontWeight: 700,
                  cursor: "pointer",
                  transition: "all 0.15s ease"
                }}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* List of items */}
          <div
            style={{
              maxHeight: "360px",
              overflowY: "auto",
              display: "flex",
              flexDirection: "column"
            }}
          >
            {filteredNotifs.length === 0 ? (
              <div
                style={{
                  padding: "2.5rem 1rem",
                  textAlign: "center",
                  color: "var(--text-muted)"
                }}
              >
                <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>🔕</div>
                <div style={{ fontWeight: 600, fontSize: "0.85rem", color: "#cbd5e1" }}>No alerts in this category</div>
                <div style={{ fontSize: "0.75rem", marginTop: "2px" }}>
                  Clearance deals, orders, and stock updates will pop up here live!
                </div>
              </div>
            ) : (
              filteredNotifs.map((item) => (
                <div
                  key={item.id}
                  onClick={() => markAsRead(item.id)}
                  style={{
                    padding: "0.85rem 1.1rem",
                    borderBottom: "1px solid rgba(255,255,255,0.06)",
                    background: item.read ? "transparent" : "rgba(245, 158, 11, 0.04)",
                    display: "flex",
                    gap: "0.75rem",
                    transition: "background 0.15s ease",
                    cursor: "pointer"
                  }}
                >
                  <span style={{ fontSize: "1.3rem", flexShrink: 0 }}>
                    {item.type === "clearance"
                      ? "🔥"
                      : item.type === "bill" || item.type === "order"
                      ? "🧾"
                      : item.type === "stock"
                      ? "⏱️"
                      : item.type === "quote"
                      ? "📋"
                      : "🔔"}
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <span
                        style={{
                          fontWeight: 700,
                          fontSize: "0.84rem",
                          color: item.read ? "#ffffff" : "var(--gold-400)"
                        }}
                      >
                        {item.title}
                      </span>
                      <span style={{ fontSize: "0.68rem", color: "var(--text-muted)" }}>
                        {item.time}
                      </span>
                    </div>

                    <p style={{ margin: "0.2rem 0 0.4rem", fontSize: "0.76rem", color: "var(--text-secondary)", lineHeight: 1.35 }}>
                      {item.message}
                    </p>

                    <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
                      {item.invoice && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewBill(item.invoice, item.id);
                          }}
                          style={{
                            background: "var(--gold-500)",
                            color: "#000000",
                            border: "none",
                            padding: "0.25rem 0.6rem",
                            borderRadius: "6px",
                            fontSize: "0.7rem",
                            fontWeight: 800,
                            cursor: "pointer",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "0.3rem"
                          }}
                        >
                          <span>📄</span>
                          <span>View Bill ({item.invoice.invoiceNumber || "Invoice"})</span>
                        </button>
                      )}

                      {(item.targetTab || item.type === "clearance" || item.type === "stock" || item.type === "quote") && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleQuickAction(item);
                          }}
                          style={{
                            background: "rgba(255, 255, 255, 0.08)",
                            color: "#cbd5e1",
                            border: "1px solid rgba(255, 255, 255, 0.15)",
                            padding: "0.25rem 0.6rem",
                            borderRadius: "6px",
                            fontSize: "0.7rem",
                            fontWeight: 700,
                            cursor: "pointer"
                          }}
                        >
                          {item.type === "clearance"
                            ? "⚡ Grab Deal"
                            : item.type === "stock"
                            ? "⏱️ Inspect Stock"
                            : item.type === "quote"
                            ? "📋 View Desk"
                            : "→ View Module"}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

