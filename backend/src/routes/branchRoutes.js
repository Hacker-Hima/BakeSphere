import express from "express";
import mongoose from "mongoose";
import Branch from "../models/Branch.js";
import { bakeryBranches } from "../data/branches.js";
import { authenticateToken, requireRoles } from "../middleware/auth.js";
import { bakeryOrders } from "../data/orders.js";
import Order from "../models/Order.js";

const router = express.Router();

// Helper: Haversine distance in km
function calculateDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return parseFloat((R * c).toFixed(2));
}

// 1. GET /api/branches - List all branches with distance calculation & status filter
router.get("/", async (req, res) => {
  const { status, lat, lng, radius, search } = req.query;

  let branchList = [];
  if (mongoose.connection.readyState === 1) {
    try {
      const dbBranches = await Branch.find({}).lean();
      if (dbBranches && dbBranches.length > 0) {
        branchList = dbBranches;
      } else {
        branchList = [...bakeryBranches];
      }
    } catch {
      branchList = [...bakeryBranches];
    }
  } else {
    branchList = [...bakeryBranches];
  }

  // Filter by status if provided (e.g. ?status=active)
  if (status && status !== "all") {
    branchList = branchList.filter((b) => b.status === status);
  }

  // Filter by search query (locality, name, address)
  if (search) {
    const q = search.toLowerCase();
    branchList = branchList.filter(
      (b) =>
        b.name.toLowerCase().includes(q) ||
        b.locality.toLowerCase().includes(q) ||
        b.address.toLowerCase().includes(q)
    );
  }

  // Distance calculation if customer coordinates provided
  if (lat && lng) {
    const customerLat = parseFloat(lat);
    const customerLng = parseFloat(lng);

    if (!isNaN(customerLat) && !isNaN(customerLng)) {
      branchList = branchList.map((b) => {
        const bLat = b.coordinates?.lat || 13.0418;
        const bLng = b.coordinates?.lng || 80.2341;
        const distanceKm = calculateDistanceKm(customerLat, customerLng, bLat, bLng);
        return {
          ...b,
          distanceKm,
          distanceText: distanceKm < 1 ? `${Math.round(distanceKm * 1000)} m` : `${distanceKm} km`
        };
      });

      // Filter by radius if provided
      if (radius) {
        const maxRadius = parseFloat(radius);
        if (!isNaN(maxRadius)) {
          branchList = branchList.filter((b) => b.distanceKm <= maxRadius);
        }
      }

      // Sort by closest distance
      branchList.sort((a, b) => a.distanceKm - b.distanceKm);
    }
  }

  res.json({
    count: branchList.length,
    branches: branchList
  });
});

// 2. GET /api/branches/:id - Get single branch detail
router.get("/:id", async (req, res) => {
  const { id } = req.params;

  let branch = null;
  if (mongoose.connection.readyState === 1) {
    try {
      branch = await Branch.findOne({ id }).lean();
    } catch {
      // fallback
    }
  }
  if (!branch) {
    branch = bakeryBranches.find((b) => b.id === id);
  }

  if (!branch) {
    return res.status(404).json({ error: "Branch not found" });
  }

  res.json(branch);
});

// 3. POST /api/branches - Create new branch (Admin / Owner only)
router.post("/", authenticateToken, requireRoles(["super_admin", "bakery_owner"]), async (req, res) => {
  const {
    id,
    name,
    locality,
    address,
    coordinates,
    contact,
    workingHours,
    manager,
    managerId,
    staffCount,
    seatingCapacity,
    specialty,
    monthlyTarget
  } = req.body;

  if (!name || !locality || !address) {
    return res.status(400).json({ error: "Branch name, locality, and address are required" });
  }

  // Generate ID if missing
  const branchId = id || `BR-0${bakeryBranches.length + 1}`;

  const newBranch = {
    id: branchId,
    name,
    locality,
    address,
    coordinates: coordinates || { lat: 13.0418, lng: 80.2341 },
    contact: {
      phone: contact?.phone || "+91 44 2434 8890",
      whatsapp: contact?.whatsapp || "+919444243488",
      email: contact?.email || "branch@bakesphere.com",
      emergencyContact: contact?.emergencyContact || "+91 98840 99999"
    },
    workingHours: {
      open: workingHours?.open || "06:00 AM",
      close: workingHours?.close || "10:30 PM",
      display: workingHours?.display || "06:00 AM – 10:30 PM"
    },
    manager: manager || "Unassigned",
    managerId: managerId || null,
    status: "active",
    todaySales: 0,
    monthlyTarget: monthlyTarget ? Number(monthlyTarget) : 1000000,
    currentMonthSales: 0,
    staffCount: staffCount ? Number(staffCount) : 8,
    seatingCapacity: seatingCapacity ? Number(seatingCapacity) : 20,
    rating: 5.0,
    equipmentCount: 6,
    specialty: specialty || "Artisan Bakes & Confectionery",
    coverageRadiusKm: 10
  };

  // Save to DB if connected
  if (mongoose.connection.readyState === 1) {
    try {
      await Branch.create(newBranch);
    } catch (e) {
      console.warn("MongoDB Branch save error:", e.message);
    }
  }

  // Always keep in-memory sync
  const existingIdx = bakeryBranches.findIndex((b) => b.id === branchId);
  if (existingIdx > -1) {
    bakeryBranches[existingIdx] = newBranch;
  } else {
    bakeryBranches.push(newBranch);
  }

  res.status(201).json({
    message: `Branch '${name}' successfully registered!`,
    branch: newBranch
  });
});

