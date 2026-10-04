/**
 * BakeSphere - Frontend Fallback Reviews Data
 * Used when the backend API is unreachable
 */

export const customerReviews = [
  {
    id: "REV-101",
    orderId: "BS-ORD-9021",
    customerName: "Priya Sundaram",
    customerEmail: "priya.s@example.com",
    branchId: "BR-01",
    branchName: "Flagship T. Nagar Hub",
    category: "Cakes",
    productName: "Belgian Chocolate Truffle Cake",
    rating: 5,
    aspectRatings: { taste: 5, presentation: 5, freshness: 5, service: 5 },
    title: "Most heavenly Belgian Truffle cake in Chennai!",
    comment: "Ordered for my daughter's 5th birthday. The texture was velvety, the gold foil was impeccable, and it arrived in chilled packaging.",
    photoUrl: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600&auto=format&fit=crop&q=80",
    verifiedPurchase: true,
    wouldRecommend: true,
    tags: ["Super Moist", "Velvety Ganache", "On-Time Delivery"],
    managerReply: { text: "Thank you Priya! We are thrilled to hear your daughter loved the cake!", repliedBy: "Rajesh Kannan (Branch Manager)", repliedAt: "2026-10-02T12:00:00.000Z" },
    createdAt: "2026-10-01T15:30:00.000Z"
  },
  {
    id: "REV-102",
    orderId: "BS-ORD-9055",
    customerName: "Karthik Venkat",
    customerEmail: "karthik.v@gmail.com",
    branchId: "BR-02",
    branchName: "Anna Nagar Flagship",
    category: "Pastries",
    productName: "Almond Butter Croissant",
    rating: 5,
    aspectRatings: { taste: 5, presentation: 5, freshness: 5, service: 4 },
    title: "The croissants are life-changing — pure Parisian quality!",
    comment: "I've had croissants across Europe, and these rival any Parisian boulangerie. Buttery, flaky with incredible honeycomb structure.",
    photoUrl: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=600&auto=format&fit=crop&q=80",
    verifiedPurchase: true,
    wouldRecommend: true,
    tags: ["Flaky Layers", "Buttery", "Fresh Daily"],
    managerReply: null,
    createdAt: "2026-10-02T09:15:00.000Z"
  },
  {
    id: "REV-103",
    orderId: "BS-ORD-9060",
    customerName: "Ananya Krishnan",
    customerEmail: "ananya.k@outlook.com",
    branchId: "BR-01",
    branchName: "Flagship T. Nagar Hub",
    category: "Custom Cake",
    productName: "3D Galaxy Theme Custom Cake",
    rating: 5,
    aspectRatings: { taste: 5, presentation: 5, freshness: 5, service: 5 },
    title: "Absolutely stunning 3D galaxy cake — a masterpiece!",
    comment: "Commissioned a galaxy theme cake for our company anniversary. The edible glitter and fondant planets left 200+ guests speechless.",
    photoUrl: "https://images.unsplash.com/photo-1562440499-64b9a5a25030?w=600&auto=format&fit=crop&q=80",
    verifiedPurchase: true,
    wouldRecommend: true,
    tags: ["Edible Glitter", "Custom Design", "Corporate Event"],
    managerReply: { text: "Creating your galaxy masterpiece was a privilege! Our 3D team put their heart into every planet and star.", repliedBy: "Chef Pierre Bouchard (Master Patissier)", repliedAt: "2026-10-03T08:30:00.000Z" },
    createdAt: "2026-10-02T18:00:00.000Z"
  },
  {
    id: "REV-104",
    orderId: "BS-ORD-9078",
    customerName: "Rahul Sharma",
    customerEmail: "rahul.s@gmail.com",
    branchId: "BR-03",
    branchName: "Koyambedu Express Hub",
    category: "Breads",
    productName: "Multigrain Sourdough Loaf",
    rating: 4,
    aspectRatings: { taste: 4, presentation: 4, freshness: 5, service: 4 },
    title: "Excellent sourdough — best I have had in Chennai",
    comment: "The crust is perfectly crackling, crumb open and chewy. Made with real starter culture. My family orders every weekend now.",
    photoUrl: null,
    verifiedPurchase: true,
    wouldRecommend: true,
    tags: ["Artisan Bread", "Sourdough", "Healthy"],
    managerReply: null,
    createdAt: "2026-10-03T07:45:00.000Z"
  },
  {
    id: "REV-105",
    orderId: "BS-ORD-9081",
    customerName: "Meera Pillai",
    customerEmail: "meera.p@yahoo.com",
    branchId: "BR-01",
    branchName: "Flagship T. Nagar Hub",
    category: "Cookies & Biscuits",
    productName: "Belgian Dark Chocolate Chunk Cookies",
    rating: 5,
    aspectRatings: { taste: 5, presentation: 4, freshness: 5, service: 5 },
    title: "These cookies are dangerously addictive!",
    comment: "The chocolate chunks are actual Callebaut Belgian couverture. Crispy edges, gooey center, sea salt flakes on top. Ordered 3 boxes in one week.",
    photoUrl: "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=600&auto=format&fit=crop&q=80",
    verifiedPurchase: true,
    wouldRecommend: true,
    tags: ["Belgian Chocolate", "Gooey Center", "Sea Salt"],
    managerReply: null,
    createdAt: "2026-10-03T14:20:00.000Z"
  },
  {
    id: "REV-106",
    orderId: "BS-ORD-9088",
    customerName: "Vishwas Nair",
    customerEmail: "vishwas.n@gmail.com",
    branchId: "BR-02",
    branchName: "Anna Nagar Flagship",
    category: "Beverages",
    productName: "Single Origin Pour-Over Coffee",
    rating: 4,
    aspectRatings: { taste: 5, presentation: 4, freshness: 5, service: 3 },
    title: "Exceptional coffee, slight wait time but worth it",
    comment: "The Coorg single-origin pour-over was exceptional. Floral notes, bright acidity. Only gripe is the 12-minute wait during peak hours.",
    photoUrl: null,
    verifiedPurchase: true,
    wouldRecommend: true,
    tags: ["Single Origin", "Pour-Over", "Specialty Coffee"],
    managerReply: { text: "Thank you Vishwas for the honest feedback! We are adding a second pour-over station to reduce wait times.", repliedBy: "Rajesh Kannan (Branch Manager)", repliedAt: "2026-10-04T09:00:00.000Z" },
    createdAt: "2026-10-03T17:30:00.000Z"
  }
];

