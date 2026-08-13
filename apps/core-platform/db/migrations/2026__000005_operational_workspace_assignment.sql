CREATE TABLE
  IF NOT EXISTS operational_workspace.assignments (
    id uuid PRIMARY KEY,
    tenant_id uuid NOT NULL,
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
    updated_at timestamptz NOT NULL DEFAULT now (),
    CONSTRAINT assignments_tenant_id_unique UNIQUE (tenant_id, id),
    CONSTRAINT assignments_route_fk FOREIGN KEY (tenant_id, route_id) REFERENCES operational_workspace.routes (tenant_id, id) ON DELETE RESTRICT,
    CONSTRAINT assignments_vehicle_fk FOREIGN KEY (tenant_id, vehicle_id) REFERENCES operational_workspace.vehicles (tenant_id, id) ON DELETE RESTRICT,
    CONSTRAINT assignments_driver_fk FOREIGN KEY (tenant_id, driver_id) REFERENCES operational_workspace.drivers (tenant_id, id) ON DELETE RESTRICT
  );

CREATE INDEX IF NOT EXISTS assignments_tenant_status_idx ON operational_workspace.assignments (tenant_id, status);

CREATE INDEX IF NOT EXISTS assignments_tenant_route_idx ON operational_workspace.assignments (tenant_id, route_id);

CREATE INDEX IF NOT EXISTS assignments_tenant_vehicle_idx ON operational_workspace.assignments (tenant_id, vehicle_id);

CREATE INDEX IF NOT EXISTS assignments_tenant_driver_idx ON operational_workspace.assignments (tenant_id, driver_id);

CREATE UNIQUE INDEX IF NOT EXISTS assignments_tenant_active_vehicle_unique ON operational_workspace.assignments (tenant_id, vehicle_id)
WHERE
  status IN ('CREATED', 'IN_PROGRESS');

CREATE UNIQUE INDEX IF NOT EXISTS assignments_tenant_active_driver_unique ON operational_workspace.assignments (tenant_id, driver_id)
WHERE
  status IN ('CREATED', 'IN_PROGRESS');

CREATE UNIQUE INDEX IF NOT EXISTS assignments_tenant_active_route_unique ON operational_workspace.assignments (tenant_id, route_id)
WHERE
  status IN ('CREATED', 'IN_PROGRESS');
