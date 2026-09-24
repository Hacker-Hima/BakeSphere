import { useState, useMemo, useEffect } from "react";
import { bakingoProducts, BAKINGO_CATEGORY_BUBBLES } from "../../data/bakingoProducts.js";
import { handleImageError, getSafeImageUrl } from "../../utils/imageFallback.js";
import { useLanguage } from "../../context/LanguageContext.jsx";

export const BakingoStorefront = ({
  onOpenQuickView,
  onAddToCart,
  cart,
  onUpdateQuantity,
  onOpenCart,
  onNavigateTab,
  searchQuery,
  deliveryCity
}) => {
  const { t } = useLanguage();
  const [activeCategory, setActiveCategory] = useState("all");
  const [egglessOnly, setEgglessOnly] = useState(false);
  const [selectedOccasion, setSelectedOccasion] = useState("all");
  const [selectedFlavour, setSelectedFlavour] = useState("all");
  const [sortBy, setSortBy] = useState("popularity");
  const [wishlist, setWishlist] = useState({});
  const [wishlistFilter, setWishlistFilter] = useState(false);
  const [heroSlide, setHeroSlide] = useState(0);
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterDone, setNewsletterDone] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "", icon: "❤️" });

  const showToast = (message, icon = "❤️") => {
    setToast({ show: true, message, icon });
    setTimeout(() => {
      setToast((prev) => ({ ...prev, show: false }));
    }, 2800);
  };

  const scrollToCatalog = () => {
    const el = document.getElementById("bk-catalog");
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  // Dedicated filter handlers that prevent conflict and ensure results always show up!
  const handleSelectFlavour = (flavour) => {
    setSelectedFlavour(flavour);
    setSelectedOccasion("all");
    setWishlistFilter(false);
    setActiveCategory("all");
    scrollToCatalog();
    showToast(`Showing all ${flavour} bakery treats 🍰`, "🍰");
  };

  const handleSelectOccasion = (occasion) => {
    setSelectedOccasion(occasion);
    setSelectedFlavour("all");
    setWishlistFilter(false);
    setActiveCategory("all");
    scrollToCatalog();
    showToast(`Showing ${occasion} celebration specials 🎁`, "🎁");
  };

  const handleSelectCategory = (category) => {
    setActiveCategory(category);
    setSelectedOccasion("all");
    setSelectedFlavour("all");
    setWishlistFilter(false);
    scrollToCatalog();
    showToast(`Browsing ${category} 🥐`, "🥐");
  };

  const handleResetAllFilters = () => {
    setActiveCategory("all");
    setSelectedOccasion("all");
    setSelectedFlavour("all");
    setEgglessOnly(false);
    setWishlistFilter(false);
    showToast("Filters reset to all bakery treats", "✨");
  };

  // Selected weights per product { [productId]: selectedWeight }
  const [cardWeights, setCardWeights] = useState({});

  // Hero carousel slides
  const heroSlides = [
    {
      id: 1,
      title: t("heroTitle1"),
      subtitle: t("heroSubtitle1"),
      offer: t("heroOffer1"),
      btnText: t("exploreBestsellers"),
      categoryTarget: "bestsellers",
      bgImage: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=1400&auto=format&fit=crop&q=80",
      accentBadge: "🔥 #1 Trending Patisserie"
    },
    {
      id: 2,
      title: t("heroTitle2"),
      subtitle: t("heroSubtitle2"),
      offer: "Guaranteed On-Time Delivery Across 20+ Cities",
      btnText: t("orderAnniversaryCakes"),
      categoryTarget: "Cakes",
      bgImage: "https://images.unsplash.com/photo-1586788680434-30d324b2d46f?w=1400&auto=format&fit=crop&q=80",
      accentBadge: "🌙 Midnight Surprise Available"
    },
    {
      id: 3,
      title: "Artisanal Jar Cakes & Desserts",
      subtitle: "Luscious Multi-Layered Indulgence Starting at Just ₹159",
      offer: "Buy 2 Get 1 Free on Select Dessert Jars",
      btnText: "Browse Jar Cakes",
      categoryTarget: "Jar Cakes",
      bgImage: "https://images.unsplash.com/photo-1586985289688-ca3cf47d3e6e?w=1400&auto=format&fit=crop&q=80",
      accentBadge: "⭐ 4.96★ Rated Collection"
    }
  ];

  // Auto slide hero
  useEffect(() => {
    const timer = setInterval(() => {
      setHeroSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5500);
    return () => clearInterval(timer);
  }, [heroSlides.length]);

  const toggleWishlist = (product) => {
    const id = product.id;
    setWishlist((prev) => {
      const willBeWished = !prev[id];
      showToast(
        willBeWished ? `Added "${product.name}" to Wishlist!` : `Removed "${product.name}" from Wishlist`,
        willBeWished ? "❤️" : "🤍"
      );
      return { ...prev, [id]: willBeWished };
    });
  };

  const handleWeightChange = (productId, weight) => {
    setCardWeights((prev) => ({ ...prev, [productId]: weight }));
  };

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    if (!newsletterEmail || !newsletterEmail.includes("@")) {
      showToast("Please enter a valid email address", "⚠️");
      return;
    }
    setNewsletterDone(true);
    showToast("🎉 Welcome! 15% discount code SWEET15 copied & ready to use at checkout.", "🎁");
  };

  // Filter and Sort Logic
  const filteredProducts = useMemo(() => {
    return bakingoProducts
      .filter((item) => {
        // Wishlist filter
        if (wishlistFilter && !wishlist[item.id]) {
          return false;
        }

        // Search filter
        if (searchQuery && searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchName = item.name.toLowerCase().includes(q);
          const matchDesc = item.description.toLowerCase().includes(q);
          const matchCategory = item.category.toLowerCase().includes(q);
          const matchFlavour = item.flavour?.toLowerCase().includes(q);
          const matchTags = item.tags?.some((t) => t.toLowerCase().includes(q));
          if (!matchName && !matchDesc && !matchCategory && !matchFlavour && !matchTags) {
            return false;
          }
        }

        // Category filter
        if (activeCategory === "bestsellers") {
          if (!item.tags?.includes("Bestseller")) return false;
        } else if (activeCategory !== "all") {
          if (item.category.toLowerCase() !== activeCategory.toLowerCase()) return false;
        }

        // Eggless filter
        if (egglessOnly && !item.isEggless) {
          return false;
        }

        // Occasion filter
        if (selectedOccasion !== "all") {
          if (item.occasion?.toLowerCase() !== selectedOccasion.toLowerCase()) return false;
        }

        // Flavour filter
        if (selectedFlavour !== "all") {
          if (item.flavour?.toLowerCase() !== selectedFlavour.toLowerCase()) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === "price-low") return a.sellingPrice - b.sellingPrice;
        if (sortBy === "price-high") return b.sellingPrice - a.sellingPrice;
        if (sortBy === "rating") return b.rating - a.rating;
        // Default: popularity / bestseller
        return (b.reviewsCount || 0) - (a.reviewsCount || 0);
      });
  }, [activeCategory, egglessOnly, selectedOccasion, selectedFlavour, sortBy, searchQuery, wishlistFilter, wishlist]);

  return (
    <div className="bk-storefront">
      {/* ═══════════════ TOP ANNOUNCEMENT STRIP ═══════════════ */}
      <div className="bk-promo-strip">
        <div className="bk-promo-strip-content">
          <span>🎉 Special Celebration Offer: Flat 15% OFF on First Order | Use Code: <strong>SWEET15</strong></span>
          <span className="bk-promo-divider">•</span>
          <span>⚡ Same-Day 2-Hour Express Delivery in <strong>{deliveryCity?.name || "Chennai"}</strong></span>
          <span className="bk-promo-divider">•</span>
          <span>🎂 100% Freshly Baked Everyday</span>
        </div>
      </div>

      {/* ═══════════════ HERO BANNER CAROUSEL ═══════════════ */}
      <section className="bk-hero-section">
        <div className="bk-hero-slider">
          {heroSlides.map((slide, idx) => {
            const isActive = idx === heroSlide;
            return (
              <div
                key={slide.id}
                className={`bk-hero-slide ${isActive ? "bk-hero-slide--active" : ""}`}
                style={{ backgroundImage: `url(${slide.bgImage})` }}
              >
                <div className="bk-hero-slide-overlay" />
                <div className="bk-hero-slide-content">
                  <span className="bk-hero-accent-pill">{slide.accentBadge}</span>
                  <h1 className="bk-hero-title">{slide.title}</h1>
                  <p className="bk-hero-subtitle">{slide.subtitle}</p>
                  <div className="bk-hero-offer-tag">
                    <span>🏷️ {slide.offer}</span>
                  </div>
                  <div className="bk-hero-actions">
                    <button
                      type="button"
                      className="bk-btn-hero-primary"
                      onClick={() => setActiveCategory(slide.categoryTarget)}
                    >
                      {slide.btnText} →
                    </button>
                    <button
                      type="button"
                      className="bk-btn-hero-secondary"
                      onClick={() => onNavigateTab("custom-cake")}
                    >
                      🎨 3D Cake Studio
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Slider Controls */}
        <button
          type="button"
          className="bk-hero-arrow bk-hero-arrow-prev"
          onClick={() => setHeroSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length)}
        >
          ‹
        </button>
        <button
          type="button"
          className="bk-hero-arrow bk-hero-arrow-next"
          onClick={() => setHeroSlide((prev) => (prev + 1) % heroSlides.length)}
        >
          ›
        </button>

        <div className="bk-hero-dots">
          {heroSlides.map((s, idx) => (
            <span
              key={s.id}
              className={`bk-hero-dot ${idx === heroSlide ? "bk-hero-dot--active" : ""}`}
              onClick={() => setHeroSlide(idx)}
            />
          ))}
        </div>
      </section>

      {/* ═══════════════ FOUR TRUST PILLARS ═══════════════ */}
      <section className="bk-trust-strip">
        <div className="bk-trust-container">
          <div className="bk-trust-item">
            <span className="bk-trust-icon">⚡</span>
            <div>
              <strong>{t("trust2Title")}</strong>
              <p>{t("trust2Sub")}</p>
            </div>
          </div>
          <div className="bk-trust-item">
            <span className="bk-trust-icon">🎂</span>
            <div>
              <strong>{t("trust1Title")}</strong>
              <p>{t("trust1Sub")}</p>
            </div>
          </div>
          <div className="bk-trust-item">
            <span className="bk-trust-icon">🌱</span>
            <div>
              <strong>{t("trust3Title")}</strong>
              <p>{t("trust3Sub")}</p>
            </div>
          </div>
          <div className="bk-trust-item">
            <span className="bk-trust-icon">⭐</span>
            <div>
              <strong>{t("trust4Title")}</strong>
              <p>{t("trust4Sub")}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════ VISUAL CATEGORY BUBBLES ═══════════════ */}
      <section className="bk-category-section">
        <div className="bk-section-heading-group">
          <h2 className="bk-main-section-title">{t("shopByCategory")}</h2>
          <p className="bk-main-section-subtitle">
            {t("shopByCategorySub")}
          </p>
        </div>

        <div className="bk-bubbles-scroll-wrapper">
          <div className="bk-bubbles-grid">
            {BAKINGO_CATEGORY_BUBBLES.map((cat) => {
              const isActive = activeCategory === cat.id && !wishlistFilter;
              return (
                <div
                  key={cat.id}
                  className={`bk-bubble-card ${isActive ? "bk-bubble-card--active" : ""}`}
                  onClick={() => handleSelectCategory(cat.id)}
                >
                  <div className="bk-bubble-img-wrapper">
                    <img
                      src={getSafeImageUrl(cat.image)}
                      alt={cat.name}
                      className="bk-bubble-img"
                      onError={handleImageError}
                    />
                    <span className="bk-bubble-emoji">{cat.icon}</span>
                  </div>
                  <span className="bk-bubble-label">{cat.name}</span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════════════ FILTER & SORT TOOLBAR ═══════════════ */}
      <section className="bk-toolbar-section">
        <div className="bk-toolbar-container">
          {/* Left: Eggless Toggle & Occasions */}
          <div className="bk-filter-group-left">
            {/* Eggless Switch */}
            <div
              className={`bk-eggless-toggle ${egglessOnly ? "bk-eggless-toggle--active" : ""}`}
              onClick={() => setEgglessOnly(!egglessOnly)}
            >
              <span className="bk-diet-dot bk-diet-veg">
                <span className="bk-diet-circle" />
              </span>
              <span className="bk-eggless-text">{t("egglessOnly")}</span>
              <span className={`bk-toggle-switch ${egglessOnly ? "bk-toggle-switch--on" : ""}`}>
                <span className="bk-toggle-handle" />
              </span>
            </div>

            {/* Wishlist Pill Filter */}
            <button
              type="button"
              className={`bk-filter-chip ${wishlistFilter ? "bk-filter-chip--active" : ""}`}
              onClick={() => {
                setWishlistFilter(!wishlistFilter);
                scrollToCatalog();
              }}
              title="Filter by your saved wishlist items"
            >
              ❤️ Wishlist ({Object.values(wishlist).filter(Boolean).length})
            </button>

            {/* Occasion Chips */}
            <div className="bk-occasion-chips">
              {[
                { id: "all", label: "All Occasions" },
                { id: "Birthday", label: "🎂 Birthday" },
                { id: "Anniversary", label: "💍 Anniversary" },
                { id: "Romance", label: "❤️ Romance" },
                { id: "Kids", label: "🎈 Kids Special" },
                { id: "Congratulations", label: "🏆 Congratulations" }
              ].map((occ) => (
                <button
                  key={occ.id}
                  type="button"
                  className={`bk-filter-chip ${selectedOccasion === occ.id && !wishlistFilter ? "bk-filter-chip--active" : ""}`}
                  onClick={() => {
                    if (occ.id === "all") {
                      setSelectedOccasion("all");
                      scrollToCatalog();
                    } else {
                      handleSelectOccasion(occ.id);
                    }
                  }}
                >
                  {occ.label}
                </button>
              ))}
            </div>
          </div>

          {/* Right: Flavour & Sort */}
          <div className="bk-filter-group-right">
            {/* Flavour Dropdown */}
            <select
              className="bk-filter-select"
              value={selectedFlavour}
              onChange={(e) => {
                const val = e.target.value;
                if (val === "all") {
                  setSelectedFlavour("all");
                  scrollToCatalog();
                } else {
                  handleSelectFlavour(val);
                }
              }}
            >
              <option value="all">🍰 All Flavours</option>
              <option value="Chocolate">🍫 Chocolate</option>
              <option value="Red Velvet">❤️ Red Velvet</option>
              <option value="Pineapple">🍍 Fresh Pineapple</option>
              <option value="Black Forest">🍒 German Black Forest</option>
              <option value="Fruit">🍓 Fresh Fruit</option>
              <option value="Biscoff">🍪 Lotus Biscoff</option>
              <option value="Butterscotch">🍯 Butterscotch</option>
              <option value="Vanilla">🌼 Vanilla & Rasmalai</option>
              <option value="Coffee">☕ Coffee / Tiramisu</option>
              <option value="Savory">🥐 Savory & Herbs</option>
            </select>

            {/* Sort Dropdown */}
            <select
              className="bk-filter-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="popularity">🔥 {t("sortPopular")}</option>
              <option value="price-low">💰 {t("sortPriceLowHigh")}</option>
              <option value="price-high">💎 {t("sortPriceHighLow")}</option>
              <option value="rating">⭐ {t("sortRating")}</option>
            </select>
          </div>
        </div>

        {/* Results Counter & Active Filters Tag */}
        <div className="bk-results-status-bar">
          <span>Showing <strong>{filteredProducts.length}</strong> delicious bakery items</span>
          {(activeCategory !== "all" || egglessOnly || selectedOccasion !== "all" || selectedFlavour !== "all" || searchQuery) && (
            <button
              type="button"
              className="bk-btn-reset-filters"
              onClick={handleResetAllFilters}
            >
              ✕ Reset All Filters
            </button>
          )}
        </div>
      </section>

      {/* ═══════════════ PRODUCT CARDS GRID ═══════════════ */}
      <section id="bk-catalog" className="bk-catalog-section">
        {filteredProducts.length === 0 ? (
          <div className="bk-catalog-empty">
            <span style={{ fontSize: "3rem" }}>🔍</span>
            <h3>No bakery items matched your filters</h3>
            <p>Try switching categories or turning off specific filters to view more items.</p>
            <button
              className="bk-btn-gold"
              onClick={handleResetAllFilters}
            >
              {t("allBakeryItems")}
            </button>
          </div>
        ) : (
          <div className="bk-product-grid">
            {filteredProducts.map((product) => {
              // Current selected weight for this card
              const currentWeight = cardWeights[product.id] || product.availableWeights?.[0] || product.weight;
              const multiplier = product.weightMultipliers?.[currentWeight] || 1;
              const cardPrice = Math.round(product.sellingPrice * multiplier);
              const cardMrp = Math.round(product.mrp * multiplier);

              // Check if in cart
              const cartItem = cart.find(
                (c) => c.id === product.id && (c.selectedWeight || c.weight) === currentWeight
              );
              const cartQuantity = cartItem ? cartItem.quantity : 0;
              const isWished = wishlist[product.id];

              return (
                <div key={product.id} className="bk-product-card">
                  {/* Card Media Container */}
                  <div className="bk-card-media-wrapper">
                    <img
                      src={getSafeImageUrl(product.image)}
                      alt={product.name}
                      className="bk-card-img"
                      loading="lazy"
                      onError={handleImageError}
                    />

                    {/* Diet Dot Badge (Top-Left) */}
                    <span className={`bk-card-diet-tag ${product.isEggless ? "bk-diet-veg" : "bk-diet-nonveg"}`}>
                      <span className="bk-diet-circle" />
                    </span>

                    {/* Discount Badge */}
                    {product.discountPercent && (
                      <span className="bk-card-discount-badge">
                        {product.discountPercent}% OFF
                      </span>
                    )}

                    {/* Wishlist Heart Toggle */}
                    <button
                      type="button"
                      className={`bk-card-wishlist-btn ${isWished ? "bk-card-wishlist--active" : ""}`}
                      onClick={() => toggleWishlist(product)}
                      title="Save to Wishlist"
                    >
                      {isWished ? "❤️" : "🤍"}
                    </button>

                    {/* Quick View Button on Hover */}
                    <button
                      type="button"
                      className="bk-card-quickview-btn"
                      onClick={() => onOpenQuickView(product)}
                    >
                      👁️ {t("quickView")}
                    </button>

                    {/* Earliest Delivery Pill */}
                    <div className="bk-card-delivery-banner">
                      <span>⚡ {product.deliveryTime || "Today in 2 hrs"}</span>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="bk-card-body">
                    {/* Rating & Tag Row */}
                    <div className="bk-card-meta-row">
                      <span className="bk-card-rating">
                        ★ {product.rating} <small>({product.reviewsCount})</small>
                      </span>
                      {product.tags && product.tags[0] && (
                        <span className="bk-card-tag-pill">{product.tags[0]}</span>
                      )}
                    </div>

                    {/* Product Title */}
                    <h3
                      className="bk-card-title"
                      onClick={() => onOpenQuickView(product)}
                    >
                      {product.name}
                    </h3>

                    {/* Price Row */}
                    <div className="bk-card-price-row">
                      <div className="bk-card-prices">
                        <span className="bk-card-curr-price">₹{cardPrice}</span>
                        {cardMrp > cardPrice && (
                          <span className="bk-card-mrp-price">₹{cardMrp}</span>
                        )}
                      </div>
                      <span className="bk-card-weight-label">{currentWeight}</span>
                    </div>

                    {/* Weight Selection Pills (Dynamic on card!) */}
                    {product.availableWeights && product.availableWeights.length > 1 && (
                      <div className="bk-card-weights-strip">
                        {product.availableWeights.map((w) => (
                          <button
                            key={w}
                            type="button"
                            className={`bk-card-weight-pill ${currentWeight === w ? "bk-card-weight-pill--active" : ""}`}
                            onClick={() => handleWeightChange(product.id, w)}
                          >
                            {w}
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Action Row: Add to Cart or Stepper */}
                    <div className="bk-card-actions-row">
                      {cartQuantity > 0 ? (
                        <div className="bk-card-stepper">
                          <button
                            type="button"
                            className="bk-stepper-btn"
                            onClick={() => onUpdateQuantity(product.id, -1, currentWeight)}
                          >
                            -
                          </button>
                          <span className="bk-stepper-val">{cartQuantity}</span>
                          <button
                            type="button"
                            className="bk-stepper-btn"
                            onClick={() => onUpdateQuantity(product.id, 1, currentWeight)}
                          >
                            +
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          className="bk-btn-card-add"
                          onClick={() => {
                            onAddToCart({
                              ...product,
                              sellingPrice: cardPrice,
                              mrp: cardMrp,
                              selectedWeight: currentWeight
                            });
                            showToast(`Added "${product.name}" (${currentWeight}) to cart!`, "🛒");
                          }}
                        >
                          <span>🛒 {t("addToCart")}</span>
                        </button>
                      )}

                      <button
                        type="button"
                        className="bk-btn-card-customize"
                        onClick={() => onOpenQuickView(product)}
                      >
                        Customize ▾
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ═══════════════ OCCASION SPOTLIGHT BANNER ═══════════════ */}
      <section className="bk-spotlight-section">
        <div className="bk-spotlight-container">
          <div className="bk-spotlight-card bk-spotlight-bday">
            <div className="bk-spotlight-content">
              <span className="bk-spotlight-badge">🎂 Birthday Celebrations</span>
              <h3>Make Every Birthday Unforgettable</h3>
              <p>Photo Cakes, Chocolate Truffles, Sparkler Candles & Plush Teddy Combos.</p>
              <button
                type="button"
                className="bk-btn-spotlight"
                onClick={() => {
                  setSelectedOccasion("Birthday");
                  setActiveCategory("Cakes");
                  scrollToCatalog();
                }}
              >
                Browse Birthday Specials →
              </button>
            </div>
            <img
              src={getSafeImageUrl("https://images.unsplash.com/photo-1535141192574-5d4897c13136?w=500&auto=format&fit=crop&q=80")}
              alt="Birthday Special"
              className="bk-spotlight-img"
              onError={handleImageError}
            />
          </div>

          <div className="bk-spotlight-card bk-spotlight-anniv">
            <div className="bk-spotlight-content">
              <span className="bk-spotlight-badge">💍 Anniversary & Romance</span>
              <h3>Celebrate Your Love Story</h3>
              <p>Heart-shaped Red Velvet Cakes, Rose Bouquets & French Chocolate Truffles.</p>
              <button
                type="button"
                className="bk-btn-spotlight"
                onClick={() => {
                  setSelectedOccasion("Anniversary");
                  setActiveCategory("Hampers");
                  scrollToCatalog();
                }}
              >
                Explore Romance Hampers →
              </button>
            </div>
            <img
              src={getSafeImageUrl("https://images.unsplash.com/photo-1586788680434-30d324b2d46f?w=500&auto=format&fit=crop&q=80")}
              alt="Anniversary Special"
              className="bk-spotlight-img"
              onError={handleImageError}
            />
          </div>
        </div>
      </section>

      {/* ═══════════════ VERIFIED REVIEWS & TESTIMONIALS ═══════════════ */}
      <section className="bk-testimonials-section">
        <div className="bk-section-heading-group">
          <h2 className="bk-main-section-title">Loved by 500,000+ Cake Lovers</h2>
          <p className="bk-main-section-subtitle">
            Real experiences from verified customers celebrating their special moments with us.
          </p>
        </div>

        <div className="bk-reviews-grid">
          {[
            {
              id: 1,
              name: "Priyanka S.",
              city: "Chennai (Anna Nagar)",
              rating: 5,
              text: "Ordered the Belgian Chocolate Truffle Cake for my husband's 30th birthday. Delivered precisely at 11:58 PM! The chocolate ganache was insanely rich and fresh.",
              cake: "Belgian Chocolate Truffle",
              avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80"
            },
            {
              id: 2,
              name: "Vikram R.",
              city: "Bangalore (Indiranagar)",
              rating: 5,
              text: "The Hot Paneer Tikka Puffs and Kulhad Masala Chai are absolutely divine. Fresh, hot, and so authentic. 10/10 recommendation!",
              cake: "Paneer Tikka Puff & Chai",
              avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80"
            },
            {
              id: 3,
              name: "Ananya M.",
              city: "Hyderabad (Jubilee Hills)",
              rating: 5,
              text: "Ordered the Cheese Jalapeno Samosas and Birthday Truffle combo. Everything arrived in pristine condition within 30 minutes!",
              cake: "Cheese Samosas & Cake Combo",
              avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80"
            }
          ].map((rev) => (
            <div key={rev.id} className="bk-review-card">
              <div className="bk-review-stars">★★★★★</div>
              <p className="bk-review-text">"{rev.text}"</p>
              <div className="bk-review-ordered">
                <span>Ordered: <strong>{rev.cake}</strong></span>
              </div>
              <div className="bk-review-author">
                <img
                  src={getSafeImageUrl(rev.avatar)}
                  alt={rev.name}
                  className="bk-review-avatar"
                  onError={handleImageError}
                />
                <div>
                  <div className="bk-review-name">{rev.name}</div>
                  <div className="bk-review-city">📍 {rev.city} • Verified Buyer</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════ BAKINGO-STYLE RICH FOOTER ═══════════════ */}
      <footer className="bk-storefront-footer">
        {/* Quick Newsletter Box */}
        <div className="bk-newsletter-banner">
          <div className="bk-newsletter-inner">
            <div>
              <h3>Subscribe for Sweet Surprises & Secret Deals 🍰</h3>
              <p>Get exclusive coupons, seasonal menu previews, and birthday discounts.</p>
            </div>
            <form onSubmit={handleNewsletterSubmit} className="bk-newsletter-form">
              <input
                type="email"
                placeholder="Enter your email address"
                className="bk-newsletter-input"
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                required
              />
              <button type="submit" className="bk-newsletter-btn">
                {newsletterDone ? "✓ Code SWEET15 Copied!" : "Subscribe (15% OFF)"}
              </button>
            </form>
          </div>
        </div>

        {/* Multi-Column Links */}
        <div className="bk-footer-columns">
          <div className="bk-footer-col">
            <h4>🍰 Cakes by Flavour</h4>
            <ul>
              <li><button onClick={() => handleSelectFlavour("Chocolate")}>Chocolate Truffle Cakes</button></li>
              <li><button onClick={() => handleSelectFlavour("Red Velvet")}>Red Velvet Cakes</button></li>
              <li><button onClick={() => handleSelectFlavour("Pineapple")}>Fresh Pineapple Gateaux</button></li>
              <li><button onClick={() => handleSelectFlavour("Black Forest")}>German Black Forest</button></li>
              <li><button onClick={() => handleSelectFlavour("Fruit")}>Exotic Fresh Fruit Gateau</button></li>
              <li><button onClick={() => handleSelectFlavour("Biscoff")}>Lotus Biscoff Cakes</button></li>
              <li><button onClick={() => handleSelectFlavour("Butterscotch")}>Butterscotch Praline</button></li>
              <li><button onClick={() => handleSelectFlavour("Vanilla")}>Royal Rasmalai & Vanilla</button></li>
            </ul>
          </div>

          <div className="bk-footer-col">
            <h4>🥐 Hot Snacks & Puffs</h4>
            <ul>
              <li><button onClick={() => handleSelectCategory("Puffs")}>Hot Savory Puffs (6 Varieties)</button></li>
              <li><button onClick={() => handleSelectCategory("Samosas")}>Crispy Punjabi & Cheese Samosas</button></li>
              <li><button onClick={() => handleSelectCategory("Beverages")}>Kulhad Masala Chai & Filter Coffee</button></li>
              <li><button onClick={() => handleSelectCategory("Snacks")}>Tandoori Paneer Kathi Rolls</button></li>
              <li><button onClick={() => handleSelectCategory("Snacks")}>Cheese Garlic Breadsticks & Quiches</button></li>
              <li><button onClick={() => onNavigateTab("custom-cake")}>3D Custom Studio</button></li>
            </ul>
          </div>

          <div className="bk-footer-col">
            <h4>🎁 Occasion Specials</h4>
            <ul>
              <li><button onClick={() => handleSelectOccasion("Birthday")}>Birthday Celebration Specials</button></li>
              <li><button onClick={() => handleSelectOccasion("Anniversary")}>Romantic Anniversary Cakes</button></li>
              <li><button onClick={() => handleSelectOccasion("Romance")}>Heart Shaped Romance Cakes</button></li>
              <li><button onClick={() => handleSelectOccasion("Kids")}>Kids Cartoon & Pinata Cakes</button></li>
              <li><button onClick={() => handleSelectOccasion("Congratulations")}>Congratulations & Milestones</button></li>
              <li><button onClick={() => handleSelectCategory("Hampers")}>Luxury Patisserie Hampers</button></li>
              <li><button onClick={() => onNavigateTab("pos")}>Storefront Billing / POS</button></li>
            </ul>
          </div>

          <div className="bk-footer-col">
            <h4>🛡️ Trust & Certifications</h4>
            <div className="bk-cert-badges">
              <div className="bk-cert-pill">
                <span>🏅 FSSAI Certified</span>
                <small>Lic. 12423008000451</small>
              </div>
              <div className="bk-cert-pill">
                <span>🔒 100% Secure Checkout</span>
                <small>256-Bit SSL Encryption</small>
              </div>
              <div className="bk-cert-pill">
                <span>⚡ 2-Hour Express Delivery</span>
                <small>Same Day Available Across 7 Cities</small>
              </div>
            </div>
            <div className="bk-erp-quick-access">
              <span>Bakery Operations & Access:</span>
              <button onClick={() => onNavigateTab("login")} className="bk-btn-mini-erp">
                Staff & Role Portal 🔑
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="bk-footer-bottom">
          <div className="bk-footer-bottom-inner">
            <div className="bk-footer-brand-summary">
              <span className="bk-brand-icon">🥐</span>
              <strong>BakeSphere</strong>
              <span>© 2026 BakeSphere Online Patisserie & Delivery Pvt. Ltd. All rights reserved.</span>
            </div>
            <div className="bk-footer-bottom-badges">
              <span>UPI</span>
              <span>Visa</span>
              <span>MasterCard</span>
              <span>RuPay</span>
              <span>NetBanking</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Floating View Cart Pill */}
      {cart && cart.length > 0 && (
        <div className="bk-floating-cart-bar">
          <div className="bk-floating-cart-inner">
            <div className="bk-floating-cart-info">
              <span>{cart.reduce((s, i) => s + i.quantity, 0)} Items Selected</span>
              <strong>₹{cart.reduce((s, i) => s + (i.sellingPrice || i.price) * i.quantity, 0)}</strong>
            </div>
            <button
              type="button"
              className="bk-btn-floating-view-cart"
              onClick={onOpenCart}
            >
              View Cart 🛒 →
            </button>
          </div>
        </div>
      )}

      {/* Floating Interactive Toast */}
      {toast.show && (
        <div className="bk-toast-banner">
          <span className="bk-toast-icon">{toast.icon}</span>
          <span className="bk-toast-msg">{toast.message}</span>
        </div>
      )}
    </div>
  );
};
