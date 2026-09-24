import { verifyToken } from "../config/jwt.js";

export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const apiKey = req.headers["x-api-key"];

  // Support API Key for developer / API playground access
  if (apiKey && apiKey === "bakesphere_dev_key_2026") {
    req.user = {
      id: 999,
      name: "API Developer Key",
      email: "developer@bakesphere.com",
      role: "super_admin",
      branchId: "BR-01"
    };
    return next();
  }

  const token = authHeader && authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;

  if (!token) {
    return res.status(401).json({
      error: "Authentication required",
      message: "Please provide a valid Bearer JWT token or x-api-key header."
    });
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(403).json({
      error: "Invalid or expired token",
      message: "The provided JWT session token has expired or is invalid."
    });
  }

  req.user = decoded;
  next();
};

export const requireRoles = (roles = []) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    if (roles.length > 0 && !roles.includes(req.user.role)) {
      return res.status(403).json({
        error: "Forbidden",
        message: `Role '${req.user.role}' lacks permission for this action. Allowed: ${roles.join(", ")}`
      });
    }
    next();
  };
};
