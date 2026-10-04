import { useState, useRef, useEffect, useCallback } from "react";

const FALLBACK_PHOTO = "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600&auto=format&fit=crop&q=80";

const SAMPLE_PHOTO_PRESETS = [
  {
    name: "Golden Royale",
    category: "Luxury",
    url: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600&auto=format&fit=crop&q=80"
  },
  {
    name: "Enchanted Bloom",
    category: "Floral",
    url: "https://images.unsplash.com/photo-1562777717-dc6984f65a63?w=600&auto=format&fit=crop&q=80"
  },
  {
    name: "Anniversary Rose",
    category: "Romance",
    url: "https://images.unsplash.com/photo-1588195538326-c5b1e9f80a1b?w=600&auto=format&fit=crop&q=80"
  },
  {
    name: "Artisan Chocolate",
    category: "Decadence",
    url: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=600&auto=format&fit=crop&q=80"
  }
];

const drawShapePath = (ctx, shapeType, centerX, centerY, radius, width, height) => {
  ctx.beginPath();
  if (shapeType === "Round") {
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
  } else if (shapeType === "Square") {
    const size = radius * 1.65;
    ctx.roundRect(centerX - size / 2, centerY - size / 2, size, size, 16);
  } else if (shapeType === "Heart") {
    const s = radius * 0.95;
    ctx.moveTo(centerX, centerY + s * 0.7);
    ctx.bezierCurveTo(centerX + s, centerY, centerX + s * 0.9, centerY - s * 0.8, centerX, centerY - s * 0.3);
    ctx.bezierCurveTo(centerX - s * 0.9, centerY - s * 0.8, centerX - s, centerY, centerX, centerY + s * 0.7);
  } else if (shapeType === "Oval") {
    ctx.ellipse(centerX, centerY, radius * 0.95, radius * 0.72, 0, 0, Math.PI * 2);
  } else if (shapeType === "Hexagonal" || shapeType === "Hexagon") {
    const r = radius * 0.95;
    for (let i = 0; i < 6; i++) {
      const angle = (i * Math.PI) / 3 - Math.PI / 6;
      const x = centerX + r * Math.cos(angle);
      const y = centerY + r * Math.sin(angle);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
  } else if (shapeType === "Octagonal" || shapeType === "Octagon") {
    const r = radius * 0.95;
    for (let i = 0; i < 8; i++) {
      const angle = (i * Math.PI) / 4 - Math.PI / 8;
      const x = centerX + r * Math.cos(angle);
      const y = centerY + r * Math.sin(angle);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
  } else if (shapeType === "Star") {
    const spikes = 5;
    const outerRadius = radius * 0.95;
    const innerRadius = outerRadius * 0.45;
    let rot = (Math.PI / 2) * 3;
    const step = Math.PI / spikes;
    ctx.moveTo(centerX, centerY - outerRadius);
    for (let i = 0; i < spikes; i++) {
      let x = centerX + Math.cos(rot) * outerRadius;
      let y = centerY + Math.sin(rot) * outerRadius;
      ctx.lineTo(x, y);
      rot += step;
      x = centerX + Math.cos(rot) * innerRadius;
      y = centerY + Math.sin(rot) * innerRadius;
      ctx.lineTo(x, y);
      rot += step;
    }
  } else if (shapeType === "Scalloped Flower" || shapeType === "Scalloped") {
    const petals = 8;
    for (let i = 0; i < petals; i++) {
      const angle = (i * 2 * Math.PI) / petals;
      const nextAngle = ((i + 1) * 2 * Math.PI) / petals;
      const midAngle = (angle + nextAngle) / 2;
      const x1 = centerX + radius * 0.78 * Math.cos(angle);
      const y1 = centerY + radius * 0.78 * Math.sin(angle);
      const cx = centerX + radius * 1.05 * Math.cos(midAngle);
      const cy = centerY + radius * 1.05 * Math.sin(midAngle);
      const x2 = centerX + radius * 0.78 * Math.cos(nextAngle);
      const y2 = centerY + radius * 0.78 * Math.sin(nextAngle);
      if (i === 0) ctx.moveTo(x1, y1);
      ctx.quadraticCurveTo(cx, cy, x2, y2);
    }
  } else {
    // Wafer Sheet (Rectangle)
    const w = width - 28;
    const h = height - 40;
    ctx.roundRect(centerX - w / 2, centerY - h / 2, w, h, 12);
  }
  ctx.closePath();
};

export const PhotoCakeUploader = ({ onPhotoApply, currentPhotoUrl, currentShape = "Round", onClose }) => {
  const [imageSrc, setImageSrc] = useState(currentPhotoUrl || SAMPLE_PHOTO_PRESETS[0].url);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [shape, setShape] = useState(currentShape);
  const [borderStyle, setBorderStyle] = useState("gold_pearl"); // gold_pearl, chocolate_piping, lace, none
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [imageLoaded, setImageLoaded] = useState(false);

  const canvasRef = useRef(null);
  const imageObjRef = useRef(null);
  const fileInputRef = useRef(null);

  // Load image object with fallback
  useEffect(() => {
    if (!imageSrc) return;
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      imageObjRef.current = img;
      setImageLoaded(true);
      renderCanvas();
    };
    img.onerror = () => {
      console.warn("Failed to load image, using fallback:", imageSrc);
      if (imageSrc !== FALLBACK_PHOTO) {
        setImageSrc(FALLBACK_PHOTO);
      }
    };
    img.src = imageSrc;
  }, [imageSrc]);

  // Re-draw canvas whenever transforms or shapes change
  const renderCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const img = imageObjRef.current;
    if (!canvas || !img) return;

    const ctx = canvas.getContext("2d");
    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    ctx.save();

    // 1. Clip path according to selected shape
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) / 2 - 16;

    drawShapePath(ctx, shape, centerX, centerY, radius, width, height);
    ctx.clip();

    // 2. Draw Transformed Image
    ctx.translate(centerX + offsetX, centerY + offsetY);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(zoom, zoom);

    const aspect = img.width / img.height;
    let drawW = width;
    let drawH = width / aspect;
    if (drawH < height) {
      drawH = height;
      drawW = height * aspect;
    }

    ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);
    ctx.restore();

    // 3. Draw Decorative Edible Border Piping
    if (borderStyle !== "none") {
      ctx.save();
      drawShapePath(ctx, shape, centerX, centerY, radius, width, height);

      if (borderStyle === "gold_pearl") {
        ctx.strokeStyle = "#eab308";
        ctx.lineWidth = 6;
        ctx.setLineDash([4, 6]);
        ctx.shadowColor = "rgba(234, 179, 8, 0.6)";
        ctx.shadowBlur = 8;
      } else if (borderStyle === "chocolate_piping") {
        ctx.strokeStyle = "#382017";
        ctx.lineWidth = 7;
        ctx.shadowColor = "rgba(0,0,0,0.5)";
        ctx.shadowBlur = 6;
      } else if (borderStyle === "lace") {
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 4;
        ctx.setLineDash([2, 4]);
      }
      ctx.stroke();
      ctx.restore();
    }
  }, [shape, zoom, rotation, borderStyle, offsetX, offsetY]);

  useEffect(() => {
    if (imageLoaded) {
      renderCanvas();
    }
  }, [renderCanvas, imageLoaded]);

  // File Upload Handler
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please select a valid image file (PNG, JPG, WebP).");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert("Image size should be under 10MB for optimal edible print resolution.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      setImageSrc(uploadEvent.target.result);
      setOffsetX(0);
      setOffsetY(0);
      setRotation(0);
      setZoom(1);
    };
    reader.readAsDataURL(file);
  };

  // Drag to pan image
  const handleMouseDown = (e) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - offsetX, y: e.clientY - offsetY });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    setOffsetX(e.clientX - dragStart.x);
    setOffsetY(e.clientY - dragStart.y);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Save / Apply
  const handleApply = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    try {
      const processedUrl = canvas.toDataURL("image/png");
      if (onPhotoApply) {
        onPhotoApply({
          photoUrl: processedUrl,
          rawUrl: imageSrc,
          shape,
          zoom,
          rotation,
          borderStyle
        });
      }
      if (onClose) onClose();
    } catch (e) {
      console.error("Canvas export error:", e);
      if (onPhotoApply) {
        onPhotoApply({
          photoUrl: imageSrc,
          rawUrl: imageSrc,
          shape,
          zoom,
          rotation,
          borderStyle
        });
      }
      if (onClose) onClose();
    }
  };

  const SHAPE_MASKS = [
    { id: "Round", label: "⭕ Round" },
    { id: "Square", label: "⬛ Square" },
    { id: "Heart", label: "❤️ Heart" },
    { id: "Hexagonal", label: "🔷 Hexagon" },
    { id: "Octagonal", label: "🛑 Octagon" },
    { id: "Star", label: "⭐ Star" },
    { id: "Oval", label: "🥚 Oval" },
    { id: "Scalloped Flower", label: "🌸 Flower" },
    { id: "Wafer", label: "📜 Sheet" }
  ];

  return (
    <div
      style={{
        background: "var(--bg-card, #131722)",
        border: "1px solid var(--border-color, #2a324b)",
        borderRadius: "18px",
        padding: "1.8rem 2rem",
        color: "var(--text-primary, #ffffff)",
        boxShadow: "0 24px 48px rgba(0,0,0,0.6)",
        maxWidth: "840px",
        width: "100%",
        margin: "0 auto"
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.4rem" }}>
        <div>
          <h3 style={{ margin: 0, fontSize: "1.3rem", fontWeight: 800, color: "var(--gold-400, #fbbf24)", display: "flex", alignItems: "center", gap: "0.55rem" }}>
            <span>🖨️</span> Edible Photo Cake Canvas Studio
          </h3>
          <p style={{ margin: "0.3rem 0 0", fontSize: "0.84rem", color: "var(--text-muted, #94a3b8)" }}>
            High-definition edible sugar sheet printing. Crop, rotate, and project live onto your 3D cake!
          </p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            style={{
              background: "rgba(255,255,255,0.08)",
              border: "1px solid rgba(255,255,255,0.15)",
              color: "#cbd5e1",
              borderRadius: "50%",
              width: "36px",
              height: "36px",
              cursor: "pointer",
              fontSize: "1.1rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 0.2s"
            }}
          >
            ✕
          </button>
        )}
      </div>

      {/* Preset Quick Select Bar */}
      <div style={{ marginBottom: "1.4rem" }}>
        <div style={{ fontSize: "0.76rem", fontWeight: 700, color: "var(--text-secondary, #cbd5e1)", marginBottom: "0.55rem", letterSpacing: "0.04em" }}>
          QUICK INSPIRATION PRESETS OR UPLOAD YOUR OWN:
        </div>
        <div style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap", alignItems: "center" }}>
          {SAMPLE_PHOTO_PRESETS.map((p) => (
            <button
              key={p.name}
              type="button"
              onClick={() => {
                setImageSrc(p.url);
                setOffsetX(0);
                setOffsetY(0);
                setRotation(0);
                setZoom(1);
              }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.45rem",
                background: imageSrc === p.url ? "rgba(245, 158, 11, 0.22)" : "rgba(255, 255, 255, 0.05)",
                border: imageSrc === p.url ? "1.5px solid var(--gold-500, #f59e0b)" : "1px solid rgba(255, 255, 255, 0.12)",
                color: imageSrc === p.url ? "var(--gold-400, #fbbf24)" : "#cbd5e1",
                padding: "0.42rem 0.75rem",
                borderRadius: "10px",
                cursor: "pointer",
                fontSize: "0.78rem",
                fontWeight: imageSrc === p.url ? 700 : 500,
                transition: "all 0.2s ease"
              }}
            >
              <img
                src={p.url}
                alt={p.name}
                onError={(e) => { e.currentTarget.src = FALLBACK_PHOTO; }}
                style={{ width: "22px", height: "22px", borderRadius: "50%", objectFit: "cover" }}
              />
              <span>{p.name}</span>
            </button>
          ))}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.45rem",
              background: "linear-gradient(135deg, rgba(234, 179, 8, 0.25), rgba(225, 29, 72, 0.25))",
              border: "1.5px dashed var(--gold-400, #fbbf24)",
              color: "#fef08a",
              padding: "0.42rem 0.9rem",
              borderRadius: "10px",
              cursor: "pointer",
              fontSize: "0.78rem",
              fontWeight: 700
            }}
          >
            <span>📁 Upload Photo</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            onChange={handleFileUpload}
          />
        </div>
      </div>

      {/* Main Studio Interactive Layout */}
      <div style={{ display: "grid", gridTemplateColumns: "1.1fr 1fr", gap: "1.6rem", alignItems: "center" }}>
        {/* Canvas Work Area */}
        <div
          style={{
            position: "relative",
            background: "radial-gradient(circle at center, #1e2433 0%, #0b0e14 100%)",
            border: "1px solid #333d52",
            borderRadius: "14px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "1rem",
            boxShadow: "inset 0 0 30px rgba(0,0,0,0.7)",
            cursor: isDragging ? "grabbing" : "grab",
            userSelect: "none",
            minHeight: "310px"
          }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          <canvas
            ref={canvasRef}
            width={280}
            height={280}
            style={{
              filter: "drop-shadow(0 10px 20px rgba(0,0,0,0.6))",
              maxWidth: "100%",
              height: "auto"
            }}
          />

          <div
            style={{
              position: "absolute",
              bottom: "10px",
              left: "10px",
              background: "rgba(0,0,0,0.75)",
              backdropFilter: "blur(6px)",
              borderRadius: "6px",
              padding: "0.25rem 0.6rem",
              fontSize: "0.7rem",
              color: "#cbd5e1",
              border: "1px solid rgba(255,255,255,0.1)"
            }}
          >
            🖱️ Click & drag to pan
          </div>
        </div>

        {/* Transform & Shape Controls */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {/* Shape Mask Selector */}
          <div>
            <label style={{ fontSize: "0.76rem", fontWeight: 700, color: "var(--text-secondary, #cbd5e1)", display: "block", marginBottom: "0.45rem", letterSpacing: "0.04em" }}>
              CUT SHAPE MASK:
            </label>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "0.45rem" }}>
              {SHAPE_MASKS.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setShape(s.id)}
                  style={{
                    background: shape === s.id ? "var(--gold-500, #f59e0b)" : "rgba(255, 255, 255, 0.05)",
                    color: shape === s.id ? "#000000" : "#cbd5e1",
                    border: shape === s.id ? "none" : "1px solid rgba(255, 255, 255, 0.08)",
                    borderRadius: "8px",
                    padding: "0.45rem 0.3rem",
                    fontSize: "0.74rem",
                    fontWeight: 700,
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                  }}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Zoom Slider */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.76rem", marginBottom: "0.3rem" }}>
              <span style={{ color: "var(--text-secondary, #cbd5e1)" }}>🔍 Scale / Zoom</span>
              <strong style={{ color: "var(--gold-400, #fbbf24)" }}>{zoom.toFixed(2)}x</strong>
            </div>
            <input
              type="range"
              min="0.5"
              max="2.5"
              step="0.05"
              value={zoom}
              onChange={(e) => setZoom(parseFloat(e.target.value))}
              style={{ width: "100%", accentColor: "var(--gold-500, #f59e0b)", cursor: "pointer" }}
            />
          </div>

          {/* Rotate Slider */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.76rem", marginBottom: "0.3rem" }}>
              <span style={{ color: "var(--text-secondary, #cbd5e1)" }}>🔄 Rotation</span>
              <strong style={{ color: "var(--gold-400, #fbbf24)" }}>{rotation}°</strong>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
              <input
                type="range"
                min="-180"
                max="180"
                step="5"
                value={rotation}
                onChange={(e) => setRotation(parseInt(e.target.value, 10))}
                style={{ flex: 1, accentColor: "var(--gold-500, #f59e0b)", cursor: "pointer" }}
              />
              <button
                type="button"
                onClick={() => setRotation((prev) => (prev + 90) % 360)}
                style={{
                  background: "rgba(255,255,255,0.08)",
                  border: "1px solid rgba(255,255,255,0.2)",
                  color: "#ffffff",
                  borderRadius: "6px",
                  padding: "0.3rem 0.6rem",
                  fontSize: "0.75rem",
                  cursor: "pointer",
                  fontWeight: 600
                }}
                title="Rotate +90 degrees"
              >
                +90°
              </button>
            </div>
          </div>

          {/* Edible Piping Border Style */}
          <div>
            <label style={{ fontSize: "0.76rem", fontWeight: 700, color: "var(--text-secondary, #cbd5e1)", display: "block", marginBottom: "0.45rem", letterSpacing: "0.04em" }}>
              EDIBLE PIPING BORDER:
            </label>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "0.45rem" }}>
              {[
                { id: "gold_pearl", label: "✨ Gold Pearls" },
                { id: "chocolate_piping", label: "🍫 Ganache Shell" },
                { id: "none", label: "🚫 None" }
              ].map((b) => (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => setBorderStyle(b.id)}
                  style={{
                    background: borderStyle === b.id ? "rgba(245, 158, 11, 0.25)" : "rgba(255, 255, 255, 0.04)",
                    color: borderStyle === b.id ? "var(--gold-400, #fbbf24)" : "#cbd5e1",
                    border: borderStyle === b.id ? "1.5px solid var(--gold-500, #f59e0b)" : "1px solid rgba(255, 255, 255, 0.08)",
                    borderRadius: "8px",
                    padding: "0.45rem 0.3rem",
                    fontSize: "0.74rem",
                    fontWeight: 600,
                    cursor: "pointer",
                    transition: "all 0.15s ease"
                  }}
                >
                  {b.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "1.6rem", paddingTop: "1.2rem", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
        <button
          type="button"
          onClick={() => {
            if (onPhotoApply) onPhotoApply(null);
            if (onClose) onClose();
          }}
          style={{
            background: "transparent",
            border: "1px solid rgba(239, 68, 68, 0.4)",
            color: "#f87171",
            padding: "0.55rem 1.2rem",
            borderRadius: "10px",
            fontSize: "0.82rem",
            fontWeight: 600,
            cursor: "pointer",
            transition: "all 0.2s"
          }}
        >
          Remove Photo
        </button>

        <button
          type="button"
          onClick={handleApply}
          style={{
            background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
            color: "#000000",
            border: "none",
            borderRadius: "10px",
            padding: "0.65rem 1.6rem",
            fontSize: "0.88rem",
            fontWeight: 800,
            cursor: "pointer",
            boxShadow: "0 4px 18px rgba(245, 158, 11, 0.4)",
            display: "flex",
            alignItems: "center",
            gap: "0.45rem",
            transition: "transform 0.15s"
          }}
        >
          <span>✨ Project onto 3D Cake Tier</span>
        </button>
      </div>
    </div>
  );
};
