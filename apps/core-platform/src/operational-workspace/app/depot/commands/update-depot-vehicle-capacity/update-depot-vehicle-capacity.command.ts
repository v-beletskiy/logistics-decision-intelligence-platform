
export class UpdateDepotVehicleCapacityCommand {
  constructor(
    readonly depotId: string,
    readonly vehicleCapacity: number,
  ) {}
}
