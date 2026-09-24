import express from "express";
import { auditLogs } from "../data/auditLogs.js";

const router = express.Router();

// Get system audit logs
router.get("/", (req, res) => {
  res.json({
    count: auditLogs.length,
    logs: auditLogs
  });
});

export default router;
