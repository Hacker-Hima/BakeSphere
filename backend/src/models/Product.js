import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema({
  id: { type: Number, index: true },
  name: { type: String, required: true },
  category: { type: String, required: true },
  flavour: { type: String },
  occasion: { type: String },
  description: { type: String },
  sellingPrice: { type: Number, required: true },
  costPrice: { type: Number },
  mrp: { type: Number },
  discountPercent: { type: Number },
  marginPercent: { type: Number },
  weight: { type: String },
  availableWeights: [{ type: String }],
  weightMultipliers: { type: mongoose.Schema.Types.Mixed },
  shelfLifeDays: { type: Number },
  gstPercent: { type: Number },
  inStock: { type: Boolean, default: true },
  isEggless: { type: Boolean, default: true },
  availableQuantity: { type: Number, default: 0 },
  minStockThreshold: { type: Number, default: 5 },
  reorderLevel: { type: Number, default: 5 },
  rating: { type: Number, default: 4.8 },
  reviewsCount: { type: Number, default: 0 },
  deliveryTime: { type: String },
  calories: { type: String },
  ingredientsSummary: { type: String },
  unit: { type: String, default: "piece" },
  shelfLifeHours: { type: Number, default: 24 },
  dietary: [{ type: String }],
  allergens: [{ type: String }],
  barcode: { type: String, index: true },
  sku: { type: String },
  badge: { type: String },
  image: { type: String },
  tags: [{ type: String }],
  suitableForBulk: { type: Boolean, default: false },
  bulkMinQty: { type: Number, default: 10 },
  isVegetarian: { type: Boolean, default: true },
  prepTime: { type: String, default: "30 mins" },
  customizationAvailable: { type: Boolean, default: false },
  activeMarkdown: {
    discountPercent: { type: Number, default: 0 },
    reason: { type: String },
    effectivePrice: { type: Number },
    appliedAt: { type: Date }
  }
}, { timestamps: true });

export const Product = mongoose.models.Product || mongoose.model("Product", ProductSchema);
export default Product;
