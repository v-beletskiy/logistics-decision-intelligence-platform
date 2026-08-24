import type { DriverCertificationInput } from "../../models/driver-certification.input.js";

export class UpdateDriverCertificationCommand {
  constructor(
    readonly driverId: string,
    readonly certificationId: string,
    readonly details: DriverCertificationInput,
  ) {}
}
