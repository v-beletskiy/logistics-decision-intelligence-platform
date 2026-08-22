import { DepotId } from "../../../depot/domain/depot-id";
import type {
  RegisterVehicleParams,
  VehicleDetails,
} from "../../domain/vehicle.aggregate";
import type { VehicleDetailsInput } from "../models/vehicle-details.input";
import type { RegisterVehicleInput } from "../models/register-vehicle.input";

export class VehicleInputMapper {
  static toDetails(input: VehicleDetailsInput): VehicleDetails {
    return {
      registrationNumber: input.registrationNumber,
      name: input.name,
      depotId:
        input.depotId === undefined ? undefined : DepotId.from(input.depotId),
    };
  }

  static toRegistrationDetails(
    input: RegisterVehicleInput,
  ): RegisterVehicleParams {
    return {
      ...this.toDetails(input),
      compartments: input.compartments,
    };
  }
}
