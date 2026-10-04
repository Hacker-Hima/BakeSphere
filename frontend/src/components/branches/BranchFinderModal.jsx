import { useState, useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useAuth } from "../../context/AuthContext.jsx";
import { BranchContactCard } from "./BranchContactCard.jsx";

const CHENNAI_PRESETS = [
  { name: "T. Nagar", lat: 13.0418, lng: 80.2341 },
  { name: "Anna Nagar", lat: 13.0850, lng: 80.2101 },
  { name: "Koyambedu", lat: 13.0694, lng: 80.1948 },
  { name: "OMR Thoraipakkam", lat: 12.9349, lng: 80.2312 },
  { name: "Velachery", lat: 12.9759, lng: 80.2212 },
  { name: "Adyar", lat: 13.0012, lng: 80.2565 },
  { name: "Mylapore", lat: 13.0368, lng: 80.2676 }
];

export const BranchFinderModal = ({ isOpen, onClose, onSelectBranch }) => {
  const { activeBranchId, switchBranch } = useAuth();
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState({
    lat: 13.0418,
    lng: 80.2341,
    name: "T. Nagar (Default)"
  });
  const [radiusFilter, setRadiusFilter] = useState("all");
  const [manualQuery, setManualQuery] = useState("");
  const [locating, setLocating] = useState(false);
  const [contactModalBranch, setContactModalBranch] = useState(null);
  const [selectedMapBranch, setSelectedMapBranch] = useState(null);

  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersLayerRef = useRef(null);

  // Fetch branches with distance calculation
  const fetchBranches = async (lat, lng, radius) => {
    setLoading(true);
    try {
      let url = `http://localhost:5000/api/branches?lat=${lat}&lng=${lng}&status=active`;
      if (radius && radius !== "all") {
        url += `&radius=${radius}`;
      }
      const res = await fetch(url);
      const data = await res.json();
      setBranches(data.branches || []);
      setLoading(false);
    } catch (err) {
      console.error("Failed to fetch branches:", err);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchBranches(userLocation.lat, userLocation.lng, radiusFilter);
    }
  }, [isOpen, userLocation.lat, userLocation.lng, radiusFilter]);

  // Initialize and update Leaflet Map
  useEffect(() => {
    if (!isOpen || !mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      // Create map instance
      const map = L.map(mapContainerRef.current, {
        center: [userLocation.lat, userLocation.lng],
        zoom: 12,
        zoomControl: true
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      }).addTo(map);

      markersLayerRef.current = L.layerGroup().addTo(map);
      mapInstanceRef.current = map;
    } else {
      mapInstanceRef.current.setView([userLocation.lat, userLocation.lng], 12);
    }

    // Clear old markers
    if (markersLayerRef.current) {
      markersLayerRef.current.clearLayers();

      // 1. Add User Location Marker
      const userIcon = L.divIcon({
        className: "custom-user-marker",
        html: `<div style="background:#3b82f6; width:22px; height:22px; border-radius:50%; border:3px solid #fff; box-shadow:0 0 12px #3b82f6; animation: pulse 1.5s infinite;"></div>`,
        iconSize: [22, 22],
        iconAnchor: [11, 11]
      });
      L.marker([userLocation.lat, userLocation.lng], { icon: userIcon })
        .addTo(markersLayerRef.current)
        .bindPopup(`<strong>Your Location</strong><br/>${userLocation.name}`);

      // 2. Add Branch Markers
      branches.forEach((b) => {
        const bLat = b.coordinates?.lat || 13.0418;
        const bLng = b.coordinates?.lng || 80.2341;
        const isCurrent = b.id === activeBranchId;

        const branchIcon = L.divIcon({
          className: "custom-branch-marker",
          html: `<div style="background:${isCurrent ? '#f59e0b' : '#10b981'}; color:#000; font-weight:800; font-size:11px; padding:4px 8px; border-radius:14px; border:2px solid #fff; box-shadow:0 3px 10px rgba(0,0,0,0.4); white-space:nowrap; display:flex; align-items:center; gap:4px;">
            <span>🥐</span> ${b.name.split(' ')[0]}
          </div>`,
          iconSize: [80, 26],
          iconAnchor: [40, 13]
        });

        const marker = L.marker([bLat, bLng], { icon: branchIcon }).addTo(markersLayerRef.current);
        marker.bindPopup(`
          <div style="font-family:sans-serif; min-width:180px;">
            <div style="font-weight:700; font-size:13px; color:#1e293b;">${b.name}</div>
            <div style="font-size:11px; color:#64748b; margin:2px 0 6px 0;">${b.locality}</div>
            <div style="font-size:11px; color:#f59e0b; font-weight:600; margin-bottom:4px;">★ ${b.rating || 4.8} • ${b.distanceText || ""}</div>
            <div style="font-size:10px; color:#475569; margin-bottom:8px;">${b.workingHours?.display || "06:00 AM – 10:30 PM"}</div>
            <div style="font-size:10px; color:#0284c7;">Specialty: ${b.specialty || "Artisan Bakes"}</div>
          </div>
        `);

        marker.on("click", () => {
          setSelectedMapBranch(b);
        });
      });
    }

    // Invalidate size to ensure container rendered properly
    setTimeout(() => {
      mapInstanceRef.current?.invalidateSize();
    }, 250);
  }, [isOpen, userLocation, branches, activeBranchId]);

  // Clean up map instance on modal close
  useEffect(() => {
    if (!isOpen && mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }
  }, [isOpen]);

  // Handle GPS detection
  const handleDetectGPS = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setUserLocation({
          lat: latitude,
          lng: longitude,
          name: "My GPS Location"
        });
        setLocating(false);
      },
      (err) => {
        console.warn("GPS error:", err.message);
        alert("Could not access your GPS coordinates. You can select a preset Chennai neighborhood below!");
        setLocating(false);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const handleSelectPreset = (preset) => {
    setUserLocation({
      lat: preset.lat,
      lng: preset.lng,
      name: preset.name
    });
    setManualQuery(preset.name);
  };

  const handleChooseBranch = (branch) => {
    switchBranch(branch.id, branch.name);
    if (onSelectBranch) onSelectBranch(branch);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: "rgba(0,0,0,0.85)",
      backdropFilter: "blur(8px)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 10000,
      padding: "1rem"
    }}>
      <div className="glass-panel" style={{
        maxWidth: "1100px",
        width: "100%",
        height: "90vh",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        border: "1px solid rgba(245, 158, 11, 0.35)",
        boxShadow: "0 25px 60px rgba(0,0,0,0.7)"
      }}>
        {/* Top Header */}
        <div style={{
          padding: "1.2rem 1.5rem",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "1rem"
        }}>
          <div>
            <div className="badge badge-gold" style={{ marginBottom: "0.2rem" }}>
              📍 Chennai Branch Locator
            </div>
            <h2 style={{ fontSize: "1.45rem", fontWeight: 800, color: "var(--text-primary)" }}>
              Find Nearest BakeSphere Bakery & Live Kitchen
            </h2>
          </div>
          <button
            onClick={onClose}
            style={{ background: "transparent", border: "none", color: "var(--text-muted)", fontSize: "1.6rem", cursor: "pointer" }}
          >
            ✕
          </button>
        </div>

        {/* Location & Radius Control Bar */}
        <div style={{
          padding: "0.9rem 1.5rem",
          background: "rgba(0, 0, 0, 0.35)",
          display: "flex",
          flexWrap: "wrap",
          gap: "0.9rem",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: "1px solid rgba(255,255,255,0.05)"
        }}>
          {/* GPS Detector & Manual Selection */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", flexWrap: "wrap" }}>
            <button
              onClick={handleDetectGPS}
              disabled={locating}
              className="bk-btn-hero-primary"
              style={{ padding: "0.5rem 1rem", fontSize: "0.8rem", display: "flex", alignItems: "center", gap: "0.4rem" }}
            >
              <span>{locating ? "⏳" : "📡"}</span>
              {locating ? "Detecting GPS..." : "Detect My Live GPS"}
            </button>

            <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>or choose neighborhood:</span>
            <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
              {CHENNAI_PRESETS.map((p) => (
                <button
                  key={p.name}
                  onClick={() => handleSelectPreset(p)}
                  style={{
                    padding: "0.28rem 0.65rem",
                    fontSize: "0.74rem",
                    borderRadius: "20px",
                    background: userLocation.name.includes(p.name) ? "var(--gold-400)" : "rgba(255,255,255,0.06)",
                    color: userLocation.name.includes(p.name) ? "#000" : "var(--text-secondary)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    cursor: "pointer",
                    fontWeight: userLocation.name.includes(p.name) ? 700 : 500
                  }}
                >
                  {p.name}
                </button>
              ))}
            </div>
          </div>

          {/* Distance Radius Filter */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>Distance Filter:</span>
            {["all", "1", "2", "5", "10"].map((r) => (
              <button
                key={r}
                onClick={() => setRadiusFilter(r)}
                style={{
                  padding: "0.28rem 0.6rem",
                  fontSize: "0.74rem",
                  borderRadius: "6px",
                  background: radiusFilter === r ? "#38bdf8" : "rgba(255,255,255,0.06)",
                  color: radiusFilter === r ? "#000" : "var(--text-secondary)",
                  border: "none",
                  cursor: "pointer",
                  fontWeight: 600
                }}
              >
                {r === "all" ? "All" : `≤ ${r} km`}
              </button>
            ))}
          </div>
        </div>

        {/* Main Content: Split Map + Branch List */}
        <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", flex: 1, minHeight: 0 }}>
          {/* Leaflet Map Frame */}
          <div style={{ position: "relative", width: "100%", height: "100%" }}>
            <div ref={mapContainerRef} style={{ width: "100%", height: "100%" }} />
            <div style={{
              position: "absolute",
              bottom: "12px",
              left: "12px",
              background: "rgba(0,0,0,0.75)",
              backdropFilter: "blur(4px)",
              padding: "0.4rem 0.8rem",
              borderRadius: "6px",
              fontSize: "0.72rem",
              color: "#fff",
              zIndex: 1000,
              border: "1px solid rgba(255,255,255,0.1)"
            }}>
              📍 Showing {branches.length} branches relative to: <strong>{userLocation.name}</strong>
            </div>
          </div>

          {/* Nearby Branches Scrollable List */}
          <div style={{
            overflowY: "auto",
            padding: "1.2rem",
            display: "flex",
            flexDirection: "column",
            gap: "1rem",
            background: "rgba(10, 10, 15, 0.4)"
          }}>
            {loading ? (
              <div style={{ textAlign: "center", padding: "3rem", color: "var(--gold-400)" }}>
                Scanning nearest bakery hubs & route distance...
              </div>
            ) : branches.length === 0 ? (
              <div style={{ textAlign: "center", padding: "3rem", color: "var(--text-muted)" }}>
                No branches found within {radiusFilter} km of {userLocation.name}. Try increasing the radius filter!
              </div>
            ) : (
              branches.map((b) => {
                const isCurrent = b.id === activeBranchId;
                const bLat = b.coordinates?.lat || 13.0418;
                const bLng = b.coordinates?.lng || 80.2341;
                const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${bLat},${bLng}`;

                return (
                  <div
                    key={b.id}
                    className="glass-panel"
                    style={{
                      padding: "1.2rem",
                      border: isCurrent ? "1.5px solid var(--gold-400)" : "1px solid rgba(255,255,255,0.08)",
                      background: isCurrent ? "rgba(245, 158, 11, 0.04)" : "rgba(255,255,255,0.02)"
                    }}
                  >
                    {/* Top Info */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.4rem" }}>
                      <div>
                        <h4 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--text-primary)" }}>
                          {b.name}
                        </h4>
                        <div style={{ fontSize: "0.76rem", color: "var(--text-muted)" }}>
                          📍 {b.locality}
                        </div>
                      </div>

                      {/* Distance Badge */}
                      <div style={{
                        background: "rgba(56, 189, 248, 0.15)",
                        color: "#38bdf8",
                        border: "1px solid rgba(56, 189, 248, 0.3)",
                        padding: "0.2rem 0.5rem",
                        borderRadius: "12px",
                        fontSize: "0.75rem",
                        fontWeight: 700
                      }}>
                        {b.distanceText || "Nearby"}
                      </div>
                    </div>

                    <p style={{ fontSize: "0.78rem", color: "var(--text-secondary)", marginBottom: "0.6rem", lineHeight: 1.4 }}>
                      {b.address}
                    </p>

                    <div style={{ fontSize: "0.75rem", color: "var(--gold-400)", marginBottom: "0.8rem" }}>
                      Signature: <strong>{b.specialty}</strong>
                    </div>

                    {/* Hours & Rating */}
                    <div style={{
                      display: "flex",
                      justifyContent: "space-between",
                      fontSize: "0.74rem",
                      color: "var(--text-muted)",
                      paddingBottom: "0.8rem",
                      borderBottom: "1px solid rgba(255,255,255,0.06)",
                      marginBottom: "0.8rem"
                    }}>
                      <span>🕒 {b.workingHours?.display || "06:00 AM – 10:30 PM"}</span>
                      <span style={{ color: "#fbbf24", fontWeight: 600 }}>★ {b.rating || 4.8} / 5.0</span>
                    </div>

                    {/* Action Buttons */}
                    <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                      {/* Select & Order from this branch */}
                      <button
                        onClick={() => handleChooseBranch(b)}
                        className="bk-btn-hero-primary"
                        style={{
                          flex: 1,
                          padding: "0.5rem",
                          fontSize: "0.78rem",
                          textAlign: "center",
                          background: isCurrent ? "var(--emerald-500)" : undefined
                        }}
                      >
                        {isCurrent ? "✓ Active Branch" : "Order from Here"}
                      </button>

                      {/* Contact Modal Trigger */}
                      <button
                        onClick={() => setContactModalBranch(b)}
                        className="bk-btn-secondary"
                        style={{ padding: "0.5rem 0.8rem", fontSize: "0.78rem" }}
                        title="Contact Phone / WhatsApp / Email"
                      >
                        📞 Contact
                      </button>

                      {/* GPS Driving Directions */}
                      <a
                        href={directionsUrl}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          padding: "0.5rem 0.8rem",
                          fontSize: "0.78rem",
                          textDecoration: "none",
                          background: "rgba(255,255,255,0.05)",
                          border: "1px solid rgba(255,255,255,0.1)",
                          borderRadius: "6px",
                          color: "var(--text-secondary)",
                          display: "flex",
                          alignItems: "center",
                          gap: "0.3rem"
                        }}
                        title="Open driving directions in Google Maps"
                      >
                        🧭 Map
                      </a>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Direct Branch Contact Card Modal */}
      <BranchContactCard
        branch={contactModalBranch}
        isOpen={Boolean(contactModalBranch)}
        onClose={() => setContactModalBranch(null)}
      />
    </div>
  );
};
