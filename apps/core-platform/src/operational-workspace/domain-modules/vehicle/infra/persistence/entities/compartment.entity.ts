/** Persisted compartment row, mirroring the JSON-aggregated compartments column. */
export interface CompartmentEntity {
  readonly id: string;
  readonly type: string;
  readonly name: string | null;
  readonly max_weight: number;
  readonly max_weight_unit: string;
  readonly max_length: number;
  readonly max_width: number;
  readonly max_height: number;
  readonly dimension_unit: string;
  readonly max_volume: number;
  readonly max_volume_unit: string;
}
