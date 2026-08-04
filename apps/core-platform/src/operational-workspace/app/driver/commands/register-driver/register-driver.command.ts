import type { DriverDetails } from "../../../../domain-modules/driver/domain/driver.aggregate";
import type { Identity } from "../../../../../shared/access-control/identity/identity";

export class RegisterDriverCommand {
  constructor(
    readonly details: DriverDetails,
    readonly identity: Identity,
  ) {}
}
