export class CreateAssignmentCommand {
  constructor(
    readonly routeId: string,
    readonly vehicleId: string,
    readonly driverId: string,
    readonly initiatedByUserId?: string,
  ) {}
}
