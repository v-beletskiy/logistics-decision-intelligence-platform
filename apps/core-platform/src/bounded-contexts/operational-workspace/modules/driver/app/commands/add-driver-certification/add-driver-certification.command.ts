import type { DriverCertificationInput } from "../../models/driver-certification.input";

export class AddDriverCertificationCommand {
  constructor(
    readonly driverId: string,
    readonly details: DriverCertificationInput,
  ) {}
}
