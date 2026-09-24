import express from "express";

const router = express.Router();

export const apiEndpointCatalog = [
  {
    id: "auth-login",
    tag: "Authentication",
    method: "POST",
    path: "/api/auth/login",
    description: "Authenticate user and receive JWT Bearer token with role claims",
    authRequired: false,
    sampleBody: {
      email: "admin@bakesphere.com",
      password: "Bakery@2026"
    }
  },
  {
    id: "auth-google",
    tag: "Authentication",
    method: "POST",
    path: "/api/auth/google-oauth",
    description: "Simulated & live Google OAuth 2.0 token handshake",
    authRequired: false,
    sampleBody: {
      email: "mentor.evaluator@gmail.com",
      name: "Mentor Evaluator",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"
    }
  },
  {
    id: "products-list",
    tag: "Products",
    method: "GET",
    path: "/api/products",
    description: "Fetch all bakery products with optional ?category= and ?search=",
    authRequired: false,
    sampleQuery: "?category=Cakes"
  },
  {
    id: "recipe-scale",
    tag: "Production & Recipes",
    method: "POST",
    path: "/api/recipes/scale",
    description: "Dynamic Recipe Scaler — calculates exact grams and inventory availability for target batch volume",
    authRequired: false,
    sampleBody: {
      recipeId: "REC-01",
      targetUnits: 25
    }
  },
  {
    id: "fefo-consume",
    tag: "Production & FEFO",
    method: "POST",
    path: "/api/production/consume-fefo",
    description: "Deducts raw materials from inventory and creates production batch with expiry date",
    authRequired: true,
    sampleBody: {
      recipeId: "REC-01",
      quantity: 10,
      branchId: "BR-01"
    }
  },
  {
    id: "inventory-fefo-alerts",
    tag: "Inventory & Waste",
    method: "GET",
    path: "/api/inventory/fefo-alerts",
    description: "Identifies batches expiring in <=24h and calculates total at-risk cost",
    authRequired: false
  },
  {
    id: "pos-checkout",
    tag: "Point of Sale",
    method: "POST",
    path: "/api/pos/checkout",
    description: "Processes POS transaction, applies coupons/loyalty points, and returns printable thermal invoice",
    authRequired: true,
    sampleBody: {
      items: [
        { productId: 1, quantity: 1, price: 850 },
        { productId: 3, quantity: 2, price: 120 }
      ],
      customerName: "Sneha V",
      customerPhone: "+91 91760 33445",
      couponCode: "FESTIVAL10",
      loyaltyPointsRedeemed: 50,
      paymentMethod: "UPI"
    }
  },
  {
    id: "custom-cake-quote",
    tag: "Custom Cake Studio",
    method: "POST",
    path: "/api/custom-cakes/quote",
    description: "Dynamic quote engine calculating tiered cake prices, fillings, toppings, and turnaround rush fee",
    authRequired: false,
    sampleBody: {
      tiers: 2,
      weightKg: 3.5,
      baseSponge: "Belgian Dark Chocolate",
      filling: "Belgian Dark Ganache",
      shape: "Round",
      theme: "Pastel Teddy Bear",
      toppings: ["gold_foil", "macarons"],
      turnaround: "standard"
    }
  },
  {
    id: "ai-forecast",
    tag: "AI Intelligence",
    method: "GET",
    path: "/api/ai/forecast",
    description: "Predictive demand model for tomorrow's production based on day velocity and seasonal factors",
    authRequired: false
  },
  {
    id: "ai-chatbot",
    tag: "AI Intelligence",
    method: "POST",
    path: "/api/ai/chatbot",
    description: "Natural language query handler for Chef Pierre AI Assistant",
    authRequired: false,
    sampleBody: {
      message: "How much flour and butter do I need for a 20kg chocolate cake?"
    }
  },
  {
    id: "analytics-dashboard",
    tag: "Analytics",
    method: "GET",
    path: "/api/analytics/dashboard",
    description: "Executive KPIs, peak hours, category breakdown, and branch comparison",
    authRequired: false
  }
];

router.get("/endpoints", (req, res) => {
  res.json({
    title: "BakeSphere REST API Specification",
    version: "1.0.0",
    authHeader: "Authorization: Bearer <token> OR x-api-key: bakesphere_dev_key_2026",
    endpoints: apiEndpointCatalog
  });
});

export default router;
