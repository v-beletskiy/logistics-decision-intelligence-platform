import type { RegisterDriverDetails } from "../../../../domain-modules/driver/domain/driver.aggregate";

export class RegisterDriverCommand {
  constructor(readonly details: RegisterDriverDetails) {}
}
