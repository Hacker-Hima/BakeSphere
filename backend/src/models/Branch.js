import mongoose from "mongoose";

const BranchContactSchema = new mongoose.Schema({
  phone: { type: String, default: "+91 44 2434 8890" },
  whatsapp: { type: String, default: "+919444243488" },
  email: { type: String, default: "contact@bakesphere.com" },
  emergencyContact: { type: String, default: "+91 98840 12345" }
}, { _id: false });

const WorkingHoursSchema = new mongoose.Schema({
  open: { type: String, default: "06:00 AM" },
  close: { type: String, default: "10:30 PM" },
  display: { type: String, default: "06:00 AM – 10:30 PM" }
}, { _id: false });

const CoordinatesSchema = new mongoose.Schema({
  lat: { type: Number, default: 13.0418 },
  lng: { type: Number, default: 80.2341 }
}, { _id: false });

const BranchSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true, index: true },
  name: { type: String, required: true },
  locality: { type: String, required: true },
  address: { type: String, required: true },
  coordinates: { type: CoordinatesSchema, default: () => ({ lat: 13.0418, lng: 80.2341 }) },
  contact: { type: BranchContactSchema, default: () => ({}) },
  workingHours: { type: WorkingHoursSchema, default: () => ({}) },
  managerId: { type: Number },
  manager: { type: String, default: "Unassigned" },
  status: { type: String, enum: ["active", "disabled", "maintenance"], default: "active" },
  todaySales: { type: Number, default: 0 },
  monthlyTarget: { type: Number, default: 1000000 },
  currentMonthSales: { type: Number, default: 0 },
  staffCount: { type: Number, default: 10 },
  seatingCapacity: { type: Number, default: 20 },
  rating: { type: Number, default: 4.8 },
  equipmentCount: { type: Number, default: 6 },
  specialty: { type: String, default: "Artisan Pastries & Cakes" },
  coverageRadiusKm: { type: Number, default: 10 }
}, { timestamps: true });

export const Branch = mongoose.models.Branch || mongoose.model("Branch", BranchSchema);
export default Branch;
