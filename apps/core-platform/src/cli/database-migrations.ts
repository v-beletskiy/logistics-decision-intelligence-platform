import { createAppConfig } from "../shared/infra/config/app-config";
import { PgDatabase } from "../shared/infra/persistence/pg-database";
import { PgMigrationRunner } from "../shared/infra/persistence/pg-migration-runner";

async function migrate(): Promise<void> {
  const database = new PgDatabase(createAppConfig());
  try {
    await new PgMigrationRunner(database).migrate();
  } finally {
    await database.onModuleDestroy();
  }
}

void migrate();
