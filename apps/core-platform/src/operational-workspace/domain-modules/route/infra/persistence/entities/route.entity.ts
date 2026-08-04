import type { RouteStopEntity } from "./route-stop.entity";

/** Persisted route root row with its JSON-aggregated stops. */
export interface RouteEntity {
  readonly id: string;
  readonly status: string;
  readonly stops: readonly RouteStopEntity[];
}
