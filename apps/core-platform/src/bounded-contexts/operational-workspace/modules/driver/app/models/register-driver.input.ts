import type { DriverCertificationInput } from "./driver-certification.input.js";
import type { DriverDetailsInput } from "./driver-details.input.js";

export interface RegisterDriverInput extends DriverDetailsInput {
  readonly certifications?: readonly DriverCertificationInput[];
}
