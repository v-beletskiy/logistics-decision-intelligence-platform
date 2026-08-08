CREATE TABLE
  IF NOT EXISTS operational_workspace.depots (
    id uuid PRIMARY KEY,
    name text NOT NULL,
    country text NOT NULL,
    state_or_region text,
    city text NOT NULL,
    street text NOT NULL,
    building_number text NOT NULL,
    postal_code text NOT NULL,
    status text NOT NULL CHECK (
      status IN ('ACTIVE', 'INACTIVE', 'CLOSED')
    ),
    vehicle_capacity integer NOT NULL CHECK (vehicle_capacity > 0),
    driver_capacity integer NOT NULL CHECK (driver_capacity > 0),
    vehicle_count integer NOT NULL DEFAULT 0 CHECK (vehicle_count >= 0),
    driver_count integer NOT NULL DEFAULT 0 CHECK (driver_count >= 0),
    created_at timestamptz NOT NULL DEFAULT now (),
    updated_at timestamptz NOT NULL DEFAULT now (),
    CONSTRAINT depots_vehicle_occupancy_within_capacity_check CHECK (
      vehicle_count <= vehicle_capacity
    ),
    CONSTRAINT depots_driver_occupancy_within_capacity_check CHECK (
      driver_count <= driver_capacity
    )
  );

CREATE INDEX IF NOT EXISTS depots_status_idx ON operational_workspace.depots (status);
