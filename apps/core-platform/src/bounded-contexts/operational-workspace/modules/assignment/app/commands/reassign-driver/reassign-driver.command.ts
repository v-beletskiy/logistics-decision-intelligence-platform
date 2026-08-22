export class ReassignDriverCommand {
  constructor(
    readonly assignmentId: string,
    readonly driverId: string,
    readonly initiatedByUserId?: string,
  ) {}
}
