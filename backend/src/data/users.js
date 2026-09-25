import bcrypt from "bcryptjs";

// Pre-computed hash for password "Bakery@2026"
const defaultHashedPassword = bcrypt.hashSync("Bakery@2026", 10);

export const verifiedUsers = [
  {
    id: 1,
    name: "Aaditya Raman",
    email: "admin@bakesphere.com",
    password: defaultHashedPassword,
    role: "super_admin",
    roleLabel: "Super Admin",
    branchId: "BR-01",
    branchName: "Heritage Main (T. Nagar)",
    phone: "+91 98401 23456",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    isVerified: true,
    permissions: ["all_access", "manage_users", "financial_audit", "system_settings", "api_keys"]
  },
  {
    id: 2,
    name: "Meenakshi Sundaram",
    email: "owner@bakesphere.com",
    password: defaultHashedPassword,
    role: "bakery_owner",
    roleLabel: "Main Manager / Owner",
    branchId: "BR-01",
    branchName: "Heritage Main (T. Nagar)",
    phone: "+91 94440 98765",
    avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80",
    isVerified: true,
    permissions: ["view_finances", "branch_analytics", "pricing_control", "supplier_contracts", "manage_users"]
  },
  {
    id: 3,
    name: "Karthik Subramanian",
    email: "manager@bakesphere.com",
    password: defaultHashedPassword,
    role: "manager",
    roleLabel: "Branch Manager",
    branchId: "BR-02",
    branchName: "Anna Nagar Flagship",
    phone: "+91 97910 11223",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    isVerified: true,
    permissions: ["approve_production", "staff_shifts", "purchase_orders", "inventory_reorder", "pos_access"]
  },
  {
    id: 4,
    name: "Chef Pierre Bouchard",
    email: "baker@bakesphere.com",
    password: defaultHashedPassword,
    role: "head_baker",
    roleLabel: "Head Chef / Master Baker",
    branchId: "BR-01",
    branchName: "Heritage Main (T. Nagar)",
    phone: "+91 98840 44556",
    avatar: "https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=150&auto=format&fit=crop&q=80",
    isVerified: true,
    permissions: ["recipe_scaler", "batch_production", "fefo_consumption", "quality_inspection", "wastage_logging"]
  },
  {
    id: 5,
    name: "Chef Marco Rossi",
    email: "chef@bakesphere.com",
    password: defaultHashedPassword,
    role: "chef",
    roleLabel: "Pastry Chef",
    branchId: "BR-01",
    branchName: "Heritage Main (T. Nagar)",
    phone: "+91 98840 77112",
    avatar: "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=150&auto=format&fit=crop&q=80",
    isVerified: true,
    permissions: ["recipe_scaler", "batch_production", "fefo_consumption", "quality_inspection"]
  },
  {
    id: 6,
    name: "Priya Natarajan",
    email: "cashier@bakesphere.com",
    password: defaultHashedPassword,
    role: "cashier",
    roleLabel: "POS Cashier",
    branchId: "BR-03",
    branchName: "Koyambedu Express",
    phone: "+91 99620 77889",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
    isVerified: true,
    permissions: ["pos_billing", "thermal_invoice", "accept_payments", "daily_register_close"]
  },
  {
    id: 7,
    name: "Sneha Varadharajan",
    email: "customer@bakesphere.com",
    password: defaultHashedPassword,
    role: "customer",
    roleLabel: "Customer",
    branchId: "BR-02",
    branchName: "Anna Nagar Flagship",
    phone: "+91 91760 33445",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80",
    loyaltyPoints: 340,
    tier: "Gold Baker's Guild",
    isVerified: true,
    permissions: ["place_orders", "custom_cake_studio", "redeem_loyalty", "order_tracking"]
  }
];
