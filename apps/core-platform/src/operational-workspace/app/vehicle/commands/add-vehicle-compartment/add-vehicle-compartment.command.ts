import type { CompartmentProps } from '../../../../domain-modules/vehicle/domain/vehicle.aggregate';

export class AddVehicleCompartmentCommand {
  constructor(
    readonly vehicleId: string,
    readonly details: CompartmentProps,
  ) {}
}
