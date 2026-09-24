import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "bakesphere_ultra_secure_jwt_secret_key_2026_mwt";
const JWT_EXPIRES_IN = "24h";

export const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      branchId: user.branchId || "BR-01"
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
};

export const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return null;
  }
};
