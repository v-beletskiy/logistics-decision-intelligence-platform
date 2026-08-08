import type { DepotDetails } from "../../../../domain-modules/depot/domain/depot.aggregate";
import type { Identity } from "../../../../../shared/access-control/identity/identity";

export class CreateDepotCommand {
  constructor(
    readonly details: DepotDetails,
    readonly vehicleCapacity: number,
    readonly driverCapacity: number,
    readonly identity: Identity,
  ) {}
}
