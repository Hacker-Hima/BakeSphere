import express from "express";
import mongoose from "mongoose";
import { bakeryProducts } from "../data/products.js";
import { bakeryOrders } from "../data/orders.js";
import { auditLogs } from "../data/auditLogs.js";
import { authenticateToken } from "../middleware/auth.js";
import Order from "../models/Order.js";
import AuditLog from "../models/AuditLog.js";

const router = express.Router();

const activeCoupons = [
  { code: "FESTIVAL10", type: "percent", value: 10, minOrder: 250, description: "10% off festival special" },
  { code: "BAKE50", type: "flat", value: 50, minOrder: 400, description: "₹50 flat discount on orders above ₹400" },
  { code: "SWEET20", type: "percent", value: 20, minOrder: 600, description: "20% off pastry & cake orders above ₹600" }
];

// List available coupons
router.get("/coupons", (req, res) => {
  res.json(activeCoupons);
});

// Verify coupon code
router.post("/verify-coupon", (req, res) => {
  const { couponCode, subtotal } = req.body;
  const coupon = activeCoupons.find(
    (c) => c.code.toUpperCase() === (couponCode || "").toUpperCase().trim()
  );

  if (!coupon) {
    return res.status(400).json({ valid: false, message: "Invalid coupon code" });
  }

  if (subtotal < coupon.minOrder) {
    return res.status(400).json({
      valid: false,
      message: `Coupon requires minimum order of ₹${coupon.minOrder}`
    });
  }

  let discountAmount = 0;
  if (coupon.type === "percent") {
    discountAmount = (subtotal * coupon.value) / 100;
  } else {
    discountAmount = coupon.value;
  }

  res.json({
    valid: true,
    code: coupon.code,
    discountAmount: parseFloat(discountAmount.toFixed(2)),
    message: `Coupon '${coupon.code}' applied!`
  });
});

// Get all orders & billing invoices (MongoDB Atlas or in-memory bakeryOrders fallback)
router.get("/orders", async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const dbOrders = await Order.find().sort({ createdAt: -1 }).limit(100);
      if (dbOrders && dbOrders.length > 0) {
        return res.json(dbOrders);
      }
    }
    res.json(bakeryOrders);
  } catch (err) {
    res.json(bakeryOrders);
  }
});

