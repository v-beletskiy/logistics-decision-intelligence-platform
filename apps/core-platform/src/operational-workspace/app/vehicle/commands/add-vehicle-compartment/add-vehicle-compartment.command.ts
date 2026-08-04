import type { CompartmentProps } from '../../../../domain-modules/vehicle/domain/vehicle.aggregate';
import type { Identity } from '../../../../../shared/access-control/identity/identity';

export class AddVehicleCompartmentCommand {
  constructor(
    readonly vehicleId: string,
    readonly details: CompartmentProps,
    readonly identity: Identity,
  ) {}
}
