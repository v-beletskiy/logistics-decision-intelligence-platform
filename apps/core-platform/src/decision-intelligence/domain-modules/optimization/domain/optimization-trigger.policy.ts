/**
 * Decides whether a Route change requires a new Optimization.
 */
export abstract class OptimizationTriggerPolicy {
  abstract shouldReoptimize(input: OptimizationTriggerInput): boolean;
}

export interface OptimizationTriggerInput {
  readonly currentInputVersion?: number;
  readonly previousInputVersion?: number;
}
