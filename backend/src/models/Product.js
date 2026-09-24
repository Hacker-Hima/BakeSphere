import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema({
  id: { type: Number, index: true },
  name: { type: String, required: true },
  category: { type: String, required: true },
  description: { type: String },
  sellingPrice: { type: Number, required: true },
  costPrice: { type: Number },
  marginPercent: { type: Number },
  availableQuantity: { type: Number, default: 0 },
  reorderLevel: { type: Number, default: 5 },
  unit: { type: String, default: "piece" },
  shelfLifeHours: { type: Number, default: 24 },
  dietary: [{ type: String }],
  allergens: [{ type: String }],
  barcode: { type: String, index: true },
  sku: { type: String },
  badge: { type: String },
  image: { type: String },
  tags: [{ type: String }],
  activeMarkdown: {
    discountPercent: { type: Number, default: 0 },
    reason: { type: String },
    effectivePrice: { type: Number },
    appliedAt: { type: Date }
  }
}, { timestamps: true });

export const Product = mongoose.models.Product || mongoose.model("Product", ProductSchema);
export default Product;
