import express from "express";
import { bakeryProducts } from "../data/products.js";
import { authenticateToken, requireRoles } from "../middleware/auth.js";

const router = express.Router();

// Get all products with optional filters: category, search query, barcode, inStock
router.get("/", (req, res) => {
  const { category, search, barcode, minPrice, maxPrice } = req.query;
  let results = [...bakeryProducts];

  if (category && category.toLowerCase() !== "all") {
    results = results.filter(
      (p) => p.category.toLowerCase() === category.toLowerCase()
    );
  }

  if (barcode) {
    results = results.filter((p) => p.barcode === barcode);
  }

  if (search) {
    const q = search.toLowerCase();
    results = results.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        (p.tags && p.tags.some((t) => t.toLowerCase().includes(q)))
    );
  }

  if (minPrice) {
    results = results.filter((p) => p.sellingPrice >= parseFloat(minPrice));
  }
  if (maxPrice) {
    results = results.filter((p) => p.sellingPrice <= parseFloat(maxPrice));
  }

  res.json({
    count: results.length,
    products: results
  });
});

// Barcode scanner quick lookup (for high-speed POS scanning)
router.get("/scan/:barcode", (req, res) => {
  const { barcode } = req.params;
  const product = bakeryProducts.find((p) => p.barcode === barcode);

  if (!product) {
    return res.status(404).json({
      error: "Product not found",
      message: `No bakery item matches barcode '${barcode}'`
    });
  }

  res.json(product);
});

// Get single product by ID
router.get("/:id", (req, res) => {
  const id = parseInt(req.params.id, 10);
  const product = bakeryProducts.find((p) => p.id === id);

  if (!product) {
    return res.status(404).json({ error: "Product not found" });
  }

  res.json(product);
});

// Create new product (Protected: Super Admin, Owner, Manager)
router.post("/", authenticateToken, requireRoles(["super_admin", "bakery_owner", "manager"]), (req, res) => {
  const { name, category, sellingPrice, costPrice, weight, description, barcode, shelfLifeDays } = req.body;

  if (!name || !category || !sellingPrice) {
    return res.status(400).json({ error: "Name, category, and selling price are required." });
  }

  const newId = bakeryProducts.length > 0 ? Math.max(...bakeryProducts.map((p) => p.id)) + 1 : 1;
  const newProduct = {
    id: newId,
    name,
    category,
    sku: `PRD-${category.slice(0, 3).toUpperCase()}-${String(newId).padStart(3, "0")}`,
    barcode: barcode || `890123456${String(newId).padStart(4, "0")}`,
    description: description || "Freshly crafted in our artisan ovens.",
    costPrice: parseFloat(costPrice) || Math.round(sellingPrice * 0.5),
    sellingPrice: parseFloat(sellingPrice),
    weight: weight || "500g",
    shelfLifeDays: parseInt(shelfLifeDays, 10) || 2,
    gstPercent: 5.0,
    inStock: true,
    availableQuantity: 20,
    minStockThreshold: 5,
    rating: 5.0,
    calories: "280 kcal / 100g",
    image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&auto=format&fit=crop&q=80",
    tags: ["New Arrival"]
  };

  bakeryProducts.push(newProduct);

  res.status(201).json({
    message: "Product created successfully",
    product: newProduct
  });
});

export default router;
