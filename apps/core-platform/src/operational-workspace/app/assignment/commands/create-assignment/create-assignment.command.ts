import type { Identity } from "../../../../../shared/access-control/identity/identity";

export class CreateAssignmentCommand {
  constructor(
    readonly routeId: string,
    readonly vehicleId: string,
    readonly driverId: string,
    readonly tenantId: string,
    readonly identity: Identity,
    readonly initiatedByUserId?: string,
  ) {}
}
