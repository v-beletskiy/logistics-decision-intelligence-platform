
export class RemoveVehicleCompartmentCommand {
  constructor(
    readonly vehicleId: string,
    readonly compartmentId: string,
  ) {}
}
