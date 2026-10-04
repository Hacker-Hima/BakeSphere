import { createContext, useContext, useState, useEffect } from "react";

const NotificationContext = createContext();

const INITIAL_NOTIFICATIONS = [
  {
    id: 1,
    title: "Welcome to BakeSphere Patisserie! 🥐",
    message: "Explore our handcrafted cakes, artisanal sourdough loaves, and smart billing.",
    time: "Earlier today",
    read: true,
    type: "info"
  },
  {
    id: 2,
    title: "Special Offer Available ✨",
    message: "Use code SWEET15 at checkout for flat 15% off your celebration cakes!",
    time: "1 hour ago",
    read: false,
    type: "promo"
  }
];

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState(() => {
    try {
      const saved = localStorage.getItem("bakesphere_notifications");
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return INITIAL_NOTIFICATIONS;
  });

  const [activeBill, setActiveBill] = useState(null);
  const [toast, setToast] = useState(null);

  // Persist to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("bakesphere_notifications", JSON.stringify(notifications));
    } catch (e) {
      console.error(e);
    }
  }, [notifications]);

  // Synthesized notification chime (zero external audio files)
  const playChime = () => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15); // A5
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.4);
    } catch {
      // AudioContext might be restricted before first click, safe to ignore
    }
  };

  // Add Notification with deduplication
  const addNotification = ({
    title,
    message,
    type = "order",
    invoice = null,
    actionUrl = null,
    targetTab = null
  }) => {
    let wasAdded = false;
    setNotifications((prev) => {
      // Check if identical notification was created in last 4 seconds
      const isDuplicate = prev.some(
        (n) => n.title === title && n.message === message && Date.now() - (n.createdAt || 0) < 4000
      );
      if (isDuplicate) return prev;

      wasAdded = true;
      const newNotif = {
        id: Date.now() + Math.random(),
        createdAt: Date.now(),
        title,
        message,
        time: "Just now",
        read: false,
        type, // "order" | "bill" | "clearance" | "quote" | "stock" | "promo" | "info"
        invoice,
        actionUrl,
        targetTab
      };

      return [newNotif, ...prev.slice(0, 49)];
    });

    if (wasAdded) {
      playChime();
    }

    // Show floating toast
    setToast({
      title,
      message,
      icon:
        type === "clearance"
          ? "🔥"
          : type === "bill" || type === "order"
          ? "🧾"
          : type === "stock"
          ? "⏱️"
          : type === "quote"
          ? "📋"
          : "🔔",
      invoice,
      targetTab
    });

    // Auto-dismiss toast after 6 seconds
    setTimeout(() => {
      setToast((cur) => (cur && cur.title === title ? null : cur));
    }, 6000);

    return newNotif;
  };

  // Broadcast customer near-expiry clearance deal alert
  const broadcastClearanceAlert = ({ branchName, productName, discount, hoursRemaining, price }) => {
    return addNotification({
      title: `🔥 Night Market Deal: ${discount}% OFF!`,
      message: `${productName} at ${branchName} has ${hoursRemaining}h fresh shelf-life. Grab it now for only ₹${price}!`,
      type: "clearance",
      targetTab: "storefront"
    });
  };


  const markAsRead = (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  const openBill = (invoice) => {
    setActiveBill(invoice);
  };

  const closeBill = () => {
    setActiveBill(null);
  };

  const dismissToast = () => {
    setToast(null);
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        addNotification,
        broadcastClearanceAlert,
        markAsRead,
        markAllAsRead,
        clearNotifications,
        activeBill,
        openBill,
        closeBill,
        toast,
        dismissToast
      }}
    >

      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationContext);
