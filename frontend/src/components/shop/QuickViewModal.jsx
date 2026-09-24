import { useState } from "react";
import { handleImageError, getSafeImageUrl } from "../../utils/imageFallback.js";

export const QuickViewModal = ({ product, isOpen, onClose, onAddToCart, onOpenCart }) => {
  const [selectedWeight, setSelectedWeight] = useState(
    product?.availableWeights?.[0] || product?.weight || "0.5 kg"
  );
  const [cakeMessage, setCakeMessage] = useState("");
  const [includeCandles, setIncludeCandles] = useState(true);
  const [includeKnife, setIncludeKnife] = useState(true);
  const [addedAnim, setAddedAnim] = useState(false);

  if (!isOpen || !product) return null;

  // Compute dynamic price based on weight multiplier
  const multiplier = product.weightMultipliers?.[selectedWeight] || 1;
  const computedPrice = Math.round(product.sellingPrice * multiplier);
  const computedMrp = Math.round(product.mrp * multiplier);

  const handleAdd = (openCartDirect = false) => {
    onAddToCart({
      ...product,
      sellingPrice: computedPrice,
      mrp: computedMrp,
      selectedWeight,
      cakeMessage: cakeMessage.trim(),
      includeCandles,
      includeKnife
    });

    setAddedAnim(true);
    setTimeout(() => {
      setAddedAnim(false);
      if (openCartDirect) {
        onClose();
        if (onOpenCart) onOpenCart();
      }
    }, 600);
  };

  return (
    <div className="bk-modal-backdrop" onClick={onClose}>
      <div className="bk-quickview-card" onClick={(e) => e.stopPropagation()}>
        {/* Close Button */}
        <button className="bk-modal-close-btn" onClick={onClose}>
          ✕
        </button>

        <div className="bk-quickview-layout">
          {/* Left Column: Image */}
          <div className="bk-quickview-media">
            <img
              src={getSafeImageUrl(product.image)}
              alt={product.name}
              className="bk-quickview-img"
              onError={handleImageError}
            />
            {product.discountPercent && (
              <span className="bk-discount-badge">
                {product.discountPercent}% OFF
              </span>
            )}
            <div className="bk-media-overlay-tags">
              <span className="bk-badge-express">⚡ {product.deliveryTime || "Today in 2 hrs"}</span>
              {product.isEggless && (
                <span className="bk-badge-veg">🌱 100% Eggless</span>
              )}
            </div>
          </div>

          {/* Right Column: Details & Customization */}
          <div className="bk-quickview-details">
            <div className="bk-qv-header">
              <div className="bk-veg-indicator-row">
                <span className={`bk-diet-dot ${product.isEggless ? "bk-diet-veg" : "bk-diet-nonveg"}`}>
                  <span className="bk-diet-circle" />
                </span>
                <span className="bk-diet-text">
                  {product.isEggless ? "100% Eggless Pure Veg" : "Contains Egg"}
                </span>
              </div>
              <h2 className="bk-qv-title">{product.name}</h2>
              <div className="bk-rating-bar">
                <span className="bk-star-rating">★ {product.rating || "4.9"}</span>
                <span className="bk-review-count">({product.reviewsCount || "840"} Verified Reviews)</span>
                <span className="bk-badge-category">{product.category}</span>
              </div>
            </div>

            {/* Price Row */}
            <div className="bk-qv-price-row">
              <span className="bk-price-current">₹{computedPrice}</span>
              {computedMrp > computedPrice && (
                <span className="bk-price-mrp">₹{computedMrp}</span>
              )}
              <span className="bk-inclusive-tax">Inclusive of all taxes</span>
            </div>

            {/* Weight Selection */}
            {product.availableWeights && product.availableWeights.length > 0 && (
              <div className="bk-qv-section">
                <label className="bk-qv-label">
                  Select Weight / Size: <strong className="bk-selected-weight-val">{selectedWeight}</strong>
                </label>
                <div className="bk-weight-pill-group">
                  {product.availableWeights.map((w) => (
                    <button
                      key={w}
                      type="button"
                      className={`bk-weight-pill ${selectedWeight === w ? "bk-weight-pill--active" : ""}`}
                      onClick={() => setSelectedWeight(w)}
                    >
                      {w}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Cake Message Input */}
            <div className="bk-qv-section">
              <label className="bk-qv-label">
                ✍️ Message on Cake / Card (Max 25 characters):
              </label>
              <input
                type="text"
                maxLength={30}
                className="bk-cake-msg-input"
                placeholder="e.g. Happy Birthday Rhea! ❤️"
                value={cakeMessage}
                onChange={(e) => setCakeMessage(e.target.value)}
              />
            </div>

            {/* Add-ons Checkboxes */}
            <div className="bk-qv-addons">
              <label className="bk-checkbox-label">
                <input
                  type="checkbox"
                  checked={includeCandles}
                  onChange={(e) => setIncludeCandles(e.target.checked)}
                />
                <span>🕯️ Complimentary Party Candle Set (Free)</span>
              </label>
              <label className="bk-checkbox-label">
                <input
                  type="checkbox"
                  checked={includeKnife}
                  onChange={(e) => setIncludeKnife(e.target.checked)}
                />
                <span>🍴 Pastry Knife & Tissues (Free)</span>
              </label>
            </div>

            {/* Product Description */}
            <p className="bk-qv-desc">{product.description}</p>

            {/* Action Buttons */}
            <div className="bk-qv-actions">
              <button
                type="button"
                className={`bk-btn-add-cart ${addedAnim ? "bk-btn-added" : ""}`}
                onClick={() => handleAdd(false)}
              >
                {addedAnim ? "✓ Added to Cart!" : "🛒 Add to Cart"}
              </button>
              <button
                type="button"
                className="bk-btn-buy-now"
                onClick={() => handleAdd(true)}
              >
                ⚡ Buy Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
