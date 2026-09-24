import express from "express";
import { bakeryEquipment } from "../data/equipment.js";

const router = express.Router();

// Get all bakery equipment and maintenance schedules
router.get("/", (req, res) => {
  res.json({
    count: bakeryEquipment.length,
    equipment: bakeryEquipment
  });
});

// Get equipment needing maintenance soon
router.get("/maintenance-alerts", (req, res) => {
  const alerts = bakeryEquipment.filter((e) => e.status === "service_due_soon" || e.status === "in_repair");
  res.json({
    count: alerts.length,
    alerts
  });
});

export default router;
