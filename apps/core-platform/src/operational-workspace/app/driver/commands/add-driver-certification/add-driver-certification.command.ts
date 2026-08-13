import type { DriverCertificationInput } from "../../driver.inputs";

export class AddDriverCertificationCommand {
  constructor(
    readonly driverId: string,
    readonly details: DriverCertificationInput,
  ) {}
}
