export class RecordRouteStopArrivalCommand {
  constructor(
    readonly routeId: string,
    readonly sequence: number,
    readonly arrivedAt: Date,
  ) {}
}
