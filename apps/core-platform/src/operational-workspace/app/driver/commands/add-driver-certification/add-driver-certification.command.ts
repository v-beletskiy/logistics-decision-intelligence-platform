import type { DriverCertificationProps } from "../../../../domain-modules/driver/domain/driver-certification.entity";

export class AddDriverCertificationCommand {
  constructor(
    readonly driverId: string,
    readonly details: DriverCertificationProps,
  ) {}
}
