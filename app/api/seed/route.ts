import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/mongodb";
import { assertSeedAuthorized } from "@/lib/auth/seedGuard";
import bcrypt from "bcrypt";
import InventoryItem from "@/lib/models/InventoryItem";
import InventoryMovement from "@/lib/models/InventoryMovement";
import Product from "@/lib/models/Product";
import Invoice from "@/lib/models/Invoice";
import Payment from "@/lib/models/Payment";
import Receipt from "@/lib/models/Receipt";
import WholesaleCustomer from "@/lib/models/WholesaleCustomer";
import PurchaseOrder from "@/lib/models/PurchaseOrder";
import Supplier from "@/lib/models/Supplier";
import Warehouse from "@/lib/models/Warehouse";
import { WarehouseZone, WarehouseRack, WarehouseShelf, WarehouseBin } from "@/lib/models/WarehouseLocation";
import {
  WarehouseReceiving,
  WarehousePicking,
  WarehousePacking,
  WarehouseCycleCount,
  WarehouseTransfer,
} from "@/lib/models/WarehouseOperation";
import WarrantyClaim from "@/lib/models/WarrantyClaim";
import Customer from "@/lib/models/Customer";
import RolePermission from "@/lib/models/RolePermission";
import User from "@/lib/models/User";
import StoreSettings from "@/lib/models/StoreSettings";
import Brand from "@/lib/models/Brand";
import QualityGrade from "@/lib/models/QualityGrade";

import { INITIAL_INVENTORY_ITEMS, INITIAL_MOVEMENTS } from "@/lib/seed/inventorySeedData";
import { INITIAL_PRODUCTS } from "@/lib/seed/productSeedData";
import {
  SEED_INVOICES,
  SEED_PAYMENTS,
  SEED_RECEIPTS,
  SEED_WHOLESALE_CUSTOMERS,
} from "@/lib/seed/salesSeedData";
import { INITIAL_SUPPLIERS_SEED } from "@/lib/seed/supplierSeedData";
import { INITIAL_CRM_CUSTOMERS } from "@/lib/seed/crmSeedData";
import {
  INITIAL_WAREHOUSE_FACILITIES,
  INITIAL_ZONES_CONFIG,
  SAMPLE_SKUS,
  INITIAL_RECEIVING_ORDERS,
  INITIAL_PICKING_TICKETS,
  INITIAL_PACKING_ORDERS,
  INITIAL_CYCLE_COUNTS,
  INITIAL_TRANSFERS,
} from "@/lib/seed/warehouseSeedData";

const INITIAL_PURCHASE_ORDERS = [
  { id: "PO-8810", poNumber: "PO-2026-8810", supplier: "Foxconn Electronics Shenzhen", warehouse: "Main Hub - Lagos", totalUnits: 150, totalValue: 18750000.0, status: "Awaiting Arrival", expectedDate: "2026-08-02" },
  { id: "PO-8809", poNumber: "PO-2026-8809", supplier: "Sunsky Technology Wholesale", warehouse: "Ikeja Shop Counter", totalUnits: 300, totalValue: 8400000.0, status: "In Transit", expectedDate: "2026-08-01" },
  { id: "PO-8808", poNumber: "PO-2026-8808", supplier: "DJI & Parts Global Corp", warehouse: "Abuja Central Hub", totalUnits: 80, totalValue: 12500000.0, status: "Received & Putaway", expectedDate: "2026-07-28" },
];

const INITIAL_WARRANTY_CLAIMS = [
  { claimId: "RMA-401", customer: "Apex Mobile Repairs Inc", part: "iPhone 15 Pro Max OLED Assembly", issue: "Touch digitizer unresponsive on bottom right", status: "Pending Inspection", date: "2026-07-29" },
  { claimId: "RMA-400", customer: "iFixFast Depot Brooklyn", part: "Galaxy S24 Ultra Battery Pack", issue: "Fails high-rate thermal cycle test", status: "Approved & Refunded", date: "2026-07-28" },
  { claimId: "RMA-399", customer: "QuickFix Cellular Queens", part: "Pixel 8 Pro Charging Port Flex", issue: "Physical pin bending post install", status: "Rejected (Physical Damage)", date: "2026-07-26" },
];

