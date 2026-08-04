export const INITIAL_WAREHOUSE_FACILITIES = [
  {
    code: "WH-LOS01",
    name: "Main Hub - Lagos",
    type: "Main Hub",
    address: "14 Logistics Way, Ikeja Industrial Estate, Lagos",
    skusCount: 1420,
    capacity: "84% Full",
    manager: "Alex Rivers",
    totalZones: 4,
    totalBins: 96,
    occupiedBins: 80,
  },
  {
    code: "SHP-IKJ01",
    name: "Ikeja Shop Counter",
    type: "Retail Branch",
    address: "15 Otigba Street, Computer Village, Ikeja, Lagos",
    skusCount: 890,
    capacity: "62% Full",
    manager: "Chukwuemeka Obi",
    totalZones: 3,
    totalBins: 72,
    occupiedBins: 45,
  },
  {
    code: "WH-ABJ02",
    name: "Abuja Central Hub",
    type: "Main Hub",
    address: "304 Cargo Pkwy, Idu Industrial Layout, Abuja",
    skusCount: 610,
    capacity: "48% Full",
    manager: "Marcus Vance",
    totalZones: 3,
    totalBins: 60,
    occupiedBins: 29,
  },
  {
    code: "WH-PH03",
    name: "Port Harcourt Depot",
    type: "Regional Depot",
    address: "88 Trans Amadi Industrial Layout, Port Harcourt",
    skusCount: 420,
    capacity: "35% Full",
    manager: "Sarah Jenkins",
    totalZones: 2,
    totalBins: 48,
    occupiedBins: 18,
  },
];

export const INITIAL_ZONES_CONFIG = [
  { code: "ZA", name: "Zone A - OLED Displays & Glass", type: "Storage", color: "indigo", x: 0, y: 0, width: 3, height: 2 },
  { code: "ZB", name: "Zone B - High Capacity Batteries", type: "Storage", color: "emerald", x: 3, y: 0, width: 3, height: 2 },
  { code: "ZC", name: "Zone C - Flex Cables & IC Chips", type: "Storage", color: "amber", x: 0, y: 2, width: 3, height: 2 },
  { code: "ZR", name: "Zone R - Inbound Receiving & QC", type: "Receiving", color: "sky", x: 3, y: 2, width: 3, height: 1 },
  { code: "ZP", name: "Zone P - Dispatch & Packing Bay", type: "Packing", color: "purple", x: 3, y: 3, width: 3, height: 1 },
];

export const SAMPLE_SKUS = [
  { sku: "IP15PM-OLED-BLK", name: "iPhone 15 Pro Max OLED Screen Assembly (OEM)", pickVelocity: "HOT" },
  { sku: "SAM-S24U-BAT", name: "Galaxy S24 Ultra Battery Pack 5000mAh", pickVelocity: "HOT" },
  { sku: "PIX-8P-PORT", name: "Pixel 8 Pro USB-C Charging Port Flex", pickVelocity: "WARM" },
  { sku: "IP14-CAM-MAIN", name: "iPhone 14 Main Rear Camera Module", pickVelocity: "HOT" },
  { sku: "SAM-A54-GLASS", name: "Galaxy A54 5G Rear Glass Housing White", pickVelocity: "COLD" },
  { sku: "IP13P-IC-TOUCH", name: "iPhone 13 Pro Touch IC Control Chip", pickVelocity: "WARM" },
  { sku: "MAC-M2-KEYB", name: "MacBook Air M2 Keyboard Flex Cable US", pickVelocity: "COLD" },
  { sku: "IP15-BACK-GLS", name: "iPhone 15 Back Glass Panel Blue", pickVelocity: "WARM" },
];

export const INITIAL_RECEIVING_ORDERS = [
  {
    receiptNumber: "REC-2026-091",
    supplierName: "Foxconn Electronics Shenzhen",
    poNumber: "PO-2026-8810",
    status: "In-Progress",
    receivedBy: "Dave Miller (Receiving Lead)",
    items: [
      { sku: "IP15PM-OLED-BLK", name: "iPhone 15 Pro Max OLED Screen Assembly (OEM)", expectedQty: 100, receivedQty: 60, binCode: "ZA-R01-S2-B01", status: "Pending" },
      { sku: "IP14-CAM-MAIN", name: "iPhone 14 Main Rear Camera Module", expectedQty: 50, receivedQty: 50, binCode: "ZA-R02-S1-B03", status: "Putaway" },
    ],
  },
  {
    receiptNumber: "REC-2026-090",
    supplierName: "Sunsky Technology Wholesale",
    poNumber: "PO-2026-8809",
    status: "Pending",
    receivedBy: "Sarah Jenkins",
    items: [
      { sku: "SAM-S24U-BAT", name: "Galaxy S24 Ultra Battery Pack 5000mAh", expectedQty: 200, receivedQty: 0, binCode: "ZB-R01-S1-B02", status: "Pending" },
      { sku: "PIX-8P-PORT", name: "Pixel 8 Pro USB-C Charging Port Flex", expectedQty: 100, receivedQty: 0, binCode: "ZC-R01-S3-B04", status: "Pending" },
    ],
  },
];

