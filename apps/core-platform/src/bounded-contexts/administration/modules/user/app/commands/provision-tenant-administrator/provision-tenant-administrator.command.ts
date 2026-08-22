export class ProvisionTenantAdministratorCommand {
  constructor(
    readonly tenantId: string,
    readonly email: string,
    readonly password: string,
  ) {}
}
