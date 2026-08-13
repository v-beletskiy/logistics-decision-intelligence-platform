import type { DepotDetailsInput } from "../../depot.inputs";

export class CreateDepotCommand {
  constructor(
    readonly details: DepotDetailsInput,
    readonly vehicleCapacity: number,
    readonly driverCapacity: number,
  ) {}
}
