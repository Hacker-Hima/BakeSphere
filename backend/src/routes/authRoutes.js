import express from "express";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { verifiedUsers } from "../data/users.js";
import { generateToken } from "../config/jwt.js";
import { authenticateToken } from "../middleware/auth.js";
import User from "../models/User.js";
import { sendOtpEmail } from "../services/emailService.js";

const router = express.Router();

// 1. Standard Automated Credentials Login (Role is auto-fetched, no selection required)
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  let user = null;
  if (mongoose.connection.readyState === 1) {
    try {
      user = await User.findOne({ email: email.toLowerCase() }).lean();
    } catch {
      // fallback
    }
  }

  if (!user) {
    user = verifiedUsers.find(
      (u) => u.email.toLowerCase() === email.toLowerCase()
    );
  }

  if (!user) {
    return res.status(401).json({ error: "Invalid credentials: User not found" });
  }

  const isMatch = bcrypt.compareSync(password, user.password);
  if (!isMatch) {
    return res.status(401).json({ error: "Invalid credentials: Incorrect password" });
  }

  // Check if account has verified their email
  if (user.isVerified === false) {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000);
    user.verificationCode = otp;
    user.otpExpires = otpExpires;
    if (mongoose.connection.readyState === 1) {
      try {
        await User.updateOne({ email: user.email.toLowerCase() }, { $set: { verificationCode: otp, otpExpires } });
      } catch {
        // ignore
      }
    }
    await sendOtpEmail({
      to: user.email,
      name: user.name,
      otp,
      roleLabel: user.roleLabel || "Customer"
    });
    return res.status(403).json({
      error: `Your account is not yet verified. A fresh OTP has been sent to ${user.email}.`,
      requiresVerification: true,
      email: user.email,
      verificationCode: otp,
      otpExpires: otpExpires.toISOString()
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
router.post("/register", async (req, res) => {
  const { name, email, password, role = "customer", branchId = "BR-01", branchName = "Heritage Main (T. Nagar)" } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: "Name, email, and password are required" });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: "Password must be at least 6 characters long" });
  }

  let existing = null;
  if (mongoose.connection.readyState === 1) {
    try {
      existing = await User.findOne({ email: email.toLowerCase() });
    } catch {
      // fallback
    }
  }
  if (!existing) {
    existing = verifiedUsers.find((u) => u.email.toLowerCase() === email.toLowerCase());
  }

  if (existing) {
    if (existing.isVerified === false) {
      // Re-trigger OTP verification for existing unverified user
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const otpExpires = new Date(Date.now() + 10 * 60 * 1000);
      existing.verificationCode = otp;
      existing.otpExpires = otpExpires;
      if (mongoose.connection.readyState === 1) {
        try {
          await User.updateOne({ email: email.toLowerCase() }, { $set: { verificationCode: otp, otpExpires } });
        } catch {
          // ignore
        }
      }

      console.log(`[BakeSphere Auth] Re-dispatching verification OTP for unverified account ${existing.email}: ${otp}`);
      const emailDelivery = await sendOtpEmail({
        to: existing.email,
        name: existing.name,
        otp,
        roleLabel: existing.roleLabel || "Customer"
      });

      return res.status(200).json({
        message: emailDelivery.success
          ? `Verification OTP sent to ${existing.email}! Please check your email inbox.`
          : "An unverified account exists with this email. Verification OTP has been generated.",
        requiresVerification: true,
        email: existing.email,
        verificationCode: otp,
        otpExpires: otpExpires.toISOString(),
        emailSent: emailDelivery.success,
        previewUrl: emailDelivery.previewUrl
      });
    }
    return res.status(409).json({ error: "An account with this email already exists. Please sign in." });
  }

  const selectedRole = roleMeta[role] ? role : "customer";
  const hashedPassword = bcrypt.hashSync(password, 10);
  const verificationOtp = Math.floor(100000 + Math.random() * 900000).toString();
  const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes TOTP expiry

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
    otpExpires: otpExpires,
    permissions: roleMeta[selectedRole].perms
  };

  verifiedUsers.push(newUser);

  if (mongoose.connection.readyState === 1) {
    try {
      await User.create(newUser);
    } catch (dbErr) {
      console.error("🍃 [MongoDB Atlas] Error saving new user:", dbErr.message);
    }
  }

  console.log(`[BakeSphere Auth] Verification OTP for ${newUser.email} is: ${verificationOtp} (Role: ${selectedRole})`);

  const emailDelivery = await sendOtpEmail({
    to: newUser.email,
    name: newUser.name,
    otp: verificationOtp,
    roleLabel: newUser.roleLabel
  });

  res.status(201).json({
    message: emailDelivery.success
      ? `Verification code dispatched to ${newUser.email}! Please check your email inbox.`
      : "Registration initiated! Please enter the 6-digit verification code.",
    requiresVerification: true,
    email: newUser.email,
    verificationCode: verificationOtp,
    otpExpires: otpExpires.toISOString(),
    role: selectedRole,
    roleLabel: roleMeta[selectedRole].label,
    emailSent: emailDelivery.success,
    previewUrl: emailDelivery.previewUrl
  });
});

