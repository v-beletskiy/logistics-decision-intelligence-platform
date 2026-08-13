import { DepotId } from "../../../domain-modules/depot/domain/depot-id";
import type {
  RegisterVehicleDetails,
  VehicleDetails,
} from "../../../domain-modules/vehicle/domain/vehicle.aggregate";
import type {
  RegisterVehicleInput,
  VehicleDetailsInput,
} from "../vehicle.inputs";

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
  ): RegisterVehicleDetails {
    return {
      ...this.toDetails(input),
      compartments: input.compartments,
    };
  }
}
