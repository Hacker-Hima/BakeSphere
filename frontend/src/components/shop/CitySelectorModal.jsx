import { useState } from "react";
import { BAKINGO_CITIES } from "../../data/bakingoProducts.js";

export const CitySelectorModal = ({ isOpen, onClose, currentCity, onSelectCity }) => {
  const [pincodeInput, setPincodeInput] = useState("");
  const [pinMessage, setPinMessage] = useState("");

  if (!isOpen) return null;

  const handlePincodeCheck = (e) => {
    e.preventDefault();
    if (!pincodeInput.trim()) return;

    if (/^[1-9][0-9]{5}$/.test(pincodeInput.trim())) {
      setPinMessage(`✓ Pincode ${pincodeInput.trim()} is eligible for 2-Hour Express Delivery!`);
      setTimeout(() => {
        onSelectCity({ name: currentCity.name, pincode: pincodeInput.trim() });
        onClose();
      }, 1000);
    } else {
      setPinMessage("⚠️ Please enter a valid 6-digit Indian PIN code");
    }
  };

  return (
    <div className="bk-modal-backdrop" onClick={onClose}>
      <div className="bk-city-modal" onClick={(e) => e.stopPropagation()}>
        <div className="bk-city-modal-header">
          <div className="bk-city-title-group">
            <span className="bk-city-header-icon">📍</span>
            <div>
              <h3 className="bk-city-modal-title">Select Delivery City</h3>
              <p className="bk-city-modal-subtitle">
                Choose your city to discover fresh bakery delights available for express 2-hour delivery.
              </p>
            </div>
          </div>
          <button className="bk-modal-close-btn" onClick={onClose}>✕</button>
        </div>

        {/* Quick City Buttons */}
        <div className="bk-city-grid">
          {BAKINGO_CITIES.map((c) => {
            const isSelected = currentCity.name === c.name;
            return (
              <div
                key={c.name}
                className={`bk-city-card ${isSelected ? "bk-city-card--active" : ""}`}
                onClick={() => {
                  onSelectCity(c);
                  onClose();
                }}
              >
                <div className="bk-city-card-header">
                  <span className="bk-city-card-name">{c.name}</span>
                  {isSelected && <span className="bk-city-active-badge">Selected</span>}
                </div>
                <div className="bk-city-card-pincode">Default PIN: {c.pincode}</div>
                <div className="bk-city-card-tag">{c.tag}</div>
              </div>
            );
          })}
        </div>

        {/* Or enter custom pincode */}
        <div className="bk-city-pincode-section">
          <label className="bk-city-pincode-label">
            Or Check by Exact Delivery PIN Code:
          </label>
          <form onSubmit={handlePincodeCheck} className="bk-city-pincode-form">
            <input
              type="text"
              maxLength={6}
              className="bk-city-pincode-input"
              placeholder="e.g. 600017"
              value={pincodeInput}
              onChange={(e) => setPincodeInput(e.target.value.replace(/\D/g, ""))}
            />
            <button type="submit" className="bk-btn-check-pin">
              Verify PIN
            </button>
          </form>
          {pinMessage && (
            <div className="bk-city-pin-msg">{pinMessage}</div>
          )}
        </div>
      </div>
    </div>
  );
};
