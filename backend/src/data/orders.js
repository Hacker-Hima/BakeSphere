export const bakeryOrders = [
  {
    orderId: "BS-1024",
    type: "pos",
    branchId: "BR-01",
    customerName: "Sneha Varadharajan",
    customerPhone: "+91 91760 33445",
    items: [
      { productId: 1, name: "Belgian Chocolate Truffle Cake", quantity: 1, price: 850.0 },
      { productId: 3, name: "Classic French Butter Croissant", quantity: 2, price: 120.0 }
    ],
    subtotal: 1090.0,
    discountAmount: 100.0, // Loyalty discount
    gstAmount: 49.5,
    finalTotal: 1039.5,
    paymentMethod: "UPI",
    paymentReference: "UPI-AXIS-99210492",
    status: "completed",
    createdAt: "2026-09-21T09:15:00Z"
  },
  {
    orderId: "BS-1025",
    type: "online_delivery",
    branchId: "BR-02",
    customerName: "Dr. Arvind Ramesh",
    customerPhone: "+91 98402 11990",
    deliveryAddress: "Flat 4B, Ceebros Heights, Shanthi Colony, Anna Nagar, Chennai",
    items: [
      { productId: 2, name: "San Francisco Style Sourdough Boule", quantity: 1, price: 180.0 },
      { productId: 6, name: "Roasted Garlic & Rosemary Focaccia", quantity: 1, price: 210.0 },
      { productId: 14, name: "Signature Spanish Iced Latte", quantity: 2, price: 170.0 }
    ],
    subtotal: 730.0,
    discountAmount: 0.0,
    gstAmount: 26.5,
    deliveryFee: 50.0,
    finalTotal: 806.5,
    paymentMethod: "Card",
    paymentReference: "TXN-HDFC-882109",
    status: "out_for_delivery",
    deliveryPartner: "Ravi Kumar (Speed Delivery #04)",
    estimatedDeliveryTime: "2026-09-21T14:30:00Z",
    createdAt: "2026-09-21T11:45:00Z"
  },
  {
    orderId: "BS-1026",
    type: "custom_cake",
    branchId: "BR-04",
    customerName: "Kavitha Anand",
    customerPhone: "+91 98841 55667",
    deliveryAddress: "Villa 12, Alliance Orchid Springs, Korattur, Chennai",
    customDetails: {
      occasion: "1st Birthday Party",
      tiers: 2,
      totalWeightKg: 3.5,
      baseFlavor: "Belgian Dark Chocolate Ganache & Salted Caramel",
      creamType: "Swiss Meringue Buttercream",
      theme: "Pastel Teddy Bear & Cloud Sculpting",
      cakeMessage: "Happy 1st Birthday, Aarav! 🧸",
      referenceImageUrl: "https://images.unsplash.com/photo-1535141192574-5d4897c13136?w=600&auto=format&fit=crop&q=80",
      advancePaid: 2000.0,
      balanceDue: 1850.0
    },
    items: [
      { productId: 16, name: "Designer 2-Tier Artisan Birthday Cake (3.5kg)", quantity: 1, price: 3850.0 }
    ],
    subtotal: 3850.0,
    discountAmount: 0.0,
    gstAmount: 192.5,
    finalTotal: 4042.5,
    paymentMethod: "Split (UPI + Cash)",
    status: "decorating",
    assignedChef: "Chef Pierre Bouchard",
    deliveryDate: "2026-09-22T17:00:00Z",
    createdAt: "2026-09-21T08:30:00Z"
  },
  {
    orderId: "BS-1027",
    type: "pos",
    branchId: "BR-03",
    customerName: "Manoj Kumar",
    customerPhone: "+91 99621 88443",
    items: [
      { productId: 9, name: "Spiced Paneer Tikka Puff", quantity: 3, price: 55.0 },
      { productId: 15, name: "South Indian Degree Filter Coffee", quantity: 2, price: 60.0 }
    ],
    subtotal: 285.0,
    discountAmount: 28.5, // Coupon FESTIVAL10
    gstAmount: 12.8,
    finalTotal: 269.3,
    paymentMethod: "Cash",
    status: "completed",
    createdAt: "2026-09-21T12:10:00Z"
  }
];
