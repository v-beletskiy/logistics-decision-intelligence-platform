export interface CostMatrix {
  readonly labels: readonly string[];
  readonly distanceMatrix: readonly (readonly number[])[];
  readonly durationMatrix: readonly (readonly number[])[];
}
