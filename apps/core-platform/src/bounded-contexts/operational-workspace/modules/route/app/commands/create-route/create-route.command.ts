import type { RouteStopPlanInput } from "../../models/route-stop-plan.input.js";

export class CreateRouteCommand {
  constructor(readonly stops: readonly RouteStopPlanInput[]) {}
}
