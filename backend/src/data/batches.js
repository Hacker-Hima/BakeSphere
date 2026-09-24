export const productionBatches = [
  {
    batchId: "BATCH-210926-CHOC-01",
    productId: 1,
    productName: "Belgian Chocolate Truffle Cake",
    branchId: "BR-01",
    quantityProduced: 24,
    quantityRemaining: 8,
    producedAt: "2026-09-20T08:00:00Z",
    expiresAt: "2026-09-22T20:00:00Z", // Expiring tomorrow!
    baker: "Chef Pierre Bouchard",
    status: "expiring_soon",
    fefoPriority: 2,
    discountApplied: 0,
    costPricePerUnit: 420.0,
    sellingPrice: 850.0
  },
  {
    batchId: "BATCH-200926-PAST-02",
    productId: 4,
    productName: "Wild Blueberry Danish",
    branchId: "BR-01",
    quantityProduced: 40,
    quantityRemaining: 14,
    producedAt: "2026-09-20T05:30:00Z",
    expiresAt: "2026-09-21T21:00:00Z", // Expiring TODAY!
    baker: "Chef Pierre Bouchard",
    status: "expiring_today",
    fefoPriority: 1, // Must sell first!
    discountApplied: 25, // AI Flash Sale 25% Off
    costPricePerUnit: 65.0,
    sellingPrice: 160.0
  },
  {
    batchId: "BATCH-210926-SOUR-03",
    productId: 2,
    productName: "Artisan Sourdough Boule",
    branchId: "BR-02",
    quantityProduced: 50,
    quantityRemaining: 32,
    producedAt: "2026-09-21T04:00:00Z",
    expiresAt: "2026-09-24T20:00:00Z", // 3 days shelf life
    baker: "Rajan Bakery Asst",
    status: "fresh",
    fefoPriority: 3,
    discountApplied: 0,
    costPricePerUnit: 70.0,
    sellingPrice: 180.0
  },
  {
    batchId: "BATCH-210926-CROI-04",
    productId: 3,
    productName: "French Butter Croissant",
    branchId: "BR-01",
    quantityProduced: 60,
    quantityRemaining: 22,
    producedAt: "2026-09-21T06:00:00Z",
    expiresAt: "2026-09-22T18:00:00Z",
    baker: "Chef Pierre Bouchard",
    status: "fresh",
    fefoPriority: 2,
    discountApplied: 0,
    costPricePerUnit: 45.0,
    sellingPrice: 120.0
  },
  {
    batchId: "BATCH-210926-REDV-05",
    productId: 5,
    productName: "Red Velvet Cheesecake",
    branchId: "BR-02",
    quantityProduced: 18,
    quantityRemaining: 11,
    producedAt: "2026-09-21T07:30:00Z",
    expiresAt: "2026-09-23T20:00:00Z",
    baker: "Meera Pastry Chef",
    status: "fresh",
    fefoPriority: 3,
    discountApplied: 0,
    costPricePerUnit: 510.0,
    sellingPrice: 980.0
  },
  {
    batchId: "BATCH-190926-PUFF-06",
    productId: 9,
    productName: "Spiced Paneer Tikka Puff",
    branchId: "BR-03",
    quantityProduced: 80,
    quantityRemaining: 6,
    producedAt: "2026-09-19T06:00:00Z",
    expiresAt: "2026-09-21T18:00:00Z", // Expired/Expiring this hour!
    baker: "Koyambedu Production Unit",
    status: "expired_risk",
    fefoPriority: 1,
    discountApplied: 40,
    costPricePerUnit: 22.0,
    sellingPrice: 55.0
  }
];
