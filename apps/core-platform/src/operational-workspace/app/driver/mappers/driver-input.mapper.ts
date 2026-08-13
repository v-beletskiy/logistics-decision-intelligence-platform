import { DepotId } from "../../../domain-modules/depot/domain/depot-id";
import type {
  DriverDetails,
  RegisterDriverDetails,
} from "../../../domain-modules/driver/domain/driver.aggregate";
import type {
  DriverDetailsInput,
  RegisterDriverInput,
} from "../driver.inputs";

export class DriverInputMapper {
  static toDetails(input: DriverDetailsInput): DriverDetails {
    return {
      firstName: input.firstName,
      lastName: input.lastName,
      licenseNumber: input.licenseNumber,
      depotId:
        input.depotId === undefined ? undefined : DepotId.from(input.depotId),
      phoneNumber: input.phoneNumber,
    };
  }

  static toRegistrationDetails(
    input: RegisterDriverInput,
  ): RegisterDriverDetails {
    return {
      ...this.toDetails(input),
      certifications: input.certifications,
    };
  }
}
