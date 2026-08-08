import type { Identity } from "../../../../../shared/access-control/identity/identity";

export class UpdateDepotDriverCapacityCommand {
  constructor(
    readonly depotId: string,
    readonly driverCapacity: number,
    readonly identity: Identity,
  ) {}
}
