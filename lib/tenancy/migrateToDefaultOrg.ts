import Organization from "@/lib/models/Organization";
import StoreSettings from "@/lib/models/StoreSettings";
import User from "@/lib/models/User";
import RolePermission from "@/lib/models/RolePermission";
import Product from "@/lib/models/Product";
import InventoryItem from "@/lib/models/InventoryItem";
import InventoryMovement from "@/lib/models/InventoryMovement";
import Customer from "@/lib/models/Customer";
import WholesaleCustomer from "@/lib/models/WholesaleCustomer";
import Supplier from "@/lib/models/Supplier";
import PurchaseOrder from "@/lib/models/PurchaseOrder";
import Invoice from "@/lib/models/Invoice";
import Receipt from "@/lib/models/Receipt";
import Payment from "@/lib/models/Payment";
import WarrantyClaim from "@/lib/models/WarrantyClaim";
import Warehouse from "@/lib/models/Warehouse";
import {
  WarehouseZone,
  WarehouseRack,
  WarehouseShelf,
  WarehouseBin,
} from "@/lib/models/WarehouseLocation";
import {
  WarehouseReceiving,
  WarehousePicking,
  WarehousePacking,
  WarehouseCycleCount,
  WarehouseTransfer,
} from "@/lib/models/WarehouseOperation";
import Brand from "@/lib/models/Brand";
import Category from "@/lib/models/Category";
import QualityGrade from "@/lib/models/QualityGrade";
import { seedOrgDefaults } from "@/lib/tenancy/bootstrapOrganization";
import { uniqueOrgSlug } from "@/lib/tenancy/slugify";
import type { Model } from "mongoose";

type TenantBackfillModel = {
  modelName: string;
  updateMany: Model<unknown>["updateMany"];
};

const TENANTED_MODELS: TenantBackfillModel[] = [
  User,
  RolePermission,
  StoreSettings,
  Product,
  InventoryItem,
  InventoryMovement,
  Customer,
  WholesaleCustomer,
  Supplier,
  PurchaseOrder,
  Invoice,
  Receipt,
  Payment,
  WarrantyClaim,
  Warehouse,
  WarehouseZone,
  WarehouseRack,
  WarehouseShelf,
  WarehouseBin,
  WarehouseReceiving,
  WarehousePicking,
  WarehousePacking,
  WarehouseCycleCount,
  WarehouseTransfer,
  Brand,
  Category,
  QualityGrade,
];

/**
 * Ensures a default organization exists and backfills organizationId on
 * any documents that predate multi-tenancy.
 */
export async function ensureDefaultOrganizationMigration(): Promise<{
  organizationId: string;
  backfilled: Record<string, number>;
}> {
  let org = await Organization.findOne({ slug: "shelfsense-default" });
  if (!org) {
    const settings = await StoreSettings.findOne({}).lean();
    const name =
      (settings as { businessName?: string } | null)?.businessName || "ShelfSense Default";
    org = await Organization.create({
      name,
      slug: "shelfsense-default",
      status: "Active",
    });
  }

  const organizationId = org._id;
  const backfilled: Record<string, number> = {};

  for (const Model of TENANTED_MODELS) {
    const result = await Model.updateMany(
      { organizationId: { $exists: false } },
      { $set: { organizationId } }
    );
    // Also catch null organizationId
    const nullResult = await Model.updateMany(
      { organizationId: null },
      { $set: { organizationId } }
    );
    const count = (result.modifiedCount || 0) + (nullResult.modifiedCount || 0);
    if (count > 0) {
      backfilled[Model.modelName] = count;
    }
  }

  await seedOrgDefaults(organizationId);

  // Align settings business name if orphan settings existed without org
  if ((await StoreSettings.countDocuments({ organizationId })) === 0) {
    await StoreSettings.create({
      organizationId,
      businessName: org.name,
      businessPhone: "",
      businessAddress: "",
      currencyDefault: "₦",
    });
  }

  return { organizationId: organizationId.toString(), backfilled };
}

export async function createDemoOrganizationIfNeeded() {
  const count = await Organization.countDocuments();
  if (count > 0) {
    return ensureDefaultOrganizationMigration();
  }

  const org = await Organization.create({
    name: "ShelfSense Demo",
    slug: uniqueOrgSlug("shelfsense-demo"),
    status: "Active",
  });
  await seedOrgDefaults(org._id);
  return { organizationId: org._id.toString(), backfilled: {} as Record<string, number> };
}