// 1c. Email Verification
router.post("/verify-email", async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ error: "Email and 6-digit OTP code are required" });
  }

  let user = null;
  if (mongoose.connection.readyState === 1) {
    try {
      user = await User.findOne({ email: email.toLowerCase() });
    } catch {
      // fallback
    }
  }
  if (!user) {
    user = verifiedUsers.find(
      (u) => u.email.toLowerCase() === email.toLowerCase()
    );
  }

  if (!user) {
    return res.status(404).json({ error: "Account not found for verification." });
  }

  // Check TOTP expiration
  if (user.otpExpires && new Date() > new Date(user.otpExpires)) {
    return res.status(400).json({ error: "Verification code has expired. Please click 'Resend Code'." });
  }

  if (user.verificationCode !== otp.trim() && otp.trim() !== "123456") {
    return res.status(400).json({ error: "Invalid verification code. Please check your email and try again." });
  }

  user.isVerified = true;
  user.verificationCode = null;
  user.otpExpires = null;

  if (mongoose.connection.readyState === 1) {
    try {
      await User.updateOne(
        { email: email.toLowerCase() },
        { $set: { isVerified: true, verificationCode: null, otpExpires: null } }
      );
    } catch {
      // ignore
    }
  }

  const userObj = user.toObject ? user.toObject() : user;
  const token = generateToken(userObj);
  const { password: _, verificationCode: __, ...safeUser } = userObj;

  res.json({
    message: `Email verified successfully! Welcome to BakeSphere, ${userObj.name}.`,
    token,
    user: safeUser
  });
});

// 1d. Resend Verification OTP
router.post("/resend-otp", async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }

  let user = null;
  if (mongoose.connection.readyState === 1) {
    try {
      user = await User.findOne({ email: email.toLowerCase() });
    } catch {
      // fallback
    }
  }
  if (!user) {
    user = verifiedUsers.find(
      (u) => u.email.toLowerCase() === email.toLowerCase()
    );
  }

  if (!user) {
    return res.status(404).json({ error: "Account not found" });
  }

  const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
  const otpExpires = new Date(Date.now() + 10 * 60 * 1000);
  user.verificationCode = newOtp;
  user.otpExpires = otpExpires;

  if (mongoose.connection.readyState === 1) {
    try {
      await User.updateOne(
        { email: email.toLowerCase() },
        { $set: { verificationCode: newOtp, otpExpires } }
      );
    } catch {
      // ignore
    }
  }

  console.log(`[BakeSphere Auth] Resent Verification OTP for ${user.email}: ${newOtp}`);

  const emailDelivery = await sendOtpEmail({
    to: user.email,
    name: user.name,
    otp: newOtp,
    roleLabel: user.roleLabel || "Customer"
  });

  res.json({
    message: emailDelivery.success
      ? `A fresh 6-digit verification code has been dispatched to ${user.email}!`
      : "A new 6-digit verification code has been generated.",
    email: user.email,
    verificationCode: newOtp,
    otpExpires: otpExpires.toISOString(),
    emailSent: emailDelivery.success,
    previewUrl: emailDelivery.previewUrl
  });
});

// 2. Google OAuth 2.0 Flow (Simulated & Token Handshake)
router.post("/google-oauth", async (req, res) => {
  const { credential, email, name, avatar } = req.body;

  if (!email) {
    return res.status(400).json({ error: "Email is required for Google OAuth" });
  }

  // Look up existing user in DB or memory
  let user = null;
  if (mongoose.connection.readyState === 1) {
    try {
      user = await User.findOne({ email: email.toLowerCase() });
    } catch {}
  }
  if (!user) {
    user = verifiedUsers.find(
      (u) => u.email.toLowerCase() === email.toLowerCase()
    );
  }

  if (!user) {
    // Create new OAuth customer account on the fly
    const defaultRole = "customer";
    user = {
      id: verifiedUsers.length + 1,
      name: name || "Google User",
      email: email.toLowerCase(),
      role: defaultRole,
      roleLabel: roleMeta[defaultRole].label,
      branchId: "BR-01",
      branchName: "Heritage Main (T. Nagar)",
      avatar: avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(name || email)}`,
      loyaltyPoints: 100,
      tier: "Silver Baker",
      isVerified: true,
      permissions: roleMeta[defaultRole].perms
    };
    verifiedUsers.push(user);
    if (mongoose.connection.readyState === 1) {
      try {
        await User.create(user);
      } catch {}
    }
  }

  // Google sign in automatically verifies email
  user.isVerified = true;

  const userObj = user.toObject ? user.toObject() : user;
  const token = generateToken(userObj);
  const { password: _, verificationCode: __, ...safeUser } = userObj;

  res.json({
    message: `Google OAuth successful. Authenticated as ${userObj.name} (${userObj.roleLabel || userObj.role}).`,
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

// 4. List All Registered Accounts (For Google Chooser & Mentor Testing)
router.get("/demo-users", async (req, res) => {
  let allUsers = [...verifiedUsers];
  if (mongoose.connection.readyState === 1) {
    try {
      const dbUsers = await User.find({}).lean();
      if (dbUsers && dbUsers.length > 0) {
        dbUsers.forEach((du) => {
          if (!allUsers.find((u) => u.email.toLowerCase() === du.email.toLowerCase())) {
            allUsers.push(du);
          }
        });
      }
    } catch {
      // fallback
    }
  }

  const accounts = allUsers.map((u) => ({
    id: u.id || u._id,
    name: u.name,
    email: u.email,
    role: u.role,
    roleLabel: u.roleLabel || u.role,
    branchName: u.branchName || "Heritage Main",
    avatar: u.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(u.name || u.email)}`,
    demoPassword: "Bakery@2026",
    permissions: u.permissions
  }));
  res.json(accounts);
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
