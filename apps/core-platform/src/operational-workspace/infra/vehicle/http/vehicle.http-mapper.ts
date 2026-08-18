import { CompartmentType } from "../../../domain-modules/vehicle/domain/compartment.entity";
import type {
  RegisterVehicleInput,
  VehicleCompartmentInput,
} from "../../../app/vehicle/vehicle.inputs";
import type {
  AddVehicleCompartmentRequest,
  RegisterVehicleRequest,
  UpdateVehicleCompartmentRequest,
} from "./vehicle.http-contracts";

export class VehicleHttpMapper {
  static toRegisterVehicleInput(request: RegisterVehicleRequest): RegisterVehicleInput {
    return {
      registrationNumber: request.registrationNumber,
      name: request.name,
      depotId: request.depotId,
      compartments: request.compartments.map((compartment) =>
        VehicleHttpMapper.toVehicleCompartmentInput(compartment),
      ),
    };
  }

  static toVehicleCompartmentInput(
    request: AddVehicleCompartmentRequest | UpdateVehicleCompartmentRequest,
  ): VehicleCompartmentInput {
    return {
      type: request.type as CompartmentType,
      name: request.name,
      capacity: request.capacity,
    };
  }

  static toCreatedVehicleResponse(id: string): { readonly id: string } {
    return { id };
  }
}