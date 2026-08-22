/** Metrics of a route (baseline or recommended), in solver-neutral units. */
export interface RouteMetrics {
  readonly distanceKm: number;
  readonly durationSeconds: number;
}
