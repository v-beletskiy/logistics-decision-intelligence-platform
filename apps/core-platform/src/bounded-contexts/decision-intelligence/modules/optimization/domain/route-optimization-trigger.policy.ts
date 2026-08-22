import {
  OptimizationTriggerPolicy,
  type OptimizationTriggerInput,
} from "./optimization-trigger.policy";

/** Re-optimizes when no prior input exists (creation) or the input version advanced. */
export class RouteOptimizationTriggerPolicy extends OptimizationTriggerPolicy {
  shouldReoptimize(input: OptimizationTriggerInput): boolean {
    if (input.previousInputVersion === undefined) {
      return true;
    }
    if (input.currentInputVersion === undefined) {
      return true;
    }
    return input.currentInputVersion !== input.previousInputVersion;
  }
}
