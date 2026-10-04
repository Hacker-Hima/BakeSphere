import express from "express";
import { customerReviews } from "../data/reviews.js";
import { bakeryBranches } from "../data/branches.js";
import { auditLogs } from "../data/auditLogs.js";
import { authenticateToken } from "../middleware/auth.js";


const router = express.Router();

// GET /api/reviews
router.get("/", (req, res) => {
  const { branchId, rating, category, search } = req.query;
  let items = [...customerReviews];

  if (branchId && branchId !== "ALL") {
    items = items.filter((r) => r.branchId === branchId);
  }

  if (rating && rating !== "ALL") {
    items = items.filter((r) => r.rating === parseInt(rating, 10));
  }

  if (category && category !== "ALL") {
    items = items.filter((r) => r.category.toLowerCase() === category.toLowerCase());
  }

  if (search && search.trim()) {
    const q = search.toLowerCase().trim();
    items = items.filter(
      (r) =>
        r.customerName.toLowerCase().includes(q) ||
        r.title.toLowerCase().includes(q) ||
        r.comment.toLowerCase().includes(q) ||
        (r.productName && r.productName.toLowerCase().includes(q))
    );
  }

  res.json({
    count: items.length,
    reviews: items
  });
});

// GET /api/reviews/stats (Aggregated statistics for admin/manager dashboards)
router.get("/stats", (req, res) => {
  const { branchId } = req.query;
  let items = [...customerReviews];

  if (branchId && branchId !== "ALL") {
    items = items.filter((r) => r.branchId === branchId);
  }

  const total = items.length;
  if (total === 0) {
    return res.json({
      averageRating: 5.0,
      totalReviews: 0,
      recommendRate: 100,
      distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
      aspects: { taste: 5.0, presentation: 5.0, freshness: 5.0, service: 5.0 }
    });
  }

  const sumRating = items.reduce((sum, r) => sum + r.rating, 0);
  const averageRating = parseFloat((sumRating / total).toFixed(2));

  const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  items.forEach((r) => {
    if (distribution[r.rating] !== undefined) {
      distribution[r.rating]++;
    }
  });

  const recommendCount = items.filter((r) => r.wouldRecommend).length;
  const recommendRate = Math.round((recommendCount / total) * 100);

  // Aspect averages
  const tasteSum = items.reduce((sum, r) => sum + (r.aspectRatings?.taste || r.rating), 0);
  const presSum = items.reduce((sum, r) => sum + (r.aspectRatings?.presentation || r.rating), 0);
  const freshSum = items.reduce((sum, r) => sum + (r.aspectRatings?.freshness || r.rating), 0);
  const servSum = items.reduce((sum, r) => sum + (r.aspectRatings?.service || r.rating), 0);

  res.json({
    branchId: branchId || "ALL",
    averageRating,
    totalReviews: total,
    recommendRate,
    distribution,
    aspects: {
      taste: parseFloat((tasteSum / total).toFixed(1)),
      presentation: parseFloat((presSum / total).toFixed(1)),
      freshness: parseFloat((freshSum / total).toFixed(1)),
      service: parseFloat((servSum / total).toFixed(1))
    }
  });
});

// POST /api/reviews (Customer submits review)
router.post("/", (req, res) => {
  const {
    orderId,
    customerName,
    customerEmail,
    branchId = "BR-01",
    category = "Cakes",
    productName,
    rating = 5,
    aspectRatings = {},
    title,
    comment,
    photoUrl = null,
    wouldRecommend = true
  } = req.body;

  if (!title || !comment) {
    return res.status(400).json({ error: "Please provide a review title and comment." });
  }

  const branchObj = bakeryBranches.find((b) => b.id === branchId) || bakeryBranches[0];
  const newReview = {
    id: `REV-${Date.now().toString().slice(-4)}`,
    orderId: orderId || `BS-ORD-${Math.floor(1000 + Math.random() * 9000)}`,
    customerName: customerName || "Valued Connoisseur",
    customerEmail: customerEmail || "customer@example.com",
    branchId,
    branchName: branchObj.name,
    category,
    productName: productName || `${category} Selection`,
    rating: Math.min(5, Math.max(1, parseInt(rating, 10) || 5)),
    aspectRatings: {
      taste: Math.min(5, Math.max(1, parseInt(aspectRatings.taste, 10) || rating)),
      presentation: Math.min(5, Math.max(1, parseInt(aspectRatings.presentation, 10) || rating)),
      freshness: Math.min(5, Math.max(1, parseInt(aspectRatings.freshness, 10) || rating)),
      service: Math.min(5, Math.max(1, parseInt(aspectRatings.service, 10) || rating))
    },
    title,
    comment,
    photoUrl,
    verifiedPurchase: true,
    wouldRecommend: Boolean(wouldRecommend),
    tags: ["Verified Guest", "Fresh Tasting"],
    managerReply: null,
    createdAt: new Date().toISOString()
  };

  customerReviews.unshift(newReview);

  auditLogs.unshift({
    id: `LOG-${Date.now().toString().slice(-4)}`,
    timestamp: new Date().toISOString(),
    userName: newReview.customerName,
    userRole: "customer",
    action: "REVIEW_SUBMITTED",
    details: `Customer posted a ${newReview.rating}★ review for ${newReview.branchName}: "${newReview.title}"`
  });

  res.status(201).json({
    message: "Thank you for your feedback! Your review helps us craft perfection.",
    review: newReview
  });
});

// POST /api/reviews/:id/reply (Manager / Admin responds to review)
router.post("/:id/reply", authenticateToken, (req, res) => {
  const { id } = req.params;
  const { replyText } = req.body;

  if (!replyText || !replyText.trim()) {
    return res.status(400).json({ error: "Please enter a response message." });
  }

  const review = customerReviews.find((r) => r.id === id);
  if (!review) {
    return res.status(404).json({ error: "Review not found." });
  }

  const user = req.user || { name: "Branch Manager", role: "manager" };
  const roleTitle = user.role === "admin" ? "Central Executive Admin" : "Branch Manager";

  review.managerReply = {
    text: replyText.trim(),
    repliedBy: `${user.name} (${roleTitle})`,
    repliedAt: new Date().toISOString()
  };

  auditLogs.unshift({
    id: `LOG-${Date.now().toString().slice(-4)}`,
    timestamp: new Date().toISOString(),
    userName: user.name,
    userRole: user.role,
    action: "REVIEW_REPLIED",
    details: `${roleTitle} replied to review ${review.id} (${review.customerName}).`
  });

  res.json({
    message: "Manager response published successfully!",
    review
  });
});

export default router;
