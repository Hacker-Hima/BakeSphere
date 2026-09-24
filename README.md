# BakeSphere 🍰

A modern full-stack web application for BakeSphere, structured with separate frontend and backend directories.

---

## Project Structure

```text
BakeSphere/
├── frontend/                # React 19 + Vite client application
│   ├── src/                 # UI components, pages, and assets
│   ├── public/              # Static public assets
│   ├── package.json         # Frontend dependencies & scripts
│   └── vite.config.js       # Vite configuration
│
├── backend/                 # Node.js + Express REST API
│   ├── src/
│   │   ├── routes/          # Express API route endpoints (/api)
│   │   ├── data/            # Mock bakery dataset
│   │   └── server.js        # Express application entry point
│   ├── .env.example         # Environment template
│   ├── .env                 # Environment config (PORT=5000)
│   └── package.json         # Backend dependencies & scripts
│
├── package.json             # Root monorepo scripts
└── README.md
```

---

## Quick Start

### 1. Install All Dependencies

From the root directory:
```bash
npm run install:all
```
*(Or install individually inside `frontend/` and `backend/` using `npm install`)*

---

### 2. Run the Applications

You can run them from the root directory using the convenience scripts:

- **Start Frontend (Vite dev server on `http://localhost:5173`)**:
  ```bash
  npm run dev:frontend
  ```

- **Start Backend (Express API server on `http://localhost:5000`)**:
  ```bash
  npm run dev:backend
  ```

---

## Backend API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/` | API status & endpoint overview |
| `GET` | `/api/health` | Health check endpoint |
| `GET` | `/api/products` | Get bakery products (supports `?category=` & `?search=`) |
| `GET` | `/api/products/:id` | Get details of a single product |
| `POST` | `/api/orders` | Place a mock bakery order |
