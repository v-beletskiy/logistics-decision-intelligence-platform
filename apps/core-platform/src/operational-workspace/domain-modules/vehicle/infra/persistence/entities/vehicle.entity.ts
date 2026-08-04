import type { CompartmentEntity } from "./compartment.entity";

/** Persisted vehicle root row with its JSON-aggregated compartments. */
export interface VehicleEntity {
  readonly id: string;
  readonly registration_number: string;
  readonly name: string | null;
  readonly depot_id: string | null;
  readonly status: string;
  readonly compartments: readonly CompartmentEntity[];
}
