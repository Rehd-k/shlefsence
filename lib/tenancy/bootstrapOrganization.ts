import mongoose from "mongoose";
import Organization from "@/lib/models/Organization";
import RolePermission from "@/lib/models/RolePermission";
import StoreSettings from "@/lib/models/StoreSettings";
import Warehouse from "@/lib/models/Warehouse";
import { DEFAULT_ROLE_PERMISSIONS } from "@/lib/tenancy/defaultPermissions";
import { uniqueOrgSlug } from "@/lib/tenancy/slugify";

export async function seedOrgDefaults(organizationId: mongoose.Types.ObjectId | string) {
  const orgId = new mongoose.Types.ObjectId(organizationId.toString());

  for (const [role, perms] of Object.entries(DEFAULT_ROLE_PERMISSIONS)) {
    await RolePermission.findOneAndUpdate(
      { organizationId: orgId, role },
      {
        organizationId: orgId,
        role,
        allowedPages: perms.allowedPages,
        allowAllLocations: perms.allowAllLocations,
      },
      { upsert: true, new: true }
    );
  }

  await StoreSettings.findOneAndUpdate(
    { organizationId: orgId },
    {
      organizationId: orgId,
      businessName: "My Business",
      businessPhone: "",
      businessAddress: "",
      currencyDefault: "₦",
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  const warehouseCount = await Warehouse.countDocuments({ organizationId: orgId });
  if (warehouseCount === 0) {
    await Warehouse.create({
      organizationId: orgId,
      code: "WH-01",
      name: "Main Hub",
      type: "Main Hub",
      address: "Primary location",
      manager: "Unassigned",
      skusCount: 0,
      capacity: "0% Full",
    });
  }
}

export async function createOrganizationWithDefaults(input: {
  name: string;
  businessPhone?: string;
  businessAddress?: string;
  currencyDefault?: string;
}) {
  const org = await Organization.create({
    name: input.name.trim(),
    slug: uniqueOrgSlug(input.name),
    status: "Active",
  });

  await seedOrgDefaults(org._id);

  if (input.businessPhone || input.businessAddress || input.currencyDefault) {
    await StoreSettings.findOneAndUpdate(
      { organizationId: org._id },
      {
        ...(input.businessPhone !== undefined ? { businessPhone: input.businessPhone } : {}),
        ...(input.businessAddress !== undefined ? { businessAddress: input.businessAddress } : {}),
        ...(input.currencyDefault !== undefined ? { currencyDefault: input.currencyDefault } : {}),
        businessName: input.name.trim(),
      }
    );
  } else {
    await StoreSettings.findOneAndUpdate(
      { organizationId: org._id },
      { businessName: input.name.trim() }
    );
  }

  return org;
}