export const INITIAL_PICKING_TICKETS = [
  {
    ticketNumber: "PICK-2026-440",
    orderId: "ORD-9912",
    customerName: "Apex Mobile Repairs Inc",
    status: "Picking",
    assignedPicker: "Marcus Vance",
    items: [
      { sku: "IP15PM-OLED-BLK", name: "iPhone 15 Pro Max OLED Screen Assembly (OEM)", binCode: "ZA-R01-S2-B01", requestedQty: 5, pickedQty: 3, status: "Pending" },
      { sku: "SAM-S24U-BAT", name: "Galaxy S24 Ultra Battery Pack 5000mAh", binCode: "ZB-R01-S1-B02", requestedQty: 10, pickedQty: 10, status: "Picked" },
      { sku: "PIX-8P-PORT", name: "Pixel 8 Pro USB-C Charging Port Flex", binCode: "ZC-R01-S3-B04", requestedQty: 4, pickedQty: 4, status: "Picked" },
    ],
  },
  {
    ticketNumber: "PICK-2026-439",
    orderId: "ORD-9908",
    customerName: "iFixFast Depot Brooklyn",
    status: "Pending",
    assignedPicker: "Elena Rostova",
    items: [
      { sku: "IP14-CAM-MAIN", name: "iPhone 14 Main Rear Camera Module", binCode: "ZA-R02-S1-B03", requestedQty: 8, pickedQty: 0, status: "Pending" },
      { sku: "IP15-BACK-GLS", name: "iPhone 15 Back Glass Panel Blue", binCode: "ZA-R02-S3-B05", requestedQty: 12, pickedQty: 0, status: "Pending" },
    ],
  },
];

export const INITIAL_PACKING_ORDERS = [
  {
    packNumber: "PACK-2026-112",
    pickTicketId: "PICK-2026-438",
    packageType: "Carton Box Medium",
    weightKg: 2.4,
    trackingNumber: "1Z9999999999999991",
    status: "Packing",
    packedBy: "Pack Station 1",
  },
  {
    packNumber: "PACK-2026-111",
    pickTicketId: "PICK-2026-437",
    packageType: "Bubble Mailer",
    weightKg: 0.6,
    trackingNumber: "1Z9999999999999992",
    status: "Ready for Dispatch",
    packedBy: "Pack Station 2",
  },
];

export const INITIAL_CYCLE_COUNTS = [
  {
    countId: "CC-2026-08",
    title: "Q3 High Value OLED & Battery Audit",
    zoneName: "Zone A & Zone B",
    status: "In-Progress",
    counterName: "Dave Miller",
    bins: [
      { binCode: "ZA-R01-S2-B01", sku: "IP15PM-OLED-BLK", productName: "iPhone 15 Pro Max OLED Screen Assembly (OEM)", systemQty: 45, countedQty: 42, variance: -3, reconciled: false },
      { binCode: "ZB-R01-S1-B02", sku: "SAM-S24U-BAT", productName: "Galaxy S24 Ultra Battery Pack 5000mAh", systemQty: 120, countedQty: 120, variance: 0, reconciled: true },
      { binCode: "ZA-R02-S1-B03", sku: "IP14-CAM-MAIN", productName: "iPhone 14 Main Rear Camera Module", systemQty: 60, countedQty: 62, variance: 2, reconciled: false },
    ],
  },
];

export const INITIAL_TRANSFERS = [
  {
    transferNumber: "TRF-2026-044",
    sourceWarehouseName: "Main Hub - New York",
    targetWarehouseName: "Branch Store - Brooklyn",
    status: "In-Transit",
    requestedBy: "Elena Rostova",
    items: [
      { sku: "IP15PM-OLED-BLK", name: "iPhone 15 Pro Max OLED Screen Assembly (OEM)", quantity: 10, sourceBinCode: "ZA-R01-S2-B01", targetBinCode: "BR-ZA-R01-S1-B01" },
      { sku: "SAM-S24U-BAT", name: "Galaxy S24 Ultra Battery Pack 5000mAh", quantity: 25, sourceBinCode: "ZB-R01-S1-B02", targetBinCode: "BR-ZA-R01-S1-B02" },
    ],
  },
];
