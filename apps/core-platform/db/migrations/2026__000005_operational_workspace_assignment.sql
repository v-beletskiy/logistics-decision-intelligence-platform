CREATE TABLE
  IF NOT EXISTS operational_workspace.assignments (
    id uuid PRIMARY KEY,
    route_id uuid NOT NULL,
    vehicle_id uuid NOT NULL,
    driver_id uuid NOT NULL,
    status text NOT NULL CHECK (
      status IN (
        'CREATED',
        'IN_PROGRESS',
        'COMPLETED',
        'CANCELLED'
      )
    ),
    assigned_at timestamptz NOT NULL,
    started_at timestamptz,
    completed_at timestamptz,
    cancelled_at timestamptz,
    created_at timestamptz NOT NULL DEFAULT now (),
    updated_at timestamptz NOT NULL DEFAULT now ()
  );

CREATE INDEX IF NOT EXISTS assignments_shipment_id_idx ON operational_workspace.assignments (shipment_id);

CREATE INDEX IF NOT EXISTS assignments_status_idx ON operational_workspace.assignments (status);

CREATE UNIQUE INDEX IF NOT EXISTS assignments_active_vehicle_unique ON operational_workspace.assignments (vehicle_id)
WHERE
  status IN ('CREATED', 'IN_PROGRESS');

CREATE UNIQUE INDEX IF NOT EXISTS assignments_active_driver_unique ON operational_workspace.assignments (driver_id)
WHERE
  status IN ('CREATED', 'IN_PROGRESS');

CREATE UNIQUE INDEX IF NOT EXISTS assignments_active_route_unique ON operational_workspace.assignments (route_id)
WHERE
  status IN ('CREATED', 'IN_PROGRESS');