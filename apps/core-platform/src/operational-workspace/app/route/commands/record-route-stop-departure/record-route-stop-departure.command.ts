export class RecordRouteStopDepartureCommand {
  constructor(
    readonly routeId: string,
    readonly sequence: number,
    readonly departedAt: Date,
  ) {}
}
