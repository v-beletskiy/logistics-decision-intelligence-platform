import type { DepotDetails } from "../../../../domain-modules/depot/domain/depot.aggregate";

export class CreateDepotCommand {
  constructor(
    readonly details: DepotDetails,
    readonly vehicleCapacity: number,
    readonly driverCapacity: number,
  ) {}
}
