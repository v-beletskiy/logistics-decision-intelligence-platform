import { readdir, readFile } from "node:fs/promises";
import { resolve } from "node:path";

import { PgDatabase } from "./pg-database";

interface AppliedMigrationRow {
  readonly filename: string;
}

export class PgMigrationRunner {
  constructor(
    private readonly database: PgDatabase,
    private readonly migrationsDirectory = resolve(
      __dirname,
      "../../../../db/migrations",
    ),
  ) {}

  async migrate(): Promise<void> {
    await this.database.query(`
      CREATE TABLE IF NOT EXISTS public.schema_migrations (
        filename text PRIMARY KEY,
        applied_at timestamptz NOT NULL DEFAULT now()
      )
    `);

    const appliedMigrations = await this.database.query<AppliedMigrationRow>(
      "SELECT filename FROM public.schema_migrations",
    );
    const appliedFilenames = new Set(
      appliedMigrations.rows.map((migration) => migration.filename),
    );
    const filenames = (await readdir(this.migrationsDirectory))
      .filter((filename) => filename.endsWith(".sql"))
      .sort();

    for (const filename of filenames) {
      if (appliedFilenames.has(filename)) {
        continue;
      }

      const sql = await readFile(
        resolve(this.migrationsDirectory, filename),
        "utf8",
      );

      await this.database.runInTransaction(async () => {
        await this.database.query(sql);
        await this.database.query(
          "INSERT INTO public.schema_migrations (filename) VALUES ($1)",
          [filename],
        );
      });
    }
  }
}
