import express from "express";
import { bakerySuppliers } from "../data/suppliers.js";

const router = express.Router();

// Get all verified suppliers
router.get("/", (req, res) => {
  res.json({
    count: bakerySuppliers.length,
    suppliers: bakerySuppliers
  });
});

export default router;
