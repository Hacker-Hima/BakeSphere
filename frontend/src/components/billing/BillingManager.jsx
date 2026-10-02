import { useState, useEffect } from "react";
import { useNotifications } from "../../context/NotificationContext.jsx";
import { useThemeSettings } from "../../context/ThemeSettingsContext.jsx";

const SAMPLE_INVOICES = [
  {
    orderId: "BS-1025",
    invoiceNumber: "INV-BS-1025",
    type: "online_delivery",
    storeName: "BAKESPHERE PATISSERIE",
    tagline: "Online Patisserie, Artisanal Viennoiserie & Custom Cakes",
    gstin: "33AABCB1234E1Z0",
    fssaiLicense: "12423008000451",
    branchAddress: "Heritage Main Hub, 42 Venkatnarayana Rd, T. Nagar, Chennai 600017",
    phone: "+91 44 2434 8890",
    customerName: "Dr. Arvind Ramesh",
    customerPhone: "+91 98402 11990",
    customerEmail: "arvind.ramesh@gmail.com",
    deliveryAddress: "Flat 4B, Ceebros Heights, Shanthi Colony, Anna Nagar",
    deliveryCity: "Chennai",
    deliveryPincode: "600040",
    deliverySlot: "Express within 2 Hours",
    items: [
      { productId: 2, name: "San Francisco Style Sourdough Boule", weight: "500g", quantity: 1, unitPrice: 180, lineTotal: 180 },
      { productId: 6, name: "Roasted Garlic & Rosemary Focaccia", weight: "350g", quantity: 1, unitPrice: 210, lineTotal: 210 },
      { productId: 14, name: "Signature Spanish Iced Latte", weight: "300ml", quantity: 2, unitPrice: 170, lineTotal: 340 }
    ],
    subtotal: 730,
    discountAmount: 0,
    deliveryFee: 50,
    taxableAmount: 730,
    cgst: 18.25,
    sgst: 18.25,
    totalGst: 36.5,
    grandTotal: 816.5,
    paymentMethod: "UPI / Instant Pay",
    paymentStatus: "PAID / SUCCESS",
    transactionRef: "TXN-UPI-99210984",
    status: "confirmed",
    orderDate: "29/09/2026",
    orderTime: "11:45 AM",
    createdAt: "2026-09-29T11:45:00Z"
  },
  {
    orderId: "BS-1024",
    invoiceNumber: "INV-BS-1024",
    type: "pos",
    storeName: "BAKESPHERE PATISSERIE",
    tagline: "Online Patisserie, Artisanal Viennoiserie & Custom Cakes",
    gstin: "33AABCB1234E1Z0",
    fssaiLicense: "12423008000451",
    branchAddress: "Heritage Main Hub, 42 Venkatnarayana Rd, T. Nagar, Chennai 600017",
    phone: "+91 44 2434 8890",
    customerName: "Sneha Varadharajan",
    customerPhone: "+91 91760 33445",
    customerEmail: "sneha.v@yahoo.com",
    deliveryAddress: "Counter Pickup (In-Store)",
    deliveryCity: "Chennai",
    deliveryPincode: "600017",
    deliverySlot: "Immediate POS Delivery",
    items: [
      { productId: 1, name: "Belgian Chocolate Truffle Cake", weight: "0.5 kg", quantity: 1, unitPrice: 850, lineTotal: 850 },
      { productId: 3, name: "Classic French Butter Croissant", weight: "Single", quantity: 2, unitPrice: 120, lineTotal: 240 }
    ],
    subtotal: 1090,
    discountAmount: 100,
    couponCode: "LOYALTY100",
    deliveryFee: 0,
    taxableAmount: 990,
    cgst: 24.75,
    sgst: 24.75,
    totalGst: 49.5,
    grandTotal: 1039.5,
    paymentMethod: "Card (HDFC POS)",
    paymentStatus: "PAID / SUCCESS",
    transactionRef: "TXN-POS-4481023",
    status: "completed",
    orderDate: "29/09/2026",
    orderTime: "09:15 AM",
    createdAt: "2026-09-29T09:15:00Z"
  }
];

