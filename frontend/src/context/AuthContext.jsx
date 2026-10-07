import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

const API_BASE = "http://localhost:5000/api";

// Role-Based Module Access Mapping
export const ROLE_PERMISSIONS = {
  super_admin: ["shop", "dashboard", "pos", "billing", "custom-cake", "bulk-order", "feedback", "production", "inventory", "ai-forecast", "branches", "login"],
  bakery_owner: ["shop", "dashboard", "pos", "billing", "custom-cake", "bulk-order", "feedback", "production", "inventory", "ai-forecast", "branches", "login"],
  manager: ["shop", "dashboard", "pos", "billing", "custom-cake", "bulk-order", "feedback", "production", "inventory", "branches", "login"],
  head_baker: ["shop", "billing", "production", "inventory", "custom-cake", "bulk-order", "feedback", "login"],
  chef: ["shop", "billing", "production", "inventory", "custom-cake", "bulk-order", "feedback", "login"],
  cashier: ["pos", "billing", "shop", "custom-cake", "bulk-order", "feedback", "login"],
  customer: ["shop", "billing", "custom-cake", "bulk-order", "feedback", "login"]
};


export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => {
    try {
      return sessionStorage.getItem("bakesphere_jwt") || localStorage.getItem("bakesphere_jwt") || "";
    } catch {
      return "";
    }
  });

  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = sessionStorage.getItem("bakesphere_user") || localStorage.getItem("bakesphere_user");
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return null;
  });

  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState("");
  const [branches, setBranches] = useState([
    { id: "BR-01", name: "Heritage Main Bakery", locality: "T. Nagar, Chennai" },
    { id: "BR-02", name: "Anna Nagar Flagship", locality: "Anna Nagar, Chennai" },
    { id: "BR-03", name: "Koyambedu Express Hub", locality: "Koyambedu, Chennai" },
    { id: "BR-04", name: "OMR Cloud Kitchen & Master Production", locality: "OMR, Chennai" }
  ]);

  useEffect(() => {
    fetch("http://localhost:5000/api/branches")
      .then((res) => res.json())
      .then((data) => {
        if (data.branches && data.branches.length > 0) {
          setBranches(data.branches);
        }
      })
      .catch((e) => console.warn("Could not load branches into AuthContext:", e));
  }, []);

  // Save session in sessionStorage & localStorage
  useEffect(() => {
    try {
      if (token) {
        sessionStorage.setItem("bakesphere_jwt", token);
        localStorage.setItem("bakesphere_jwt", token);
      }
      if (currentUser) {
        sessionStorage.setItem("bakesphere_user", JSON.stringify(currentUser));
        localStorage.setItem("bakesphere_user", JSON.stringify(currentUser));
      }
    } catch (e) {
      console.error("Storage error:", e);
    }
  }, [token, currentUser]);

  // Automated Credentials Login (Role is auto-detected)
  const login = async (email, password) => {
    setLoading(true);
    setAuthError("");
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.requiresVerification) {
          setLoading(false);
          return {
            success: false,
            requiresVerification: true,
            email: data.email,
            verificationCode: data.verificationCode,
            error: data.error
          };
        }
        throw new Error(data.error || "Login failed");
      }

      setToken(data.token);
      setCurrentUser(data.user);
      setLoading(false);
      return { success: true, user: data.user, message: data.message };
    } catch (err) {
      setAuthError(err.message);
      setLoading(false);
      return { success: false, error: err.message };
    }
  };

  // Register New Account with Role Choice
  const register = async (userData) => {
    setLoading(true);
    setAuthError("");
    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Registration failed");

      setLoading(false);
      return {
        success: true,
        requiresVerification: data.requiresVerification,
        email: data.email,
        verificationCode: data.verificationCode,
        otpExpires: data.otpExpires,
        role: data.role,
        roleLabel: data.roleLabel,
        emailSent: data.emailSent,
        previewUrl: data.previewUrl,
        message: data.message
      };
    } catch (err) {
      setAuthError(err.message);
      setLoading(false);
      return { success: false, error: err.message };
    }
  };

  // Verify Email with OTP
  const verifyEmail = async (email, otp) => {
    setLoading(true);
    setAuthError("");
    try {
      const res = await fetch(`${API_BASE}/auth/verify-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Email verification failed");

      setToken(data.token);
      setCurrentUser(data.user);
      setLoading(false);
      return { success: true, user: data.user, message: data.message };
    } catch (err) {
      setAuthError(err.message);
      setLoading(false);
      return { success: false, error: err.message };
    }
  };

  // Resend OTP
  const resendOtp = async (email) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/resend-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      setLoading(false);
      if (!res.ok) throw new Error(data.error || "Failed to resend code");
      return {
        success: true,
        email: data.email,
        verificationCode: data.verificationCode,
        otpExpires: data.otpExpires,
        emailSent: data.emailSent,
        previewUrl: data.previewUrl,
        message: data.message
      };
    } catch (err) {
      setLoading(false);
      return { success: false, error: err.message };
    }
  };

  // Google OAuth Handshake (Simulation)
  const googleLogin = async (customProfile) => {
    setLoading(true);
    setAuthError("");
    try {
      const profile = customProfile || {
        email: "evaluator.mentor@bakesphere.com",
        name: "Google Verified Evaluator",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80"
      };

      const res = await fetch(`${API_BASE}/auth/google-oauth`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Google sign-in failed");

      setToken(data.token);
      setCurrentUser(data.user);
      setLoading(false);
      return { success: true, user: data.user };
    } catch (err) {
      setAuthError(err.message);
      setLoading(false);
      return { success: false, error: err.message };
    }
  };

  // 1-Click Role Switcher for Mentor Testing
  const switchDemoRole = async (role) => {
    setLoading(true);
    setAuthError("");
    try {
      const res = await fetch(`${API_BASE}/auth/demo-switch`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role })
      });
      const data = await res.json();
      if (res.ok && data.token) {
        setToken(data.token);
        setCurrentUser(data.user);
      }
      setLoading(false);
      return { success: true, user: data.user };
    } catch (err) {
      console.error("Demo role switch error:", err);
      setLoading(false);
      return { success: false, error: err.message };
    }
  };

  const loginAsGuest = () => {
    const guestUser = {
      id: 99,
      name: "Guest Gourmet",
      email: "guest@bakesphere.com",
      role: "customer",
      roleLabel: "Customer (Guest)",
      branchName: "Heritage Main (T. Nagar)",
      avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
      permissions: ["place_orders", "custom_cake_studio"]
    };
    setCurrentUser(guestUser);
    return guestUser;
  };

  const logout = () => {
    setToken("");
    setCurrentUser(null);
    try {
      localStorage.removeItem("bakesphere_jwt");
      localStorage.removeItem("bakesphere_user");
      sessionStorage.removeItem("bakesphere_jwt");
      sessionStorage.removeItem("bakesphere_user");
    } catch (e) {
      console.error(e);
    }
  };

  // Active branch selection (Admin can toggle between branches; Manager/Staff locked to assigned branch)
  const [activeBranchId, setActiveBranchId] = useState(() => {
    try {
      const saved = sessionStorage.getItem("bakesphere_active_branch");
      if (saved) return saved;
    } catch {}
    return "BR-01";
  });

  const [activeBranchName, setActiveBranchName] = useState(() => {
    try {
      const saved = sessionStorage.getItem("bakesphere_active_branch_name");
      if (saved) return saved;
    } catch {}
    return "Heritage Main (T. Nagar)";
  });

  // Keep branch in sync with logged-in user profile
  useEffect(() => {
    if (currentUser) {
      const isSuper = ["super_admin", "bakery_owner"].includes(currentUser.role);
      if (!isSuper && currentUser.branchId) {
        // Enforce assigned branch for managers & chefs
        setActiveBranchId(currentUser.branchId);
        if (currentUser.branchName) setActiveBranchName(currentUser.branchName);
      }
    }
  }, [currentUser]);

  const switchBranch = (branchId, branchName) => {
    const isSuper = currentUser && ["super_admin", "bakery_owner", "customer"].includes(currentUser.role);
    if (!isSuper && currentUser?.branchId && currentUser.branchId !== branchId) {
      console.warn("Unauthorized attempt to switch branch outside assigned scope.");
      return false;
    }
    setActiveBranchId(branchId);
    if (branchName) setActiveBranchName(branchName);
    try {
      sessionStorage.setItem("bakesphere_active_branch", branchId);
      if (branchName) sessionStorage.setItem("bakesphere_active_branch_name", branchName);
    } catch {}
    return true;
  };

  const role = currentUser ? currentUser.role : "unauthenticated";
  const allowedTabs = currentUser ? (ROLE_PERMISSIONS[currentUser.role] || ["shop"]) : [];
  const hasPermission = (tabId) => Boolean(currentUser && allowedTabs.includes(tabId));

  const isAdmin = role === "super_admin";
  const isOwner = role === "bakery_owner" || isAdmin;
  const isManager = role === "manager" || isOwner;
  const isBaker = role === "head_baker" || isManager;
  const isCashier = role === "cashier" || isManager;
  const isCustomer = role === "customer";

  return (
    <AuthContext.Provider
      value={{
        token,
        currentUser,
        loading,
        authError,
        setAuthError,
        role,
        allowedTabs,
        hasPermission,
        isAdmin,
        isOwner,
        isManager,
        isBaker,
        isCashier,
        isCustomer,
        login,
        register,
        verifyEmail,
        resendOtp,
        googleLogin,
        switchDemoRole,
        loginAsGuest,
        logout,
        activeBranchId,
        activeBranchName,
        switchBranch,
        branches
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
