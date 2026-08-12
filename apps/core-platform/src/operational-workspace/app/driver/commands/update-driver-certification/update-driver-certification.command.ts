import type { DriverCertificationProps } from "../../../../domain-modules/driver/domain/driver-certification.entity";

export class UpdateDriverCertificationCommand {
  constructor(
    readonly driverId: string,
    readonly certificationId: string,
    readonly details: DriverCertificationProps,
  ) {}
}