export const BillingManager = () => {
  const { openBill, addNotification } = useNotifications();
  const { playChime } = useThemeSettings();

  const [invoices, setInvoices] = useState(() => {
    try {
      const saved = localStorage.getItem("bakesphere_invoices");
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return SAMPLE_INVOICES;
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");

  // Fetch backend orders if available
  useEffect(() => {
    fetch("http://localhost:5000/api/pos/orders")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          // Merge with local invoices
          setInvoices((prev) => {
            const existingIds = new Set(prev.map((i) => i.invoiceNumber || i.orderId));
            const newFromBackend = data.filter((d) => !existingIds.has(d.invoiceNumber || d.orderId));
            return [...prev, ...newFromBackend];
          });
        }
      })
      .catch(() => {
        // Fallback gracefully to local storage
      });
  }, []);

  // Save to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("bakesphere_invoices", JSON.stringify(invoices));
    } catch (e) {
      console.error(e);
    }
  }, [invoices]);

  // Filter invoices
  const filteredInvoices = invoices.filter((inv) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      (inv.invoiceNumber || "").toLowerCase().includes(q) ||
      (inv.customerName || "").toLowerCase().includes(q) ||
      (inv.orderId || "").toLowerCase().includes(q);

    const matchesType =
      filterType === "all" ||
      (filterType === "online" && inv.type === "online_delivery") ||
      (filterType === "pos" && inv.type === "pos") ||
      (filterType === "custom" && inv.type === "custom_cake");

    return matchesSearch && matchesType;
  });

  const totalBilledRevenue = invoices.reduce((sum, i) => sum + (i.grandTotal || i.finalTotal || 0), 0);
  const totalGstCollected = invoices.reduce((sum, i) => sum + (i.totalGst || i.gstAmount || 0), 0);

  // Quick Demo Bill Generator
  const handleCreateTestBill = () => {
    playChime("success");
    const testId = `BS-${Date.now().toString().slice(-6)}`;
    const newInvoice = {
      orderId: testId,
      invoiceNumber: `INV-${testId}`,
      type: "online_delivery",
      storeName: "BAKESPHERE PATISSERIE",
      tagline: "Online Patisserie, Artisanal Viennoiserie & Custom Cakes",
      gstin: "33AABCB1234E1Z0",
      fssaiLicense: "12423008000451",
      branchAddress: "Heritage Main Hub, 42 Venkatnarayana Rd, T. Nagar, Chennai 600017",
      phone: "+91 44 2434 8890",
      customerName: "Priya Sundaram",
      customerPhone: "+91 98410 77890",
      customerEmail: "priya.s@gmail.com",
      deliveryAddress: "Flat 2A, Alacrity Foundation, T. Nagar",
      deliveryCity: "Chennai",
      deliveryPincode: "600017",
      deliverySlot: "Express within 2 Hours",
      items: [
        { productId: 101, name: "Belgian Dark Chocolate Ganache Cake", weight: "0.5 kg", quantity: 1, unitPrice: 799, lineTotal: 799 },
        { productId: 102, name: "Pure Butter Croissant Box (Pack of 2)", weight: "Standard", quantity: 1, unitPrice: 220, lineTotal: 220 }
      ],
      subtotal: 1019,
      discountAmount: 152.85,
      couponCode: "SWEET15",
      deliveryFee: 0,
      taxableAmount: 866.15,
      cgst: 21.65,
      sgst: 21.65,
      totalGst: 43.3,
      grandTotal: 909.45,
      paymentMethod: "UPI / Instant Pay",
      paymentStatus: "PAID / SUCCESS",
      transactionRef: `TXN-UPI-${Date.now().toString().slice(-8)}`,
      status: "confirmed",
      orderDate: new Date().toLocaleDateString("en-IN"),
      orderTime: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
      createdAt: new Date().toISOString()
    };

    setInvoices((prev) => [newInvoice, ...prev]);

    // Send notification
    addNotification({
      title: "Order Billed & Invoiced! 🧾",
      message: `Tax Invoice #${newInvoice.invoiceNumber} for ₹${newInvoice.grandTotal} generated.`,
      type: "bill",
      invoice: newInvoice
    });

    // Open bill modal immediately
    openBill(newInvoice);
  };

  return (
    <div style={{ padding: "1.5rem", maxWidth: "1350px", margin: "0 auto" }}>
      {/* Module Title Banner */}
      <div
        style={{
          background: "linear-gradient(135deg, rgba(225, 29, 72, 0.08) 0%, rgba(251, 191, 36, 0.05) 100%)",
          border: "1px solid var(--border-color)",
          borderRadius: "16px",
          padding: "1.5rem 1.8rem",
          marginBottom: "1.5rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "1rem"
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
            <span style={{ fontSize: "1.8rem" }}>🧾</span>
            <h1 style={{ margin: 0, fontSize: "1.6rem", fontWeight: 800, color: "var(--crimson-500)" }}>
              Billing & Invoicing Studio
            </h1>
          </div>
          <p style={{ margin: "0.3rem 0 0", fontSize: "0.86rem", color: "var(--text-secondary)" }}>
            GST Tax Invoices, Real-Time Customer Receipts, and Order Billing Ledger
          </p>
        </div>

        <button
          type="button"
          onClick={handleCreateTestBill}
          style={{
            background: "var(--berry-gradient)",
            color: "#ffffff",
            border: "none",
            borderRadius: "10px",
            padding: "0.65rem 1.3rem",
            fontSize: "0.86rem",
            fontWeight: 700,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "0.4rem",
            boxShadow: "0 4px 14px rgba(225, 29, 72, 0.3)",
            transition: "all 0.15s ease"
          }}
        >
          <span>⚡</span>
          <span>Generate Demo Bill</span>
        </button>
      </div>

      {/* KPI Summary Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "1rem",
          marginBottom: "1.5rem"
        }}
      >
        <div style={{
          background: "var(--bg-surface)",
          border: "1px solid var(--border-color)",
          borderRadius: "12px",
          padding: "1.1rem",
          boxShadow: "var(--shadow-sm)"
        }}>
          <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700 }}>
            Total Invoices
          </div>
          <div style={{ fontSize: "1.6rem", fontWeight: 800, color: "var(--text-primary)", marginTop: "0.2rem" }}>
            {invoices.length}
          </div>
          <div style={{ fontSize: "0.72rem", color: "#16a34a", marginTop: "0.2rem" }}>
            ✓ Verified & Billed
          </div>
        </div>

        <div style={{
          background: "var(--bg-surface)",
          border: "1px solid var(--border-color)",
          borderRadius: "12px",
          padding: "1.1rem",
          boxShadow: "var(--shadow-sm)"
        }}>
          <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700 }}>
            Total Billed Revenue
          </div>
          <div style={{ fontSize: "1.6rem", fontWeight: 800, color: "var(--crimson-500)", marginTop: "0.2rem" }}>
            ₹{totalBilledRevenue.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
          </div>
          <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginTop: "0.2rem" }}>
            Gross sales after discounts
          </div>
        </div>

        <div style={{
          background: "var(--bg-surface)",
          border: "1px solid var(--border-color)",
          borderRadius: "12px",
          padding: "1.1rem",
          boxShadow: "var(--shadow-sm)"
        }}>
          <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700 }}>
            GST Collected (5%)
          </div>
          <div style={{ fontSize: "1.6rem", fontWeight: 800, color: "#d97706", marginTop: "0.2rem" }}>
            ₹{totalGstCollected.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
          </div>
          <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginTop: "0.2rem" }}>
            CGST (2.5%) + SGST (2.5%)
          </div>
        </div>

        <div style={{
          background: "var(--bg-surface)",
          border: "1px solid var(--border-color)",
          borderRadius: "12px",
          padding: "1.1rem",
          boxShadow: "var(--shadow-sm)"
        }}>
          <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700 }}>
            Average Bill Value
          </div>
          <div style={{ fontSize: "1.6rem", fontWeight: 800, color: "var(--text-primary)", marginTop: "0.2rem" }}>
            ₹{invoices.length > 0 ? (totalBilledRevenue / invoices.length).toFixed(2) : "0.00"}
          </div>
          <div style={{ fontSize: "0.72rem", color: "#16a34a", marginTop: "0.2rem" }}>
            Per order transaction
          </div>
        </div>
      </div>

      {/* Search & Filters */}
      <div
        style={{
          background: "var(--bg-surface)",
          border: "1px solid var(--border-color)",
          borderRadius: "12px",
          padding: "0.9rem 1.2rem",
          marginBottom: "1.2rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "0.8rem"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", flex: 1, minWidth: "260px" }}>
          <span style={{ fontSize: "1.1rem", color: "var(--text-muted)" }}>🔍</span>
          <input
            type="text"
            placeholder="Search by invoice number (e.g. INV-BS-...), customer name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: "100%",
              background: "transparent",
              border: "none",
              outline: "none",
              fontSize: "0.88rem",
              color: "var(--text-primary)"
            }}
          />
        </div>

        <div style={{ display: "flex", gap: "0.4rem" }}>
          {[
            { id: "all", label: "All Bills" },
            { id: "online", label: "Online Store" },
            { id: "pos", label: "POS Counter" }
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setFilterType(f.id)}
              style={{
                background: filterType === f.id ? "var(--crimson-500)" : "var(--bg-page)",
                color: filterType === f.id ? "#ffffff" : "var(--text-secondary)",
                border: "1px solid var(--border-color)",
                borderRadius: "8px",
                padding: "0.4rem 0.85rem",
                fontSize: "0.78rem",
                fontWeight: 700,
                cursor: "pointer",
                transition: "all 0.15s ease"
              }}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Invoices List Table */}
      <div
        style={{
          background: "var(--bg-surface)",
          border: "1px solid var(--border-color)",
          borderRadius: "14px",
          overflow: "hidden",
          boxShadow: "var(--shadow-sm)"
        }}
      >
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.84rem" }}>
            <thead>
              <tr style={{ background: "rgba(0,0,0,0.03)", borderBottom: "1.5px solid var(--border-color)", color: "var(--text-muted)" }}>
                <th style={{ padding: "0.85rem 1rem", fontWeight: 700 }}>Invoice #</th>
                <th style={{ padding: "0.85rem 1rem", fontWeight: 700 }}>Date & Time</th>
                <th style={{ padding: "0.85rem 1rem", fontWeight: 700 }}>Customer</th>
                <th style={{ padding: "0.85rem 1rem", fontWeight: 700 }}>Channel</th>
                <th style={{ padding: "0.85rem 1rem", fontWeight: 700 }}>Items</th>
                <th style={{ padding: "0.85rem 1rem", fontWeight: 700, textAlign: "right" }}>Total Bill</th>
                <th style={{ padding: "0.85rem 1rem", fontWeight: 700, textAlign: "center" }}>Status</th>
                <th style={{ padding: "0.85rem 1rem", fontWeight: 700, textAlign: "center" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: "center", padding: "3rem", color: "var(--text-muted)" }}>
                    <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>📄</div>
                    <div>No billing invoices found matching your criteria.</div>
                  </td>
                </tr>
              ) : (
                filteredInvoices.map((inv, idx) => (
                  <tr
                    key={inv.invoiceNumber || inv.orderId || idx}
                    style={{
                      borderBottom: "1px solid var(--border-subtle)",
                      transition: "background 0.15s ease"
                    }}
                  >
                    <td style={{ padding: "0.85rem 1rem" }}>
                      <span style={{ fontWeight: 800, color: "var(--crimson-500)", fontFamily: "monospace" }}>
                        {inv.invoiceNumber || `INV-${inv.orderId}`}
                      </span>
                    </td>

                    <td style={{ padding: "0.85rem 1rem", color: "var(--text-secondary)" }}>
                      <div>{inv.orderDate || new Date(inv.createdAt).toLocaleDateString("en-IN")}</div>
                      <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>
                        {inv.orderTime || new Date(inv.createdAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                      </div>
                    </td>

                    <td style={{ padding: "0.85rem 1rem" }}>
                      <div style={{ fontWeight: 700, color: "var(--text-primary)" }}>{inv.customerName || "Guest"}</div>
                      <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>{inv.deliveryCity || "Chennai"}</div>
                    </td>

                    <td style={{ padding: "0.85rem 1rem" }}>
                      <span
                        style={{
                          background: inv.type === "pos" ? "#fef3c7" : "#f0fdf4",
                          color: inv.type === "pos" ? "#b45309" : "#15803d",
                          padding: "0.2rem 0.55rem",
                          borderRadius: "999px",
                          fontSize: "0.72rem",
                          fontWeight: 700
                        }}
                      >
                        {inv.type === "pos" ? "💳 POS Counter" : "🍰 Online Store"}
                      </span>
                    </td>

                    <td style={{ padding: "0.85rem 1rem", color: "var(--text-secondary)" }}>
                      <span>{inv.items ? `${inv.items.length} item(s)` : "1 item"}</span>
                    </td>

                    <td style={{ padding: "0.85rem 1rem", textAlign: "right" }}>
                      <div style={{ fontWeight: 800, color: "var(--crimson-500)", fontSize: "0.92rem" }}>
                        ₹{Number(inv.grandTotal || inv.finalTotal || 0).toFixed(2)}
                      </div>
                      <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>
                        Incl. GST
                      </div>
                    </td>

                    <td style={{ padding: "0.85rem 1rem", textAlign: "center" }}>
                      <span
                        style={{
                          background: "#dcfce7",
                          color: "#166534",
                          padding: "0.2rem 0.6rem",
                          borderRadius: "999px",
                          fontSize: "0.72rem",
                          fontWeight: 800
                        }}
                      >
                        PAID
                      </span>
                    </td>

                    <td style={{ padding: "0.85rem 1rem", textAlign: "center" }}>
                      <button
                        type="button"
                        onClick={() => openBill(inv)}
                        style={{
                          background: "var(--crimson-500)",
                          color: "#ffffff",
                          border: "none",
                          borderRadius: "8px",
                          padding: "0.4rem 0.8rem",
                          fontSize: "0.78rem",
                          fontWeight: 700,
                          cursor: "pointer",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "0.3rem",
                          boxShadow: "0 2px 6px rgba(225, 29, 72, 0.25)"
                        }}
                      >
                        <span>📄</span>
                        <span>View Bill</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
