import type { DriverDetailsInput } from "../../models/driver-details.input";

export class UpdateDriverDetailsCommand {
  constructor(
    readonly driverId: string,
    readonly details: DriverDetailsInput,
  ) {}
}
