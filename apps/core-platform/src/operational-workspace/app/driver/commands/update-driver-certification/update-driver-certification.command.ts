import type { DriverCertificationInput } from "../../driver.inputs";

export class UpdateDriverCertificationCommand {
  constructor(
    readonly driverId: string,
    readonly certificationId: string,
    readonly details: DriverCertificationInput,
  ) {}
}
