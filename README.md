# 🥐 BakeSphere — Enterprise Artisanal Patisserie & Bakery ERP Platform

[![React](https://img.shields.io/badge/Frontend-React_19_+_Vite-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![NodeJS](https://img.shields.io/badge/Backend-Node.js_+_Express-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Database](https://img.shields.io/badge/Database-MongoDB_Atlas-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![AI](https://img.shields.io/badge/AI_Engine-Google_Gemini_Flash-4285F4?logo=google&logoColor=white)](https://aistudio.google.com/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

> **BakeSphere** is an end-to-end, enterprise-grade cloud patisserie and bakery management suite. Combining a modern consumer e-commerce storefront with 9 mission-critical enterprise ERP modules, touchscreen POS billing, an interactive 3D Custom Cake Studio, mathematical recipe scaling, FEFO inventory tracking, and **Chef Pierre** — a multi-intent, voice-enabled AI concierge powered by **Google Gemini Flash** and a resilient semantic NLP engine.

---

## 📑 Table of Contents

- [Architectural Overview](#-architectural-overview)
- [Enterprise Modules & Capabilities](#-enterprise-modules--capabilities)
- [Chef Pierre AI Assistant & Voice Concierge](#-chef-pierre-ai-assistant--voice-concierge)
- [Role-Based Access Control & Demo Accounts](#-role-based-access-control--demo-accounts)
- [Technology Stack](#-technology-stack)
- [Quick Start Guide](#-quick-start-guide)
- [Configuration & Environment Variables](#-configuration--environment-variables)
- [REST API Reference](#-rest-api-reference)
- [Project Directory Structure](#-project-directory-structure)
- [Contributing & License](#-contributing--license)

---

## 🏛 Architectural Overview

```
                      ┌────────────────────────────────────────┐
                      │        BakeSphere Single Page App      │
                      │       (React 19 + Vite + CSS3)         │
                      └──────────────────┬─────────────────────┘
                                         │ REST & Web Speech API
                                         ▼
                      ┌────────────────────────────────────────┐
                      │       Node.js & Express REST API       │
                      │         (Port 5000 / Modular)          │
                      └───────┬────────────────────────┬───────┘
                              │                        │
             ┌────────────────▼────────┐      ┌────────▼────────────────┐
             │    MongoDB Atlas Store   │      │    Google Gemini Flash   │
             │   (With In-Memory Fallback)│    │   (AI Concierge & Chat) │
             └─────────────────────────┘      └─────────────────────────┘
```

---

## ✨ Enterprise Modules & Capabilities

### 1. 🍰 Bakingo Online Storefront & Consumer Experience
- **72+ Handcrafted Bakery Treats**: Signature chocolate truffle cakes, French butter croissants, artisan sourdough boules, hot savory puffs, and Punjabi samosas.
- **7 Major Delivery Hubs**: Seamless city coverage across **Chennai (Flagship)**, **Bangalore**, **Delhi NCR**, **Mumbai**, **Hyderabad**, **Pune**, and **Kolkata**.
- **Flexible Delivery Speeds**: Choose between **2-Hour Standard Express** or **12:00 AM Midnight Surprise** delivery.
- **Promotional Coupon Engine**: Instant validation for vouchers like `SWEET15` (15% OFF celebration cakes), `BAKE50` (Flat ₹50 OFF on savories), and `FREESHIP` (Free express delivery on orders over ₹799).
- **Interactive Cart & Wishlist**: Real-time slide-out cart drawer, dynamic weight selectors (0.5kg to 2.0kg), and eggless dietary filters.

### 2. 🛒 Touchscreen POS Billing & Thermal GST Invoicing
- **Fast Cashier Terminal**: Barcode scanning, quick item addition, category quick-filters, and custom item adjustments.
- **Automated Tax Calculation**: Configurable GST brackets (5%, 12%, 18%) with itemized subtotal calculations.
- **Multi-Payment Settlement**: Support for instant **UPI QR Codes** (PhonePe / GPay / Paytm), **Credit/Debit Cards**, and **Counter Cash**.
- **Thermal Invoicing Engine**: Print-ready GST invoices with tax breakdown, cashier signatures, and order identifiers.

### 3. 🎂 Interactive 3D Custom Cake Studio
- **Multi-Tier Visualizer**: Real-time parametric 3D rendering for 1, 2, or 3 celebration tiers.
- **Custom Flavor Combinations**: Madagascar Vanilla, Belgian Dark Cocoa, Crimson Red Velvet, and Funfetti.
- **Frostings & Accents**: Silky Swiss Meringue, White Chocolate Cream Cheese, 24K Edible Gold ganache, and Salted Caramel drip.
- **Artisanal 3D Toppers**: Golden birthday plaques, sparklers, and sugar flower cascades with dynamic live weight and price calculation.

### 4. ⚖️ Mathematical Master Recipe Scaler
- **Dynamic Batch Proportions**: Mathematical batch scaling for flour, butter, sugar, and yeast from 50 to 500 pastry units.
- **Baker's Percentages & Yield Optimization**: Precise gram-level ratios ensuring structural integrity and crumb softness across batch sizes.
- **Oven Timers & Proofing Schedules**: Real-time kitchen queue telemetry with temperature clinics.

### 5. ⏳ FEFO Inventory & Perishables Tracker
- **First-Expired-First-Out (FEFO)**: Batch tracking for perishable flours, dairy butter, and Belgian chocolate callets.
- **Automated Reorder Thresholds**: Critical ingredient alerts before safety stock falls below production requirements.
- **Wastage Prevention Studio**: Reduces scrap and perishable loss with actionable markdown strategies.

### 6. 📈 AI Predictive Demand Forecaster
- **Surge Modeling**: Weekend surge projections (+35% celebration event boost) and Navaratri/festive pre-season demand tracking.
- **Model Confidence**: 93.8% model accuracy forecasting next-day unit turnover and projected gross revenue.

### 7. 🏪 Multi-Branch Telemetry & Asset Oversight
- **Real-Time Branch Metrics**: Telemetry across Chennai operations:
  - 📍 **Heritage Main Bakery (T. Nagar)**: ₹48,550 today (Target: ₹12.0L · 74.5% achieved)
  - 📍 **Anna Nagar Flagship**: ₹39,420 today (Target: ₹9.5L · 74.9% achieved)
  - 📍 **Koyambedu Express Hub**: ₹28,900 today (Target: ₹7.0L · 77.1% achieved)
  - 📍 **OMR Cloud Kitchen & Master Production**: ₹62,100 today (Target: ₹15.0L · 78.7% achieved)
- **Equipment Health Monitoring**: Deck ovens, spiral dough mixers, blast freezers, and proofing chambers telemetry.

---

## 👨‍🍳 Chef Pierre AI Assistant & Voice Concierge

BakeSphere features an intelligent culinary concierge named **Chef Pierre**, equipped with:
- **Google Gemini 2.0 / 1.5 Flash Support**: Seamlessly communicates with Google Generative AI when an API key is provided.
- **Zero-Spam Multi-Intent Semantic NLP Engine**: Works 100% locally and offline without external dependencies, accurately handling:
  - **Top Sellers & Bestsellers**: Shows customer favorites with live prices, ratings, and eggless tags.
  - **Live Product Search**: Identifies chocolate cakes, sourdough, croissants, and savories from the database.
  - **Baking Troubleshooting Clinic**: Explains why cakes sink, how to fix separated ganache, oven temperatures, and eggless substitutes.
  - **Order Tracking**: Looks up real status for orders (`BS-1024`, `BS-1025`, `BS-1026`) and delivery partners.
  - **Branch Sales Telemetry**: Delivers real-time executive sales and channel breakdowns to managers while politely protecting financial data from regular guests.
- **Web Speech API Voice Recognition**: Full speech-to-text voice typing using the floating microphone button.

---

## 🔐 Role-Based Access Control & Demo Accounts

BakeSphere implements strict Role-Based Access Control (RBAC) across 6 distinct organizational tiers. Use any of the pre-configured credentials below for testing:

| Role | Email | Password | Access Privileges |
| :--- | :--- | :--- | :--- |
| **Super Admin** | `admin@bakesphere.com` | `Bakery@2026` | Full system command across all 9 enterprise modules, user management, and security audits |
| **Bakery Owner** | `owner@bakesphere.com` | `Bakery@2026` | Executive financial dashboards, P&L velocity, cross-branch KPIs, and inventory POs |
| **Branch Manager** | `manager@bakesphere.com` | `Bakery@2026` | Branch-specific telemetry, storefront POS oversight, cash registers, and production approvals |
| **Head Baker** | `baker@bakesphere.com` | `Bakery@2026` | Master recipe scaler, proofing queues, batch production, and ingredient stock audits |
| **Pastry Chef** | `chef@bakesphere.com` | `Bakery@2026` | Recipe execution, oven queues, custom cake assembly, and quality standard clinics |
| **POS Cashier** | `cashier@bakesphere.com` | `Bakery@2026` | Fast touchscreen terminal, barcode additions, UPI checkouts, and thermal GST invoice printing |
| **Customer** | `customer@bakesphere.com` | `Bakery@2026` | Online storefront, 3D custom cake visualizer, active coupons, and order tracking |

---

## 💻 Technology Stack

### Frontend Client
- **Framework**: [React 19](https://react.dev/) + [Vite](https://vitejs.dev/) (Lightning-fast HMR)
- **Styling**: Handcrafted modern CSS3 design system (Glassmorphism, CSS variables, vibrant culinary palette, micro-animations)
- **Icons & Effects**: [Lucide React](https://lucide.dev/), Canvas-Confetti
- **Voice Typing**: HTML5 Web Speech API (`SpeechRecognition` & `webkitSpeechRecognition`)

### Backend Services
- **Runtime**: [Node.js](https://nodejs.org/) (ES Modules)
- **Framework**: [Express 4](https://expressjs.com/) REST API
- **Database**: [Mongoose](https://mongoosejs.com/) + MongoDB Atlas (with automatic in-memory fallback for offline operation)
- **Security**: JSON Web Tokens (`jsonwebtoken`), `bcryptjs`, CORS
- **Generative AI**: Native Google Gemini API integration (`gemini-2.0-flash` / `gemini-1.5-flash`)

---

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js**: v18.0.0 or higher (v20+ recommended)
- **npm**: v9.0.0 or higher
- **Git**

### 1. Clone the Repository
```bash
git clone https://github.com/Hacker-Hima/BakeSphere.git
cd BakeSphere
```

### 2. Install Dependencies
You can install dependencies across the monorepo from the root directory:
```bash
npm run install:all
```
*(Or install manually inside `backend/` and `frontend/`)*:
```bash
cd backend && npm install
cd ../frontend && npm install
```

### 3. Configure Environment Variables
Inside `backend/.env` (a template is provided in `backend/.env.example`):
```env
PORT=5000
NODE_ENV=development
JWT_SECRET=bakesphere_super_secret_jwt_key_2026

# MongoDB Atlas (Optional - Falls back to in-memory store if omitted)
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster-url>/bakesphere?retryWrites=true&w=majority

# Google Gemini Flash AI (Optional - Enables live Generative AI chat)
GEMINI_API_KEY=your_gemini_api_key_here
```

### 4. Run the Development Servers
From the root directory:
```bash
# Start backend API (http://localhost:5000)
npm run dev:backend

# Start frontend application (http://localhost:5173)
npm run dev:frontend
```

Now open [http://localhost:5173](http://localhost:5173) in your web browser.

---

## 📡 REST API Reference

| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/` | API status, module catalog, and server health | Public |
| `GET` | `/api/health` | Database connection telemetry and server status | Public |
| `POST` | `/api/auth/login` | Authenticate user & issue JWT token with permissions | Public |
| `GET` | `/api/products` | Retrieve catalog (supports `?category=`, `?search=`, `?eggless=`) | Public |
| `GET` | `/api/products/:id` | Detailed SKU information, weight options, and allergens | Public |
| `POST` | `/api/ai/chatbot` | **Chef Pierre AI Assistant** query (Gemini / Semantic NLP) | Public / Role-Aware |
| `GET` | `/api/ai/forecast` | Predictive ML demand forecasting for peak surges | Staff |
| `GET` | `/api/ai/waste-risk` | Perishable wastage reduction and markdown actions | Staff |
| `GET` | `/api/recipes` | Master recipe collection with baseline yields | Staff |
| `POST` | `/api/recipes/scale` | Dynamic mathematical batch flour/sugar scaler | Staff |
| `GET` | `/api/inventory` | FEFO tracked raw ingredients & reorder threshold alerts | Staff |
| `POST` | `/api/pos/orders` | Process point-of-sale transaction & issue GST receipt | Staff |
| `POST` | `/api/custom-cakes` | Save 3D custom cake configuration and calculate pricing | Public |
| `GET` | `/api/analytics` | Executive turnover, payment mixes, and category shares | Management |
| `GET` | `/api/equipment` | Branch machinery telemetry and maintenance schedules | Management |

---

## 📂 Project Directory Structure

```text
BakeSphere/
├── backend/
│   ├── src/
│   │   ├── config/              # MongoDB connection & fallback setup
│   │   ├── data/                # Products, recipes, ingredients, orders, branches
│   │   ├── models/              # Mongoose database models
│   │   ├── routes/              # Express API route handlers
│   │   │   ├── aiRoutes.js      # Chef Pierre AI, forecasting & wastage routes
│   │   │   ├── authRoutes.js    # JWT RBAC authentication
│   │   │   ├── posRoutes.js     # POS billing & invoice generation
│   │   │   └── productRoutes.js # Catalog endpoints
│   │   └── server.js            # Express application entry point
│   ├── .env                     # Local environment configuration
│   ├── .env.example             # Configuration template
│   └── package.json
│
├── frontend/
│   ├── public/                  # Product imagery & static assets
│   ├── src/
│   │   ├── components/
│   │   │   ├── auth/            # Login modal & role authentication portal
│   │   │   ├── common/          # ChatbotModal (Chef Pierre AI), Navigation
│   │   │   ├── customCake/      # 3D Custom Cake Studio builder
│   │   │   ├── dashboard/       # Executive management dashboards
│   │   │   ├── inventory/       # FEFO stock manager & reorder alerts
│   │   │   ├── pos/             # Touchscreen POS Billing terminal
│   │   │   ├── production/      # Recipe scaler & oven proofing queues
│   │   │   └── shop/            # Storefront catalog, cart & city selector
│   │   ├── context/             # AuthContext, CartContext, ThemeContext
│   │   ├── App.jsx              # Main application router
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
│
├── package.json                 # Monorepo convenience scripts
└── README.md                    # Project documentation
```

---

## 🤝 Contributing & License

Contributions, feature suggestions, and feedback are welcome!
1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

Distributed under the **MIT License**. See `LICENSE` for more information.

---

<div align="center">
  Crafted with passion for culinary excellence and seamless bakery operations 🍰
</div>
