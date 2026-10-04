import { useState, useEffect } from "react";
import { handleImageError } from "../../utils/imageFallback.js";
import { CAKE_INSPIRATIONS, INSPIRATION_CATEGORIES } from "../../data/cakeInspirationsData.js";

export const Studio3DInspirations = ({ onSelectInspiration, onRequestCustomDesign }) => {
  const [inspirations, setInspirations] = useState(CAKE_INSPIRATIONS);
  const [categories, setCategories] = useState(INSPIRATION_CATEGORIES);
  const [selectedCategory, setSelectedCategory] = useState("All Themes");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchInspirations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategory]);

  const fetchInspirations = async () => {
    try {
      const url = new URL("http://localhost:5000/api/custom-cakes/inspirations");
      if (selectedCategory && selectedCategory !== "All Themes") {
        url.searchParams.append("category", selectedCategory);
      }
      if (searchQuery.trim()) {
        url.searchParams.append("search", searchQuery.trim());
      }
      const res = await fetch(url.toString());
      if (res.ok) {
        const data = await res.json();
        if (data.inspirations && data.inspirations.length > 0) {
          setInspirations(data.inspirations);
        }
        if (data.categories) setCategories(data.categories);
        setIsLoading(false);
        return;
      }
    } catch (err) {
      console.warn("Could not fetch inspirations from API, using curated local catalog:", err);
    }
    // Local filter fallback
    let filtered = [...CAKE_INSPIRATIONS];
    if (selectedCategory && selectedCategory !== "All Themes") {
      filtered = filtered.filter((i) => i.category === selectedCategory);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      filtered = filtered.filter(
        (i) =>
          i.title.toLowerCase().includes(q) ||
          i.theme.toLowerCase().includes(q) ||
          (i.tags && i.tags.some((t) => t.toLowerCase().includes(q)))
      );
    }
    setInspirations(filtered);
    setIsLoading(false);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchInspirations();
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      {/* Studio Header Banner */}
      <div
        style={{
          background: "linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(225, 29, 72, 0.15) 100%)",
          border: "1px solid rgba(245, 158, 11, 0.3)",
          borderRadius: "16px",
          padding: "1.5rem 2rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "1rem"
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.3rem" }}>
            <span style={{ fontSize: "1.5rem" }}>✨</span>
            <h2 style={{ margin: 0, fontSize: "1.6rem", color: "var(--gold-400, #fbbf24)", fontWeight: 800 }}>
              3D Studio & Creative Inspirations
            </h2>
            <span
              style={{
                background: "rgba(245, 158, 11, 0.2)",
                color: "var(--gold-300, #fde047)",
                border: "1px solid var(--gold-500, #f59e0b)",
                borderRadius: "20px",
                padding: "0.2rem 0.6rem",
                fontSize: "0.72rem",
                fontWeight: 700
              }}
            >
              Master Patisserie Editions
            </span>
          </div>
          <p style={{ margin: 0, fontSize: "0.88rem", color: "var(--text-secondary, #cbd5e1)", maxWidth: "600px" }}>
            Explore our artisanal archive featuring Marvel superheroes, royal weddings, cyberpunk gaming setups, and kids animations. Pick any masterpiece to load and customize in real-time 3D!
          </p>
        </div>

        {onRequestCustomDesign && (
          <button
            type="button"
            onClick={onRequestCustomDesign}
            style={{
              background: "linear-gradient(135deg, #e11d48 0%, #be123c 100%)",
              color: "#ffffff",
              border: "none",
              borderRadius: "10px",
              padding: "0.75rem 1.4rem",
              fontSize: "0.88rem",
              fontWeight: 700,
              cursor: "pointer",
              boxShadow: "0 4px 15px rgba(225, 29, 72, 0.35)",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem"
            }}
          >
            <span>🎨 Have a Custom Idea? Submit Design</span>
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div style={{ display: "flex", flexDirection: "column", gap: "0.8rem" }}>
        {/* Category Pills */}
        <div style={{ display: "flex", gap: "0.5rem", overflowX: "auto", paddingBottom: "0.4rem" }}>
          {(categories.length > 0
            ? categories
            : [
                "All Themes",
                "Superhero & Comics",
                "Cartoon & Kids",
                "Royal Wedding",
                "Anniversary & Romance",
                "Gaming & Tech",
                "Sports & Hobbies"
              ]
          ).map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              style={{
                background: selectedCategory === cat ? "var(--gold-500, #f59e0b)" : "rgba(255, 255, 255, 0.05)",
                color: selectedCategory === cat ? "#000000" : "var(--text-secondary, #cbd5e1)",
                border: selectedCategory === cat ? "1px solid var(--gold-400)" : "1px solid rgba(255, 255, 255, 0.1)",
                borderRadius: "20px",
                padding: "0.45rem 1rem",
                fontSize: "0.8rem",
                fontWeight: 700,
                cursor: "pointer",
                whiteSpace: "nowrap",
                transition: "all 0.2s ease"
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search input */}
        <form onSubmit={handleSearchSubmit} style={{ display: "flex", gap: "0.5rem" }}>
          <input
            type="text"
            placeholder="Search themes (e.g. Iron Man, Wedding, PS5, Peppa, Unicorn)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              flex: 1,
              background: "rgba(0, 0, 0, 0.35)",
              border: "1px solid var(--border-color, #2a324b)",
              borderRadius: "8px",
              padding: "0.6rem 1rem",
              color: "#ffffff",
              fontSize: "0.88rem"
            }}
          />
          <button
            type="submit"
            style={{
              background: "rgba(255, 255, 255, 0.08)",
              border: "1px solid rgba(255, 255, 255, 0.15)",
              color: "#ffffff",
              padding: "0 1.2rem",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: 600,
              fontSize: "0.85rem"
            }}
          >
            Search
          </button>
        </form>
      </div>

      {/* Inspirations Grid */}
      {isLoading ? (
        <div style={{ textAlign: "center", padding: "3rem", color: "var(--text-muted)" }}>
          <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>🌀</div>
          <p>Loading 3D Studio Themes...</p>
        </div>
      ) : inspirations.length === 0 ? (
        <div style={{ textAlign: "center", padding: "3rem", background: "rgba(255,255,255,0.02)", borderRadius: "12px" }}>
          <div style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>🎂</div>
          <h4 style={{ color: "var(--gold-400)", margin: "0 0 0.4rem" }}>No themes found matching your search</h4>
          <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>Try searching for Marvel, Wedding, Gaming, or Unicorn.</p>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
            gap: "1.4rem"
          }}
        >
          {inspirations.map((item) => (
            <div
              key={item.id}
              className="glass-panel"
              style={{
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                borderRadius: "14px",
                transition: "transform 0.25s ease, box-shadow 0.25s ease"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-4px)";
                e.currentTarget.style.boxShadow = "0 12px 28px rgba(0,0,0,0.5)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              {/* Image banner with badges */}
              <div style={{ position: "relative", height: "230px", overflow: "hidden", background: "#0b0f19" }}>
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  onError={(e) => handleImageError(e, "cake")}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    transition: "transform 0.4s ease"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "scale(1.05)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "scale(1.0)";
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    top: "10px",
                    left: "10px",
                    background: "rgba(0, 0, 0, 0.75)",
                    backdropFilter: "blur(6px)",
                    borderRadius: "6px",
                    padding: "0.25rem 0.6rem",
                    fontSize: "0.72rem",
                    fontWeight: 700,
                    color: "var(--gold-400)"
                  }}
                >
                  {item.category}
                </div>

                {item.badge && (
                  <div
                    style={{
                      position: "absolute",
                      top: "10px",
                      right: "10px",
                      background: "linear-gradient(135deg, #e11d48, #be123c)",
                      color: "#ffffff",
                      borderRadius: "6px",
                      padding: "0.25rem 0.6rem",
                      fontSize: "0.7rem",
                      fontWeight: 800,
                      boxShadow: "0 2px 8px rgba(0,0,0,0.4)"
                    }}
                  >
                    {item.badge}
                  </div>
                )}

                {/* Color Palette Indicators */}
                <div
                  style={{
                    position: "absolute",
                    bottom: "8px",
                    right: "10px",
                    display: "flex",
                    gap: "4px",
                    background: "rgba(0,0,0,0.6)",
                    padding: "3px 6px",
                    borderRadius: "12px",
                    backdropFilter: "blur(4px)"
                  }}
                >
                  {[item.primaryColor, item.secondaryColor, item.accentColor]
                    .filter(Boolean)
                    .map((color, idx) => (
                      <span
                        key={idx}
                        style={{
                          width: "12px",
                          height: "12px",
                          borderRadius: "50%",
                          background: color,
                          border: "1px solid rgba(255,255,255,0.4)"
                        }}
                      />
                    ))}
                </div>
              </div>

              {/* Content Details */}
              <div style={{ padding: "1.1rem", display: "flex", flexDirection: "column", flex: 1 }}>
                <h4 style={{ margin: "0 0 0.4rem", fontSize: "1.05rem", color: "#ffffff", fontWeight: 700 }}>
                  {item.title}
                </h4>
                <p style={{ margin: "0 0 0.8rem", fontSize: "0.8rem", color: "var(--text-muted)", lineHeight: 1.4, flex: 1 }}>
                  {item.description}
                </p>

                {/* Quick specs pill list */}
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem", marginBottom: "1rem" }}>
                  <span
                    style={{
                      background: "rgba(255,255,255,0.06)",
                      padding: "0.2rem 0.5rem",
                      borderRadius: "4px",
                      fontSize: "0.72rem",
                      color: "var(--text-secondary)"
                    }}
                  >
                    🏗️ {item.tiers} Tiers ({item.weightKg} kg)
                  </span>
                  <span
                    style={{
                      background: "rgba(255,255,255,0.06)",
                      padding: "0.2rem 0.5rem",
                      borderRadius: "4px",
                      fontSize: "0.72rem",
                      color: "var(--text-secondary)"
                    }}
                  >
                    🍰 {item.baseSponge}
                  </span>
                  <span
                    style={{
                      background: "rgba(255,255,255,0.06)",
                      padding: "0.2rem 0.5rem",
                      borderRadius: "4px",
                      fontSize: "0.72rem",
                      color: "var(--text-secondary)"
                    }}
                  >
                    🧁 {item.shape} Form
                  </span>
                </div>

                {/* Price and Action Button */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "0.8rem", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                  <div>
                    <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", display: "block" }}>Crafting starting at</span>
                    <strong style={{ fontSize: "1.15rem", color: "var(--gold-400)" }}>₹{item.estimatedPrice}</strong>
                  </div>

                  <button
                    type="button"
                    onClick={() => onSelectInspiration(item)}
                    style={{
                      background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
                      color: "#000000",
                      border: "none",
                      borderRadius: "8px",
                      padding: "0.55rem 1rem",
                      fontSize: "0.82rem",
                      fontWeight: 800,
                      cursor: "pointer",
                      boxShadow: "0 3px 10px rgba(245, 158, 11, 0.3)",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.4rem"
                    }}
                  >
                    <span>🎨 Customize in 3D</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
