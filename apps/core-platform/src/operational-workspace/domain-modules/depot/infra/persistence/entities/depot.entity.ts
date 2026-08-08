/** Persisted depot root row with its flat address columns. */
export interface DepotEntity {
  readonly id: string;
  readonly name: string;
  readonly country: string;
  readonly state_or_region: string | null;
  readonly city: string;
  readonly street: string;
  readonly building_number: string;
  readonly postal_code: string;
  readonly status: string;
  readonly vehicle_capacity: number;
  readonly driver_capacity: number;
  readonly vehicle_count: number;
  readonly driver_count: number;
}
