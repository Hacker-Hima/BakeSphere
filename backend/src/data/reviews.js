/**
 * BakeSphere Customer Feedback & Reviews Data Store
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
    aspectRatings: {
      taste: 5,
      presentation: 5,
      freshness: 5,
      service: 5
    },
    title: "Most heavenly Belgian Truffle cake in Chennai!",
    comment: "Ordered for my daughter's 5th birthday. The texture was velvety, the gold foil was impeccable, and it arrived in chilled temperature-controlled packaging.",
    photoUrl: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600&auto=format&fit=crop&q=80",
    verifiedPurchase: true,
    wouldRecommend: true,
    tags: ["Super Moist", "Velvety Ganache", "On-Time Delivery"],
    managerReply: {
      text: "Thank you so much Priya! We are thrilled to hear your daughter loved the cake. We look forward to serving your next celebration!",
      repliedBy: "Rajesh Kannan (Branch Manager)",
      repliedAt: "2026-10-02T12:00:00.000Z"
    },
    createdAt: "2026-10-01T15:30:00.000Z"
  },
  {
    id: "REV-102",
    orderId: "BS-ORD-9055",
    customerName: "Karthik Venkat",
    customerEmail: "karthik.v@gmail.com",
    branchId: "BR-02",
    branchName: "Adyar Artisan Studio",
    category: "Breads",
    productName: "Artisan Sourdough Boule",
    rating: 5,
    aspectRatings: {
      taste: 5,
      presentation: 4,
      freshness: 5,
      service: 4
    },
    title: "Authentic wild yeast sourdough with perfect blistered crust",
    comment: "The crumb structure and tangy lactic notes are unmatched in Chennai. We buy two loaves every Saturday morning fresh from the 8 AM oven cycle.",
    photoUrl: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&auto=format&fit=crop&q=80",
    verifiedPurchase: true,
    wouldRecommend: true,
    tags: ["Authentic Crust", "Open Crumb", "Artisan Baker"],
    managerReply: null,
    createdAt: "2026-10-02T09:15:00.000Z"
  },
  {
    id: "REV-103",
    orderId: "BS-ORD-9110",
    customerName: "Sneha & Rahul",
    customerEmail: "sneha.rahul@outlook.com",
    branchId: "BR-03",
    branchName: "Anna Nagar Grand Bakery & Cafe",
    category: "Custom Cake",
    productName: "Velvet Rose Cascade 3D Cake",
    rating: 5,
    aspectRatings: {
      taste: 5,
      presentation: 5,
      freshness: 5,
      service: 5
    },
    title: "Our 25th Silver Jubilee centerpiece cake stole the show!",
    comment: "Designed using the BakeSphere 3D Studio. The sugar roses and edible gold foil looked like a museum exhibit. Guests couldn't stop taking photos!",
    photoUrl: "https://images.unsplash.com/photo-1535141192574-5d4897c13136?w=600&auto=format&fit=crop&q=80",
    verifiedPurchase: true,
    wouldRecommend: true,
    tags: ["3D Studio Design", "Silver Jubilee", "Showstopper"],
    managerReply: {
      text: "Warmest congratulations on your 25th anniversary Sneha and Rahul! Chef Pierre and team put their heart into sculpting every rose petal.",
      repliedBy: "Anita Balan (General Manager)",
      repliedAt: "2026-10-03T10:00:00.000Z"
    },
    createdAt: "2026-10-02T19:40:00.000Z"
  },
  {
    id: "REV-104",
    orderId: "BS-ORD-8942",
    customerName: "Dr. Anirudh Raman",
    customerEmail: "dr.anirudh@apollo.org",
    branchId: "BR-04",
    branchName: "OMR IT Corridor Express Hub",
    category: "Pastries",
    productName: "Wild Blueberry Danish",
    rating: 4,
    aspectRatings: {
      taste: 5,
      presentation: 4,
      freshness: 4,
      service: 4
    },
    title: "Delicious breakfast pastry during morning hospital transit",
    comment: "Flaky butter lamination and fresh mountain blueberries. Would love to see an espresso combo option available during 7-9 AM rushes.",
    photoUrl: null,
    verifiedPurchase: true,
    wouldRecommend: true,
    tags: ["Flaky Lamination", "Fresh Berries", "Great Breakfast"],
    managerReply: null,
    createdAt: "2026-09-30T08:20:00.000Z"
  }
];
