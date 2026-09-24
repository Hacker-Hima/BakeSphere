import express from "express";
import bcrypt from "bcryptjs";
import { verifiedUsers } from "../data/users.js";
import { generateToken } from "../config/jwt.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

// 1. Standard Credentials Login
router.post("/login", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  const user = verifiedUsers.find(
    (u) => u.email.toLowerCase() === email.toLowerCase()
  );

  if (!user) {
    return res.status(401).json({ error: "Invalid credentials: User not found" });
  }

  const isMatch = bcrypt.compareSync(password, user.password);
  if (!isMatch) {
    return res.status(401).json({ error: "Invalid credentials: Incorrect password" });
  }

  const token = generateToken(user);

  // Return safe user object (omit password)
  const { password: _, ...safeUser } = user;

  res.json({
    message: "Login successful",
    token,
    user: safeUser
  });
});

// 1b. User Registration (New Account)
router.post("/register", (req, res) => {
  const { name, email, password, role = "customer", branchId = "BR-01", branchName = "Heritage Main (T. Nagar)" } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: "Name, email, and password are required" });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: "Password must be at least 6 characters long" });
  }

  const existing = verifiedUsers.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    return res.status(409).json({ error: "An account with this email already exists. Please sign in." });
  }

  const roleMeta = {
    super_admin: { label: "Super Admin", perms: ["all_access", "manage_users", "financial_audit", "system_settings", "api_keys"] },
    bakery_owner: { label: "Bakery Owner", perms: ["view_finances", "branch_analytics", "pricing_control", "supplier_contracts"] },
    manager: { label: "Branch Manager", perms: ["approve_production", "staff_shifts", "purchase_orders", "inventory_reorder", "pos_access"] },
    head_baker: { label: "Head Baker / Production", perms: ["recipe_scaler", "batch_production", "fefo_consumption", "quality_inspection", "wastage_logging"] },
    cashier: { label: "POS Cashier", perms: ["pos_billing", "thermal_invoice", "accept_payments", "daily_register_close"] },
    customer: { label: "Premium Customer", perms: ["place_orders", "custom_cake_studio", "redeem_loyalty", "order_tracking"] }
  };

  const selectedRole = roleMeta[role] ? role : "customer";
  const hashedPassword = bcrypt.hashSync(password, 10);

  const newUser = {
    id: verifiedUsers.length + 1,
    name: name.trim(),
    email: email.trim().toLowerCase(),
    password: hashedPassword,
    role: selectedRole,
    roleLabel: roleMeta[selectedRole].label,
    branchId: branchId || "BR-01",
    branchName: branchName || "Heritage Main (T. Nagar)",
    phone: req.body.phone || "+91 90000 00000",
    avatar: req.body.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(name)}`,
    loyaltyPoints: 100,
    tier: "Silver Baker",
    permissions: roleMeta[selectedRole].perms
  };

  verifiedUsers.push(newUser);

  const token = generateToken(newUser);
  const { password: _, ...safeUser } = newUser;

  res.status(201).json({
    message: "Registration successful",
    token,
    user: safeUser
  });
});

// 2. Google OAuth 2.0 Flow (Simulated & Token Handshake)
router.post("/google-oauth", (req, res) => {
  const { credential, email, name, avatar } = req.body;

  // Look up existing user or map to customer/provided profile
  let user = verifiedUsers.find(
    (u) => u.email.toLowerCase() === (email || "").toLowerCase()
  );

  if (!user) {
    // Create new OAuth customer account on the fly
    user = {
      id: verifiedUsers.length + 1,
      name: name || "Google User",
      email: email || `user_${Date.now()}@gmail.com`,
      role: "customer",
      roleLabel: "Google Verified Customer",
      branchId: "BR-01",
      branchName: "Heritage Main (T. Nagar)",
      avatar: avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      loyaltyPoints: 100, // Welcome gift points
      tier: "Silver Baker",
      permissions: ["place_orders", "custom_cake_studio", "redeem_loyalty"]
    };
    verifiedUsers.push(user);
  }

  const token = generateToken(user);
  const { password: _, ...safeUser } = user;

  res.json({
    message: "Google OAuth authentication successful",
    authProvider: "google",
    token,
    user: safeUser
  });
});

// 3. Get Current User Profile (JWT Authenticated)
router.get("/me", authenticateToken, (req, res) => {
  const user = verifiedUsers.find((u) => u.id === req.user.id);
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }
  const { password: _, ...safeUser } = user;
  res.json({ user: safeUser });
});

// 4. List All Demo Users (For Mentor 1-Click Role Testing)
router.get("/demo-users", (req, res) => {
  const demoAccounts = verifiedUsers.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    roleLabel: u.roleLabel,
    branchName: u.branchName,
    avatar: u.avatar,
    demoPassword: "Bakery@2026",
    permissions: u.permissions
  }));
  res.json(demoAccounts);
});

// 5. 1-Click Role Switcher Token Generator
router.post("/demo-switch", (req, res) => {
  const { role, email } = req.body;
  const user = verifiedUsers.find(
    (u) => (role && u.role === role) || (email && u.email.toLowerCase() === email.toLowerCase())
  ) || verifiedUsers[0];

  const token = generateToken(user);
  const { password: _, ...safeUser } = user;

  res.json({
    message: `Switched role to ${user.roleLabel}`,
    token,
    user: safeUser
  });
});

export default router;
