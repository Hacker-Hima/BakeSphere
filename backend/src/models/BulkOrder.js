import mongoose from "mongoose";

const BulkOrderItemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.Mixed },
  name: { type: String, required: true },
  quantity: { type: Number, required: true, default: 20 },
  unitPrice: { type: Number, required: true },
  lineTotal: { type: Number, required: true },
  weight: { type: String }
}, { _id: false });

const BulkOrderSchema = new mongoose.Schema({
  orderId: { type: String, required: true, unique: true, index: true },
  customerName: { type: String, required: true },
  customerPhone: { type: String, required: true },
  customerEmail: { type: String, required: true },
  eventType: { 
    type: String, 
    enum: ["Birthday Party", "Wedding / Sangeet", "Corporate Event", "College Fest", "Anniversary Gala", "Large Gathering", "Bulk Office Catering", "Other"],
    default: "Birthday Party"
  },
  eventDate: { type: String, required: true },
  eventTime: { type: String, default: "12:00 PM" },
  headCount: { type: Number, default: 50 },
  branchId: { type: String, default: "BR-01" },
  branchName: { type: String, default: "Heritage Main Bakery (T. Nagar)" },
  items: [BulkOrderItemSchema],
  customizationRequirements: { type: String, default: "" },
  deliveryOption: { type: String, enum: ["pickup", "delivery"], default: "delivery" },
  deliveryAddress: { type: String, default: "" },
  additionalInstructions: { type: String, default: "" },
  status: { 
    type: String, 
    enum: ["submitted", "under_review", "quoted", "approved", "in_preparation", "ready", "delivered", "rejected"],
    default: "submitted"
  },
  estimatedCost: { type: Number, default: 0 },
  discountPercent: { type: Number, default: 10 },
  finalQuotationAmount: { type: Number, default: 0 },
  managerNotes: { type: String, default: "" },
  paymentStatus: { 
    type: String, 
    enum: ["pending", "partial_advance", "paid_in_full"],
    default: "pending"
  },
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

export const BulkOrder = mongoose.models.BulkOrder || mongoose.model("BulkOrder", BulkOrderSchema);
export default BulkOrder;
