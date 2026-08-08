/** Persisted shipment root row with its flat endpoint, weight and dimension columns. */
export interface ShipmentEntity {
  readonly id: string;
  readonly status: string;
  readonly pickup_completed: boolean;
  readonly delivery_completed: boolean;
  readonly pickup_country: string;
  readonly pickup_state_or_region: string | null;
  readonly pickup_city: string;
  readonly pickup_street: string;
  readonly pickup_building_number: string;
  readonly pickup_postal_code: string;
  readonly pickup_start_at: Date;
  readonly pickup_end_at: Date;
  readonly delivery_country: string;
  readonly delivery_state_or_region: string | null;
  readonly delivery_city: string;
  readonly delivery_street: string;
  readonly delivery_building_number: string;
  readonly delivery_postal_code: string;
  readonly delivery_start_at: Date;
  readonly delivery_end_at: Date;
  readonly weight_value: number;
  readonly weight_unit: string;
  readonly length: number;
  readonly width: number;
  readonly height: number;
  readonly dimension_unit: string;
}
