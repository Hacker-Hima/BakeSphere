import mongoose from "mongoose";

const AuditLogSchema = new mongoose.Schema({
  logId: { type: String, required: true },
  action: { type: String, required: true },
  performedBy: { type: String, default: "System" },
  target: { type: String },
  details: { type: mongoose.Schema.Types.Mixed },
  timestamp: { type: Date, default: Date.now },
  ip: { type: String, default: "127.0.0.1" }
}, { timestamps: true });

export const AuditLog = mongoose.models.AuditLog || mongoose.model("AuditLog", AuditLogSchema);
export default AuditLog;
