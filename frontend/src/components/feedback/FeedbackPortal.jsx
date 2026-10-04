import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext.jsx";
import { useNotifications } from "../../context/NotificationContext.jsx";
import { computeStats, customerReviews } from "../../data/feedbackData.js";

const FALLBACK_BRANCHES = Array.from(
  new Map(
    customerReviews.map(({ branchId, branchName }) => [
      branchId,
      { id: branchId, name: branchName }
    ])
  ).values()
);

const CATEGORIES = [
  "Cakes",
  "Pastries",
  "Breads",
  "Puffs & Savouries",
  "Custom Cake",
  "Cookies & Biscuits",
  "Beverages"
];

export const FeedbackPortal = () => {
  const { currentUser, activeBranchId } = useAuth();
  const { addNotification } = useNotifications();

  const [activeTab, setActiveTab] = useState("reviews"); // "reviews" | "submit"
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [dataWarning, setDataWarning] = useState("");
  const branches = FALLBACK_BRANCHES;

  // Filters
  const [selectedBranchId, setSelectedBranchId] = useState(activeBranchId || "ALL");
  const [selectedRating, setSelectedRating] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  // Customer Submission Form State
  const [customerName, setCustomerName] = useState(currentUser?.name || "");
  const [customerEmail, setCustomerEmail] = useState(currentUser?.email || "");
  const [reviewBranchId, setReviewBranchId] = useState(activeBranchId || "BR-01");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [productName, setProductName] = useState("");
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [tasteRating, setTasteRating] = useState(5);
  const [presRating, setPresRating] = useState(5);
  const [freshRating, setFreshRating] = useState(5);
  const [serviceRating, setServiceRating] = useState(5);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [wouldRecommend, setWouldRecommend] = useState(true);
  const [photoUrl, setPhotoUrl] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Manager reply inline state: { [reviewId]: replyText }
  const [replyInputs, setReplyInputs] = useState({});
  const [activeReplyId, setActiveReplyId] = useState(null);

  const isStaffOrAdmin =
    currentUser?.role === "admin" ||
    currentUser?.role === "manager" ||
    currentUser?.role === "branch_manager" ||
    currentUser?.role === "chef";

  useEffect(() => {
    fetchReviewsAndStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedBranchId, selectedRating]);

  const fetchReviewsAndStats = async () => {
    setIsLoading(true);
    const branchReviews = customerReviews.filter(
      (review) => !selectedBranchId || selectedBranchId === "ALL" || review.branchId === selectedBranchId
    );
    const fallbackReviews = branchReviews.filter((review) => {
      const matchesRating = selectedRating === "ALL" || review.rating === Number(selectedRating);
      const query = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !query ||
        [review.customerName, review.title, review.comment, review.productName]
          .some((value) => value?.toLowerCase().includes(query));
      return matchesRating && matchesSearch;
    });

    try {
      const url = new URL("http://localhost:5000/api/reviews");
      if (selectedBranchId && selectedBranchId !== "ALL") {
        url.searchParams.append("branchId", selectedBranchId);
      }
      if (selectedRating && selectedRating !== "ALL") {
        url.searchParams.append("rating", selectedRating);
      }
      if (searchQuery.trim()) {
        url.searchParams.append("search", searchQuery.trim());
      }

      const statsUrl = new URL("http://localhost:5000/api/reviews/stats");
      if (selectedBranchId && selectedBranchId !== "ALL") {
        statsUrl.searchParams.append("branchId", selectedBranchId);
      }

      const [revRes, statsRes] = await Promise.all([fetch(url.toString()), fetch(statsUrl.toString())]);
      if (revRes.ok && statsRes.ok) {
        const [revData, statsData] = await Promise.all([revRes.json(), statsRes.json()]);
        setReviews(revData.reviews || []);
        setStats(statsData);
        setDataWarning("");
      } else {
        setReviews(fallbackReviews);
        setStats(computeStats(branchReviews));
        setDataWarning("The reviews service is unavailable. Showing sample reviews instead.");
      }
    } catch (err) {
      console.error(err);
      setReviews(fallbackReviews);
      setStats(computeStats(branchReviews));
      setDataWarning("The reviews service is unavailable. Showing sample reviews instead.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchReviewsAndStats();
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      setPhotoUrl(uploadEvent.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!title.trim() || !comment.trim()) {
      alert("Please provide a review title and comment.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("http://localhost:5000/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: customerName || (currentUser ? currentUser.name : "Valued Customer"),
          customerEmail: customerEmail || (currentUser ? currentUser.email : "customer@example.com"),
          branchId: reviewBranchId,
          category,
          productName,
          rating,
          aspectRatings: {
            taste: tasteRating,
            presentation: presRating,
            freshness: freshRating,
            service: serviceRating
          },
          title,
          comment,
          photoUrl,
          wouldRecommend
        })
      });

      const data = await res.json();
      if (res.ok) {
        addNotification({
          title: "Feedback Published! ⭐",
          message: `Thank you ${customerName || "connoisseur"}! Your ${rating}★ review has been recorded.`,
          type: "info"
        });
        setTitle("");
        setComment("");
        setProductName("");
        setPhotoUrl(null);
        setActiveTab("reviews");
        fetchReviewsAndStats();
      } else {
        alert(data.error || "Failed to submit review.");
      }
      setIsSubmitting(false);
    } catch (err) {
      console.error(err);
      alert("Could not submit review. Please try again.");
      setIsSubmitting(false);
    }
  };

  const handlePublishReply = async (reviewId) => {
    const replyText = replyInputs[reviewId];
    if (!replyText || !replyText.trim()) return;

    try {
      const token = sessionStorage.getItem("bakesphere_jwt") || localStorage.getItem("bakesphere_jwt");
      const res = await fetch(`http://localhost:5000/api/reviews/${reviewId}/reply`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": "bakesphere_dev_key_2026",
          ...(token ? { "Authorization": `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ replyText })
      });

      if (res.ok) {
        addNotification({
          title: "Manager Response Published! 💬",
          message: "Your official acknowledgment has been attached to the customer review.",
          type: "info"
        });
        setActiveReplyId(null);
        setReplyInputs((prev) => ({ ...prev, [reviewId]: "" }));
        fetchReviewsAndStats();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.8rem" }}>
      {/* Header Banner */}
      <div className="glass-panel" style={{ padding: "1.5rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <div className="badge badge-gold" style={{ marginBottom: "0.5rem" }}>
              ⭐ Customer Voice & Quality Index
            </div>
            <h2 style={{ fontSize: "1.6rem", fontWeight: 800, color: "var(--text-primary)", margin: "0 0 0.4rem" }}>
              Customer Feedback & Branch Rating Center
            </h2>
            <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", margin: 0 }}>
              Verified diner evaluations, aspect scores for taste and freshness, photo uploads, and official managerial replies.
            </p>
          </div>

          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button
              type="button"
              onClick={() => setActiveTab("reviews")}
              style={{
                background: activeTab === "reviews" ? "var(--gold-500)" : "rgba(255, 255, 255, 0.05)",
                color: activeTab === "reviews" ? "#000000" : "#cbd5e1",
                fontWeight: activeTab === "reviews" ? 800 : 600,
                border: "none",
                borderRadius: "8px",
                padding: "0.55rem 1.1rem",
                cursor: "pointer",
                fontSize: "0.85rem"
              }}
            >
              ⭐ Read Reviews & Insights
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("submit")}
              style={{
                background: activeTab === "submit" ? "var(--gold-500)" : "linear-gradient(135deg, #e11d48, #be123c)",
                color: activeTab === "submit" ? "#000000" : "#ffffff",
                fontWeight: 800,
                border: "none",
                borderRadius: "8px",
                padding: "0.55rem 1.1rem",
                cursor: "pointer",
                fontSize: "0.85rem",
                boxShadow: "0 3px 10px rgba(225, 29, 72, 0.3)"
              }}
            >
              ✍️ Write a Review
            </button>
          </div>
        </div>
      </div>

      {dataWarning && (
        <div role="status" className="glass-panel" style={{ padding: "0.8rem 1rem", color: "var(--gold-400)" }}>
          {dataWarning}
        </div>
      )}

      {/* SUB-VIEW 1: WRITE A REVIEW */}
      {activeTab === "submit" && (
        <div className="glass-panel" style={{ padding: "1.8rem", maxWidth: "760px", margin: "0 auto", width: "100%" }}>
          <h3 style={{ margin: "0 0 0.4rem", color: "var(--gold-400)", fontSize: "1.3rem" }}>
            Share Your BakeSphere Culinary Experience
          </h3>
          <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", margin: "0 0 1.5rem" }}>
            Help our master pastry chefs and baking team continually elevate perfection.
          </p>

          <form onSubmit={handleSubmitReview} style={{ display: "flex", flexDirection: "column", gap: "1.2rem" }}>
            {/* Overall Star Rating */}
            <div style={{ textAlign: "center", padding: "1rem", background: "rgba(0,0,0,0.25)", borderRadius: "12px" }}>
              <label style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--text-secondary)", display: "block", marginBottom: "0.5rem" }}>
                OVERALL SATISFACTION RATING
              </label>
              <div style={{ display: "flex", justifyContent: "center", gap: "0.6rem" }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => setRating(star)}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      fontSize: "2.4rem",
                      color: star <= (hoverRating || rating) ? "#fbbf24" : "rgba(255,255,255,0.15)",
                      transform: star <= (hoverRating || rating) ? "scale(1.15)" : "scale(1)",
                      transition: "transform 0.15s ease"
                    }}
                  >
                    ★
                  </button>
                ))}
              </div>
              <div style={{ fontSize: "0.82rem", color: "var(--gold-400)", fontWeight: 700, marginTop: "0.3rem" }}>
                {rating === 5 && "⭐ Outstanding / Michelin Level Perfection"}
                {rating === 4 && "⭐ Very Good / Truly Enjoyed"}
                {rating === 3 && "⭐ Satisfactory / Met Expectations"}
                {rating === 2 && "⭐ Needs Improvement"}
                {rating === 1 && "⭐ Disappointing Experience"}
              </div>
            </div>

            {/* Aspect Ratings Radar Sliders */}
            <div style={{ background: "rgba(255,255,255,0.03)", padding: "1.2rem", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.06)" }}>
              <div style={{ fontSize: "0.82rem", fontWeight: 700, color: "var(--gold-400)", marginBottom: "0.8rem" }}>
                DETAILED CRITIQUE METRICS:
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.78rem", marginBottom: "0.2rem" }}>
                    <span style={{ color: "var(--text-secondary)" }}>🍰 Taste & Texture</span>
                    <strong>{tasteRating}★</strong>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={tasteRating}
                    onChange={(e) => setTasteRating(parseInt(e.target.value, 10))}
                    style={{ width: "100%", accentColor: "var(--gold-500)" }}
                  />
                </div>

                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.78rem", marginBottom: "0.2rem" }}>
                    <span style={{ color: "var(--text-secondary)" }}>🎨 Presentation & Packaging</span>
                    <strong>{presRating}★</strong>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={presRating}
                    onChange={(e) => setPresRating(parseInt(e.target.value, 10))}
                    style={{ width: "100%", accentColor: "var(--gold-500)" }}
                  />
                </div>

                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.78rem", marginBottom: "0.2rem" }}>
                    <span style={{ color: "var(--text-secondary)" }}>🌿 Oven Freshness</span>
                    <strong>{freshRating}★</strong>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={freshRating}
                    onChange={(e) => setFreshRating(parseInt(e.target.value, 10))}
                    style={{ width: "100%", accentColor: "var(--gold-500)" }}
                  />
                </div>

                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.78rem", marginBottom: "0.2rem" }}>
                    <span style={{ color: "var(--text-secondary)" }}>🛵 Service & Courtesy</span>
                    <strong>{serviceRating}★</strong>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={serviceRating}
                    onChange={(e) => setServiceRating(parseInt(e.target.value, 10))}
                    style={{ width: "100%", accentColor: "var(--gold-500)" }}
                  />
                </div>
              </div>
            </div>

            {/* Branch and Category selection */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <div>
                <label style={{ fontSize: "0.8rem", color: "var(--text-secondary)", display: "block", marginBottom: "0.3rem" }}>
                  BRANCH VISITED / ORDERED FROM:
                </label>
                <select
                  value={reviewBranchId}
                  onChange={(e) => setReviewBranchId(e.target.value)}
                  style={{
                    width: "100%",
                    background: "rgba(0,0,0,0.3)",
                    border: "1px solid var(--border-color)",
                    borderRadius: "8px",
                    padding: "0.6rem",
                    color: "#ffffff",
                    fontSize: "0.85rem"
                  }}
                >
                  {branches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name} ({b.locality || "Chennai"})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: "0.8rem", color: "var(--text-secondary)", display: "block", marginBottom: "0.3rem" }}>
                  ITEM CATEGORY:
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  style={{
                    width: "100%",
                    background: "rgba(0,0,0,0.3)",
                    border: "1px solid var(--border-color)",
                    borderRadius: "8px",
                    padding: "0.6rem",
                    color: "#ffffff",
                    fontSize: "0.85rem"
                  }}
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Specific Product Name & Review Title */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <div>
                <label style={{ fontSize: "0.8rem", color: "var(--text-secondary)", display: "block", marginBottom: "0.3rem" }}>
                  SPECIFIC PRODUCT / TREAT NAME:
                </label>
                <input
                  type="text"
                  placeholder="e.g. Belgian Chocolate Truffle Cake, Sourdough..."
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  style={{
                    width: "100%",
                    background: "rgba(0,0,0,0.3)",
                    border: "1px solid var(--border-color)",
                    borderRadius: "8px",
                    padding: "0.6rem",
                    color: "#ffffff",
                    fontSize: "0.85rem"
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: "0.8rem", color: "var(--text-secondary)", display: "block", marginBottom: "0.3rem" }}>
                  REVIEW HEADLINE *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Unbelievable moistness and decadent frosting!"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  style={{
                    width: "100%",
                    background: "rgba(0,0,0,0.3)",
                    border: "1px solid var(--border-color)",
                    borderRadius: "8px",
                    padding: "0.6rem",
                    color: "#ffffff",
                    fontSize: "0.85rem"
                  }}
                />
              </div>
            </div>

            {/* Comment */}
            <div>
              <label style={{ fontSize: "0.8rem", color: "var(--text-secondary)", display: "block", marginBottom: "0.3rem" }}>
                DETAILED TASTING STORY & FEEDBACK *
              </label>
              <textarea
                required
                rows={4}
                placeholder="Share your thoughts on the crumb texture, sweetness balance, packaging, and presentation..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                style={{
                  width: "100%",
                  background: "rgba(0,0,0,0.3)",
                  border: "1px solid var(--border-color)",
                  borderRadius: "8px",
                  padding: "0.65rem",
                  color: "#ffffff",
                  fontSize: "0.85rem"
                }}
              />
            </div>

            {/* Photo attachment & Would Recommend */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.8rem" }}>
                <label
                  style={{
                    background: "rgba(255,255,255,0.06)",
                    border: "1px dashed rgba(255,255,255,0.2)",
                    borderRadius: "8px",
                    padding: "0.5rem 0.9rem",
                    fontSize: "0.8rem",
                    cursor: "pointer",
                    color: "var(--text-secondary)"
                  }}
                >
                  📷 Attach Photo
                  <input type="file" accept="image/*" style={{ display: "none" }} onChange={handlePhotoUpload} />
                </label>

                {photoUrl && (
                  <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                    <img src={photoUrl} alt="Preview" style={{ width: "36px", height: "36px", borderRadius: "6px", objectFit: "cover" }} />
                    <button type="button" onClick={() => setPhotoUrl(null)} style={{ background: "none", border: "none", color: "#f87171", cursor: "pointer" }}>
                      ✕
                    </button>
                  </div>
                )}
              </div>

              <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.85rem", cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={wouldRecommend}
                  onChange={(e) => setWouldRecommend(e.target.checked)}
                  style={{ accentColor: "var(--gold-500)", width: "16px", height: "16px" }}
                />
                <span>👍 I recommend this branch to friends</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
                color: "#000000",
                border: "none",
                borderRadius: "8px",
                padding: "0.75rem",
                fontSize: "0.95rem",
                fontWeight: 800,
                cursor: "pointer",
                boxShadow: "0 4px 15px rgba(245, 158, 11, 0.4)",
                marginTop: "0.5rem"
              }}
            >
              {isSubmitting ? "Publishing Review..." : "🚀 Publish Customer Review"}
            </button>
          </form>
        </div>
      )}

      {/* SUB-VIEW 2: REVIEWS ARCHIVE & STATS DASHBOARD */}
      {activeTab === "reviews" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          {/* Executive Rating KPI Cards */}
          {stats && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1rem" }}>
              <div className="glass-panel" style={{ padding: "1.3rem", display: "flex", alignItems: "center", gap: "1rem", borderLeft: "4px solid #f59e0b" }}>
                <div style={{ fontSize: "2.5rem", color: "var(--gold-400)", fontWeight: 900 }}>
                  {stats.averageRating}
                </div>
                <div>
                  <div style={{ color: "#fbbf24", fontSize: "1rem" }}>★★★★★</div>
                  <div style={{ fontSize: "0.82rem", fontWeight: 700, color: "var(--text-primary)" }}>
                    Overall Satisfaction
                  </div>
                  <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>
                    Based on {stats.totalReviews} verified guest reviews
                  </div>
                </div>
              </div>

              <div className="glass-panel" style={{ padding: "1.3rem", borderLeft: "4px solid #10b981" }}>
                <div style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>Recommendation Rate</div>
                <div style={{ fontSize: "1.8rem", fontWeight: 800, color: "#10b981", margin: "0.2rem 0" }}>
                  {stats.recommendRate}%
                </div>
                <span style={{ fontSize: "0.74rem", color: "var(--text-secondary)" }}>
                  Guests enthusiastically recommend
                </span>
              </div>

              {/* Aspect Scores */}
              <div className="glass-panel" style={{ padding: "1.3rem", borderLeft: "4px solid #38bdf8" }}>
                <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginBottom: "0.4rem" }}>Aspect Scores</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.3rem", fontSize: "0.75rem" }}>
                  <div>🍰 Taste: <strong style={{ color: "var(--gold-400)" }}>{stats.aspects.taste}★</strong></div>
                  <div>🌿 Freshness: <strong style={{ color: "var(--gold-400)" }}>{stats.aspects.freshness}★</strong></div>
                  <div>🎨 Presentation: <strong style={{ color: "var(--gold-400)" }}>{stats.aspects.presentation}★</strong></div>
                  <div>🛵 Service: <strong style={{ color: "var(--gold-400)" }}>{stats.aspects.service}★</strong></div>
                </div>
              </div>
            </div>
          )}

          {/* Filter Bar */}
          <div className="glass-panel" style={{ padding: "1rem", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.8rem" }}>
            <div style={{ display: "flex", gap: "0.6rem", alignItems: "center", flexWrap: "wrap" }}>
              {/* Branch Filter */}
              <select
                value={selectedBranchId}
                onChange={(e) => setSelectedBranchId(e.target.value)}
                style={{
                  background: "rgba(0,0,0,0.35)",
                  color: "#ffffff",
                  border: "1px solid var(--border-color)",
                  borderRadius: "8px",
                  padding: "0.45rem 0.8rem",
                  fontSize: "0.82rem",
                  fontWeight: 700
                }}
              >
                <option value="ALL">All Chennai Flagships</option>
                {branches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>

              {/* Rating Star Filter */}
              <div style={{ display: "flex", gap: "0.3rem" }}>
                {[
                  { id: "ALL", label: "All Ratings" },
                  { id: "5", label: "5★ Only" },
                  { id: "4", label: "4★" },
                  { id: "3", label: "3★" }
                ].map((rf) => (
                  <button
                    key={rf.id}
                    type="button"
                    onClick={() => setSelectedRating(rf.id)}
                    style={{
                      background: selectedRating === rf.id ? "var(--gold-500)" : "rgba(255,255,255,0.05)",
                      color: selectedRating === rf.id ? "#000000" : "#cbd5e1",
                      border: "none",
                      borderRadius: "6px",
                      padding: "0.35rem 0.65rem",
                      fontSize: "0.75rem",
                      fontWeight: 700,
                      cursor: "pointer"
                    }}
                  >
                    {rf.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Keyword Search */}
            <form onSubmit={handleSearchSubmit} style={{ display: "flex", gap: "0.4rem" }}>
              <input
                type="text"
                placeholder="Search reviews..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  background: "rgba(0,0,0,0.3)",
                  border: "1px solid var(--border-color)",
                  borderRadius: "6px",
                  padding: "0.4rem 0.7rem",
                  fontSize: "0.8rem",
                  color: "#ffffff"
                }}
              />
              <button
                type="submit"
                style={{
                  background: "rgba(255,255,255,0.08)",
                  border: "1px solid rgba(255,255,255,0.15)",
                  color: "#ffffff",
                  padding: "0 0.8rem",
                  borderRadius: "6px",
                  fontSize: "0.78rem",
                  cursor: "pointer"
                }}
              >
                Search
              </button>
            </form>
          </div>

          {/* Reviews List */}
          {isLoading ? (
            <div style={{ textAlign: "center", padding: "3rem", color: "var(--gold-400)" }}>Loading reviews...</div>
          ) : reviews.length === 0 ? (
            <div style={{ textAlign: "center", padding: "3rem", color: "var(--text-muted)" }}>
              <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>⭐</div>
              <p>No reviews match your selected filter criteria.</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "1.2rem" }}>
              {reviews.map((rev) => (
                <div
                  key={rev.id}
                  className="glass-panel"
                  style={{
                    padding: "1.4rem",
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.8rem",
                    border: "1px solid rgba(255,255,255,0.07)"
                  }}
                >
                  {/* Top user row */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "0.5rem" }}>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                        <strong style={{ fontSize: "1rem", color: "#ffffff" }}>{rev.customerName}</strong>
                        {rev.verifiedPurchase && (
                          <span
                            style={{
                              background: "rgba(16, 185, 129, 0.15)",
                              color: "#34d399",
                              fontSize: "0.68rem",
                              fontWeight: 700,
                              padding: "0.15rem 0.5rem",
                              borderRadius: "4px"
                            }}
                          >
                            ✓ Verified Connoisseur
                          </span>
                        )}
                        <span style={{ fontSize: "0.74rem", color: "var(--text-muted)" }}>• {rev.branchName}</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", marginTop: "0.2rem" }}>
                        <span style={{ color: "#fbbf24", fontSize: "0.9rem" }}>{"★".repeat(rev.rating)}</span>
                        <span style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>
                          {new Date(rev.createdAt).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })}
                        </span>
                      </div>
                    </div>

                    {rev.wouldRecommend && (
                      <span className="badge badge-emerald" style={{ fontSize: "0.72rem" }}>
                        👍 Recommends BakeSphere
                      </span>
                    )}
                  </div>

                  {/* Title and Comment */}
                  <div>
                    <h4 style={{ margin: "0 0 0.3rem", fontSize: "1.05rem", color: "var(--gold-400)" }}>
                      "{rev.title}"
                    </h4>
                    <p style={{ margin: 0, fontSize: "0.86rem", color: "var(--text-secondary)", lineHeight: 1.45 }}>
                      {rev.comment}
                    </p>
                  </div>

                  {/* Photo attachment if available */}
                  {rev.photoUrl && (
                    <div style={{ marginTop: "0.3rem" }}>
                      <img
                        src={rev.photoUrl}
                        alt="Customer Order"
                        style={{ width: "120px", height: "90px", borderRadius: "8px", objectFit: "cover", border: "1px solid rgba(255,255,255,0.15)" }}
                      />
                    </div>
                  )}

                  {/* Aspect score badges */}
                  <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", paddingTop: "0.4rem" }}>
                    {rev.aspectRatings && (
                      <>
                        <span style={{ background: "rgba(255,255,255,0.05)", padding: "0.2rem 0.5rem", borderRadius: "4px", fontSize: "0.72rem", color: "var(--text-secondary)" }}>
                          Taste: {rev.aspectRatings.taste}★
                        </span>
                        <span style={{ background: "rgba(255,255,255,0.05)", padding: "0.2rem 0.5rem", borderRadius: "4px", fontSize: "0.72rem", color: "var(--text-secondary)" }}>
                          Freshness: {rev.aspectRatings.freshness}★
                        </span>
                        <span style={{ background: "rgba(255,255,255,0.05)", padding: "0.2rem 0.5rem", borderRadius: "4px", fontSize: "0.72rem", color: "var(--text-secondary)" }}>
                          Presentation: {rev.aspectRatings.presentation}★
                        </span>
                      </>
                    )}
                  </div>

                  {/* Manager Reply Display */}
                  {rev.managerReply && (
                    <div
                      style={{
                        background: "rgba(245, 158, 11, 0.08)",
                        borderLeft: "3px solid var(--gold-500)",
                        borderRadius: "0 8px 8px 0",
                        padding: "0.8rem 1rem",
                        marginTop: "0.4rem"
                      }}
                    >
                      <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--gold-400)", marginBottom: "0.2rem" }}>
                        🛡️ Response from {rev.managerReply.repliedBy}:
                      </div>
                      <p style={{ margin: 0, fontSize: "0.82rem", color: "#fef08a" }}>
                        "{rev.managerReply.text}"
                      </p>
                    </div>
                  )}

                  {/* Manager Reply Action Trigger (If Staff/Admin and No Reply Yet) */}
                  {isStaffOrAdmin && !rev.managerReply && (
                    <div style={{ marginTop: "0.5rem" }}>
                      {activeReplyId === rev.id ? (
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                          <textarea
                            rows={2}
                            placeholder="Write an official managerial response to this customer..."
                            value={replyInputs[rev.id] || ""}
                            onChange={(e) => setReplyInputs((prev) => ({ ...prev, [rev.id]: e.target.value }))}
                            style={{
                              width: "100%",
                              background: "rgba(0,0,0,0.35)",
                              border: "1px solid var(--border-color)",
                              borderRadius: "6px",
                              padding: "0.5rem",
                              color: "#ffffff",
                              fontSize: "0.82rem"
                            }}
                          />
                          <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
                            <button
                              type="button"
                              onClick={() => setActiveReplyId(null)}
                              style={{ background: "none", border: "none", color: "#94a3b8", cursor: "pointer", fontSize: "0.78rem" }}
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              onClick={() => handlePublishReply(rev.id)}
                              style={{
                                background: "var(--gold-500)",
                                color: "#000000",
                                border: "none",
                                borderRadius: "6px",
                                padding: "0.35rem 0.9rem",
                                fontSize: "0.78rem",
                                fontWeight: 800,
                                cursor: "pointer"
                              }}
                            >
                              Publish Response
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setActiveReplyId(rev.id)}
                          style={{
                            background: "rgba(255,255,255,0.06)",
                            border: "1px solid rgba(255,255,255,0.12)",
                            color: "var(--gold-400)",
                            padding: "0.35rem 0.8rem",
                            borderRadius: "6px",
                            fontSize: "0.75rem",
                            fontWeight: 700,
                            cursor: "pointer"
                          }}
                        >
                          💬 Reply as Branch Manager
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
