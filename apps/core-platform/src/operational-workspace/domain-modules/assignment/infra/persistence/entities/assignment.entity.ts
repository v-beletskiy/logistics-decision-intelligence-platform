import type { AssignmentShipmentEntity } from "./assignment-shipment.entity";

/** Persisted assignment root row with its JSON-aggregated shipments. */
export interface AssignmentEntity {
  readonly id: string;
  readonly route_id: string;
  readonly vehicle_id: string;
  readonly driver_id: string;
  readonly status: string;
  readonly assigned_at: Date;
  readonly started_at: Date | null;
  readonly completed_at: Date | null;
  readonly cancelled_at: Date | null;
  readonly shipments: readonly AssignmentShipmentEntity[];
}
