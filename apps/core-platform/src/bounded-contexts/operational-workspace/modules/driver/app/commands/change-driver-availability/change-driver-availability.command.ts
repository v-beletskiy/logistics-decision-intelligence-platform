export class ChangeDriverAvailabilityCommand {
  constructor(
    readonly driverId: string,
    readonly available: boolean,
  ) {}
}
