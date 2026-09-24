import express from "express";
import { bakeryProducts } from "../data/products.js";

const router = express.Router();

// Health check endpoint
router.get("/health", (req, res) => {
  res.json({
    status: "ok",
    message: "BakeSphere API is up and running!",
    timestamp: new Date().toISOString()
  });
});

// Get all products with optional filtering by category or query
router.get("/products", (req, res) => {
  const { category, search } = req.query;
  let results = [...bakeryProducts];

  if (category && category !== "all") {
    results = results.filter(
      (item) => item.category.toLowerCase() === category.toLowerCase()
    );
  }

  if (search) {
    const query = search.toLowerCase();
    results = results.filter(
      (item) =>
        item.name.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query)
    );
  }

  res.json({
    count: results.length,
    products: results
  });
});

// Get single product by ID
router.get("/products/:id", (req, res) => {
  const productId = parseInt(req.params.id, 10);
  const product = bakeryProducts.find((item) => item.id === productId);

  if (!product) {
    return res.status(404).json({
      error: "Product not found",
      productId
    });
  }

  res.json(product);
});

// Simulate placing an order
router.post("/orders", (req, res) => {
  const { items, customerName, address } = req.body;

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({
      error: "Order must contain at least one item."
    });
  }

  const orderId = `BS-${Date.now().toString().slice(-6)}`;
  const totalAmount = items.reduce((sum, item) => {
    return sum + (item.price || 0) * (item.quantity || 1);
  }, 0);

  res.status(201).json({
    orderId,
    status: "confirmed",
    customerName: customerName || "Guest Baker",
    address: address || "Pickup in Store",
    total: parseFloat(totalAmount.toFixed(2)),
    createdAt: new Date().toISOString()
  });
});

export default router;
