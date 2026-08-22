import { CompartmentType } from "../../domain/compartment.entity";
import type { RegisterVehicleInput } from "../../app/models/register-vehicle.input";
import type { VehicleCompartmentInput } from "../../app/models/vehicle-compartment.input";
import type {
  AddVehicleCompartmentRequest,
  RegisterVehicleRequest,
  UpdateVehicleCompartmentRequest,
} from "./vehicle.http-contracts";

export class VehicleHttpMapper {
  static toRegisterVehicleInput(
    request: RegisterVehicleRequest,
  ): RegisterVehicleInput {
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
