export let bakeryBranches = [
  {
    id: "BR-01",
    name: "Heritage Main Bakery",
    locality: "T. Nagar, Chennai",
    address: "No. 42, Venkatnarayana Road, T. Nagar, Chennai 600017",
    coordinates: { lat: 13.0418, lng: 80.2341 },
    contact: {
      phone: "+91 44 2434 8890",
      whatsapp: "+919444243488",
      email: "tnagar@bakesphere.com",
      emergencyContact: "+91 98840 11111"
    },
    workingHours: {
      open: "06:00 AM",
      close: "10:30 PM",
      display: "06:00 AM – 10:30 PM"
    },
    manager: "Aaditya Raman",
    managerId: 2,
    todaySales: 48550,
    monthlyTarget: 1200000,
    currentMonthSales: 894000,
    staffCount: 14,
    seatingCapacity: 32,
    rating: 4.9,
    status: "active",
    equipmentCount: 9,
    specialty: "Artisan Sourdoughs & French Entremets",
    coverageRadiusKm: 10
  },
  {
    id: "BR-02",
    name: "Anna Nagar Flagship",
    locality: "Anna Nagar, Chennai",
    address: "Plot 112, 2nd Avenue, Near Roundtana, Anna Nagar, Chennai 600040",
    coordinates: { lat: 13.0850, lng: 80.2101 },
    contact: {
      phone: "+91 44 2621 5566",
      whatsapp: "+919444262155",
      email: "annanagar@bakesphere.com",
      emergencyContact: "+91 98840 22222"
    },
    workingHours: {
      open: "06:30 AM",
      close: "11:00 PM",
      display: "06:30 AM – 11:00 PM"
    },
    manager: "Karthik Subramanian",
    managerId: 3,
    todaySales: 39420,
    monthlyTarget: 950000,
    currentMonthSales: 712000,
    staffCount: 11,
    seatingCapacity: 45,
    rating: 4.8,
    status: "active",
    equipmentCount: 7,
    specialty: "Custom Designer Cakes & Patisserie",
    coverageRadiusKm: 10
  },
  {
    id: "BR-03",
    name: "Koyambedu Express & Transit Hub",
    locality: "Koyambedu, Chennai",
    address: "Shop 7, Metro Concourse Level, Koyambedu, Chennai 600107",
    coordinates: { lat: 13.0694, lng: 80.1948 },
    contact: {
      phone: "+91 44 2479 2211",
      whatsapp: "+919444247922",
      email: "koyambedu@bakesphere.com",
      emergencyContact: "+91 98840 33333"
    },
    workingHours: {
      open: "05:30 AM",
      close: "10:00 PM",
      display: "05:30 AM – 10:00 PM"
    },
    manager: "Priya Natarajan",
    managerId: 4,
    todaySales: 28900,
    monthlyTarget: 700000,
    currentMonthSales: 540000,
    staffCount: 6,
    seatingCapacity: 12,
    rating: 4.7,
    status: "active",
    equipmentCount: 5,
    specialty: "Fresh Puffs, Viennoiserie & Filter Coffee",
    coverageRadiusKm: 5
  },
  {
    id: "BR-04",
    name: "OMR Cloud Kitchen & Master Production Hub",
    locality: "Thoraipakkam, OMR",
    address: "Industrial Estate, Phase 2, OMR IT Corridor, Chennai 600096",
    coordinates: { lat: 12.9349, lng: 80.2312 },
    contact: {
      phone: "+91 44 4350 9900",
      whatsapp: "+919444435099",
      email: "omr@bakesphere.com",
      emergencyContact: "+91 98840 44444"
    },
    workingHours: {
      open: "12:00 AM",
      close: "11:59 PM",
      display: "24 Hours (3 Continuous Shifts)"
    },
    manager: "Chef Pierre Bouchard",
    managerId: 5,
    todaySales: 62100,
    monthlyTarget: 1500000,
    currentMonthSales: 1180000,
    staffCount: 22,
    seatingCapacity: 0,
    rating: 4.9,
    status: "active",
    equipmentCount: 18,
    specialty: "B2B Central Baking, Bulk Orders & Custom Cakes",
    coverageRadiusKm: 25
  }
];

export const resetBranchesToDefault = () => {
  // Utility for tests or admin reset
  return bakeryBranches;
};
