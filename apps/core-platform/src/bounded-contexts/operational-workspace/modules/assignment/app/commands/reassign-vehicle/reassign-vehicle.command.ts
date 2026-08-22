export class ReassignVehicleCommand {
  constructor(
    readonly assignmentId: string,
    readonly vehicleId: string,
    readonly initiatedByUserId?: string,
  ) {}
}
