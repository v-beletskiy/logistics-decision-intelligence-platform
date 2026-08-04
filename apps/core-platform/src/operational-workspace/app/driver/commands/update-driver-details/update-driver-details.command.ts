import type { DriverDetails } from "../../../../domain-modules/driver/domain/driver.aggregate";
import type { Identity } from "../../../../../shared/access-control/identity/identity";

export class UpdateDriverDetailsCommand {
  constructor(
    readonly driverId: string,
    readonly details: DriverDetails,
    readonly identity: Identity,
  ) {}
}
