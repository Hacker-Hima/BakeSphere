import { useState } from "react";

export const BillModal = ({ bill, isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !bill) return null;

  const handleCopyInvoiceNumber = () => {
    if (bill.invoiceNumber) {
      navigator.clipboard.writeText(bill.invoiceNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const items = bill.items || [];
  const subtotal = bill.subtotal || items.reduce((sum, it) => sum + (it.lineTotal || (it.price * it.quantity) || 0), 0);
  const discount = bill.discountAmount || bill.discount || 0;
  const deliveryFee = bill.deliveryFee !== undefined ? bill.deliveryFee : (subtotal >= 500 ? 0 : 50);
  const taxableAmount = bill.taxableAmount || Math.max(0, subtotal - discount);
  const cgst = bill.cgst !== undefined ? bill.cgst : parseFloat((taxableAmount * 0.025).toFixed(2));
  const sgst = bill.sgst !== undefined ? bill.sgst : parseFloat((taxableAmount * 0.025).toFixed(2));
  const grandTotal = bill.grandTotal || bill.finalTotal || (taxableAmount + cgst + sgst + deliveryFee);

  return (
    <div
      className="bk-bill-modal-overlay"
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: "rgba(10, 10, 15, 0.75)",
        backdropFilter: "blur(8px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem",
        overflowY: "auto"
      }}
    >
      <div
        className="bk-bill-card"
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#ffffff",
          color: "#1e293b",
          width: "100%",
          maxWidth: "620px",
          borderRadius: "20px",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.35), 0 0 0 1px rgba(0,0,0,0.06)",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          maxHeight: "92vh",
          animation: "bkBillScale 0.25s cubic-bezier(0.16, 1, 0.3, 1)"
        }}
      >
        {/* Top Action Header Bar */}
        <div
          style={{
            padding: "1rem 1.4rem",
            background: "linear-gradient(135deg, #be123c 0%, #881337 100%)",
            color: "#ffffff",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexShrink: 0
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
            <span style={{ fontSize: "1.4rem" }}>🧾</span>
            <div>
              <div style={{ fontWeight: 800, fontSize: "1rem", letterSpacing: "0.02em" }}>
                Official Tax Invoice & Bill
              </div>
              <div style={{ fontSize: "0.72rem", opacity: 0.9 }}>
                BakeSphere Patisserie Retail • Order #{bill.orderId || "BS-1024"}
              </div>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <button
              type="button"
              onClick={handlePrint}
              style={{
                background: "rgba(255, 255, 255, 0.2)",
                border: "1px solid rgba(255, 255, 255, 0.35)",
                color: "#ffffff",
                padding: "0.35rem 0.75rem",
                borderRadius: "8px",
                fontSize: "0.76rem",
                fontWeight: 700,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "0.3rem"
              }}
              title="Print Receipt / Save as PDF"
            >
              <span>🖨️</span>
              <span>Print Bill</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              style={{
                background: "rgba(255, 255, 255, 0.15)",
                border: "none",
                color: "#ffffff",
                width: "32px",
                height: "32px",
                borderRadius: "50%",
                fontSize: "0.95rem",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              ✕
            </button>
          </div>
        </div>

        {/* Printable Bill Paper Content */}
        <div
          id="bakesphere-printable-bill"
          style={{
            padding: "1.5rem",
            overflowY: "auto",
            flex: 1,
            fontSize: "0.85rem",
            lineHeight: 1.45,
            fontFamily: "system-ui, -apple-system, sans-serif"
          }}
        >
          {/* Store Brand & GST Header */}
          <div style={{ textAlign: "center", borderBottom: "1.5px dashed #cbd5e1", paddingBottom: "1.2rem", marginBottom: "1.2rem" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.85rem" }}>
              <div
                style={{
                  width: "130px",
                  height: "60px",
                  borderRadius: "10px",
                  padding: "2px",
                  background: "linear-gradient(135deg, #fef08a 0%, #f59e0b 45%, #be123c 100%)",
                  boxShadow: "0 0 16px rgba(245, 158, 11, 0.45), 0 4px 10px rgba(0,0,0,0.15)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  overflow: "hidden"
                }}
              >
                <img
                  src="/logo.png"
                  alt="BakeSphere Artisan Bakery"
                  style={{ width: "100%", height: "100%", borderRadius: "8px", objectFit: "contain", background: "#141311" }}
                />
              </div>
            </div>
            <div style={{ fontSize: "0.76rem", fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: "0.06em", marginTop: "2px" }}>
              Artisanal Patisserie & Smart Kitchen ERP
            </div>
            <div style={{ fontSize: "0.74rem", color: "#64748b", marginTop: "4px" }}>
              {bill.branchAddress || "Heritage Main Hub, 42 Venkatnarayana Rd, T. Nagar, Chennai 600017"}
            </div>
            <div style={{ fontSize: "0.72rem", color: "#64748b", marginTop: "2px" }}>
              Tel: {bill.phone || "+91 44 2434 8890"} • Email: care@bakesphere.com
            </div>
            <div style={{ display: "flex", justifyContent: "center", gap: "1.2rem", fontSize: "0.72rem", fontWeight: 700, color: "#334155", marginTop: "6px" }}>
              <span>GSTIN: {bill.gstin || "33AABCB1234E1Z0"}</span>
              <span>FSSAI: {bill.fssaiLicense || "12423008000451"}</span>
            </div>
          </div>

          {/* Invoice Meta Grid */}
          <div style={{
            background: "#f8fafc",
            border: "1px solid #e2e8f0",
            borderRadius: "12px",
            padding: "0.9rem 1.1rem",
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "0.6rem",
            marginBottom: "1.2rem",
            fontSize: "0.78rem"
          }}>
            <div>
              <div style={{ color: "#64748b", fontSize: "0.7rem", textTransform: "uppercase", fontWeight: 600 }}>Invoice Number</div>
              <div style={{ fontWeight: 800, color: "#be123c", display: "flex", alignItems: "center", gap: "0.4rem", marginTop: "1px" }}>
                <span>{bill.invoiceNumber || `INV-${bill.orderId}`}</span>
                <button
                  type="button"
                  onClick={handleCopyInvoiceNumber}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    fontSize: "0.75rem",
                    padding: 0
                  }}
                  title="Copy Invoice Number"
                >
                  {copied ? "✓" : "📋"}
                </button>
              </div>
            </div>

            <div>
              <div style={{ color: "#64748b", fontSize: "0.7rem", textTransform: "uppercase", fontWeight: 600 }}>Date & Time</div>
              <div style={{ fontWeight: 700, color: "#1e293b", marginTop: "1px" }}>
                {bill.orderDate || new Date(bill.createdAt || Date.now()).toLocaleDateString("en-IN")} • {bill.orderTime || new Date(bill.createdAt || Date.now()).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
              </div>
            </div>

            <div>
              <div style={{ color: "#64748b", fontSize: "0.7rem", textTransform: "uppercase", fontWeight: 600 }}>Customer Name</div>
              <div style={{ fontWeight: 700, color: "#1e293b", marginTop: "1px" }}>
                {bill.customerName || "Guest Gourmet"} {bill.customerPhone ? `(${bill.customerPhone})` : ""}
              </div>
            </div>

            <div>
              <div style={{ color: "#64748b", fontSize: "0.7rem", textTransform: "uppercase", fontWeight: 600 }}>Payment Method</div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", marginTop: "1px" }}>
                <span style={{ fontWeight: 700, color: "#1e293b" }}>{bill.paymentMethod || "UPI Instant"}</span>
                <span style={{
                  background: "#dcfce7",
                  color: "#15803d",
                  fontSize: "0.66rem",
                  fontWeight: 800,
                  padding: "0.1rem 0.45rem",
                  borderRadius: "999px",
                  border: "1px solid #bbf7d0"
                }}>
                  PAID
                </span>
              </div>
            </div>

            {bill.deliveryAddress && (
              <div style={{ gridColumn: "1 / -1", borderTop: "1px solid #e2e8f0", paddingTop: "0.4rem" }}>
                <div style={{ color: "#64748b", fontSize: "0.7rem", textTransform: "uppercase", fontWeight: 600 }}>Delivery Destination & Slot</div>
                <div style={{ color: "#334155", fontWeight: 600, marginTop: "1px" }}>
                  📍 {bill.deliveryAddress}, {bill.deliveryCity || "Chennai"} {bill.deliveryPincode ? `- ${bill.deliveryPincode}` : ""} • <span style={{ color: "#be123c", fontWeight: 700 }}>{bill.deliverySlot || "Standard Delivery"}</span>
                </div>
              </div>
            )}

            {bill.customDetails && (
              <div style={{
                gridColumn: "1 / -1",
                borderTop: "1.5px dashed #fbcfe8",
                paddingTop: "0.6rem",
                marginTop: "0.3rem"
              }}>
                <div style={{ color: "#be123c", fontSize: "0.74rem", textTransform: "uppercase", fontWeight: 800, letterSpacing: "0.04em", display: "flex", alignItems: "center", gap: "0.35rem", marginBottom: "0.35rem" }}>
                  <span>🎂</span>
                  <span>Artisan Custom Cake Architectural Specifications</span>
                </div>
                <div style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                  gap: "0.45rem",
                  fontSize: "0.75rem",
                  background: "#fff1f2",
                  padding: "0.7rem 0.9rem",
                  borderRadius: "10px",
                  border: "1px solid #fecdd3"
                }}>
                  <div><strong style={{ color: "#881337" }}>Architecture:</strong> {bill.customDetails.tiers} Tiers • {bill.customDetails.weightKg} kg ({bill.customDetails.shape || "Round"})</div>
                  <div><strong style={{ color: "#881337" }}>Base Sponge:</strong> {bill.customDetails.baseFlavor || bill.customDetails.baseSponge}</div>
                  <div><strong style={{ color: "#881337" }}>Filling:</strong> {bill.customDetails.filling}</div>
                  <div><strong style={{ color: "#881337" }}>Theme:</strong> {bill.customDetails.theme}</div>
                  {bill.customDetails.toppingsText && (
                    <div style={{ gridColumn: "1 / -1" }}><strong style={{ color: "#881337" }}>Embellishments:</strong> {bill.customDetails.toppingsText}</div>
                  )}
                  {bill.customDetails.cakeMessage && (
                    <div style={{ gridColumn: "1 / -1" }}><strong style={{ color: "#881337" }}>Custom Inscription:</strong> <span style={{ fontStyle: "italic", color: "#be123c", fontWeight: 600 }}>"{bill.customDetails.cakeMessage}"</span></div>
                  )}
                  {bill.customDetails.assignedChef && (
                    <div style={{ gridColumn: "1 / -1", color: "#64748b", fontSize: "0.72rem" }}>
                      🧑‍🍳 Crafted by: <strong style={{ color: "#1e293b" }}>{bill.customDetails.assignedChef}</strong> (Central Cloud Patisserie Studio)
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Itemized Table */}
          <div style={{ marginBottom: "1.2rem", overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.8rem", textAlign: "left" }}>
              <thead>
                <tr style={{ background: "#f1f5f9", borderBottom: "2px solid #cbd5e1", color: "#475569" }}>
                  <th style={{ padding: "0.6rem 0.5rem", fontWeight: 700 }}>#</th>
                  <th style={{ padding: "0.6rem 0.5rem", fontWeight: 700 }}>Item Description</th>
                  <th style={{ padding: "0.6rem 0.5rem", textAlign: "center", fontWeight: 700 }}>Qty</th>
                  <th style={{ padding: "0.6rem 0.5rem", textAlign: "right", fontWeight: 700 }}>Unit Price</th>
                  <th style={{ padding: "0.6rem 0.5rem", textAlign: "right", fontWeight: 700 }}>Total</th>
                </tr>
              </thead>
              <tbody>
                {items.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ textAlign: "center", padding: "1.5rem", color: "#64748b" }}>
                      No items recorded in this bill.
                    </td>
                  </tr>
                ) : (
                  items.map((it, idx) => (
                    <tr key={idx} style={{ borderBottom: "1px solid #f1f5f9" }}>
                      <td style={{ padding: "0.6rem 0.5rem", color: "#94a3b8", fontWeight: 600 }}>{idx + 1}</td>
                      <td style={{ padding: "0.6rem 0.5rem" }}>
                        <div style={{ fontWeight: 700, color: "#1e293b" }}>{it.name || "Artisan Cake"}</div>
                        {it.weight && (
                          <div style={{ fontSize: "0.7rem", color: "#64748b" }}>Size: {it.weight}</div>
                        )}
                      </td>
                      <td style={{ padding: "0.6rem 0.5rem", textAlign: "center", fontWeight: 700, color: "#334155" }}>
                        {it.quantity}
                      </td>
                      <td style={{ padding: "0.6rem 0.5rem", textAlign: "right", color: "#475569" }}>
                        ₹{(it.unitPrice || it.price || 0).toFixed(2)}
                      </td>
                      <td style={{ padding: "0.6rem 0.5rem", textAlign: "right", fontWeight: 800, color: "#be123c" }}>
                        ₹{(it.lineTotal || (it.unitPrice || it.price || 0) * it.quantity).toFixed(2)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pricing & GST Totals Calculation Card */}
          <div style={{
            display: "flex",
            justifyContent: "flex-end",
            marginBottom: "1.2rem"
          }}>
            <div style={{ width: "280px", display: "flex", flexDirection: "column", gap: "0.35rem", fontSize: "0.8rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", color: "#64748b" }}>
                <span>Items Subtotal:</span>
                <span style={{ fontWeight: 700, color: "#1e293b" }}>₹{Number(subtotal).toFixed(2)}</span>
              </div>

              {discount > 0 && (
                <div style={{ display: "flex", justifyContent: "space-between", color: "#059669" }}>
                  <span>Discount {bill.couponCode ? `(${bill.couponCode})` : ""}:</span>
                  <span style={{ fontWeight: 700 }}>-₹{Number(discount).toFixed(2)}</span>
                </div>
              )}

              <div style={{ display: "flex", justifyContent: "space-between", color: "#64748b" }}>
                <span>Delivery & Logistics:</span>
                <span style={{ fontWeight: 700, color: deliveryFee === 0 ? "#059669" : "#1e293b" }}>
                  {deliveryFee === 0 ? "FREE" : `₹${Number(deliveryFee).toFixed(2)}`}
                </span>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", color: "#64748b" }}>
                <span>Taxable Value:</span>
                <span style={{ fontWeight: 600 }}>₹{Number(taxableAmount).toFixed(2)}</span>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", color: "#64748b", fontSize: "0.74rem" }}>
                <span>CGST (2.5%):</span>
                <span>₹{Number(cgst).toFixed(2)}</span>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", color: "#64748b", fontSize: "0.74rem" }}>
                <span>SGST (2.5%):</span>
                <span>₹{Number(sgst).toFixed(2)}</span>
              </div>

              <div style={{
                borderTop: "2px solid #be123c",
                paddingTop: "0.5rem",
                marginTop: "0.2rem",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center"
              }}>
                <span style={{ fontSize: "0.95rem", fontWeight: 800, color: "#be123c" }}>TOTAL VALUE:</span>
                <span style={{ fontSize: "1.2rem", fontWeight: 900, color: "#be123c" }}>₹{Number(grandTotal).toFixed(2)}</span>
              </div>

              {bill.customDetails?.advancePaid !== undefined && (
                <>
                  <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    color: "#15803d",
                    fontWeight: 700,
                    fontSize: "0.82rem",
                    marginTop: "0.3rem",
                    background: "#dcfce7",
                    padding: "0.3rem 0.5rem",
                    borderRadius: "6px"
                  }}>
                    <span>✓ 50% Advance Paid Now:</span>
                    <span>₹{Number(bill.customDetails.advancePaid).toFixed(2)}</span>
                  </div>

                  <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    color: "#b45309",
                    fontWeight: 800,
                    fontSize: "0.84rem",
                    background: "#fef3c7",
                    padding: "0.3rem 0.5rem",
                    borderRadius: "6px",
                    border: "1px dashed #fde68a"
                  }}>
                    <span>⏳ Balance on Handover:</span>
                    <span>₹{Number(bill.customDetails.balanceDue).toFixed(2)}</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Verification Barcode & QR Code Footer */}
          <div style={{
            borderTop: "1.5px dashed #cbd5e1",
            paddingTop: "1rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "1rem"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.8rem" }}>
              <div style={{
                width: "60px",
                height: "60px",
                background: "#f1f5f9",
                border: "1px solid #cbd5e1",
                borderRadius: "8px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1.8rem"
              }}>
                📱
              </div>
              <div style={{ fontSize: "0.72rem", color: "#64748b" }}>
                <div style={{ fontWeight: 700, color: "#334155" }}>Scan to Verify Invoice</div>
                <div>Authorized Electronic Signature</div>
                <div style={{ fontFamily: "monospace", fontSize: "0.68rem" }}>{bill.transactionRef || "TXN-SECURE-9941"}</div>
              </div>
            </div>

            <div style={{ textAlign: "right" }}>
              <div style={{
                display: "inline-block",
                border: "1px solid #22c55e",
                background: "#f0fdf4",
                color: "#166534",
                padding: "0.25rem 0.65rem",
                borderRadius: "6px",
                fontSize: "0.72rem",
                fontWeight: 800,
                textTransform: "uppercase"
              }}>
                ✓ Billed & Dispatched
              </div>
              <div style={{ fontSize: "0.68rem", color: "#94a3b8", marginTop: "3px" }}>
                BakeSphere ERP V2.0 • Non-Transferable
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div style={{
          padding: "0.85rem 1.4rem",
          background: "#f8fafc",
          borderTop: "1px solid #e2e8f0",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexShrink: 0
        }}>
          <button
            type="button"
            onClick={handleCopyInvoiceNumber}
            style={{
              background: "transparent",
              border: "1px solid #cbd5e1",
              color: "#475569",
              padding: "0.45rem 0.9rem",
              borderRadius: "8px",
              fontSize: "0.8rem",
              fontWeight: 600,
              cursor: "pointer"
            }}
          >
            {copied ? "✓ Copied!" : "📋 Copy Invoice #"}
          </button>

          <div style={{ display: "flex", gap: "0.6rem" }}>
            <button
              type="button"
              onClick={handlePrint}
              style={{
                background: "#be123c",
                color: "#ffffff",
                border: "none",
                padding: "0.5rem 1.2rem",
                borderRadius: "8px",
                fontSize: "0.84rem",
                fontWeight: 700,
                cursor: "pointer",
                boxShadow: "0 2px 8px rgba(190, 18, 60, 0.3)"
              }}
            >
              🖨️ Print / Download
            </button>
            <button
              type="button"
              onClick={onClose}
              style={{
                background: "#f1f5f9",
                color: "#475569",
                border: "1px solid #cbd5e1",
                padding: "0.5rem 1rem",
                borderRadius: "8px",
                fontSize: "0.84rem",
                fontWeight: 600,
                cursor: "pointer"
              }}
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
