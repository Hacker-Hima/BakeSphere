import { createContext, useContext, useState, useEffect } from "react";

const RecentlyAccessedContext = createContext();

export const RecentlyAccessedProvider = ({ children }) => {
  const [recentItems, setRecentItems] = useState(() => {
    try {
      const saved = localStorage.getItem("bakesphere_recent_items");
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return [
      { id: "dashboard", label: "Executive Dashboard", type: "module", tab: "dashboard", icon: "📊" },
      { id: "custom-cake", label: "3D Cake Builder", type: "module", tab: "custom-cake", icon: "🎂" },
      { id: "recipe-choc", label: "Belgian Truffle Recipe", type: "recipe", tab: "production", icon: "🍫" },
      { id: "fefo-danish", label: "Batch BATCH-200926 (Danish)", type: "batch", tab: "inventory", icon: "⏳" }
    ];
  });

  useEffect(() => {
    try {
      localStorage.setItem("bakesphere_recent_items", JSON.stringify(recentItems));
    } catch (e) {
      console.error(e);
    }
  }, [recentItems]);

  const addRecentItem = (item) => {
    setRecentItems((prev) => {
      const filtered = prev.filter((i) => i.id !== item.id);
      return [item, ...filtered].slice(0, 6); // Keep top 6
    });
  };

  const clearRecent = () => setRecentItems([]);

  return (
    <RecentlyAccessedContext.Provider value={{ recentItems, addRecentItem, clearRecent }}>
      {children}
    </RecentlyAccessedContext.Provider>
  );
};

export const useRecentlyAccessed = () => useContext(RecentlyAccessedContext);
