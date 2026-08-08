import type { Identity } from "../../../../../shared/access-control/identity/identity";

export class ReassignDriverCommand {
  constructor(
    readonly assignmentId: string,
    readonly driverId: string,
    readonly tenantId: string,
    readonly identity: Identity,
    readonly initiatedByUserId?: string,
  ) {}
}
