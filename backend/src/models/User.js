import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  id: { type: Number, index: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, index: true },
  password: { type: String, required: true },
  role: { type: String, required: true, default: "customer" },
  roleLabel: { type: String },
  branchId: { type: String, default: "BR-01" },
  branchName: { type: String, default: "Heritage Main (T. Nagar)" },
  phone: { type: String },
  avatar: { type: String },
  loyaltyPoints: { type: Number, default: 0 },
  tier: { type: String, default: "Silver Baker" },
  isVerified: { type: Boolean, default: true },
  verificationCode: { type: String },
  permissions: [{ type: String }]
}, { timestamps: true });

export const User = mongoose.models.User || mongoose.model("User", UserSchema);
export default User;
