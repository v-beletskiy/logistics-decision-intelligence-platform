import type { RouteStopPlanInput } from "../../models/route-stop-plan.input";

export class CreateRouteCommand {
  constructor(readonly stops: readonly RouteStopPlanInput[]) {}
}
