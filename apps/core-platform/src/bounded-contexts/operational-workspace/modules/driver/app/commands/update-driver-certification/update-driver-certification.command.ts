import type { DriverCertificationInput } from "../../models/driver-certification.input";

export class UpdateDriverCertificationCommand {
  constructor(
    readonly driverId: string,
    readonly certificationId: string,
    readonly details: DriverCertificationInput,
  ) {}
}
