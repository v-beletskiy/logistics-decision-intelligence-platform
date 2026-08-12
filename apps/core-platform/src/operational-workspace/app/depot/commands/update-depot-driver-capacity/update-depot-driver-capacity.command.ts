
export class UpdateDepotDriverCapacityCommand {
  constructor(
    readonly depotId: string,
    readonly driverCapacity: number,
  ) {}
}
