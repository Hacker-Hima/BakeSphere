/**
 * BakeSphere Periodic 2-Hour Stock Reports (Chef -> Manager -> Admin)
 */

export const stockReports = [
  {
    id: "SR-20261003-01",
    reportNumber: "REP-TN-0810",
    branchId: "BR-01",
    branchName: "Flagship T. Nagar Hub",
    slot: "08:00 AM – 10:00 AM (Morning Rush)",
    reportDate: "2026-10-03",
    reportedBy: "Chef Pierre Bouchard",
    reporterRole: "head_baker",
    items: [
      {
        productName: "Belgian Chocolate Truffle Cake",
        openingStock: 12,
        bakedPrepared: 12,
        soldConsumed: 16,
        closingStock: 8,
        wasteQty: 0,
        wasteReason: "",
        reorderThreshold: 5,
        isLowStock: false
      },
      {
        productName: "Wild Blueberry Danish",
        openingStock: 25,
        bakedPrepared: 15,
        soldConsumed: 24,
        closingStock: 14,
        wasteQty: 2,
        wasteReason: "Imperfect lamination fold",
        reorderThreshold: 10,
        isLowStock: false
      },
      {
        productName: "French Butter Croissant",
        openingStock: 40,
        bakedPrepared: 20,
        soldConsumed: 38,
        closingStock: 22,
        wasteQty: 0,
        wasteReason: "",
        reorderThreshold: 15,
        isLowStock: false
      }
    ],
    totalBaked: 47,
    totalSold: 78,
    totalWastage: 2,
    lowStockItemCount: 0,
    chefNotes: "High demand for French Croissants during morning rush. Starting next oven cycle at 10:30 AM.",
    status: "approved_by_manager", // submitted_by_chef | approved_by_manager | reviewed_by_admin
    managerName: "Rajesh Kannan",
    managerNotes: "Verified physical display tray counts. Batch quality exceptional.",
    managerReviewedAt: "2026-10-03T10:15:00.000Z",
    adminReviewedAt: "2026-10-03T11:00:00.000Z",
    createdAt: "2026-10-03T10:05:00.000Z"
  },
  {
    id: "SR-20261003-02",
    reportNumber: "REP-AD-1012",
    branchId: "BR-02",
    branchName: "Adyar Artisan Studio",
    slot: "10:00 AM – 12:00 PM (Midday Shift)",
    reportDate: "2026-10-03",
    reportedBy: "Meera Pastry Chef",
    reporterRole: "chef",
    items: [
      {
        productName: "Artisan Sourdough Boule",
        openingStock: 40,
        bakedPrepared: 10,
        soldConsumed: 18,
        closingStock: 32,
        wasteQty: 0,
        wasteReason: "",
        reorderThreshold: 10,
        isLowStock: false
      },
      {
        productName: "Red Velvet Cheesecake",
        openingStock: 15,
        bakedPrepared: 3,
        soldConsumed: 7,
        closingStock: 11,
        wasteQty: 0,
        wasteReason: "",
        reorderThreshold: 5,
        isLowStock: false
      }
    ],
    totalBaked: 13,
    totalSold: 25,
    totalWastage: 0,
    lowStockItemCount: 0,
    chefNotes: "Sourdough fermentation cycle running smoothly. Extra loaves allocated for dinner pickups.",
    status: "submitted_by_chef",
    managerName: null,
    managerNotes: null,
    managerReviewedAt: null,
    adminReviewedAt: null,
    createdAt: "2026-10-03T12:05:00.000Z"
  }
];

export const REPORT_TIME_SLOTS = [
  "06:00 AM – 08:00 AM (Dawn Prep & First Bake)",
  "08:00 AM – 10:00 AM (Morning Rush)",
  "10:00 AM – 12:00 PM (Midday Replenishment)",
  "12:00 PM – 02:00 PM (Lunch Peak)",
  "02:00 PM – 04:00 PM (Afternoon Tea Bake)",
  "04:00 PM – 06:00 PM (Evening Rush)",
  "06:00 PM – 08:00 PM (Dinner & Night Rush)",
  "08:00 PM – 10:00 PM (Closing & Day Wrap-up)"
];
