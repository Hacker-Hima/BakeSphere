import { useState, useRef, useEffect } from "react";
import { useNotifications } from "../../context/NotificationContext.jsx";

export const NotificationBell = () => {
  const [isOpen, setIsOpen] = useState(false);
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
    if (!isOpen && unreadCount > 0) {
      // Optional: don't auto-clear so user sees what was unread
    }
  };

  const handleViewBill = (invoice, notifId) => {
    markAsRead(notifId);
    setIsOpen(false);
    openBill(invoice);
  };

  return (
    <div style={{ position: "relative" }} ref={menuRef}>
      {/* Bell Trigger Button */}
      <button
        type="button"
        className="bk-notification-trigger"
        onClick={handleToggle}
        title="View Notifications & Invoices"
        style={{
          background: isOpen ? "var(--crimson-light)" : "var(--bg-page)",
          border: isOpen ? "1.5px solid var(--crimson-500)" : "1px solid var(--border-color)",
          borderRadius: "50%",
          width: "40px",
          height: "40px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "1.15rem",
          cursor: "pointer",
          position: "relative",
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
            width: "360px",
            maxWidth: "90vw",
            background: "var(--bg-surface, #ffffff)",
            border: "1px solid var(--border-color, #e2e8f0)",
            borderRadius: "16px",
            boxShadow: "0 20px 40px -10px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0,0,0,0.05)",
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
              borderBottom: "1px solid var(--border-subtle, #f1f5f9)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              background: "rgba(0,0,0,0.02)"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
              <span style={{ fontWeight: 800, fontSize: "0.95rem", color: "var(--text-primary)" }}>
                Notifications
              </span>
              {unreadCount > 0 && (
                <span
                  style={{
                    background: "rgba(225, 29, 72, 0.12)",
                    color: "var(--crimson-500)",
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

            <div style={{ display: "flex", gap: "0.5rem" }}>
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={markAllAsRead}
                  style={{
                    background: "none",
                    border: "none",
                    color: "var(--crimson-500)",
                    fontSize: "0.72rem",
                    fontWeight: 700,
                    cursor: "pointer",
                    padding: 0
                  }}
                >
                  Mark read
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

          {/* List of items */}
          <div
            style={{
              maxHeight: "340px",
              overflowY: "auto",
              display: "flex",
              flexDirection: "column"
            }}
          >
            {notifications.length === 0 ? (
              <div
                style={{
                  padding: "2.5rem 1rem",
                  textAlign: "center",
                  color: "var(--text-muted)"
                }}
              >
                <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>🔕</div>
                <div style={{ fontWeight: 600, fontSize: "0.85rem" }}>No notifications yet</div>
                <div style={{ fontSize: "0.75rem", marginTop: "2px" }}>
                  Your orders and billing receipts will appear here!
                </div>
              </div>
            ) : (
              notifications.map((item) => (
                <div
                  key={item.id}
                  onClick={() => markAsRead(item.id)}
                  style={{
                    padding: "0.85rem 1.1rem",
                    borderBottom: "1px solid var(--border-subtle, #f1f5f9)",
                    background: item.read ? "transparent" : "rgba(225, 29, 72, 0.04)",
                    display: "flex",
                    gap: "0.75rem",
                    transition: "background 0.15s ease",
                    cursor: "pointer"
                  }}
                >
                  <span style={{ fontSize: "1.3rem", flexShrink: 0 }}>
                    {item.type === "bill" || item.type === "order" ? "🧾" : "🔔"}
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <span style={{ fontWeight: 700, fontSize: "0.84rem", color: "var(--text-primary)" }}>
                        {item.title}
                      </span>
                      <span style={{ fontSize: "0.68rem", color: "var(--text-muted)" }}>
                        {item.time}
                      </span>
                    </div>

                    <p style={{ margin: "0.2rem 0 0.4rem", fontSize: "0.76rem", color: "var(--text-secondary)", lineHeight: 1.35 }}>
                      {item.message}
                    </p>

                    {item.invoice && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewBill(item.invoice, item.id);
                        }}
                        style={{
                          background: "var(--crimson-500)",
                          color: "#ffffff",
                          border: "none",
                          padding: "0.3rem 0.65rem",
                          borderRadius: "6px",
                          fontSize: "0.72rem",
                          fontWeight: 700,
                          cursor: "pointer",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "0.3rem",
                          boxShadow: "0 2px 6px rgba(225, 29, 72, 0.25)"
                        }}
                      >
                        <span>📄</span>
                        <span>View Bill ({item.invoice.invoiceNumber || "Invoice"})</span>
                      </button>
                    )}
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
