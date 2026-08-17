import { NestFactory } from "@nestjs/core";
import { env } from "node:process";

import { ProvisionTenantAdministratorCommand } from "../administration/app/user/commands/provision-tenant-administrator/provision-tenant-administrator.command";
import { ProvisionTenantAdministratorHandler } from "../administration/app/user/commands/provision-tenant-administrator/provision-tenant-administrator.handler";
import { AdministrationCliModule } from "./administration-cli.module";

async function provision(): Promise<void> {
  const tenantId = requiredArgument("--tenant-id");
  const email = requiredArgument("--email");
  const password = env.INITIAL_ADMIN_PASSWORD;
  if (password === undefined) {
    throw new Error("INITIAL_ADMIN_PASSWORD must be defined.");
  }

  const app = await NestFactory.createApplicationContext(
    AdministrationCliModule,
  );
  try {
    const id = await app.get(ProvisionTenantAdministratorHandler).exec(
      new ProvisionTenantAdministratorCommand(tenantId, email, password),
    );
    process.stdout.write(`Provisioned tenant administrator ${id}.\n`);
  } finally {
    await app.close();
  }
}

function requiredArgument(name: string): string {
  const index = process.argv.indexOf(name);
  const value = index === -1 ? undefined : process.argv[index + 1];
  if (value === undefined || value.startsWith("--")) {
    throw new Error(`${name} must be specified.`);
  }
  return value;
}

void provision();
