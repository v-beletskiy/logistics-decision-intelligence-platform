import type { DriverDetails } from "../../../../domain-modules/driver/domain/driver.aggregate";

export class UpdateDriverDetailsCommand {
  constructor(
    readonly driverId: string,
    readonly details: DriverDetails,
  ) {}
}
