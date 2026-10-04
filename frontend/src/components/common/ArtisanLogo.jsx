export const ArtisanLogo = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 280 120"
      className="bk-logo-artisan-svg"
      role="img"
      aria-label="BakeSphere Artisan Bakery"
    >
      <defs>
        <linearGradient id="goldCaramel" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ea580c" />
          <stop offset="35%" stopColor="#d97706" />
          <stop offset="70%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#b45309" />
        </linearGradient>
        <linearGradient id="wheatGold" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#b45309" />
          <stop offset="50%" stopColor="#d97706" />
          <stop offset="100%" stopColor="#fbbf24" />
        </linearGradient>
      </defs>

      {/* ════════ Top Center: Artisan Chef Toque / Hat with Steam Swirl ════════ */}
      <g transform="translate(97, 8) scale(0.92)">
        {/* Delicate Steam Swirl */}
        <path
          d="M42 2 C44 -4, 49 -4, 51 0 C53 4, 58 4, 60 0"
          fill="none"
          stroke="url(#goldCaramel)"
          strokeWidth="2.2"
          strokeLinecap="round"
          opacity="0.95"
        />

        {/* Hat Toque Puff Shells */}
        <path
          d="M22 28 C16 28, 11 22, 13 16 C15 10, 23 9, 27 12 C29 4, 41 1, 48 6 C55 1, 67 4, 69 12 C73 9, 81 10, 83 16 C85 22, 80 28, 74 28 Z"
          fill="rgba(245, 158, 11, 0.16)"
          stroke="url(#goldCaramel)"
          strokeWidth="2.8"
          strokeLinejoin="round"
          strokeLinecap="round"
        />

        {/* Vertical Fold Accents on Hat */}
        <path
          d="M35 28 C33 20, 35 14, 37 10"
          fill="none"
          stroke="url(#goldCaramel)"
          strokeWidth="1.8"
          strokeLinecap="round"
          opacity="0.75"
        />
        <path
          d="M48 28 C48 18, 48 12, 48 8"
          fill="none"
          stroke="url(#goldCaramel)"
          strokeWidth="2.2"
          strokeLinecap="round"
          opacity="0.85"
        />
        <path
          d="M61 28 C63 20, 61 14, 59 10"
          fill="none"
          stroke="url(#goldCaramel)"
          strokeWidth="1.8"
          strokeLinecap="round"
          opacity="0.75"
        />

        {/* Hat Base Band */}
        <rect
          x="20"
          y="28"
          width="56"
          height="5.5"
          rx="2.75"
          fill="url(#goldCaramel)"
        />
      </g>

      {/* ════════ Main Wordmark: BakeSphere in rich dark cocoa serif ════════ */}
      <g transform="translate(18, 78)">
        <text
          fontFamily="'Playfair Display', Georgia, 'Times New Roman', serif"
          fontSize="39"
          fontWeight="900"
          fill="#2a140a"
          letterSpacing="-0.015em"
        >
          BakeSphere
        </text>
      </g>

      {/* ════════ Golden Wheat Stalk Sprig angled to the right of 'Sphere' ════════ */}
      <g transform="translate(223, 40) rotate(28) scale(0.72)">
        {/* Central curved stem */}
        <path
          d="M0 45 Q5 22, 10 0"
          fill="none"
          stroke="url(#wheatGold)"
          strokeWidth="2.2"
          strokeLinecap="round"
        />
        {/* Wheat grains/kernels */}
        <ellipse
          cx="10"
          cy="-2"
          rx="3.2"
          ry="6"
          transform="rotate(10 10 -2)"
          fill="url(#wheatGold)"
        />
        <ellipse
          cx="5"
          cy="8"
          rx="3.4"
          ry="6.8"
          transform="rotate(-30 5 8)"
          fill="url(#wheatGold)"
        />
        <ellipse
          cx="14"
          cy="7"
          rx="3.4"
          ry="6.8"
          transform="rotate(35 14 7)"
          fill="url(#wheatGold)"
        />
        <ellipse
          cx="4"
          cy="18"
          rx="3.5"
          ry="7.2"
          transform="rotate(-32 4 18)"
          fill="url(#wheatGold)"
        />
        <ellipse
          cx="13"
          cy="17"
          rx="3.5"
          ry="7.2"
          transform="rotate(35 13 17)"
          fill="url(#wheatGold)"
        />
        <ellipse
          cx="3"
          cy="28"
          rx="3.3"
          ry="6.8"
          transform="rotate(-34 3 28)"
          fill="url(#wheatGold)"
        />
        <ellipse
          cx="12"
          cy="27"
          rx="3.3"
          ry="6.8"
          transform="rotate(35 12 27)"
          fill="url(#wheatGold)"
        />
        <ellipse
          cx="2"
          cy="38"
          rx="3"
          ry="5.8"
          transform="rotate(-35 2 38)"
          fill="url(#wheatGold)"
        />
        <ellipse
          cx="10"
          cy="37"
          rx="3"
          ry="5.8"
          transform="rotate(35 10 37)"
          fill="url(#wheatGold)"
        />
        {/* Delicate awns / whiskers */}
        <path
          d="M10 -6 L12 -15 M7 5 L1 -5 M15 4 L22 -6 M5 15 L-2 7 M15 14 L23 6"
          fill="none"
          stroke="url(#wheatGold)"
          strokeWidth="1.3"
          strokeLinecap="round"
          opacity="0.85"
        />
      </g>

      {/* ════════ Subtitle: — ARTISAN BAKERY — ════════ */}
      <g transform="translate(140, 105)">
        {/* Left gold hairline rule */}
        <line
          x1="-106"
          y1="-4"
          x2="-62"
          y2="-4"
          stroke="url(#goldCaramel)"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
        {/* Center text */}
        <text
          textAnchor="middle"
          fontFamily="'Outfit', 'Inter', -apple-system, sans-serif"
          fontSize="9.5"
          fontWeight="800"
          fill="#92400e"
          letterSpacing="0.28em"
        >
          ARTISAN BAKERY
        </text>
        {/* Right gold hairline rule */}
        <line
          x1="62"
          y1="-4"
          x2="106"
          y2="-4"
          stroke="url(#goldCaramel)"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      </g>
    </svg>
  );
};
