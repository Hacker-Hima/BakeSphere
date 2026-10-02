import mongoose from "mongoose";

const OrderItemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.Mixed },
  name: { type: String, required: true },
  quantity: { type: Number, required: true, default: 1 },
  unitPrice: { type: Number },
  price: { type: Number },
  lineTotal: { type: Number }
}, { _id: false });

const OrderSchema = new mongoose.Schema({
  orderId: { type: String, required: true, unique: true, index: true },
  invoiceNumber: { type: String },
  type: { 
    type: String, 
    default: "pos" 
  },
  branchId: { type: String, default: "BR-01" },
  customerName: { type: String, default: "Walk-in Guest" },
  customerPhone: { type: String, default: "N/A" },
  deliveryAddress: { type: String },
  deliveryDate: { type: String },
  deliveryTimeSlot: { type: String },
  deliveryPartner: { type: String },
  estimatedDeliveryTime: { type: String },
  assignedChef: { type: String },
  items: [OrderItemSchema],
  subtotal: { type: Number, required: true },
  discountAmount: { type: Number, default: 0 },
  loyaltyPointsUsed: { type: Number, default: 0 },
  taxableAmount: { type: Number },
  cgstAmount: { type: Number, default: 0 },
  sgstAmount: { type: Number, default: 0 },
  gstAmount: { type: Number, default: 0 },
  totalGst: { type: Number, default: 0 },
  deliveryFee: { type: Number, default: 0 },
  finalTotal: { type: Number, required: true },
  paymentMethod: { type: String, default: "Cash" },
  paymentReference: { type: String },
  splitDetails: { type: mongoose.Schema.Types.Mixed },
  customDetails: { type: mongoose.Schema.Types.Mixed },
  cashierName: { type: String },
  status: { 
    type: String, 
    default: "completed" 
  },
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

export const Order = mongoose.models.Order || mongoose.model("Order", OrderSchema);
export default Order;
