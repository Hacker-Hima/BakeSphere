export let sampleBulkOrders = [
  {
    orderId: "BLK-2026-101",
    customerName: "Sanjay Sundaram",
    customerPhone: "+91 98401 22334",
    customerEmail: "sanjay.tech@zoho.com",
    eventType: "Corporate Event",
    eventDate: "2026-10-15",
    eventTime: "04:30 PM",
    headCount: 85,
    branchId: "BR-04",
    branchName: "OMR Cloud Kitchen & Master Production Hub",
    items: [
      { productId: 77, name: "Grand Party Celebration Combo Box", quantity: 6, unitPrice: 1999, lineTotal: 11994, weight: "Serves 10-12 People" },
      { productId: 75, name: "Belgian Triple Choc Chunk Cookies (Tin of 6)", quantity: 20, unitPrice: 349, lineTotal: 6980, weight: "Tin of 6 (300g)" },
      { productId: 10, name: "Crispy Golden Butter Puffs Box", quantity: 80, unitPrice: 40, lineTotal: 3200, weight: "Single piece" }
    ],
    customizationRequirements: "Zoho Tech product launch branding banner on cake boxes and sugar logos on cookies.",
    deliveryOption: "delivery",
    deliveryAddress: "Estancia IT Park, Block 3, Level 5, Guduvanchery / OMR, Chennai",
    additionalInstructions: "Please pack with hot insulation bags so puffs remain warm at 4:30 PM tea break.",
    status: "quoted",
    estimatedCost: 22174,
    discountPercent: 15,
    finalQuotationAmount: 18848,
    managerNotes: "Corporate bulk client. Approved 15% VIP volume discount. Chef Pierre overseeing batch bake.",
    paymentStatus: "partial_advance",
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString()
  },
  {
    orderId: "BLK-2026-102",
    customerName: "Dr. Ananya Natarajan",
    customerPhone: "+91 94443 88123",
    customerEmail: "ananya.wedding@gmail.com",
    eventType: "Wedding / Sangeet",
    eventDate: "2026-10-22",
    eventTime: "07:00 PM",
    headCount: 250,
    branchId: "BR-01",
    branchName: "Heritage Main Bakery (T. Nagar)",
    items: [
      { productId: 74, name: "3-Tier Victorian Rose Wedding Cake", quantity: 1, unitPrice: 4499, lineTotal: 4499, weight: "5.0 kg" },
      { productId: 72, name: "Crunchy Butterscotch Nougat Pastry (Box of 2)", quantity: 120, unitPrice: 169, lineTotal: 20280, weight: "Box of 2" },
      { productId: 2, name: "Red Velvet Cream Cheese Swirl Cake", quantity: 8, unitPrice: 749, lineTotal: 5992, weight: "1.0 kg" }
    ],
    customizationRequirements: "Names Ananya & Siddharth piped in gold edible foil on Tier 2 of the wedding cake.",
    deliveryOption: "delivery",
    deliveryAddress: "Mayor Ramanathan Chettiar Hall, MRC Nagar, Raja Annamalaipuram, Chennai",
    additionalInstructions: "Refrigerated van transport strictly required.",
    status: "approved",
    estimatedCost: 30771,
    discountPercent: 12,
    finalQuotationAmount: 27078,
    managerNotes: "Advance payment of ₹15,000 received via RTGS. Scheduled for dispatch on Oct 22 at 5 PM.",
    paymentStatus: "partial_advance",
    createdAt: new Date(Date.now() - 3600000 * 48).toISOString()
  }
];