export function computeStats(reviews) {
  const total = reviews.length;
  if (total === 0) {
    return { averageRating: 5.0, totalReviews: 0, recommendRate: 100, distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }, aspects: { taste: 5.0, presentation: 5.0, freshness: 5.0, service: 5.0 } };
  }
  const sumRating = reviews.reduce((s, r) => s + r.rating, 0);
  const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  reviews.forEach((r) => { if (distribution[r.rating] !== undefined) distribution[r.rating]++; });
  const recommendCount = reviews.filter((r) => r.wouldRecommend).length;
  return {
    averageRating: parseFloat((sumRating / total).toFixed(2)),
    totalReviews: total,
    recommendRate: Math.round((recommendCount / total) * 100),
    distribution,
    aspects: {
      taste: parseFloat((reviews.reduce((s, r) => s + (r.aspectRatings?.taste || r.rating), 0) / total).toFixed(1)),
      presentation: parseFloat((reviews.reduce((s, r) => s + (r.aspectRatings?.presentation || r.rating), 0) / total).toFixed(1)),
      freshness: parseFloat((reviews.reduce((s, r) => s + (r.aspectRatings?.freshness || r.rating), 0) / total).toFixed(1)),
      service: parseFloat((reviews.reduce((s, r) => s + (r.aspectRatings?.service || r.rating), 0) / total).toFixed(1))
    }
  };
}
