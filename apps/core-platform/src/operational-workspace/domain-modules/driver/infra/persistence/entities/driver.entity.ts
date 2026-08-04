/** Persisted driver root row. */
export interface DriverEntity {
  readonly id: string;
  readonly first_name: string;
  readonly last_name: string;
  readonly license_number: string;
  readonly depot_id: string | null;
  readonly phone_number: string | null;
  readonly status: string;
}
