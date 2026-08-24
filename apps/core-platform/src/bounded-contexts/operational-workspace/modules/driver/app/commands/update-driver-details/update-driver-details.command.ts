import type { DriverDetailsInput } from "../../models/driver-details.input.js";

export class UpdateDriverDetailsCommand {
  constructor(
    readonly driverId: string,
    readonly details: DriverDetailsInput,
  ) {}
}
