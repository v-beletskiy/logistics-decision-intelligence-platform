/** Persisted route-stop row, mirroring the JSON-aggregated stops column. */
export interface RouteStopEntity {
  readonly id: string;
  readonly shipmentId: string;
  readonly operationType: string;
  readonly status: string;
  readonly arrivalTime: string;
  readonly departureTime: string;
}
