import { DepotId } from "../../../depot/domain/depot-id";
import type {
  DriverDetails,
  RegisterDriverParams,
} from "../../domain/driver.aggregate";
import type { DriverDetailsInput } from "../models/driver-details.input";
import type { RegisterDriverInput } from "../models/register-driver.input";

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
  ): RegisterDriverParams {
    return {
      ...this.toDetails(input),
      certifications: input.certifications,
    };
  }
}
