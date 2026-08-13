export class StartRouteStopCommand {
  constructor(
    readonly routeId: string,
    readonly sequence: number,
  ) {}
}