export async function POST(req: Request) {
  const denied = assertSeedAuthorized(req);
  if (denied) return denied;

  try {
    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const force = searchParams.get("force") === "true";

    let stats: Record<string, number> = {};

    // 1. Inventory Items
    if (force || (await InventoryItem.countDocuments()) === 0) {
      await InventoryItem.deleteMany({});
      const items = await InventoryItem.insertMany(INITIAL_INVENTORY_ITEMS);
      stats.inventoryItems = items.length;

      const skuToIdMap: Record<string, any> = {};
      items.forEach((it) => {
        skuToIdMap[it.sku] = it._id;
      });

      // 2. Inventory Movements
      await InventoryMovement.deleteMany({});
      const allMovements = Object.values(INITIAL_MOVEMENTS).flat();
      const mappedMovements = allMovements.map((mov) => ({
        ...mov,
        inventoryItemId: skuToIdMap[mov.sku] || items[0]._id,
      }));

      const movements = await InventoryMovement.insertMany(mappedMovements);
      stats.inventoryMovements = movements.length;
    }

    // 3. Products
    if (force || (await Product.countDocuments()) === 0) {
      await Product.deleteMany({});
      const products = await Product.insertMany(
        INITIAL_PRODUCTS.map((p) => {
          const { id, ...rest } = p;
          return rest;
        })
      );
      stats.products = products.length;
    }

    // 4. Invoices
    if (force || (await Invoice.countDocuments()) === 0) {
      await Invoice.deleteMany({});
      const invoices = await Invoice.insertMany(
        SEED_INVOICES.map((inv) => {
          const { id, ...rest } = inv;
          return rest;
        })
      );
      stats.invoices = invoices.length;
    }

    // 5. Payments
    if (force || (await Payment.countDocuments()) === 0) {
      await Payment.deleteMany({});
      const payments = await Payment.insertMany(
        SEED_PAYMENTS.map((pmt) => {
          const { id, ...rest } = pmt;
          return rest;
        })
      );
      stats.payments = payments.length;
    }

    // 6. Receipts
    if (force || (await Receipt.countDocuments()) === 0) {
      await Receipt.deleteMany({});
      const receipts = await Receipt.insertMany(
        SEED_RECEIPTS.map((rcp) => {
          const { id, ...rest } = rcp;
          return rest;
        })
      );
      stats.receipts = receipts.length;
    }

    // 7. Wholesale Customers
    if (force || (await WholesaleCustomer.countDocuments()) === 0) {
      await WholesaleCustomer.deleteMany({});
      const customers = await WholesaleCustomer.insertMany(
        SEED_WHOLESALE_CUSTOMERS.map((cust) => {
          const { id, ...rest } = cust;
          return rest;
        })
      );
      stats.wholesaleCustomers = customers.length;
    }

    // 8. Purchase Orders
    if (force || (await PurchaseOrder.countDocuments()) === 0) {
      await PurchaseOrder.deleteMany({});
      const pos = await PurchaseOrder.insertMany(
        INITIAL_PURCHASE_ORDERS.map((po) => {
          const { id, ...rest } = po;
          return rest;
        })
      );
      stats.purchaseOrders = pos.length;
    }

    // 9. Suppliers
    if (force || (await Supplier.countDocuments()) === 0) {
      await Supplier.deleteMany({});
      const suppliers = await Supplier.insertMany(INITIAL_SUPPLIERS_SEED);
      stats.suppliers = suppliers.length;
    }

    // 10. Warehouses & Full Hierarchy (Zones, Racks, Shelves, Bins)
    if (force || (await Warehouse.countDocuments()) === 0 || (await WarehouseBin.countDocuments()) === 0) {
      await Warehouse.deleteMany({});
      await WarehouseZone.deleteMany({});
      await WarehouseRack.deleteMany({});
      await WarehouseShelf.deleteMany({});
      await WarehouseBin.deleteMany({});

      const insertedWarehouses: any[] = await Warehouse.insertMany(INITIAL_WAREHOUSE_FACILITIES);
      stats.warehouses = insertedWarehouses.length;

      let createdZonesCount = 0;
      let createdRacksCount = 0;
      let createdShelvesCount = 0;
      let createdBinsCount = 0;

      const primaryWh = insertedWarehouses[0];
      if (primaryWh) {
        for (const zConfig of INITIAL_ZONES_CONFIG) {
          const zoneDoc = await WarehouseZone.create({
            warehouseId: primaryWh._id,
            code: zConfig.code,
            name: zConfig.name,
            type: zConfig.type as any,
            color: zConfig.color,
            x: zConfig.x,
            y: zConfig.y,
            width: zConfig.width,
            height: zConfig.height,
          });
          createdZonesCount++;

          // Create 2 Racks per zone
          for (let r = 1; r <= 2; r++) {
            const rackCode = `${zConfig.code}-R0${r}`;
            const rackDoc = await WarehouseRack.create({
              zoneId: zoneDoc._id,
              warehouseId: primaryWh._id,
              code: rackCode,
              name: `Rack ${r}`,
              shelvesCount: 3,
            });
            createdRacksCount++;

            // Create 3 Shelves per rack
            for (let s = 1; s <= 3; s++) {
              const shelfCode = `${rackCode}-S${s}`;
              const shelfDoc = await WarehouseShelf.create({
                rackId: rackDoc._id,
                zoneId: zoneDoc._id,
                warehouseId: primaryWh._id,
                code: shelfCode,
                name: `Shelf ${s}`,
                binsCount: 4,
              });
              createdShelvesCount++;

              // Create 4 Bins per shelf
              for (let b = 1; b <= 4; b++) {
                const binCode = `${shelfCode}-B0${b}`;
                const randomSku = SAMPLE_SKUS[(createdBinsCount + b) % SAMPLE_SKUS.length];
                const currentCount = (createdBinsCount * 7 + b * 13) % 150;
                const status = currentCount > 130 ? "Full" : "Available";

                await WarehouseBin.create({
                  shelfId: shelfDoc._id,
                  rackId: rackDoc._id,
                  zoneId: zoneDoc._id,
                  warehouseId: primaryWh._id,
                  binCode,
                  maxCapacity: 150,
                  currentCount,
                  pickVelocity: randomSku.pickVelocity as any,
                  status,
                  x: (b - 1) % 4,
                  y: Math.floor((b - 1) / 4),
                  items: currentCount > 0 ? [{ sku: randomSku.sku, name: randomSku.name, quantity: currentCount }] : [],
                });
                createdBinsCount++;
              }
            }
          }
        }
      }

      stats.warehouseZones = createdZonesCount;
      stats.warehouseRacks = createdRacksCount;
      stats.warehouseShelves = createdShelvesCount;
      stats.warehouseBins = createdBinsCount;
    }

    // 11. Warehouse Operations (Receiving, Picking, Packing, Cycle Count, Transfers)
    if (force || (await WarehouseReceiving.countDocuments()) === 0) {
      await WarehouseReceiving.deleteMany({});
      await WarehousePicking.deleteMany({});
      await WarehousePacking.deleteMany({});
      await WarehouseCycleCount.deleteMany({});
      await WarehouseTransfer.deleteMany({});

      const primaryWh: any = (await Warehouse.findOne({ code: "WH-NY01" })) || (await Warehouse.findOne({}));
      const secondaryWh: any = (await Warehouse.findOne({ code: "BR-BK101" })) || primaryWh;

      if (primaryWh) {
        const mappedReceiving = INITIAL_RECEIVING_ORDERS.map((rec) => ({ ...rec, warehouseId: primaryWh._id }));
        await WarehouseReceiving.insertMany(mappedReceiving);

        const mappedPicking = INITIAL_PICKING_TICKETS.map((pick) => ({ ...pick, warehouseId: primaryWh._id }));
        await WarehousePicking.insertMany(mappedPicking);

        const mappedPacking = INITIAL_PACKING_ORDERS.map((pack) => ({ ...pack, warehouseId: primaryWh._id }));
        await WarehousePacking.insertMany(mappedPacking as any);

        const mappedCycleCounts = INITIAL_CYCLE_COUNTS.map((cc) => ({ ...cc, warehouseId: primaryWh._id }));
        await WarehouseCycleCount.insertMany(mappedCycleCounts as any);

        const mappedTransfers = INITIAL_TRANSFERS.map((trf) => ({
          ...trf,
          sourceWarehouseId: primaryWh._id,
          targetWarehouseId: secondaryWh ? secondaryWh._id : primaryWh._id,
        }));
        await WarehouseTransfer.insertMany(mappedTransfers);
      }

      stats.warehouseOperations = 5;
    }

    // 12. Warranty Claims
    if (force || (await WarrantyClaim.countDocuments()) === 0) {
      await WarrantyClaim.deleteMany({});
      const claims = await WarrantyClaim.insertMany(INITIAL_WARRANTY_CLAIMS);
      stats.warrantyClaims = claims.length;
    }

    // 13. CRM Customers
    if (force || (await Customer.countDocuments()) === 0) {
      await Customer.deleteMany({});
      const crmCustomers = await Customer.insertMany(
        INITIAL_CRM_CUSTOMERS.map((cust) => {
          const { id, ...rest } = cust;
          return rest;
        })
      );
      stats.crmCustomers = crmCustomers.length;
    }

    // 14. Role Permissions
    if (force || (await RolePermission.countDocuments()) === 0) {
      await RolePermission.deleteMany({});
      const defaultPermissions = [
        {
          role: "Admin",
          allowedPages: ["dashboard", "crm", "products", "inventory", "sales", "purchase-orders", "suppliers", "warehouses", "warranty", "settings"],
          allowAllLocations: true,
        },
        {
          role: "Manager",
          allowedPages: ["dashboard", "crm", "products", "inventory", "sales", "purchase-orders", "suppliers", "warehouses", "warranty"],
          allowAllLocations: true,
        },
        {
          role: "Supervisor",
          allowedPages: ["dashboard", "products", "inventory", "sales", "purchase-orders", "warehouses", "warranty"],
          allowAllLocations: false,
        },
        {
          role: "Sales",
          allowedPages: ["sales"],
          allowAllLocations: false,
        },
      ];
      await RolePermission.insertMany(defaultPermissions);
      stats.rolePermissions = defaultPermissions.length;
    }

    // 15. Default Users
    if (force || (await User.countDocuments()) === 0) {
      const defaultUsers = [
        {
          name: "System Admin",
          email: "admin@shelfsense.ng",
          password: "Password123!",
          role: "Admin" as const,
          assignedLocation: "All Locations",
          status: "Active" as const,
        },
        {
          name: "Operations Manager",
          email: "manager@shelfsense.ng",
          password: "Password123!",
          role: "Manager" as const,
          assignedLocation: "Main Hub - Lagos",
          status: "Active" as const,
        },
        {
          name: "Lagos Supervisor",
          email: "supervisor@shelfsense.ng",
          password: "Password123!",
          role: "Supervisor" as const,
          assignedLocation: "Main Hub - Lagos",
          status: "Active" as const,
        },
        {
          name: "Ikeja POS Staff",
          email: "sales@shelfsense.ng",
          password: "Password123!",
          role: "Sales" as const,
          assignedLocation: "Ikeja Shop Counter",
          status: "Active" as const,
        },
      ];
      await User.deleteMany({});
      for (const u of defaultUsers) {
        const hashedPassword = await bcrypt.hash(u.password, 10);
        await User.create({ ...u, password: hashedPassword });
      }
      stats.users = defaultUsers.length;
    }

    // 16. Default Store Settings
    if (force || (await StoreSettings.countDocuments()) === 0) {
      await StoreSettings.deleteMany({});
      await StoreSettings.create({
        businessName: "ShelfSense Lagos",
        businessPhone: "+234 (1) 555-0192",
        businessAddress: "14 Logistics Way, Ikeja, Lagos",
        currencyDefault: "₦",
      });
      stats.storeSettings = 1;
    }

    // 17. Default Brands
    if (force || (await Brand.countDocuments()) === 0) {
      await Brand.deleteMany({});
      const defaultBrands = [
        { name: "Apple" },
        { name: "Samsung" },
        { name: "Google" },
        { name: "Xiaomi" },
        { name: "Infinix" },
        { name: "Tecno" },
      ];
      await Brand.insertMany(defaultBrands);
      stats.brands = defaultBrands.length;
    }

    // 18. Default Quality Grades
    if (force || (await QualityGrade.countDocuments()) === 0) {
      await QualityGrade.deleteMany({});
      const defaultGrades = [
        { name: "OEM_ORIGINAL", label: "OEM Original" },
        { name: "SERVICE_PACK", label: "Service Pack" },
        { name: "REFURBISHED_A", label: "Refurbished Grade A" },
        { name: "PREMIUM_AFTERMARKET", label: "Premium Aftermarket" },
      ];
      await QualityGrade.insertMany(defaultGrades);
      stats.qualityGrades = defaultGrades.length;
    }

    return NextResponse.json({
      success: true,
      message: "Database successfully seeded across all ShelfSense modules.",
      stats,
    });
  } catch (error: any) {
    console.error("Database seed error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json(
    {
      success: false,
      error: "GET seeding is disabled. Use POST with Authorization: Bearer <SEED_SECRET>.",
    },
    { status: 405 }
  );
}
