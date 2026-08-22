export class ChangeVehicleAvailabilityCommand {
  constructor(
    readonly vehicleId: string,
    readonly available: boolean,
  ) {}
}
