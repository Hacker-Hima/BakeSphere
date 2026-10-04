const now = new Date();
const hoursFromNow = (h) => new Date(now.getTime() + h * 3600 * 1000).toISOString();
const hoursAgo = (h) => new Date(now.getTime() - h * 3600 * 1000).toISOString();

export const productionBatches = [
  {
    batchId: "BATCH-261003-CHOC-01",
    productId: 1,
    productName: "Belgian Chocolate Truffle Cake",
    branchId: "BR-01",
    quantityProduced: 24,
    quantityRemaining: 8,
    producedAt: hoursAgo(18),
    expiresAt: hoursFromNow(18), // Expiring in 18 hours (Today!)
    baker: "Chef Pierre Bouchard",
    status: "expiring_soon",
    fefoPriority: 2,
    discountApplied: 0,
    costPricePerUnit: 420.0,
    sellingPrice: 850.0
  },
  {
    batchId: "BATCH-261003-PAST-02",
    productId: 4,
    productName: "Wild Blueberry Danish",
    branchId: "BR-01",
    quantityProduced: 40,
    quantityRemaining: 14,
    producedAt: hoursAgo(22),
    expiresAt: hoursFromNow(6), // Expiring in 6 hours (Flash sale!)
    baker: "Chef Pierre Bouchard",
    status: "expiring_today",
    fefoPriority: 1, // Must sell first!
    discountApplied: 25, // AI Flash Sale 25% Off
    costPricePerUnit: 65.0,
    sellingPrice: 160.0
  },
  {
    batchId: "BATCH-261003-SOUR-03",
    productId: 2,
    productName: "Artisan Sourdough Boule",
    branchId: "BR-02",
    quantityProduced: 50,
    quantityRemaining: 32,
    producedAt: hoursAgo(8),
    expiresAt: hoursFromNow(52), // Fresh (2+ days)
    baker: "Rajan Bakery Asst",
    status: "fresh",
    fefoPriority: 3,
    discountApplied: 0,
    costPricePerUnit: 70.0,
    sellingPrice: 180.0
  },
  {
    batchId: "BATCH-261003-CROI-04",
    productId: 3,
    productName: "French Butter Croissant",
    branchId: "BR-01",
    quantityProduced: 60,
    quantityRemaining: 22,
    producedAt: hoursAgo(10),
    expiresAt: hoursFromNow(14), // Expiring in 14 hours
    baker: "Chef Pierre Bouchard",
    status: "expiring_soon",
    fefoPriority: 2,
    discountApplied: 0,
    costPricePerUnit: 45.0,
    sellingPrice: 120.0
  },
  {
    batchId: "BATCH-261003-REDV-05",
    productId: 5,
    productName: "Red Velvet Cheesecake",
    branchId: "BR-02",
    quantityProduced: 18,
    quantityRemaining: 11,
    producedAt: hoursAgo(6),
    expiresAt: hoursFromNow(70), // Fresh (3 days)
    baker: "Meera Pastry Chef",
    status: "fresh",
    fefoPriority: 3,
    discountApplied: 0,
    costPricePerUnit: 510.0,
    sellingPrice: 980.0
  },
  {
    batchId: "BATCH-261003-PUFF-06",
    productId: 9,
    productName: "Spiced Paneer Tikka Puff",
    branchId: "BR-03",
    quantityProduced: 80,
    quantityRemaining: 6,
    producedAt: hoursAgo(14),
    expiresAt: hoursFromNow(3), // Expiring in 3 hours (Urgent clearance!)
    baker: "Koyambedu Production Unit",
    status: "expired_risk",
    fefoPriority: 1,
    discountApplied: 40,
    costPricePerUnit: 22.0,
    sellingPrice: 55.0
  }
];
