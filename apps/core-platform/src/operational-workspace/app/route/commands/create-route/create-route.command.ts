import type { RouteStopInput } from "../../route.inputs";

export class CreateRouteCommand {
  constructor(readonly stops: readonly RouteStopInput[]) {}
}
