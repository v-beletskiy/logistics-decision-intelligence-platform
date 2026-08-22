import type { DepotDetailsInput } from "../../models/depot-details.input";

export class CreateDepotCommand {
  constructor(
    readonly details: DepotDetailsInput,
    readonly vehicleCapacity: number,
    readonly driverCapacity: number,
  ) {}
}
