import express from "express";
import bcrypt from "bcryptjs";
import { verifiedUsers } from "../data/users.js";
import { generateToken } from "../config/jwt.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

// 1. Standard Automated Credentials Login (Role is auto-fetched, no selection required)
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

  // Check if account has verified their email
  if (user.isVerified === false) {
    return res.status(403).json({
      error: "Your email address is not yet verified. Please enter the verification OTP sent to your email.",
      requiresVerification: true,
      email: user.email,
      verificationCode: user.verificationCode // for simulation helper
    });
  }

  const token = generateToken(user);

  // Return safe user object (omit password & verificationCode)
  const { password: _, verificationCode: __, ...safeUser } = user;

  res.json({
    message: `Welcome back, ${user.name}! Authenticated as ${user.roleLabel || user.role}.`,
    token,
    user: safeUser
  });
});

// Role metadata mappings
const roleMeta = {
  super_admin: { label: "Super Admin", perms: ["all_access", "manage_users", "financial_audit", "system_settings", "api_keys"] },
  bakery_owner: { label: "Main Manager / Owner", perms: ["view_finances", "branch_analytics", "pricing_control", "supplier_contracts", "manage_users"] },
  manager: { label: "Branch Manager", perms: ["approve_production", "staff_shifts", "purchase_orders", "inventory_reorder", "pos_access"] },
  head_baker: { label: "Head Chef / Master Baker", perms: ["recipe_scaler", "batch_production", "fefo_consumption", "quality_inspection", "wastage_logging"] },
  chef: { label: "Pastry Chef", perms: ["recipe_scaler", "batch_production", "fefo_consumption", "quality_inspection"] },
  cashier: { label: "POS Cashier", perms: ["pos_billing", "thermal_invoice", "accept_payments", "daily_register_close"] },
  customer: { label: "Customer", perms: ["place_orders", "custom_cake_studio", "redeem_loyalty", "order_tracking"] }
};

// 1b. User Registration with Role Selection & Email Verification OTP
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
    if (existing.isVerified === false) {
      // Re-trigger OTP verification for existing unverified user
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      existing.verificationCode = otp;
      return res.status(200).json({
        message: "An unverified account exists with this email. Verification OTP has been resent.",
        requiresVerification: true,
        email: existing.email,
        verificationCode: otp
      });
    }
    return res.status(409).json({ error: "An account with this email already exists. Please sign in." });
  }

  const selectedRole = roleMeta[role] ? role : "customer";
  const hashedPassword = bcrypt.hashSync(password, 10);
  const verificationOtp = Math.floor(100000 + Math.random() * 900000).toString();

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
    isVerified: false,
    verificationCode: verificationOtp,
    permissions: roleMeta[selectedRole].perms
  };

  verifiedUsers.push(newUser);

  console.log(`[BakeSphere Auth] Verification OTP for ${newUser.email} is: ${verificationOtp}`);

  res.status(201).json({
    message: "Registration initiated! Please enter the 6-digit verification code sent to your email.",
    requiresVerification: true,
    email: newUser.email,
    verificationCode: verificationOtp
  });
});

// 1c. Email Verification
router.post("/verify-email", (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ error: "Email and 6-digit OTP code are required" });
  }

  const user = verifiedUsers.find(
    (u) => u.email.toLowerCase() === email.toLowerCase()
  );

  if (!user) {
    return res.status(404).json({ error: "Account not found for verification." });
  }

  if (user.isVerified) {
    const token = generateToken(user);
    const { password: _, verificationCode: __, ...safeUser } = user;
    return res.json({
      message: "Email is already verified! Logged in automatically.",
      token,
      user: safeUser
    });
  }

  // Allow test OTP '123456' as master debug fallback or the exact generated code
  if (user.verificationCode !== otp.trim() && otp.trim() !== "123456") {
    return res.status(400).json({ error: "Invalid verification code. Please check your email or resend OTP." });
  }

  user.isVerified = true;
  delete user.verificationCode;

  const token = generateToken(user);
  const { password: _, ...safeUser } = user;

  res.json({
    message: `Email verified successfully! Welcome to BakeSphere, ${user.name}.`,
    token,
    user: safeUser
  });
});

// 1d. Resend Verification OTP
router.post("/resend-otp", (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }

  const user = verifiedUsers.find(
    (u) => u.email.toLowerCase() === email.toLowerCase()
  );

  if (!user) {
    return res.status(404).json({ error: "Account not found" });
  }

  const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
  user.verificationCode = newOtp;
  console.log(`[BakeSphere Auth] Resent Verification OTP for ${user.email}: ${newOtp}`);

  res.json({
    message: "A new 6-digit verification code has been dispatched to your email.",
    email: user.email,
    verificationCode: newOtp
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
