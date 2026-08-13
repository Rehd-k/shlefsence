import { connectToDatabase } from "../lib/db/mongodb";
import { ensureDefaultOrganizationMigration } from "../lib/tenancy/migrateToDefaultOrg";

async function main() {
  await connectToDatabase();
  const result = await ensureDefaultOrganizationMigration();
  console.log(JSON.stringify(result, null, 2));
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