// Online Storefront Checkout & Tax Invoice Generator
router.post("/online-order", async (req, res) => {
  try {
    const {
      items,
      customerName,
      customerPhone,
      customerEmail,
      deliveryAddress,
      deliveryCity,
      deliveryPincode,
      deliverySlot,
      couponCode,
      paymentMethod
    } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "Cart cannot be empty" });
    }

    let subtotal = 0;
    const processedItems = items.map((item) => {
      const price = Number(item.sellingPrice || item.price || 120);
      const qty = parseInt(item.quantity, 10) || 1;
      const lineTotal = price * qty;
      subtotal += lineTotal;
      return {
        productId: item.id || item.productId || 1,
        name: item.name || "Artisan Pastry",
        weight: item.selectedWeight || item.weight || "Regular",
        quantity: qty,
        unitPrice: price,
        lineTotal
      };
    });

    let discountAmount = 0;
    if (couponCode) {
      const code = (couponCode || "").toUpperCase().trim();
      if (code === "SWEET15") {
        discountAmount = parseFloat((subtotal * 0.15).toFixed(2));
      } else if (code === "BAKE50" && subtotal >= 400) {
        discountAmount = 50;
      }
    }

    const deliveryFee = subtotal >= 500 ? 0 : 50;
    const taxableAmount = Math.max(0, subtotal - discountAmount);
    const cgst = parseFloat((taxableAmount * 0.025).toFixed(2));
    const sgst = parseFloat((taxableAmount * 0.025).toFixed(2));
    const totalGst = parseFloat((cgst + sgst).toFixed(2));
    const grandTotal = parseFloat((taxableAmount + totalGst + deliveryFee).toFixed(2));

    const orderId = `BS-${Date.now().toString().slice(-6)}`;
    const invoiceNumber = `INV-${orderId}`;
    const now = new Date();

    const invoice = {
      orderId,
      invoiceNumber,
      type: "online_delivery",
      storeName: "BAKESPHERE PATISSERIE",
      tagline: "Online Patisserie, Artisanal Viennoiserie & Custom Cakes",
      gstin: "33AABCB1234E1Z0",
      fssaiLicense: "12423008000451",
      branchAddress: "42 Venkatnarayana Rd, T. Nagar, Chennai 600017",
      phone: "+91 44 2434 8890",
      customerName: customerName || "Guest Gourmet",
      customerPhone: customerPhone || "+91 98402 11990",
      customerEmail: customerEmail || "guest@bakesphere.com",
      deliveryAddress: deliveryAddress || "Heritage Apartments, T. Nagar",
      deliveryCity: deliveryCity || "Chennai",
      deliveryPincode: deliveryPincode || "600017",
      deliverySlot: deliverySlot || "Express within 2 Hours",
      items: processedItems,
      subtotal: parseFloat(subtotal.toFixed(2)),
      discountAmount,
      couponCode: couponCode || null,
      deliveryFee,
      taxableAmount,
      cgst,
      sgst,
      totalGst,
      grandTotal,
      paymentMethod: paymentMethod || "UPI / Instant Pay",
      paymentStatus: "PAID / SUCCESS",
      transactionRef: `TXN-UPI-${Date.now().toString().slice(-8)}`,
      status: "confirmed",
      orderDate: now.toLocaleDateString("en-IN"),
      orderTime: now.toLocaleTimeString("en-IN"),
      createdAt: now.toISOString(),
      qrPayload: `https://bakesphere.in/verify-invoice/${invoiceNumber}`,
      footerNote: "Thank you for choosing BakeSphere! Freshly baked with 84% Normandy butter daily. 🥐"
    };

    bakeryOrders.unshift(invoice);

    if (mongoose.connection.readyState === 1) {
      Order.create(invoice).catch((err) => {
        console.error("🍃 [MongoDB Atlas] Error saving online order:", err.message);
      });
    }

    res.status(201).json({
      success: true,
      message: "Online order placed and tax invoice generated",
      invoice
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POS Checkout & Thermal Receipt Generator (Non-CRUD Resume Feature)
router.post("/checkout", authenticateToken, (req, res) => {
  const {
    items,
    customerName,
    customerPhone,
    couponCode,
    loyaltyPointsRedeemed,
    paymentMethod,
    splitDetails,
    branchId
  } = req.body;

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: "Cart cannot be empty" });
  }

  // 1. Calculate subtotal & tax
  let subtotal = 0;
  const processedItems = items.map((item) => {
    const product = bakeryProducts.find((p) => p.id === item.productId);
    const price = product ? product.sellingPrice : item.price || 100;
    const qty = parseInt(item.quantity, 10) || 1;
    const lineTotal = price * qty;
    subtotal += lineTotal;

    // Reduce product inventory if available
    if (product && product.availableQuantity >= qty) {
      product.availableQuantity -= qty;
    }

    return {
      productId: item.productId,
      name: product ? product.name : item.name,
      quantity: qty,
      unitPrice: price,
      lineTotal
    };
  });

  // 2. Compute Discounts (Coupon + Loyalty Points)
  let discountAmount = 0;
  if (couponCode) {
    const coupon = activeCoupons.find((c) => c.code.toUpperCase() === couponCode.toUpperCase().trim());
    if (coupon && subtotal >= coupon.minOrder) {
      discountAmount += coupon.type === "percent" ? (subtotal * coupon.value) / 100 : coupon.value;
    }
  }

  const pointsUsed = parseInt(loyaltyPointsRedeemed, 10) || 0;
  const loyaltyDiscount = Math.min(pointsUsed, subtotal - discountAmount); // 1 point = ₹1
  discountAmount += loyaltyDiscount;

  const taxableAmount = Math.max(0, subtotal - discountAmount);
  // GST 5% (CGST 2.5% + SGST 2.5%)
  const cgstAmount = parseFloat((taxableAmount * 0.025).toFixed(2));
  const sgstAmount = parseFloat((taxableAmount * 0.025).toFixed(2));
  const totalGst = cgstAmount + sgstAmount;
  const finalTotal = parseFloat((taxableAmount + totalGst).toFixed(2));

  // 3. Create Order Record
  const orderId = `BS-${Date.now().toString().slice(-6)}`;
  const invoiceNumber = `INV-${orderId}`;
  const now = new Date();

  const newOrder = {
    orderId,
    invoiceNumber,
    type: "pos",
    branchId: branchId || "BR-01",
    customerName: customerName || "Walk-in Guest",
    customerPhone: customerPhone || "N/A",
    items: processedItems,
    subtotal: parseFloat(subtotal.toFixed(2)),
    discountAmount: parseFloat(discountAmount.toFixed(2)),
    loyaltyPointsUsed: pointsUsed,
    cgstAmount,
    sgstAmount,
    totalGst,
    finalTotal,
    paymentMethod: paymentMethod || "UPI",
    splitDetails: splitDetails || null,
    status: "completed",
    cashierName: req.user ? req.user.name : "Priya Natarajan",
    createdAt: now.toISOString()
  };

  bakeryOrders.unshift(newOrder);

  // 4. Log Audit
  const auditEntry = {
    id: `LOG-${Date.now().toString().slice(-4)}`,
    timestamp: now.toISOString(),
    userName: req.user ? req.user.name : "Cashier",
    userRole: req.user ? req.user.role : "cashier",
    action: "INVOICE_BILLED",
    details: `Billed Invoice #${invoiceNumber} for ₹${finalTotal} via ${paymentMethod || "UPI"}.`
  };
  auditLogs.unshift(auditEntry);

  // Persist to MongoDB Atlas asynchronously if connected
  if (mongoose.connection.readyState === 1) {
    Order.create(newOrder).catch((err) => {
      console.error("🍃 [MongoDB Atlas] Error saving order to database:", err.message);
    });
    AuditLog.create({
      logId: auditEntry.id,
      action: auditEntry.action,
      performedBy: auditEntry.userName,
      target: invoiceNumber,
      details: auditEntry.details,
      timestamp: now
    }).catch((err) => {
      console.error("🍃 [MongoDB Atlas] Error saving audit log to database:", err.message);
    });
  }

  // 5. Thermal Receipt JSON structure ready for printing
  const thermalReceipt = {
    storeName: "BAKESPHERE PATISSERIE",
    tagline: "Artisan Breads, Viennoiserie & Custom Cakes",
    gstin: "33AABCB1234E1Z0",
    fssaiLicense: "12423008000451",
    branchAddress: "42 Venkatnarayana Rd, T. Nagar, Chennai 600017",
    phone: "+91 44 2434 8890",
    invoiceNumber,
    date: now.toLocaleDateString("en-IN"),
    time: now.toLocaleTimeString("en-IN"),
    cashier: req.user ? req.user.name : "Priya Natarajan",
    customer: customerName || "Walk-in Guest",
    items: processedItems,
    subtotal: parseFloat(subtotal.toFixed(2)),
    discount: parseFloat(discountAmount.toFixed(2)),
    taxableAmount: parseFloat(taxableAmount.toFixed(2)),
    cgst: cgstAmount,
    sgst: sgstAmount,
    grandTotal: finalTotal,
    paymentMethod: paymentMethod || "UPI",
    verificationQrPayload: `https://bakesphere.in/verify-invoice/${invoiceNumber}`,
    footerNote: "Thank you for visiting BakeSphere! Have a sweet day! 🥐"
  };

  res.status(201).json({
    message: "Sale completed and invoice generated",
    order: newOrder,
    thermalReceipt
  });
});

export default router;
