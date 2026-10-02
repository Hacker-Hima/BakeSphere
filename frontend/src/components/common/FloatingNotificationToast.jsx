import { useNotifications } from "../../context/NotificationContext.jsx";

export const FloatingNotificationToast = () => {
  const { toast, dismissToast, openBill } = useNotifications();

  if (!toast) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: "85px",
        right: "24px",
        zIndex: 9998,
        maxWidth: "400px",
        width: "calc(100vw - 48px)",
        background: "#ffffff",
        color: "#1e293b",
        borderRadius: "14px",
        boxShadow: "0 20px 40px -10px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(225, 29, 72, 0.2)",
        padding: "1rem 1.2rem",
        display: "flex",
        alignItems: "flex-start",
        gap: "0.85rem",
        animation: "bkSlideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
        borderLeft: "5px solid #e11d48"
      }}
    >
      <div style={{ fontSize: "1.6rem", flexShrink: 0 }}>
        {toast.icon || "🧾"}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <h4 style={{ margin: 0, fontSize: "0.92rem", fontWeight: 800, color: "#1e293b" }}>
            {toast.title}
          </h4>
          <button
            type="button"
            onClick={dismissToast}
            style={{
              background: "none",
              border: "none",
              color: "#94a3b8",
              fontSize: "1rem",
              cursor: "pointer",
              padding: "0 0 0 8px"
            }}
          >
            ✕
          </button>
        </div>

        <p style={{ margin: "0.25rem 0 0.6rem", fontSize: "0.78rem", color: "#64748b", lineHeight: 1.4 }}>
          {toast.message}
        </p>

        {toast.invoice && (
          <button
            type="button"
            onClick={() => {
              openBill(toast.invoice);
              dismissToast();
            }}
            style={{
              background: "linear-gradient(135deg, #be123c, #881337)",
              color: "#ffffff",
              border: "none",
              borderRadius: "8px",
              padding: "0.35rem 0.85rem",
              fontSize: "0.76rem",
              fontWeight: 700,
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: "0.35rem",
              boxShadow: "0 2px 8px rgba(190, 18, 60, 0.25)"
            }}
          >
            <span>📄</span>
            <span>View Tax Invoice</span>
          </button>
        )}
      </div>
    </div>
  );
};
