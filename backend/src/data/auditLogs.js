export const auditLogs = [
  {
    id: "LOG-901",
    timestamp: "2026-09-21T06:15:20Z",
    userName: "Aaditya Raman",
    userRole: "super_admin",
    action: "SYSTEM_CONFIG_UPDATED",
    details: "Updated FEFO alert threshold from 36h to 48h across all 4 branches.",
    ipAddress: "192.168.1.10"
  },
  {
    id: "LOG-902",
    timestamp: "2026-09-21T07:05:12Z",
    userName: "Karthik Subramanian",
    userRole: "manager",
    action: "PRODUCTION_PLAN_APPROVED",
    details: "Approved Batch BATCH-210926-CHOC-01 for 24 Belgian Chocolate Cakes at T. Nagar branch.",
    ipAddress: "192.168.1.14"
  },
  {
    id: "LOG-903",
    timestamp: "2026-09-21T07:40:45Z",
    userName: "Chef Pierre Bouchard",
    userRole: "head_baker",
    action: "FEFO_INGREDIENT_ALLOCATED",
    details: "Scaled recipe REC-01 x 24 batches. Allocated 7.2kg Flour, 3.84kg Butter, 4.8kg Callebaut Chocolate from Batch LOT-902.",
    ipAddress: "192.168.1.22"
  },
  {
    id: "LOG-904",
    timestamp: "2026-09-21T09:15:30Z",
    userName: "Priya Natarajan",
    userRole: "cashier",
    action: "POS_INVOICE_GENERATED",
    details: "Generated GST Invoice #INV-BS-1024 for ₹1,039.50. Redeemed 100 loyalty points for customer Sneha.",
    ipAddress: "192.168.2.05"
  },
  {
    id: "LOG-905",
    timestamp: "2026-09-21T11:00:00Z",
    userName: "BakeSphere AI Core",
    userRole: "ai_engine",
    action: "FLASH_MARKDOWN_RECOMMENDED",
    details: "Identified 14 Wild Blueberry Danishes expiring in <10 hours. Applied 25% automated Happy Hour discount.",
    ipAddress: "127.0.0.1"
  }
];
