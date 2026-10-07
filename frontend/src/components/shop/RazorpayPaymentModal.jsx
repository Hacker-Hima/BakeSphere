import { useState, useEffect } from "react";

export const RazorpayPaymentModal = ({
  isOpen,
  onClose,
  amount,
  orderDetails,
  onPaymentSuccess,
  onPaymentFailure
}) => {
  const [loading, setLoading] = useState(false);
  const [razorpayOrder, setRazorpayOrder] = useState(null);
  const [keyId, setKeyId] = useState("rzp_test_BakeSphere2026");
  const [paymentMethod, setPaymentMethod] = useState("upi"); // "upi" | "card" | "netbanking"
  const [upiId, setUpiId] = useState("bakesphere@okaxis");
  const [cardNumber, setCardNumber] = useState("4111 2222 3333 4444");
  const [cardExpiry, setCardExpiry] = useState("12/28");
  const [cardCvv, setCardCvv] = useState("889");
  const [selectedBank, setSelectedBank] = useState("HDFC");
  const [verifyStatus, setVerifyStatus] = useState(""); // "initiating" | "verifying" | "success" | "failed"
  const [errorMessage, setErrorMessage] = useState("");
  const [simulateTamper, setSimulateTamper] = useState(false);

  // Initialize Razorpay Order from backend on open
  useEffect(() => {
    if (!isOpen) {
      setRazorpayOrder(null);
      setVerifyStatus("");
      setErrorMessage("");
      setLoading(false);
      return;
    }

    const initOrder = async () => {
      setLoading(true);
      try {
        const res = await fetch("http://localhost:5000/api/payment/razorpay/create-order", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            amount: parseFloat(amount),
            receipt: `rcpt_${Date.now().toString().slice(-6)}`,
            customer: {
              name: orderDetails?.customerName || "Customer",
              email: orderDetails?.customerEmail || "customer@bakesphere.com"
            }
          })
        });

        const data = await res.json();
        if (data.success && data.order) {
          setRazorpayOrder(data.order);
          if (data.keyId) setKeyId(data.keyId);
        } else {
          setErrorMessage(data.error || "Failed to initialize Razorpay order");
        }
      } catch (err) {
        console.error("Razorpay order initialization error:", err);
        setErrorMessage("Network error connecting to payment gateway");
      } finally {
        setLoading(false);
      }
    };

    initOrder();
  }, [isOpen, amount, orderDetails]);

  if (!isOpen) return null;

  const handlePay = async () => {
    if (!razorpayOrder) return;
    setLoading(true);
    setVerifyStatus("verifying");
    setErrorMessage("");

    try {
      // 1. Generate Payment ID & Signature
      const mockPaymentId = `pay_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
      let signature = "";

      if (simulateTamper) {
        // Deliberate invalid signature to test security rejection
        signature = "tampered_fake_signature_xyz_123456";
      } else {
        // Fetch authentic HMAC SHA256 signature from backend sandbox endpoint
        const sigRes = await fetch("http://localhost:5000/api/payment/razorpay/mock-signature", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            orderId: razorpayOrder.id,
            paymentId: mockPaymentId
          })
        });
        const sigData = await sigRes.json();
        signature = sigData.signature;
      }

      // 2. Submit to backend /api/payment/razorpay/verify for cryptographic verification
      const verifyRes = await fetch("http://localhost:5000/api/payment/razorpay/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          razorpay_order_id: razorpayOrder.id,
          razorpay_payment_id: mockPaymentId,
          razorpay_signature: signature,
          orderData: orderDetails
        })
      });

      const verifyData = await verifyRes.json();

      if (verifyRes.ok && verifyData.verified) {
        setVerifyStatus("success");
        setTimeout(() => {
          onPaymentSuccess(verifyData.invoice || orderDetails, {
            paymentId: mockPaymentId,
            orderId: razorpayOrder.id,
            signature
          });
          if (typeof onClose === "function") {
            onClose();
          }
        }, 1200);
      } else {
        setVerifyStatus("failed");
        setErrorMessage(verifyData.error || "Cryptographic HMAC signature verification failed.");
        if (onPaymentFailure) onPaymentFailure(verifyData.error);
      }
    } catch (err) {
      console.error("Verification error:", err);
      setVerifyStatus("failed");
      setErrorMessage(err.message || "Payment verification encountered a network error");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 99999,
        background: "rgba(15, 23, 42, 0.75)",
        backdropFilter: "blur(6px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem"
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "460px",
          background: "#ffffff",
          borderRadius: "16px",
          overflow: "hidden",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.35)",
          color: "#0f172a",
          fontFamily: "'Inter', sans-serif",
          animation: "fadeInUp 0.25s ease-out"
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Razorpay Master Header */}
        <div
          style={{
            background: "linear-gradient(135deg, #0b1f3a 0%, #173b6c 100%)",
            color: "#ffffff",
            padding: "1.2rem 1.4rem",
            position: "relative"
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <div
                style={{
                  width: "44px",
                  height: "44px",
                  background: "#ffffff",
                  borderRadius: "10px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.2)"
                }}
              >
                <img src="/logo-square.png" alt="BakeSphere" style={{ width: "32px", height: "32px", objectFit: "contain" }} onError={(e) => { e.target.style.display = "none"; }} />
                <span style={{ fontSize: "1.4rem" }}>🥐</span>
              </div>
              <div>
                <div style={{ fontSize: "1.05rem", fontWeight: 800, letterSpacing: "-0.01em" }}>
                  BakeSphere Patisserie
                </div>
                <div style={{ fontSize: "0.75rem", color: "#93c5fd", display: "flex", alignItems: "center", gap: "0.3rem" }}>
                  <span>🛡️ Razorpay Verified Merchant</span>
                </div>
              </div>
            </div>

            <button
              onClick={onClose}
              disabled={loading}
              style={{
                background: "rgba(255,255,255,0.15)",
                border: "none",
                color: "#ffffff",
                width: "30px",
                height: "30px",
                borderRadius: "50%",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1rem"
              }}
            >
              ✕
            </button>
          </div>

          <div
            style={{
              marginTop: "1.1rem",
              paddingTop: "0.9rem",
              borderTop: "1px solid rgba(255,255,255,0.15)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center"
            }}
          >
            <div>
              <span style={{ fontSize: "0.74rem", color: "#cbd5e1", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Total Payable Amount
              </span>
              <div style={{ fontSize: "1.5rem", fontWeight: 900, color: "#ffffff", letterSpacing: "-0.02em" }}>
                ₹{Number(amount).toFixed(2)}
              </div>
            </div>

            {razorpayOrder && (
              <div style={{ textAlign: "right" }}>
                <span style={{ fontSize: "0.7rem", color: "#93c5fd" }}>Order ID</span>
                <div style={{ fontSize: "0.74rem", fontFamily: "monospace", color: "#e2e8f0" }}>
                  {razorpayOrder.id}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Payment Methods Selector Bar */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            background: "#f8fafc",
            borderBottom: "1px solid #e2e8f0"
          }}
        >
          <button
            type="button"
            onClick={() => setPaymentMethod("upi")}
            style={{
              padding: "0.85rem 0.5rem",
              background: paymentMethod === "upi" ? "#ffffff" : "transparent",
              border: "none",
              borderBottom: paymentMethod === "upi" ? "3px solid #2563eb" : "3px solid transparent",
              fontWeight: paymentMethod === "upi" ? 700 : 500,
              color: paymentMethod === "upi" ? "#2563eb" : "#64748b",
              fontSize: "0.82rem",
              cursor: "pointer",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "0.2rem"
            }}
          >
            <span style={{ fontSize: "1.1rem" }}>📱</span>
            <span>UPI / QR</span>
          </button>

          <button
            type="button"
            onClick={() => setPaymentMethod("card")}
            style={{
              padding: "0.85rem 0.5rem",
              background: paymentMethod === "card" ? "#ffffff" : "transparent",
              border: "none",
              borderBottom: paymentMethod === "card" ? "3px solid #2563eb" : "3px solid transparent",
              fontWeight: paymentMethod === "card" ? 700 : 500,
              color: paymentMethod === "card" ? "#2563eb" : "#64748b",
              fontSize: "0.82rem",
              cursor: "pointer",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "0.2rem"
            }}
          >
            <span style={{ fontSize: "1.1rem" }}>💳</span>
            <span>Cards</span>
          </button>

          <button
            type="button"
            onClick={() => setPaymentMethod("netbanking")}
            style={{
              padding: "0.85rem 0.5rem",
              background: paymentMethod === "netbanking" ? "#ffffff" : "transparent",
              border: "none",
              borderBottom: paymentMethod === "netbanking" ? "3px solid #2563eb" : "3px solid transparent",
              fontWeight: paymentMethod === "netbanking" ? 700 : 500,
              color: paymentMethod === "netbanking" ? "#2563eb" : "#64748b",
              fontSize: "0.82rem",
              cursor: "pointer",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "0.2rem"
            }}
          >
            <span style={{ fontSize: "1.1rem" }}>🏛️</span>
            <span>NetBanking</span>
          </button>
        </div>

        {/* Modal Body / Active Tab */}
        <div style={{ padding: "1.4rem" }}>
          {/* Status Message Overlay */}
          {verifyStatus === "verifying" && (
            <div
              style={{
                padding: "1rem",
                borderRadius: "10px",
                background: "#eff6ff",
                border: "1px solid #bfdbfe",
                marginBottom: "1rem",
                textAlign: "center"
              }}
            >
              <div style={{ fontSize: "1.5rem", marginBottom: "0.3rem" }}>🔐</div>
              <div style={{ fontWeight: 700, color: "#1e40af", fontSize: "0.9rem" }}>
                Verifying Cryptographic HMAC-SHA256 Signature...
              </div>
              <div style={{ fontSize: "0.75rem", color: "#3b82f6", marginTop: "0.2rem" }}>
                Validating with BakeSphere Secure Node Server...
              </div>
            </div>
          )}

          {verifyStatus === "success" && (
            <div
              style={{
                padding: "1rem",
                borderRadius: "10px",
                background: "#f0fdf4",
                border: "1px solid #bbf7d0",
                marginBottom: "1rem",
                textAlign: "center"
              }}
            >
              <div style={{ fontSize: "1.8rem", marginBottom: "0.2rem" }}>🎉</div>
              <div style={{ fontWeight: 800, color: "#166534", fontSize: "0.95rem" }}>
                Razorpay Payment Verified Successfully!
              </div>
              <div style={{ fontSize: "0.75rem", color: "#15803d", marginTop: "0.2rem" }}>
                Cryptographic signature match confirmed • Generating official invoice...
              </div>
            </div>
          )}

          {verifyStatus === "failed" && (
            <div
              style={{
                padding: "0.9rem",
                borderRadius: "10px",
                background: "#fef2f2",
                border: "1px solid #fecaca",
                marginBottom: "1rem"
              }}
            >
              <div style={{ fontWeight: 700, color: "#991b1b", fontSize: "0.85rem", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                <span>⚠️ Verification Failed:</span>
              </div>
              <div style={{ fontSize: "0.78rem", color: "#b91c1c", marginTop: "0.25rem" }}>
                {errorMessage}
              </div>
            </div>
          )}

          {/* Tab 1: UPI / QR */}
          {paymentMethod === "upi" && (
            <div>
              <div
                style={{
                  background: "#f8fafc",
                  border: "1px dashed #cbd5e1",
                  borderRadius: "12px",
                  padding: "1rem",
                  textAlign: "center",
                  marginBottom: "1.1rem"
                }}
              >
                <div style={{ fontSize: "2.4rem", marginBottom: "0.4rem" }}>📲</div>
                <div style={{ fontSize: "0.86rem", fontWeight: 700, color: "#1e293b" }}>
                  Scan with any UPI App
                </div>
                <div style={{ fontSize: "0.72rem", color: "#64748b", marginTop: "2px" }}>
                  Google Pay • PhonePe • Paytm • BHIM • CRED
                </div>
              </div>

              <div style={{ marginBottom: "1rem" }}>
                <label style={{ display: "block", fontSize: "0.76rem", fontWeight: 600, color: "#475569", marginBottom: "0.3rem" }}>
                  Enter Virtual Payment Address (VPA / UPI ID):
                </label>
                <input
                  type="text"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  placeholder="e.g. mobile@upi or success@razorpay"
                  style={{
                    width: "100%",
                    padding: "0.65rem 0.85rem",
                    border: "1px solid #cbd5e1",
                    borderRadius: "8px",
                    fontSize: "0.88rem",
                    color: "#0f172a"
                  }}
                />
              </div>
            </div>
          )}

          {/* Tab 2: Cards */}
          {paymentMethod === "card" && (
            <div>
              <div style={{ marginBottom: "0.8rem" }}>
                <label style={{ display: "block", fontSize: "0.76rem", fontWeight: 600, color: "#475569", marginBottom: "0.3rem" }}>
                  Card Number:
                </label>
                <input
                  type="text"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  placeholder="4111 2222 3333 4444"
                  style={{
                    width: "100%",
                    padding: "0.65rem 0.85rem",
                    border: "1px solid #cbd5e1",
                    borderRadius: "8px",
                    fontSize: "0.88rem",
                    color: "#0f172a",
                    fontFamily: "monospace"
                  }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.8rem", marginBottom: "1rem" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.76rem", fontWeight: 600, color: "#475569", marginBottom: "0.3rem" }}>
                    Expiry (MM/YY):
                  </label>
                  <input
                    type="text"
                    value={cardExpiry}
                    onChange={(e) => setCardExpiry(e.target.value)}
                    placeholder="12/28"
                    style={{
                      width: "100%",
                      padding: "0.65rem 0.85rem",
                      border: "1px solid #cbd5e1",
                      borderRadius: "8px",
                      fontSize: "0.88rem",
                      color: "#0f172a"
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.76rem", fontWeight: 600, color: "#475569", marginBottom: "0.3rem" }}>
                    CVV:
                  </label>
                  <input
                    type="password"
                    maxLength={4}
                    value={cardCvv}
                    onChange={(e) => setCardCvv(e.target.value)}
                    placeholder="•••"
                    style={{
                      width: "100%",
                      padding: "0.65rem 0.85rem",
                      border: "1px solid #cbd5e1",
                      borderRadius: "8px",
                      fontSize: "0.88rem",
                      color: "#0f172a"
                    }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Tab 3: NetBanking */}
          {paymentMethod === "netbanking" && (
            <div style={{ marginBottom: "1rem" }}>
              <label style={{ display: "block", fontSize: "0.76rem", fontWeight: 600, color: "#475569", marginBottom: "0.4rem" }}>
                Select Your Bank:
              </label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.6rem" }}>
                {["HDFC", "ICICI", "SBI", "Axis", "Kotak", "Other"].map((b) => (
                  <button
                    key={b}
                    type="button"
                    onClick={() => setSelectedBank(b)}
                    style={{
                      padding: "0.6rem 0.8rem",
                      borderRadius: "8px",
                      border: selectedBank === b ? "2px solid #2563eb" : "1px solid #cbd5e1",
                      background: selectedBank === b ? "#eff6ff" : "#ffffff",
                      color: selectedBank === b ? "#1e40af" : "#334155",
                      fontWeight: selectedBank === b ? 700 : 500,
                      fontSize: "0.82rem",
                      cursor: "pointer",
                      textAlign: "center"
                    }}
                  >
                    🏦 {b} Bank
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Security Verification Testing Control */}
          <div
            style={{
              padding: "0.65rem 0.85rem",
              background: simulateTamper ? "#fef2f2" : "#f8fafc",
              border: simulateTamper ? "1px solid #fecaca" : "1px solid #e2e8f0",
              borderRadius: "8px",
              marginBottom: "1.1rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between"
            }}
          >
            <div>
              <div style={{ fontSize: "0.76rem", fontWeight: 700, color: simulateTamper ? "#991b1b" : "#475569" }}>
                🧪 Viva / Audit Security Test Mode
              </div>
              <div style={{ fontSize: "0.68rem", color: "#64748b" }}>
                {simulateTamper ? "Will send a tampered signature to test rejection!" : "Testing standard valid HMAC-SHA256 signature"}
              </div>
            </div>

            <label style={{ display: "flex", alignItems: "center", gap: "0.4rem", cursor: "pointer", fontSize: "0.75rem", fontWeight: 600 }}>
              <input
                type="checkbox"
                checked={simulateTamper}
                onChange={(e) => setSimulateTamper(e.target.checked)}
              />
              <span style={{ color: simulateTamper ? "#dc2626" : "#475569" }}>Tamper</span>
            </label>
          </div>

          {/* Pay Button */}
          <button
            type="button"
            onClick={handlePay}
            disabled={loading || verifyStatus === "success"}
            style={{
              width: "100%",
              padding: "0.85rem 1rem",
              borderRadius: "10px",
              background: loading ? "#94a3b8" : "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
              color: "#ffffff",
              border: "none",
              fontSize: "0.95rem",
              fontWeight: 800,
              cursor: loading ? "not-allowed" : "pointer",
              boxShadow: "0 4px 14px rgba(37, 99, 235, 0.35)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.6rem",
              transition: "all 0.2s ease"
            }}
          >
            <span>🛡️</span>
            <span>
              {loading ? "Verifying with Razorpay..." : `Pay ₹${Number(amount).toFixed(2)} Securely`}
            </span>
          </button>

          {/* Razorpay Footer Seal */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.6rem",
              marginTop: "0.9rem",
              fontSize: "0.72rem",
              color: "#64748b"
            }}
          >
            <span>🔒 256-Bit SSL Encryption</span>
            <span>•</span>
            <span style={{ fontWeight: 700, color: "#1e3a8a" }}>Razorpay Standard v2</span>
          </div>
        </div>
      </div>
    </div>
  );
};