// 4. PUT /api/branches/:id - Update branch details
router.put("/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;
  const user = req.user;

  // Authorization check: Admins/Owners can edit any; Managers can only edit their assigned branch
  const isSuper = ["super_admin", "bakery_owner"].includes(user?.role);
  const isBranchMgr = user?.role === "manager" && user?.branchId === id;

  if (!isSuper && !isBranchMgr) {
    return res.status(403).json({
      error: "Forbidden",
      message: "You can only modify your assigned branch."
    });
  }

  const updates = req.body;

  let branch = null;
  if (mongoose.connection.readyState === 1) {
    try {
      branch = await Branch.findOneAndUpdate({ id }, { $set: updates }, { new: true }).lean();
    } catch {
      // fallback
    }
  }

  const inMemIdx = bakeryBranches.findIndex((b) => b.id === id);
  if (inMemIdx > -1) {
    bakeryBranches[inMemIdx] = {
      ...bakeryBranches[inMemIdx],
      ...updates
    };
    if (!branch) branch = bakeryBranches[inMemIdx];
  }

  if (!branch) {
    return res.status(404).json({ error: "Branch not found" });
  }

  res.json({
    message: `Branch '${branch.name}' updated successfully!`,
    branch
  });
});

// 5. PATCH /api/branches/:id/status - Toggle active/disabled (Admin only)
router.patch("/:id/status", authenticateToken, requireRoles(["super_admin", "bakery_owner"]), async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!["active", "disabled", "maintenance"].includes(status)) {
    return res.status(400).json({ error: "Status must be 'active', 'disabled', or 'maintenance'" });
  }

  let branch = null;
  if (mongoose.connection.readyState === 1) {
    try {
      branch = await Branch.findOneAndUpdate({ id }, { $set: { status } }, { new: true }).lean();
    } catch {
      // fallback
    }
  }

  const inMemIdx = bakeryBranches.findIndex((b) => b.id === id);
  if (inMemIdx > -1) {
    bakeryBranches[inMemIdx].status = status;
    if (!branch) branch = bakeryBranches[inMemIdx];
  }

  if (!branch) {
    return res.status(404).json({ error: "Branch not found" });
  }

  res.json({
    message: `Branch status changed to '${status}'.`,
    branch
  });
});

// 6. GET /api/branches/:id/performance - Branch-level sales & operational metrics
router.get("/:id/performance", async (req, res) => {
  const { id } = req.params;

  let branch = bakeryBranches.find((b) => b.id === id);
  if (!branch && mongoose.connection.readyState === 1) {
    branch = await Branch.findOne({ id }).lean();
  }

  if (!branch) {
    return res.status(404).json({ error: "Branch not found" });
  }

  // Calculate order stats for this branch
  let branchOrders = [];
  if (mongoose.connection.readyState === 1) {
    try {
      branchOrders = await Order.find({ branchId: id }).lean();
    } catch {
      branchOrders = bakeryOrders.filter((o) => o.branchId === id);
    }
  } else {
    branchOrders = bakeryOrders.filter((o) => o.branchId === id);
  }

  const totalOrders = branchOrders.length;
  const totalRevenue = branchOrders.reduce((sum, o) => sum + (o.finalTotal || 0), 0);
  const avgOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;

  res.json({
    branchId: branch.id,
    name: branch.name,
    status: branch.status,
    manager: branch.manager,
    todaySales: branch.todaySales,
    monthlyTarget: branch.monthlyTarget,
    currentMonthSales: branch.currentMonthSales,
    targetAchievementPercent: Math.round((branch.currentMonthSales / branch.monthlyTarget) * 100),
    totalOrders,
    totalRevenue,
    avgOrderValue,
    staffCount: branch.staffCount,
    seatingCapacity: branch.seatingCapacity,
    equipmentCount: branch.equipmentCount,
    rating: branch.rating
  });
});

export default router;
