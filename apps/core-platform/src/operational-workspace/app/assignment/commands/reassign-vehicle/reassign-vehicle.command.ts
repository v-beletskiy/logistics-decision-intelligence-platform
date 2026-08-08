import type { Identity } from "../../../../../shared/access-control/identity/identity";

export class ReassignVehicleCommand {
  constructor(
    readonly assignmentId: string,
    readonly vehicleId: string,
    readonly tenantId: string,
    readonly identity: Identity,
    readonly initiatedByUserId?: string,
  ) {}
}
