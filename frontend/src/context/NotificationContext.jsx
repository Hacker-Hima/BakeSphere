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

  // Add Notification
  const addNotification = ({ title, message, type = "order", invoice = null }) => {
    const newNotif = {
      id: Date.now(),
      title,
      message,
      time: "Just now",
      read: false,
      type,
      invoice
    };

    setNotifications((prev) => [newNotif, ...prev]);

    // Show floating toast
    setToast({
      title,
      message,
      icon: type === "bill" || type === "order" ? "🧾" : "🔔",
      invoice
    });

    // Auto-dismiss toast after 6 seconds
    setTimeout(() => {
      setToast((cur) => (cur && cur.title === title ? null : cur));
    }, 6000);

    return newNotif;
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
