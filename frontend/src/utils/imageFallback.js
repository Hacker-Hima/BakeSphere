// High-availability SVG bakery placeholder for when external Unsplash images are slow or blocked
export const DEFAULT_BAKERY_IMAGE = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400" fill="none">
  <rect width="600" height="400" fill="%23fff1f2"/>
  <rect x="20" y="20" width="560" height="360" rx="16" fill="%23fdfaf7" stroke="%23fecdd3" stroke-width="2" stroke-dasharray="8 8"/>
  <g transform="translate(230, 110)">
    <path d="M70 20 C60 0 80 0 70 -15" stroke="%23f59e0b" stroke-width="4" stroke-linecap="round" fill="none"/>
    <path d="M50 20 C40 5 60 5 50 -10" stroke="%23f59e0b" stroke-width="4" stroke-linecap="round" fill="none"/>
    <path d="M90 20 C80 5 100 5 90 -10" stroke="%23f59e0b" stroke-width="4" stroke-linecap="round" fill="none"/>
    <rect x="20" y="70" width="100" height="45" rx="6" fill="%23c8102e"/>
    <rect x="35" y="40" width="70" height="30" rx="6" fill="%23e11d48"/>
    <circle cx="70" cy="30" r="10" fill="%23fbbf24"/>
    <path d="M20 70 Q30 80 40 70 Q50 80 60 70 Q70 80 80 70 Q90 80 100 70 Q110 80 120 70" stroke="%23ffffff" stroke-width="4" fill="none"/>
  </g>
  <text x="300" y="260" font-family="'Outfit', sans-serif" font-size="20" font-weight="700" fill="%23881337" text-anchor="middle">BakeSphere Fresh Patisserie</text>
  <text x="300" y="290" font-family="'Outfit', sans-serif" font-size="14" font-weight="500" fill="%239c8e82" text-anchor="middle">100% Freshly Baked Everyday</text>
</svg>`;

export const handleImageError = (e) => {
  e.currentTarget.onerror = null;
  e.currentTarget.src = DEFAULT_BAKERY_IMAGE;
};

export const getSafeImageUrl = (url) => {
  if (!url || typeof url !== "string" || url.trim() === "") {
    return DEFAULT_BAKERY_IMAGE;
  }
  return url;
};
