import type { DepotDetailsInput } from "../../models/depot-details.input.js";

export class CreateDepotCommand {
  constructor(
    readonly details: DepotDetailsInput,
    readonly vehicleCapacity: number,
    readonly driverCapacity: number,
  ) {}
}
