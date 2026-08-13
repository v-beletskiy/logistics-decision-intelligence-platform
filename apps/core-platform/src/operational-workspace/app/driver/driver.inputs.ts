import type { DriverCertificationProps } from "../../domain-modules/driver/domain/driver-certification.entity";
import type { DriverDetails } from "../../domain-modules/driver/domain/driver.aggregate";

export interface DriverCertificationInput extends Pick<
  DriverCertificationProps,
  "type" | "credentialNumber" | "validFrom" | "validUntil"
> {}

export interface DriverDetailsInput extends Pick<
  DriverDetails,
  "firstName" | "lastName" | "licenseNumber" | "phoneNumber"
> {
  readonly depotId?: string;
}

export interface RegisterDriverInput extends DriverDetailsInput {
  readonly certifications?: readonly DriverCertificationInput[];
}
