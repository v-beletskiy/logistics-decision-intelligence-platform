import type { DriverCertificationInput } from "./driver-certification.input";
import type { DriverDetailsInput } from "./driver-details.input";

export interface RegisterDriverInput extends DriverDetailsInput {
  readonly certifications?: readonly DriverCertificationInput[];
}
